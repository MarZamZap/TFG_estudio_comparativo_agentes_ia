"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { verifySession } from "@/lib/session"

export async function updateStockMinimo(stockId: string, stockMinimoAlerta: number) {
    try {
        const sessionRes = await verifySession()
        if (!sessionRes.isAuth || !sessionRes.session) return { success: false, error: 'No autorizado' }

        const stock = await prisma.stock.update({
            where: { id: stockId },
            data: { stockMinimoAlerta },
        })

        return { success: true, data: stock }
    } catch (e: any) {
        return { success: false, error: "Error al actualizar stock mínimo: " + e.message }
    }
}

export async function getProducto(id: string) {
    try {
        const producto = await prisma.producto.findUnique({
            where: { id },
            include: {
                categoria: true,
                atributo: true,
                proveedor: { select: { id: true, nombre: true } },
                stocks: { include: { tienda: true } }
            }
        });
        if (!producto) return { success: false, error: "Producto no encontrado" };
        return { success: true, data: producto };
    } catch {
        return { success: false, error: "Error al obtener el producto" };
    }
}

export async function createProducto(data: {
    nombre: string;
    descripcion?: string;
    precio: number;
    coste?: number;
    codigoBarras?: string;
    categoriaId: string;
    proveedorId: string;
    marca?: string;
    modelo?: string;
    color?: string;
    material?: string;
    imageUrl?: string;
}) {
    try {
        if (!data.nombre || !data.precio || !data.categoriaId || !data.proveedorId) {
            return { success: false, error: "Nombre, precio, categoría y proveedor son obligatorios." };
        }

        const producto = await prisma.producto.create({
            data: {
                nombre: data.nombre,
                descripcion: data.descripcion || null,
                precio: data.precio,
                coste: data.coste ?? null,
                codigoBarras: data.codigoBarras || null,
                categoriaId: data.categoriaId,
                proveedorId: data.proveedorId,
                imageUrl: data.imageUrl || null,
                atributo: {
                    create: {
                        marca: data.marca || null,
                        modelo: data.modelo || null,
                        color: data.color || null,
                        material: data.material || null,
                    }
                }
            },
        });

        // Initialize stock for all active stores
        const tiendas = await prisma.tienda.findMany();
        for (const tienda of tiendas) {
            await prisma.stock.create({
                data: {
                    productoId: producto.id,
                    tiendaId: tienda.id,
                    cantidad: 0,
                    stockMinimoAlerta: 5,
                }
            });
        }

        revalidatePath("/inventario");
        revalidatePath("/operaciones");
        return { success: true, data: { id: producto.id } };
    } catch (error: any) {
        console.error("Error creating producto:", error);
        if (error.code === 'P2002') {
            return { success: false, error: "El código de barras ya existe." };
        }
        return { success: false, error: "Error al crear el producto." };
    }
}

export async function updateProducto(id: string, data: {
    nombre: string;
    descripcion?: string;
    precio: number;
    coste?: number;
    codigoBarras?: string;
    categoriaId: string;
    proveedorId: string;
    marca?: string;
    modelo?: string;
    color?: string;
    material?: string;
    imageUrl?: string;
}) {
    try {
        if (!data.nombre || !data.precio || !data.categoriaId || !data.proveedorId) {
            return { success: false, error: "Nombre, precio, categoría y proveedor son obligatorios." };
        }

        await prisma.producto.update({
            where: { id },
            data: {
                nombre: data.nombre,
                descripcion: data.descripcion || null,
                precio: data.precio,
                coste: data.coste ?? null,
                codigoBarras: data.codigoBarras || null,
                categoriaId: data.categoriaId,
                proveedorId: data.proveedorId,
                imageUrl: data.imageUrl || null,
                atributo: {
                    upsert: {
                        update: {
                            marca: data.marca || null,
                            modelo: data.modelo || null,
                            color: data.color || null,
                            material: data.material || null,
                        },
                        create: {
                            marca: data.marca || null,
                            modelo: data.modelo || null,
                            color: data.color || null,
                            material: data.material || null,
                        }
                    }
                }
            }
        });

        revalidatePath("/inventario");
        revalidatePath(`/inventario/${id}`);
        revalidatePath("/operaciones");
        revalidatePath("/compras");
        return { success: true };
    } catch (error: any) {
        if (error.code === 'P2002') return { success: false, error: "El código de barras ya existe." };
        return { success: false, error: "Error al actualizar el producto." };
    }
}

export async function deleteProducto(id: string) {
    try {
        const countOperaciones = await prisma.operacionLinea.count({ where: { productoId: id } });
        if (countOperaciones > 0) {
            return { success: false, error: "No se puede eliminar porque tiene historial de movimientos u operaciones asociadas." };
        }
        await prisma.producto.delete({ where: { id } });
        revalidatePath("/inventario");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Error al eliminar el producto." };
    }
}

export async function ajustarStock(data: {
    stockId: string;
    ajuste: number; // puede ser negativo
    motivo: string;
}) {
    try {
        if (data.ajuste === 0) return { success: false, error: "El ajuste no puede ser cero." };
        const stock = await prisma.stock.findUnique({ where: { id: data.stockId } });
        if (!stock) return { success: false, error: "Registro de stock no encontrado." };

        const nuevaCantidad = stock.cantidad + data.ajuste;
        if (nuevaCantidad < 0) {
            return { success: false, error: `El ajuste resulta en stock negativo (${nuevaCantidad} uds.).` };
        }

        await prisma.stock.update({
            where: { id: data.stockId },
            data: { cantidad: { increment: data.ajuste } }
        });

        revalidatePath("/inventario");
        return { success: true, data: { nuevaCantidad } };
    } catch {
        return { success: false, error: "Error al ajustar el stock." };
    }
}
