"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, ArrowRight } from "lucide-react";
import Link from "next/link";

type Traspaso = {
  id: number; fecha: string; totalOperacion: string; estado: string;
  tiendaOrigen: { nombreComercial: string } | null;
  tiendaDestino: { nombreComercial: string } | null;
  usuario: { nombreCompleto: string };
};

const estadoColor: Record<string, "default" | "secondary" | "destructive"> = {
  BORRADOR: "secondary", CERRADA: "default", ANULADA: "destructive",
};

export function TraspasosClient({ data }: { data: Traspaso[] }) {
  const columns: ColumnDef<Traspaso>[] = [
    { accessorKey: "fecha", header: "Fecha", cell: ({ row }) => new Date(row.original.fecha).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" }) },
    {
      id: "ruta", header: "Ruta",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-sm">
          <span className="font-medium">{row.original.tiendaOrigen?.nombreComercial || "?"}</span>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-medium">{row.original.tiendaDestino?.nombreComercial || "?"}</span>
        </div>
      ),
    },
    { id: "usuario", header: "Usuario", cell: ({ row }) => row.original.usuario.nombreCompleto },
    { accessorKey: "estado", header: "Estado", cell: ({ row }) => <Badge variant={estadoColor[row.original.estado] || "secondary"}>{row.original.estado}</Badge> },
    {
      id: "acciones", header: "",
      cell: ({ row }) => (
        <Link href={`/traspasos/${row.original.id}`}>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Eye className="h-3.5 w-3.5" /></Button>
        </Link>
      ),
    },
  ];

  return (
    <>
      <div className="flex justify-end">
        <Link href="/traspasos/nuevo"><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Nuevo Traspaso</Button></Link>
      </div>
      <DataTable columns={columns} data={data} searchPlaceholder="Buscar traspasos..." />
    </>
  );
}
