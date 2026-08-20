import type { AuthError } from "@supabase/supabase-js";

/**
 * Traduce errores de Supabase Auth a un mensaje seguro para mostrar.
 *
 * Dos reglas de seguridad se sostienen aquí:
 * 1. Nunca se distingue "el correo no existe" de "la contraseña es
 *    incorrecta" — decir cuál de los dos falló permite a un atacante
 *    enumerar cuentas registradas probando correos uno por uno.
 * 2. Los límites de intentos (429) se comunican de forma clara para que la
 *    persona no siga reintentando a ciegas, sin revelar detalles internos
 *    del proveedor de autenticación.
 */
export function getAuthErrorMessage(error: AuthError, fallback: string): string {
  if (
    error.status === 429 ||
    error.code === "over_request_rate_limit" ||
    error.code === "over_email_send_rate_limit"
  ) {
    return "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.";
  }
  if (error.code === "invalid_credentials") {
    return "El correo o la contraseña no son correctos.";
  }
  if (error.code === "user_already_exists" || error.code === "email_exists") {
    return "Ya existe una cuenta con ese correo. Intenta iniciar sesión.";
  }
  if (error.code === "weak_password") {
    return "Esa contraseña es demasiado común o débil. Usa una diferente.";
  }
  if (error.code === "same_password") {
    return "La nueva contraseña debe ser distinta a la actual.";
  }
  return fallback;
}
