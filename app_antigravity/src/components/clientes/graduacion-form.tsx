"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "react-hot-toast"
import { createGraduacion } from "@/actions/graduacion"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { PlusCircle, Loader2, Eye } from "lucide-react"

const graduacionSchema = z.object({
    odEsfera: z.coerce.number().min(-30, "Mín. -30").max(30, "Máx. +30"),
    odCilindro: z.coerce.number().min(-15, "Mín. -15").max(15, "Máx. +15"),
    odEje: z.coerce.number().min(0, "Mín. 0").max(180, "Máx. 180"),
    odAdicion: z.coerce.number().min(0, "Debe ser positivo").max(10, "Máx. +10").optional().or(z.literal(0)),
    odAgudezaVisual: z.string().max(20, "Demasiado largo").optional(),

    oiEsfera: z.coerce.number().min(-30, "Mín. -30").max(30, "Máx. +30"),
    oiCilindro: z.coerce.number().min(-15, "Mín. -15").max(15, "Máx. +15"),
    oiEje: z.coerce.number().min(0, "Mín. 0").max(180, "Máx. 180"),
    oiAdicion: z.coerce.number().min(0, "Debe ser positivo").max(10, "Máx. +10").optional().or(z.literal(0)),
    oiAgudezaVisual: z.string().max(20, "Demasiado largo").optional(),

    distanciaInter: z.coerce.number().min(20, "Mín. 20mm").max(100, "Máx. 100mm").optional().or(z.literal(0)),
    notas: z.string().max(1000, "Demasiado largo").optional(),
})

export type GraduacionFormValues = z.infer<typeof graduacionSchema>

