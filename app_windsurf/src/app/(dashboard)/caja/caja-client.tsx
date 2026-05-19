"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUpCircle, ArrowDownCircle, Wallet, Plus } from "lucide-react";
import { createMovimientoCaja } from "@/actions/caja";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Movimiento = {
  id: number;
  tipo: string;
  importe: string;
  formaPago: string | null;
  concepto: string | null;
  fecha: string;
  tienda: { nombreComercial: string };
  operacion: { id: number; tipo: string } | null;
  usuario: { nombreCompleto: string };
};

type Tienda = { id: number; nombreComercial: string };

interface Resumen {
  totalIngresos: number;
  countIngresos: number;
  totalEgresos: number;
  countEgresos: number;
  saldo: number;
}

const formatEUR = (v: number) =>
  v.toLocaleString("es-ES", { style: "currency", currency: "EUR" });

export function CajaClient({
  data,
  resumen,
  tiendas,
  idUsuario,
}: {
  data: Movimiento[];
  resumen: Resumen;
  tiendas: Tienda[];
  idUsuario?: number;
}) {
  const router = useRouter();
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    idTienda: tiendas[0]?.id ? String(tiendas[0].id) : "",
    tipo: "INGRESO" as "INGRESO" | "EGRESO",
    importe: "",
    formaPago: "EFECTIVO",
    concepto: "",
  });

  const handleCreate = async () => {
    if (!form.idTienda || !form.importe) {
      toast.error("Tienda e importe son obligatorios");
      return;
    }
    setSaving(true);
    try {
      await createMovimientoCaja({
        idTienda: Number(form.idTienda),
        idUsuario: idUsuario || 1,
        tipo: form.tipo,
        importe: Number(form.importe),
        formaPago: form.formaPago || null,
        concepto: form.concepto || null,
      });
      toast.success("Movimiento registrado");
      setShowNew(false);
      setForm({ idTienda: tiendas[0]?.id ? String(tiendas[0].id) : "", tipo: "INGRESO", importe: "", formaPago: "EFECTIVO", concepto: "" });
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
        toast.error("Error al registrar");
      }
    } finally { setSaving(false); }
  };

  const columns: ColumnDef<Movimiento>[] = [
    {
      accessorKey: "fecha",
      header: "Fecha",
      cell: ({ row }) =>
        new Date(row.original.fecha).toLocaleString("es-ES", {
          dateStyle: "short",
          timeStyle: "short",
        }),
    },
    {
      id: "tienda",
      header: "Tienda",
      cell: ({ row }) => row.original.tienda.nombreComercial,
    },
    {
      accessorKey: "tipo",
      header: "Tipo",
      cell: ({ row }) => (
        <Badge
          variant={row.original.tipo === "INGRESO" ? "default" : "destructive"}
        >
          {row.original.tipo}
        </Badge>
      ),
    },
    {
      accessorKey: "importe",
      header: "Importe",
      cell: ({ row }) => (
        <span
          className={`font-mono font-semibold ${row.original.tipo === "INGRESO" ? "text-emerald-400" : "text-rose-400"}`}
        >
          {row.original.tipo === "INGRESO" ? "+" : "-"}
          {formatEUR(Number(row.original.importe))}
        </span>
      ),
    },
    {
      accessorKey: "formaPago",
      header: "Forma Pago",
      cell: ({ row }) => row.original.formaPago || "—",
    },
    {
      accessorKey: "concepto",
      header: "Concepto",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.concepto || "—"}</span>
      ),
    },
    {
      id: "operacion",
      header: "Operación",
      cell: ({ row }) =>
        row.original.operacion ? (
          <span className="font-mono text-xs">
            {row.original.operacion.tipo} #{row.original.operacion.id}
          </span>
        ) : (
          "—"
        ),
    },
    {
      id: "usuario",
      header: "Usuario",
      cell: ({ row }) => row.original.usuario.nombreCompleto,
    },
  ];

  return (
    <>
      <div className="grid gap-3 md:grid-cols-3">
        <Card className="bg-card border-border accent-bar-emerald">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground flex items-center gap-1.5">
              <ArrowUpCircle className="h-3.5 w-3.5 text-emerald-400" />
              Ingresos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold data-value text-emerald-400">
              {formatEUR(resumen.totalIngresos)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              {resumen.countIngresos} movimiento(s)
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border accent-bar-rose">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground flex items-center gap-1.5">
              <ArrowDownCircle className="h-3.5 w-3.5 text-rose-400" />
              Egresos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold data-value text-rose-400">
              {formatEUR(resumen.totalEgresos)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              {resumen.countEgresos} movimiento(s)
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border accent-bar-indigo">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Wallet className="h-3.5 w-3.5 text-indigo-400" />
              Saldo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-xl font-semibold data-value ${resumen.saldo >= 0 ? "text-emerald-400" : "text-rose-400"}`}
            >
              {formatEUR(resumen.saldo)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Balance neto
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowNew(true)}>
          <Plus className="h-4 w-4 mr-1" /> Nuevo Movimiento
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Buscar por concepto, tienda, usuario..."
      />

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Nuevo Movimiento de Caja</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Tienda *</Label>
                <Select value={form.idTienda || undefined} onValueChange={(v) => setForm({ ...form, idTienda: v ?? "" })}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Tienda">
                      {form.idTienda ? tiendas.find(t => String(t.id) === form.idTienda)?.nombreComercial || "Tienda desconocida" : "Tienda"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>{tiendas.map((t) => <SelectItem key={t.id} value={String(t.id)}>{t.nombreComercial}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Tipo *</Label>
                <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: (v ?? "INGRESO") as "INGRESO" | "EGRESO" })}>
                  <SelectTrigger className="h-8">
                    <SelectValue>
                      {form.tipo === "INGRESO" ? "Ingreso" : form.tipo === "EGRESO" ? "Egreso" : ""}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INGRESO">Ingreso</SelectItem>
                    <SelectItem value="EGRESO">Egreso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Importe * (€)</Label>
                <Input className="h-8" type="number" step="0.01" min="0.01" value={form.importe} onChange={(e) => setForm({ ...form, importe: e.target.value })} placeholder="0.00" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Forma de Pago</Label>
                <Select value={form.formaPago || "EFECTIVO"} onValueChange={(v) => setForm({ ...form, formaPago: v ?? "EFECTIVO" })}>
                  <SelectTrigger className="h-8">
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
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Concepto</Label>
              <Textarea className="min-h-[60px]" value={form.concepto} onChange={(e) => setForm({ ...form, concepto: e.target.value })} placeholder="Descripción del movimiento..." />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={() => setShowNew(false)}>Cancelar</Button>
              <Button size="sm" onClick={handleCreate} disabled={saving}>{saving ? "Guardando..." : "Registrar"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
