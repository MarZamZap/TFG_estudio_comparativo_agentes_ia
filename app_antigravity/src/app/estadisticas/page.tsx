import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, ShoppingCart, PackageOpen, TrendingUp, ArrowUpRight, ArrowDownRight, ReceiptText, ArrowRightLeft, Boxes, Truck, Tag, BarChart3 } from "lucide-react"
import { OverviewChart } from "@/components/dashboard/overview-chart"
import { TopProductsChart } from "@/components/dashboard/top-products-chart"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { EstadisticasFiltros } from "@/components/dashboard/estadisticas-filtros"

export const dynamic = "force-dynamic"

const TIPO_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
    VENTA: { label: "Venta", bg: "bg-blue-50", text: "text-blue-700" },
    COMPRA: { label: "Compra", bg: "bg-emerald-50", text: "text-emerald-700" },
    TRASPASO: { label: "Traspaso", bg: "bg-orange-50", text: "text-orange-700" },
}

function getRangoLabel(rango: string) {
    switch (rango) {
        case 'hoy': return 'Hoy'
        case 'mes': return 'Mes Actual'
        case 'trimestre': return 'Último Trimestre'
        case 'ano': return 'Año Actual'
        default: return 'Mes Actual'
    }
}

export default async function EstadisticasPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const params = await searchParams;
    const tiendaId = typeof params.tiendaId === 'string' ? params.tiendaId : undefined;
    const rangoStr = typeof params.rango === 'string' ? params.rango : 'mes';

    const now = new Date()
    let startDate = new Date();
    let prevStartDate = new Date();
    let prevEndDate = new Date();

    if (rangoStr === 'hoy') {
        startDate.setHours(0, 0, 0, 0);
        prevStartDate = new Date(startDate);
        prevStartDate.setDate(prevStartDate.getDate() - 1);
        prevEndDate = new Date(startDate);
        prevEndDate.setMilliseconds(-1);
    } else if (rangoStr === 'mes') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        prevStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        prevEndDate = new Date(now.getFullYear(), now.getMonth(), 0);
    } else if (rangoStr === 'trimestre') {
        startDate.setMonth(startDate.getMonth() - 3);
        prevStartDate = new Date(startDate);
        prevStartDate.setMonth(prevStartDate.getMonth() - 3);
        prevEndDate = new Date(startDate);
    } else if (rangoStr === 'ano') {
        startDate = new Date(now.getFullYear(), 0, 1);
        prevStartDate = new Date(now.getFullYear() - 1, 0, 1);
        prevEndDate = new Date(now.getFullYear() - 1, 11, 31);
    }

    // ---------- DATA FETCHING ----------
    let totalRango = 0
    let totalAnterior = 0
    let clientesNuevos = 0
    let stockCritico = 0
    let nVentasRango = 0
    let nComprasRango = 0
    let nTraspasosRango = 0
    let totalComprasRango = 0
    let chartData: { name: string; total: number }[] = []
    let topProductos: { nombre: string; unidades: number }[] = []
    let ultimasOps: { id: string; tipo: string; fecha: string; totalOperacion: number; clienteNombre: string | null; usuario: string }[] = []
    let tiendas: { id: string, nombre: string }[] = []
    let totalProductos = 0
    let totalProveedores = 0
    let totalCategorias = 0
    let totalClientes = 0
    let valorInventario = 0
    let stockPorCategoria: { nombre: string; unidades: number }[] = []
    let proveedoresTop: { nombre: string; productos: number }[] = []
    let distribucionTiendas: { nombre: string; unidades: number }[] = []
    let tiendaNombre = "Todas las Ópticas"

    try {
        const tiendaWhere = tiendaId ? { tiendaId } : {};

        const [
            ventasRango,
            ventasAnterior,
            numVentasRango,
            numComprasRango,
            numTraspasosRango,
            comprasRangoAgg,
            numClientesNuevos,
            numStockCritico,
            ventasChartGrouped,
            lineasTop,
            recientes,
            allTiendas,
            countProductos,
            countProveedores,
            countCategorias,
            countClientes,
            inventarioAgg,
        ] = await Promise.all([
            prisma.operacionCabecera.aggregate({
                _sum: { totalOperacion: true },
                where: { tipo: "VENTA", createdAt: { gte: startDate }, ...tiendaWhere },
            }),
            prisma.operacionCabecera.aggregate({
                _sum: { totalOperacion: true },
                where: { tipo: "VENTA", createdAt: { gte: prevStartDate, lte: prevEndDate }, ...tiendaWhere },
            }),
            prisma.operacionCabecera.count({
                where: { tipo: "VENTA", createdAt: { gte: startDate }, ...tiendaWhere },
            }),
            prisma.operacionCabecera.count({
                where: { tipo: "COMPRA", createdAt: { gte: startDate }, ...tiendaWhere },
            }),
            prisma.operacionCabecera.count({
                where: { tipo: "TRASPASO", createdAt: { gte: startDate }, ...tiendaWhere },
            }),
            prisma.operacionCabecera.aggregate({
                _sum: { totalOperacion: true },
                where: { tipo: "COMPRA", createdAt: { gte: startDate }, ...tiendaWhere },
            }),
            prisma.cliente.count({ where: { createdAt: { gte: startDate } } }),
            prisma.stock.count({
                where: { cantidad: { lte: 5 }, ...(tiendaId ? { tiendaId } : {}) }
            }),
            prisma.operacionCabecera.groupBy({
                by: ["fecha"],
                _sum: { totalOperacion: true },
                where: { tipo: "VENTA", fecha: { gte: startDate }, ...tiendaWhere },
                orderBy: { fecha: "asc" },
            }),
            prisma.operacionLinea.groupBy({
                by: ["productoId"],
                _sum: { cantidad: true },
                where: { operacion: { tipo: "VENTA", createdAt: { gte: startDate }, ...tiendaWhere } },
                orderBy: { _sum: { cantidad: "desc" } },
                take: 5,
            }),
            prisma.operacionCabecera.findMany({
                where: { ...tiendaWhere },
                orderBy: { fecha: "desc" },
                take: 8,
                include: {
                    cliente: { select: { nombre: true, apellido: true } },
                    usuario: { select: { nombre: true } },
                },
            }),
            prisma.tienda.findMany({ select: { id: true, nombre: true }, orderBy: { nombre: 'asc' } }),
            prisma.producto.count(),
            prisma.proveedor.count(),
            prisma.categoria.count(),
            prisma.cliente.count(),
            prisma.stock.aggregate({
                _sum: { cantidad: true },
                where: tiendaId ? { tiendaId } : {},
            }),
        ])

        totalRango = Number(ventasRango._sum.totalOperacion || 0)
        totalAnterior = Number(ventasAnterior._sum.totalOperacion || 0)
        nVentasRango = numVentasRango
        nComprasRango = numComprasRango
        nTraspasosRango = numTraspasosRango
        totalComprasRango = Number(comprasRangoAgg._sum.totalOperacion || 0)
        clientesNuevos = numClientesNuevos
        stockCritico = numStockCritico
        tiendas = allTiendas
        totalProductos = countProductos
        totalProveedores = countProveedores
        totalCategorias = countCategorias
        totalClientes = countClientes

        if (tiendaId) {
            const t = allTiendas.find(t => t.id === tiendaId)
            if (t) tiendaNombre = t.nombre
        }

        // Valor del inventario (precio * stock) 
        const stocksForValue = await prisma.stock.findMany({
            where: tiendaId ? { tiendaId } : {},
            include: { producto: { select: { precio: true } } }
        })
        valorInventario = stocksForValue.reduce((acc, s) => acc + (Number(s.producto.precio) * s.cantidad), 0)

        // Stock por categoría
        const catStocks = await prisma.stock.findMany({
            where: tiendaId ? { tiendaId } : {},
            include: { producto: { include: { categoria: { select: { nombre: true } } } } }
        })
        const catMap = new Map<string, number>()
        catStocks.forEach(s => {
            const catName = s.producto.categoria.nombre
            catMap.set(catName, (catMap.get(catName) || 0) + s.cantidad)
        })
        stockPorCategoria = Array.from(catMap.entries())
            .map(([nombre, unidades]) => ({ nombre, unidades }))
            .sort((a, b) => b.unidades - a.unidades)
            .slice(0, 6)

        // Proveedores top (por número de productos)
        const proveedoresRaw = await prisma.proveedor.findMany({
            include: { _count: { select: { productos: true } } },
            orderBy: { productos: { _count: 'desc' } },
            take: 5,
        })
        proveedoresTop = proveedoresRaw.map(p => ({ nombre: p.nombre, productos: p._count.productos }))

        // Distribución de stock por tienda
        const tiendasStock = await prisma.stock.groupBy({
            by: ['tiendaId'],
            _sum: { cantidad: true },
        })
        const tiendaIdMap = new Map(allTiendas.map(t => [t.id, t.nombre]))
        distribucionTiendas = tiendasStock.map(ts => ({
            nombre: tiendaIdMap.get(ts.tiendaId) || 'Desconocida',
            unidades: Number(ts._sum.cantidad || 0)
        })).sort((a, b) => b.unidades - a.unidades)

        // Chart data
        const formatOptions: Intl.DateTimeFormatOptions =
            rangoStr === 'ano' ? { month: "short" } : { weekday: "short", day: "2-digit", month: "short" };
        chartData = ventasChartGrouped.map((op) => ({
            name: new Date(op.fecha).toLocaleDateString("es-ES", formatOptions),
            total: Number(op._sum.totalOperacion || 0),
        }))

        // Top products names
        if (lineasTop.length > 0) {
            const productoIds = lineasTop.map((l) => l.productoId)
            const productos = await prisma.producto.findMany({
                where: { id: { in: productoIds } },
                select: { id: true, nombre: true },
            })
            const productoMap = new Map(productos.map((p) => [p.id, p.nombre]))
            topProductos = lineasTop.map((l) => ({
                nombre: productoMap.get(l.productoId) || "Desconocido",
                unidades: Number(l._sum.cantidad || 0),
            }))
        }

        // Serialize latest ops
        ultimasOps = recientes.map((op) => ({
            id: op.id,
            tipo: op.tipo,
            fecha: op.fecha.toISOString(),
            totalOperacion: Number(op.totalOperacion),
            clienteNombre: op.cliente ? `${op.cliente.nombre} ${op.cliente.apellido}` : null,
            usuario: op.usuario.nombre,
        }))
    } catch (error) {
        console.error("Dashboard metrics error:", error)
    }

    const variacion = totalAnterior > 0 ? ((totalRango - totalAnterior) / totalAnterior) * 100 : null
    const ticketMedio = nVentasRango > 0 ? totalRango / nVentasRango : 0
    const margenBruto = totalRango - totalComprasRango

    return (
        <div className="flex flex-col gap-6 w-full max-w-[1600px] mx-auto p-4 md:p-8 animate-in fade-in duration-500 min-w-0">
            {/* Header + Filtros */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6">
                <div className="flex flex-col gap-1">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-800">
                        Dashboard y Analítica
                    </h2>
                    <p className="text-muted-foreground">
                        {tiendaNombre} • {getRangoLabel(rangoStr)}
                    </p>
                </div>
                <EstadisticasFiltros tiendas={tiendas} />
            </div>

            {/* ═══════════ SECCIÓN 1: KPIs FINANCIEROS ═══════════ */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-md transition-shadow border-0 shadow-sm ring-1 ring-slate-100 bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Ingresos por Ventas</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                            <ShoppingCart className="h-4 w-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-800">{formatCurrency(totalRango)}</div>
                        {variacion !== null ? (
                            <p className={`text-xs flex items-center mt-1 font-medium ${variacion >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                                {variacion >= 0 ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                                {Math.abs(variacion).toFixed(1)}% vs. periodo ant.
                            </p>
                        ) : (
                            <p className="text-xs text-slate-400 mt-1">Sin datos anteriores</p>
                        )}
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow border-0 shadow-sm ring-1 ring-slate-100 bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Gasto en Compras</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-amber-50 flex items-center justify-center">
                            <Boxes className="h-4 w-4 text-amber-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-800">{formatCurrency(totalComprasRango)}</div>
                        <p className="text-xs text-slate-400 mt-1">{nComprasRango} compra{nComprasRango !== 1 ? 's' : ''} registrada{nComprasRango !== 1 ? 's' : ''}</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow border-0 shadow-sm ring-1 ring-slate-100 bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Margen Bruto</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center">
                            <TrendingUp className="h-4 w-4 text-emerald-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-3xl font-bold ${margenBruto >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>{formatCurrency(margenBruto)}</div>
                        <p className="text-xs text-slate-400 mt-1">Ventas − Compras</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all hover:-translate-y-1 bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 border-none text-white overflow-hidden relative shadow-md">
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10 blur-2xl" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-indigo-100">Ticket Medio</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                            <BarChart3 className="h-4 w-4 text-indigo-200" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-bold">{formatCurrency(ticketMedio)}</div>
                        <p className="text-xs text-indigo-200/80 mt-1">Media de {nVentasRango} venta{nVentasRango !== 1 ? 's' : ''}</p>
                    </CardContent>
                </Card>
            </div>

            {/* ═══════════ SECCIÓN 2: ACTIVIDAD OPERACIONAL ═══════════ */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card className="border-0 shadow-sm ring-1 ring-slate-100 bg-white">
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500 font-medium">Ventas Realizadas</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-blue-700">{nVentasRango}</div></CardContent>
                </Card>
                <Card className="border-0 shadow-sm ring-1 ring-slate-100 bg-white">
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500 font-medium">Compras Realizadas</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-emerald-700">{nComprasRango}</div></CardContent>
                </Card>
                <Card className="border-0 shadow-sm ring-1 ring-slate-100 bg-white">
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500 font-medium">Traspasos</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-orange-600">{nTraspasosRango}</div></CardContent>
                </Card>
                <Card className="border-0 shadow-sm ring-1 ring-slate-100 bg-white">
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500 font-medium">Nuevos Pacientes</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-slate-800">+{clientesNuevos}</div></CardContent>
                </Card>
                <Card className="border-0 shadow-sm ring-1 ring-slate-100 border-b-4 border-b-rose-400 bg-white">
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500 font-medium">Stock Bajo Mínimo</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-rose-600">{stockCritico} <span className="text-sm font-medium text-slate-400">ítems</span></div></CardContent>
                </Card>
            </div>

            {/* ═══════════ SECCIÓN 3: GRÁFICOS DE VENTAS ═══════════ */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 mt-2">
                <Card className="col-span-1 lg:col-span-4 h-[440px] shadow-sm border-0 ring-1 ring-slate-100 bg-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base text-slate-800">Evolución de Ingresos</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-0 pb-4">
                        {chartData.length > 0 ? (
                            <OverviewChart data={chartData} />
                        ) : (
                            <div className="h-[350px] flex items-center justify-center text-slate-300 flex-col gap-2">
                                <TrendingUp className="h-10 w-10 opacity-30" />
                                <p className="text-sm">No hay ventas para graficar en este periodo.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="col-span-1 lg:col-span-3 flex flex-col gap-6 h-[440px]">
                    <Card className="flex-1 shadow-sm border-0 ring-1 ring-slate-100 bg-white overflow-hidden">
                        <CardHeader className="pb-1">
                            <CardTitle className="text-base text-slate-800">Top 5 Productos Vendidos</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                            <TopProductsChart data={topProductos} />
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* ═══════════ SECCIÓN 4: INVENTARIO Y CATÁLOGO ═══════════ */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-0 shadow-sm ring-1 ring-slate-100 bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm text-slate-500 font-medium">Valor del Inventario</CardTitle>
                        <PackageOpen className="h-4 w-4 text-indigo-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-800">{formatCurrency(valorInventario)}</div>
                        <p className="text-xs text-slate-400 mt-1">Precio × unidades en stock</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm ring-1 ring-slate-100 bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm text-slate-500 font-medium">Productos en Catálogo</CardTitle>
                        <Tag className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-800">{totalProductos}</div>
                        <p className="text-xs text-slate-400 mt-1">{totalCategorias} categoría{totalCategorias !== 1 ? 's' : ''} activa{totalCategorias !== 1 ? 's' : ''}</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm ring-1 ring-slate-100 bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm text-slate-500 font-medium">Proveedores</CardTitle>
                        <Truck className="h-4 w-4 text-teal-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-800">{totalProveedores}</div>
                        <p className="text-xs text-slate-400 mt-1">Registrados en el sistema</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm ring-1 ring-slate-100 bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm text-slate-500 font-medium">Pacientes Totales</CardTitle>
                        <Users className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-800">{totalClientes}</div>
                        <p className="text-xs text-slate-400 mt-1">Base de datos clínica</p>
                    </CardContent>
                </Card>
            </div>

            {/* ═══════════ SECCIÓN 5: DISTRIBUCIÓN DE STOCK ═══════════ */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Stock por Categoría */}
                <Card className="shadow-sm border-0 ring-1 ring-slate-100 bg-white">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base text-slate-800 flex items-center gap-2">
                            <Tag className="h-4 w-4 text-purple-500" />
                            Stock por Categoría
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stockPorCategoria.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-6">Sin datos</p>
                        ) : (
                            <div className="space-y-3">
                                {stockPorCategoria.map((cat, i) => {
                                    const max = stockPorCategoria[0]?.unidades || 1
                                    const pct = Math.round((cat.unidades / max) * 100)
                                    return (
                                        <div key={i}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="font-medium text-slate-700 truncate max-w-[70%]">{cat.nombre}</span>
                                                <span className="text-slate-500 tabular-nums">{cat.unidades} uds</span>
                                            </div>
                                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Top Proveedores */}
                <Card className="shadow-sm border-0 ring-1 ring-slate-100 bg-white">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base text-slate-800 flex items-center gap-2">
                            <Truck className="h-4 w-4 text-teal-500" />
                            Top Proveedores (por productos)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {proveedoresTop.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-6">Sin datos</p>
                        ) : (
                            <div className="space-y-3">
                                {proveedoresTop.map((prov, i) => {
                                    const max = proveedoresTop[0]?.productos || 1
                                    const pct = Math.round((prov.productos / max) * 100)
                                    return (
                                        <div key={i}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="font-medium text-slate-700 truncate max-w-[70%]">{prov.nombre}</span>
                                                <span className="text-slate-500 tabular-nums">{prov.productos} prod.</span>
                                            </div>
                                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Distribución por Tienda */}
                <Card className="shadow-sm border-0 ring-1 ring-slate-100 bg-white">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base text-slate-800 flex items-center gap-2">
                            <Boxes className="h-4 w-4 text-blue-500" />
                            Stock por Sucursal
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {distribucionTiendas.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-6">Sin datos</p>
                        ) : (
                            <div className="space-y-3">
                                {distribucionTiendas.map((t, i) => {
                                    const max = distribucionTiendas[0]?.unidades || 1
                                    const pct = Math.round((t.unidades / max) * 100)
                                    return (
                                        <div key={i}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="font-medium text-slate-700 truncate max-w-[70%]">{t.nombre}</span>
                                                <span className="text-slate-500 tabular-nums">{t.unidades} uds</span>
                                            </div>
                                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* ═══════════ SECCIÓN 6: ACTIVIDAD RECIENTE ═══════════ */}
            <Card className="shadow-sm border-0 ring-1 ring-slate-100 bg-white">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-base text-slate-800 flex items-center gap-2">
                        <ReceiptText className="h-4 w-4 text-indigo-500" />
                        Actividad Transaccional Reciente
                    </CardTitle>
                    <Link href="/operaciones/historial" className="text-xs text-indigo-600 hover:underline font-medium">
                        Historial completo →
                    </Link>
                </CardHeader>
                <CardContent className="p-0">
                    {ultimasOps.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-8">No hay historial en esta consulta.</p>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {ultimasOps.map((op) => {
                                const cfg = TIPO_CONFIG[op.tipo] ?? TIPO_CONFIG.VENTA
                                return (
                                    <Link key={op.id} href={`/operaciones/historial/${op.id}`} className="flex items-center gap-4 px-6 py-3 hover:bg-slate-50/70 transition-colors group">
                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${cfg.bg} ${cfg.text}`}>
                                            {cfg.label}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-700 truncate">
                                                {op.clienteNombre ?? (op.tipo === "TRASPASO" ? "Traspaso Interno" : "Cliente Genérico")}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {op.usuario} · {new Date(op.fecha).toLocaleString("es-ES", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                                            </p>
                                        </div>
                                        <span className="text-sm font-bold text-slate-800 tabular-nums shrink-0">
                                            {op.tipo === "TRASPASO" ? "—" : formatCurrency(op.totalOperacion)}
                                        </span>
                                        <ArrowRightLeft className="h-3.5 w-3.5 text-slate-300 group-hover:text-indigo-400 transition-colors shrink-0" />
                                    </Link>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
