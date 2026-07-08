"use client";

import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { useMounted } from "@/hooks/use-mounted";

export function OfflineBanner() {
  const mounted = useMounted();
  const isOnline = useOnlineStatus();

  if (!mounted || isOnline) return null;

  return (
    <div className="safe-top flex items-center justify-center gap-1.5 bg-secondary px-4 py-1.5 text-center text-xs font-medium text-secondary-foreground">
      <WifiOff className="size-3.5" />
      Sin conexión — tus cambios se guardan igual en este dispositivo
    </div>
  );
}
