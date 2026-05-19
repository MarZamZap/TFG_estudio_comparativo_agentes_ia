"use client"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { createCategoria, updateCategoria } from "@/actions/categoria"
import toast from "react-hot-toast"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

type CategoriaFlat = {
    id: string
    nombre: string
    idCategoriaPadre: string | null
}

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    categoria: CategoriaFlat | null
    categoriasDisponibles: CategoriaFlat[]
}

export function CategoriaForm({ open, onOpenChange, categoria, categoriasDisponibles }: Props) {
    const [loading, setLoading] = useState(false)
    const { register, handleSubmit, reset, setValue } = useForm<{
        nombre: string
        idCategoriaPadre: string
    }>()

    useEffect(() => {
        if (open) {
            if (categoria) {
                setValue("nombre", categoria.nombre)
                setValue("idCategoriaPadre", categoria.idCategoriaPadre || "")
            } else {
                reset({ nombre: "", idCategoriaPadre: "" })
            }
        }
    }, [open, categoria, setValue, reset])

    const onSubmit = async (data: { nombre: string; idCategoriaPadre: string }) => {
        setLoading(true)
        const toastId = toast.loading("Guardando...")

        const payload = {
            nombre: data.nombre,
            idCategoriaPadre: data.idCategoriaPadre === "" ? null : data.idCategoriaPadre
        }

        let res
        if (categoria) {
            res = await updateCategoria(categoria.id, payload)
        } else {
            res = await createCategoria(payload)
        }

        if (res.success) {
            toast.success(categoria ? "Categoría actualizada" : "Categoría creada", { id: toastId })
            onOpenChange(false)
        } else {
            toast.error(res.error || "Error al guardar", { id: toastId })
        }
        setLoading(false)
    }

    // Filtrar categorías disponibles: ni ella misma
    const posiblesPadres = categoriasDisponibles.filter(c => c.id !== categoria?.id)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{categoria ? "Editar Categoría" : "Nueva Categoría"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre</Label>
                        <Input
                            id="nombre"
                            placeholder="Ej. Gafas de Sol"
                            {...register("nombre", { required: true })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="idCategoriaPadre">Categoría Padre (Opcional)</Label>
                        <select
                            id="idCategoriaPadre"
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...register("idCategoriaPadre")}
                        >
                            <option value="">-- Ninguna --</option>
                            {posiblesPadres.map(c => (
                                <option key={c.id} value={c.id}>{c.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                            Guardar
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
