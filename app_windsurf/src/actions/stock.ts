"use server";

import { prisma } from "@/lib/prisma";
import { stockSchema } from "@/lib/validators/productos";
import { revalidatePath } from "next/cache";
import { handleActionError } from "@/lib/action-error";

export async function getStock(filters?: { idTienda?: number; search?: string }) {
  const where: Record<string, unknown> = {};
  if (filters?.idTienda) where.idTienda = filters.idTienda;

  const rows = await prisma.stock.findMany({
    where: filters?.search
      ? {
          ...where,
          producto: {
            OR: [
              { nombre: { contains: filters.search, mode: "insensitive" as const } },
              { codigo: { contains: filters.search, mode: "insensitive" as const } },
            ],
          },
        }
      : where,
    include: {
      tienda: true,
      producto: { include: { atributos: true } },
    },
    orderBy: { producto: { nombre: "asc" } },
  });
  return rows.map((s) => ({
    ...s,
    producto: s.producto
      ? {
          ...s.producto,
          precioVenta: Number(s.producto.precioVenta),
          precioCoste: Number(s.producto.precioCoste),
          fechaCreacion: s.producto.fechaCreacion.toISOString(),
        }
      : null,
  }));
}

export async function createStock(data: unknown) {
  try {
    const parsed = stockSchema.parse(data);
    const existing = await prisma.stock.findUnique({
      where: {
        idTienda_idProducto: {
          idTienda: parsed.idTienda,
          idProducto: parsed.idProducto,
        },
      },
    });
    if (existing) {
      throw new Error("Ya existe un registro de stock para este producto en esta tienda.");
    }
    const stock = await prisma.stock.create({
      data: {
        idTienda: parsed.idTienda,
        idProducto: parsed.idProducto,
        cantidadActual: 0,
        stockMinimoAlerta: parsed.stockMinimoAlerta,
      },
    });
    revalidatePath("/inventario");
    return stock;
  } catch (e) {
    handleActionError(e);
  }
}

export async function updateStockAlerta(id: number, stockMinimoAlerta: number) {
  const stock = await prisma.stock.update({
    where: { id },
    data: { stockMinimoAlerta },
  });
  revalidatePath("/inventario");
  return stock;
}

export async function deleteStock(id: number) {
  await prisma.stock.delete({ where: { id } });
  revalidatePath("/inventario");
}
