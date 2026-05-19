"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Prisma } from "@prisma/client"

import { verifySession } from "@/lib/session"
import { z } from "zod"

const ventaSchema = z.object({
    tiendaId: z.string().optional(),
    clienteId: z.string().optional().nullable(),
    notas: z.string().optional().nullable(),
    lineas: z.array(z.object({
        productoId: z.string().min(1),
        cantidad: z.number().int().positive(),
        precioUnitario: z.number().nonnegative(),
    })).min(1, "Debe incluir al menos un producto.")
})

export async function registrarVenta(data: {
    tiendaId?: string;
    clienteId?: string;
    notas?: string;
    lineas: {
        productoId: string;
        cantidad: number;
        precioUnitario: number;
    }[]
}) {
    try {
        const parsed = ventaSchema.safeParse(data);
        if (!parsed.success) {
            return { success: false, error: parsed.error.issues[0].message };
        }
        const validData = parsed.data;

        const { session } = await verifySession();
        if (!session?.usuarioId) {
            return { success: false, error: "Usuario no autenticado." };
        }

        const tiendaId = validData.tiendaId || session.tiendaId;
        
        if (!tiendaId) {
            return { success: false, error: "No se especificó la tienda para la venta." };
        }

        const usuarioId = session.usuarioId;

        const totalOperacion = validData.lineas.reduce((acc, linea) => acc + (linea.cantidad * linea.precioUnitario), 0);

        // Flujo Atómico de Venta
        const operacion = await prisma.$transaction(async (tx) => {
            // 1. Validar y descontar stock
            for (const linea of validData.lineas) {
                const stock = await tx.stock.findUnique({
                    where: {
                        tiendaId_productoId: {
                            tiendaId: tiendaId,
                            productoId: linea.productoId
                        }
                    }
                });

                if (!stock || stock.cantidad < linea.cantidad) {
                    const producto = await tx.producto.findUnique({
                        where: { id: linea.productoId },
                        select: { nombre: true }
                    });
                    throw new Error(`Stock insuficiente para el producto "${producto?.nombre || linea.productoId}". Disponible: ${stock?.cantidad ?? 0}`);
                }

                await tx.stock.update({
                    where: { id: stock.id },
                    data: { cantidad: { decrement: linea.cantidad } }
                });
            }

            // 2. Crear OperacionCabecera y sus lineas
            const newOperacion = await tx.operacionCabecera.create({
                data: {
                    tiendaId: tiendaId,
                    usuarioId: usuarioId,
                    clienteId: validData.clienteId || null,
                    tipo: "VENTA",
                    estado: "COMPLETADO",
                    totalOperacion: new Prisma.Decimal(totalOperacion),
                    notas: validData.notas || null,
                    lineas: {
                        create: validData.lineas.map(linea => ({
                            productoId: linea.productoId,
                            cantidad: linea.cantidad,
                            precioUnitario: new Prisma.Decimal(linea.precioUnitario),
                            subtotal: new Prisma.Decimal(linea.cantidad * linea.precioUnitario)
                        }))
                    }
                }
            });

            // 3. Registrar en CajaMovimiento
            await tx.cajaMovimiento.create({
                data: {
                    tiendaId: tiendaId,
                    operacionId: newOperacion.id,
                    tipoMovimiento: "INGRESO",
                    monto: new Prisma.Decimal(totalOperacion),
                    concepto: `Venta Directa - Operación #${newOperacion.id.slice(-6).toUpperCase()}`
                }
            });

            return newOperacion;
        });

        revalidatePath("/operaciones");
        revalidatePath("/inventario");

        return { success: true, data: { id: operacion.id } };

    } catch (error: any) {
        console.error("Transaction Error:", error);
        return { success: false, error: error.message || "Error procesando la venta" };
    }
}
