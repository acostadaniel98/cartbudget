import { z } from "zod";

/**
 * Reglas de contraseña compartidas por registro y restablecimiento, para
 * que nunca queden desincronizadas entre pantallas: longitud mínima y
 * combinación de mayúscula/minúscula/número (balance recomendado por NIST
 * entre fuerza real y fricción para el usuario, sin exigir símbolos que
 * solo empujan a patrones predecibles tipo "Contraseña1!").
 */
export const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .max(128, "La contraseña es demasiado larga")
  .regex(/[A-Z]/, "La contraseña debe incluir una mayúscula")
  .regex(/[a-z]/, "La contraseña debe incluir una minúscula")
  .regex(/[0-9]/, "La contraseña debe incluir un número");

export const emailSchema = z.string().trim().toLowerCase().email("Ingresa un correo válido").max(254);

export const newPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmation: z.string().min(1, "Confirma tu nueva contraseña"),
  })
  .refine((values) => values.password === values.confirmation, {
    path: ["confirmation"],
    message: "Las contraseñas no coinciden",
  });
