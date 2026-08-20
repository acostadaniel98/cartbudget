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

  const runMutation = async (operation: () => Promise<unknown>, message: string) => {
    try {
      await operation();
    } catch {
      toast.error(message, { description: "Inténtalo de nuevo." });
    }
  };

  const addItem = async (input: Omit<CreateShoppingItemInput, "shoppingListId">) => {
    await runMutation(() => shoppingItemService.add({ ...input, shoppingListId }), "No se pudo agregar el producto");
  };

  const addItems = async (inputs: Omit<CreateShoppingItemInput, "shoppingListId">[]) => {
    if (inputs.length === 0) return;
    await runMutation(
      () => shoppingItemService.addMany(inputs.map((input) => ({ ...input, shoppingListId }))),
      "No se pudieron agregar los productos",
    );
  };

  const updateItem = async (id: string, patch: UpdateShoppingItemInput) => {
    await runMutation(() => shoppingItemService.update(id, patch), "No se pudo actualizar el producto");
  };

  const markPurchased = async (id: string, cantidad: number, precioUnitario: number) => {
    await runMutation(
      () => shoppingItemService.markPurchased(id, cantidad, precioUnitario),
      "No se pudo registrar la compra",
    );
  };

  const markNotFound = async (id: string) => {
    await runMutation(() => shoppingItemService.markNotFound(id), "No se pudo actualizar el producto");
  };

  const markPending = async (id: string) => {
    await runMutation(() => shoppingItemService.markPending(id), "No se pudo actualizar el producto");
  };

  const reorder = async (orderedIds: string[]) => {
    await runMutation(
      () => shoppingItemService.reorder(shoppingListId, orderedIds),
      "No se pudo reordenar la lista",
    );
  };

  const removeItem = async (id: string) => {
    try {
      await shoppingItemService.delete(id);
      toast.success("Producto eliminado");
    } catch {
      toast.error("No se pudo eliminar el producto", { description: "Inténtalo de nuevo." });
    }
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
