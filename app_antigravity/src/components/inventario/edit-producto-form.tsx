"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { updateProducto, ajustarStock, updateStockMinimo } from "@/actions/producto"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Save, Loader2, Tag, LayoutGrid, Package2, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

const schema = z.object({
    nombre: z.string().min(2, "Mínimo 2 caracteres"),
    descripcion: z.string().optional(),
    precio: z.coerce.number().min(0),
    coste: z.coerce.number().min(0).optional(),
    codigoBarras: z.string().optional(),
    categoriaId: z.string().min(1, "Selecciona una categoría"),
    proveedorId: z.string().min(1, "Selecciona un proveedor"),
    marca: z.string().optional(),
    modelo: z.string().optional(),
    color: z.string().optional(),
    material: z.string().optional(),
    imageUrl: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
})

type FormValues = z.infer<typeof schema>

type StockEntry = { id: string; cantidad: number; stockMinimoAlerta: number; tienda: { id: string; nombre: string } }
type Producto = {
    id: string; nombre: string; descripcion: string; precio: number; coste?: number;
    codigoBarras: string; categoriaId: string; proveedorId: string;
    marca: string; modelo: string; color: string; material: string;
    imageUrl?: string | null;
    stocks: StockEntry[]
}

interface Props {
    producto: Producto
    categorias: { id: string; nombre: string }[]
    proveedores: { id: string; nombre: string }[]
}

