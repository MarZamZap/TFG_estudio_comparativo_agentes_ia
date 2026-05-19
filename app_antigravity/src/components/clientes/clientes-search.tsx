"use client"

import { useState } from "react"
import Link from "next/link"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, UserRound, PlusCircle } from "lucide-react"

type Cliente = {
    id: string
    nombre: string
    apellido: string
    dni: string | null
    telefono: string | null
    email: string | null
}

export function ClientesSearch({ clientes }: { clientes: Cliente[] }) {
    const [query, setQuery] = useState("")

    const q = query.toLowerCase().trim()
    const filtrados = q === ""
        ? clientes
        : clientes.filter(c =>
            `${c.nombre} ${c.apellido}`.toLowerCase().includes(q) ||
            (c.dni && c.dni.toLowerCase().includes(q)) ||
            (c.telefono && c.telefono.includes(q)) ||
            (c.email && c.email.toLowerCase().includes(q))
        )

    if (clientes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl bg-white border-dashed text-slate-500">
                <div className="bg-blue-50 text-blue-500 p-3 rounded-full mb-3">
                    <UserRound className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">No hay clientes registrados</h3>
                <p className="text-muted-foreground text-sm max-w-sm mb-4">
                    Añade el primer cliente para comenzar a gestionar sus graduaciones e historial clínico.
                </p>
                <Link href="/clientes/nuevo">
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />Añadir Cliente
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4 min-w-0">
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                    placeholder="Buscar por nombre, DNI, teléfono o email..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    className="pl-9 bg-white"
                />
            </div>

            <div className="border rounded-xl bg-white overflow-hidden shadow-sm ring-1 ring-slate-100">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>DNI</TableHead>
                            <TableHead>Teléfono</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtrados.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-slate-400 py-10">
                                    No se encontraron coincidencias para &quot;{query}&quot;
                                </TableCell>
                            </TableRow>
                        ) : filtrados.map(cliente => (
                            <TableRow key={cliente.id} className="hover:bg-slate-50 transition-colors">
                                <TableCell className="font-semibold text-slate-800">
                                    {cliente.nombre} {cliente.apellido}
                                </TableCell>
                                <TableCell className="text-slate-500 font-mono text-sm">{cliente.dni || "—"}</TableCell>
                                <TableCell className="text-slate-600 text-sm">{cliente.telefono || "—"}</TableCell>
                                <TableCell className="text-slate-600 text-sm">{cliente.email || "—"}</TableCell>
                                <TableCell className="text-right">
                                    <Link href={`/clientes/${cliente.id}`}>
                                        <Button variant="ghost" size="sm">Ver Perfil →</Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <p className="text-xs text-slate-400 text-right">{filtrados.length} de {clientes.length} clientes</p>
        </div>
    )
}
