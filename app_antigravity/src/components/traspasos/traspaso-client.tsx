"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { registrarTraspaso } from "@/actions/traspaso"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRightLeft, PackageSearch, Plus, Trash2, ArrowDownToLine, Loader2, Check } from "lucide-react"

type Tienda = { id: string; nombre: string }
type Producto = {
    id: string
    nombre: string
    codigoBarras: string | null
    stockPorTienda: { tiendaId: string; cantidad: number }[]
}

type LineaTraspaso = {
    producto: Producto
    cantidad: number | string
}

interface TraspasoClientProps {
    tiendas: Tienda[]
    productos: Producto[]
}

export function TraspasoClient({ tiendas, productos }: TraspasoClientProps) {
    const router = useRouter()
    const [tiendaOrigenId, setTiendaOrigenId] = useState("")
    const [tiendaDestinoId, setTiendaDestinoId] = useState("")
    const [busqueda, setBusqueda] = useState("")
    const [carrito, setCarrito] = useState<LineaTraspaso[]>([])
    const [notas, setNotas] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const productosConStockEnOrigen = tiendaOrigenId
        ? productos.filter(p => {
            const stockOrigen = p.stockPorTienda.find(s => s.tiendaId === tiendaOrigenId)
            return stockOrigen && stockOrigen.cantidad > 0
        })
        : []

    const productosFiltrados = busqueda.trim() === ""
        ? productosConStockEnOrigen
        : productosConStockEnOrigen.filter(p =>
            p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            (p.codigoBarras && p.codigoBarras.includes(busqueda))
        )

    const addToCarrito = (producto: Producto) => {
        const already = carrito.find(l => l.producto.id === producto.id)
        if (already) { toast("Ya está en el lote"); return }
        setCarrito(prev => [...prev, { producto, cantidad: 1 }])
    }

    const updateCantidad = (productoId: string, val: string) => {
        setCarrito(prev => prev.map(l => {
            if (l.producto.id !== productoId) return l;
            if (val === "") return { ...l, cantidad: "" };
            const num = parseInt(val);
            return { ...l, cantidad: isNaN(num) ? "" : num };
        }))
    }

    const removeFromCarrito = (productoId: string) => {
        setCarrito(prev => prev.filter(l => l.producto.id !== productoId))
    }

    const handleOrigenChange = (newId: string) => {
        if (carrito.length > 0 && newId !== tiendaOrigenId) {
            if (confirm("Cambiar la tienda origen vaciará el lote. ¿Continuar?")) {
                setCarrito([])
                setTiendaOrigenId(newId)
            }
        } else {
            setTiendaOrigenId(newId)
        }
    }

    const handleSubmit = async () => {
        if (!tiendaOrigenId) { toast.error("Selecciona la tienda ORIGEN"); return }
        if (!tiendaDestinoId) { toast.error("Selecciona la tienda DESTINO"); return }
        if (tiendaOrigenId === tiendaDestinoId) { toast.error("El origen y destino no pueden ser la misma tienda"); return }
        if (carrito.length === 0) { toast.error("Añade al menos un producto al traspaso"); return }

        setIsSubmitting(true)
        try {
            const result = await registrarTraspaso({
                tiendaOrigenId,
                tiendaDestinoId,
                notas,
                lineas: carrito.map(l => ({ productoId: l.producto.id, cantidad: Number(l.cantidad) || 1 }))
            })
            if (result.success) {
                toast.success(`Traspaso registrado correctamente`)
                setCarrito([])
                setNotas("")
                router.refresh()
            } else {
                toast.error(result.error || "Error al registrar el traspaso")
            }
        } catch { toast.error("Error inesperado") }
        finally { setIsSubmitting(false) }
    }

    const stockEnOrigen = (producto: Producto) =>
        producto.stockPorTienda.find(s => s.tiendaId === tiendaOrigenId)?.cantidad ?? 0

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-w-0">
            {/* PANEL IZQUIERDO: Selección de tiendas + catálogo */}
            <div className="lg:col-span-7 flex flex-col gap-4">
                <Card className="border-0 shadow-lg ring-1 ring-slate-200 rounded-xl">
                    <CardHeader className="bg-slate-50 border-b pb-4 pt-5">
                        <CardTitle className="flex items-center gap-2 text-slate-800">
                            <ArrowRightLeft className="h-5 w-5 text-orange-500" />
                            Configuración del Traspaso
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-5 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-slate-700 font-medium mb-1.5 block">1. Tienda Origen</Label>
                                <select
                                    value={tiendaOrigenId}
                                    onChange={e => handleOrigenChange(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-orange-200 bg-orange-50/50 px-3 py-2 text-sm font-medium text-orange-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                                >
                                    <option value="" disabled>— Tienda que envía —</option>
                                    {tiendas.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                                </select>
                            </div>
                            <div>
                                <Label className="text-slate-700 font-medium mb-1.5 block">2. Tienda Destino</Label>
                                <select
                                    value={tiendaDestinoId}
                                    onChange={e => setTiendaDestinoId(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-indigo-200 bg-indigo-50/50 px-3 py-2 text-sm font-medium text-indigo-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                                >
                                    <option value="" disabled>— Tienda que recibe —</option>
                                    {tiendas.filter(t => t.id !== tiendaOrigenId).map(t => (
                                        <option key={t.id} value={t.id}>{t.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {tiendaOrigenId && (
                            <div className="relative">
                                <PackageSearch className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="3. Buscar producto por nombre o código..."
                                    value={busqueda}
                                    onChange={e => setBusqueda(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Catálogo filtrado */}
                <Card className="border-0 shadow-sm ring-1 ring-slate-200 rounded-xl flex-1">
                    <CardContent className="p-0">
                        <div className="h-[42vh] overflow-y-auto">
                            {!tiendaOrigenId ? (
                                <div className="p-10 text-center text-slate-400 text-sm flex flex-col items-center justify-center h-full">
                                    <ArrowRightLeft className="h-10 w-10 mb-3 opacity-20" />
                                    Selecciona una tienda origen para ver los productos disponibles.
                                </div>
                            ) : productosFiltrados.length === 0 ? (
                                <div className="p-10 text-center text-slate-400 text-sm flex flex-col items-center justify-center h-full">
                                    <PackageSearch className="h-10 w-10 mb-3 opacity-20" />
                                    {busqueda ? `No se encontró "${busqueda}"` : "No hay productos con stock disponible en esta tienda."}
                                </div>
                            ) : (
                                <ul className="divide-y divide-slate-100">
                                    {productosFiltrados.map(prod => {
                                        const enCarrito = carrito.some(l => l.producto.id === prod.id)
                                        const disponible = stockEnOrigen(prod)
                                        return (
                                            <li key={prod.id} className={`p-4 flex justify-between items-center hover:bg-slate-50 transition-colors ${enCarrito ? 'bg-orange-50/50' : ''}`}>
                                                <div>
                                                    <p className="font-semibold text-slate-800">{prod.nombre}</p>
                                                    <p className="text-xs text-slate-400">
                                                        Stock disponible: <span className="font-bold text-orange-600">{disponible} uds.</span>
                                                        {prod.codigoBarras && <> · <span className="font-mono">{prod.codigoBarras}</span></>}
                                                    </p>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant={enCarrito ? "outline" : "default"}
                                                    className={enCarrito ? "text-orange-600 border-orange-300" : "bg-orange-500 hover:bg-orange-600"}
                                                    onClick={() => addToCarrito(prod)}
                                                    disabled={enCarrito}
                                                >
                                                    {enCarrito ? <><Check className="h-4 w-4 mr-1" />Añadido</> : <><Plus className="h-4 w-4 mr-1" />Añadir</>}
                                                </Button>
                                            </li>
                                        )
                                    })}
                                </ul>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* PANEL DERECHO: Lote de traspaso */}
            <div className="lg:col-span-5 flex flex-col">
                <Card className="flex flex-col h-full shadow-lg border-0 bg-white overflow-hidden ring-1 ring-slate-200 rounded-xl relative">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-orange-500" />
                    <CardHeader className="bg-slate-50 border-b pb-4 pt-5">
                        <CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
                            <ArrowDownToLine className="h-5 w-5 text-orange-500" />
                            Lote de Traspaso
                            {carrito.length > 0 && (
                                <span className="ml-auto text-sm bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold">
                                    {carrito.length} línea{carrito.length !== 1 ? 's' : ''}
                                </span>
                            )}
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="flex-1 p-0 overflow-y-auto">
                        {carrito.length === 0 ? (
                            <div className="h-full flex items-center justify-center p-8 text-slate-400 text-sm text-center">
                                <p>Selecciona productos del catálogo de la izquierda.</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {carrito.map((item) => {
                                    const disponible = stockEnOrigen(item.producto)
                                    const excede = Number(item.cantidad) > disponible
                                    return (
                                        <li key={item.producto.id} className="p-4 flex flex-col gap-2">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-semibold text-slate-800 text-sm leading-tight">{item.producto.nombre}</h4>
                                                <button onClick={() => removeFromCarrito(item.producto.id)} className="text-red-400 hover:text-red-600">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1">
                                                    <Label className="text-[10px] text-slate-500">Cantidad a traspasar</Label>
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        max={disponible}
                                                        value={item.cantidad}
                                                        onChange={e => updateCantidad(item.producto.id, e.target.value)}
                                                        className={`h-8 shadow-sm ${excede ? 'border-red-400 text-red-600' : ''}`}
                                                    />
                                                </div>
                                                <div className="text-xs text-slate-400 text-right pt-4">
                                                    Máx: <span className="font-bold text-orange-500">{disponible}</span>
                                                </div>
                                            </div>
                                            {excede && (
                                                <p className="text-xs text-red-500">⚠ Excede el stock disponible ({disponible} uds.)</p>
                                            )}
                                        </li>
                                    )
                                })}
                            </ul>
                        )}
                    </CardContent>

                    <div className="p-4 bg-white border-t space-y-3">
                        <div>
                            <Label className="text-xs font-semibold text-slate-500 mb-1 block">Notas / Referencia interna</Label>
                            <Input
                                value={notas}
                                onChange={e => setNotas(e.target.value)}
                                placeholder="Ej. Reposición por campaña de verano..."
                                className="h-9 text-sm"
                            />
                        </div>
                        <Button
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold h-12 text-base shadow-md disabled:opacity-60"
                            onClick={handleSubmit}
                            disabled={isSubmitting || carrito.length === 0 || !tiendaOrigenId || !tiendaDestinoId || carrito.some(l => Number(l.cantidad) > stockEnOrigen(l.producto) || Number(l.cantidad) <= 0)}
                        >
                            {isSubmitting ? (
                                <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Registrando...</>
                            ) : (
                                <><ArrowRightLeft className="mr-2 h-5 w-5" />Confirmar Traspaso</>
                            )}
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    )
}
