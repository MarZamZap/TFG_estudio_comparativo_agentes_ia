"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Prisma } from "@prisma/client"
import { verifySession } from "@/lib/session"
import { z } from "zod"

const traspasoSchema = z.object({
    tiendaOrigenId: z.string().min(1),
    tiendaDestinoId: z.string().min(1),
    notas: z.string().optional().nullable(),
    lineas: z.array(z.object({
        productoId: z.string().min(1),
        cantidad: z.number().int().positive(),
    })).min(1, "Selecciona al menos un producto para el traspaso.")
})

export async function getTiendas() {
    try {
        const tiendas = await prisma.tienda.findMany({ orderBy: { nombre: 'asc' } });
        return { success: true, data: tiendas };
    } catch {
        return { success: false, error: "Error al obtener las tiendas" };
    }
}

export async function registrarTraspaso(data: {
    tiendaOrigenId: string;
    tiendaDestinoId: string;
    notas?: string;
    lineas: {
        productoId: string;
        cantidad: number;
    }[]
}) {
    try {
        const parsed = traspasoSchema.safeParse(data);
        if (!parsed.success) {
            return { success: false, error: parsed.error.issues[0].message };
        }
        const validData = parsed.data;

        const { session } = await verifySession();
        if (!session?.usuarioId) return { success: false, error: "Usuario no autenticado." };

        if (validData.tiendaOrigenId === validData.tiendaDestinoId) {
            return { success: false, error: "La tienda origen y destino no pueden ser la misma." };
        }

        const operacion = await prisma.$transaction(async (tx) => {
            // 1. Verificar stock disponible y mover
            for (const linea of validData.lineas) {
                const stockOrigen = await tx.stock.findUnique({
                    where: {
                        tiendaId_productoId: {
                            tiendaId: validData.tiendaOrigenId,
                            productoId: linea.productoId
                        }
                    }
                });

                if (!stockOrigen || stockOrigen.cantidad < linea.cantidad) {
                    const producto = await tx.producto.findUnique({
                        where: { id: linea.productoId },
                        select: { nombre: true }
                    });
                    throw new Error(
                        `Stock insuficiente para "${producto?.nombre}". Disponible: ${stockOrigen?.cantidad ?? 0}, Solicitado: ${linea.cantidad}`
                    );
                }

                // Decrementar origen
                await tx.stock.update({
                    where: { id: stockOrigen.id },
                    data: { cantidad: { decrement: linea.cantidad } }
                });

                // Incrementar destino (upsert por si no existe)
                await tx.stock.upsert({
                    where: {
                        tiendaId_productoId: {
                            tiendaId: validData.tiendaDestinoId,
                            productoId: linea.productoId
                        }
                    },
                    update: { cantidad: { increment: linea.cantidad } },
                    create: {
                        tiendaId: validData.tiendaDestinoId,
                        productoId: linea.productoId,
                        cantidad: linea.cantidad,
                        stockMinimoAlerta: 5
                    }
                });
            }

            // 2. Crear operacion TRASPASO (sin CajaMovimiento — no es movimiento financiero)
            const op = await tx.operacionCabecera.create({
                data: {
                    tiendaId: validData.tiendaOrigenId,
                    usuarioId: session.usuarioId,
                    tipo: "TRASPASO",
                    estado: "COMPLETADO",
                    totalOperacion: new Prisma.Decimal(0), // Los traspasos no tienen valor monetario
                    notas: validData.notas || `Traspaso a tienda ${validData.tiendaDestinoId}`,
                    lineas: {
                        create: validData.lineas.map(linea => ({
                            productoId: linea.productoId,
                            cantidad: linea.cantidad,
                            precioUnitario: new Prisma.Decimal(0),
                            subtotal: new Prisma.Decimal(0)
                        }))
                    }
                }
            });

            return op;
        });

        revalidatePath("/inventario");
        revalidatePath("/traspasos");
        revalidatePath("/operaciones/historial");

        return { success: true, data: { id: operacion.id } };

    } catch (error: any) {
        console.error("Traspaso Error:", error);
        return { success: false, error: error.message || "Error procesando el traspaso" };
    }
}
