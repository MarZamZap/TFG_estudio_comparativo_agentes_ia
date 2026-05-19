import { Suspense } from "react"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { PlusCircle, UserRound } from "lucide-react"
import { ClientesSearch } from "@/components/clientes/clientes-search"

export const dynamic = "force-dynamic";

async function ClientesContent() {
    const clientes = await prisma.cliente.findMany({
        orderBy: { apellido: 'asc' },
        select: { id: true, nombre: true, apellido: true, dni: true, telefono: true, email: true }
    });
    return <ClientesSearch clientes={clientes} />
}

export default function ClientesPage() {
    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500 min-w-0">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <UserRound className="h-7 w-7 text-blue-600" />
                        Clientes y Clínico
                    </h2>
                    <p className="text-muted-foreground">
                        Gestión de pacientes, historiales y graduaciones ópticas.
                    </p>
                </div>
                <Link href="/clientes/nuevo">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Nuevo Cliente
                    </Button>
                </Link>
            </div>

            <Suspense fallback={<div className="text-slate-400 p-8 text-center">Cargando clientes...</div>}>
                <ClientesContent />
            </Suspense>
        </div>
    )
}
