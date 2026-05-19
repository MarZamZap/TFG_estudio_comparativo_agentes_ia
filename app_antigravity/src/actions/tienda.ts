"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { telefonoValidation } from "@/lib/validations"
import { z } from "zod"

const tiendaActionSchema = z.object({
    nombre: z.string().min(1, "El nombre es obligatorio."),
    direccion: z.string().optional().nullable(),
    telefono: telefonoValidation,
});

export async function createTienda(data: {
    nombre: string;
    direccion?: string;
    telefono?: string;
}) {
    try {
        const parsed = tiendaActionSchema.safeParse(data);
        if (!parsed.success) {
            return { success: false, error: parsed.error.issues[0].message };
        }
        const tienda = await prisma.tienda.create({ data: parsed.data });
        revalidatePath("/gestion/tiendas");
        return { success: true, data: tienda };
    } catch (error: any) {
        return { success: false, error: "Error al crear la tienda." };
    }
}

export async function updateTienda(id: string, data: {
    nombre: string;
    direccion?: string;
    telefono?: string;
}) {
    try {
        const parsed = tiendaActionSchema.safeParse(data);
        if (!parsed.success) {
            return { success: false, error: parsed.error.issues[0].message };
        }
        const tienda = await prisma.tienda.update({
            where: { id },
            data: parsed.data
        });
        revalidatePath("/gestion/tiendas");
        return { success: true, data: tienda };
    } catch (error: any) {
        return { success: false, error: "Error al actualizar la tienda." };
    }
}

export async function deleteTienda(id: string) {
    try {
        const countUsuarios = await prisma.usuario.count({ where: { tiendaId: id } });
        const countOperaciones = await prisma.operacionCabecera.count({ where: { tiendaId: id } });

        if (countUsuarios > 0 || countOperaciones > 0) {
            return { success: false, error: `No se puede eliminar: la tienda tiene usuarios u operaciones asociadas.` };
        }

        await prisma.tienda.delete({ where: { id } });
        revalidatePath("/gestion/tiendas");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Error al eliminar la tienda." };
    }
}
