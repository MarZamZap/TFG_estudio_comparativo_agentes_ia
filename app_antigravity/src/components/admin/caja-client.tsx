"use client"

import { useState } from "react"
import { formatCurrency } from "@/lib/utils"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search, TrendingUp, TrendingDown, Wallet } from "lucide-react"

type Movimiento = {
    id: string;
    fecha: string;
    tipoMovimiento: string;
    monto: number;
    concepto: string;
    operacionToken: string | null;
    responsable: string;
}

interface CajaClientProps {
    movimientos: Movimiento[];
    ingresos: number;
    egresos: number;
    balance: number;
}

export function CajaClient({ movimientos, ingresos, egresos, balance }: CajaClientProps) {
    const [busqueda, setBusqueda] = useState("")

    const filtrados = movimientos.filter(
        m => m.concepto.toLowerCase().includes(busqueda.toLowerCase()) ||
            m.responsable.toLowerCase().includes(busqueda.toLowerCase())
    )

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500 min-w-0">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-6 border shadow-sm flex items-center gap-4 border-l-4 border-l-emerald-500">
                    <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
                        <TrendingUp className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Ingresos Totales (Ventas)</p>
                        <h4 className="text-2xl font-bold text-slate-800">{formatCurrency(ingresos)}</h4>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 border shadow-sm flex items-center gap-4 border-l-4 border-l-rose-500">
                    <div className="p-3 bg-rose-50 rounded-lg text-rose-600">
                        <TrendingDown className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Egresos Totales (Compras)</p>
                        <h4 className="text-2xl font-bold text-slate-800">{formatCurrency(egresos)}</h4>
                    </div>
                </div>

                <div className={`bg-white rounded-xl p-6 border shadow-sm flex items-center gap-4 border-l-4 ${balance >= 0 ? 'border-l-indigo-500' : 'border-l-rose-500'}`}>
                    <div className={`p-3 rounded-lg ${balance >= 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'}`}>
                        <Wallet className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Balance Neto Absoluto</p>
                        <h4 className={`text-2xl font-bold ${balance >= 0 ? 'text-indigo-700' : 'text-rose-600'}`}>
                            {formatCurrency(balance)}
                        </h4>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-slate-50/50 flex flex-col sm:flex-row items-center gap-4 justify-between">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Buscar en historial por concepto o usuario..."
                            className="pl-9 bg-white"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50">
                                <TableHead className="w-[180px]">Fecha</TableHead>
                                <TableHead>Responsable</TableHead>
                                <TableHead>Concepto / Referencia</TableHead>
                                <TableHead className="text-center">Flujo</TableHead>
                                <TableHead className="text-right">Monto Unitario</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtrados.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                                        No se encontraron movimientos registrados en caja.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtrados.map((mov) => (
                                    <TableRow key={mov.id}>
                                        <TableCell>
                                            <div className="font-medium">{new Date(mov.fecha).toLocaleDateString()}</div>
                                            <div className="text-xs text-slate-500">{new Date(mov.fecha).toLocaleTimeString()}</div>
                                        </TableCell>
                                        <TableCell className="text-sm font-medium text-slate-700">
                                            {mov.responsable}
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm">{mov.concepto}</span>
                                            {mov.operacionToken && (
                                                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                                    Ref: {mov.operacionToken.slice(-8).toUpperCase()}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className={`px-2 py-1 text-[10px] uppercase font-bold rounded-full border ${mov.tipoMovimiento === 'INGRESO'
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                : 'bg-rose-50 text-rose-700 border-rose-200'
                                                }`}>
                                                {mov.tipoMovimiento}
                                            </span>
                                        </TableCell>
                                        <TableCell className={`text-right font-bold ${mov.tipoMovimiento === 'INGRESO' ? 'text-emerald-600' : 'text-rose-600'
                                            }`}>
                                            {mov.tipoMovimiento === 'INGRESO' ? '+' : '-'}{formatCurrency(mov.monto)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}
