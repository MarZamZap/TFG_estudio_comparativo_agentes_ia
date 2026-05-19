"use server"

import prisma from "@/lib/prisma"

export async function getInventario() {
    try {
        const productos = await prisma.producto.findMany({
            include: {
                categoria: true,
                atributo: true,
                proveedor: { select: { id: true, nombre: true } },
                stocks: {
                    include: { tienda: true }
                }
            },
            orderBy: { nombre: 'asc' }
        });

        return { success: true, data: productos };
    } catch (error) {
        console.error("Error fetching inventario:", error);
        return { success: false, error: "Error al obtener el inventario" };
    }
}
