import { Suspense } from "react"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { formatCurrency } from "@/lib/utils"
import { ArrowLeft, ReceiptText } from "lucide-react"
import { HistorialSearch } from "@/components/operaciones/historial-search"

export const dynamic = "force-dynamic"

async function HistorialContent() {
    const operaciones = await prisma.operacionCabecera.findMany({
        orderBy: { fecha: 'desc' },
        take: 200,
        include: {
            cliente: { select: { id: true, nombre: true, apellido: true } },
            usuario: { select: { nombre: true } },
            lineas: { select: { id: true } }
        }
    })

    const serialized = operaciones.map(op => ({
        id: op.id,
        fecha: op.fecha.toISOString(),
        tipo: op.tipo,
        estado: op.estado,
        totalOperacion: Number(op.totalOperacion),
        notas: op.notas,
        lineasCount: op.lineas.length,
        cliente: op.cliente ? { id: op.cliente.id, nombre: `${op.cliente.nombre} ${op.cliente.apellido}` } : null,
        usuario: op.usuario.nombre
    }))

    return <HistorialSearch operaciones={serialized} />
}

export default function HistorialOperacionesPage() {
    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500 min-w-0">
            <div className="flex items-center gap-4 mb-2">
                <Link href="/operaciones" className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all text-slate-600 hover:text-indigo-600">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div className="flex flex-col">
                    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <ReceiptText className="h-6 w-6 text-indigo-600" />
                        Historial de Operaciones
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        Consulta ventas, compras y traspasos registrados en el sistema.
                    </p>
                </div>
            </div>

            <Suspense fallback={<div className="border rounded-md bg-white p-12 flex justify-center text-slate-400">Cargando historial...</div>}>
                <HistorialContent />
            </Suspense>
        </div>
    )
}
