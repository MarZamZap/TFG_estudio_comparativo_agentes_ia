"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Prisma } from "@prisma/client"
import { verifySession } from "@/lib/session"
import { z } from "zod"

const compraSchema = z.object({
    notas: z.string().optional().nullable(),
    lineas: z.array(z.object({
        productoId: z.string().min(1),
        cantidad: z.number().int().positive(),
        precioUnitario: z.number().nonnegative(),
    })).min(1, "Debe incluir al menos un producto en la compra.")
})

export async function registrarCompra(data: {
    notas?: string;
    lineas: {
        productoId: string;
        cantidad: number;
        precioUnitario: number; // Coste de adquisición al proveedor
    }[]
}) {
    try {
        const parsed = compraSchema.safeParse(data);
        if (!parsed.success) {
            return { success: false, error: parsed.error.issues[0].message };
        }
        const validData = parsed.data;

        const { session } = await verifySession();
        if (!session?.tiendaId || !session?.usuarioId) {
            return { success: false, error: "Usuario no autenticado." };
        }

        const tiendaId = session.tiendaId;
        const usuarioId = session.usuarioId;

        const totalOperacion = validData.lineas.reduce((acc, linea) => acc + (linea.cantidad * linea.precioUnitario), 0);

        // Flujo Atómico de Compra/Entrada
        const operacion = await prisma.$transaction(async (tx) => {
            // 1. Incrementar stock
            for (const linea of validData.lineas) {
                await tx.stock.upsert({
                    where: {
                        tiendaId_productoId: {
                            tiendaId: tiendaId,
                            productoId: linea.productoId
                        }
                    },
                    update: { cantidad: { increment: linea.cantidad } },
                    create: {
                        tiendaId: tiendaId,
                        productoId: linea.productoId,
                        cantidad: linea.cantidad,
                        stockMinimoAlerta: 5
                    }
                });
            }

            // 2. Crear OperacionCabecera de tipo COMPRA
            const newOperacion = await tx.operacionCabecera.create({
                data: {
                    tiendaId: tiendaId,
                    usuarioId: usuarioId,
                    tipo: "COMPRA",
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

            // 3. Registrar en CajaMovimiento (Egreso)
            await tx.cajaMovimiento.create({
                data: {
                    tiendaId: tiendaId,
                    operacionId: newOperacion.id,
                    tipoMovimiento: "EGRESO",
                    monto: new Prisma.Decimal(totalOperacion),
                    concepto: `Pago a Proveedor - Operación #${newOperacion.id.slice(-6).toUpperCase()}`
                }
            });

            return newOperacion;
        });

        revalidatePath("/operaciones");
        revalidatePath("/inventario");

        return { success: true, data: { id: operacion.id } };

    } catch (error: any) {
        console.error("Transaction Error:", error);
        return { success: false, error: error.message || "Error procesando la compra/entrada" };
    }
}
