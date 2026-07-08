"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { frequentProductService } from "@/services/frequent-product-service";
import { useMounted } from "@/hooks/use-mounted";
import { useDebounce } from "@/hooks/use-debounce";

export function useFrequentSuggestions(query: string, limit = 6) {
  const mounted = useMounted();
  const debouncedQuery = useDebounce(query, 150);

  const suggestions = useLiveQuery(async () => {
    if (!mounted) return undefined;
    return frequentProductService.suggest(debouncedQuery, limit);
  }, [mounted, debouncedQuery, limit]);

  return suggestions ?? [];
}
