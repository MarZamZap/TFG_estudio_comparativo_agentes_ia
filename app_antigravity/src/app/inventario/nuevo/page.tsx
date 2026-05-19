import { ProductoForm } from "@/components/inventario/producto-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { getProveedores } from "@/actions/proveedor"

export const dynamic = "force-dynamic";

export default async function NuevoProductoPage() {
    const categorias = await prisma.categoria.findMany({
        select: { id: true, nombre: true },
        orderBy: { nombre: 'asc' }
    });

    const resProveedores = await getProveedores();
    const proveedores = resProveedores.success ? resProveedores.data || [] : [];

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500 slide-in-from-bottom-4 min-w-0">
            <div className="flex items-center gap-4 mb-4">
                <Link href="/inventario" className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all text-slate-600 hover:text-blue-600">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div className="flex flex-col">
                    <h2 className="text-2xl font-bold tracking-tight">Alta de Producto</h2>
                    <p className="text-muted-foreground text-sm">
                        Catálogo e Inventario Central
                    </p>
                </div>
            </div>

            <ProductoForm categorias={categorias} proveedores={proveedores} />
        </div>
    )
}
