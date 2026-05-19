"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTraspaso } from "@/actions/traspasos";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/shared/field";
import { ArrowLeft } from "lucide-react";

type Tienda = { id: number; nombreComercial: string };

interface Props {
  tiendas: Tienda[];
  idUsuario: number;
}

export function NuevoTraspasoForm({ tiendas, idUsuario }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    idTiendaOrigen: "",
    idTiendaDestino: "",
    observaciones: "",
  });
  const [errors, setErrors] = useState<{ idTiendaOrigen?: string; idTiendaDestino?: string }>({});
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    const e: typeof errors = {};
    if (!form.idTiendaOrigen) e.idTiendaOrigen = "Debes seleccionar una tienda de origen";
    if (!form.idTiendaDestino) e.idTiendaDestino = "Debes seleccionar una tienda de destino";
    if (form.idTiendaOrigen && form.idTiendaDestino && form.idTiendaOrigen === form.idTiendaDestino) {
      e.idTiendaDestino = "El destino no puede ser igual que el origen";
    }
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    setSaving(true);
    try {
      const traspaso = await createTraspaso({
        idTiendaOrigen: Number(form.idTiendaOrigen),
        idTiendaDestino: Number(form.idTiendaDestino),
        idUsuario,
        observaciones: form.observaciones || null,
      });
      toast.success("Traspaso creado. Añada líneas de producto.");
      router.push(`/traspasos/${traspaso.id}`);
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
        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => router.push("/traspasos")}>
          <ArrowLeft className="h-3 w-3 mr-1" /> Volver
        </Button>
        <h1 className="text-lg font-bold tracking-tight">Nuevo Traspaso</h1>
      </div>

      <Card className="max-w-xl">
        <CardHeader className="pb-3"><CardTitle className="text-sm">Cabecera de Traspaso</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-[11px] text-slate-400">
            Los campos marcados con <span className="text-rose-500 font-bold">*</span> son obligatorios.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Tienda Origen" required error={errors.idTiendaOrigen}>
              <Select value={form.idTiendaOrigen || "none"} onValueChange={(v) => setForm({ ...form, idTiendaOrigen: !v || v === "none" ? "" : v })}>
                <SelectTrigger className={errors.idTiendaOrigen ? "border-rose-400" : ""}>
                  <SelectValue placeholder="Seleccionar origen">
                    {form.idTiendaOrigen ? tiendas.find(t => String(t.id) === form.idTiendaOrigen)?.nombreComercial || "Tienda desconocida" : "Seleccionar origen"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" disabled>Seleccionar origen</SelectItem>
                  {tiendas.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>{t.nombreComercial}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Tienda Destino" required error={errors.idTiendaDestino}>
              <Select value={form.idTiendaDestino || "none"} onValueChange={(v) => setForm({ ...form, idTiendaDestino: !v || v === "none" ? "" : v })}>
                <SelectTrigger className={errors.idTiendaDestino ? "border-rose-400" : ""}>
                  <SelectValue placeholder="Seleccionar destino">
                    {form.idTiendaDestino ? tiendas.find(t => String(t.id) === form.idTiendaDestino)?.nombreComercial || "Tienda desconocida" : "Seleccionar destino"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" disabled>Seleccionar destino</SelectItem>
                  {tiendas.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>{t.nombreComercial}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Observaciones">
            <Textarea className="min-h-[60px]" value={form.observaciones} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} />
          </Field>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => router.push("/traspasos")}>Cancelar</Button>
            <Button size="sm" onClick={handleCreate} disabled={saving}>{saving ? "Creando..." : "Crear Traspaso"}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
