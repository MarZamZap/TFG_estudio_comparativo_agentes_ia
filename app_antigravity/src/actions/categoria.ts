"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getCategorias() {
    try {
        return await prisma.categoria.findMany({
            include: {
                parent: true,
                _count: {
                    select: { productos: true, children: true }
                }
            },
            orderBy: { nombre: 'asc' }
        })
    } catch (error) {
        console.error("Error fetching categories:", error)
        throw new Error("Error al obtener las categorías")
    }
}

export async function createCategoria(data: { nombre: string; idCategoriaPadre?: string | null }) {
    try {
        if (!data.nombre.trim()) {
            return { success: false, error: "El nombre es obligatorio" }
        }

        const existing = await prisma.categoria.findFirst({ 
            where: { nombre: data.nombre.trim() } 
        });
        if (existing) {
            return { success: false, error: "Ya existe una categoría con ese nombre" };
        }

        const categoria = await prisma.categoria.create({
            data: {
                nombre: data.nombre.trim(),
                idCategoriaPadre: data.idCategoriaPadre || null
            }
        })

        revalidatePath("/gestion/categorias")
        revalidatePath("/inventario")
        return { success: true, data: categoria }
    } catch (error) {
        console.error("Error creating category:", error)
        return { success: false, error: "Error al crear la categoría" }
    }
}

export async function updateCategoria(id: string, data: { nombre: string; idCategoriaPadre?: string | null }) {
    try {
        if (!data.nombre.trim()) {
            return { success: false, error: "El nombre es obligatorio" }
        }

        const existing = await prisma.categoria.findFirst({ 
            where: { nombre: data.nombre.trim(), id: { not: id } } 
        });
        if (existing) {
            return { success: false, error: "Ya existe una categoría con ese nombre" };
        }

        if (id === data.idCategoriaPadre) {
            return { success: false, error: "Una categoría no puede ser padre de sí misma" }
        }

        // Cycle detection: Ensure the new parent is not a descendant of this category
        let currentParentId = data.idCategoriaPadre;
        while (currentParentId) {
            if (currentParentId === id) {
                return { success: false, error: "Una categoría no puede ser hija de su propia descendencia" };
            }
            const parentCategory = await prisma.categoria.findUnique({ 
                where: { id: currentParentId }, 
                select: { idCategoriaPadre: true } 
            });
            if (!parentCategory) break;
            currentParentId = parentCategory.idCategoriaPadre;
        }

        const categoria = await prisma.categoria.update({
            where: { id },
            data: {
                nombre: data.nombre.trim(),
                idCategoriaPadre: data.idCategoriaPadre || null
            }
        })

        revalidatePath("/gestion/categorias")
        revalidatePath("/inventario")
        return { success: true, data: categoria }
    } catch (error) {
        console.error("Error updating category:", error)
        return { success: false, error: "Error al actualizar la categoría" }
    }
}

export async function deleteCategoria(id: string) {
    try {
        const prodCount = await prisma.producto.count({ where: { categoriaId: id } })
        if (prodCount > 0) {
            return { success: false, error: "No se puede eliminar la categoría porque tiene productos asociados" }
        }

        const childCount = await prisma.categoria.count({ where: { idCategoriaPadre: id } })
        if (childCount > 0) {
            return { success: false, error: "No se puede eliminar porque tiene subcategorías asociadas" }
        }

        await prisma.categoria.delete({
            where: { id }
        })

        revalidatePath("/gestion/categorias")
        revalidatePath("/inventario")
        return { success: true }
    } catch (error) {
        console.error("Error deleting category:", error)
        return { success: false, error: "Error al eliminar la categoría" }
    }
}
