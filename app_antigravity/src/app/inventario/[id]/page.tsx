import { notFound } from "next/navigation"
import { getProducto } from "@/actions/producto"
import { getCategorias } from "@/actions/categoria"
import { getProveedores } from "@/actions/proveedor"
import { EditProductoForm } from "@/components/inventario/edit-producto-form"
import Link from "next/link"
import { ArrowLeft, Package } from "lucide-react"

export const dynamic = "force-dynamic"

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function EditProductoPage({ params }: PageProps) {
    const { id } = await params
    const [resProducto, categoriasRaw, resProveedores] = await Promise.all([
        getProducto(id),
        getCategorias(),
        getProveedores()
    ])

    if (!resProducto.success || !resProducto.data) notFound()

    const p = resProducto.data!
    const categorias = categoriasRaw ?? []
    const proveedores = resProveedores.success ? (resProveedores.data ?? []) : []

    const serializedProducto = {
        id: p.id,
        nombre: p.nombre,
        descripcion: p.descripcion ?? "",
        precio: Number(p.precio),
        coste: p.coste ? Number(p.coste) : undefined,
        codigoBarras: p.codigoBarras ?? "",
        categoriaId: p.categoria.id,
        proveedorId: p.proveedorId ?? "",
        marca: p.atributo?.marca ?? "",
        modelo: p.atributo?.modelo ?? "",
        color: p.atributo?.color ?? "",
        material: p.atributo?.material ?? "",
        stocks: p.stocks.map(s => ({
            id: s.id,
            cantidad: s.cantidad,
            stockMinimoAlerta: s.stockMinimoAlerta,
            tienda: { id: s.tienda.id, nombre: s.tienda.nombre }
        }))
    }

    const serializedCategorias = categorias.map(c => ({ id: c.id, nombre: c.nombre }))
    const serializedProveedores = proveedores.map(prov => ({ id: prov.id, nombre: prov.nombre }))

    return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-8 flex flex-col gap-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <Link href="/inventario" className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all text-slate-600 hover:text-indigo-600">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
                        <Package className="h-6 w-6 text-indigo-600" />
                        Editar Producto
                    </h2>
                    <p className="text-sm text-slate-500">{p.nombre}</p>
                </div>
            </div>
            <EditProductoForm
                producto={serializedProducto}
                categorias={serializedCategorias}
                proveedores={serializedProveedores}
            />
        </div>
    )
}
