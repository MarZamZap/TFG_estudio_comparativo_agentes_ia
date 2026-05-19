"use client";

const DEFAULT_IMAGE = "/images/no-product.png";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Trash2, Lock, Ban, Search } from "lucide-react";
import { toast } from "sonner";
import { addLineaVenta, removeLineaVenta, cerrarVenta, anularVenta } from "@/actions/ventas";
import { addLineaCompra, removeLineaCompra, cerrarCompra, anularCompra } from "@/actions/compras";
import { addLineaTraspaso, removeLineaTraspaso, cerrarTraspaso, anularTraspaso } from "@/actions/traspasos";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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

type Linea = {
  id: number; idProducto: number; cantidad: number; precioMomento: string; subtotal: string;
  producto: { id: number; codigo: string; nombre: string; imageUrl: string | null };
};

type Operacion = {
  id: number; tipo: string; fecha: string; totalOperacion: string;
  formaPago: string | null; estado: string; observaciones: string | null;
  tienda?: { nombreComercial: string };
  cliente?: { nombre: string; apellidos: string } | null;
  usuario?: { nombreCompleto: string };
  proveedor?: { nombre: string } | null;
  tiendaOrigen?: { nombreComercial: string } | null;
  tiendaDestino?: { nombreComercial: string } | null;
  lineas: Linea[];
};

type ProductoOption = {
  id: number;
  codigo: string;
  nombre: string;
  precioVenta: string;
  precioCoste: string;
};

const estadoColor: Record<string, "default" | "secondary" | "destructive"> = {
  BORRADOR: "secondary", CERRADA: "default", ANULADA: "destructive",
};

