import { Suspense } from "react"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { getProveedores } from "@/actions/proveedor"
import { ComprasClient } from "@/components/ventas/compras-client"
import { ArrowLeft, PackagePlus } from "lucide-react"
import { TiendaSelectorInline } from "@/components/inventario/tienda-selector-inline"

export const dynamic = "force-dynamic";

export default async function ComprasPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const params = await searchParams;
    const selectedTiendaId = typeof params.tiendaId === 'string' ? params.tiendaId : undefined;

    const allTiendas = await prisma.tienda.findMany({
        select: { id: true, nombre: true },
        orderBy: { nombre: 'asc' }
    });

    // Get active store (selected or first available)
    const usuario = await prisma.usuario.findFirst({ select: { tiendaId: true } });
    const activeTiendaId = selectedTiendaId || usuario?.tiendaId || allTiendas[0]?.id || '';
    const activeTienda = allTiendas.find(t => t.id === activeTiendaId);

    const resProveedores = await getProveedores();
    const proveedoresRaw = resProveedores.success ? resProveedores.data : [];

    // Get products with stock for this specific store
    const productosRaw = await prisma.producto.findMany({
        include: {
            stocks: { where: { tiendaId: activeTiendaId } },
            proveedor: { select: { id: true } }
        },
        orderBy: { nombre: 'asc' }
    });

    const serializedProductos = productosRaw.map(p => ({
        id: p.id,
        nombre: p.nombre,
        coste: p.coste ? p.coste.toString() : "0",
        codigoBarras: p.codigoBarras,
        stockDisponible: p.stocks[0]?.cantidad || 0,
        proveedorId: p.proveedorId || ""
    }));

    const serializedProveedores = proveedoresRaw?.map(prov => ({
        id: prov.id,
        nombre: prov.nombre
    })) || [];

    return (
        <div className="flex flex-col gap-6 w-full max-w-[1600px] mx-auto p-4 md:p-8 animate-in fade-in duration-500 min-w-0">
            <div className="flex items-center gap-4 mb-2">
                <Link href="/" className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all text-slate-600 hover:text-emerald-600">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div className="flex flex-col">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
                        <PackagePlus className="w-6 h-6 text-emerald-600" />
                        Entrada de Mercancía (Compras)
                    </h2>
                    <p className="text-muted-foreground text-sm flex items-center gap-2 flex-wrap">
                        <span>Recepción para:</span>
                        <TiendaSelectorInline tiendas={allTiendas} currentTiendaId={activeTiendaId} basePath="/compras" />
                    </p>
                </div>
            </div>

            <Suspense fallback={<div className="h-[60vh] flex items-center justify-center text-slate-400">Cargando catálogo...</div>}>
                <ComprasClient productos={serializedProductos} proveedores={serializedProveedores} />
            </Suspense>
        </div>
    )
}
