"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { deleteProducto } from "@/actions/productos";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const DEFAULT_IMAGE = "/images/no-product.png";

type Producto = {
  id: number; codigo: string; nombre: string; descripcion: string | null;
  marca: string | null; modelo: string | null; precioCoste: string; precioVenta: string;
  imageUrl: string | null; activo: boolean;
  categoria: { id: number; nombre: string } | null;
  proveedor: { id: number; nombre: string } | null;
  atributos: { calibre: string | null; puente: string | null; varilla: string | null; material: string | null; colorDescripcion: string | null } | null;
};

type CatProv = { id: number; nombre?: string; nombreComercial?: string };

function ProductImage({ src }: { src: string | null }) {
  const [errored, setErrored] = useState(false);
  const imgSrc = !src || errored ? DEFAULT_IMAGE : src;
  return (
    <div className="w-10 h-10 rounded border bg-muted flex items-center justify-center overflow-hidden">
      <img src={imgSrc} alt="" className="w-full h-full object-contain p-0.5" onError={() => setErrored(true)} />
    </div>
  );
}

export function CatalogoClient({ data, categorias: _categorias, proveedores: _proveedores }: { data: Producto[]; categorias: CatProv[]; proveedores: CatProv[] }) {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const router = useRouter();

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await deleteProducto(deleteId); toast.success("Producto desactivado"); setDeleteId(null); router.refresh(); }
    catch { toast.error("Error al eliminar"); }
  };

  const columns: ColumnDef<Producto>[] = [
    {
      id: "imagen", header: "",
      cell: ({ row }) => <ProductImage src={row.original.imageUrl} />,
    },
    { accessorKey: "codigo", header: "Código", cell: ({ row }) => <span className="font-mono text-xs">{row.original.codigo}</span> },
    { accessorKey: "nombre", header: "Nombre", cell: ({ row }) => <span className="font-medium">{row.original.nombre}</span> },
    { accessorKey: "marca", header: "Marca", cell: ({ row }) => row.original.marca || "—" },
    { accessorKey: "modelo", header: "Modelo", cell: ({ row }) => row.original.modelo || "—" },
    { id: "categoria", header: "Categoría", cell: ({ row }) => row.original.categoria?.nombre || "—" },
    { id: "proveedor", header: "Proveedor", cell: ({ row }) => row.original.proveedor?.nombre || "—" },
    {
      accessorKey: "precioCoste", header: "P. Coste",
      cell: ({ row }) => <span className="font-mono text-xs">{Number(row.original.precioCoste).toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</span>,
    },
    {
      accessorKey: "precioVenta", header: "P. Venta",
      cell: ({ row }) => <span className="font-mono text-xs font-semibold">{Number(row.original.precioVenta).toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</span>,
    },
    {
      id: "atributos", header: "Calibre/Puente/Varilla",
      cell: ({ row }) => {
        const a = row.original.atributos;
        if (!a || (!a.calibre && !a.puente && !a.varilla)) return "—";
        return <span className="text-xs font-mono">{a.calibre || "?"}-{a.puente || "?"}-{a.varilla || "?"}</span>;
      },
    },
    {
      id: "acciones", header: "Acciones",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Link href={`/catalogo/${row.original.id}`}>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Pencil className="h-3.5 w-3.5" /></Button>
          </Link>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => setDeleteId(row.original.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="flex justify-end">
        <Link href="/catalogo/nuevo"><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Nuevo Producto</Button></Link>
      </div>
      <DataTable columns={columns} data={data} searchPlaceholder="Buscar por código, nombre, marca, modelo..." />
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>¿Desactivar producto?</AlertDialogTitle><AlertDialogDescription>El producto se marcará como inactivo.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Desactivar</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
