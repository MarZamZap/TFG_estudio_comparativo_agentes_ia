import { z } from "zod";

export const ventaCabeceraSchema = z.object({
  idTienda: z.coerce.number().min(1, "Seleccione una tienda"),
  idCliente: z.coerce.number().optional().nullable(),
  formaPago: z.string().optional().nullable(),
  observaciones: z
    .string()
    .max(500, "Las observaciones no pueden superar los 500 caracteres")
    .optional()
    .nullable(),
});

export type VentaCabeceraFormData = z.infer<typeof ventaCabeceraSchema>;

export const compraCabeceraSchema = z.object({
  idTienda: z.coerce.number().min(1, "Seleccione una tienda"),
  idProveedor: z.coerce.number().min(1, "Seleccione un proveedor"),
  observaciones: z
    .string()
    .max(500, "Las observaciones no pueden superar los 500 caracteres")
    .optional()
    .nullable(),
});

export type CompraCabeceraFormData = z.infer<typeof compraCabeceraSchema>;

export const traspasoCabeceraSchema = z.object({
  idTiendaOrigen: z.coerce.number().min(1, "Seleccione la tienda de origen"),
  idTiendaDestino: z.coerce.number().min(1, "Seleccione la tienda de destino"),
  observaciones: z
    .string()
    .max(500, "Las observaciones no pueden superar los 500 caracteres")
    .optional()
    .nullable(),
});

export type TraspasoCabeceraFormData = z.infer<typeof traspasoCabeceraSchema>;

export const operacionLineaSchema = z.object({
  idProducto: z.coerce.number().min(1, "Seleccione un producto"),
  cantidad: z.coerce
    .number()
    .int("La cantidad debe ser un número entero")
    .min(1, "La cantidad mínima es 1"),
});

export type OperacionLineaFormData = z.infer<typeof operacionLineaSchema>;
