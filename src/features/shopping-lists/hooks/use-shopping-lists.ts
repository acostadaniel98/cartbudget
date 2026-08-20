"use client";

import { useEffect, useState } from "react";
import type { ShoppingItem } from "@/domain/models/shopping-item";
import type { ShoppingList } from "@/domain/models/shopping-list";
import { apiFetch } from "@/lib/api/client";

async function getLists() {
  return apiFetch<ShoppingList[]>("/api/v1/lists");
}

export function useShoppingLists() {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getLists()
      .then((data) => active && setLists(data.filter((list) => !list.esPlantilla)))
      .catch(() => active && setLists([]))
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, []);

  // Quita una compra de la lista en pantalla al instante tras eliminarla:
  // sin esto, la tarjeta se quedaba visible después de borrar hasta
  // recargar la página, y al tocarla mostraba "esta compra ya no existe".
  const removeList = (id: string) => setLists((current) => current.filter((list) => list.id !== id));

  return { lists, isLoading, removeList };
}

export function useRecentShoppingLists(limit = 5) {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getLists()
      .then((data) => active && setLists(data.filter((list) => !list.esPlantilla).slice(0, limit)))
      .catch(() => active && setLists([]))
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, [limit]);

  const removeList = (id: string) => setLists((current) => current.filter((list) => list.id !== id));

  return { lists, isLoading, removeList };
}

export function useActiveShoppingList() {
  const [activeList, setActiveList] = useState<ShoppingList | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getLists()
      .then(async (lists) => {
        for (const list of lists.filter((candidate) => !candidate.esPlantilla).slice(0, 20)) {
          const detail = await apiFetch<{ list: ShoppingList; items: ShoppingItem[] }>(
            `/api/v1/lists/${list.id}`,
          );
          if (detail.items.some((item) => item.estado === "pendiente")) {
            if (active) setActiveList(detail.list);
            return;
          }
        }
      })
      .catch(() => active && setActiveList(null))
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return { activeList, isLoading };
}

export function useTemplates() {
  const [templates, setTemplates] = useState<ShoppingList[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getLists()
      .then((data) => active && setTemplates(data.filter((list) => list.esPlantilla)))
      .catch(() => active && setTemplates([]))
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const removeTemplate = (id: string) =>
    setTemplates((current) => current.filter((template) => template.id !== id));

  return { templates, isLoading, removeTemplate };
}
