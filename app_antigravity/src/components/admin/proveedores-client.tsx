"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { createProveedor, updateProveedor, deleteProveedor } from "@/actions/proveedor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusCircle, Trash2, Pencil, Loader2, Building2, Phone, Mail, MapPin, Hash } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cifRegex, telefonoRegex } from "@/lib/validations"

type Proveedor = {
    id: string
    nombre: string
    cif: string | null
    telefono: string | null
    email: string | null
    direccion: string | null
    _count: { productos: number }
}

export function ProveedoresClient({ proveedores: initial }: { proveedores: Proveedor[] }) {
    const router = useRouter()
    const [proveedores, setProveedores] = useState(initial)
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [form, setForm] = useState({ nombre: "", cif: "", telefono: "", email: "", direccion: "" })

    const handleOpenCreate = () => {
        setEditingId(null)
        setForm({ nombre: "", cif: "", telefono: "", email: "", direccion: "" })
        setOpen(true)
    }

    const handleOpenEdit = (prov: Proveedor) => {
        setEditingId(prov.id)
        setForm({
            nombre: prov.nombre,
            cif: prov.cif || "",
            telefono: prov.telefono || "",
            email: prov.email || "",
            direccion: prov.direccion || ""
        })
        setOpen(true)
    }

    const handleSave = async () => {
        if (!form.nombre.trim()) { toast.error("El nombre es obligatorio"); return }
        if (form.nombre.length > 100) { toast.error("El nombre es demasiado largo"); return }
        if (form.cif && form.cif.length > 20) { toast.error("El CIF/NIF no puede exceder los 20 caracteres"); return }
        if (form.cif && !cifRegex.test(form.cif)) { toast.error("Formato de CIF/NIF inválido"); return }
        if (form.email && form.email.length > 150) { toast.error("El email es demasiado largo"); return }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (form.email && !emailRegex.test(form.email)) { toast.error("Formato de email inválido"); return }
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
                result = await updateProveedor(editingId, form)
            } else {
                result = await createProveedor(form)
            }
            if (result.success) {
                toast.success(editingId ? "Proveedor actualizado correctamente" : "Proveedor creado correctamente")
                setOpen(false)
                setForm({ nombre: "", cif: "", telefono: "", email: "", direccion: "" })
                setEditingId(null)
                router.refresh()
            } else {
                toast.error(result.error || "Error al guardar")
            }
        } catch { toast.error("Error inesperado") }
        finally { setIsSubmitting(false) }
    }

    const handleDelete = async (id: string, nombre: string) => {
        if (!confirm(`¿Eliminar el proveedor "${nombre}"? Esta acción no se puede deshacer.`)) return
        const result = await deleteProveedor(id)
        if (result.success) {
            toast.success("Proveedor eliminado")
            router.refresh()
        } else {
            toast.error(result.error || "Error al eliminar")
        }
    }

    return (
        <div className="flex flex-col gap-6 min-w-0">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-800">Proveedores</h2>
                    <p className="text-slate-500 text-sm mt-1">Gestión de proveedores y sus catálogos de producto</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <Button onClick={handleOpenCreate} className="bg-indigo-600 hover:bg-indigo-700">
                        <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Proveedor
                    </Button>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-indigo-600" />
                                {editingId ? "Editar Proveedor" : "Registrar Proveedor"}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-2">
                            <div className="space-y-1">
                                <Label>Nombre *</Label>
                                <Input maxLength={100} value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Ej. Luxottica Group" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label>CIF / NIF</Label>
                                    <Input maxLength={20} value={form.cif} onChange={e => setForm(f => ({ ...f, cif: e.target.value }))} placeholder="B12345678" />
                                </div>
                                <div className="space-y-1">
                                    <Label>Teléfono</Label>
                                    <Input maxLength={15} value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} placeholder="900 000 000" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label>Email</Label>
                                <Input type="email" maxLength={150} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="pedidos@proveedor.com" />
                            </div>
                            <div className="space-y-1">
                                <Label>Dirección</Label>
                                <Input maxLength={255} value={form.direccion} onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))} placeholder="Calle, Ciudad, País" />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                                <Button onClick={handleSave} disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700">
                                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</> : (editingId ? "Actualizar Proveedor" : "Guardar Proveedor")}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-0 shadow-sm ring-1 ring-slate-100">
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500 font-medium">Total Proveedores</CardTitle></CardHeader>
                    <CardContent><div className="text-3xl font-bold text-slate-800">{initial.length}</div></CardContent>
                </Card>
                <Card className="border-0 shadow-sm ring-1 ring-slate-100">
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500 font-medium">Productos Vinculados</CardTitle></CardHeader>
                    <CardContent><div className="text-3xl font-bold text-slate-800">{initial.reduce((a, p) => a + p._count.productos, 0)}</div></CardContent>
                </Card>
                <Card className="border-0 shadow-sm ring-1 ring-slate-100">
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500 font-medium">Con CIF Registrado</CardTitle></CardHeader>
                    <CardContent><div className="text-3xl font-bold text-slate-800">{initial.filter(p => p.cif).length}</div></CardContent>
                </Card>
            </div>

            <Card className="border-0 shadow-sm ring-1 ring-slate-100">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Proveedor</TableHead>
                            <TableHead><span className="flex items-center gap-1"><Hash className="h-3 w-3" />CIF</span></TableHead>
                            <TableHead><span className="flex items-center gap-1"><Phone className="h-3 w-3" />Teléfono</span></TableHead>
                            <TableHead><span className="flex items-center gap-1"><Mail className="h-3 w-3" />Email</span></TableHead>
                            <TableHead><span className="flex items-center gap-1"><MapPin className="h-3 w-3" />Dirección</span></TableHead>
                            <TableHead className="text-center">Productos</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initial.length === 0 ? (
                            <TableRow><TableCell colSpan={7} className="text-center text-slate-400 py-12">No hay proveedores registrados. Crea el primero con el botón de arriba.</TableCell></TableRow>
                        ) : initial.map(prov => (
                            <TableRow key={prov.id}>
                                <TableCell className="font-semibold text-slate-800">{prov.nombre}</TableCell>
                                <TableCell className="font-mono text-slate-500 text-xs">{prov.cif || "—"}</TableCell>
                                <TableCell className="text-slate-600 text-sm">{prov.telefono || "—"}</TableCell>
                                <TableCell className="text-slate-600 text-sm">{prov.email || "—"}</TableCell>
                                <TableCell className="text-slate-600 text-sm max-w-[200px] truncate">{prov.direccion || "—"}</TableCell>
                                <TableCell className="text-center">
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${prov._count.productos > 0 ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-400'}`}>
                                        {prov._count.productos} prod.
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <Button variant="ghost" size="icon" className="hover:bg-slate-200 hover:text-indigo-600"
                                            onClick={() => handleOpenEdit(prov)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="hover:bg-rose-50 hover:text-rose-600"
                                            onClick={() => handleDelete(prov.id, prov.nombre)}>
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
