import { z } from "zod";

export const dniRegex = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$|^[XYZ][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE]$/i;
// Combina CIF y NIF
export const cifRegex = /^[ABCDEFGHJKLMNPQRSUVW][0-9]{7}[0-9A-J]$|^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$|^[XYZ][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE]$/i;
export const telefonoRegex = /^\+?[0-9\s]{9,15}$/;

export const dniValidation = z.string()
    .max(20, "No puede exceder los 20 caracteres")
    .regex(dniRegex, "Formato de DNI/NIE inválido")
    .optional()
    .or(z.literal(""))
    .nullable()
    .transform(val => val === "" ? null : val);

export const cifValidation = z.string()
    .max(20, "No puede exceder los 20 caracteres")
    .regex(cifRegex, "Formato de CIF/NIF inválido")
    .optional()
    .or(z.literal(""))
    .nullable()
    .transform(val => val === "" ? null : val);

export const telefonoValidation = z.string()
    .max(15, "No puede exceder los 15 caracteres")
    .regex(telefonoRegex, "Formato de teléfono inválido (9-15 dígitos)")
    .optional()
    .or(z.literal(""))
    .nullable()
    .transform(val => val === "" ? null : val);

export const emailValidation = z.string()
    .email("Correo electrónico inválido")
    .max(150, "Email demasiado largo")
    .optional()
    .or(z.literal(""))
    .nullable()
    .transform(val => val === "" ? null : val);
