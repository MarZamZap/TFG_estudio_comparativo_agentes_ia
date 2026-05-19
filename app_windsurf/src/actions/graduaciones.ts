"use server";

import { prisma } from "@/lib/prisma";
import { graduacionSchema } from "@/lib/validators/clientes";
import { revalidatePath } from "next/cache";
import { handleActionError } from "@/lib/action-error";

function toDecimalOrNull(val: number | null | undefined): number | null {
  if (val === null || val === undefined) return null;
  return val;
}

export async function getGraduaciones(idCliente: number) {
  const data = await prisma.clienteGraduacion.findMany({
    where: { idCliente },
    orderBy: { fecha: "desc" },
  });
  return JSON.parse(JSON.stringify(data));
}

export async function createGraduacion(data: unknown) {
  try {
    const parsed = graduacionSchema.parse(data);
    const graduacion = await prisma.clienteGraduacion.create({
      data: {
        idCliente: parsed.idCliente,
        fecha: parsed.fecha ? new Date(parsed.fecha) : new Date(),
        odEsfera: toDecimalOrNull(parsed.odEsfera),
        odCilindro: toDecimalOrNull(parsed.odCilindro),
        odEje: parsed.odEje ?? null,
        odAdicion: toDecimalOrNull(parsed.odAdicion),
        odAv: parsed.odAv ?? null,
        odDnp: toDecimalOrNull(parsed.odDnp),
        odAltura: toDecimalOrNull(parsed.odAltura),
        oiEsfera: toDecimalOrNull(parsed.oiEsfera),
        oiCilindro: toDecimalOrNull(parsed.oiCilindro),
        oiEje: parsed.oiEje ?? null,
        oiAdicion: toDecimalOrNull(parsed.oiAdicion),
        oiAv: parsed.oiAv ?? null,
        oiDnp: toDecimalOrNull(parsed.oiDnp),
        oiAltura: toDecimalOrNull(parsed.oiAltura),
        tipoLente: parsed.tipoLente ?? null,
        observaciones: parsed.observaciones ?? null,
      },
    });
    revalidatePath(`/clientes/${parsed.idCliente}/historial`);
    return JSON.parse(JSON.stringify(graduacion));
  } catch (e) {
    handleActionError(e);
  }
}

export async function deleteGraduacion(id: number, idCliente: number) {
  try {
    await prisma.clienteGraduacion.delete({ where: { id } });
    revalidatePath(`/clientes/${idCliente}/historial`);
  } catch (e) {
    handleActionError(e);
  }
}
