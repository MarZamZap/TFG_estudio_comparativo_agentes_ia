"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

import { dniValidation, telefonoValidation, emailValidation } from "@/lib/validations"
import { z } from "zod"

const clienteActionSchema = z.object({
    nombre: z.string().min(1, "El nombre es requerido"),
    apellido: z.string().min(1, "El apellido es requerido"),
    dni: dniValidation,
    telefono: telefonoValidation,
    email: emailValidation,
});

export async function createCliente(data: {
    nombre: string;
    apellido: string;
    dni?: string;
    telefono?: string;
    email?: string;
}) {
    try {
        const parsed = clienteActionSchema.safeParse(data);
        if (!parsed.success) {
            return { success: false, error: parsed.error.issues[0].message };
        }
        const validData = parsed.data;

        const cliente = await prisma.cliente.create({
            data: {
                nombre: validData.nombre,
                apellido: validData.apellido,
                dni: validData.dni,
                telefono: validData.telefono,
                email: validData.email,
            },
        });

        revalidatePath("/clientes");
        return { success: true, data: cliente };
    } catch (error) {
        console.error("Error creating cliente:", error);
        return { success: false, error: "Error al crear el cliente. Es posible que el DNI o Email ya existan." };
    }
}

export async function getCliente(id: string) {
    try {
        const cliente = await prisma.cliente.findUnique({
            where: { id },
            include: {
                graduaciones: {
                    orderBy: { fechaCreacion: 'desc' }
                }
            }
        });

        if (!cliente) {
            return { success: false, error: "Cliente no encontrado" };
        }

        return { success: true, data: cliente };
    } catch (error) {
        console.error("Error fetching cliente:", error);
        return { success: false, error: "Error al obtener el cliente" };
    }
}

export async function updateCliente(id: string, data: {
    nombre: string;
    apellido: string;
    dni?: string;
    telefono?: string;
    email?: string;
}) {
    try {
        const parsed = clienteActionSchema.safeParse(data);
        if (!parsed.success) {
            return { success: false, error: parsed.error.issues[0].message };
        }
        const validData = parsed.data;

        const cliente = await prisma.cliente.update({
            where: { id },
            data: {
                nombre: validData.nombre,
                apellido: validData.apellido,
                dni: validData.dni,
                telefono: validData.telefono,
                email: validData.email,
            },
        });

        revalidatePath("/clientes");
        revalidatePath(`/clientes/${id}`);
        return { success: true, data: cliente };
    } catch (error) {
        console.error("Error updating cliente:", error);
        return { success: false, error: "Error al actualizar el cliente. Es posible que el DNI o Email ya existan." };
    }
}
