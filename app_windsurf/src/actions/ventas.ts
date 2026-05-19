"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getVentas(filters?: {
  idTienda?: number;
  idCliente?: number;
  fechaDesde?: string;
  fechaHasta?: string;
}) {
  const where: Record<string, unknown> = { tipo: "VENTA" };
  if (filters?.idTienda) where.idTienda = filters.idTienda;
  if (filters?.idCliente) where.idCliente = filters.idCliente;
  if (filters?.fechaDesde || filters?.fechaHasta) {
    where.fecha = {
      ...(filters.fechaDesde ? { gte: new Date(filters.fechaDesde) } : {}),
      ...(filters.fechaHasta ? { lte: new Date(filters.fechaHasta + "T23:59:59") } : {}),
    };
  }

  const rows = await prisma.operacionCabecera.findMany({
    where,
    include: { tienda: true, cliente: true, usuario: true },
    orderBy: { fecha: "desc" },
  });
  return rows.map((r) => ({
    ...r,
    fecha: r.fecha.toISOString(),
    fechaCreacion: r.fechaCreacion.toISOString(),
    totalOperacion: r.totalOperacion ? Number(r.totalOperacion) : null,
  }));
}

export async function getVenta(id: number) {
  const row = await prisma.operacionCabecera.findUnique({
    where: { id },
    include: {
      tienda: true,
      cliente: true,
      usuario: true,
      lineas: { include: { producto: true } },
    },
  });
  if (!row) return null;
  return {
    ...row,
    fecha: row.fecha.toISOString(),
    fechaCreacion: row.fechaCreacion.toISOString(),
    totalOperacion: row.totalOperacion ? Number(row.totalOperacion) : null,
    lineas: row.lineas.map((l) => ({
      ...l,
      precioMomento: Number(l.precioMomento),
      subtotal: Number(l.subtotal),
      producto: l.producto
        ? { ...l.producto, precioVenta: Number(l.producto.precioVenta), precioCoste: Number(l.producto.precioCoste) }
        : null,
    })),
  };
}

export async function createVenta(data: {
  idTienda: number;
  idCliente?: number | null;
  idUsuario: number;
  formaPago?: string | null;
  observaciones?: string | null;
}) {
  const venta = await prisma.operacionCabecera.create({
    data: {
      tipo: "VENTA",
      idTienda: data.idTienda,
      idCliente: data.idCliente || null,
      idUsuario: data.idUsuario,
      formaPago: data.formaPago || null,
      observaciones: data.observaciones || null,
      estado: "BORRADOR",
      totalOperacion: 0,
    },
  });
  revalidatePath("/ventas");
  return {
    ...venta,
    fecha: venta.fecha.toISOString(),
    fechaCreacion: venta.fechaCreacion.toISOString(),
    totalOperacion: venta.totalOperacion ? Number(venta.totalOperacion) : null,
  };
}

export async function addLineaVenta(idOperacion: number, idProducto: number, cantidad: number) {
  const operacion = await prisma.operacionCabecera.findUnique({ where: { id: idOperacion } });
  if (!operacion) throw new Error("Operación no encontrada");

  const producto = await prisma.producto.findUnique({ where: { id: idProducto } });
  if (!producto) throw new Error("Producto no encontrado");

  // Verificar stock antes de añadir la línea
  const stock = await prisma.stock.findUnique({
    where: {
      idTienda_idProducto: {
        idTienda: operacion.idTienda,
        idProducto,
      },
    },
  });

  if (!stock || stock.cantidadActual < cantidad) {
    throw new Error(
      `Stock insuficiente para "${producto.nombre}". Disponible: ${stock?.cantidadActual || 0}, Solicitado: ${cantidad}`
    );
  }

  const precioMomento = Number(producto.precioVenta);
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

  revalidatePath(`/ventas/${idOperacion}`);
  return {
    ...linea,
    precioMomento: Number(linea.precioMomento),
    subtotal: Number(linea.subtotal),
  };
}

export async function removeLineaVenta(idLinea: number, idOperacion: number) {
  await prisma.operacionLinea.delete({ where: { id: idLinea } });

  const totalResult = await prisma.operacionLinea.aggregate({
    where: { idOperacion },
    _sum: { subtotal: true },
  });

  await prisma.operacionCabecera.update({
    where: { id: idOperacion },
    data: { totalOperacion: totalResult._sum.subtotal || 0 },
  });

  revalidatePath(`/ventas/${idOperacion}`);
}

export async function cerrarVenta(idOperacion: number) {
  const operacion = await prisma.operacionCabecera.findUnique({
    where: { id: idOperacion },
    include: { lineas: { include: { producto: true } } },
  });

  if (!operacion) throw new Error("Operación no encontrada");
  if (operacion.estado !== "BORRADOR") throw new Error("La operación ya está cerrada");
  if (operacion.lineas.length === 0) throw new Error("No se puede cerrar una operación sin líneas");

  await prisma.$transaction(async (tx) => {
    const totalResult = await tx.operacionLinea.aggregate({
      where: { idOperacion },
      _sum: { subtotal: true },
    });
    const total = totalResult._sum.subtotal || 0;

    await tx.operacionCabecera.update({
      where: { id: idOperacion },
      data: { totalOperacion: total, estado: "CERRADA" },
    });

    for (const linea of operacion.lineas) {
      const stock = await tx.stock.findUnique({
        where: {
          idTienda_idProducto: {
            idTienda: operacion.idTienda,
            idProducto: linea.idProducto,
          },
        },
      });
      const nombreProd = linea.producto?.nombre || `ID ${linea.idProducto}`;
      if (!stock || stock.cantidadActual < linea.cantidad) {
        throw new Error(`Stock insuficiente para "${nombreProd}". Disponible: ${stock?.cantidadActual || 0}, Solicitado: ${linea.cantidad}`);
      }
      await tx.stock.update({
        where: { id: stock.id },
        data: { cantidadActual: stock.cantidadActual - linea.cantidad },
      });
    }

    await tx.cajaMovimiento.create({
      data: {
        idTienda: operacion.idTienda,
        idOperacion,
        idUsuario: operacion.idUsuario,
        tipo: "INGRESO",
        importe: total,
        formaPago: operacion.formaPago,
        concepto: `Venta #${idOperacion}`,
      },
    });
  });

  revalidatePath(`/ventas/${idOperacion}`);
  revalidatePath("/ventas");
  revalidatePath("/inventario");
}

export async function anularVenta(idOperacion: number) {
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

  revalidatePath(`/ventas/${idOperacion}`);
  revalidatePath("/ventas");
}
