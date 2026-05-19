"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { createProducto } from "@/actions/producto"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PackageSearch, Save, Loader2, Tag, LayoutGrid, Palette, Rss } from "lucide-react"

const productoSchema = z.object({
    nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    descripcion: z.string().optional(),
    precio: z.coerce.number().min(0, "El precio no puede ser negativo"),
    coste: z.coerce.number().min(0, "El coste no puede ser negativo").optional(),
    codigoBarras: z.string().optional(),
    categoriaId: z.string().min(1, "Debes seleccionar una categoría"),
    proveedorId: z.string().min(1, "Debes seleccionar un proveedor"),
    marca: z.string().optional(),
    modelo: z.string().optional(),
    color: z.string().optional(),
    material: z.string().optional(),
    imageUrl: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
})

export type ProductoFormValues = z.infer<typeof productoSchema>

interface ProductoFormProps {
    categorias: { id: string, nombre: string }[]
    proveedores: { id: string, nombre: string }[]
}

export function ProductoForm({ categorias, proveedores }: ProductoFormProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<ProductoFormValues>({
        resolver: zodResolver(productoSchema) as any,
        defaultValues: {
            nombre: "",
            descripcion: "",
            precio: 0,
            coste: 0,
            codigoBarras: "",
            categoriaId: "",
            proveedorId: "",
            marca: "",
            modelo: "",
            color: "",
            material: "",
            imageUrl: "",
        },
    })

    const categoriaValue = watch("categoriaId")

    const onSubmit = async (data: ProductoFormValues) => {
        setIsSubmitting(true)
        try {
            const result = await createProducto(data)
            if (result.success) {
                toast.success("Producto creado correctamente")
                router.push("/inventario")
            } else {
                toast.error(result.error || "Error al crear el producto")
            }
        } catch (error) {
            toast.error("Error inesperado de red")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Card className="max-w-3xl mx-auto border-0 shadow-xl overflow-hidden bg-white/80 backdrop-blur-xl">
            <div className="h-2 w-full bg-gradient-to-r from-emerald-600 via-teal-500 to-indigo-500" />
            <CardHeader className="space-y-1 bg-slate-50 border-b pb-6">
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <PackageSearch className="h-6 w-6 text-emerald-600" />
                    Registro de Nuevo Producto
                </CardTitle>
                <CardDescription className="text-slate-500 text-sm">
                    Añade un artículo al catálogo. El stock inicial será 0 y podrá ajustarse posteriormente.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {/* Información Básica */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-slate-800 flex items-center border-b pb-2">
                            <Tag className="mr-2 h-4 w-4" />
                            Información Básica
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="nombre" className="text-slate-700 font-medium">Nombre del Producto *</Label>
                                <Input
                                    id="nombre"
                                    placeholder="Ej. Montura Ray-Ban"
                                    className={`transition-all ${errors.nombre ? "border-red-500" : ""}`}
                                    {...register("nombre")}
                                />
                                {errors.nombre && <p className="text-xs text-red-500 font-medium">{errors.nombre.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="categoriaId" className="text-slate-700 font-medium">Categoría *</Label>
                                <select
                                    id="categoriaId"
                                    className={`flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.categoriaId ? "border-red-500" : ""}`}
                                    {...register("categoriaId")}
                                >
                                    <option value="" disabled>Seleccione una categoría</option>
                                    {categorias.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                    ))}
                                </select>
                                {errors.categoriaId && <p className="text-xs text-red-500 font-medium">{errors.categoriaId.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="precio" className="text-slate-700 font-medium">Precio de Venta (€) *</Label>
                                <Input
                                    id="precio"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    className={`transition-all ${errors.precio ? "border-red-500" : ""}`}
                                    {...register("precio")}
                                />
                                {errors.precio && <p className="text-xs text-red-500 font-medium">{errors.precio.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="coste" className="text-slate-700 font-medium">Coste Proveedor (€)</Label>
                                <Input
                                    id="coste"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    className={`transition-all ${errors.coste ? "border-red-500" : ""}`}
                                    {...register("coste")}
                                />
                                {errors.coste && <p className="text-xs text-red-500 font-medium">{errors.coste.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="codigoBarras" className="text-slate-700 font-medium">Código de Barras / SKU</Label>
                                <Input
                                    id="codigoBarras"
                                    placeholder="EAN-13, SKU..."
                                    {...register("codigoBarras")}
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="imageUrl" className="text-slate-700 font-medium">URL de la Imagen</Label>
                                <Input
                                    id="imageUrl"
                                    type="url"
                                    placeholder="https://ejemplo.com/imagen.png"
                                    className={`transition-all ${errors.imageUrl ? "border-red-500" : ""}`}
                                    {...register("imageUrl")}
                                />
                                {errors.imageUrl && <p className="text-xs text-red-500 font-medium">{errors.imageUrl.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="proveedorId" className="text-slate-700 font-medium">Proveedor de Origen *</Label>
                                <select
                                    id="proveedorId"
                                    className={`flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.proveedorId ? "border-red-500" : ""}`}
                                    {...register("proveedorId")}
                                >
                                    <option value="" disabled>Seleccione un proveedor</option>
                                    {proveedores.map(prov => (
                                        <option key={prov.id} value={prov.id}>{prov.nombre}</option>
                                    ))}
                                </select>
                                {errors.proveedorId && <p className="text-xs text-red-500 font-medium">{errors.proveedorId.message}</p>}
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="descripcion" className="text-slate-700 font-medium">Descripción</Label>
                                <textarea
                                    id="descripcion"
                                    className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
                                    placeholder="Detalles sobre el producto..."
                                    {...register("descripcion")}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Atributos Adicionales */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-slate-800 flex items-center border-b pb-2">
                            <LayoutGrid className="mr-2 h-4 w-4" />
                            Atributos Ópticos / Técnicos
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="marca" className="text-slate-700 font-medium">Marca</Label>
                                <Input id="marca" placeholder="Ej. Ray-Ban, Carrera" {...register("marca")} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="modelo" className="text-slate-700 font-medium">Modelo</Label>
                                <Input id="modelo" placeholder="Ej. Wayfarer RB2140" {...register("modelo")} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="color" className="text-slate-700 font-medium">Color</Label>
                                <Input id="color" placeholder="Ej. Negro Mate, Carey" {...register("color")} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="material" className="text-slate-700 font-medium">Material</Label>
                                <Input id="material" placeholder="Ej. Acetato, Metal" {...register("material")} />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-3 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            className="hover:bg-slate-100 transition-colors"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg disabled:opacity-70 px-8"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Guardar Producto
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
