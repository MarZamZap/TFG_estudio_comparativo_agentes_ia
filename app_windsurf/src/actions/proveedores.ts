"use server";

import { prisma } from "@/lib/prisma";
import { proveedorSchema } from "@/lib/validators/maestros";
import { revalidatePath } from "next/cache";
import { handleActionError } from "@/lib/action-error";

export async function getProveedores() {
  return prisma.proveedor.findMany({
    orderBy: { nombre: "asc" },
  });
}

export async function getProveedor(id: number) {
  return prisma.proveedor.findUnique({ where: { id } });
}

export async function createProveedor(data: unknown) {
  try {
    const parsed = proveedorSchema.parse(data);
    const proveedor = await prisma.proveedor.create({ data: parsed });
    revalidatePath("/admin/proveedores");
    return proveedor;
  } catch (e) {
    handleActionError(e);
  }
}

export async function updateProveedor(id: number, data: unknown) {
  try {
    const parsed = proveedorSchema.parse(data);
    const proveedor = await prisma.proveedor.update({ where: { id }, data: parsed });
    revalidatePath("/admin/proveedores");
    return proveedor;
  } catch (e) {
    handleActionError(e);
  }
}

export async function deleteProveedor(id: number) {
  try {
    await prisma.proveedor.delete({ where: { id } });
    revalidatePath("/admin/proveedores");
  } catch (e) {
    handleActionError(e);
  }
}
