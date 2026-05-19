"use server";

import { prisma } from "@/lib/prisma";
import { usuarioSchema } from "@/lib/validators/maestros";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { handleActionError } from "@/lib/action-error";

export async function getUsuarios() {
  return prisma.usuario.findMany({
    include: { tienda: true },
    orderBy: { nombreCompleto: "asc" },
  });
}

export async function getUsuario(id: number) {
  return prisma.usuario.findUnique({
    where: { id },
    include: { tienda: true },
  });
}

export async function createUsuario(data: unknown) {
  try {
    const parsed = usuarioSchema.parse(data);
    const { password, ...rest } = parsed;
    if (!password) throw new Error("La contraseña es obligatoria para nuevos usuarios");
    const passwordHash = await bcrypt.hash(password, 10);
    const usuario = await prisma.usuario.create({
      data: { ...rest, passwordHash },
    });
    revalidatePath("/admin/usuarios");
    return usuario;
  } catch (e) {
    handleActionError(e);
  }
}

export async function updateUsuario(id: number, data: unknown) {
  try {
    const parsed = usuarioSchema.parse(data);
    const { password, ...rest } = parsed;
    const updateData: Record<string, unknown> = { ...rest };
    if (password && password.length > 0) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }
    const usuario = await prisma.usuario.update({
      where: { id },
      data: updateData,
    });
    revalidatePath("/admin/usuarios");
    return usuario;
  } catch (e) {
    handleActionError(e);
  }
}

export async function deleteUsuario(id: number) {
  try {
    await prisma.usuario.delete({ where: { id } });
    revalidatePath("/admin/usuarios");
  } catch (e) {
    handleActionError(e);
  }
}
