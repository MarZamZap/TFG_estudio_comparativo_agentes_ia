import { verifySession } from "@/lib/session"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, Mail, ShieldCheck } from "lucide-react"

export default async function PerfilPage() {
    const { session } = await verifySession()

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h3 className="text-2xl font-semibold tracking-tight text-slate-800">Mi Perfil</h3>
                <p className="text-sm text-slate-500">
                    Información personal y credenciales de acceso.
                </p>
            </div>

            <Card className="shadow-sm border-0 ring-1 ring-slate-100">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-5 w-5 text-indigo-500" />
                        Datos del Usuario
                    </CardTitle>
                    <CardDescription>Esta es la información asociada a tu cuenta actual.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-[120px_1fr] border-b pb-3">
                        <span className="font-semibold text-slate-600 text-sm">Nombre:</span>
                        <span className="text-slate-800">{session?.nombre || "No disponible"}</span>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] border-b pb-3">
                        <span className="font-semibold text-slate-600 text-sm flex items-center gap-2">
                            <Mail className="h-4 w-4" /> Usuario:
                        </span>
                        <span className="text-slate-800">{session?.username || "No disponible"}</span>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] pt-1">
                        <span className="font-semibold text-slate-600 text-sm flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4" /> Rol/ID:
                        </span>
                        <span className="text-slate-800 text-sm font-mono bg-slate-100 px-2 py-0.5 rounded w-fit">{session?.usuarioId || "-"}</span>
                    </div>
                </CardContent>
            </Card>

        </div>
    )
}
