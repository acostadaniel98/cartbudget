import { useEffect } from "react";

/**
 * Registra el service worker propio (public/sw.js) solo en producción y
 * solo en el navegador. En desarrollo se evita a propósito para no cachear
 * builds intermedios de Turbopack y complicar el hot reload.
 */
export function useServiceWorker(): void {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
}
