"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { cifValidation, telefonoValidation, emailValidation } from "@/lib/validations"
import { z } from "zod"

const proveedorActionSchema = z.object({
    nombre: z.string().min(1, "El nombre es obligatorio."),
    cif: cifValidation,
    telefono: telefonoValidation,
    email: emailValidation,
    direccion: z.string().optional().nullable(),
});

export async function getProveedores() {
    try {
        const proveedores = await prisma.proveedor.findMany({
            include: { _count: { select: { productos: true } } },
            orderBy: { nombre: 'asc' }
        });
        return { success: true, data: proveedores };
    } catch (error) {
        console.error("Error fetching proveedores:", error);
        return { success: false, error: "Error al obtener los proveedores" };
    }
}

export async function createProveedor(data: {
    nombre: string;
    cif?: string;
    telefono?: string;
    email?: string;
    direccion?: string;
}) {
    try {
        const parsed = proveedorActionSchema.safeParse(data);
        if (!parsed.success) {
            return { success: false, error: parsed.error.issues[0].message };
        }
        const validData = parsed.data;
        const proveedor = await prisma.proveedor.create({ data: validData });
        revalidatePath("/gestion/proveedores");
        revalidatePath("/compras");
        return { success: true, data: proveedor };
    } catch (error: any) {
        if (error.code === 'P2002') return { success: false, error: "El CIF ya está registrado." };
        return { success: false, error: "Error al crear el proveedor." };
    }
}

export async function updateProveedor(id: string, data: {
    nombre: string;
    cif?: string;
    telefono?: string;
    email?: string;
    direccion?: string;
}) {
    try {
        const parsed = proveedorActionSchema.safeParse(data);
        if (!parsed.success) {
            return { success: false, error: parsed.error.issues[0].message };
        }
        const validData = parsed.data;
        const proveedor = await prisma.proveedor.update({
            where: { id },
            data: validData
        });
        revalidatePath("/gestion/proveedores");
        revalidatePath("/compras");
        return { success: true, data: proveedor };
    } catch (error: any) {
        if (error.code === 'P2002') return { success: false, error: "El CIF ya está registrado." };
        return { success: false, error: "Error al actualizar el proveedor." };
    }
}

export async function deleteProveedor(id: string) {
    try {
        const count = await prisma.producto.count({ where: { proveedorId: id } });
        if (count > 0) return { success: false, error: `No se puede eliminar: tiene ${count} producto(s) asignados.` };
        await prisma.proveedor.delete({ where: { id } });
        revalidatePath("/gestion/proveedores");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Error al eliminar el proveedor." };
    }
}
