"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { createTienda, updateTienda, deleteTienda } from "@/actions/tienda"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusCircle, Trash2, Pencil, Loader2, Store, MapPin, Phone, Users, FileText } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { telefonoRegex } from "@/lib/validations"

type Tienda = {
    id: string
    nombre: string
    direccion: string | null
    telefono: string | null
    _count: { usuarios: number, operaciones: number }
}

export function TiendasClient({ tiendas: initial }: { tiendas: Tienda[] }) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [form, setForm] = useState({ nombre: "", direccion: "", telefono: "" })

    const handleOpenCreate = () => {
        setEditingId(null)
        setForm({ nombre: "", direccion: "", telefono: "" })
        setOpen(true)
    }

    const handleOpenEdit = (tienda: Tienda) => {
        setEditingId(tienda.id)
        setForm({ nombre: tienda.nombre, direccion: tienda.direccion || "", telefono: tienda.telefono || "" })
        setOpen(true)
    }

    const handleSave = async () => {
        if (!form.nombre.trim()) { toast.error("El nombre es obligatorio"); return }
        if (form.nombre.length > 100) { toast.error("El nombre no puede exceder los 100 caracteres"); return }
        if (form.direccion && form.direccion.length > 255) { toast.error("La dirección es demasiado larga"); return }
        
        if (form.telefono && !telefonoRegex.test(form.telefono)) {
            toast.error("Teléfono inválido (9 a 15 dígitos permitidos)");
            return;
        }
        if (form.telefono && form.telefono.length > 15) {
            toast.error("El teléfono no puede exceder los 15 caracteres");
            return;
        }
        setIsSubmitting(true)
        try {
            let result;
            if (editingId) {
                result = await updateTienda(editingId, form)
            } else {
                result = await createTienda(form)
            }

            if (result.success) {
                toast.success(editingId ? "Tienda actualizada correctamente" : "Tienda/Sucursal creada correctamente")
                setOpen(false)
                setForm({ nombre: "", direccion: "", telefono: "" })
                setEditingId(null)
                router.refresh()
            } else {
                toast.error(result.error || "Error al guardar")
            }
        } catch { toast.error("Error inesperado") }
        finally { setIsSubmitting(false) }
    }

    const handleDelete = async (id: string, nombre: string) => {
        if (!confirm(`¿Eliminar la tienda "${nombre}"? Esta acción no se puede deshacer.`)) return
        const result = await deleteTienda(id)
        if (result.success) {
            toast.success("Tienda eliminada")
            router.refresh()
        } else {
            toast.error(result.error || "Error al eliminar")
        }
    }

    return (
        <div className="flex flex-col gap-6 min-w-0">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-800">Tiendas y Sucursales</h2>
                    <p className="text-slate-500 text-sm mt-1">Gestión de sucursales físicas y puntos de venta.</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <Button onClick={handleOpenCreate} className="bg-indigo-600 hover:bg-indigo-700">
                        <PlusCircle className="mr-2 h-4 w-4" /> Nueva Tienda
                    </Button>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Store className="h-5 w-5 text-indigo-600" />
                                {editingId ? "Editar Sucursal" : "Registrar Sucursal"}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-2">
                            <div className="space-y-1">
                                <Label>Nombre de la Sucursal *</Label>
                                <Input maxLength={100} value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Ej. Centro Óptico Norte" />
                            </div>
                            <div className="space-y-1">
                                <Label>Dirección</Label>
                                <Input maxLength={255} value={form.direccion} onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))} placeholder="Calle Principal 123, Ciudad" />
                            </div>
                            <div className="space-y-1">
                                <Label>Teléfono de Contacto</Label>
                                <Input maxLength={15} value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} placeholder="912 345 678" />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                                <Button onClick={handleSave} disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700">
                                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</> : (editingId ? "Actualizar Sucursal" : "Guardar Sucursal")}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-0 shadow-sm ring-1 ring-slate-100">
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500 font-medium">Total Sucursales</CardTitle></CardHeader>
                    <CardContent><div className="text-3xl font-bold text-slate-800">{initial.length}</div></CardContent>
                </Card>
                <Card className="border-0 shadow-sm ring-1 ring-slate-100">
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500 font-medium">Usuarios Asignados</CardTitle></CardHeader>
                    <CardContent><div className="text-3xl font-bold text-slate-800">{initial.reduce((a, t) => a + t._count.usuarios, 0)}</div></CardContent>
                </Card>
                <Card className="border-0 shadow-sm ring-1 ring-slate-100">
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500 font-medium">Operaciones Globales</CardTitle></CardHeader>
                    <CardContent><div className="text-3xl font-bold text-slate-800">{initial.reduce((a, t) => a + t._count.operaciones, 0)}</div></CardContent>
                </Card>
            </div>

            <Card className="border-0 shadow-sm ring-1 ring-slate-100">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead><span className="flex items-center gap-1"><Store className="h-3 w-3" />Tienda</span></TableHead>
                            <TableHead><span className="flex items-center gap-1"><MapPin className="h-3 w-3" />Dirección</span></TableHead>
                            <TableHead><span className="flex items-center gap-1"><Phone className="h-3 w-3" />Teléfono</span></TableHead>
                            <TableHead className="text-center"><span className="flex items-center justify-center gap-1"><Users className="h-3 w-3" />Usuarios</span></TableHead>
                            <TableHead className="text-center"><span className="flex items-center justify-center gap-1"><FileText className="h-3 w-3" />Ops. Registradas</span></TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initial.length === 0 ? (
                            <TableRow><TableCell colSpan={6} className="text-center text-slate-400 py-12">No hay tiendas registradas.</TableCell></TableRow>
                        ) : initial.map(tienda => (
                            <TableRow key={tienda.id}>
                                <TableCell className="font-semibold text-slate-800">{tienda.nombre}</TableCell>
                                <TableCell className="text-slate-600 text-sm">{tienda.direccion || "—"}</TableCell>
                                <TableCell className="text-slate-600 text-sm">{tienda.telefono || "—"}</TableCell>
                                <TableCell className="text-center">
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${tienda._count.usuarios > 0 ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-400'}`}>
                                        {tienda._count.usuarios}
                                    </span>
                                </TableCell>
                                <TableCell className="text-center">
                                    <span className="text-xs font-medium text-slate-600">
                                        {tienda._count.operaciones}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <Button variant="ghost" size="icon" className="hover:bg-slate-200 hover:text-indigo-600"
                                            onClick={() => handleOpenEdit(tienda)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="hover:bg-rose-50 hover:text-rose-600"
                                            onClick={() => handleDelete(tienda.id, tienda.nombre)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}
