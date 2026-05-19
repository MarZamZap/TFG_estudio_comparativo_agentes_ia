import { getCategorias } from "@/actions/categoria"
import { CategoriasClient } from "@/components/admin/categorias-client"

export default async function CategoriasPage() {
    const categorias = await getCategorias()

    const serializedCategorias = categorias.map((cat) => ({
        id: cat.id,
        nombre: cat.nombre,
        idCategoriaPadre: cat.idCategoriaPadre,
        parentName: cat.parent?.nombre,
        productosCount: cat._count.productos,
        subcategoriasCount: cat._count.children
    }))

    return (
        <div className="flex flex-col gap-6 min-w-0">
            <div>
                <h3 className="text-xl font-semibold text-slate-800">Manejo de Categorías</h3>
                <p className="text-sm text-slate-500">
                    Administre la jerarquía de categorías para organizar el inventario.
                </p>
            </div>

            <CategoriasClient categorias={serializedCategorias} />
        </div>
    )
}
