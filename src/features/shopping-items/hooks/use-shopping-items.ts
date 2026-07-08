"use client";

import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { toast } from "sonner";
import { shoppingItemService } from "@/services/shopping-item-service";
import { useMounted } from "@/hooks/use-mounted";
import { summarizeBudget } from "@/domain/services/budget-calculator";
import type { CreateShoppingItemInput, UpdateShoppingItemInput } from "@/domain/models/shopping-item";

export function useShoppingItems(shoppingListId: string, presupuesto: number | undefined) {
  const mounted = useMounted();

  const items = useLiveQuery(async () => {
    if (!mounted) return undefined;
    return shoppingItemService.getByListId(shoppingListId);
  }, [mounted, shoppingListId]);

  const resolvedItems = useMemo(() => items ?? [], [items]);

  const summary = useMemo(() => summarizeBudget(presupuesto, resolvedItems), [presupuesto, resolvedItems]);

  const addItem = async (input: Omit<CreateShoppingItemInput, "shoppingListId">) => {
    await shoppingItemService.add({ ...input, shoppingListId });
  };

  const addItems = async (inputs: Omit<CreateShoppingItemInput, "shoppingListId">[]) => {
    if (inputs.length === 0) return;
    await shoppingItemService.addMany(inputs.map((input) => ({ ...input, shoppingListId })));
  };

  const updateItem = async (id: string, patch: UpdateShoppingItemInput) => {
    await shoppingItemService.update(id, patch);
  };

  const markPurchased = async (id: string, cantidad: number, precioUnitario: number) => {
    await shoppingItemService.markPurchased(id, cantidad, precioUnitario);
  };

  const markNotFound = async (id: string) => {
    await shoppingItemService.markNotFound(id);
  };

  const markPending = async (id: string) => {
    await shoppingItemService.markPending(id);
  };

  const reorder = async (orderedIds: string[]) => {
    await shoppingItemService.reorder(shoppingListId, orderedIds);
  };

  const removeItem = async (id: string) => {
    await shoppingItemService.delete(id);
    toast.success("Producto eliminado");
  };

  return {
    items: resolvedItems,
    isLoading: items === undefined,
    summary,
    addItem,
    addItems,
    updateItem,
    markPurchased,
    markNotFound,
    markPending,
    reorder,
    removeItem,
  };
}
