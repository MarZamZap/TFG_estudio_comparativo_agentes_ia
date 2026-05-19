"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { deleteUsuario, createUsuario, updateUsuario } from "@/actions/usuarios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

type Tienda = { id: number; nombreComercial: string };
type Usuario = {
  id: number; username: string; nombreCompleto: string; email: string | null;
  rol: string; idTienda: number; activo: boolean;
  tienda: Tienda;
};

export function UsuariosClient({ data, tiendas }: { data: Usuario[]; tiendas: Tienda[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Usuario | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const router = useRouter();

  const [form, setForm] = useState({
    username: "", password: "", nombreCompleto: "", email: "",
    rol: "EMPLEADO", idTienda: 0, activo: true,
  });

  const openNew = () => {
    setEditing(null);
    setForm({ username: "", password: "", nombreCompleto: "", email: "", rol: "EMPLEADO", idTienda: tiendas[0]?.id || 0, activo: true });
    setShowForm(true);
  };

  const openEdit = (u: Usuario) => {
    setEditing(u);
    setForm({ username: u.username, password: "", nombreCompleto: u.nombreCompleto, email: u.email || "", rol: u.rol, idTienda: u.idTienda, activo: u.activo });
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      const submitData = { ...form, password: form.password || undefined };
      if (editing) { await updateUsuario(editing.id, submitData); toast.success("Usuario actualizado"); }
      else { await createUsuario(form); toast.success("Usuario creado"); }
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
    try { await deleteUsuario(deleteId); toast.success("Usuario eliminado"); setDeleteId(null); router.refresh(); }
    catch { toast.error("Error al eliminar"); }
  };

  const columns: ColumnDef<Usuario>[] = [
    { accessorKey: "username", header: "Usuario", cell: ({ row }) => <span className="font-mono text-sm">{row.original.username}</span> },
    { accessorKey: "nombreCompleto", header: "Nombre", cell: ({ row }) => <span className="font-medium">{row.original.nombreCompleto}</span> },
    { accessorKey: "email", header: "Email", cell: ({ row }) => row.original.email || "—" },
    { accessorKey: "rol", header: "Rol", cell: ({ row }) => <Badge variant="outline">{row.original.rol}</Badge> },
    { id: "tienda", header: "Tienda", cell: ({ row }) => row.original.tienda?.nombreComercial || "—" },
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
      <div className="flex justify-end"><Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Nuevo Usuario</Button></div>
      <DataTable columns={columns} data={data} searchPlaceholder="Buscar usuarios..." />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label className="text-xs">Usuario *</Label><Input className="h-8" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">{editing ? "Nueva Contraseña" : "Contraseña *"}</Label><Input className="h-8" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={editing ? "Dejar vacío para no cambiar" : ""} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label className="text-xs">Nombre Completo *</Label><Input className="h-8" value={form.nombreCompleto} onChange={(e) => setForm({ ...form, nombreCompleto: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Email</Label><Input className="h-8" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Tienda *</Label>
                <Select value={String(form.idTienda)} onValueChange={(v) => setForm({ ...form, idTienda: Number(v) })}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Seleccionar tienda">
                      {form.idTienda ? tiendas.find(t => t.id === form.idTienda)?.nombreComercial || "Tienda desconocida" : "Seleccionar tienda"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>{tiendas.map((t) => <SelectItem key={t.id} value={String(t.id)}>{t.nombreComercial}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Rol *</Label>
                <Select value={form.rol} onValueChange={(v) => setForm({ ...form, rol: v ?? "EMPLEADO" })}>                  <SelectTrigger className="h-8">
                    <SelectValue>
                      {form.rol === "EMPLEADO" ? "Empleado" :
                       form.rol === "GERENTE" ? "Gerente" :
                       form.rol === "ADMIN" ? "Administrador" : ""}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMPLEADO">Empleado</SelectItem>
                    <SelectItem value="GERENTE">Gerente</SelectItem>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1"><Switch checked={form.activo} onCheckedChange={(v) => setForm({ ...form, activo: v })} /><Label className="text-xs">Usuario activo</Label></div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button size="sm" onClick={handleSave}>{editing ? "Guardar" : "Crear"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Eliminar</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
