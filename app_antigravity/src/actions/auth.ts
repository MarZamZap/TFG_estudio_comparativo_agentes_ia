"use server"

import prisma from "@/lib/prisma"
import * as bcrypt from "bcryptjs"
import { createSession, deleteSession } from "@/lib/session"

function hashPassword(password: string) {
    return bcrypt.hashSync(password, 10)
}

export async function loginAction(username: string, passwordString: string) {
    try {
        const user = await prisma.usuario.findUnique({
            where: { username },
            include: { tienda: true }
        })

        if (!user || !bcrypt.compareSync(passwordString, user.passwordHash)) {
            return { success: false, error: "Credenciales inválidas" }
        }

        // Crear JWT session cookie
        await createSession(user.id, user.tiendaId, user.username, user.nombre)

        return { success: true }
    } catch (error) {
        console.error("Login Error:", error)
        return { success: false, error: "Error interno del servidor" }
    }
}

export async function logoutAction() {
    await deleteSession()
}

// Utilidad para inicializar la BD si está vacía
export async function seedInitialAdminData() {
    try {
        const usersCount = await prisma.usuario.count()
        if (usersCount > 0) {
            return { success: false, error: "Ya existen usuarios. Seed no aplicable." }
        }

        let tienda = await prisma.tienda.findFirst()
        if (!tienda) {
            tienda = await prisma.tienda.create({
                data: {
                    nombre: "Óptica Principal TFG",
                    direccion: "Calle Principal 123",
                    telefono: "600100200"
                }
            })
        }

        const adminUsername = "admin"
        const passwordHash = hashPassword("admin")

        await prisma.usuario.create({
            data: {
                tiendaId: tienda.id,
                nombre: "Administrador del Sistema",
                username: adminUsername,
                passwordHash
            }
        })

        return { success: true, message: "Usuario admin / admin creado exitosamente" }
    } catch (error) {
        console.error("Seed Error:", error)
        return { success: false, error: "Error al crear datos semilla" }
    }
}
