"use server";

import { prisma } from "@/lib/prisma";
import { clienteSchema } from "@/lib/validators/clientes";
import { revalidatePath } from "next/cache";
import { handleActionError } from "@/lib/action-error";

export async function getClientes(search?: string) {
  const data = await prisma.cliente.findMany({
    where: search
      ? {
          OR: [
            { nombre: { contains: search, mode: "insensitive" } },
            { apellidos: { contains: search, mode: "insensitive" } },
            { numeroDocumento: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { fechaAlta: "desc" },
  });
  return JSON.parse(JSON.stringify(data));
}

export async function getCliente(id: number) {
  const data = await prisma.cliente.findUnique({
    where: { id },
    include: {
      graduaciones: { orderBy: { fecha: "desc" } },
    },
  });
  return JSON.parse(JSON.stringify(data));
}

export async function createCliente(data: unknown) {
  try {
    const parsed = clienteSchema.parse(data);
    const clienteData = {
      ...parsed,
      fechaNacimiento: parsed.fechaNacimiento ? new Date(parsed.fechaNacimiento) : null,
      email: parsed.email || null,
    };
    const cliente = await prisma.cliente.create({ data: clienteData });
    revalidatePath("/clientes");
    return JSON.parse(JSON.stringify(cliente));
  } catch (e) {
    handleActionError(e);
  }
}

export async function updateCliente(id: number, data: unknown) {
  try {
    const parsed = clienteSchema.parse(data);
    const clienteData = {
      ...parsed,
      fechaNacimiento: parsed.fechaNacimiento ? new Date(parsed.fechaNacimiento) : null,
      email: parsed.email || null,
    };
    const cliente = await prisma.cliente.update({ where: { id }, data: clienteData });
    revalidatePath("/clientes");
    revalidatePath(`/clientes/${id}`);
    return JSON.parse(JSON.stringify(cliente));
  } catch (e) {
    handleActionError(e);
  }
}

export async function deleteCliente(id: number) {
  try {
    await prisma.cliente.delete({ where: { id } });
    revalidatePath("/clientes");
  } catch (e) {
    handleActionError(e);
  }
}
