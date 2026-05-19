"use server";

import { prisma } from "@/lib/prisma";
import { tiendaSchema } from "@/lib/validators/maestros";
import { revalidatePath } from "next/cache";
import { handleActionError } from "@/lib/action-error";

export async function getTiendas() {
  return prisma.tienda.findMany({
    orderBy: { nombreComercial: "asc" },
  });
}

export async function getTienda(id: number) {
  return prisma.tienda.findUnique({ where: { id } });
}

export async function createTienda(data: unknown) {
  try {
    const parsed = tiendaSchema.parse(data);
    const tienda = await prisma.tienda.create({ data: parsed });
    revalidatePath("/admin/tiendas");
    return tienda;
  } catch (e) {
    handleActionError(e);
  }
}

export async function updateTienda(id: number, data: unknown) {
  try {
    const parsed = tiendaSchema.parse(data);
    const tienda = await prisma.tienda.update({ where: { id }, data: parsed });
    revalidatePath("/admin/tiendas");
    return tienda;
  } catch (e) {
    handleActionError(e);
  }
}

export async function deleteTienda(id: number) {
  await prisma.tienda.delete({ where: { id } });
  revalidatePath("/admin/tiendas");
}
