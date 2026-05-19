"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { deleteProveedor, createProveedor, updateProveedor } from "@/actions/proveedores";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type Proveedor = {
  id: number; nombre: string; cifNif: string; direccion: string | null;
  ciudad: string | null; telefono: string | null; emailPedidos: string | null;
  personaContacto: string | null; activo: boolean;
};

export function ProveedoresClient({ data }: { data: Proveedor[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Proveedor | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const router = useRouter();

  const [form, setForm] = useState({
    nombre: "", cifNif: "", direccion: "", ciudad: "", codigoPostal: "",
    telefono: "", emailPedidos: "", personaContacto: "", activo: true,
  });

  const openNew = () => {
    setEditing(null);
    setForm({ nombre: "", cifNif: "", direccion: "", ciudad: "", codigoPostal: "", telefono: "", emailPedidos: "", personaContacto: "", activo: true });
    setShowForm(true);
  };

  const openEdit = (p: Proveedor) => {
    setEditing(p);
    setForm({
      nombre: p.nombre, cifNif: p.cifNif, direccion: p.direccion || "",
      ciudad: p.ciudad || "", codigoPostal: "", telefono: p.telefono || "",
      emailPedidos: p.emailPedidos || "", personaContacto: p.personaContacto || "", activo: p.activo,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      if (editing) { await updateProveedor(editing.id, form); toast.success("Proveedor actualizado"); }
      else { await createProveedor(form); toast.success("Proveedor creado"); }
      setShowForm(false); router.refresh();
    } catch (e: unknown) { if (e instanceof Error) {
        try {
          const parsed = JSON.parse(e.message);
          toast.error(parsed[0].message);
        } catch {
          toast.error(e.message);
        }
      } else {
        toast.error("Error al guardar");
      } }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await deleteProveedor(deleteId); toast.success("Proveedor eliminado"); setDeleteId(null); router.refresh(); }
    catch { toast.error("Error al eliminar"); }
  };

  const columns: ColumnDef<Proveedor>[] = [
    { accessorKey: "nombre", header: "Nombre", cell: ({ row }) => <span className="font-medium">{row.original.nombre}</span> },
    { accessorKey: "cifNif", header: "CIF/NIF", cell: ({ row }) => <span className="font-mono text-xs">{row.original.cifNif}</span> },
    { accessorKey: "personaContacto", header: "Contacto", cell: ({ row }) => row.original.personaContacto || "—" },
    { accessorKey: "telefono", header: "Teléfono", cell: ({ row }) => row.original.telefono || "—" },
    { accessorKey: "emailPedidos", header: "Email Pedidos", cell: ({ row }) => row.original.emailPedidos || "—" },
    { accessorKey: "activo", header: "Estado", cell: ({ row }) => <Badge variant={row.original.activo ? "default" : "secondary"}>{row.original.activo ? "Activo" : "Inactivo"}</Badge> },
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
      <div className="flex justify-end"><Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Nuevo Proveedor</Button></div>
      <DataTable columns={columns} data={data} searchPlaceholder="Buscar proveedores..." />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Editar Proveedor" : "Nuevo Proveedor"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label className="text-xs">Nombre *</Label><Input className="h-8" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">CIF/NIF *</Label><Input className="h-8" value={form.cifNif} onChange={(e) => setForm({ ...form, cifNif: e.target.value })} /></div>
            </div>
            <div className="space-y-1"><Label className="text-xs">Dirección</Label><Input className="h-8" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label className="text-xs">Ciudad</Label><Input className="h-8" value={form.ciudad} onChange={(e) => setForm({ ...form, ciudad: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Teléfono</Label><Input className="h-8" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label className="text-xs">Email Pedidos</Label><Input className="h-8" type="email" value={form.emailPedidos} onChange={(e) => setForm({ ...form, emailPedidos: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Persona Contacto</Label><Input className="h-8" value={form.personaContacto} onChange={(e) => setForm({ ...form, personaContacto: e.target.value })} /></div>
            </div>
            <div className="flex items-center gap-2"><Switch checked={form.activo} onCheckedChange={(v) => setForm({ ...form, activo: v })} /><Label className="text-xs">Activo</Label></div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button size="sm" onClick={handleSave}>{editing ? "Guardar" : "Crear"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>¿Eliminar proveedor?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Eliminar</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
