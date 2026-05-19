import { Suspense } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { ArrowLeft, Receipt, ShoppingCart, PackagePlus, ArrowRightLeft, Calendar, User, Store } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = "force-dynamic"

const TIPO_CONFIG: Record<string, { label: string; bg: string; text: string; icon: React.ElementType }> = {
    VENTA: { label: "Venta", bg: "bg-blue-50", text: "text-blue-700", icon: ShoppingCart },
    COMPRA: { label: "Compra", bg: "bg-emerald-50", text: "text-emerald-700", icon: PackagePlus },
    TRASPASO: { label: "Traspaso", bg: "bg-orange-50", text: "text-orange-700", icon: ArrowRightLeft },
}

export default async function OperacionDetallePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const operacion = await prisma.operacionCabecera.findUnique({
        where: { id },
        include: {
            tienda: true,
            usuario: true,
            cliente: true,
            lineas: {
                include: {
                    producto: {
                        select: { nombre: true, codigoBarras: true }
                    }
                }
            }
        }
    })

    if (!operacion) {
        notFound()
    }

    const cfg = TIPO_CONFIG[operacion.tipo] || TIPO_CONFIG.VENTA
    const IconComp = cfg.icon

    return (
        <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in duration-500 min-w-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border shadow-sm">
                <div className="flex items-start gap-4">
                    <Link href="/operaciones/historial" className="p-2 bg-slate-50 rounded-full shadow-sm hover:bg-slate-100 transition-colors text-slate-500 shrink-0">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
                                <Receipt className="w-6 h-6 text-slate-400" />
                                Operación #{operacion.id.slice(-8).toUpperCase()}
                            </h2>
                            <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
                                <IconComp className="h-3.5 w-3.5" />{cfg.label}
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            {new Date(operacion.fecha).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-xs text-slate-500 mb-1">Total Operación</span>
                    <span className="text-3xl font-black text-slate-800">
                        {operacion.tipo === "TRASPASO" ? "—" : formatCurrency(Number(operacion.totalOperacion))}
                    </span>
                    <div className="mt-2">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${operacion.estado === 'COMPLETADO' ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-amber-700 bg-amber-50 border border-amber-200'}`}>
                            {operacion.estado}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Detalles Info */}
                <Card className="md:col-span-1 shadow-sm border-0 ring-1 ring-slate-200 h-max">
                    <CardHeader className="bg-slate-50 border-b pb-4">
                        <CardTitle className="text-base text-slate-700 flex items-center gap-2">
                            Detalles
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 space-y-4">
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Atendido por</span>
                            <div className="flex items-center gap-2 text-slate-700 font-medium">
                                <User className="h-4 w-4 text-slate-400" />
                                {operacion.usuario.nombre}
                            </div>
                        </div>
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Sucursal origen</span>
                            <div className="flex items-center gap-2 text-slate-700 font-medium">
                                <Store className="h-4 w-4 text-slate-400" />
                                {operacion.tienda.nombre}
                            </div>
                        </div>
                        {operacion.tipo !== "TRASPASO" && (
                            <div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Cliente Asociado</span>
                                <div className="text-slate-700 font-medium">
                                    {operacion.cliente ? (
                                        <Link href={`/clientes/${operacion.cliente.id}`} className="text-indigo-600 hover:underline">
                                            {operacion.cliente.nombre} {operacion.cliente.apellido}
                                        </Link>
                                    ) : (
                                        <span className="text-slate-400 italic">Mostrador (Genérico)</span>
                                    )}
                                </div>
                            </div>
                        )}
                        {operacion.notas && (
                            <div className="pt-4 border-t border-slate-100">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Notas</span>
                                <p className="text-sm text-slate-600">{operacion.notas}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Líneas de Operación */}
                <Card className="md:col-span-2 shadow-sm border-0 ring-1 ring-slate-200">
                    <CardHeader className="bg-slate-50 border-b pb-4 flex flex-row items-center justify-between">
                        <CardTitle className="text-base text-slate-700">Líneas de Producto</CardTitle>
                        <span className="text-sm font-medium text-slate-500">{operacion.lineas.length} items</span>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-white">
                                    <TableRow>
                                        <TableHead>Producto</TableHead>
                                        <TableHead className="text-right w-24">Cant.</TableHead>
                                        <TableHead className="text-right w-32">Precio Unit.</TableHead>
                                        <TableHead className="text-right w-32">Subtotal</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {operacion.lineas.map((linea) => (
                                        <TableRow key={linea.id} className="hover:bg-slate-50">
                                            <TableCell>
                                                <div className="font-semibold text-slate-800">{linea.producto.nombre}</div>
                                                <div className="text-xs text-slate-400 font-mono mt-0.5">{linea.producto.codigoBarras || 'S/N'}</div>
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-slate-600">
                                                {linea.cantidad}
                                            </TableCell>
                                            <TableCell className="text-right text-slate-600">
                                                {formatCurrency(Number(linea.precioUnitario))}
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-slate-800">
                                                {formatCurrency(Number(linea.subtotal))}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {operacion.lineas.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center text-slate-400">
                                                No hay líneas asociadas a esta operación.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
