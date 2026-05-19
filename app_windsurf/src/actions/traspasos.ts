"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getTraspasos(filters?: {
  idTiendaOrigen?: number;
  idTiendaDestino?: number;
  fechaDesde?: string;
  fechaHasta?: string;
}) {
  const where: Record<string, unknown> = { tipo: "TRASPASO" };
  if (filters?.idTiendaOrigen) where.idTiendaOrigen = filters.idTiendaOrigen;
  if (filters?.idTiendaDestino) where.idTiendaDestino = filters.idTiendaDestino;
  if (filters?.fechaDesde || filters?.fechaHasta) {
    where.fecha = {
      ...(filters.fechaDesde ? { gte: new Date(filters.fechaDesde) } : {}),
      ...(filters.fechaHasta ? { lte: new Date(filters.fechaHasta + "T23:59:59") } : {}),
    };
  }

  const rows = await prisma.operacionCabecera.findMany({
    where,
    include: {
      tienda: true,
      tiendaOrigen: true,
      tiendaDestino: true,
      usuario: true,
    },
    orderBy: { fecha: "desc" },
  });
  return rows.map((r) => ({
    ...r,
    fecha: r.fecha.toISOString(),
    fechaCreacion: r.fechaCreacion.toISOString(),
    totalOperacion: r.totalOperacion ? Number(r.totalOperacion) : null,
  }));
}

export async function getTraspaso(id: number) {
  const row = await prisma.operacionCabecera.findUnique({
    where: { id },
    include: {
      tienda: true,
      tiendaOrigen: true,
      tiendaDestino: true,
      usuario: true,
      lineas: { include: { producto: { include: { atributos: true } } } },
    },
  });
  if (!row) return null;
  return {
    ...row,
    fecha: row.fecha.toISOString(),
    fechaCreacion: row.fechaCreacion.toISOString(),
    totalOperacion: row.totalOperacion ? Number(row.totalOperacion) : null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    lineas: (row as any).lineas.map((l: any) => ({
      ...l,
      precioMomento: Number(l.precioMomento),
      subtotal: Number(l.subtotal),
      producto: l.producto
        ? { ...l.producto, precioVenta: Number(l.producto.precioVenta), precioCoste: Number(l.producto.precioCoste) }
        : null,
    })),
  };
}

export async function createTraspaso(data: {
  idTiendaOrigen: number;
  idTiendaDestino: number;
  idUsuario: number;
  observaciones?: string | null;
}) {
  if (data.idTiendaOrigen === data.idTiendaDestino) {
    throw new Error("La tienda origen y destino no pueden ser la misma");
  }
  const traspaso = await prisma.operacionCabecera.create({
    data: {
      tipo: "TRASPASO",
      idTienda: data.idTiendaOrigen,
      idTiendaOrigen: data.idTiendaOrigen,
      idTiendaDestino: data.idTiendaDestino,
      idUsuario: data.idUsuario,
      observaciones: data.observaciones || null,
      estado: "BORRADOR",
      totalOperacion: 0,
    },
  });
  revalidatePath("/traspasos");
  return {
    ...traspaso,
    fecha: traspaso.fecha.toISOString(),
    fechaCreacion: traspaso.fechaCreacion.toISOString(),
    totalOperacion: traspaso.totalOperacion ? Number(traspaso.totalOperacion) : null,
  };
}

export async function addLineaTraspaso(idOperacion: number, idProducto: number, cantidad: number) {
  const operacion = await prisma.operacionCabecera.findUnique({ where: { id: idOperacion } });
  if (!operacion || !operacion.idTiendaOrigen) throw new Error("Operación no encontrada");

  const producto = await prisma.producto.findUnique({ where: { id: idProducto } });
  if (!producto) throw new Error("Producto no encontrado");

  const stockOrigen = await prisma.stock.findUnique({
    where: {
      idTienda_idProducto: {
        idTienda: operacion.idTiendaOrigen,
        idProducto,
      },
    },
  });

  if (!stockOrigen || stockOrigen.cantidadActual < cantidad) {
    throw new Error(
      `Stock insuficiente para "${producto.nombre}" en tienda origen. Disponible: ${stockOrigen?.cantidadActual ?? 0}, Solicitado: ${cantidad}`
    );
  }

  const precioMomento = Number(producto.precioCoste);
  const subtotal = precioMomento * cantidad;

  const linea = await prisma.operacionLinea.create({
    data: {
      idOperacion,
      idProducto,
      cantidad,
      precioMomento,
      subtotal,
    },
  });

  const totalResult = await prisma.operacionLinea.aggregate({
    where: { idOperacion },
    _sum: { subtotal: true },
  });

  await prisma.operacionCabecera.update({
    where: { id: idOperacion },
    data: { totalOperacion: totalResult._sum.subtotal || 0 },
  });

  revalidatePath(`/traspasos/${idOperacion}`);
  return {
    ...linea,
    precioMomento: Number(linea.precioMomento),
    subtotal: Number(linea.subtotal),
  };
}

