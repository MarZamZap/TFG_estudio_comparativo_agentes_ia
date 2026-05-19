"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCompra } from "@/actions/compras";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/shared/field";
import { ArrowLeft } from "lucide-react";

type Tienda = { id: number; nombreComercial: string };
type Proveedor = { id: number; nombre: string };

interface Props {
  tiendas: Tienda[];
  proveedores: Proveedor[];
  idUsuario: number;
}

export function NuevaCompraForm({ tiendas, proveedores, idUsuario }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    idTienda: tiendas[0]?.id ? String(tiendas[0].id) : "",
    idProveedor: "",
    observaciones: "",
  });
  const [errors, setErrors] = useState<{ idTienda?: string; idProveedor?: string }>({});
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    const e: typeof errors = {};
    if (!form.idTienda) e.idTienda = "Debes seleccionar una tienda";
    if (!form.idProveedor) e.idProveedor = "Debes seleccionar un proveedor";
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    setSaving(true);
    try {
      const compra = await createCompra({
        idTienda: Number(form.idTienda),
        idProveedor: Number(form.idProveedor),
        idUsuario,
        observaciones: form.observaciones || null,
      });
      toast.success("Compra creada. Añada líneas de producto.");
      router.push(`/compras/${compra.id}`);
    } catch (e: unknown) {
      if (e instanceof Error) {
        try {
          const parsed = JSON.parse(e.message);
          toast.error(parsed[0].message);
        } catch {
          toast.error(e.message);
        }
      } else {
        toast.error("Error al crear");
      }
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => router.push("/compras")}>
          <ArrowLeft className="h-3 w-3 mr-1" /> Volver
        </Button>
        <h1 className="text-lg font-bold tracking-tight">Nueva Compra</h1>
      </div>

      <Card className="max-w-xl">
        <CardHeader className="pb-3"><CardTitle className="text-sm">Cabecera de Compra</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-[11px] text-slate-400">
            Los campos marcados con <span className="text-rose-500 font-bold">*</span> son obligatorios.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Tienda (destino)" required error={errors.idTienda}>
              <Select value={form.idTienda || undefined} onValueChange={(v) => setForm({ ...form, idTienda: v ?? "" })}>
                <SelectTrigger className={errors.idTienda ? "border-rose-400" : ""}>
                  <SelectValue placeholder="Seleccionar tienda">
                    {form.idTienda ? tiendas.find(t => String(t.id) === form.idTienda)?.nombreComercial || "Tienda desconocida" : "Seleccionar tienda"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {tiendas.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>{t.nombreComercial}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Proveedor" required error={errors.idProveedor}>
              <Select value={form.idProveedor || "none"} onValueChange={(v) => setForm({ ...form, idProveedor: !v || v === "none" ? "" : v })}>
                <SelectTrigger className={errors.idProveedor ? "border-rose-400" : ""}>
                  <SelectValue placeholder="Seleccionar proveedor">
                    {form.idProveedor && form.idProveedor !== "none" ? proveedores.find(p => String(p.id) === form.idProveedor)?.nombre || "Proveedor desconocido" : "Seleccionar proveedor"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" disabled>Seleccionar proveedor</SelectItem>
                  {proveedores.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Observaciones">
            <Textarea className="min-h-[60px]" value={form.observaciones} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} />
          </Field>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => router.push("/compras")}>Cancelar</Button>
            <Button size="sm" onClick={handleCreate} disabled={saving}>{saving ? "Creando..." : "Crear Compra"}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
