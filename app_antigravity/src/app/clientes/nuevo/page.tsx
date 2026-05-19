import { ClienteForm } from "@/components/clientes/cliente-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NuevoClientePage() {
    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500 slide-in-from-bottom-4 min-w-0">
            <div className="flex items-center gap-4 mb-4">
                <Link href="/clientes" className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all text-slate-600 hover:text-blue-600">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div className="flex flex-col">
                    <h2 className="text-2xl font-bold tracking-tight">Alta de Paciente</h2>
                    <p className="text-muted-foreground text-sm">
                        Añade un nuevo paciente al sistema.
                    </p>
                </div>
            </div>

            <ClienteForm />
        </div>
    )
}
