"use client";

import { useMemo } from "react";
import { useEffect, useState } from "react";
import { summarizeBudget } from "@/domain/services/budget-calculator";
import type { ShoppingItem } from "@/domain/models/shopping-item";
import { apiFetch } from "@/lib/api/client";

/** Resumen de presupuesto de solo lectura, pensado para tarjetas de lista. */
export function useListSummary(shoppingListId: string, presupuesto: number | undefined) {
  const [items, setItems] = useState<ShoppingItem[] | undefined>(undefined);

  useEffect(() => {
    let active = true;
    apiFetch<ShoppingItem[]>(`/api/v1/lists/${shoppingListId}/items`)
      .then((data) => active && setItems(data))
      .catch(() => active && setItems([]));
    return () => {
      active = false;
    };
  }, [shoppingListId]);

  const summary = useMemo(() => summarizeBudget(presupuesto, items ?? []), [presupuesto, items]);

  return { summary, isLoading: items === undefined };
}
