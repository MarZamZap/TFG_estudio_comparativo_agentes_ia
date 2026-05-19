import { z } from "zod";

export const clienteSchema = z.object({
  tipoDocumento: z.enum(["DNI", "NIF", "NIE", "PASAPORTE"], {
    message: "Seleccione un tipo de documento",
  }),
  numeroDocumento: z
    .string()
    .trim()
    .min(1, "El número de documento es obligatorio")
    .max(20, "El número de documento no puede superar los 20 caracteres"),
  nombre: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(100, "El nombre no puede superar los 100 caracteres"),
  apellidos: z
    .string()
    .min(1, "Los apellidos son obligatorios")
    .max(150, "Los apellidos no pueden superar los 150 caracteres"),
  fechaNacimiento: z.string().optional().nullable(),
  sexo: z.enum(["M", "F"]).optional().nullable(),
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
  observaciones: z.string().optional().nullable(),
}).superRefine((data, ctx) => {
  const doc = data.numeroDocumento.toUpperCase().replace(/\s/g, "");
  if (data.tipoDocumento === "DNI" || data.tipoDocumento === "NIF") {
    if (!/^\d{8}[A-Z]$/.test(doc)) {
      ctx.addIssue({ path: ["numeroDocumento"], code: z.ZodIssueCode.custom, message: "Formato de DNI/NIF incorrecto (ej: 12345678A)" });
    }
  } else if (data.tipoDocumento === "NIE") {
    if (!/^[XYZ]\d{7}[A-Z]$/.test(doc)) {
      ctx.addIssue({ path: ["numeroDocumento"], code: z.ZodIssueCode.custom, message: "Formato de NIE incorrecto (ej: X1234567A)" });
    }
  } else if (data.tipoDocumento === "PASAPORTE") {
    if (!/^[A-Z0-9]{3,20}$/.test(doc)) {
      ctx.addIssue({ path: ["numeroDocumento"], code: z.ZodIssueCode.custom, message: "Formato de pasaporte incorrecto (solo letras y números)" });
    }
  }
});

export type ClienteFormData = z.infer<typeof clienteSchema>;

export const graduacionSchema = z.object({
  idCliente: z.number(),
  fecha: z.string().optional(),
  odEsfera: z
    .number({ message: "Introduzca un número válido" })
    .min(-30, "La esfera OD debe estar entre -30 y +30")
    .max(30, "La esfera OD debe estar entre -30 y +30")
    .optional()
    .nullable(),
  odCilindro: z
    .number({ message: "Introduzca un número válido" })
    .min(-15, "El cilindro OD debe estar entre -15 y +15")
    .max(15, "El cilindro OD debe estar entre -15 y +15")
    .optional()
    .nullable(),
  odEje: z
    .number({ message: "Introduzca un número válido" })
    .int("El eje OD debe ser un número entero")
    .min(0, "El eje OD debe estar entre 0 y 180")
    .max(180, "El eje OD debe estar entre 0 y 180")
    .optional()
    .nullable(),
  odAdicion: z
    .number({ message: "Introduzca un número válido" })
    .min(0, "La adición OD debe estar entre 0 y 5")
    .max(5, "La adición OD debe estar entre 0 y 5")
    .optional()
    .nullable(),
  odAv: z
    .string()
    .max(20, "La AV OD no puede superar los 20 caracteres")
    .optional()
    .nullable(),
  odDnp: z
    .number({ message: "Introduzca un número válido" })
    .min(15, "El DNP OD debe estar entre 15 y 45 mm")
    .max(45, "El DNP OD debe estar entre 15 y 45 mm")
    .optional()
    .nullable(),
  odAltura: z
    .number({ message: "Introduzca un número válido" })
    .min(0, "La altura OD debe estar entre 0 y 60 mm")
    .max(60, "La altura OD debe estar entre 0 y 60 mm")
    .optional()
    .nullable(),
  oiEsfera: z
    .number({ message: "Introduzca un número válido" })
    .min(-30, "La esfera OI debe estar entre -30 y +30")
    .max(30, "La esfera OI debe estar entre -30 y +30")
    .optional()
    .nullable(),
  oiCilindro: z
    .number({ message: "Introduzca un número válido" })
    .min(-15, "El cilindro OI debe estar entre -15 y +15")
    .max(15, "El cilindro OI debe estar entre -15 y +15")
    .optional()
    .nullable(),
  oiEje: z
    .number({ message: "Introduzca un número válido" })
    .int("El eje OI debe ser un número entero")
    .min(0, "El eje OI debe estar entre 0 y 180")
    .max(180, "El eje OI debe estar entre 0 y 180")
    .optional()
    .nullable(),
  oiAdicion: z
    .number({ message: "Introduzca un número válido" })
    .min(0, "La adición OI debe estar entre 0 y 5")
    .max(5, "La adición OI debe estar entre 0 y 5")
    .optional()
    .nullable(),
  oiAv: z
    .string()
    .max(20, "La AV OI no puede superar los 20 caracteres")
    .optional()
    .nullable(),
  oiDnp: z
    .number({ message: "Introduzca un número válido" })
    .min(15, "El DNP OI debe estar entre 15 y 45 mm")
    .max(45, "El DNP OI debe estar entre 15 y 45 mm")
    .optional()
    .nullable(),
  oiAltura: z
    .number({ message: "Introduzca un número válido" })
    .min(0, "La altura OI debe estar entre 0 y 60 mm")
    .max(60, "La altura OI debe estar entre 0 y 60 mm")
    .optional()
    .nullable(),
  tipoLente: z
    .string()
    .max(50, "El tipo de lente no puede superar los 50 caracteres")
    .optional()
    .nullable(),
  observaciones: z.string().optional().nullable(),
});

export type GraduacionFormData = z.infer<typeof graduacionSchema>;
