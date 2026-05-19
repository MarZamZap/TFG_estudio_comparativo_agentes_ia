"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye } from "lucide-react";
import Link from "next/link";

type Compra = {
  id: number; fecha: string; totalOperacion: string; estado: string;
  tienda: { nombreComercial: string };
  proveedor: { nombre: string } | null;
  usuario: { nombreCompleto: string };
};

const estadoColor: Record<string, "default" | "secondary" | "destructive"> = {
  BORRADOR: "secondary", CERRADA: "default", ANULADA: "destructive",
};

export function ComprasClient({ data }: { data: Compra[] }) {
  const columns: ColumnDef<Compra>[] = [
    { accessorKey: "fecha", header: "Fecha", cell: ({ row }) => new Date(row.original.fecha).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" }) },
    { id: "tienda", header: "Tienda", cell: ({ row }) => row.original.tienda.nombreComercial },
    { id: "proveedor", header: "Proveedor", cell: ({ row }) => row.original.proveedor?.nombre || "—" },
    { id: "usuario", header: "Usuario", cell: ({ row }) => row.original.usuario.nombreCompleto },
    {
      accessorKey: "totalOperacion", header: "Total",
      cell: ({ row }) => <span className="font-mono font-semibold">{Number(row.original.totalOperacion).toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</span>,
    },
    { accessorKey: "estado", header: "Estado", cell: ({ row }) => <Badge variant={estadoColor[row.original.estado] || "secondary"}>{row.original.estado}</Badge> },
    {
      id: "acciones", header: "",
      cell: ({ row }) => (
        <Link href={`/compras/${row.original.id}`}>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Eye className="h-3.5 w-3.5" /></Button>
        </Link>
      ),
    },
  ];

  return (
    <>
      <div className="flex justify-end">
        <Link href="/compras/nueva"><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Nueva Compra</Button></Link>
      </div>
      <DataTable columns={columns} data={data} searchPlaceholder="Buscar compras..." />
    </>
  );
}
