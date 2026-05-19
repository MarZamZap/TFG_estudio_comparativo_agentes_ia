"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, FolderTree } from "lucide-react";
import { deleteCategoria, createCategoria, updateCategoria } from "@/actions/categorias";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

type Categoria = {
  id: number; nombre: string; descripcion: string | null;
  idCategoriaPadre: number | null; activa: boolean;
  categoriaPadre: { id: number; nombre: string } | null;
  subcategorias: { id: number; nombre: string }[];
};

function getIndentedName(cat: Categoria, allCats: Categoria[]): string {
  let depth = 0;
  let parentId = cat.idCategoriaPadre;
  while (parentId) {
    depth++;
    const parent = allCats.find((c) => c.id === parentId);
    parentId = parent?.idCategoriaPadre ?? null;
  }
  return "—".repeat(depth) + (depth > 0 ? " " : "") + cat.nombre;
}

export function CategoriasClient({ data }: { data: Categoria[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Categoria | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const router = useRouter();

  const [form, setForm] = useState({
    nombre: "", descripcion: "", idCategoriaPadre: null as number | null, activa: true,
  });

  const openNew = () => {
    setEditing(null);
    setForm({ nombre: "", descripcion: "", idCategoriaPadre: null, activa: true });
    setShowForm(true);
  };

  const openEdit = (c: Categoria) => {
    setEditing(c);
    setForm({ nombre: c.nombre, descripcion: c.descripcion || "", idCategoriaPadre: c.idCategoriaPadre, activa: c.activa });
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      const submitData = { ...form, idCategoriaPadre: form.idCategoriaPadre || null };
      if (editing) { await updateCategoria(editing.id, submitData); toast.success("Categoría actualizada"); }
      else { await createCategoria(submitData); toast.success("Categoría creada"); }
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
    try { await deleteCategoria(deleteId); toast.success("Categoría eliminada"); setDeleteId(null); router.refresh(); }
    catch (e: unknown) { if (e instanceof Error) {
        try {
          const parsed = JSON.parse(e.message);
          toast.error(parsed[0].message);
        } catch {
          toast.error(e.message);
        }
      } else {
        toast.error("Error al eliminar");
      } }
  };

  const columns: ColumnDef<Categoria>[] = [
    {
      accessorKey: "nombre", header: "Categoría",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <FolderTree className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-medium">{getIndentedName(row.original, data)}</span>
        </div>
      ),
    },
    { accessorKey: "descripcion", header: "Descripción", cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.descripcion || "—"}</span> },
    { id: "padre", header: "Categoría Padre", cell: ({ row }) => row.original.categoriaPadre?.nombre || <span className="text-muted-foreground">Raíz</span> },
    { id: "hijas", header: "Subcategorías", cell: ({ row }) => row.original.subcategorias.length > 0 ? <Badge variant="secondary">{row.original.subcategorias.length}</Badge> : "—" },
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

  const parentOptions = data.filter((c) => (editing ? c.id !== editing.id : true));

  return (
    <>
      <div className="flex justify-end"><Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Nueva Categoría</Button></div>
      <DataTable columns={columns} data={data} searchPlaceholder="Buscar categorías..." />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Editar Categoría" : "Nueva Categoría"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label className="text-xs">Nombre *</Label><Input className="h-8" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Descripción</Label><Textarea className="min-h-[60px]" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} /></div>
            <div className="space-y-1">
              <Label className="text-xs">Categoría Padre</Label>
              <Select value={form.idCategoriaPadre ? String(form.idCategoriaPadre) : "none"} onValueChange={(v) => setForm({ ...form, idCategoriaPadre: v === "none" ? null : Number(v) })}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Sin padre (raíz)">
                    {form.idCategoriaPadre ? (data.find(c => c.id === form.idCategoriaPadre) ? getIndentedName(data.find(c => c.id === form.idCategoriaPadre)!, data) : "Categoría desconocida") : "Sin padre (raíz)"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin padre (raíz)</SelectItem>
                  {parentOptions.map((c) => <SelectItem key={c.id} value={String(c.id)}>{getIndentedName(c, data)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2"><Switch checked={form.activa} onCheckedChange={(v) => setForm({ ...form, activa: v })} /><Label className="text-xs">Activa</Label></div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button size="sm" onClick={handleSave}>{editing ? "Guardar" : "Crear"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle><AlertDialogDescription>No se puede eliminar si tiene subcategorías asignadas.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Eliminar</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
