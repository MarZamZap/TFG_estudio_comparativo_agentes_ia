import { Suspense } from "react"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { ArrowLeft, ArrowRightLeft } from "lucide-react"
import { TraspasoClient } from "@/components/traspasos/traspaso-client"

export const dynamic = "force-dynamic"

export default async function TraspasosPage() {
    const [tiendas, productos] = await Promise.all([
        prisma.tienda.findMany({ orderBy: { nombre: 'asc' } }),
        prisma.producto.findMany({
            include: {
                stocks: { select: { tiendaId: true, cantidad: true } }
            },
            orderBy: { nombre: 'asc' }
        })
    ])

    const serializedTiendas = tiendas.map(t => ({ id: t.id, nombre: t.nombre }))

    const serializedProductos = productos.map(p => ({
        id: p.id,
        nombre: p.nombre,
        codigoBarras: p.codigoBarras,
        stockPorTienda: p.stocks.map(s => ({ tiendaId: s.tiendaId, cantidad: s.cantidad }))
    }))

    return (
        <div className="flex flex-col gap-6 w-full max-w-[1600px] mx-auto p-4 md:p-8 animate-in fade-in duration-500 min-w-0">
            <div className="flex items-center gap-4 mb-2">
                <Link href="/" className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all text-slate-600 hover:text-orange-500">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div className="flex flex-col">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
                        <ArrowRightLeft className="w-6 h-6 text-orange-500" />
                        Traspasos entre Tiendas
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        Mueve stock de una tienda a otra. Los traspasos no generan movimiento de caja.
                    </p>
                </div>
            </div>

            <Suspense fallback={<div className="h-[60vh] flex items-center justify-center text-slate-400">Cargando...</div>}>
                <TraspasoClient tiendas={serializedTiendas} productos={serializedProductos} />
            </Suspense>
        </div>
    )
}
