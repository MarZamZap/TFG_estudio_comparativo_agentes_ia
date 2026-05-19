"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { graduacionSchema, GraduacionFormData } from "@/lib/validators/clientes";
import { createGraduacion } from "@/actions/graduaciones";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/shared/field";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idCliente: number;
}

export function GraduacionFormDialog({ open, onOpenChange, idCliente }: Props) {
  const router = useRouter();

  const form = useForm<GraduacionFormData>({
    resolver: zodResolver(graduacionSchema),
    defaultValues: {
      idCliente,
      fecha: new Date().toISOString().split("T")[0],
    },
  });

  const onSubmit = async (data: GraduacionFormData) => {
    try {
      await createGraduacion({ ...data, idCliente });
      toast.success("Graduación registrada correctamente");
      onOpenChange(false);
      form.reset({ idCliente, fecha: new Date().toISOString().split("T")[0] });
      router.refresh();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error al guardar";
      toast.error(message);
    }
  };

  const onFormError = (errors: any) => {
    // Tomamos el primer error del formulario para mostrarlo en un toast
    const primerError = Object.values(errors)[0] as any;
    if (primerError?.message) {
      toast.error(primerError.message);
    } else {
      toast.error("Hay campos incorrectos en el formulario");
    }
  };

  // Registro con conversión de texto a número
  const num = (name: keyof GraduacionFormData) =>
    form.register(name, {
      setValueAs: (v: string) => (v === "" || v === "-" ? null : parseFloat(v)),
    });
  const int = (name: keyof GraduacionFormData) =>
    form.register(name, {
      setValueAs: (v: string) => (v === "" ? null : parseInt(v, 10)),
    });

  const renderEyeSection = (label: string, color: "indigo" | "emerald", isOD: boolean) => {
    const badgeCls = color === "indigo"
      ? "bg-indigo-100 text-indigo-700"
      : "bg-emerald-100 text-emerald-700";
    const bgCls = color === "indigo" ? "bg-indigo-50/50" : "bg-emerald-50/50";
    const errs = form.formState.errors;

    const getErrCls = (name: keyof GraduacionFormData) => 
      errs[name] ? "border-rose-500 focus-visible:ring-rose-500" : "";

    return (
      <div className={`rounded-xl border border-slate-200 ${bgCls} p-4 space-y-3`}>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center justify-center h-6 w-10 rounded-full text-xs font-black ${badgeCls}`}>
            {isOD ? "OD" : "OI"}
          </span>
          <span className="text-sm font-semibold text-slate-700">{label}</span>
        </div>

        {/* Fila 1: Esfera · Cilindro · Eje */}
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className={`text-xs font-medium ${errs[isOD ? "odEsfera" : "oiEsfera"] ? "text-rose-500" : "text-slate-500"}`}>Esfera</Label>
            <Input type="text" inputMode="decimal" placeholder="0.00" className={`text-center ${getErrCls(isOD ? "odEsfera" : "oiEsfera")}`}
              {...num(isOD ? "odEsfera" : "oiEsfera")} />
          </div>
          <div className="space-y-1">
            <Label className={`text-xs font-medium ${errs[isOD ? "odCilindro" : "oiCilindro"] ? "text-rose-500" : "text-slate-500"}`}>Cilindro</Label>
            <Input type="text" inputMode="decimal" placeholder="0.00" className={`text-center ${getErrCls(isOD ? "odCilindro" : "oiCilindro")}`}
              {...num(isOD ? "odCilindro" : "oiCilindro")} />
          </div>
          <div className="space-y-1">
            <Label className={`text-xs font-medium ${errs[isOD ? "odEje" : "oiEje"] ? "text-rose-500" : "text-slate-500"}`}>Eje (°)</Label>
            <Input type="text" inputMode="numeric" placeholder="0" className={`text-center ${getErrCls(isOD ? "odEje" : "oiEje")}`}
              {...int(isOD ? "odEje" : "oiEje")} />
          </div>
        </div>

        {/* Fila 2: Adición · AV · DNP · Altura */}
        <div className="grid grid-cols-4 gap-3">
          <div className="space-y-1">
            <Label className={`text-xs font-medium ${errs[isOD ? "odAdicion" : "oiAdicion"] ? "text-rose-500" : "text-slate-500"}`}>Adición</Label>
            <Input type="text" inputMode="decimal" placeholder="0.00" className={`text-center ${getErrCls(isOD ? "odAdicion" : "oiAdicion")}`}
              {...num(isOD ? "odAdicion" : "oiAdicion")} />
          </div>
          <div className="space-y-1">
            <Label className={`text-xs font-medium ${errs[isOD ? "odAv" : "oiAv"] ? "text-rose-500" : "text-slate-500"}`}>A.V.</Label>
            <Input type="text" placeholder="1.0" className={`text-center ${getErrCls(isOD ? "odAv" : "oiAv")}`}
              {...form.register(isOD ? "odAv" : "oiAv")} />
          </div>
          <div className="space-y-1">
            <Label className={`text-xs font-medium ${errs[isOD ? "odDnp" : "oiDnp"] ? "text-rose-500" : "text-slate-500"}`}>DNP</Label>
            <Input type="text" inputMode="decimal" placeholder="32.0" className={`text-center ${getErrCls(isOD ? "odDnp" : "oiDnp")}`}
              {...num(isOD ? "odDnp" : "oiDnp")} />
          </div>
          <div className="space-y-1">
            <Label className={`text-xs font-medium ${errs[isOD ? "odAltura" : "oiAltura"] ? "text-rose-500" : "text-slate-500"}`}>Altura</Label>
            <Input type="text" inputMode="decimal" placeholder="22.0" className={`text-center ${getErrCls(isOD ? "odAltura" : "oiAltura")}`}
              {...num(isOD ? "odAltura" : "oiAltura")} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Nueva Graduación</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit, onFormError)} className="space-y-4">

          <p className="text-[11px] text-slate-400">
            Los campos marcados con <span className="text-rose-500 font-bold">*</span> son obligatorios.
          </p>

          {/* Fecha + Tipo de lente */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Fecha" required error={form.formState.errors.fecha?.message}>
              <Input type="date" className={form.formState.errors.fecha ? "border-rose-400" : ""} {...form.register("fecha")} />
            </Field>
            <Field label="Tipo de Lente">
              <Input placeholder="Ej: Progresiva, Monofocal…" {...form.register("tipoLente")} />
            </Field>
          </div>

          {renderEyeSection("Ojo Derecho", "indigo", true)}
          {renderEyeSection("Ojo Izquierdo", "emerald", false)}

          {/* Observaciones */}
          <div className="space-y-1">
            <Label className="text-xs font-medium text-slate-500">Observaciones</Label>
            <Textarea rows={2} placeholder="Notas clínicas, recomendaciones…"
              {...form.register("observaciones")} />
          </div>

          {/* Acciones */}
          <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Guardando…" : "Registrar Graduación"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
