"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Building2 } from "lucide-react"

export function TiendaSelector({ tiendas }: { tiendas: { id: string, nombre: string }[] }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const currentTiendaId = searchParams.get("tiendaId") || ""

    return (
        <div className="flex items-center gap-2 bg-white px-3 h-10 rounded-md border shadow-sm">
            <Building2 className="h-4 w-4 text-slate-400" />
            <select
                className="bg-transparent text-sm font-medium focus:outline-none text-slate-700 cursor-pointer min-w-[150px]"
                value={currentTiendaId}
                onChange={(e) => {
                    const val = e.target.value
                    if (val) {
                        router.push(`/inventario?tiendaId=${val}`)
                    } else {
                        router.push(`/inventario`)
                    }
                }}
            >
                <option value="">Todas las Tiendas</option>
                {tiendas.map(t => (
                    <option key={t.id} value={t.id}>{t.nombre}</option>
                ))}
            </select>
        </div>
    )
}