export function NuevaGraduacionModal({ clienteId }: { clienteId: string }) {
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(graduacionSchema),
        defaultValues: {
            odEsfera: 0,
            odCilindro: 0,
            odEje: 0,
            odAdicion: 0,
            oiEsfera: 0,
            oiCilindro: 0,
            oiEje: 0,
            oiAdicion: 0,
        },
    })

    const onSubmit = async (data: GraduacionFormValues) => {
        setIsSubmitting(true)
        try {
            const result = await createGraduacion(clienteId, data)
            if (result.success) {
                toast.success("Graduación añadida correctamente")
                setOpen(false)
                reset()
            } else {
                toast.error(result.error || "Error al añadir la graduación")
            }
        } catch (error) {
            toast.error("Error inesperado de red")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nueva Graduación
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl flex items-center gap-2">
                        <Eye className="h-5 w-5 text-blue-600" />
                        Registro de Graduación Visual
                    </DialogTitle>
                    <DialogDescription>
                        Introduce los datos de refracción del paciente.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* OJO DERECHO */}
                        <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <h3 className="font-semibold text-slate-800 flex items-center border-b pb-2">Ojo Derecho (OD)</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label>Esfera (Esf)</Label>
                                    <Input type="number" step="0.25" min="-30" max="30" {...register("odEsfera")} className={errors.odEsfera ? 'border-red-500' : ''} />
                                    {errors.odEsfera && <p className="text-[10px] text-red-500 font-medium">{errors.odEsfera.message as string}</p>}
                                </div>
                                <div className="space-y-1">
                                    <Label>Cilindro (Cil)</Label>
                                    <Input type="number" step="0.25" min="-15" max="15" {...register("odCilindro")} className={errors.odCilindro ? 'border-red-500' : ''} />
                                    {errors.odCilindro && <p className="text-[10px] text-red-500 font-medium">{errors.odCilindro.message as string}</p>}
                                </div>
                                <div className="space-y-1">
                                    <Label>Eje (°)</Label>
                                    <Input type="number" step="1" min="0" max="180" {...register("odEje")} className={errors.odEje ? 'border-red-500' : ''} />
                                    {errors.odEje && <p className="text-[10px] text-red-500 font-medium">{errors.odEje.message as string}</p>}
                                </div>
                                <div className="space-y-1">
                                    <Label>Adición</Label>
                                    <Input type="number" step="0.25" min="0" max="10" {...register("odAdicion")} className={errors.odAdicion ? 'border-red-500' : ''} />
                                    {errors.odAdicion && <p className="text-[10px] text-red-500 font-medium">{errors.odAdicion.message as string}</p>}
                                </div>
                                <div className="space-y-1 col-span-2">
                                    <Label>Agudeza Visual</Label>
                                    <Input placeholder="Ej. 1.0, 0.8" maxLength={20} {...register("odAgudezaVisual")} className={errors.odAgudezaVisual ? 'border-red-500' : ''} />
                                    {errors.odAgudezaVisual && <p className="text-[10px] text-red-500 font-medium">{errors.odAgudezaVisual.message as string}</p>}
                                </div>
                            </div>
                        </div>

                        {/* OJO IZQUIERDO */}
                        <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <h3 className="font-semibold text-slate-800 flex items-center border-b pb-2">Ojo Izquierdo (OI)</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label>Esfera (Esf)</Label>
                                    <Input type="number" step="0.25" min="-30" max="30" {...register("oiEsfera")} className={errors.oiEsfera ? 'border-red-500' : ''} />
                                    {errors.oiEsfera && <p className="text-[10px] text-red-500 font-medium">{errors.oiEsfera.message as string}</p>}
                                </div>
                                <div className="space-y-1">
                                    <Label>Cilindro (Cil)</Label>
                                    <Input type="number" step="0.25" min="-15" max="15" {...register("oiCilindro")} className={errors.oiCilindro ? 'border-red-500' : ''} />
                                    {errors.oiCilindro && <p className="text-[10px] text-red-500 font-medium">{errors.oiCilindro.message as string}</p>}
                                </div>
                                <div className="space-y-1">
                                    <Label>Eje (°)</Label>
                                    <Input type="number" step="1" min="0" max="180" {...register("oiEje")} className={errors.oiEje ? 'border-red-500' : ''} />
                                    {errors.oiEje && <p className="text-[10px] text-red-500 font-medium">{errors.oiEje.message as string}</p>}
                                </div>
                                <div className="space-y-1">
                                    <Label>Adición</Label>
                                    <Input type="number" step="0.25" min="0" max="10" {...register("oiAdicion")} className={errors.oiAdicion ? 'border-red-500' : ''} />
                                    {errors.oiAdicion && <p className="text-[10px] text-red-500 font-medium">{errors.oiAdicion.message as string}</p>}
                                </div>
                                <div className="space-y-1 col-span-2">
                                    <Label>Agudeza Visual</Label>
                                    <Input placeholder="Ej. 1.0, 0.8" maxLength={20} {...register("oiAgudezaVisual")} className={errors.oiAgudezaVisual ? 'border-red-500' : ''} />
                                    {errors.oiAgudezaVisual && <p className="text-[10px] text-red-500 font-medium">{errors.oiAgudezaVisual.message as string}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <Label>Distancia Interpupilar (DIP, mm)</Label>
                            <Input type="number" step="0.5" min="20" max="100" {...register("distanciaInter")} placeholder="Ej. 62.5" className={errors.distanciaInter ? 'border-red-500' : ''} />
                            {errors.distanciaInter && <p className="text-[10px] text-red-500 font-medium">{errors.distanciaInter.message as string}</p>}
                        </div>
                        <div className="space-y-1">
                            <Label>Notas Adicionales</Label>
                            <textarea
                                className={`flex min-h-[80px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50 ${errors.notas ? 'border-red-500 focus-visible:ring-red-500' : 'border-slate-200 focus-visible:ring-slate-950'}`}
                                placeholder="Observaciones clínicas..."
                                maxLength={1000}
                                {...register("notas")}
                            />
                            {errors.notas && <p className="text-[10px] text-red-500 font-medium">{errors.notas.message as string}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                "Guardar Graduación"
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
