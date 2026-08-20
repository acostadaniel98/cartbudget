import { z } from "zod";

/** Nombre para mostrar dentro de la app. Vacío es válido: significa que la
 * persona prefiere no personalizarlo y se usa el correo como respaldo. */
export const displayNameSchema = z
  .string()
  .trim()
  .max(40, "Usa como máximo 40 caracteres")
  .regex(/^[\p{L}\p{N} ._-]*$/u, "Usa solo letras, números, espacios y . _ -");
