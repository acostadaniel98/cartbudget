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

  return { lists, isLoading };
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

  return { lists, isLoading };
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

  return { templates, isLoading };
}
