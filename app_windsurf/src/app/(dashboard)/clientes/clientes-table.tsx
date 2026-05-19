"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Pencil, Trash2, ClipboardList } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { deleteCliente } from "@/actions/clientes";
import { toast } from "sonner";
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
import { ClienteFormDialog } from "./cliente-form-dialog";

type Cliente = {
  id: number;
  tipoDocumento: string;
  numeroDocumento: string;
  nombre: string;
  apellidos: string;
  fechaNacimiento: string | null;
  sexo: string | null;
  telefono: string | null;
  email: string | null;
  fechaAlta: string;
  direccion?: string | null;
  ciudad?: string | null;
  codigoPostal?: string | null;
  observaciones?: string | null;
};

const columns: ColumnDef<Cliente>[] = [
  {
    accessorKey: "tipoDocumento",
    header: "Tipo Doc.",
    cell: ({ row }) => <Badge variant="outline" className="text-xs">{row.original.tipoDocumento}</Badge>,
  },
  {
    accessorKey: "numeroDocumento",
    header: "Nº Documento",
    cell: ({ row }) => <span className="font-mono text-xs">{row.original.numeroDocumento}</span>,
  },
  {
    id: "nombreCompleto",
    header: "Nombre Completo",
    accessorFn: (row) => `${row.nombre} ${row.apellidos}`,
    cell: ({ row }) => <span className="font-medium">{row.original.nombre} {row.original.apellidos}</span>,
  },
  {
    accessorKey: "fechaNacimiento",
    header: "F. Nacimiento",
    cell: ({ row }) => row.original.fechaNacimiento
      ? new Date(row.original.fechaNacimiento).toLocaleDateString("es-ES")
      : "—",
  },
  {
    accessorKey: "sexo",
    header: "Sexo",
    cell: ({ row }) => row.original.sexo === "M" ? "Masculino" : row.original.sexo === "F" ? "Femenino" : "—",
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => row.original.email || "—",
  },
  {
    accessorKey: "telefono",
    header: "Teléfono",
    cell: ({ row }) => row.original.telefono || "—",
  },
  {
    accessorKey: "fechaAlta",
    header: "F. Alta",
    cell: ({ row }) => new Date(row.original.fechaAlta).toLocaleDateString("es-ES"),
  },
  {
    id: "acciones",
    header: "Acciones",
    cell: function ActionsCell() {
      // NOTE: This basic columns definition is overridden by extendedColumns below
      return null;
    },
  },
];

export function ClientesTable({ data }: { data: Cliente[] }) {
  const [showNew, setShowNew] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await deleteCliente(deleteId);
      toast.success("Cliente eliminado correctamente");
      setDeleteId(null);
    } catch {
      toast.error("Error al eliminar el cliente");
    }
  };

  const extendedColumns: ColumnDef<Cliente>[] = [
    ...columns.slice(0, -1),
    {
      id: "acciones",
      header: "Acciones",
      cell: function ActionsCell({ row }) {
        return (
          <div className="flex items-center gap-1">
            <Link href={`/clientes/${row.original.id}`}>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Ver detalle">
                <Eye className="h-3.5 w-3.5" />
              </Button>
            </Link>
            <Link href={`/clientes/${row.original.id}/historial`}>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Historial clínico">
                <ClipboardList className="h-3.5 w-3.5" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setEditingCliente(row.original)}
              title="Editar"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
              onClick={() => setDeleteId(row.original.id)}
              title="Eliminar"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowNew(true)}>
          <Plus className="h-4 w-4 mr-1" /> Nuevo Cliente
        </Button>
      </div>
      <DataTable columns={extendedColumns} data={data} searchPlaceholder="Buscar por nombre, documento, email..." />
      <ClienteFormDialog open={showNew} onOpenChange={setShowNew} />
      {editingCliente && (
        <ClienteFormDialog
          open={!!editingCliente}
          onOpenChange={(v) => !v && setEditingCliente(null)}
          defaultValues={{
            id: editingCliente.id,
            tipoDocumento: editingCliente.tipoDocumento as "DNI" | "NIF" | "NIE" | "PASAPORTE",
            numeroDocumento: editingCliente.numeroDocumento,
            nombre: editingCliente.nombre,
            apellidos: editingCliente.apellidos,
            fechaNacimiento: editingCliente.fechaNacimiento ? new Date(editingCliente.fechaNacimiento).toISOString().split("T")[0] : null,
            sexo: editingCliente.sexo as "M" | "F" | null,
            direccion: editingCliente.direccion,
            ciudad: editingCliente.ciudad,
            codigoPostal: editingCliente.codigoPostal,
            telefono: editingCliente.telefono,
            email: editingCliente.email,
            observaciones: null,
          }}
        />
      )}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el cliente y todo su historial de graduaciones.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
