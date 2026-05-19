"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createVenta } from "@/actions/ventas";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/shared/field";
import { ArrowLeft } from "lucide-react";

type Tienda = { id: number; nombreComercial: string };
type Cliente = { id: number; nombre: string; apellidos: string; numeroDocumento: string };

interface Props {
  tiendas: Tienda[];
  clientes: Cliente[];
  idUsuario: number;
}

export function NuevaVentaForm({ tiendas, clientes, idUsuario }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    idTienda: tiendas[0]?.id ? String(tiendas[0].id) : "",
    idCliente: "",
    formaPago: "EFECTIVO",
    observaciones: "",
  });
  const [errors, setErrors] = useState<{ idTienda?: string }>({});
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!form.idTienda) {
      setErrors({ idTienda: "Debes seleccionar una tienda" });
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const venta = await createVenta({
        idTienda: Number(form.idTienda),
        idCliente: form.idCliente ? Number(form.idCliente) : null,
        idUsuario,
        formaPago: form.formaPago || null,
        observaciones: form.observaciones || null,
      });
      toast.success("Venta creada. Añada líneas de producto.");
      router.push(`/ventas/${venta.id}`);
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
        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => router.push("/ventas")}>
          <ArrowLeft className="h-3 w-3 mr-1" /> Volver
        </Button>
        <h1 className="text-lg font-bold tracking-tight">Nueva Venta</h1>
      </div>

      <Card className="max-w-xl">
        <CardHeader className="pb-3"><CardTitle className="text-sm">Cabecera de Venta</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-[11px] text-slate-400">
            Los campos marcados con <span className="text-rose-500 font-bold">*</span> son obligatorios.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Tienda" required error={errors.idTienda}>
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

            <Field label="Cliente (opcional)">
              <Select value={form.idCliente || "none"} onValueChange={(v) => setForm({ ...form, idCliente: !v || v === "none" ? "" : v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sin cliente">
                    {form.idCliente && form.idCliente !== "none" ? (() => {
                      const c = clientes.find(c => String(c.id) === form.idCliente);
                      return c ? `${c.nombre} ${c.apellidos} — ${c.numeroDocumento}` : "Cliente desconocido";
                    })() : "Sin cliente"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin cliente</SelectItem>
                  {clientes.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.nombre} {c.apellidos} — {c.numeroDocumento}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Forma de Pago">
            <Select value={form.formaPago || "EFECTIVO"} onValueChange={(v) => setForm({ ...form, formaPago: v ?? "EFECTIVO" })}>
              <SelectTrigger>
                <SelectValue>
                  {form.formaPago === "EFECTIVO" ? "Efectivo" : 
                   form.formaPago === "TARJETA" ? "Tarjeta" : 
                   form.formaPago === "TRANSFERENCIA" ? "Transferencia" : 
                   form.formaPago === "BIZUM" ? "Bizum" : ""}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EFECTIVO">Efectivo</SelectItem>
                <SelectItem value="TARJETA">Tarjeta</SelectItem>
                <SelectItem value="TRANSFERENCIA">Transferencia</SelectItem>
                <SelectItem value="BIZUM">Bizum</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Observaciones">
            <Textarea className="min-h-[60px]" value={form.observaciones} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} />
          </Field>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => router.push("/ventas")}>Cancelar</Button>
            <Button size="sm" onClick={handleCreate} disabled={saving}>{saving ? "Creando..." : "Crear Venta"}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