function AjustarStockDialog({ stock }: { stock: StockEntry }) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [ajuste, setAjuste] = useState<number>(0)
    const [motivo, setMotivo] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleAjuste = async () => {
        if (ajuste === 0) { toast.error("El ajuste no puede ser 0"); return }
        if (!motivo.trim()) { toast.error("Indica un motivo para el ajuste"); return }
        setIsLoading(true)
        const res = await ajustarStock({ stockId: stock.id, ajuste, motivo })
        setIsLoading(false)
        if (res.success) {
            toast.success(`Stock ajustado: ${stock.cantidad} → ${(res.data as any).nuevaCantidad} uds.`)
            setOpen(false)
            router.refresh()
        } else {
            toast.error(res.error || "Error al ajustar")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-slate-600">
                    <Package2 className="h-4 w-4 mr-1" />Ajustar Stock
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Ajuste de Stock — {stock.tienda.nombre}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-slate-500 mb-1">Stock actual</p>
                        <p className="text-3xl font-bold text-slate-800">{stock.cantidad} uds.</p>
                    </div>
                    <div className="space-y-1">
                        <Label>Cantidad a ajustar (positivo = entrada, negativo = salida)</Label>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setAjuste(v => v - 1)} className="text-red-500">
                                <TrendingDown className="h-4 w-4" />
                            </Button>
                            <Input
                                type="number"
                                value={ajuste}
                                onChange={e => setAjuste(Number(e.target.value))}
                                className={`text-center font-bold ${ajuste > 0 ? 'text-emerald-600' : ajuste < 0 ? 'text-red-600' : ''}`}
                            />
                            <Button variant="outline" size="sm" onClick={() => setAjuste(v => v + 1)} className="text-emerald-500">
                                <TrendingUp className="h-4 w-4" />
                            </Button>
                        </div>
                        {ajuste !== 0 && (
                            <p className={`text-xs font-medium text-center ${stock.cantidad + ajuste < 0 ? 'text-red-500' : 'text-slate-500'}`}>
                                Resultado: {stock.cantidad + ajuste} uds.
                            </p>
                        )}
                    </div>
                    <div className="space-y-1">
                        <Label>Motivo *</Label>
                        <Input value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Ej. Inventario físico, rotura, devolución..." />
                    </div>
                    <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                        <Button onClick={handleAjuste} disabled={isLoading || ajuste === 0} className="bg-slate-800 hover:bg-slate-700">
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}Confirmar Ajuste
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function ConfigurarAlertaDialog({ stock }: { stock: StockEntry }) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [minimo, setMinimo] = useState<number>(stock.stockMinimoAlerta)
    const [isLoading, setIsLoading] = useState(false)

    const handleAjuste = async () => {
        if (minimo < 0) { toast.error("El stock mínimo no puede ser negativo"); return }
        setIsLoading(true)
        const res = await updateStockMinimo(stock.id, minimo)
        setIsLoading(false)
        if (res.success) {
            toast.success("Stock mínimo actualizado")
            setOpen(false)
            router.refresh()
        } else {
            toast.error(res.error || "Error al actualizar")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-amber-600 border-amber-200 bg-amber-50 hover:bg-amber-100 hover:text-amber-700">
                    <AlertTriangle className="h-4 w-4 mr-1" />Alerta: {stock.stockMinimoAlerta}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Configurar Alerta Mínima — {stock.tienda.nombre}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                    <div className="space-y-1">
                        <Label>Stock Mínimo (Límite de Alerta)</Label>
                        <Input
                            type="number"
                            value={minimo}
                            onChange={e => setMinimo(Number(e.target.value))}
                            className="font-bold"
                            min={0}
                        />
                        <p className="text-xs text-slate-500 mt-2">Recibirás alertas en el panel principal si el stock real baja de esta cantidad.</p>
                    </div>
                    <div className="flex gap-2 justify-end mt-4">
                        <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                        <Button onClick={handleAjuste} disabled={isLoading} className="bg-amber-600 hover:bg-amber-700">
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}Guardar Alerta
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export function EditProductoForm({ producto, categorias, proveedores }: Props) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema) as any,
        defaultValues: {
            nombre: producto.nombre,
            descripcion: producto.descripcion,
            precio: producto.precio,
            coste: producto.coste ?? 0,
            codigoBarras: producto.codigoBarras,
            categoriaId: producto.categoriaId,
            proveedorId: producto.proveedorId,
            marca: producto.marca,
            modelo: producto.modelo,
            color: producto.color,
            material: producto.material,
            imageUrl: producto.imageUrl || "",
        },
    })

    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true)
        try {
            const res = await updateProducto(producto.id, data)
            if (res.success) {
                toast.success("Producto actualizado correctamente")
                router.push("/inventario")
            } else {
                toast.error(res.error || "Error al actualizar")
            }
        } catch { toast.error("Error inesperado") }
        finally { setIsSubmitting(false) }
    }

    const selectClass = "flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"

    return (
        <div className="space-y-6">
            {/* Stock por tienda */}
            {producto.stocks.length > 0 && (
                <Card className="border-0 shadow-sm ring-1 ring-slate-100">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2 text-slate-700">
                            <Package2 className="h-4 w-4" />Stock por Tienda
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-3">
                            {producto.stocks.map(s => (
                                <div key={s.id} className="flex items-center gap-4 bg-slate-50 rounded-lg px-4 py-3 ring-1 ring-slate-200 w-full md:w-auto">
                                    <div className="flex-1">
                                        <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">{s.tienda.nombre}</p>
                                        <p className="font-bold text-slate-800 text-2xl leading-none">{s.cantidad} <span className="text-sm font-normal text-slate-500">uds.</span></p>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <AjustarStockDialog stock={s} />
                                        <ConfigurarAlertaDialog stock={s} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Formulario */}
            <Card className="border-0 shadow-xl ring-1 ring-slate-100 overflow-hidden">
                <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                <CardHeader className="bg-slate-50 border-b pb-4">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Tag className="h-5 w-5 text-indigo-600" />Datos del Producto
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1 md:col-span-2">
                                <Label>Nombre *</Label>
                                <Input {...register("nombre")} className={errors.nombre ? "border-red-400" : ""} />
                                {errors.nombre && <p className="text-xs text-red-500">{errors.nombre.message}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label>Categoría *</Label>
                                <select {...register("categoriaId")} className={`${selectClass} ${errors.categoriaId ? "border-red-400" : ""}`}>
                                    <option value="" disabled>— Seleccionar —</option>
                                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <Label>Proveedor *</Label>
                                <select {...register("proveedorId")} className={`${selectClass} ${errors.proveedorId ? "border-red-400" : ""}`}>
                                    <option value="" disabled>— Seleccionar —</option>
                                    {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <Label>P. Venta (€) *</Label>
                                <Input type="number" step="0.01" {...register("precio")} />
                            </div>
                            <div className="space-y-1">
                                <Label>P. Coste (€)</Label>
                                <Input type="number" step="0.01" {...register("coste")} />
                            </div>
                            <div className="space-y-1">
                                <Label>Código de Barras / SKU</Label>
                                <Input {...register("codigoBarras")} placeholder="EAN-13, SKU..." />
                            </div>
                            <div className="space-y-1 md:col-span-2">
                                <Label>URL de Imagen</Label>
                                <Input type="url" {...register("imageUrl")} placeholder="https://..." className={errors.imageUrl ? "border-red-400" : ""} />
                                {errors.imageUrl && <p className="text-xs text-red-500">{errors.imageUrl.message}</p>}
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h3 className="font-semibold text-slate-700 flex items-center gap-1 mb-3 text-sm">
                                <LayoutGrid className="h-4 w-4" />Atributos
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="space-y-1"><Label className="text-xs">Marca</Label><Input {...register("marca")} placeholder="Ray-Ban" /></div>
                                <div className="space-y-1"><Label className="text-xs">Modelo</Label><Input {...register("modelo")} placeholder="Wayfarer" /></div>
                                <div className="space-y-1"><Label className="text-xs">Color</Label><Input {...register("color")} placeholder="Negro mate" /></div>
                                <div className="space-y-1"><Label className="text-xs">Material</Label><Input {...register("material")} placeholder="Acetato" /></div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2 border-t">
                            <Button type="button" variant="outline" onClick={() => router.push("/inventario")}>Cancelar</Button>
                            <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 px-8">
                                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</> : <><Save className="mr-2 h-4 w-4" />Guardar Cambios</>}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
