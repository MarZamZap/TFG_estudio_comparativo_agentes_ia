const { PrismaClient } = require('@prisma/client')
const crypto = require('crypto')

const prisma = new PrismaClient()

function hashPassword(password) {
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
        console.log("=========================================")
        console.log("CREDENCIALES DE PRUEBA GENERADAS CON EXITO")
        console.log("Usuario: admin")
        console.log("Contraseña: 123456")
        console.log("=========================================")
    } else {
        await prisma.usuario.update({
            where: { id: existing.id },
            data: { passwordHash }
        })
        console.log("=========================================")
        console.log("USUARIO EXISTENTE: CONTRASEÑA RESETEADA")
        console.log("Usuario: admin")
        console.log("Contraseña: 123456")
        console.log("=========================================")
    }
}
main()
    .then(() => process.exit(0))
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
