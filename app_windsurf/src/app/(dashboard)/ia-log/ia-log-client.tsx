"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";

type LogEntry = {
  id: number;
  pregunta: string;
  sqlGenerado: string | null;
  respuesta: string | null;
  fechaHora: string;
  usuario: { nombreCompleto: string } | null;
};

export function IaLogClient({ data }: { data: LogEntry[] }) {
  const columns: ColumnDef<LogEntry>[] = [
    { accessorKey: "id", header: "ID", cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span> },
    {
      accessorKey: "fechaHora", header: "Fecha/Hora",
      cell: ({ row }) => new Date(row.original.fechaHora).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "medium" }),
    },
    { id: "usuario", header: "Usuario", cell: ({ row }) => row.original.usuario?.nombreCompleto || "Sistema" },
    {
      accessorKey: "pregunta", header: "Pregunta",
      cell: ({ row }) => <span className="text-sm max-w-[300px] truncate block">{row.original.pregunta}</span>,
    },
    {
      accessorKey: "sqlGenerado", header: "SQL Generado",
      cell: ({ row }) => row.original.sqlGenerado
        ? <code className="text-xs bg-muted p-1 rounded max-w-[300px] truncate block">{row.original.sqlGenerado}</code>
        : <span className="text-muted-foreground">—</span>,
    },
    {
      accessorKey: "respuesta", header: "Respuesta",
      cell: ({ row }) => row.original.respuesta
        ? <span className="text-xs max-w-[200px] truncate block">{row.original.respuesta}</span>
        : "—",
    },
  ];

  return <DataTable columns={columns} data={data} searchPlaceholder="Buscar en logs..." />;
}
