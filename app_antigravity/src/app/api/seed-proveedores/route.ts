import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        console.log("Iniciando migración de Proveedores...");

        // 1. Crear el Proveedor Genérico
        let proveedorGenerico = await prisma.proveedor.findFirst({ where: { cif: "GENERIC-001" } });
        if (!proveedorGenerico) {
            proveedorGenerico = await prisma.proveedor.create({
                data: {
                    nombre: "Proveedor Genérico S.L.",
                    cif: "GENERIC-001",
                    telefono: "900123456",
                    email: "contacto@proveedorgenerico.com",
                    direccion: "Calle Principal 123",
                }
            });
        }

        // 2. Crear Proveedor de Gafas
        let proveedorGafas = await prisma.proveedor.findFirst({ where: { cif: "LUXOTTICA-001" } });
        if (!proveedorGafas) {
            proveedorGafas = await prisma.proveedor.create({
                data: {
                    nombre: "Luxottica Group",
                    cif: "LUXOTTICA-001",
                    telefono: "912345678",
                    email: "pedidos@luxottica.com",
                    direccion: "Milán, Italia",
                }
            });
        }

        // 3. Obtener todos los productos y asignarles proveedor y coste si no tienen
        const productos = await prisma.producto.findMany();

        let actualizados = 0;
        for (const producto of productos) {
            const currentCoste = producto.coste ? Number(producto.coste) : 0;
            const currentPrecio = Number(producto.precio);

            const newCoste = currentCoste <= 0 ? (currentPrecio > 0 ? currentPrecio * 0.5 : 10) : currentCoste;

            const nombreBajo = producto.nombre.toLowerCase();
            const targetProveedorId = nombreBajo.includes('ray') || nombreBajo.includes('oak')
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

        return NextResponse.json({
            success: true,
            message: `Se han actualizado ${actualizados} productos con Proveedor y Coste Base validado.`,
            proveedores: [proveedorGenerico.nombre, proveedorGafas.nombre]
        });
    } catch (error: any) {
        console.error("Error validando proveedores:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
