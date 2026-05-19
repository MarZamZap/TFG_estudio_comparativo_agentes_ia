"use server";

import { prisma } from "@/lib/prisma";
import { productoSchema } from "@/lib/validators/productos";
import { revalidatePath } from "next/cache";
import { handleActionError } from "@/lib/action-error";

export async function getProductos(filters?: {
  search?: string;
  idCategoria?: number;
  idProveedor?: number;
  marca?: string;
}) {
  const where: Record<string, unknown> = { activo: true };
  if (filters?.search) {
    where.OR = [
      { nombre: { contains: filters.search, mode: "insensitive" } },
      { codigo: { contains: filters.search, mode: "insensitive" } },
      { marca: { contains: filters.search, mode: "insensitive" } },
      { modelo: { contains: filters.search, mode: "insensitive" } },
    ];
  }
  if (filters?.idCategoria) where.idCategoria = filters.idCategoria;
  if (filters?.idProveedor) where.idProveedor = filters.idProveedor;
  if (filters?.marca) where.marca = { contains: filters.marca, mode: "insensitive" };

  const rows = await prisma.producto.findMany({
    where,
    include: { categoria: true, proveedor: true, atributos: true },
    orderBy: { nombre: "asc" },
  });
  return rows.map((p) => ({
    ...p,
    precioVenta: Number(p.precioVenta),
    precioCoste: Number(p.precioCoste),
    fechaCreacion: p.fechaCreacion.toISOString(),
  }));
}

export async function getProducto(id: number) {
  const p = await prisma.producto.findUnique({
    where: { id },
    include: { categoria: true, proveedor: true, atributos: true },
  });
  if (!p) return null;
  return {
    ...p,
    precioVenta: Number(p.precioVenta),
    precioCoste: Number(p.precioCoste),
    fechaCreacion: p.fechaCreacion.toISOString(),
  };
}

export async function createProducto(data: unknown) {
  try {
    const parsed = productoSchema.parse(data);
    const { calibre, puente, varilla, colorCodigo, colorDescripcion, material, tipoMontura, genero, ...productoData } = parsed;

    const producto = await prisma.$transaction(async (tx) => {
      const prod = await tx.producto.create({
        data: {
          ...productoData,
          idCategoria: productoData.idCategoria || null,
          idProveedor: productoData.idProveedor || null,
        },
      });
      await tx.productoAtributos.create({
        data: {
          idProducto: prod.id,
          calibre: calibre || null,
          puente: puente || null,
          varilla: varilla || null,
          colorCodigo: colorCodigo || null,
          colorDescripcion: colorDescripcion || null,
          material: material || null,
          tipoMontura: tipoMontura || null,
          genero: genero || null,
        },
      });
      return prod;
    });

    revalidatePath("/catalogo");
    return {
      ...producto,
      precioVenta: Number(producto.precioVenta),
      precioCoste: Number(producto.precioCoste),
      fechaCreacion: producto.fechaCreacion.toISOString(),
    };
  } catch (e) {
    handleActionError(e);
  }
}

export async function updateProducto(id: number, data: unknown) {
  try {
    const parsed = productoSchema.parse(data);
    const { calibre, puente, varilla, colorCodigo, colorDescripcion, material, tipoMontura, genero, ...productoData } = parsed;

    const producto = await prisma.$transaction(async (tx) => {
      const prod = await tx.producto.update({
        where: { id },
        data: {
          ...productoData,
          idCategoria: productoData.idCategoria || null,
          idProveedor: productoData.idProveedor || null,
        },
      });
      await tx.productoAtributos.upsert({
        where: { idProducto: id },
        create: {
          idProducto: id,
          calibre: calibre || null,
          puente: puente || null,
          varilla: varilla || null,
          colorCodigo: colorCodigo || null,
          colorDescripcion: colorDescripcion || null,
          material: material || null,
          tipoMontura: tipoMontura || null,
          genero: genero || null,
        },
        update: {
          calibre: calibre || null,
          puente: puente || null,
          varilla: varilla || null,
          colorCodigo: colorCodigo || null,
          colorDescripcion: colorDescripcion || null,
          material: material || null,
          tipoMontura: tipoMontura || null,
          genero: genero || null,
        },
      });
      return prod;
    });

    revalidatePath("/catalogo");
    revalidatePath(`/catalogo/${id}`);
    return {
      ...producto,
      precioVenta: Number(producto.precioVenta),
      precioCoste: Number(producto.precioCoste),
      fechaCreacion: producto.fechaCreacion.toISOString(),
    };
  } catch (e) {
    handleActionError(e);
  }
}

export async function deleteProducto(id: number) {
  await prisma.producto.update({ where: { id }, data: { activo: false } });
  revalidatePath("/catalogo");
}
