import prisma from "@/lib/prisma"
import { VentasClient } from "@/components/ventas/ventas-client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ListCollapse } from "lucide-react"
import { TiendaSelectorInline } from "@/components/inventario/tienda-selector-inline"

export const dynamic = "force-dynamic";

export default async function OperacionesPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    try {
        const params = await searchParams;
        const selectedTiendaId = typeof params.tiendaId === 'string' ? params.tiendaId : undefined;

        // Get all stores for the selector
        const allTiendas = await prisma.tienda.findMany({
            select: { id: true, nombre: true },
            orderBy: { nombre: 'asc' }
        });

        // Get the logged-in user
        const usuario = await prisma.usuario.findFirst({
            include: { tienda: true }
        });

        if (!usuario) {
            return (
                <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto p-4 md:p-8 min-w-0">
                    <div className="bg-red-50 text-red-600 p-4 rounded-md font-medium border border-red-200">
                        Error Crítico: No hay usuarios registrados en la base de datos.
                    </div>
                </div>
            )
        }

        // Use selected store or fallback to user's store
        const activeTiendaId = selectedTiendaId || usuario.tiendaId;
        const activeTienda = allTiendas.find(t => t.id === activeTiendaId) || { id: usuario.tiendaId, nombre: usuario.tienda.nombre };

        // Load products with stock for the ACTIVE store
        const productosRaw = await prisma.producto.findMany({
            where: { stocks: { some: { tiendaId: activeTiendaId } } },
            include: {
                stocks: { where: { tiendaId: activeTiendaId } }
            },
            orderBy: { nombre: 'asc' }
        });

        const productos = productosRaw.map(prod => ({
            id: prod.id,
            nombre: prod.nombre,
            precio: Number(prod.precio),
            codigoBarras: prod.codigoBarras,
            stockDisponible: prod.stocks.length > 0 ? prod.stocks[0].cantidad : 0
        }));

        const clientes = await prisma.cliente.findMany({
            select: { id: true, nombre: true, apellido: true, dni: true },
            orderBy: { nombre: 'asc' }
        });

        return (
            <div className="flex flex-col gap-6 w-full max-w-[1600px] mx-auto p-4 md:p-6 animate-in fade-in duration-500 min-w-0">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-800">Terminal de Venta (TPV)</h2>
                        <div className="text-muted-foreground flex items-center gap-2 flex-wrap">
                            <span>Tienda activa:</span>
                            <TiendaSelectorInline tiendas={allTiendas} currentTiendaId={activeTiendaId} basePath="/operaciones" />
                            <span>• Cajero: {usuario.nombre}</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/operaciones/historial">
                            <Button variant="outline" className="bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300">
                                <ListCollapse className="mr-2 h-4 w-4" />
                                Historial de Ventas
                            </Button>
                        </Link>
                    </div>
                </div>

                <VentasClient
                    productos={productos}
                    clientes={clientes}
                    usuarioId={usuario.id}
                    tiendaId={activeTiendaId}
                />
            </div>
        )
    } catch (error) {
        console.error("Error at OperacionesPage:", error)
        return (
            <div className="p-8 text-red-500">
                Error de base de datos o inicialización. Revise terminal.
            </div>
        )
    }
}
