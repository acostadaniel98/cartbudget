import { useEffect, useState } from "react";

/**
 * Refleja `navigator.onLine`. CartBudget funciona igual de bien sin
 * conexión (todo vive en IndexedDB), pero mostramos un indicador discreto
 * para que el usuario sepa que no perderá nada si se queda sin señal.
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
