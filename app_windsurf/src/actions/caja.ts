"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCajaMovimientos(filters?: {
  idTienda?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  tipo?: string;
}) {
  const where: Record<string, unknown> = {};
  if (filters?.idTienda) where.idTienda = filters.idTienda;
  if (filters?.tipo) where.tipo = filters.tipo;
  if (filters?.fechaDesde || filters?.fechaHasta) {
    where.fecha = {
      ...(filters.fechaDesde ? { gte: new Date(filters.fechaDesde) } : {}),
      ...(filters.fechaHasta ? { lte: new Date(filters.fechaHasta + "T23:59:59") } : {}),
    };
  }

  const rows = await prisma.cajaMovimiento.findMany({
    where,
    include: {
      tienda: true,
      operacion: true,
      usuario: true,
    },
    orderBy: { fecha: "desc" },
  });
  return rows.map((r) => ({
    ...r,
    fecha: r.fecha.toISOString(),
    importe: Number(r.importe),
    operacion: r.operacion
      ? {
          ...r.operacion,
          fecha: r.operacion.fecha.toISOString(),
          fechaCreacion: r.operacion.fechaCreacion.toISOString(),
          totalOperacion: r.operacion.totalOperacion ? Number(r.operacion.totalOperacion) : null,
        }
      : null,
  }));
}

export async function getResumenCaja(idTienda?: number) {
  const where: Record<string, unknown> = {};
  if (idTienda) where.idTienda = idTienda;

  const [ingresos, egresos] = await Promise.all([
    prisma.cajaMovimiento.aggregate({
      where: { ...where, tipo: "INGRESO" },
      _sum: { importe: true },
      _count: { id: true },
    }),
    prisma.cajaMovimiento.aggregate({
      where: { ...where, tipo: "EGRESO" },
      _sum: { importe: true },
      _count: { id: true },
    }),
  ]);

  return {
    totalIngresos: Number(ingresos._sum.importe || 0),
    countIngresos: ingresos._count.id,
    totalEgresos: Number(egresos._sum.importe || 0),
    countEgresos: egresos._count.id,
    saldo: Number(ingresos._sum.importe || 0) - Number(egresos._sum.importe || 0),
  };
}

export async function createMovimientoCaja(data: {
  idTienda: number;
  idUsuario: number;
  tipo: "INGRESO" | "EGRESO";
  importe: number;
  formaPago?: string | null;
  concepto?: string | null;
}) {
  if (data.importe <= 0) throw new Error("El importe debe ser positivo");
  const movimiento = await prisma.cajaMovimiento.create({
    data: {
      idTienda: data.idTienda,
      idUsuario: data.idUsuario,
      tipo: data.tipo,
      importe: data.importe,
      formaPago: data.formaPago || null,
      concepto: data.concepto || null,
    },
  });
  revalidatePath("/caja");
  return {
    ...movimiento,
    fecha: movimiento.fecha.toISOString(),
    importe: Number(movimiento.importe),
  };
}
