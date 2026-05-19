"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2, User } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { UsuarioForm } from "./usuario-form"
import { deleteUsuario } from "@/actions/usuario"
import toast from "react-hot-toast"

export type UsuarioFlat = {
    id: string
    nombre: string
    username: string
    createdAtStr: string
}

export function UsuariosClient({ usuarios }: { usuarios: UsuarioFlat[] }) {
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingUsuario, setEditingUsuario] = useState<UsuarioFlat | null>(null)

    const handleCreate = () => {
        setEditingUsuario(null)
        setIsFormOpen(true)
    }

    const handleEdit = (u: UsuarioFlat) => {
        setEditingUsuario(u)
        setIsFormOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("¿Seguro que desea eliminar a este usuario?")) return

        const toastId = toast.loading("Eliminando...")
        const res = await deleteUsuario(id)
        if (res.success) {
            toast.success("Usuario eliminado", { id: toastId })
        } else {
            toast.error(res.error || "Error al eliminar", { id: toastId })
        }
    }

    return (
        <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-500 min-w-0">
            <div className="flex justify-end">
                <Button onClick={handleCreate} className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Usuario
                </Button>
            </div>

            <div className="rounded-xl border shadow-sm overflow-hidden border-slate-200">
                <Table>
                    <TableHeader className="bg-slate-50/80">
                        <TableRow>
                            <TableHead className="font-semibold text-slate-700">Nombre</TableHead>
                            <TableHead className="font-semibold text-slate-700">Username</TableHead>
                            <TableHead className="font-semibold text-slate-700 text-right">Fecha Registro</TableHead>
                            <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {usuarios.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                                    No hay usuarios registrados.
                                </TableCell>
                            </TableRow>
                        ) : (
                            usuarios.map((u) => (
                                <TableRow key={u.id} className="hover:bg-slate-50">
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <User className="h-4 w-4 text-slate-400" />
                                        {u.nombre}
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-slate-600 font-medium">{u.username}</span>
                                    </TableCell>
                                    <TableCell className="text-right text-slate-500 text-sm">
                                        {u.createdAtStr}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(u)} className="hover:bg-slate-200 hover:text-indigo-600">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(u.id)} className="hover:bg-rose-50 hover:text-rose-600">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <UsuarioForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                usuario={editingUsuario}
            />
        </div>
    )
}
