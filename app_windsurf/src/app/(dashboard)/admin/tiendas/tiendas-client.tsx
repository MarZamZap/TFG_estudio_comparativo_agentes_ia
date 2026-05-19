"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { deleteTienda, createTienda, updateTienda } from "@/actions/tiendas";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type Tienda = {
  id: number;
  nombreComercial: string;
  cif: string;
  direccion: string | null;
  ciudad: string | null;
  codigoPostal: string | null;
  telefono: string | null;
  email: string | null;
  activa: boolean;
};

export function TiendasClient({ data }: { data: Tienda[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Tienda | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const router = useRouter();

  const [form, setForm] = useState({
    nombreComercial: "", cif: "", direccion: "", ciudad: "",
    codigoPostal: "", telefono: "", email: "", activa: true,
  });

  const openNew = () => {
    setEditing(null);
    setForm({ nombreComercial: "", cif: "", direccion: "", ciudad: "", codigoPostal: "", telefono: "", email: "", activa: true });
    setShowForm(true);
  };

  const openEdit = (t: Tienda) => {
    setEditing(t);
    setForm({
      nombreComercial: t.nombreComercial, cif: t.cif, direccion: t.direccion || "",
      ciudad: t.ciudad || "", codigoPostal: t.codigoPostal || "", telefono: t.telefono || "",
      email: t.email || "", activa: t.activa,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await updateTienda(editing.id, form);
        toast.success("Tienda actualizada");
      } else {
        await createTienda(form);
        toast.success("Tienda creada");
      }
      setShowForm(false);
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
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteTienda(deleteId);
      toast.success("Tienda eliminada");
      setDeleteId(null);
      router.refresh();
    } catch {
      toast.error("Error al eliminar");
    }
  };

  const columns: ColumnDef<Tienda>[] = [
    { accessorKey: "nombreComercial", header: "Nombre Comercial", cell: ({ row }) => <span className="font-medium">{row.original.nombreComercial}</span> },
    { accessorKey: "cif", header: "CIF", cell: ({ row }) => <span className="font-mono text-xs">{row.original.cif}</span> },
    { accessorKey: "ciudad", header: "Ciudad", cell: ({ row }) => row.original.ciudad || "—" },
    { accessorKey: "telefono", header: "Teléfono", cell: ({ row }) => row.original.telefono || "—" },
    { accessorKey: "email", header: "Email", cell: ({ row }) => row.original.email || "—" },
    { accessorKey: "activa", header: "Estado", cell: ({ row }) => <Badge variant={row.original.activa ? "default" : "secondary"}>{row.original.activa ? "Activa" : "Inactiva"}</Badge> },
    {
      id: "acciones", header: "Acciones",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(row.original)}><Pencil className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => setDeleteId(row.original.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="flex justify-end">
        <Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Nueva Tienda</Button>
      </div>
      <DataTable columns={columns} data={data} searchPlaceholder="Buscar tiendas..." />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Editar Tienda" : "Nueva Tienda"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label className="text-xs">Nombre Comercial *</Label><Input className="h-8" value={form.nombreComercial} onChange={(e) => setForm({ ...form, nombreComercial: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">CIF *</Label><Input className="h-8" value={form.cif} onChange={(e) => setForm({ ...form, cif: e.target.value })} placeholder="A12345678" /></div>
            </div>
            <div className="space-y-1"><Label className="text-xs">Dirección</Label><Input className="h-8" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} /></div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1"><Label className="text-xs">Ciudad</Label><Input className="h-8" value={form.ciudad} onChange={(e) => setForm({ ...form, ciudad: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">C.P.</Label><Input className="h-8" value={form.codigoPostal} onChange={(e) => setForm({ ...form, codigoPostal: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Teléfono</Label><Input className="h-8" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label className="text-xs">Email</Label><Input className="h-8" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="flex items-center gap-2 pt-5"><Switch checked={form.activa} onCheckedChange={(v) => setForm({ ...form, activa: v })} /><Label className="text-xs">Activa</Label></div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button size="sm" onClick={handleSave}>{editing ? "Guardar" : "Crear"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>¿Eliminar tienda?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Eliminar</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
