"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clienteSchema, ClienteFormData } from "@/lib/validators/clientes";
import { createCliente, updateCliente } from "@/actions/clientes";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/shared/field";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: ClienteFormData & { id?: number };
}

export function ClienteFormDialog({ open, onOpenChange, defaultValues }: Props) {
  const router = useRouter();
  const isEdit = !!defaultValues?.id;

  const form = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: defaultValues || {
      tipoDocumento: "DNI",
      numeroDocumento: "",
      nombre: "",
      apellidos: "",
      fechaNacimiento: "",
      sexo: null,
      direccion: "",
      ciudad: "",
      codigoPostal: "",
      telefono: "",
      email: "",
      observaciones: "",
    },
  });

  const e = form.formState.errors;

  const onSubmit = async (data: ClienteFormData) => {
    try {
      if (isEdit && defaultValues?.id) {
        await updateCliente(defaultValues.id, data);
        toast.success("Cliente actualizado correctamente");
      } else {
        await createCliente(data);
        toast.success("Cliente creado correctamente");
      }
      onOpenChange(false);
      form.reset();
      router.refresh();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error al guardar";
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Cliente" : "Nuevo Cliente"}</DialogTitle>
        </DialogHeader>

        <p className="text-[11px] text-slate-400">
          Los campos marcados con <span className="text-rose-500 font-bold">*</span> son obligatorios.
        </p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Field label="Tipo Documento" required error={e.tipoDocumento?.message}>
              <Select
                value={form.watch("tipoDocumento")}
                onValueChange={(v) => form.setValue("tipoDocumento", v as ClienteFormData["tipoDocumento"])}
              >
                <SelectTrigger className={e.tipoDocumento ? "border-rose-400" : ""}>
                  <SelectValue>
                    {form.watch("tipoDocumento") === "DNI" ? "DNI" :
                     form.watch("tipoDocumento") === "NIF" ? "NIF" :
                     form.watch("tipoDocumento") === "NIE" ? "NIE" :
                     form.watch("tipoDocumento") === "PASAPORTE" ? "Pasaporte" : ""}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DNI">DNI</SelectItem>
                  <SelectItem value="NIF">NIF</SelectItem>
                  <SelectItem value="NIE">NIE</SelectItem>
                  <SelectItem value="PASAPORTE">Pasaporte</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field label="Nº Documento" required error={e.numeroDocumento?.message}>
              <Input
                className={e.numeroDocumento ? "border-rose-400" : ""}
                {...form.register("numeroDocumento")}
              />
            </Field>

            <Field label="Sexo" error={e.sexo?.message}>
              <Select
                value={form.watch("sexo") || ""}
                onValueChange={(v) => form.setValue("sexo", (v as "M" | "F") || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar">
                    {form.watch("sexo") === "M" ? "Masculino" : form.watch("sexo") === "F" ? "Femenino" : "Seleccionar"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Masculino</SelectItem>
                  <SelectItem value="F">Femenino</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Nombre" required error={e.nombre?.message}>
              <Input className={e.nombre ? "border-rose-400" : ""} {...form.register("nombre")} />
            </Field>
            <Field label="Apellidos" required error={e.apellidos?.message}>
              <Input className={e.apellidos ? "border-rose-400" : ""} {...form.register("apellidos")} />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Fecha Nacimiento">
              <Input type="date" {...form.register("fechaNacimiento")} />
            </Field>
            <Field label="Teléfono" error={e.telefono?.message}>
              <Input className={e.telefono ? "border-rose-400" : ""} {...form.register("telefono")} />
            </Field>
            <Field label="Email" error={e.email?.message}>
              <Input type="email" className={e.email ? "border-rose-400" : ""} {...form.register("email")} />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Field label="Dirección">
                <Input {...form.register("direccion")} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Ciudad">
                <Input {...form.register("ciudad")} />
              </Field>
              <Field label="C.P.">
                <Input {...form.register("codigoPostal")} />
              </Field>
            </div>
          </div>

          <Field label="Observaciones">
            <Textarea className="min-h-[60px]" {...form.register("observaciones")} />
          </Field>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Guardando..." : isEdit ? "Guardar Cambios" : "Crear Cliente"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
