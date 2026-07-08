"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { statisticsService } from "@/services/statistics-service";
import { useMounted } from "@/hooks/use-mounted";

export function useStatistics() {
  const mounted = useMounted();

  const stats = useLiveQuery(async () => {
    if (!mounted) return undefined;
    return statisticsService.getStatistics();
  }, [mounted]);

  return { stats: stats ?? null, isLoading: stats === undefined };
}
