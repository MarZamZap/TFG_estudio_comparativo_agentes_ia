"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Building2, Calendar, Filter } from "lucide-react"

export function EstadisticasFiltros({ tiendas }: { tiendas: { id: string, nombre: string }[] }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const currentTiendaId = searchParams.get("tiendaId") || ""
    const currentRango = searchParams.get("rango") || "mes"

    const updateFilters = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value) {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        router.push(`/estadisticas?${params.toString()}`)
    }

    return (
        <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-2 rounded-xl border shadow-sm w-full md:w-auto">
            <div className="flex items-center gap-2 px-3 h-10 w-full md:w-auto border-r border-slate-100">
                <Filter className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-500 hidden md:inline-block">Filtros:</span>
            </div>

            <div className="flex items-center gap-2 px-3 w-full md:w-auto">
                <Building2 className="h-4 w-4 text-slate-400" />
                <select
                    className="bg-transparent text-sm font-medium focus:outline-none text-slate-700 cursor-pointer w-full md:min-w-[160px]"
                    value={currentTiendaId}
                    onChange={(e) => updateFilters("tiendaId", e.target.value)}
                >
                    <option value="">Todas las Ópticas</option>
                    {tiendas.map(t => (
                        <option key={t.id} value={t.id}>{t.nombre}</option>
                    ))}
                </select>
            </div>

            <div className="hidden sm:block h-6 w-px bg-slate-200" />

            <div className="flex items-center gap-2 px-3 w-full md:w-auto">
                <Calendar className="h-4 w-4 text-slate-400" />
                <select
                    className="bg-transparent text-sm font-medium focus:outline-none text-slate-700 cursor-pointer w-full md:min-w-[140px]"
                    value={currentRango}
                    onChange={(e) => updateFilters("rango", e.target.value)}
                >
                    <option value="hoy">Hoy</option>
                    <option value="mes">Mes Actual</option>
                    <option value="trimestre">Últimos 3 Meses</option>
                    <option value="ano">Año Actual</option>
                </select>
            </div>
        </div>
    )
}
