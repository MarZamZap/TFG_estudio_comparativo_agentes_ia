"use client"

import { useState } from "react"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"
import { registrarCompra } from "@/actions/compra"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { PackageSearch, Plus, Trash2, Save, Loader2, ArrowDownToLine } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

type Producto = {
    id: string;
    nombre: string;
    coste: string;
    codigoBarras: string | null;
    stockDisponible: number;
    proveedorId: string;
}

type Proveedor = {
    id: string;
    nombre: string;
}

interface ComprasClientProps {
    productos: Producto[];
    proveedores: Proveedor[];
}

type LineaCompra = {
    producto: Producto;
    cantidad: number;
    costeUnitario: number;
    subtotal: number;
}

export function ComprasClient({ productos, proveedores }: ComprasClientProps) {
    const router = useRouter()
    const [carrito, setCarrito] = useState<LineaCompra[]>([])
    const [busquedaProducto, setBusquedaProducto] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [notas, setNotas] = useState("")
    const [proveedorId, setProveedorId] = useState<string>("")

    const handleProveedorChange = (newProveedorId: string) => {
        if (carrito.length > 0 && newProveedorId !== proveedorId) {
            if (confirm("Cambiar de proveedor vaciará el lote de compras actual. ¿Deseas continuar?")) {
                setCarrito([])
                setProveedorId(newProveedorId)
            }
        } else {
            setProveedorId(newProveedorId)
        }
    }

    const _productosDelProveedor = productos.filter(p => !proveedorId || p.proveedorId === proveedorId)

    const productosFiltrados = busquedaProducto.trim() === ""
        ? _productosDelProveedor
        : _productosDelProveedor.filter(p =>
            p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
            (p.codigoBarras && p.codigoBarras.includes(busquedaProducto))
        )

    const addToCart = (producto: Producto) => {
        setCarrito(prev => {
            const current = prev.find(item => item.producto.id === producto.id)
            if (current) {
                return prev.map(item =>
                    item.producto.id === producto.id
                        ? { ...item, cantidad: item.cantidad + 1, subtotal: (item.cantidad + 1) * item.costeUnitario }
                        : item
                )
            }
            const defaultCoste = Number(producto.coste) || 0;
            return [...prev, { producto, cantidad: 1, costeUnitario: defaultCoste, subtotal: defaultCoste }]
        })
        setBusquedaProducto("")
    }

    const removeFromCart = (productoId: string) => {
        setCarrito(prev => prev.filter(item => item.producto.id !== productoId))
    }

    const updateLinea = (productoId: string, flag: 'coste' | 'cantidad', value: number) => {
        setCarrito(prev => prev.map(item => {
            if (item.producto.id === productoId) {
                const newCoste = flag === 'coste' ? value : item.costeUnitario;
                const newCant = flag === 'cantidad' ? value : item.cantidad;
                return { ...item, costeUnitario: newCoste, cantidad: newCant, subtotal: newCant * newCoste }
            }
            return item
        }))
    }

    const totalCompra = carrito.reduce((acc, item) => acc + item.subtotal, 0)

    const handleProcesarCompra = async () => {
        if (carrito.length === 0) return

        // Validación básica
        if (carrito.some(i => i.costeUnitario <= 0 || i.cantidad <= 0)) {
            toast.error("Toda línea debe tener coste y cantidad mayor a 0.")
            return
        }

        setIsSubmitting(true)
        try {
            const result = await registrarCompra({
                notas,
                lineas: carrito.map(item => ({
                    productoId: item.producto.id,
                    cantidad: item.cantidad,
                    precioUnitario: item.costeUnitario
                }))
            })

            if (result.success) {
                toast.success("Ingreso de mercancía registrado con éxito")
                setCarrito([])
                setNotas("")
                router.refresh()
            } else {
                toast.error(result.error || "Error al procesar la entrada")
            }
        } catch (error) {
            toast.error("Error inesperado al conectar con el servidor")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-[75vh] min-w-0">
            {/* PANEL IZQUIERDO: Búsqueda */}
            <div className="lg:col-span-8 flex flex-col gap-6">
                <Card className="shadow-sm border-0 border-t-4 border-t-emerald-500 overflow-visible">
                    <CardHeader className="pb-3 border-b bg-slate-50/50">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <PackageSearch className="h-5 w-5 text-emerald-500" />
                            Catálogo de Entrada
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                        <div className="relative mb-4">
                            <Input
                                placeholder="Escanear código o buscar por nombre para ingresar mercancía..."
                                className="pl-10 text-lg py-6 focus-visible:ring-emerald-500 shadow-inner bg-slate-50"
                                value={busquedaProducto}
                                onChange={(e) => setBusquedaProducto(e.target.value)}
                                autoFocus
                            />
                            <PackageSearch className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                        </div>

                        <div className="mb-4">
                            <Label htmlFor="proveedor" className="text-slate-700 font-medium mb-1.5 block">1. Seleccionar Proveedor del Albarán *</Label>
                            <select
                                id="proveedor"
                                value={proveedorId}
                                onChange={e => handleProveedorChange(e.target.value)}
                                className="flex h-11 w-full rounded-md border border-emerald-200 bg-emerald-50/50 px-3 py-2 text-md font-medium text-emerald-900 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                            >
                                <option value="" disabled>-- Elija un Proveedor para listar sus productos --</option>
                                {proveedores.map(prov => (
                                    <option key={prov.id} value={prov.id}>{prov.nombre}</option>
                                ))}
                            </select>
                        </div>

                        <div className="bg-white border rounded-md shadow-inner h-[50vh] overflow-y-auto">
                            {!proveedorId ? (
                                <div className="p-8 text-center text-slate-500 text-sm flex flex-col items-center justify-center h-full">
                                    <ArrowDownToLine className="mx-auto h-12 w-12 mb-2 opacity-20" />
                                    Seleccione un proveedor en la lista superior para visualizar su catálogo.
                                </div>
                            ) : productosFiltrados.length === 0 ? (
                                <div className="p-8 text-center text-slate-500 text-sm flex flex-col items-center justify-center h-full">
                                    <ArrowDownToLine className="mx-auto h-12 w-12 mb-2 opacity-20" />
                                    No se encontraron productos en el catálogo.
                                </div>
                            ) : (
                                <ul className="divide-y divide-slate-100">
                                    {productosFiltrados.map(prod => (
                                        <li key={prod.id} className="p-4 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between group transition-colors gap-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-slate-800 text-lg">{prod.nombre}</span>
                                                <div className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                                                    <span className="bg-slate-100 px-2 py-0.5 rounded text-xs">Stock: {prod.stockDisponible} uds</span>
                                                    <span>•</span>
                                                    <span className="text-xs">Cod: {prod.codigoBarras || "S/N"}</span>
                                                    <span>•</span>
                                                    <span className="text-xs font-medium text-emerald-600">Coste ref: {formatCurrency(Number(prod.coste) || 0)}</span>
                                                </div>
                                            </div>
                                            <Button
                                                className="bg-emerald-600 hover:bg-emerald-700 shadow-sm shrink-0"
                                                onClick={() => addToCart(prod)}
                                            >
                                                <Plus className="h-4 w-4 mr-2" /> Añadir al lote
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* PANEL DERECHO: CARRITO COMPRA */}
            <div className="lg:col-span-4 flex flex-col h-full">
                <Card className="flex flex-col h-full shadow-lg border-0 bg-white overflow-hidden ring-1 ring-slate-200 rounded-xl relative">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500"></div>
                    <CardHeader className="bg-slate-50 border-b pb-4 pt-5">
                        <CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
                            <ArrowDownToLine className="h-5 w-5 text-emerald-600" />
                            Lote de Entrada
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="flex-1 p-0 overflow-y-auto bg-slate-50/30">
                        {carrito.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center p-8 text-slate-400">
                                <p className="text-center">Seleccione productos para añadirlos al albarán de entrada.</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {carrito.map((item, index) => (
                                    <li key={index} className="p-4 hover:bg-white transition-colors flex flex-col gap-2">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-semibold text-slate-800 text-sm leading-tight">{item.producto.nombre}</h4>
                                            <button onClick={() => removeFromCart(item.producto.id)} className="text-red-400 hover:text-red-600" title="Eliminar">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                            <div>
                                                <Label className="text-[10px] text-slate-500">Cant. Entrada</Label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={item.cantidad || ''}
                                                    onChange={e => updateLinea(item.producto.id, 'cantidad', Number(e.target.value))}
                                                    className="h-8 shadow-sm"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-[10px] text-slate-500">Coste Unitario (€)</Label>
                                                <div className="h-8 flex items-center px-3 rounded-md border border-slate-200 bg-slate-50 text-sm font-semibold text-emerald-700">
                                                    {formatCurrency(item.costeUnitario)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right mt-1 font-bold text-slate-700 text-sm">
                                            Subtotal: {formatCurrency(item.subtotal)}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>

                    <div className="p-4 bg-white border-t border-slate-100">
                        <Label className="text-xs font-semibold text-slate-500 mb-2 block">Referencia Proveedor / Notas</Label>
                        <Input
                            value={notas}
                            onChange={(e) => setNotas(e.target.value)}
                            placeholder="Ej. Albarán #123456..."
                            className="bg-slate-50"
                        />
                    </div>

                    <CardFooter className="bg-slate-900 border-t flex flex-col gap-4 p-6">
                        <div className="flex items-center justify-between w-full">
                            <span className="text-slate-400 font-medium text-sm">Inversión (Egreso)</span>
                            <span className="text-2xl font-black text-rose-400 flex items-center">
                                - {formatCurrency(totalCompra)}
                            </span>
                        </div>
                        <Button
                            className="w-full h-12 text-md font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-md transition-all"
                            disabled={carrito.length === 0 || isSubmitting}
                            onClick={handleProcesarCompra}
                        >
                            {isSubmitting ? (
                                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Procesando...</>
                            ) : (
                                <><Save className="mr-2 h-5 w-5" /> REGISTRAR ENTRADA</>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
