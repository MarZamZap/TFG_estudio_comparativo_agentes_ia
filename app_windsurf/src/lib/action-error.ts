import { ZodError } from "zod";

/**
 * Convierte un ZodError en un mensaje de error legible en español.
 * Si el error no es de Zod, relanza el error original.
 */
export function handleActionError(error: unknown): never {
  if (error instanceof ZodError) {
    // Toma el primer mensaje de validación
    const firstMessage = error.issues[0]?.message;
    throw new Error(firstMessage ?? "Los datos introducidos no son válidos");
  }

  // Error de base de datos: clave duplicada (Prisma P2002)
  if (
    error instanceof Error &&
    (error as { code?: string }).code === "P2002"
  ) {
    throw new Error("Ya existe un registro con esos datos. Comprueba los campos únicos (DNI, CIF, email...)");
  }

  // Error de base de datos: registro referenciado no encontrado (Prisma P2025)
  if (
    error instanceof Error &&
    (error as { code?: string }).code === "P2025"
  ) {
    throw new Error("No se encontró el registro que intenta modificar. Es posible que haya sido eliminado");
  }

  // Cualquier otro error
  if (error instanceof Error) {
    throw error;
  }

  throw new Error("Ha ocurrido un error inesperado. Inténtelo de nuevo");
}
