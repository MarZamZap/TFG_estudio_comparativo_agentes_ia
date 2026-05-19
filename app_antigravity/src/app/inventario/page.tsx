import { Suspense } from "react"
import Link from "next/link"
import prisma from "@/lib/prisma"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, AlertTriangle, PackageSearch, Truck } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { InventarioSearch } from "@/components/inventario/inventario-search"
import { TiendaSelector } from "@/components/inventario/tienda-selector"

export const dynamic = "force-dynamic";

async function InventarioContent({ tiendaId }: { tiendaId?: string }) {
    const [productos, tiendas] = await Promise.all([
        prisma.producto.findMany({
            include: {
                categoria: true,
                atributo: true,
                proveedor: { select: { nombre: true } },
                stocks: tiendaId ? { where: { tiendaId } } : true
            },
            orderBy: { nombre: 'asc' }
        }),
        prisma.tienda.findMany({ select: { id: true, nombre: true }, orderBy: { nombre: 'asc' } })
    ]);

    const valorTotal = productos.reduce((acc, p) => {
        const stock = p.stocks.reduce((s, stock) => s + stock.cantidad, 0);
        return acc + (Number(p.precio) * stock);
    }, 0);

    const bajo = productos.filter(p => {
        const stockTotal = p.stocks.reduce((a, s) => a + s.cantidad, 0);
        const minimo = p.stocks.reduce((a, s) => a + s.stockMinimoAlerta, 0);
        return stockTotal <= minimo;
    }).length;

    const costeReposicion = productos.reduce((acc, p) => {
        const stockTotal = p.stocks.reduce((a, s) => a + s.cantidad, 0);
        const minimo = p.stocks.reduce((a, s) => a + s.stockMinimoAlerta, 0);

        if (stockTotal <= minimo && p.coste) {
            // Calculamos cuánto falta para que salga de la advertencia de stock crítico
            const cantidadAReponer = (minimo + 1) - stockTotal;
            return acc + (Number(p.coste) * cantidadAReponer);
        }
        return acc;
    }, 0);

    const serialized = productos.map(p => ({
        id: p.id,
        nombre: p.nombre,
        codigoBarras: p.codigoBarras,
        precio: Number(p.precio),
        coste: p.coste ? Number(p.coste) : null,
        categoria: p.categoria.nombre,
        marca: p.atributo?.marca ?? null,
        modelo: p.atributo?.modelo ?? null,
        proveedor: p.proveedor?.nombre ?? null,
        imageUrl: p.imageUrl,
        stockTotal: p.stocks.reduce((a, s) => a + s.cantidad, 0),
        stockMinimo: p.stocks.reduce((a, s) => a + s.stockMinimoAlerta, 0),
    }));

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-end">
                <TiendaSelector tiendas={tiendas} />
            </div>

            <div className="grid gap-4 md:grid-cols-3 mb-2">
                <Card className="shadow-sm border-0 ring-1 ring-slate-100 bg-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Valor en Inventario</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-800">{formatCurrency(valorTotal)}</div>
                        <p className="text-xs text-slate-400 mt-1">{productos.length} referencias en catálogo</p>
                    </CardContent>
                </Card>
                <Card className={`shadow-sm border-0 ring-1 ${bajo > 0 ? 'ring-amber-300 bg-amber-50' : 'ring-slate-100 bg-white'}`}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-amber-700">Stock Crítico</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-2 text-amber-700">
                            <AlertTriangle className="h-5 w-5" />
                            {bajo} {bajo === 1 ? 'producto' : 'productos'}
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-0 ring-1 ring-indigo-100 bg-indigo-50/30">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-indigo-700">Coste de Reposición (Stock Crítico)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-indigo-700">
                            {formatCurrency(costeReposicion)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <InventarioSearch productos={serialized} />
        </div>
    )
}

export default async function InventarioPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const params = await searchParams;
    const tiendaId = typeof params.tiendaId === 'string' ? params.tiendaId : undefined;

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500 min-w-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h2 className="text-3xl font-bold tracking-tight">Inventario y Catálogo</h2>
                    <p className="text-muted-foreground">
                        Gestiona productos, precios de coste, categorías y niveles de existencias.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/gestion/proveedores">
                        <Button variant="outline" className="bg-white">
                            <Truck className="mr-2 h-4 w-4" />Proveedores
                        </Button>
                    </Link>
                    <Link href="/inventario/nuevo">
                        <Button className="bg-indigo-600 hover:bg-indigo-700">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Añadir Producto
                        </Button>
                    </Link>
                </div>
            </div>

            <Suspense fallback={
                <div className="border rounded-md bg-white p-12 flex justify-center text-slate-400">
                    <PackageSearch className="mr-2 h-5 w-5 animate-pulse" />Cargando inventario...
                </div>
            }>
                <InventarioContent tiendaId={tiendaId} />
            </Suspense>
        </div>
    )
}
