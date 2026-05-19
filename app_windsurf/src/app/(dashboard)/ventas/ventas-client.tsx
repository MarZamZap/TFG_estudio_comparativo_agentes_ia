"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye } from "lucide-react";
import Link from "next/link";

type Venta = {
  id: number; tipo: string; fecha: string; totalOperacion: string;
  formaPago: string | null; estado: string;
  tienda: { nombreComercial: string };
  cliente: { nombre: string; apellidos: string } | null;
  usuario: { nombreCompleto: string };
};
type Tienda = { id: number; nombreComercial: string };

const estadoColor: Record<string, "default" | "secondary" | "destructive"> = {
  BORRADOR: "secondary", CERRADA: "default", ANULADA: "destructive",
};

export function VentasClient({ data }: { data: Venta[]; tiendas: Tienda[] }) {
  const columns: ColumnDef<Venta>[] = [
    { accessorKey: "fecha", header: "Fecha", cell: ({ row }) => new Date(row.original.fecha).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" }) },
    { id: "tienda", header: "Tienda", cell: ({ row }) => row.original.tienda.nombreComercial },
    { id: "cliente", header: "Cliente", cell: ({ row }) => row.original.cliente ? `${row.original.cliente.nombre} ${row.original.cliente.apellidos}` : "—" },
    { id: "usuario", header: "Usuario", cell: ({ row }) => row.original.usuario.nombreCompleto },
    { accessorKey: "formaPago", header: "Forma Pago", cell: ({ row }) => row.original.formaPago || "—" },
    {
      accessorKey: "totalOperacion", header: "Total",
      cell: ({ row }) => <span className="font-mono font-semibold">{Number(row.original.totalOperacion).toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</span>,
    },
    { accessorKey: "estado", header: "Estado", cell: ({ row }) => <Badge variant={estadoColor[row.original.estado] || "secondary"}>{row.original.estado}</Badge> },
    {
      id: "acciones", header: "",
      cell: ({ row }) => (
        <Link href={`/ventas/${row.original.id}`}>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Eye className="h-3.5 w-3.5" /></Button>
        </Link>
      ),
    },
  ];

  return (
    <>
      <div className="flex justify-end">
        <Link href="/ventas/nueva"><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Nueva Venta</Button></Link>
      </div>
      <DataTable columns={columns} data={data} searchPlaceholder="Buscar ventas..." />
    </>
  );
}
