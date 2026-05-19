import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Iniciando migración de Proveedores...");

    // 1. Crear el Proveedor Genérico
    const proveedorGenerico = await prisma.proveedor.upsert({
        where: { cif: "GENERIC-001" },
        update: {},
        create: {
            nombre: "Proveedor Genérico S.L.",
            cif: "GENERIC-001",
            telefono: "900123456",
            email: "contacto@proveedorgenerico.com",
            direccion: "Calle Principal 123",
        }
    });
    console.log(`Proveedor genérico creado/encontrado: ${proveedorGenerico.nombre}`);

    // 2. Crear Proveedor de Gafas
    const proveedorGafas = await prisma.proveedor.upsert({
        where: { cif: "LUXOTTICA-001" },
        update: {},
        create: {
            nombre: "Luxottica Group",
            cif: "LUXOTTICA-001",
            telefono: "912345678",
            email: "pedidos@luxottica.com",
            direccion: "Milán, Italia",
        }
    });

    // 3. Obtener todos los productos y asignarles proveedor y coste si no tienen
    const productos = await prisma.producto.findMany();

    let actualizados = 0;
    for (const producto of productos) {
        // Fijar un coste estimado base (ej. 50% del precio de venta actual) si es 0, null o muy bajo
        const currentCoste = producto.coste ? Number(producto.coste) : 0;
        const currentPrecio = Number(producto.precio);

        const newCoste = currentCoste <= 0 ? (currentPrecio > 0 ? currentPrecio * 0.5 : 10) : currentCoste;

        // Si no tiene proveedor, le asignamos uno. 
        // Lógica simple: si su nombre contiene "Ray" o "Oakley", a Luxottica, sino al genérico.
        // Como no tenemos el código fuente de los nombres, simplificamos:
        const targetProveedorId = producto.nombre.toLowerCase().includes('ray') || producto.nombre.toLowerCase().includes('oak')
            ? proveedorGafas.id
            : proveedorGenerico.id;

        await prisma.producto.update({
            where: { id: producto.id },
            data: {
                proveedorId: producto.proveedorId || targetProveedorId,
                coste: newCoste
            }
        });
        actualizados++;
    }

    console.log(`Se han actualizado ${actualizados} productos con Proveedor y Coste Base validado.`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
