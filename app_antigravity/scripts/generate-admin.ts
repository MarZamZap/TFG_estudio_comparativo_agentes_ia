import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

function hashPassword(password: string) {
    return crypto.createHash('sha256').update(password).digest('hex')
}

async function main() {
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
    const passwordHash = hashPassword("123456")

    const existing = await prisma.usuario.findFirst({ where: { username: "admin" } })
    if (!existing) {
        await prisma.usuario.create({
            data: {
                tiendaId: tienda.id,
                nombre: "Administrador del Sistema",
                username: adminUsername,
                passwordHash
            }
        })
        console.log("SUCCESS: admin created")
    } else {
        await prisma.usuario.update({
            where: { id: existing.id },
            data: { passwordHash }
        })
        console.log("SUCCESS: admin existing pswd reset")
    }
}
main()
    .then(() => process.exit(0))
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
