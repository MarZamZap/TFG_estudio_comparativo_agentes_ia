import { z } from "zod";

export const tiendaSchema = z.object({
  nombreComercial: z
    .string()
    .min(1, "El nombre comercial es obligatorio")
    .max(150, "El nombre comercial no puede superar los 150 caracteres"),
  cif: z
    .string()
    .min(1, "El CIF es obligatorio")
    .max(20, "El CIF no puede superar los 20 caracteres")
    .regex(/^[A-Z]\d{7}[A-Z0-9]$/, "Formato de CIF no válido (ej. B12345678)"),
  direccion: z
    .string()
    .max(300, "La dirección no puede superar los 300 caracteres")
    .optional()
    .nullable(),
  ciudad: z
    .string()
    .max(100, "La ciudad no puede superar los 100 caracteres")
    .optional()
    .nullable(),
  codigoPostal: z
    .string()
    .max(10, "El código postal no puede superar los 10 caracteres")
    .optional()
    .nullable(),
  telefono: z
    .string()
    .refine((val) => !val || /^(?:\+?34\s*)?[6789](?:\s*\d){8}$/.test(val), "Formato de teléfono no válido (ej: 600123456)")
    .optional()
    .nullable()
    .or(z.literal("")),
  email: z
    .string()
    .email("El correo electrónico no tiene un formato válido (ej: correo@dominio.com)")
    .optional()
    .nullable()
    .or(z.literal("")),
  activa: z.boolean().default(true),
});

export type TiendaFormData = z.infer<typeof tiendaSchema>;

export const proveedorSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(150, "El nombre no puede superar los 150 caracteres"),
  cifNif: z
    .string()
    .trim()
    .min(1, "El CIF/NIF es obligatorio")
    .max(20, "El CIF/NIF no puede superar los 20 caracteres")
    .regex(/^(?:[A-Za-z]\d{7}[A-Za-z0-9]|\d{8}[A-Za-z]|[XYZxyz]\d{7}[A-Za-z])$/, "Formato de CIF/NIF incorrecto (ej: B12345678 o 12345678A)"),
  direccion: z
    .string()
    .max(300, "La dirección no puede superar los 300 caracteres")
    .optional()
    .nullable(),
  ciudad: z
    .string()
    .max(100, "La ciudad no puede superar los 100 caracteres")
    .optional()
    .nullable(),
  codigoPostal: z
    .string()
    .max(10, "El código postal no puede superar los 10 caracteres")
    .optional()
    .nullable(),
  telefono: z
    .string()
    .refine((val) => !val || /^(?:\+?34\s*)?[6789](?:\s*\d){8}$/.test(val), "Formato de teléfono no válido (ej: 600123456)")
    .optional()
    .nullable()
    .or(z.literal("")),
  emailPedidos: z
    .string()
    .email("El correo electrónico no tiene un formato válido (ej: correo@dominio.com)")
    .optional()
    .nullable()
    .or(z.literal("")),
  personaContacto: z
    .string()
    .max(150, "El nombre de contacto no puede superar los 150 caracteres")
    .optional()
    .nullable(),
  activo: z.boolean().default(true),
});

export type ProveedorFormData = z.infer<typeof proveedorSchema>;

export const usuarioSchema = z.object({
  username: z
    .string()
    .min(1, "El nombre de usuario es obligatorio")
    .max(50, "El nombre de usuario no puede superar los 50 caracteres"),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .optional(),
  nombreCompleto: z
    .string()
    .min(1, "El nombre completo es obligatorio")
    .max(150, "El nombre completo no puede superar los 150 caracteres"),
  email: z
    .string()
    .email("El correo electrónico no tiene un formato válido (ej: correo@dominio.com)")
    .optional()
    .nullable()
    .or(z.literal("")),
  rol: z.string().default("EMPLEADO"),
  idTienda: z.coerce.number().min(1, "Seleccione una tienda"),
  activo: z.boolean().default(true),
});

export type UsuarioFormData = z.infer<typeof usuarioSchema>;

export const categoriaSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre de la categoría es obligatorio")
    .max(100, "El nombre no puede superar los 100 caracteres"),
  descripcion: z
    .string()
    .max(300, "La descripción no puede superar los 300 caracteres")
    .optional()
    .nullable(),
  idCategoriaPadre: z.coerce.number().optional().nullable(),
  activa: z.boolean().default(true),
});

export type CategoriaFormData = z.infer<typeof categoriaSchema>;
