"use server";

import { prisma } from "@/lib/prisma";
import { categoriaSchema } from "@/lib/validators/maestros";
import { revalidatePath } from "next/cache";
import { handleActionError } from "@/lib/action-error";

export async function getCategorias() {
  return prisma.categoria.findMany({
    include: { categoriaPadre: true, subcategorias: true },
    orderBy: { nombre: "asc" },
  });
}

export async function getCategoriasArbol() {
  const todas = await prisma.categoria.findMany({
    where: { activa: true },
    orderBy: { nombre: "asc" },
  });
  return todas;
}

export async function getCategoria(id: number) {
  return prisma.categoria.findUnique({
    where: { id },
    include: { categoriaPadre: true, subcategorias: true },
  });
}

async function validarCircularidad(categoriaId: number, nuevoPadreId: number | null) {
  if (nuevoPadreId === null) return;
  if (categoriaId === nuevoPadreId) {
    throw new Error("Una categoría no puede ser su propio padre (auto-referencia).");
  }
  let ancestroId: number | null = nuevoPadreId;
  const visited = new Set<number>();
  while (ancestroId !== null) {
    if (visited.has(ancestroId)) {
      throw new Error("Se detectó una dependencia circular en la jerarquía de categorías.");
    }
    visited.add(ancestroId);
    if (ancestroId === categoriaId) {
      throw new Error("Dependencia circular: la categoría no puede ser hija de uno de sus descendientes.");
    }
    const padre: { idCategoriaPadre: number | null } | null = await prisma.categoria.findUnique({
      where: { id: ancestroId },
      select: { idCategoriaPadre: true },
    });
    ancestroId = padre?.idCategoriaPadre ?? null;
  }
}

export async function createCategoria(data: unknown) {
  try {
    const parsed = categoriaSchema.parse(data);
    const categoria = await prisma.categoria.create({ data: parsed });
    revalidatePath("/admin/categorias");
    return categoria;
  } catch (e) {
    handleActionError(e);
  }
}

export async function updateCategoria(id: number, data: unknown) {
  try {
    const parsed = categoriaSchema.parse(data);
    await validarCircularidad(id, parsed.idCategoriaPadre ?? null);
    const categoria = await prisma.categoria.update({ where: { id }, data: parsed });
    revalidatePath("/admin/categorias");
    return categoria;
  } catch (e) {
    handleActionError(e);
  }
}

export async function deleteCategoria(id: number) {
  const hijas = await prisma.categoria.count({ where: { idCategoriaPadre: id } });
  if (hijas > 0) {
    throw new Error("No se puede eliminar una categoría con subcategorías. Elimine o reasigne las subcategorías primero.");
  }
  await prisma.categoria.delete({ where: { id } });
  revalidatePath("/admin/categorias");
}