export async function removeLineaTraspaso(idLinea: number, idOperacion: number) {
  await prisma.operacionLinea.delete({ where: { id: idLinea } });

  const totalResult = await prisma.operacionLinea.aggregate({
    where: { idOperacion },
    _sum: { subtotal: true },
  });

  await prisma.operacionCabecera.update({
    where: { id: idOperacion },
    data: { totalOperacion: totalResult._sum.subtotal || 0 },
  });

  revalidatePath(`/traspasos/${idOperacion}`);
}

export async function cerrarTraspaso(idOperacion: number) {
  const operacion = await prisma.operacionCabecera.findUnique({
    where: { id: idOperacion },
    include: { lineas: { include: { producto: true } } },
  });

  if (!operacion) throw new Error("Operación no encontrada");
  if (operacion.estado !== "BORRADOR") throw new Error("La operación ya está cerrada");
  if (operacion.lineas.length === 0) throw new Error("No se puede cerrar una operación sin líneas");
  if (!operacion.idTiendaOrigen || !operacion.idTiendaDestino) {
    throw new Error("El traspaso debe tener tienda origen y destino");
  }

  const tiendaOrigen = operacion.idTiendaOrigen;
  const tiendaDestino = operacion.idTiendaDestino;

  await prisma.$transaction(async (tx) => {
    await tx.operacionCabecera.update({
      where: { id: idOperacion },
      data: { estado: "CERRADA" },
    });

    for (const linea of operacion.lineas) {
      const stockOrigen = await tx.stock.findUnique({
        where: {
          idTienda_idProducto: {
            idTienda: tiendaOrigen,
            idProducto: linea.idProducto,
          },
        },
      });
      const nombreProd = linea.producto?.nombre || `ID ${linea.idProducto}`;
      if (!stockOrigen || stockOrigen.cantidadActual < linea.cantidad) {
        throw new Error(`Stock insuficiente en origen para "${nombreProd}". Disponible: ${stockOrigen?.cantidadActual || 0}, Solicitado: ${linea.cantidad}`);
      }

      await tx.stock.update({
        where: { id: stockOrigen.id },
        data: { cantidadActual: stockOrigen.cantidadActual - linea.cantidad },
      });

      await tx.stock.upsert({
        where: {
          idTienda_idProducto: {
            idTienda: tiendaDestino,
            idProducto: linea.idProducto,
          },
        },
        create: {
          idTienda: tiendaDestino,
          idProducto: linea.idProducto,
          cantidadActual: linea.cantidad,
          stockMinimoAlerta: 5,
        },
        update: {
          cantidadActual: { increment: linea.cantidad },
        },
      });
    }
  });

  revalidatePath(`/traspasos/${idOperacion}`);
  revalidatePath("/traspasos");
  revalidatePath("/inventario");
}

export async function anularTraspaso(idOperacion: number) {
  const operacion = await prisma.operacionCabecera.findUnique({
    where: { id: idOperacion },
  });
  if (!operacion) throw new Error("Operación no encontrada");
  if (operacion.estado === "ANULADA") throw new Error("La operación ya está anulada");
  if (operacion.estado !== "BORRADOR") throw new Error("Solo se pueden anular operaciones en estado BORRADOR");

  await prisma.operacionCabecera.update({
    where: { id: idOperacion },
    data: { estado: "ANULADA" },
  });

  revalidatePath(`/traspasos/${idOperacion}`);
  revalidatePath("/traspasos");
}
