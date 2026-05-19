"use client";

const DEFAULT_IMAGE = "/images/no-product.png";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, AlertTriangle, Search } from "lucide-react";
import { createStock, deleteStock } from "@/actions/stock";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type StockItem = {
  id: number; idTienda: number; idProducto: number; cantidadActual: number; stockMinimoAlerta: number;
  tienda: { id: number; nombreComercial: string };
  producto: { id: number; codigo: string; nombre: string; imageUrl: string | null; marca: string | null };
};
type Tienda = { id: number; nombreComercial: string };
type Producto = { id: number; codigo: string; nombre: string; marca: string | null };

export function InventarioClient({ data, tiendas, productos = [] }: { data: StockItem[]; tiendas: Tienda[]; productos?: Producto[] }) {
  const [showNew, setShowNew] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [newForm, setNewForm] = useState({ idTienda: 0, idProducto: 0, stockMinimoAlerta: 5 });
  const [openProductoPicker, setOpenProductoPicker] = useState(false);
  const router = useRouter();

  const selectedProducto = productos.find((p) => p.id === newForm.idProducto);

  const handleCreate = async () => {
    if (!newForm.idProducto) { toast.error("Selecciona un producto"); return; }
    try {
      await createStock(newForm);
      toast.success("Stock creado"); setShowNew(false); router.refresh();
    } catch (e: unknown) { if (e instanceof Error) {
        try {
          const parsed = JSON.parse(e.message);
          toast.error(parsed[0].message);
        } catch {
          toast.error(e.message);
        }
      } else {
        toast.error("Error");
      } }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await deleteStock(deleteId); toast.success("Registro eliminado"); setDeleteId(null); router.refresh(); }
    catch { toast.error("Error al eliminar"); }
  };

  const columns: ColumnDef<StockItem>[] = [
    {
      id: "imagen", header: "",
      cell: ({ row }) => (
        <div className="w-8 h-8 rounded border bg-muted flex items-center justify-center overflow-hidden">
          <img
            src={row.original.producto.imageUrl || DEFAULT_IMAGE}
            alt=""
            className="w-full h-full object-contain p-0.5"
            onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_IMAGE; }}
          />
        </div>
      ),
    },
    { id: "tienda", header: "Tienda", cell: ({ row }) => <span className="font-medium text-sm">{row.original.tienda.nombreComercial}</span> },
    { id: "codigo", header: "Código", cell: ({ row }) => <span className="font-mono text-xs">{row.original.producto.codigo}</span> },
    { id: "producto", header: "Producto", cell: ({ row }) => row.original.producto.nombre },
    { id: "marca", header: "Marca", cell: ({ row }) => row.original.producto.marca || "—" },
    {
      accessorKey: "cantidadActual", header: "Cantidad",
      cell: ({ row }) => {
        const bajo = row.original.cantidadActual <= row.original.stockMinimoAlerta;
        return (
          <div className="flex items-center gap-1.5">
            <span className={`font-mono font-bold ${bajo ? "text-destructive" : ""}`}>{row.original.cantidadActual}</span>
            {bajo && <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
          </div>
        );
      },
    },
    {
      accessorKey: "stockMinimoAlerta", header: "Mín. Alerta",
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.stockMinimoAlerta}</span>,
    },
    {
      id: "estado", header: "Estado",
      cell: ({ row }) => {
        const bajo = row.original.cantidadActual <= row.original.stockMinimoAlerta;
        return bajo
          ? <Badge variant="destructive" className="text-xs">Stock Bajo</Badge>
          : <Badge variant="secondary" className="text-xs">OK</Badge>;
      },
    },
    {
      id: "acciones", header: "",
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => setDeleteId(row.original.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
      ),
    },
  ];

  const [filterTienda, setFilterTienda] = useState<number | null>(null);
  const filteredData = filterTienda ? data.filter((s) => s.idTienda === filterTienda) : data;

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Select value={filterTienda ? String(filterTienda) : "all"} onValueChange={(v) => setFilterTienda(v === "all" ? null : Number(v))}>
            <SelectTrigger className="h-8 w-52">
              <SelectValue placeholder="Todas las tiendas">
                {filterTienda ? tiendas.find(t => t.id === filterTienda)?.nombreComercial || "Tienda desconocida" : "Todas las tiendas"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las tiendas</SelectItem>
              {tiendas.map((t) => (
                <SelectItem key={t.id} value={String(t.id)}>{t.nombreComercial}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" onClick={() => { setNewForm({ idTienda: tiendas[0]?.id || 0, idProducto: 0, stockMinimoAlerta: 5 }); setShowNew(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Alta de Stock
        </Button>
      </div>
      <DataTable columns={columns} data={filteredData} searchPlaceholder="Buscar por producto, tienda..." />

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Alta de Stock</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Tienda *</Label>
              <Select value={String(newForm.idTienda)} onValueChange={(v) => setNewForm({ ...newForm, idTienda: Number(v) })}>
                <SelectTrigger className="h-8">
                  <SelectValue>
                    {newForm.idTienda ? tiendas.find(t => t.id === newForm.idTienda)?.nombreComercial || "Tienda desconocida" : "Seleccionar tienda"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>{tiendas.map((t) => <SelectItem key={t.id} value={String(t.id)}>{t.nombreComercial}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Producto *</Label>
              <Popover open={openProductoPicker} onOpenChange={setOpenProductoPicker}>
                <PopoverTrigger
                  className="flex h-8 w-full items-center justify-between rounded-lg border border-border bg-background px-2.5 text-sm font-normal hover:bg-muted transition-colors"
                >
                  {selectedProducto
                    ? <span className="truncate">{selectedProducto.codigo} — {selectedProducto.nombre}</span>
                    : <span className="text-muted-foreground">Buscar producto...</span>
                  }
                  <Search className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                </PopoverTrigger>
                <PopoverContent className="w-[320px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar por código o nombre..." className="h-8" />
                    <CommandList>
                      <CommandEmpty>No se encontraron productos.</CommandEmpty>
                      <CommandGroup>
                        {productos.map((p) => (
                          <CommandItem
                            key={p.id}
                            value={`${p.codigo} ${p.nombre}`}
                            onSelect={() => {
                              setNewForm({ ...newForm, idProducto: p.id });
                              setOpenProductoPicker(false);
                            }}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">{p.nombre}</span>
                              <span className="text-xs text-muted-foreground font-mono">{p.codigo}{p.marca ? ` · ${p.marca}` : ""}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Stock Mínimo Alerta</Label>
              <Input className="h-8" type="number" value={newForm.stockMinimoAlerta} onChange={(e) => setNewForm({ ...newForm, stockMinimoAlerta: Number(e.target.value) })} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowNew(false)}>Cancelar</Button>
              <Button size="sm" onClick={handleCreate}>Crear</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>¿Eliminar registro de stock?</AlertDialogTitle><AlertDialogDescription>Se eliminará el control de inventario para este producto en esta tienda.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Eliminar</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
