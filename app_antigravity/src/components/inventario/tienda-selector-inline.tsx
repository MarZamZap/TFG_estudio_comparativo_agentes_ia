"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Building2 } from "lucide-react"

export function TiendaSelectorInline({ tiendas, currentTiendaId, basePath }: {
    tiendas: { id: string, nombre: string }[],
    currentTiendaId: string,
    basePath: string
}) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const handleChange = (tiendaId: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (tiendaId) {
            params.set("tiendaId", tiendaId)
        } else {
            params.delete("tiendaId")
        }
        router.push(`${basePath}?${params.toString()}`)
    }

    return (
        <span className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 rounded-lg px-2 py-0.5">
            <Building2 className="h-3.5 w-3.5 text-indigo-500" />
            <select
                className="bg-transparent text-sm font-semibold text-indigo-700 focus:outline-none cursor-pointer"
                value={currentTiendaId}
                onChange={(e) => handleChange(e.target.value)}
            >
                {tiendas.map(t => (
                    <option key={t.id} value={t.id}>{t.nombre}</option>
                ))}
            </select>
        </span>
    )
}