export function OperacionDetail({
  operacion,
  tipo,
  productos = [],
}: {
  operacion: Operacion;
  tipo: "VENTA" | "COMPRA" | "TRASPASO";
  productos?: ProductoOption[];
}) {
  const router = useRouter();
  const [selectedProductoId, setSelectedProductoId] = useState<number | null>(null);
  const [newCantidad, setNewCantidad] = useState("1");
  const [adding, setAdding] = useState(false);
  const [showCerrar, setShowCerrar] = useState(false);
  const [cerrando, setCerrando] = useState(false);
  const [showAnular, setShowAnular] = useState(false);
  const [anulando, setAnulando] = useState(false);
  const [openProductoPicker, setOpenProductoPicker] = useState(false);
  const isBorrador = operacion.estado === "BORRADOR";

  const backUrl = tipo === "VENTA" ? "/ventas" : tipo === "COMPRA" ? "/compras" : "/traspasos";

  const selectedProducto = productos.find((p) => p.id === selectedProductoId);

  const handleAddLinea = async () => {
    if (!selectedProductoId || !newCantidad) {
      toast.error("Selecciona un producto y una cantidad");
      return;
    }
    setAdding(true);
    try {
      const addFn = tipo === "VENTA" ? addLineaVenta : tipo === "COMPRA" ? addLineaCompra : addLineaTraspaso;
      await addFn(operacion.id, selectedProductoId, Number(newCantidad));
      toast.success("Línea añadida");
      setSelectedProductoId(null);
      setNewCantidad("1");
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
        toast.error("Error al añadir línea");
      }
    } finally { setAdding(false); }
  };

  const handleRemoveLinea = async (idLinea: number) => {
    try {
      const removeFn = tipo === "VENTA" ? removeLineaVenta : tipo === "COMPRA" ? removeLineaCompra : removeLineaTraspaso;
      await removeFn(idLinea, operacion.id);
      toast.success("Línea eliminada");
      router.refresh();
    } catch { toast.error("Error al eliminar línea"); }
  };

  const handleCerrar = async () => {
    setCerrando(true);
    try {
      const cerrarFn = tipo === "VENTA" ? cerrarVenta : tipo === "COMPRA" ? cerrarCompra : cerrarTraspaso;
      await cerrarFn(operacion.id);
      toast.success("Operación cerrada correctamente");
      setShowCerrar(false);
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
        toast.error("Error al cerrar operación");
      }
    } finally { setCerrando(false); }
  };

  const handleAnular = async () => {
    setAnulando(true);
    try {
      const anularFn = tipo === "VENTA" ? anularVenta : tipo === "COMPRA" ? anularCompra : anularTraspaso;
      await anularFn(operacion.id);
      toast.success("Operación anulada");
      setShowAnular(false);
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
        toast.error("Error al anular operación");
      }
    } finally { setAnulando(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push(backUrl)}><ArrowLeft className="h-4 w-4 mr-1" /> Volver</Button>
          <div>
            <h1 className="text-xl font-bold">{tipo} #{operacion.id}</h1>
            <p className="text-sm text-muted-foreground">{new Date(operacion.fecha).toLocaleString("es-ES")}</p>
          </div>
          <Badge variant={estadoColor[operacion.estado]}>{operacion.estado}</Badge>
        </div>
        {isBorrador && (
          <div className="flex gap-2">
            <Button size="sm" variant="destructive" onClick={() => setShowAnular(true)}>
              <Ban className="h-4 w-4 mr-1" /> Anular
            </Button>
            <Button size="sm" onClick={() => setShowCerrar(true)} disabled={operacion.lineas.length === 0}>
              <Lock className="h-4 w-4 mr-1" /> Cerrar Operación
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Tienda</CardTitle></CardHeader>
          <CardContent><p className="text-sm font-medium">{operacion.tienda?.nombreComercial || "—"}</p></CardContent>
        </Card>
        {tipo === "VENTA" && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Cliente</CardTitle></CardHeader>
            <CardContent><p className="text-sm font-medium">{operacion.cliente ? `${operacion.cliente.nombre} ${operacion.cliente.apellidos}` : "Sin cliente"}</p></CardContent>
          </Card>
        )}
        {tipo === "COMPRA" && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Proveedor</CardTitle></CardHeader>
            <CardContent><p className="text-sm font-medium">{operacion.proveedor?.nombre || "—"}</p></CardContent>
          </Card>
        )}
        {tipo === "TRASPASO" && (
          <>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Origen</CardTitle></CardHeader>
              <CardContent><p className="text-sm font-medium">{operacion.tiendaOrigen?.nombreComercial || "—"}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Destino</CardTitle></CardHeader>
              <CardContent><p className="text-sm font-medium">{operacion.tiendaDestino?.nombreComercial || "—"}</p></CardContent>
            </Card>
          </>
        )}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Total</CardTitle></CardHeader>
          <CardContent><p className="text-lg font-bold">{Number(operacion.totalOperacion).toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</p></CardContent>
        </Card>
        {operacion.formaPago && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Forma Pago</CardTitle></CardHeader>
            <CardContent><p className="text-sm font-medium">{operacion.formaPago}</p></CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Líneas de Producto</CardTitle>
            <span className="text-xs text-muted-foreground">{operacion.lineas.length} línea(s)</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {isBorrador && (
            <div className="flex items-end gap-2 p-3 bg-muted/50 rounded-md">
              {/* Product picker */}
              <div className="space-y-1 flex-1">
                <label className="text-xs font-medium">Producto</label>
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
                  <PopoverContent className="w-[400px] p-0" align="start">
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
                                setSelectedProductoId(p.id);
                                setOpenProductoPicker(false);
                              }}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium text-sm">{p.nombre}</span>
                                <span className="text-xs text-muted-foreground font-mono">
                                  {p.codigo} ·{" "}
                                  {tipo === "COMPRA"
                                    ? Number(p.precioCoste).toLocaleString("es-ES", { style: "currency", currency: "EUR" }) + " coste"
                                    : Number(p.precioVenta).toLocaleString("es-ES", { style: "currency", currency: "EUR" }) + " venta"
                                  }
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-1 w-24">
                <label className="text-xs font-medium">Cantidad</label>
                <Input className="h-8" type="number" min="1" value={newCantidad} onChange={(e) => setNewCantidad(e.target.value)} />
              </div>
              <Button size="sm" onClick={handleAddLinea} disabled={adding || !selectedProductoId}>
                <Plus className="h-4 w-4 mr-1" /> {adding ? "..." : "Añadir"}
              </Button>
            </div>
          )}

          <div className="rounded border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="h-8 text-xs w-10"></TableHead>
                  <TableHead className="h-8 text-xs">Código</TableHead>
                  <TableHead className="h-8 text-xs">Producto</TableHead>
                  <TableHead className="h-8 text-xs text-center">Cantidad</TableHead>
                  <TableHead className="h-8 text-xs text-right">Precio Unit.</TableHead>
                  <TableHead className="h-8 text-xs text-right">Subtotal</TableHead>
                  {isBorrador && <TableHead className="h-8 text-xs w-10"></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {operacion.lineas.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-6">No hay líneas. Añada productos.</TableCell></TableRow>
                ) : (
                  operacion.lineas.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="py-1.5">
                        <div className="w-8 h-8 rounded border bg-muted flex items-center justify-center overflow-hidden">
                          <img
                            src={l.producto.imageUrl || DEFAULT_IMAGE}
                            alt=""
                            className="w-full h-full object-contain p-0.5"
                            onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_IMAGE; }}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="py-1.5 font-mono text-xs">{l.producto.codigo}</TableCell>
                      <TableCell className="py-1.5 text-sm font-medium">{l.producto.nombre}</TableCell>
                      <TableCell className="py-1.5 text-center font-mono">{l.cantidad}</TableCell>
                      <TableCell className="py-1.5 text-right font-mono text-xs">{Number(l.precioMomento).toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</TableCell>
                      <TableCell className="py-1.5 text-right font-mono font-semibold">{Number(l.subtotal).toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</TableCell>
                      {isBorrador && (
                        <TableCell className="py-1.5">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive" onClick={() => handleRemoveLinea(l.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showCerrar} onOpenChange={setShowCerrar}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cerrar operación?</AlertDialogTitle>
            <AlertDialogDescription>
              {tipo === "VENTA" && "Se reducirá el stock y se generará un movimiento de caja. Esta acción no se puede deshacer."}
              {tipo === "COMPRA" && "Se incrementará el stock con las cantidades indicadas. Esta acción no se puede deshacer."}
              {tipo === "TRASPASO" && "Se reducirá el stock en origen y se incrementará en destino. Esta acción no se puede deshacer."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleCerrar} disabled={cerrando}>
              {cerrando ? "Cerrando..." : "Confirmar Cierre"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showAnular} onOpenChange={setShowAnular}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Anular operación?</AlertDialogTitle>
            <AlertDialogDescription>
              La operación pasará a estado ANULADA y no podrá ser modificada ni cerrada. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleAnular} disabled={anulando} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {anulando ? "Anulando..." : "Confirmar Anulación"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
