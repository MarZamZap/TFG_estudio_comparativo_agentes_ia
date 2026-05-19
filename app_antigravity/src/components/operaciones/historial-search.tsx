"use client"

import { useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, Search, ShoppingCart, PackagePlus, ArrowRightLeft, ReceiptText } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

type Operacion = {
    id: string
    fecha: string
    tipo: string
    estado: string
    totalOperacion: number
    notas: string | null
    lineasCount: number
    cliente: { id: string; nombre: string } | null
    usuario: string
}

const TIPO_CONFIG: Record<string, { label: string; bg: string; text: string; icon: React.ElementType }> = {
    VENTA: { label: "Venta", bg: "bg-blue-50", text: "text-blue-700", icon: ShoppingCart },
    COMPRA: { label: "Compra", bg: "bg-emerald-50", text: "text-emerald-700", icon: PackagePlus },
    TRASPASO: { label: "Traspaso", bg: "bg-orange-50", text: "text-orange-700", icon: ArrowRightLeft },
}

const FILTROS = ["TODOS", "VENTA", "COMPRA", "TRASPASO"] as const
type Filtro = typeof FILTROS[number]

export function HistorialSearch({ operaciones }: { operaciones: Operacion[] }) {
    const [query, setQuery] = useState("")
    const [filtro, setFiltro] = useState<Filtro>("TODOS")

    const q = query.toLowerCase().trim()
    const filtradas = operaciones.filter(op => {
        const matchType = filtro === "TODOS" || op.tipo === filtro
        const matchQuery = !q || op.id.toLowerCase().includes(q) ||
            (op.cliente && op.cliente.nombre.toLowerCase().includes(q)) ||
            op.usuario.toLowerCase().includes(q)
        return matchType && matchQuery
    })

    if (operaciones.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-white border-dashed text-slate-500">
                <ReceiptText className="h-10 w-10 text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-800">No hay operaciones registradas</h3>
                <p className="max-w-sm mb-4">Comienza utilizando el TPV o el módulo de compras para registrar operaciones.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4 min-w-0">
            {/* Filtros y búsqueda */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Buscar por ID, cliente o usuario..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        className="pl-9 bg-white"
                    />
                </div>
                <div className="flex border rounded-lg overflow-hidden shadow-sm bg-white">
                    {FILTROS.map(f => {
                        const cfg = f !== "TODOS" ? TIPO_CONFIG[f] : null
                        const IconComp = cfg?.icon
                        return (
                            <button
                                key={f}
                                onClick={() => setFiltro(f)}
                                className={`px-4 py-2 text-sm font-medium flex items-center gap-1.5 transition-colors border-r last:border-r-0 ${filtro === f ? (cfg ? `${cfg.bg} ${cfg.text}` : 'bg-slate-800 text-white') : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                {IconComp && <IconComp className="h-3.5 w-3.5" />}
                                {cfg?.label ?? "Todos"}
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="border rounded-xl bg-white overflow-hidden shadow-sm ring-1 ring-slate-100">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Ticket / ID</TableHead>
                            <TableHead>Cliente / Origen</TableHead>
                            <TableHead>Atendido por</TableHead>
                            <TableHead>Líneas</TableHead>
                            <TableHead>Importe</TableHead>
                            <TableHead>Estado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtradas.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center text-slate-400 py-10">
                                    No se encontraron operaciones con los filtros actuales.
                                </TableCell>
                            </TableRow>
                        ) : filtradas.map(op => {
                            const cfg = TIPO_CONFIG[op.tipo] ?? TIPO_CONFIG.VENTA
                            const IconComp = cfg.icon
                            return (
                                <TableRow key={op.id} className="hover:bg-slate-50 transition-colors">
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-slate-400" />
                                            <div>
                                                <div className="font-medium text-slate-900 text-sm">
                                                    {new Date(op.fecha).toLocaleDateString('es-ES')}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {new Date(op.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full w-max ${cfg.bg} ${cfg.text}`}>
                                            <IconComp className="h-3 w-3" />{cfg.label}
                                        </span>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">
                                        <Link href={`/operaciones/historial/${op.id}`} className="text-indigo-600 hover:text-indigo-800 hover:underline font-semibold" title="Ver detalle de operación">
                                            #{op.id.slice(-8).toUpperCase()}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        {op.cliente ? (
                                            <Link href={`/clientes/${op.cliente.id}`} className="text-blue-600 hover:underline text-sm font-medium">
                                                {op.cliente.nombre}
                                            </Link>
                                        ) : (
                                            <span className="text-slate-400 italic text-sm">
                                                {op.tipo === "TRASPASO" ? "Traspaso Interno" : "Cliente Genérico"}
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-600">{op.usuario}</TableCell>
                                    <TableCell className="text-center">
                                        <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{op.lineasCount}</span>
                                    </TableCell>
                                    <TableCell className="font-bold text-slate-800">
                                        {op.tipo === "TRASPASO" ? (
                                            <span className="text-slate-400 text-sm">—</span>
                                        ) : (
                                            formatCurrency(op.totalOperacion)
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${op.estado === 'COMPLETADO' ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'}`}>
                                            {op.estado}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
            <p className="text-xs text-slate-400 text-right">{filtradas.length} de {operaciones.length} operaciones</p>
        </div>
    )
}
