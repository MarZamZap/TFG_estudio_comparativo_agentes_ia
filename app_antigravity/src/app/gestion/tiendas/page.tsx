import prisma from "@/lib/prisma"
import { TiendasClient } from "@/components/admin/tiendas-client"

export const dynamic = "force-dynamic";

export default async function TiendasPage() {
    const tiendas = await prisma.tienda.findMany({
        include: {
            _count: {
                select: {
                    usuarios: true,
                    operaciones: true,
                }
            }
        },
        orderBy: { nombre: 'asc' }
    });

    const serialized = tiendas.map(t => ({
        id: t.id,
        nombre: t.nombre,
        direccion: t.direccion,
        telefono: t.telefono,
        _count: t._count
    }));

    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500 min-w-0">
            <TiendasClient tiendas={serialized} />
        </div>
    )
}
