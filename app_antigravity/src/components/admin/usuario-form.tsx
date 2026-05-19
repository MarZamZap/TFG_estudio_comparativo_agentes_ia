"use client"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { createUsuario, updateUsuario } from "@/actions/usuario"
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

export type UsuarioFlat = {
    id: string
    nombre: string
    username: string
}

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    usuario: UsuarioFlat | null
}

export function UsuarioForm({ open, onOpenChange, usuario }: Props) {
    const [loading, setLoading] = useState(false)
    const { register, handleSubmit, reset, setValue } = useForm<{
        nombre: string
        username: string
        password?: string
    }>()

    useEffect(() => {
        if (open) {
            if (usuario) {
                setValue("nombre", usuario.nombre)
                setValue("username", usuario.username)
                setValue("password", "") // Password no se llena al editar
            } else {
                reset({ nombre: "", username: "", password: "" })
            }
        }
    }, [open, usuario, setValue, reset])

    const onSubmit = async (data: { nombre: string; username: string; password?: string }) => {
        setLoading(true)
        const toastId = toast.loading("Guardando...")

        // Si estamos editando y password está vacío, omitirlo
        const payload = {
            nombre: data.nombre,
            username: data.username,
            ...(data.password ? { password: data.password } : {})
        }

        let res
        if (usuario) {
            res = await updateUsuario(usuario.id, payload)
        } else {
            res = await createUsuario(payload)
        }

        if (res.success) {
            toast.success(usuario ? "Usuario actualizado" : "Usuario creado", { id: toastId })
            onOpenChange(false)
        } else {
            toast.error(res.error || "Error al guardar", { id: toastId })
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{usuario ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre Completo</Label>
                        <Input
                            id="nombre"
                            placeholder="Ej. Juan Pérez"
                            {...register("nombre", { required: true })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="username">Nombre de Usuario (Username)</Label>
                        <Input
                            id="username"
                            placeholder="Ej. jperez"
                            {...register("username", { required: true })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">
                            Contraseña {usuario && <span className="text-slate-400 font-normal text-xs">(Opcional para actualizar)</span>}
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="******"
                            {...register("password", { required: !usuario })}
                        />
                        {!usuario && <p className="text-xs text-slate-500">Debe ingresar una contraseña inicial.</p>}
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
