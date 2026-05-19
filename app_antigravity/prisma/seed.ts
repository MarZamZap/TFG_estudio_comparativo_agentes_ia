import prisma from '../src/lib/prisma'
import { Prisma } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

async function main() {
    console.log('🌱 Start seeding...')

    // Clean the database
    await prisma.operacionLinea.deleteMany()
    await prisma.cajaMovimiento.deleteMany()
    await prisma.operacionCabecera.deleteMany()
    await prisma.clienteGraduacion.deleteMany()
    await prisma.productoAtributos.deleteMany()
    await prisma.stock.deleteMany()
    await prisma.producto.deleteMany()
    await prisma.categoria.deleteMany()
    await prisma.proveedor.deleteMany()
    await prisma.iaLogConsulta.deleteMany()
    await prisma.usuario.deleteMany()
    await prisma.cliente.deleteMany()
    await prisma.tienda.deleteMany()

    // 1. Create Stores (Tiendas)
    const tienda1 = await prisma.tienda.create({
        data: {
            nombre: 'Óptica Principal Centro',
            direccion: 'C/ Gran Vía, 12, Madrid',
            telefono: '912345678',
        },
    })
    const tienda2 = await prisma.tienda.create({
        data: {
            nombre: 'Óptica Norte',
            direccion: 'Av. Castellana, 100, Madrid',
            telefono: '915555555',
        },
    })
    console.log(`Tiendas creadas: ${tienda1.nombre}, ${tienda2.nombre}`)

    // 2. Create Users
    const admin = await prisma.usuario.create({
        data: {
            nombre: 'Administrador Principal',
            username: 'admin',
            passwordHash: bcrypt.hashSync('admin123', 10),
            tiendaId: tienda1.id,
        },
    })
    const employee1 = await prisma.usuario.create({
        data: {
            nombre: 'Óptico Juan Pérez',
            username: 'jperez',
            passwordHash: bcrypt.hashSync('hashedpassword123', 10),
            tiendaId: tienda1.id,
        },
    })
    const employee2 = await prisma.usuario.create({
        data: {
            nombre: 'Óptica María Gómez',
            username: 'mgomez',
            passwordHash: bcrypt.hashSync('hashedpassword123', 10),
            tiendaId: tienda2.id,
        },
    })
    console.log(`Usuarios creados: ${admin.username}, ${employee1.username}, ${employee2.username}`)

    // 3. Create Clients
    const clientesData = [
        { nombre: 'Ana', apellido: 'García', dni: '12345678A', telefono: '+34600123456', email: 'ana.garcia@email.com' },
        { nombre: 'Carlos', apellido: 'Martínez', dni: '87654321B', telefono: '611987654', email: 'carlos.m@email.com' },
        { nombre: 'Elena', apellido: 'López', dni: '45678912C', telefono: '622345678', email: 'elena.lopez@email.com' }
    ]

    const clientes = []
    for (const clientData of clientesData) {
        const client = await prisma.cliente.create({ data: clientData })
        clientes.push(client)
    }
    console.log(`Creados ${clientes.length} clientes`)

    // 4. Create Prescriptions (Graduaciones)
    for (const cliente of clientes) {
        await prisma.clienteGraduacion.create({
            data: {
                clienteId: cliente.id,
                odEsfera: -1.5, odCilindro: -0.5, odEje: 180, odAdicion: 0, odAgudezaVisual: '1.0',
                oiEsfera: -1.25, oiCilindro: -0.25, oiEje: 175, oiAdicion: 0, oiAgudezaVisual: '1.0',
                distanciaInter: 62.5, notas: 'Revisión anual rutinaria.',
            }
        })
    }
    console.log('Graduaciones creadas')

    // 5. Create Categories
    const catMonturas = await prisma.categoria.create({ data: { nombre: 'Monturas' } })
    const catLentes = await prisma.categoria.create({ data: { nombre: 'Lentes Oftálmicas' } })
    const catContacto = await prisma.categoria.create({ data: { nombre: 'Lentes de Contacto' } })

    // 6. Create Proveedores
    const provLuxottica = await prisma.proveedor.create({
        data: { nombre: 'Luxottica Group', cif: 'B12345678', telefono: '900123456', email: 'pedidos@luxottica.com' }
    })
    const provEssilor = await prisma.proveedor.create({
        data: { nombre: 'Essilor', cif: 'A87654321', telefono: '900987654', email: 'contacto@essilor.com' }
    })
    console.log(`Proveedores creados`)

    // 7. Create Products, Attributes and Stock
    const productosData = [
        { cat: catMonturas.id, prov: provLuxottica.id, nombre: 'Ray-Ban Wayfarer Classic', precio: 125.0, coste: 60.0, stockT1: 10, stockT2: 5, attr: { marca: 'Ray-Ban', modelo: 'Wayfarer', color: 'Negro', material: 'Acetato' } },
        { cat: catMonturas.id, prov: provLuxottica.id, nombre: 'Oakley Holbrook', precio: 110.5, coste: 55.0, stockT1: 8, stockT2: 2, attr: { marca: 'Oakley', modelo: 'Holbrook', color: 'Mate Negro', material: 'O-Matter' } },
        { cat: catLentes.id, prov: provEssilor.id, nombre: 'Lente Monofocal 1.5 MS', precio: 35.0, coste: 10.0, stockT1: 100, stockT2: 50, attr: { marca: 'Essilor', modelo: 'Orma 1.5', material: 'Orgánico' } },
        { cat: catContacto.id, prov: null, nombre: 'Acuvue Oasys 1-Day', precio: 29.5, coste: 15.0, stockT1: 40, stockT2: 20, attr: { marca: 'Acuvue', modelo: 'Oasys 1-Day', material: 'Hidrogel de Silicona' } }
    ]

    const productos = []
    for (const p of productosData) {
        const prd = await prisma.producto.create({
            data: {
                categoriaId: p.cat,
                proveedorId: p.prov,
                nombre: p.nombre,
                precio: new Prisma.Decimal(p.precio),
                coste: new Prisma.Decimal(p.coste),
                codigoBarras: `EAN${Math.floor(Math.random() * 1000000000)}`
            }
        })
        productos.push(prd)

        await prisma.productoAtributos.create({
            data: {
                productoId: prd.id,
                marca: p.attr.marca,
                modelo: p.attr.modelo,
                color: p.attr.color,
                material: p.attr.material
            }
        })

        await prisma.stock.create({
            data: { tiendaId: tienda1.id, productoId: prd.id, cantidad: p.stockT1, stockMinimoAlerta: 5 }
        })
        await prisma.stock.create({
            data: { tiendaId: tienda2.id, productoId: prd.id, cantidad: p.stockT2, stockMinimoAlerta: 5 }
        })
    }
    console.log(`Creados ${productos.length} productos con atributos y stock en ambas tiendas`)

    // 8. Create Operations (Ventas, Compras, Traspasos) and CajaMovimientos
    
    // --- VENTA (Tienda 1) ---
    const v1 = await prisma.operacionCabecera.create({
        data: {
            tiendaId: tienda1.id, usuarioId: employee1.id, clienteId: clientes[0].id,
            tipo: 'VENTA', estado: 'COMPLETADO', totalOperacion: new Prisma.Decimal(160.0), notas: 'Venta normal',
            lineas: {
                create: [
                    { productoId: productos[0].id, cantidad: 1, precioUnitario: new Prisma.Decimal(125.0), subtotal: new Prisma.Decimal(125.0) },
                    { productoId: productos[2].id, cantidad: 1, precioUnitario: new Prisma.Decimal(35.0), subtotal: new Prisma.Decimal(35.0) }
                ]
            }
        }
    })
    await prisma.cajaMovimiento.create({
        data: {
            tiendaId: tienda1.id, operacionId: v1.id, tipoMovimiento: 'INGRESO', monto: new Prisma.Decimal(160.0), concepto: 'Pago venta ticket'
        }
    })

    // --- COMPRA (Tienda 1 a Proveedor Luxottica) ---
    const c1 = await prisma.operacionCabecera.create({
        data: {
            tiendaId: tienda1.id, usuarioId: admin.id,
            tipo: 'COMPRA', estado: 'COMPLETADO', totalOperacion: new Prisma.Decimal(120.0), notas: 'Reposición de monturas',
            lineas: {
                create: [
                    { productoId: productos[0].id, cantidad: 2, precioUnitario: new Prisma.Decimal(60.0), subtotal: new Prisma.Decimal(120.0) }
                ]
            }
        }
    })
    await prisma.cajaMovimiento.create({
        data: {
            tiendaId: tienda1.id, operacionId: c1.id, tipoMovimiento: 'EGRESO', monto: new Prisma.Decimal(120.0), concepto: 'Pago factura proveedor Luxottica'
        }
    })

    // --- TRASPASO (Tienda 1 a Tienda 2) ---
    await prisma.operacionCabecera.create({
        data: {
            tiendaId: tienda1.id, usuarioId: employee1.id,
            tipo: 'TRASPASO', estado: 'COMPLETADO', totalOperacion: new Prisma.Decimal(0), notas: 'Traspaso de lentes a Tienda 2',
            lineas: {
                create: [
                    { productoId: productos[2].id, cantidad: 5, precioUnitario: new Prisma.Decimal(0), subtotal: new Prisma.Decimal(0) }
                ]
            }
        }
    })

    console.log(`Operaciones de prueba (Venta, Compra, Traspaso) y Movimientos de Caja creados`)

    // 9. Create IaLogConsulta
    await prisma.iaLogConsulta.create({
        data: {
            usuarioId: admin.id,
            consulta: '¿Cuál es el producto más vendido este mes?',
            respuesta: 'El producto más vendido este mes es el Ray-Ban Wayfarer Classic con 15 unidades.',
        }
    })
    await prisma.iaLogConsulta.create({
        data: {
            usuarioId: employee1.id,
            consulta: '¿Tenemos stock de Oakley Holbrook en la otra tienda?',
            respuesta: 'Sí, la Óptica Norte dispone de 2 unidades en stock.',
        }
    })
    console.log(`Logs de IA creados`)

    console.log('✅ Seeding completed!')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
