"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { updateCliente } from "@/actions/cliente"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Save, Loader2, Pencil, User, Hash, Phone, Mail } from "lucide-react"
import { dniRegex, telefonoRegex } from "@/lib/validations"

export function EditClienteModal({ cliente }: {
    cliente: {
        id: string;
        nombre: string;
        apellido: string;
        dni: string | null;
        telefono: string | null;
        email: string | null
    }
}) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [form, setForm] = useState({
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        dni: cliente.dni || "",
        telefono: cliente.telefono || "",
        email: cliente.email || ""
    })

    const handleSave = async () => {
        if (!form.nombre.trim() || !form.apellido.trim()) {
            toast.error("Nombre y apellido son obligatorios");
            return;
        }
        if (form.nombre.length > 100 || form.apellido.length > 150) {
            toast.error("El nombre o apellido es demasiado largo");
            return;
        }
        if (form.dni && form.dni.length > 20) {
            toast.error("El DNI/Pasaporte no puede exceder los 20 caracteres");
            return;
        }
        if (form.dni && !dniRegex.test(form.dni)) {
            toast.error("Formato de DNI/NIE inválido");
            return;
        }
        if (form.telefono && !telefonoRegex.test(form.telefono)) {
            toast.error("Teléfono inválido (9 a 15 dígitos permitidos)");
            return;
        }
        if (form.telefono && form.telefono.length > 15) {
            toast.error("El teléfono no puede exceder los 15 caracteres");
            return;
        }
        if (form.email && form.email.length > 150) {
            toast.error("El email no puede exceder los 150 caracteres");
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (form.email && !emailRegex.test(form.email)) {
            toast.error("Formato de email inválido");
            return;
        }
        setIsSubmitting(true)
        try {
            const result = await updateCliente(cliente.id, form)
            if (result.success) {
                toast.success("Perfil actualizado correctamente")
                setOpen(false)
                router.refresh()
            } else {
                toast.error(result.error || "Error al actualizar el perfil")
            }
        } catch {
            toast.error("Error inesperado")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs bg-white text-slate-600 hover:text-blue-600 border-slate-200 shadow-sm">
                    <Pencil className="mr-1.5 h-3 w-3" />
                    Editar Perfil
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-blue-600" />
                        Editar Datos del Paciente
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label>Nombre *</Label>
                            <Input maxLength={100} value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
                        </div>
                        <div className="space-y-1">
                            <Label>Apellidos *</Label>
                            <Input maxLength={150} value={form.apellido} onChange={e => setForm(f => ({ ...f, apellido: e.target.value }))} />
                        </div>
                    </div>
                    <div className="space-y-1 relative">
                        <Label>DNI / Pasaporte</Label>
                        <div className="relative">
                            <Hash className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input maxLength={20} className="pl-9" value={form.dni} onChange={e => setForm(f => ({ ...f, dni: e.target.value }))} />
                        </div>
                    </div>
                    <div className="space-y-1 relative">
                        <Label>Teléfono</Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input maxLength={15} className="pl-9" value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} />
                        </div>
                    </div>
                    <div className="space-y-1 relative">
                        <Label>Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input type="email" maxLength={150} className="pl-9" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSave} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</> : <><Save className="mr-2 h-4 w-4" /> Guardar Cambios</>}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
