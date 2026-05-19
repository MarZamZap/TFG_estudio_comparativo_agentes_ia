"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteGraduacion } from "@/actions/graduaciones";
import { GraduacionFormDialog } from "./graduacion-form-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Graduacion {
  id: number;
  fecha: string;
  odEsfera: string | null;
  odCilindro: string | null;
  odEje: number | null;
  odAdicion: string | null;
  odAv: string | null;
  odDnp: string | null;
  odAltura: string | null;
  oiEsfera: string | null;
  oiCilindro: string | null;
  oiEje: number | null;
  oiAdicion: string | null;
  oiAv: string | null;
  oiDnp: string | null;
  oiAltura: string | null;
  tipoLente: string | null;
  observaciones: string | null;
}

interface ClienteBasic {
  id: number;
  nombre: string;
  apellidos: string;
  numeroDocumento: string;
}

function formatDecimal(val: string | null) {
  if (val === null || val === undefined) return "—";
  const num = Number(val);
  return num >= 0 ? `+${num.toFixed(2)}` : num.toFixed(2);
}

export function HistorialClinico({
  cliente,
  graduaciones,
}: {
  cliente: ClienteBasic;
  graduaciones: Graduacion[];
}) {
  const [showNew, setShowNew] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const router = useRouter();

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await deleteGraduacion(deleteId, cliente.id);
      toast.success("Graduación eliminada");
      setDeleteId(null);
      router.refresh();
    } catch {
      toast.error("Error al eliminar la graduación");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/clientes/${cliente.id}`)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Volver
          </Button>
          <div>
            <h1 className="text-xl font-bold">Historial Clínico</h1>
            <p className="text-sm text-muted-foreground">
              {cliente.nombre} {cliente.apellidos} — {cliente.numeroDocumento}
            </p>
          </div>
        </div>
        <Button size="sm" onClick={() => setShowNew(true)}>
          <Plus className="h-4 w-4 mr-1" /> Nueva Graduación
        </Button>
      </div>

      {graduaciones.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No hay registros de graduación. Haga clic en &quot;Nueva Graduación&quot; para añadir el primer registro.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {graduaciones.map((g) => (
            <Card key={g.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm">
                      {new Date(g.fecha).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </CardTitle>
                    {g.tipoLente && <Badge variant="secondary" className="text-xs">{g.tipoLente}</Badge>}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                    onClick={() => setDeleteId(g.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="h-8 text-xs w-16">Ojo</TableHead>
                        <TableHead className="h-8 text-xs text-center">Esfera</TableHead>
                        <TableHead className="h-8 text-xs text-center">Cilindro</TableHead>
                        <TableHead className="h-8 text-xs text-center">Eje</TableHead>
                        <TableHead className="h-8 text-xs text-center">Adición</TableHead>
                        <TableHead className="h-8 text-xs text-center">AV</TableHead>
                        <TableHead className="h-8 text-xs text-center">DNP</TableHead>
                        <TableHead className="h-8 text-xs text-center">Altura</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="py-1.5 font-medium text-xs">OD</TableCell>
                        <TableCell className="py-1.5 text-center text-xs font-mono">{formatDecimal(g.odEsfera)}</TableCell>
                        <TableCell className="py-1.5 text-center text-xs font-mono">{formatDecimal(g.odCilindro)}</TableCell>
                        <TableCell className="py-1.5 text-center text-xs font-mono">{g.odEje !== null ? `${g.odEje}°` : "—"}</TableCell>
                        <TableCell className="py-1.5 text-center text-xs font-mono">{formatDecimal(g.odAdicion)}</TableCell>
                        <TableCell className="py-1.5 text-center text-xs">{g.odAv || "—"}</TableCell>
                        <TableCell className="py-1.5 text-center text-xs font-mono">{g.odDnp ? Number(g.odDnp).toFixed(1) : "—"}</TableCell>
                        <TableCell className="py-1.5 text-center text-xs font-mono">{g.odAltura ? Number(g.odAltura).toFixed(1) : "—"}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="py-1.5 font-medium text-xs">OI</TableCell>
                        <TableCell className="py-1.5 text-center text-xs font-mono">{formatDecimal(g.oiEsfera)}</TableCell>
                        <TableCell className="py-1.5 text-center text-xs font-mono">{formatDecimal(g.oiCilindro)}</TableCell>
                        <TableCell className="py-1.5 text-center text-xs font-mono">{g.oiEje !== null ? `${g.oiEje}°` : "—"}</TableCell>
                        <TableCell className="py-1.5 text-center text-xs font-mono">{formatDecimal(g.oiAdicion)}</TableCell>
                        <TableCell className="py-1.5 text-center text-xs">{g.oiAv || "—"}</TableCell>
                        <TableCell className="py-1.5 text-center text-xs font-mono">{g.oiDnp ? Number(g.oiDnp).toFixed(1) : "—"}</TableCell>
                        <TableCell className="py-1.5 text-center text-xs font-mono">{g.oiAltura ? Number(g.oiAltura).toFixed(1) : "—"}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                {g.observaciones && (
                  <p className="mt-2 text-xs text-muted-foreground">{g.observaciones}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <GraduacionFormDialog open={showNew} onOpenChange={setShowNew} idCliente={cliente.id} />

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar graduación?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
