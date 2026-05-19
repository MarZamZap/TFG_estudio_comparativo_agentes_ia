"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import * as bcrypt from "bcryptjs"

import { verifySession } from "@/lib/session"

// Obtenemos la tienda desde la sesión
async function getTiendaId() {
    const { session } = await verifySession()
    if (!session?.tiendaId) {
        throw new Error("No authentificado")
    }
    return session.tiendaId
}

function hashPassword(password: string) {
    return bcrypt.hashSync(password, 10)
}

export async function getUsuarios() {
    try {
        const tiendaId = await getTiendaId()
        return await prisma.usuario.findMany({
            where: { tiendaId },
            orderBy: { nombre: 'asc' },
            select: {
                id: true,
                nombre: true,
                username: true,
                createdAt: true
            }
        })
    } catch (error) {
        console.error("Error fetching users:", error)
        throw new Error("Error al obtener los usuarios")
    }
}

export async function createUsuario(data: { nombre: string; username: string; password?: string }) {
    try {
        const tiendaId = await getTiendaId()
        const passwordHash = hashPassword(data.password || "123456") // default pwd
        const usuario = await prisma.usuario.create({
            data: {
                tiendaId,
                nombre: data.nombre,
                username: data.username,
                passwordHash
            }
        })

        revalidatePath("/admin/usuarios")
        return { success: true, data: { id: usuario.id, nombre: usuario.nombre, username: usuario.username } }
    } catch (error) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
            return { success: false, error: "El nombre de usuario ya está en uso" }
        }
        console.error("Error creating user:", error)
        return { success: false, error: "Error al crear el usuario" }
    }
}

export async function updateUsuario(id: string, data: { nombre: string; username: string; password?: string }) {
    try {
        const updateData: any = {
            nombre: data.nombre,
            username: data.username,
        }

        if (data.password) {
            updateData.passwordHash = hashPassword(data.password)
        }

        const usuario = await prisma.usuario.update({
            where: { id },
            data: updateData
        })

        revalidatePath("/admin/usuarios")
        return { success: true, data: { id: usuario.id, nombre: usuario.nombre, username: usuario.username } }
    } catch (error) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
            return { success: false, error: "El nombre de usuario ya está en uso" }
        }
        console.error("Error updating user:", error)
        return { success: false, error: "Error al actualizar el usuario" }
    }
}

export async function deleteUsuario(id: string) {
    try {
        // Check if user has operations
        const opsCount = await prisma.operacionCabecera.count({ where: { usuarioId: id } })
        if (opsCount > 0) {
            return { success: false, error: "No se puede eliminar porque tiene operaciones (ventas/compras) registradas" }
        }

        await prisma.usuario.delete({
            where: { id }
        })

        revalidatePath("/admin/usuarios")
        return { success: true }
    } catch (error) {
        console.error("Error deleting user:", error)
        return { success: false, error: "Error al eliminar el usuario" }
    }
}
