"use client";

import { useMemo } from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api/client";
import { useRealtimeList } from "@/hooks/use-realtime-list";
import { summarizeBudget } from "@/domain/services/budget-calculator";
import type {
  CreateShoppingItemInput,
  ShoppingItem,
  UpdateShoppingItemInput,
} from "@/domain/models/shopping-item";

export function useShoppingItems(shoppingListId: string, presupuesto: number | undefined) {
  const [items, setItems] = useState<ShoppingItem[] | undefined>(undefined);

  const reload = async () => {
    setItems(await apiFetch<ShoppingItem[]>(`/api/v1/lists/${shoppingListId}/items`));
  };

  useRealtimeList(shoppingListId, reload);

  useEffect(() => {
    let active = true;
    apiFetch<ShoppingItem[]>(`/api/v1/lists/${shoppingListId}/items`)
      .then((data) => active && setItems(data))
      .catch(() => active && setItems([]));
    return () => {
      active = false;
    };
  }, [shoppingListId]);

  const resolvedItems = useMemo(() => items ?? [], [items]);

  const summary = useMemo(
    () => summarizeBudget(presupuesto, resolvedItems),
    [presupuesto, resolvedItems],
  );

  const runMutation = async (operation: () => Promise<unknown>, message: string) => {
    try {
      await operation();
      await reload();
    } catch {
      toast.error(message, { description: "Inténtalo de nuevo." });
    }
  };

  const addItem = async (input: Omit<CreateShoppingItemInput, "shoppingListId">) => {
    await runMutation(
      () => apiFetch(`/api/v1/lists/${shoppingListId}/items`, { method: "POST", body: JSON.stringify(input) }),
      "No se pudo agregar el producto",
    );
  };

  const addItems = async (inputs: Omit<CreateShoppingItemInput, "shoppingListId">[]) => {
    if (inputs.length === 0) return;
    await runMutation(
      () => Promise.all(inputs.map((input) => apiFetch(`/api/v1/lists/${shoppingListId}/items`, { method: "POST", body: JSON.stringify(input) }))),
      "No se pudieron agregar los productos",
    );
  };

  const updateItem = async (id: string, patch: UpdateShoppingItemInput) => {
    await runMutation(
      () => apiFetch(`/api/v1/lists/${shoppingListId}/items/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
      "No se pudo actualizar el producto",
    );
  };

  const markPurchased = async (id: string, cantidad: number, precioUnitario: number) => {
    await runMutation(
      () => apiFetch(`/api/v1/lists/${shoppingListId}/items/${id}`, { method: "PATCH", body: JSON.stringify({ cantidad, precioUnitario, estado: "comprado" }) }),
      "No se pudo registrar la compra",
    );
  };

  const markNotFound = async (id: string) => {
    await runMutation(
      () => apiFetch(`/api/v1/lists/${shoppingListId}/items/${id}`, { method: "PATCH", body: JSON.stringify({ estado: "no_encontrado" }) }),
      "No se pudo actualizar el producto",
    );
  };

  const markPending = async (id: string) => {
    await runMutation(
      () => apiFetch(`/api/v1/lists/${shoppingListId}/items/${id}`, { method: "PATCH", body: JSON.stringify({ estado: "pendiente" }) }),
      "No se pudo actualizar el producto",
    );
  };

  const reorder = async (orderedIds: string[]) => {
    await runMutation(
      () => apiFetch(`/api/v1/lists/${shoppingListId}/items/reorder`, { method: "POST", body: JSON.stringify({ orderedIds }) }),
      "No se pudo reordenar la lista",
    );
  };

  const removeItem = async (id: string) => {
    try {
      await apiFetch(`/api/v1/lists/${shoppingListId}/items/${id}`, { method: "DELETE" });
      await reload();
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
