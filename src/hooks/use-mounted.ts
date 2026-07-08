import { useEffect, useState } from "react";

/**
 * Devuelve `true` solo después de que el componente se montó en el
 * navegador. Next.js renderiza los componentes cliente también en el
 * servidor para el HTML inicial, donde IndexedDB no existe; los componentes
 * que dependen de Dexie deben esperar a este flag antes de consultar datos.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
