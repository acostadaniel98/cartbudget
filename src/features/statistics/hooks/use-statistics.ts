"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api/client";
import type { StatisticsData } from "@/services/statistics-service";

export function useStatistics() {
  const [stats, setStats] = useState<StatisticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiFetch<StatisticsData>("/api/v1/statistics")
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setIsLoading(false));
  }, []);

  return { stats, isLoading };
}
