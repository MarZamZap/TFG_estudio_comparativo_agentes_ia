"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "react-hot-toast"
import { deleteProducto } from "@/actions/producto"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertTriangle, Search, Truck, Pencil, Trash2, Image as ImageIcon } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

type ProductoRow = {
    id: string
    nombre: string
    codigoBarras: string | null
    precio: number
    coste: number | null
    categoria: string
    marca: string | null
    modelo: string | null
    proveedor: string | null
    imageUrl: string | null
    stockTotal: number
    stockMinimo: number
}

export function InventarioSearch({ productos }: { productos: ProductoRow[] }) {
    const [query, setQuery] = useState("")

    const handleDelete = async (id: string, nombre: string) => {
        if (!confirm(`¿Seguro que desea eliminar el producto "${nombre}"?`)) return

        const toastId = toast.loading("Eliminando producto...")
        const res = await deleteProducto(id)
        if (res.success) {
            toast.success("Producto eliminado correctamente", { id: toastId })
        } else {
            toast.error(res.error || "Error al eliminar producto", { id: toastId })
        }
    }

    const filtrados = query.trim() === ""
        ? productos
        : productos.filter(p =>
            p.nombre.toLowerCase().includes(query.toLowerCase()) ||
            (p.codigoBarras && p.codigoBarras.includes(query)) ||
            (p.marca && p.marca.toLowerCase().includes(query.toLowerCase())) ||
            (p.proveedor && p.proveedor.toLowerCase().includes(query.toLowerCase())) ||
            p.categoria.toLowerCase().includes(query.toLowerCase())
        )

    return (
        <div className="flex flex-col gap-4 min-w-0">
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                    placeholder="Buscar por nombre, código, marca, proveedor..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    className="pl-9 bg-white"
                />
            </div>

            <div className="border rounded-xl bg-white overflow-hidden shadow-sm ring-1 ring-slate-100">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead>Categoría / Marca</TableHead>
                            <TableHead><span className="flex items-center gap-1"><Truck className="h-3 w-3" />Proveedor</span></TableHead>
                            <TableHead>P. Venta</TableHead>
                            <TableHead>P. Coste</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtrados.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center text-slate-400 py-12">
                                    No se encontraron productos para &quot;{query}&quot;
                                </TableCell>
                            </TableRow>
                        ) : filtrados.map(producto => {
                            const isBajoStock = producto.stockTotal <= producto.stockMinimo
                            return (
                                <TableRow key={producto.id} className="hover:bg-slate-50 transition-colors">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            {producto.imageUrl ? (
                                                <div className="h-10 w-10 shrink-0 rounded-md ring-1 ring-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={producto.imageUrl} alt={producto.nombre} className="h-full w-full object-cover" />
                                                </div>
                                            ) : (
                                                <div className="h-10 w-10 shrink-0 rounded-md ring-1 ring-slate-200 bg-slate-100 flex items-center justify-center text-slate-400">
                                                    <ImageIcon className="h-5 w-5 opacity-50" />
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-medium text-slate-900">{producto.nombre}</div>
                                                {producto.codigoBarras && (
                                                    <div className="text-xs text-slate-400 font-mono">{producto.codigoBarras}</div>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm text-slate-700">{producto.categoria}</div>
                                        {producto.marca && (
                                            <div className="text-xs text-slate-400">{producto.marca}{producto.modelo ? ` · ${producto.modelo}` : ''}</div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {producto.proveedor ? (
                                            <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full font-medium">
                                                {producto.proveedor}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-slate-300">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-semibold text-slate-800">
                                        {formatCurrency(producto.precio)}
                                    </TableCell>
                                    <TableCell className="text-emerald-700 font-medium text-sm">
                                        {producto.coste != null ? formatCurrency(producto.coste) : <span className="text-slate-300">—</span>}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`font-bold text-sm ${isBajoStock ? 'text-red-600' : 'text-slate-700'}`}>
                                            {producto.stockTotal} uds.
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {isBajoStock ? (
                                            <span className="flex items-center text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full w-max">
                                                <AlertTriangle className="mr-1 h-3 w-3" />Stock Crítico
                                            </span>
                                        ) : (
                                            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full w-max">
                                                Óptimo
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Link href={`/inventario/${producto.id}`}>
                                                <Button variant="ghost" size="icon" className="hover:bg-slate-200 hover:text-indigo-600">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button variant="ghost" size="icon" className="hover:bg-rose-50 hover:text-rose-600"
                                                onClick={() => handleDelete(producto.id, producto.nombre)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
            <p className="text-xs text-slate-400 text-right">{filtrados.length} de {productos.length} productos</p>
        </div>
    )
}
