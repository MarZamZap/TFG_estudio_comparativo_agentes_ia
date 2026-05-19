"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCompras(filters?: {
  idTienda?: number;
  idProveedor?: number;
  fechaDesde?: string;
  fechaHasta?: string;
}) {
  const where: Record<string, unknown> = { tipo: "COMPRA" };
  if (filters?.idTienda) where.idTienda = filters.idTienda;
  if (filters?.idProveedor) where.idProveedor = filters.idProveedor;
  if (filters?.fechaDesde || filters?.fechaHasta) {
    where.fecha = {
      ...(filters.fechaDesde ? { gte: new Date(filters.fechaDesde) } : {}),
      ...(filters.fechaHasta ? { lte: new Date(filters.fechaHasta + "T23:59:59") } : {}),
    };
  }

  const rows = await prisma.operacionCabecera.findMany({
    where,
    include: { tienda: true, proveedor: true, usuario: true },
    orderBy: { fecha: "desc" },
  });
  return rows.map((r) => ({
    ...r,
    fecha: r.fecha.toISOString(),
    fechaCreacion: r.fechaCreacion.toISOString(),
    totalOperacion: r.totalOperacion ? Number(r.totalOperacion) : null,
  }));
}

export async function getCompra(id: number) {
  const row = await prisma.operacionCabecera.findUnique({
    where: { id },
    include: {
      tienda: true,
      proveedor: true,
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
    lineas: (row as typeof row & { lineas: Array<{ precioMomento: unknown; subtotal: unknown; producto: { precioVenta: unknown; precioCoste: unknown } | null } & Record<string, unknown>> }).lineas.map((l) => ({
      ...l,
      precioMomento: Number(l.precioMomento),
      subtotal: Number(l.subtotal),
      producto: l.producto
        ? { ...l.producto, precioVenta: Number(l.producto.precioVenta), precioCoste: Number(l.producto.precioCoste) }
        : null,
    })),
  };
}

export async function createCompra(data: {
  idTienda: number;
  idProveedor: number;
  idUsuario: number;
  observaciones?: string | null;
}) {
  const compra = await prisma.operacionCabecera.create({
    data: {
      tipo: "COMPRA",
      idTienda: data.idTienda,
      idProveedor: data.idProveedor,
      idUsuario: data.idUsuario,
      observaciones: data.observaciones || null,
      estado: "BORRADOR",
      totalOperacion: 0,
    },
  });
  revalidatePath("/compras");
  return {
    ...compra,
    fecha: compra.fecha.toISOString(),
    fechaCreacion: compra.fechaCreacion.toISOString(),
    totalOperacion: compra.totalOperacion ? Number(compra.totalOperacion) : null,
  };
}

export async function getProductosProveedor(idProveedor: number) {
  const rows = await prisma.producto.findMany({
    where: { idProveedor, activo: true },
    include: { atributos: true },
    orderBy: { nombre: "asc" },
  });
  return rows.map((p) => ({
    ...p,
    precioVenta: Number(p.precioVenta),
    precioCoste: Number(p.precioCoste),
    fechaCreacion: p.fechaCreacion.toISOString(),
  }));
}

export async function addLineaCompra(idOperacion: number, idProducto: number, cantidad: number) {
  const operacion = await prisma.operacionCabecera.findUnique({ where: { id: idOperacion } });
  if (!operacion) throw new Error("Operación no encontrada");

  const producto = await prisma.producto.findUnique({ where: { id: idProducto } });
  if (!producto) throw new Error("Producto no encontrado");

  if (operacion.idProveedor && producto.idProveedor !== operacion.idProveedor) {
    throw new Error("El producto no pertenece al proveedor de esta compra");
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

  revalidatePath(`/compras/${idOperacion}`);
  return {
    ...linea,
    precioMomento: Number(linea.precioMomento),
    subtotal: Number(linea.subtotal),
  };
}

export async function removeLineaCompra(idLinea: number, idOperacion: number) {
  await prisma.operacionLinea.delete({ where: { id: idLinea } });

  const totalResult = await prisma.operacionLinea.aggregate({
    where: { idOperacion },
    _sum: { subtotal: true },
  });

  await prisma.operacionCabecera.update({
    where: { id: idOperacion },
    data: { totalOperacion: totalResult._sum.subtotal || 0 },
  });

  revalidatePath(`/compras/${idOperacion}`);
}

export async function cerrarCompra(idOperacion: number) {
  const operacion = await prisma.operacionCabecera.findUnique({
    where: { id: idOperacion },
    include: { lineas: true },
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
      await tx.stock.upsert({
        where: {
          idTienda_idProducto: {
            idTienda: operacion.idTienda,
            idProducto: linea.idProducto,
          },
        },
        create: {
          idTienda: operacion.idTienda,
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

  revalidatePath(`/compras/${idOperacion}`);
  revalidatePath("/compras");
  revalidatePath("/inventario");
}

export async function anularCompra(idOperacion: number) {
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

  revalidatePath(`/compras/${idOperacion}`);
  revalidatePath("/compras");
}
