"use client"

import { useState } from "react"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"
import { registrarVenta } from "@/actions/venta"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, User, Plus, Trash2, Tag, Euro, Save, Loader2, PackageSearch } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

// Types that closely match Prisma models for the props
type Producto = {
    id: string;
    nombre: string;
    precio: number | any; // Prisma.Decimal handling
    codigoBarras: string | null;
    stockDisponible: number;
}

type Cliente = {
    id: string;
    nombre: string;
    apellido: string;
    dni: string | null;
}

interface VentasClientProps {
    productos: Producto[];
    clientes: Cliente[];
    usuarioId: string;
    tiendaId: string;
}

type LineaCarrito = {
    producto: Producto;
    cantidad: number;
    subtotal: number;
}

export function VentasClient({ productos, clientes, usuarioId, tiendaId }: VentasClientProps) {
    const router = useRouter()
    const [clienteId, setClienteId] = useState<string>("")
    const [carrito, setCarrito] = useState<LineaCarrito[]>([])
    const [busquedaProducto, setBusquedaProducto] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [notas, setNotas] = useState("")

    const productosFiltrados = productos.filter(p =>
        p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
        (p.codigoBarras && p.codigoBarras.includes(busquedaProducto))
    ).slice(0, 5) // Muestra max 5 sugerencias

    const addToCart = (producto: Producto) => {
        const existing = carrito.find(item => item.producto.id === producto.id)
        if (existing && existing.cantidad >= producto.stockDisponible) {
            toast.error("Stock insuficiente")
            return
        }

        setCarrito(prev => {
            const current = prev.find(item => item.producto.id === producto.id)
            if (current) {
                return prev.map(item =>
                    item.producto.id === producto.id
                        ? { ...item, cantidad: item.cantidad + 1, subtotal: (item.cantidad + 1) * Number(producto.precio) }
                        : item
                )
            }
            return [...prev, { producto, cantidad: 1, subtotal: Number(producto.precio) }]
        })
        setBusquedaProducto("")
    }

    const removeFromCart = (productoId: string) => {
        setCarrito(prev => prev.filter(item => item.producto.id !== productoId))
    }

    const totalVenta = carrito.reduce((acc, item) => acc + item.subtotal, 0)

    const handleProcesarVenta = async () => {
        if (carrito.length === 0) {
            toast.error("El carrito está vacío")
            return
        }

        setIsSubmitting(true)
        try {
            const result = await registrarVenta({
                tiendaId: tiendaId,
                clienteId: clienteId || undefined,
                notas,
                lineas: carrito.map(item => ({
                    productoId: item.producto.id,
                    cantidad: item.cantidad,
                    precioUnitario: Number(item.producto.precio)
                }))
            })

            if (result.success) {
                toast.success("Venta procesada con éxito")
                setCarrito([])
                setClienteId("")
                setNotas("")
                router.refresh()
            } else {
                toast.error(result.error || "Error al procesar la venta")
            }
        } catch (error) {
            toast.error("Error inesperado al conectar con el servidor")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-[75vh] min-w-0">
            {/* PANEL IZQUIERDO: Búsqueda y Selección */}
            <div className="lg:col-span-8 flex flex-col gap-6">
                <Card className="shadow-sm border-0 border-t-4 border-t-indigo-500 overflow-visible">
                    <CardHeader className="pb-3 border-b bg-slate-50/50">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <PackageSearch className="h-5 w-5 text-indigo-500" />
                            Búsqueda de Productos
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                        <div className="relative mb-4">
                            <Input
                                placeholder="Escanear código de barras o buscar por nombre..."
                                className="pl-10 text-lg py-6 focus-visible:ring-indigo-500 shadow-inner bg-slate-50"
                                value={busquedaProducto}
                                onChange={(e) => setBusquedaProducto(e.target.value)}
                                autoFocus
                            />
                            <ShoppingCart className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                        </div>

                        {busquedaProducto.length > 0 && (
                            <div className="bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                                {productosFiltrados.length === 0 ? (
                                    <div className="p-4 text-center text-slate-500 text-sm">No se encontraron productos</div>
                                ) : (
                                    <ul className="divide-y">
                                        {productosFiltrados.map(prod => (
                                            <li key={prod.id} className="p-3 hover:bg-slate-50 flex items-center justify-between group transition-colors">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-slate-800">{prod.nombre}</span>
                                                    <span className="text-xs text-slate-500">Stock: {prod.stockDisponible} uds • {prod.codigoBarras || "Sin código"}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-bold text-indigo-700">{formatCurrency(prod.precio)}</span>
                                                    <Button
                                                        size="sm"
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-600 hover:bg-indigo-700"
                                                        onClick={() => addToCart(prod)}
                                                        disabled={prod.stockDisponible <= 0}
                                                    >
                                                        <Plus className="h-4 w-4 mr-1" /> Add
                                                    </Button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}

                        {busquedaProducto.length === 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                                {/* Catálogo Rápido (Favoritos o Más vendidos simulación) */}
                                {productos.slice(0, 8).map(prod => (
                                    <Button
                                        key={prod.id}
                                        variant="outline"
                                        className="h-auto flex-col items-start p-3 hover:border-indigo-500 hover:bg-indigo-50 text-left bg-white transition-all shadow-sm"
                                        onClick={() => addToCart(prod)}
                                        disabled={prod.stockDisponible <= 0}
                                    >
                                        <span className="font-semibold line-clamp-1 w-full">{prod.nombre}</span>
                                        <div className="flex justify-between w-full mt-2 items-center">
                                            <span className="text-xs text-slate-500">{prod.stockDisponible} uds</span>
                                            <span className="text-sm font-bold text-indigo-700">{formatCurrency(prod.precio)}</span>
                                        </div>
                                    </Button>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-0 border-t-4 border-t-blue-500">
                    <CardHeader className="pb-3 border-b bg-slate-50/50">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <User className="h-5 w-5 text-blue-500" />
                            Vinculación de Cliente (Opcional)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                        <select
                            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={clienteId}
                            onChange={(e) => setClienteId(e.target.value)}
                        >
                            <option value="">Cliente Genérico (Venta de Mostrador)</option>
                            {clientes.map(cli => (
                                <option key={cli.id} value={cli.id}>
                                    {cli.nombre} {cli.apellido} {cli.dni ? `(${cli.dni})` : ''}
                                </option>
                            ))}
                        </select>
                    </CardContent>
                </Card>
            </div>

            {/* PANEL DERECHO: TICKET / CARRITO */}
            <div className="lg:col-span-4 flex flex-col h-full">
                <Card className="flex flex-col h-full shadow-lg border-0 bg-white overflow-hidden ring-1 ring-slate-200 rounded-xl relative">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                    <CardHeader className="bg-slate-50 border-b pb-4 pt-5">
                        <CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
                            <ShoppingCart className="h-5 w-5 text-teal-600" />
                            Ticket Actual
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="flex-1 p-0 overflow-y-auto bg-slate-50/30">
                        {carrito.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center p-8 text-slate-400">
                                <ShoppingCart className="h-16 w-16 mb-4 opacity-20" />
                                <p className="text-center">Escanee o seleccione productos para añadirlos a la venta.</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {carrito.map((item, index) => (
                                    <li key={index} className="p-4 hover:bg-white transition-colors flex gap-3">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-slate-800 text-sm leading-tight mb-1">{item.producto.nombre}</h4>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <span>{item.cantidad} uds</span>
                                                <span>x {formatCurrency(item.producto.precio)}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end justify-between">
                                            <span className="font-bold text-slate-800">{formatCurrency(item.subtotal)}</span>
                                            <button
                                                onClick={() => removeFromCart(item.producto.id)}
                                                className="text-red-400 hover:text-red-600 transition-colors mt-2"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>

                    <div className="p-4 bg-white border-t border-slate-100">
                        <Label className="text-xs font-semibold text-slate-500 mb-2 block">NOTAS DE VENTA</Label>
                        <Input
                            value={notas}
                            onChange={(e) => setNotas(e.target.value)}
                            placeholder="Ej. Promoción 2x1 aplicada..."
                            className="bg-slate-50"
                        />
                    </div>

                    <CardFooter className="bg-slate-900 border-t flex flex-col gap-4 p-6">
                        <div className="flex items-center justify-between w-full">
                            <span className="text-slate-400 font-medium">Total a Pagar</span>
                            <span className="text-3xl font-black text-white flex items-center">
                                {formatCurrency(totalVenta)}
                            </span>
                        </div>
                        <Button
                            className="w-full h-14 text-lg font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-xl transition-all"
                            disabled={carrito.length === 0 || isSubmitting}
                            onClick={handleProcesarVenta}
                        >
                            {isSubmitting ? (
                                <><Loader2 className="mr-2 h-6 w-6 animate-spin" /> Procesando...</>
                            ) : (
                                <><Save className="mr-2 h-6 w-6" /> COBRAR</>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
