import { z } from "zod";

export const productoSchema = z.object({
  codigo: z
    .string()
    .min(1, "El código del producto es obligatorio")
    .max(50, "El código no puede superar los 50 caracteres"),
  nombre: z
    .string()
    .min(1, "El nombre del producto es obligatorio")
    .max(200, "El nombre no puede superar los 200 caracteres"),
  descripcion: z
    .string()
    .max(500, "La descripción no puede superar los 500 caracteres")
    .optional()
    .nullable(),
  marca: z
    .string()
    .max(100, "La marca no puede superar los 100 caracteres")
    .optional()
    .nullable(),
  modelo: z
    .string()
    .max(100, "El modelo no puede superar los 100 caracteres")
    .optional()
    .nullable(),
  precioCoste: z.coerce
    .number()
    .min(0, "El precio de coste debe ser un valor positivo"),
  precioVenta: z.coerce
    .number()
    .min(0, "El precio de venta debe ser un valor positivo"),
  idCategoria: z.coerce.number().optional().nullable(),
  idProveedor: z.coerce.number().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  activo: z.boolean().default(true),
  // Atributos (1:1)
  calibre: z
    .string()
    .max(20, "El calibre no puede superar los 20 caracteres")
    .optional()
    .nullable(),
  puente: z
    .string()
    .max(20, "El puente no puede superar los 20 caracteres")
    .optional()
    .nullable(),
  varilla: z
    .string()
    .max(20, "La varilla no puede superar los 20 caracteres")
    .optional()
    .nullable(),
  colorCodigo: z
    .string()
    .max(50, "El código de color no puede superar los 50 caracteres")
    .optional()
    .nullable(),
  colorDescripcion: z
    .string()
    .max(100, "La descripción de color no puede superar los 100 caracteres")
    .optional()
    .nullable(),
  material: z
    .string()
    .max(50, "El material no puede superar los 50 caracteres")
    .optional()
    .nullable(),
  tipoMontura: z
    .string()
    .max(50, "El tipo de montura no puede superar los 50 caracteres")
    .optional()
    .nullable(),
  genero: z
    .string()
    .max(20, "El género no puede superar los 20 caracteres")
    .optional()
    .nullable(),
});

export type ProductoFormData = z.infer<typeof productoSchema>;

export const stockSchema = z.object({
  idTienda: z.coerce.number().min(1, "Seleccione una tienda"),
  idProducto: z.coerce.number().min(1, "Seleccione un producto"),
  stockMinimoAlerta: z.coerce
    .number()
    .int("El stock mínimo debe ser un número entero")
    .min(0, "El stock mínimo no puede ser negativo")
    .default(5),
});

export type StockFormData = z.infer<typeof stockSchema>;
