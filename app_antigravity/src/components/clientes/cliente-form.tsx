"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { createCliente } from "@/actions/cliente"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Mail, Phone, Hash, Save, Loader2 } from "lucide-react"

import { dniRegex, telefonoRegex } from "@/lib/validations"

const clienteSchema = z.object({
    nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100, "Demasiado largo"),
    apellido: z.string().min(2, "El apellido debe tener al menos 2 caracteres").max(150, "Demasiado largo"),
    dni: z.string().max(20, "No puede exceder los 20 caracteres").regex(dniRegex, "Formato inválido").optional().or(z.literal("")),
    telefono: z.string().max(15, "No puede exceder los 15 caracteres").regex(telefonoRegex, "Teléfono inválido").optional().or(z.literal("")),
    email: z.string().email("Correo electrónico inválido").max(150, "Email demasiado largo").optional().or(z.literal("")),
})

export type ClienteFormValues = z.infer<typeof clienteSchema>

export function ClienteForm() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ClienteFormValues>({
        resolver: zodResolver(clienteSchema),
        defaultValues: {
            nombre: "",
            apellido: "",
            dni: "",
            telefono: "",
            email: "",
        },
    })

    const onSubmit = async (data: ClienteFormValues) => {
        setIsSubmitting(true)
        try {
            const result = await createCliente(data)
            if (result.success) {
                toast.success("Cliente creado correctamente")
                router.push(`/clientes/${result.data?.id}`)
            } else {
                toast.error(result.error || "Error al crear el cliente")
            }
        } catch (error) {
            toast.error("Error inesperado de red")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Card className="max-w-2xl mx-auto border-0 shadow-xl overflow-hidden bg-white/80 backdrop-blur-xl">
            <div className="h-2 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500" />
            <CardHeader className="space-y-1 bg-slate-50 border-b pb-6">
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <User className="h-6 w-6 text-blue-600" />
                    Registro de Nuevo Cliente
                </CardTitle>
                <CardDescription className="text-slate-500 text-sm">
                    Ingresa los datos personales del paciente. Podrás añadir su graduación médica posteriormente.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="nombre" className="text-slate-700 font-medium">Nombre *</Label>
                            <div className="relative">
                                <Input
                                    id="nombre"
                                    maxLength={100}
                                    placeholder="Ej. Juan"
                                    className={`pl-10 transition-all focus:ring-2 focus:ring-blue-500/20 ${errors.nombre ? "border-red-500 focus:ring-red-500/20" : ""}`}
                                    {...register("nombre")}
                                />
                                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            </div>
                            {errors.nombre && <p className="text-xs text-red-500 font-medium">{errors.nombre.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="apellido" className="text-slate-700 font-medium">Apellidos *</Label>
                            <div className="relative">
                                <Input
                                    id="apellido"
                                    maxLength={150}
                                    placeholder="Ej. Pérez García"
                                    className={`pl-10 transition-all focus:ring-2 focus:ring-blue-500/20 ${errors.apellido ? "border-red-500 focus:ring-red-500/20" : ""}`}
                                    {...register("apellido")}
                                />
                                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            </div>
                            {errors.apellido && <p className="text-xs text-red-500 font-medium">{errors.apellido.message}</p>}
                        </div>

                        <div className="space-y-2 relative">
                            <Label htmlFor="dni" className="text-slate-700 font-medium">DNI / Pasaporte</Label>
                            <div className="relative">
                                <Input
                                    id="dni"
                                    maxLength={20}
                                    placeholder="Opcional"
                                    className={`pl-10 transition-all focus:ring-2 focus:ring-blue-500/20 ${errors.dni ? "border-red-500 focus:ring-red-500/20" : ""}`}
                                    {...register("dni")}
                                />
                                <Hash className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            </div>
                            {errors.dni && <p className="text-xs text-red-500 font-medium">{errors.dni.message}</p>}
                        </div>

                        <div className="space-y-2 relative">
                            <Label htmlFor="telefono" className="text-slate-700 font-medium">Teléfono de Contacto</Label>
                            <div className="relative">
                                <Input
                                    id="telefono"
                                    maxLength={15}
                                    placeholder="Opcional"
                                    className={`pl-10 transition-all focus:ring-2 focus:ring-blue-500/20 ${errors.telefono ? "border-red-500 focus:ring-red-500/20" : ""}`}
                                    {...register("telefono")}
                                />
                                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            </div>
                            {errors.telefono && <p className="text-xs text-red-500 font-medium">{errors.telefono.message}</p>}
                        </div>

                        <div className="space-y-2 md:col-span-2 relative">
                            <Label htmlFor="email" className="text-slate-700 font-medium">Correo Electrónico</Label>
                            <div className="relative">
                                <Input
                                    id="email"
                                    type="email"
                                    maxLength={150}
                                    placeholder="ejemplo@correo.com"
                                    className={`pl-10 transition-all focus:ring-2 focus:ring-blue-500/20 ${errors.email ? "border-red-500 focus:ring-red-500/20" : ""}`}
                                    {...register("email")}
                                />
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            </div>
                            {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>}
                        </div>
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-3 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            className="hover:bg-slate-100 transition-colors"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-blue-600 hover:bg-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-70 px-8"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Guardar Cliente
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
