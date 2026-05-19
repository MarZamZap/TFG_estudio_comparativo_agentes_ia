"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, ArrowLeft, ClipboardList } from "lucide-react";
import Link from "next/link";
import { ClienteFormDialog } from "../cliente-form-dialog";

interface ClienteData {
  id: number;
  tipoDocumento: string;
  numeroDocumento: string;
  nombre: string;
  apellidos: string;
  fechaNacimiento: string | null;
  sexo: string | null;
  direccion: string | null;
  ciudad: string | null;
  codigoPostal: string | null;
  telefono: string | null;
  email: string | null;
  observaciones: string | null;
  fechaAlta: string;
}

export function ClienteDetail({ cliente }: { cliente: ClienteData }) {
  const [showEdit, setShowEdit] = useState(false);
  const router = useRouter();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/clientes")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Volver
          </Button>
          <div>
            <h1 className="text-xl font-bold">{cliente.nombre} {cliente.apellidos}</h1>
            <p className="text-sm text-muted-foreground">
              <Badge variant="outline" className="mr-1">{cliente.tipoDocumento}</Badge>
              {cliente.numeroDocumento}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/clientes/${cliente.id}/historial`}>
            <Button variant="outline" size="sm">
              <ClipboardList className="h-4 w-4 mr-1" /> Historial Clínico
            </Button>
          </Link>
          <Button size="sm" onClick={() => setShowEdit(true)}>
            <Pencil className="h-4 w-4 mr-1" /> Editar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Datos Personales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div><span className="text-muted-foreground">Nombre:</span> <span className="font-medium">{cliente.nombre}</span></div>
              <div><span className="text-muted-foreground">Apellidos:</span> <span className="font-medium">{cliente.apellidos}</span></div>
              <div><span className="text-muted-foreground">F. Nacimiento:</span> {cliente.fechaNacimiento ? new Date(cliente.fechaNacimiento).toLocaleDateString("es-ES") : "—"}</div>
              <div><span className="text-muted-foreground">Sexo:</span> {cliente.sexo === "M" ? "Masculino" : cliente.sexo === "F" ? "Femenino" : "—"}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div><span className="text-muted-foreground">Teléfono:</span> {cliente.telefono || "—"}</div>
              <div><span className="text-muted-foreground">Email:</span> {cliente.email || "—"}</div>
              <div className="col-span-2"><span className="text-muted-foreground">Dirección:</span> {cliente.direccion || "—"}</div>
              <div><span className="text-muted-foreground">Ciudad:</span> {cliente.ciudad || "—"}</div>
              <div><span className="text-muted-foreground">C.P.:</span> {cliente.codigoPostal || "—"}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {cliente.observaciones && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Observaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{cliente.observaciones}</p>
          </CardContent>
        </Card>
      )}

      <ClienteFormDialog
        open={showEdit}
        onOpenChange={setShowEdit}
        defaultValues={{
          id: cliente.id,
          tipoDocumento: cliente.tipoDocumento as "DNI" | "NIF" | "NIE" | "PASAPORTE",
          numeroDocumento: cliente.numeroDocumento,
          nombre: cliente.nombre,
          apellidos: cliente.apellidos,
          fechaNacimiento: cliente.fechaNacimiento ? new Date(cliente.fechaNacimiento).toISOString().split("T")[0] : null,
          sexo: cliente.sexo as "M" | "F" | null,
          direccion: cliente.direccion,
          ciudad: cliente.ciudad,
          codigoPostal: cliente.codigoPostal,
          telefono: cliente.telefono,
          email: cliente.email,
          observaciones: cliente.observaciones,
        }}
      />
    </div>
  );
}
