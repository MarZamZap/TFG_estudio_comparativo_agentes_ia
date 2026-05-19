"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2, Tag } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { CategoriaForm } from "./categoria-form"
import { deleteCategoria } from "@/actions/categoria"
import toast from "react-hot-toast"

type CategoriaFlat = {
    id: string
    nombre: string
    idCategoriaPadre: string | null
    parentName?: string
    productosCount: number
    subcategoriasCount: number
}

export function CategoriasClient({ categorias }: { categorias: CategoriaFlat[] }) {
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingCategoria, setEditingCategoria] = useState<CategoriaFlat | null>(null)

    const handleCreate = () => {
        setEditingCategoria(null)
        setIsFormOpen(true)
    }

    const handleEdit = (cat: CategoriaFlat) => {
        setEditingCategoria(cat)
        setIsFormOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("¿Seguro que desea eliminar esta categoría?")) return

        const toastId = toast.loading("Eliminando...")
        const res = await deleteCategoria(id)
        if (res.success) {
            toast.success("Categoría eliminada", { id: toastId })
        } else {
            toast.error(res.error || "Error al eliminar", { id: toastId })
        }
    }

    return (
        <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-500 min-w-0">
            <div className="flex justify-end">
                <Button onClick={handleCreate} className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Categoría
                </Button>
            </div>

            <div className="rounded-xl border shadow-sm overflow-hidden border-slate-200">
                <Table>
                    <TableHeader className="bg-slate-50/80">
                        <TableRow>
                            <TableHead className="font-semibold text-slate-700">Nombre</TableHead>
                            <TableHead className="font-semibold text-slate-700">Categoría Padre</TableHead>
                            <TableHead className="text-right font-semibold text-slate-700">Productos</TableHead>
                            <TableHead className="text-right font-semibold text-slate-700">Subcategorías</TableHead>
                            <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categorias.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                                    No hay categorías registradas.
                                </TableCell>
                            </TableRow>
                        ) : (
                            categorias.map((cat) => (
                                <TableRow key={cat.id} className="hover:bg-slate-50">
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <Tag className="h-4 w-4 text-slate-400" />
                                        {cat.nombre}
                                    </TableCell>
                                    <TableCell>
                                        {cat.parentName ? (
                                            <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-md font-medium">
                                                {cat.parentName}
                                            </span>
                                        ) : (
                                            <span className="text-slate-400 italic text-sm">Ninguna</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">{cat.productosCount}</TableCell>
                                    <TableCell className="text-right">{cat.subcategoriasCount}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(cat)} className="hover:bg-slate-200 hover:text-indigo-600">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)} className="hover:bg-rose-50 hover:text-rose-600">
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

            <CategoriaForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                categoria={editingCategoria}
                categoriasDisponibles={categorias}
            />
        </div>
    )
}
