"use client";

import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { shoppingItemService } from "@/services/shopping-item-service";
import { useMounted } from "@/hooks/use-mounted";
import { summarizeBudget } from "@/domain/services/budget-calculator";

/** Resumen de presupuesto de solo lectura, pensado para tarjetas de lista. */
export function useListSummary(shoppingListId: string, presupuesto: number | undefined) {
  const mounted = useMounted();

  const items = useLiveQuery(async () => {
    if (!mounted) return undefined;
    return shoppingItemService.getByListId(shoppingListId);
  }, [mounted, shoppingListId]);

  const summary = useMemo(() => summarizeBudget(presupuesto, items ?? []), [presupuesto, items]);

  return { summary, isLoading: items === undefined };
}
