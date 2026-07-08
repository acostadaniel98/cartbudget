"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { shoppingListService } from "@/services/shopping-list-service";
import { useMounted } from "@/hooks/use-mounted";

/** Todas las compras no-plantilla, más recientes primero. */
export function useShoppingLists() {
  const mounted = useMounted();

  const lists = useLiveQuery(async () => {
    if (!mounted) return undefined;
    const all = await shoppingListService.getAll();
    return all.filter((list) => !list.esPlantilla);
  }, [mounted]);

  return { lists: lists ?? [], isLoading: lists === undefined };
}

export function useRecentShoppingLists(limit = 5) {
  const mounted = useMounted();

  const lists = useLiveQuery(async () => {
    if (!mounted) return undefined;
    return shoppingListService.getRecent(limit);
  }, [mounted, limit]);

  return { lists: lists ?? [], isLoading: lists === undefined };
}

export function useActiveShoppingList() {
  const mounted = useMounted();

  const list = useLiveQuery(async () => {
    if (!mounted) return undefined;
    return (await shoppingListService.getActiveList()) ?? null;
  }, [mounted]);

  return { activeList: list ?? null, isLoading: list === undefined };
}

export function useTemplates() {
  const mounted = useMounted();

  const templates = useLiveQuery(async () => {
    if (!mounted) return undefined;
    return shoppingListService.getTemplates();
  }, [mounted]);

  return { templates: templates ?? [], isLoading: templates === undefined };
}
