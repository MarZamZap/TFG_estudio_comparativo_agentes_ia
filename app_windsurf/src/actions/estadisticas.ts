"use server";

import { prisma } from "@/lib/prisma";

export async function getVentasPorTienda(fechaDesde?: string, fechaHasta?: string, tiendaId?: number) {
  const where: Record<string, unknown> = { tipo: "VENTA", estado: "CERRADA" };
  if (fechaDesde || fechaHasta) {
    where.fecha = {
      ...(fechaDesde ? { gte: new Date(fechaDesde) } : {}),
      ...(fechaHasta ? { lte: new Date(fechaHasta + "T23:59:59") } : {}),
    };
  }
  if (tiendaId) where.idTienda = tiendaId;

  const result = await prisma.operacionCabecera.groupBy({
    by: ["idTienda"],
    where,
    _sum: { totalOperacion: true },
    _count: { id: true },
  });

  const tiendas = await prisma.tienda.findMany();
  const tiendaMap = new Map(tiendas.map((t) => [t.id, t.nombreComercial]));

  return result.map((r) => ({
    tienda: tiendaMap.get(r.idTienda) || `Tienda ${r.idTienda}`,
    total: Number(r._sum.totalOperacion || 0),
    cantidad: r._count.id,
  }));
}

export async function getVolumenDiario(fechaDesde?: string, fechaHasta?: string, tiendaId?: number) {
  const where: Record<string, unknown> = { tipo: "VENTA", estado: "CERRADA" };
  if (fechaDesde || fechaHasta) {
    where.fecha = {
      ...(fechaDesde ? { gte: new Date(fechaDesde) } : {}),
      ...(fechaHasta ? { lte: new Date(fechaHasta + "T23:59:59") } : {}),
    };
  }
  if (tiendaId) where.idTienda = tiendaId;

  const operaciones = await prisma.operacionCabecera.findMany({
    where,
    select: { fecha: true, totalOperacion: true },
    orderBy: { fecha: "asc" },
  });

  const agrupado = new Map<string, { total: number; cantidad: number }>();
  for (const op of operaciones) {
    const dia = op.fecha.toISOString().split("T")[0];
    const existing = agrupado.get(dia) || { total: 0, cantidad: 0 };
    existing.total += Number(op.totalOperacion);
    existing.cantidad += 1;
    agrupado.set(dia, existing);
  }

  return Array.from(agrupado.entries()).map(([fecha, data]) => ({
    fecha,
    total: data.total,
    cantidad: data.cantidad,
  }));
}

export async function getTopProductos(limit = 5, fechaDesde?: string, fechaHasta?: string, tiendaId?: number) {
  const where: Record<string, unknown> = {};
  const operacionWhere: Record<string, unknown> = { tipo: "VENTA", estado: "CERRADA" };
  if (fechaDesde || fechaHasta) {
    operacionWhere.fecha = {
      ...(fechaDesde ? { gte: new Date(fechaDesde) } : {}),
      ...(fechaHasta ? { lte: new Date(fechaHasta + "T23:59:59") } : {}),
    };
  }
  if (tiendaId) operacionWhere.idTienda = tiendaId;
  where.operacion = operacionWhere;

  const result = await prisma.operacionLinea.groupBy({
    by: ["idProducto"],
    where,
    _sum: { cantidad: true, subtotal: true },
    orderBy: { _sum: { cantidad: "desc" } },
    take: limit,
  });

  const productos = await prisma.producto.findMany({
    where: { id: { in: result.map((r) => r.idProducto) } },
  });
  const productoMap = new Map(productos.map((p) => [p.id, p.nombre]));

  return result.map((r) => ({
    producto: productoMap.get(r.idProducto) || `Producto ${r.idProducto}`,
    cantidadVendida: r._sum.cantidad || 0,
    totalVentas: Number(r._sum.subtotal || 0),
  }));
}

export async function getDashboardStats() {
  const [totalClientes, totalProductos, ventasHoy, stockBajo] = await Promise.all([
    prisma.cliente.count(),
    prisma.producto.count({ where: { activo: true } }),
    prisma.operacionCabecera.count({
      where: {
        tipo: "VENTA",
        estado: "CERRADA",
        fecha: { gte: new Date(new Date().toISOString().split("T")[0]) },
      },
    }),
    prisma.stock.count({
      where: {
        cantidadActual: { lte: prisma.stock.fields?.stockMinimoAlerta as unknown as number || 0 },
      },
    }).catch(() => 0),
  ]);

  const ventasMesResult = await prisma.operacionCabecera.aggregate({
    where: {
      tipo: "VENTA",
      estado: "CERRADA",
      fecha: {
        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    },
    _sum: { totalOperacion: true },
  });

  return {
    totalClientes,
    totalProductos,
    ventasHoy,
    ventasMes: Number(ventasMesResult._sum.totalOperacion || 0),
  };
}

export async function getKpisTienda(fechaDesde?: string, fechaHasta?: string, tiendaId?: number) {
  const tiendaWhere = tiendaId ? { idTienda: tiendaId } : {};

  // Build date filter only when at least one bound is provided
  const fechaFilter =
    fechaDesde || fechaHasta
      ? {
          fecha: {
            ...(fechaDesde ? { gte: new Date(fechaDesde) } : {}),
            ...(fechaHasta ? { lte: new Date(fechaHasta + "T23:59:59") } : {}),
          },
        }
      : {};

  const [ventas, compras, traspasos, facturacionResult, stockBajo] = await Promise.all([
    prisma.operacionCabecera.count({
      where: { tipo: "VENTA", estado: "CERRADA", ...tiendaWhere, ...fechaFilter },
    }),
    prisma.operacionCabecera.count({
      where: { tipo: "COMPRA", estado: "CERRADA", ...tiendaWhere, ...fechaFilter },
    }),
    prisma.operacionCabecera.count({
      where: { tipo: "TRASPASO", estado: "CERRADA", ...tiendaWhere, ...fechaFilter },
    }),
    prisma.operacionCabecera.aggregate({
      where: { tipo: "VENTA", estado: "CERRADA", ...tiendaWhere, ...fechaFilter },
      _sum: { totalOperacion: true },
    }),
    tiendaId
      ? prisma.$queryRaw<[{ count: bigint }]>`
          SELECT COUNT(*) as count FROM stock
          WHERE cantidad_actual <= stock_minimo_alerta AND id_tienda = ${tiendaId}
        `.then((r) => Number(r[0]?.count || 0)).catch(() => 0)
      : prisma.$queryRaw<[{ count: bigint }]>`
          SELECT COUNT(*) as count FROM stock WHERE cantidad_actual <= stock_minimo_alerta
        `.then((r) => Number(r[0]?.count || 0)).catch(() => 0),
  ]);

  return {
    ventas,
    compras,
    traspasos,
    facturacion: Number(facturacionResult._sum.totalOperacion || 0),
    stockBajo,
  };
}

export async function getIaLogs() {
  return prisma.iaLogConsulta.findMany({
    include: { usuario: true },
    orderBy: { fechaHora: "desc" },
    take: 100,
  });
}
