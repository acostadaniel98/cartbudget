/**
 * Genera un identificador único. Usa crypto.randomUUID cuando está
 * disponible (todos los navegadores modernos) con un respaldo simple
 * para entornos sin esa API (por ejemplo, algunos runtimes de pruebas).
 */
export function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
