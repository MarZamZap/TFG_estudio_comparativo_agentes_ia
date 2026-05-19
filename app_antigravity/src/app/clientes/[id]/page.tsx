import { notFound } from "next/navigation"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { getCliente } from "@/actions/cliente"
import { NuevaGraduacionModal } from "@/components/clientes/graduacion-form"
import { EditClienteModal } from "@/components/clientes/edit-cliente-modal"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, User, Phone, Mail, Hash, Calendar, Eye } from "lucide-react"

interface PageProps {
    params: Promise<{ id: string }>
}

export const dynamic = "force-dynamic";

export default async function ClienteDetailPage({ params }: PageProps) {
    const { id } = await params;
    const result = await getCliente(id)

    if (!result.success || !result.data) {
        notFound()
    }

    const cliente = result.data

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500 slide-in-from-bottom-4 min-w-0">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4">
                    <Link href="/clientes" className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all text-slate-600 hover:text-blue-600">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div className="flex flex-col">
                        <h2 className="text-2xl font-bold tracking-tight">{cliente.nombre} {cliente.apellido}</h2>
                        <p className="text-muted-foreground text-sm">
                            Perfil e historial clínico del paciente
                        </p>
                    </div>
                </div>
                <NuevaGraduacionModal clienteId={cliente.id} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Info Card */}
                <Card className="md:col-span-1 border-0 shadow-lg bg-white/80 backdrop-blur-md h-fit">
                    <CardHeader className="bg-slate-50/50 border-b pb-4 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <User className="h-5 w-5 text-blue-500" />
                            Datos Personales
                        </CardTitle>
                        <EditClienteModal cliente={{
                            id: cliente.id,
                            nombre: cliente.nombre,
                            apellido: cliente.apellido,
                            dni: cliente.dni,
                            telefono: cliente.telefono,
                            email: cliente.email
                        }} />
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-slate-500 uppercase font-semibold">DNI / Pasaporte</span>
                            <span className="flex items-center gap-2 text-slate-700">
                                <Hash className="h-4 w-4 text-slate-400" />
                                {cliente.dni || "No especificado"}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-slate-500 uppercase font-semibold">Teléfono</span>
                            <span className="flex items-center gap-2 text-slate-700">
                                <Phone className="h-4 w-4 text-slate-400" />
                                {cliente.telefono || "No especificado"}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-slate-500 uppercase font-semibold">Email</span>
                            <span className="flex items-center gap-2 text-slate-700">
                                <Mail className="h-4 w-4 text-slate-400" />
                                {cliente.email || "No especificado"}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-slate-500 uppercase font-semibold">Fecha de Registro</span>
                            <span className="flex items-center gap-2 text-slate-700">
                                <Calendar className="h-4 w-4 text-slate-400" />
                                {new Date(cliente.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Graduaciones History */}
                <div className="md:col-span-2 space-y-4">
                    <h3 className="text-xl font-bold mb-4">Historial de Graduaciones</h3>

                    {cliente.graduaciones.length === 0 ? (
                        <div className="bg-white border rounded-lg border-dashed p-8 text-center flex flex-col items-center justify-center">
                            <div className="bg-blue-50 text-blue-500 p-3 rounded-full mb-3">
                                <Eye className="h-6 w-6" />
                            </div>
                            <h4 className="font-medium text-slate-900 mb-1">Sin historial clínico</h4>
                            <p className="text-sm text-slate-500 mb-4 max-w-sm">Este paciente aún no tiene ninguna graduación registrada. Comienza añadiendo su primera refracción.</p>
                            <NuevaGraduacionModal clienteId={cliente.id} />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cliente.graduaciones.map((graduacion) => (
                                <Card key={graduacion.id} className="border-0 shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                    <div className="bg-slate-100 border-b px-4 py-2 flex justify-between items-center text-sm font-medium text-slate-600">
                                        <span className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            {new Date(graduacion.fechaCreacion).toLocaleDateString()} a las {new Date(graduacion.fechaCreacion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {graduacion.distanciaInter && (
                                            <span className="bg-white px-2 py-0.5 rounded shadow-sm text-xs">DIP: {graduacion.distanciaInter.toString()} mm</span>
                                        )}
                                    </div>
                                    <CardContent className="p-0">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x">
                                            {/* Ojo Derecho */}
                                            <div className="p-4 bg-white hover:bg-slate-50 transition-colors">
                                                <h4 className="font-bold text-slate-800 text-sm mb-3 flex items-center justify-between">
                                                    Ojo Derecho (OD)
                                                    {graduacion.odAgudezaVisual && (
                                                        <span className="font-normal text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">AV: {graduacion.odAgudezaVisual}</span>
                                                    )}
                                                </h4>
                                                <div className="grid grid-cols-4 gap-2 text-center text-sm">
                                                    <div>
                                                        <div className="text-xs text-slate-500 mb-1">Esf</div>
                                                        <div className="font-semibold">{Number(graduacion.odEsfera) > 0 ? "+" : ""}{Number(graduacion.odEsfera).toFixed(2)}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-slate-500 mb-1">Cil</div>
                                                        <div className="font-semibold">{Number(graduacion.odCilindro) > 0 ? "+" : ""}{Number(graduacion.odCilindro).toFixed(2)}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-slate-500 mb-1">Eje</div>
                                                        <div className="font-semibold">{graduacion.odEje}°</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-slate-500 mb-1">Adic</div>
                                                        <div className="font-semibold">{graduacion.odAdicion ? `+${Number(graduacion.odAdicion).toFixed(2)}` : "-"}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Ojo Izquierdo */}
                                            <div className="p-4 bg-white hover:bg-slate-50 transition-colors">
                                                <h4 className="font-bold text-slate-800 text-sm mb-3 flex items-center justify-between">
                                                    Ojo Izquierdo (OI)
                                                    {graduacion.oiAgudezaVisual && (
                                                        <span className="font-normal text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">AV: {graduacion.oiAgudezaVisual}</span>
                                                    )}
                                                </h4>
                                                <div className="grid grid-cols-4 gap-2 text-center text-sm">
                                                    <div>
                                                        <div className="text-xs text-slate-500 mb-1">Esf</div>
                                                        <div className="font-semibold">{Number(graduacion.oiEsfera) > 0 ? "+" : ""}{Number(graduacion.oiEsfera).toFixed(2)}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-slate-500 mb-1">Cil</div>
                                                        <div className="font-semibold">{Number(graduacion.oiCilindro) > 0 ? "+" : ""}{Number(graduacion.oiCilindro).toFixed(2)}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-slate-500 mb-1">Eje</div>
                                                        <div className="font-semibold">{graduacion.oiEje}°</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-slate-500 mb-1">Adic</div>
                                                        <div className="font-semibold">{graduacion.oiAdicion ? `+${Number(graduacion.oiAdicion).toFixed(2)}` : "-"}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {graduacion.notas && (
                                            <div className="bg-yellow-50/50 p-3 text-sm text-slate-700 border-t flex gap-2 items-start">
                                                <span className="font-semibold min-w-max">Notas:</span>
                                                <span className="italic">{graduacion.notas}</span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
