"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createProducto, updateProducto } from "@/actions/productos";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Field } from "@/components/shared/field";
import { ArrowLeft, Save, Upload, X, ImageIcon } from "lucide-react";

const DEFAULT_IMAGE = "/images/no-product.png";

type Cat = { id: number; nombre: string; idCategoriaPadre: number | null };
type Prov = { id: number; nombre: string };
type ProductoData = {
  id: number; codigo: string; nombre: string; descripcion: string | null;
  marca: string | null; modelo: string | null; precioCoste: string; precioVenta: string;
  idCategoria: number | null; idProveedor: number | null; imageUrl: string | null; activo: boolean;
  atributos: {
    calibre: string | null; puente: string | null; varilla: string | null;
    colorCodigo: string | null; colorDescripcion: string | null; material: string | null;
    tipoMontura: string | null; genero: string | null;
  } | null;
};

type Errors = Partial<Record<"codigo" | "nombre" | "precioCoste" | "precioVenta", string>>;

export function ProductoForm({ producto, categorias, proveedores }: { producto?: ProductoData; categorias: Cat[]; proveedores: Prov[] }) {
  const router = useRouter();
  const isEdit = !!producto;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    codigo: producto?.codigo || "",
    nombre: producto?.nombre || "",
    descripcion: producto?.descripcion || "",
    marca: producto?.marca || "",
    modelo: producto?.modelo || "",
    precioCoste: producto ? Number(producto.precioCoste) : 0,
    precioVenta: producto ? Number(producto.precioVenta) : 0,
    idCategoria: producto?.idCategoria || null as number | null,
    idProveedor: producto?.idProveedor || null as number | null,
    imageUrl: producto?.imageUrl || "",
    activo: producto?.activo ?? true,
    calibre: producto?.atributos?.calibre || "",
    puente: producto?.atributos?.puente || "",
    varilla: producto?.atributos?.varilla || "",
    colorCodigo: producto?.atributos?.colorCodigo || "",
    colorDescripcion: producto?.atributos?.colorDescripcion || "",
    material: producto?.atributos?.material || "",
    tipoMontura: producto?.atributos?.tipoMontura || "",
    genero: producto?.atributos?.genero || "",
  });

  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imgError, setImgError] = useState(false);

  const previewSrc = imgError || !form.imageUrl ? DEFAULT_IMAGE : form.imageUrl;

  const validate = (): Errors => {
    const e: Errors = {};
    if (!form.codigo.trim()) e.codigo = "El código es obligatorio";
    if (!form.nombre.trim()) e.nombre = "El nombre es obligatorio";
    if (form.precioCoste <= 0) e.precioCoste = "El precio de coste debe ser mayor que 0";
    if (form.precioVenta <= 0) e.precioVenta = "El precio de venta debe ser mayor que 0";
    return e;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      setForm((f) => ({ ...f, imageUrl: json.url }));
      setImgError(false);
      toast.success("Imagen subida correctamente");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al subir imagen");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error("Corrige los campos marcados en rojo antes de guardar");
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      if (isEdit && producto) {
        await updateProducto(producto.id, form);
        toast.success("Producto actualizado");
      } else {
        await createProducto(form);
        toast.success("Producto creado");
      }
      router.push("/catalogo");
      router.refresh();
    } catch (e: unknown) {
      if (e instanceof Error) {
        try {
          const parsed = JSON.parse(e.message);
          toast.error(parsed[0].message);
        } catch {
          toast.error(e.message);
        }
      } else {
        toast.error("Error al guardar");
      }
    } finally {
      setSaving(false);
    }
  };

  const u = (field: string, value: unknown) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.push("/catalogo")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Volver al catálogo
        </Button>
        <div className="flex gap-2">
          <div className="flex items-center gap-2">
            <Switch checked={form.activo} onCheckedChange={(v) => u("activo", v)} />
            <Label className="text-xs">Activo</Label>
          </div>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-1" /> {saving ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </div>

      <p className="text-[11px] text-slate-400">
        Los campos marcados con <span className="text-rose-500 font-bold">*</span> son obligatorios.
      </p>

      <div className="grid grid-cols-3 gap-4">
        {/* Left column: Main data */}
        <Card className="col-span-2">
          <CardHeader className="pb-3"><CardTitle className="text-sm">Datos Comerciales</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <Field label="Código" required error={errors.codigo}>
                <Input className={errors.codigo ? "border-rose-400" : ""} value={form.codigo} onChange={(e) => u("codigo", e.target.value)} />
              </Field>
              <div className="col-span-2">
                <Field label="Nombre" required error={errors.nombre}>
                  <Input className={errors.nombre ? "border-rose-400" : ""} value={form.nombre} onChange={(e) => u("nombre", e.target.value)} />
                </Field>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Marca">
                <Input value={form.marca} onChange={(e) => u("marca", e.target.value)} />
              </Field>
              <Field label="Modelo">
                <Input value={form.modelo} onChange={(e) => u("modelo", e.target.value)} />
              </Field>
            </div>

            <Field label="Descripción">
              <Textarea className="min-h-[60px]" value={form.descripcion} onChange={(e) => u("descripcion", e.target.value)} />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Precio Coste (€)" required error={errors.precioCoste}>
                <Input
                  type="number" step="0.01" min="0"
                  className={errors.precioCoste ? "border-rose-400" : ""}
                  value={form.precioCoste}
                  onChange={(e) => u("precioCoste", Number(e.target.value))}
                />
              </Field>
              <Field label="Precio Venta (€)" required error={errors.precioVenta}>
                <Input
                  type="number" step="0.01" min="0"
                  className={errors.precioVenta ? "border-rose-400" : ""}
                  value={form.precioVenta}
                  onChange={(e) => u("precioVenta", Number(e.target.value))}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Categoría">
                <Select value={form.idCategoria ? String(form.idCategoria) : "none"} onValueChange={(v) => u("idCategoria", v === "none" ? null : Number(v))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sin categoría">
                      {form.idCategoria && form.idCategoria !== null ? categorias.find(c => String(c.id) === String(form.idCategoria))?.nombre || "Categoría desconocida" : "Sin categoría"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin categoría</SelectItem>
                    {categorias.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Proveedor">
                <Select value={form.idProveedor ? String(form.idProveedor) : "none"} onValueChange={(v) => u("idProveedor", v === "none" ? null : Number(v))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sin proveedor">
                      {form.idProveedor && form.idProveedor !== null ? proveedores.find(p => String(p.id) === String(form.idProveedor))?.nombre || "Proveedor desconocido" : "Sin proveedor"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin proveedor</SelectItem>
                    {proveedores.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.nombre}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </CardContent>
        </Card>

        {/* Right column: Image + Attributes */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5" /> Imagen del Producto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-muted/30">
                <img src={previewSrc} alt="Preview" className="w-full h-full object-contain p-2" onError={() => setImgError(true)} />
                {form.imageUrl && (
                  <button type="button" onClick={() => { u("imageUrl", ""); setImgError(false); }}
                    className="absolute top-1.5 right-1.5 rounded-full bg-destructive/90 p-0.5 text-white hover:bg-destructive transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              <Button variant="outline" size="sm" className="w-full" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                <Upload className="h-3.5 w-3.5 mr-1.5" />
                {uploading ? "Subiendo..." : "Subir imagen"}
              </Button>
              <Field label="O pega una URL">
                <Input className="text-xs" value={form.imageUrl} onChange={(e) => { u("imageUrl", e.target.value); setImgError(false); }} placeholder="https://..." />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Atributos Técnicos</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <Field label="Calibre"><Input className="text-xs" value={form.calibre} onChange={(e) => u("calibre", e.target.value)} /></Field>
                <Field label="Puente"><Input className="text-xs" value={form.puente} onChange={(e) => u("puente", e.target.value)} /></Field>
                <Field label="Varilla"><Input className="text-xs" value={form.varilla} onChange={(e) => u("varilla", e.target.value)} /></Field>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Cód. Color"><Input className="text-xs" value={form.colorCodigo} onChange={(e) => u("colorCodigo", e.target.value)} /></Field>
                <Field label="Desc. Color"><Input className="text-xs" value={form.colorDescripcion} onChange={(e) => u("colorDescripcion", e.target.value)} /></Field>
              </div>
              <Field label="Material"><Input className="text-xs" value={form.material} onChange={(e) => u("material", e.target.value)} /></Field>
              <Field label="Tipo Montura"><Input className="text-xs" value={form.tipoMontura} onChange={(e) => u("tipoMontura", e.target.value)} /></Field>
              <Field label="Género">
                <Select value={form.genero || "none"} onValueChange={(v) => u("genero", v === "none" ? "" : v)}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="—">
                      {form.genero && form.genero !== "none" ? form.genero : "—"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">—</SelectItem>
                    <SelectItem value="Hombre">Hombre</SelectItem>
                    <SelectItem value="Mujer">Mujer</SelectItem>
                    <SelectItem value="Unisex">Unisex</SelectItem>
                    <SelectItem value="Niño">Niño</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
