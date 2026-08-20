"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api/client";
import { useRealtimeList } from "@/hooks/use-realtime-list";
import { ROUTES } from "@/constants/routes";
import type { ShoppingItem } from "@/domain/models/shopping-item";
import type { ShoppingList } from "@/domain/models/shopping-list";
import type { UpdateShoppingListInput } from "@/domain/models/shopping-list";

type ListDetail = { list: ShoppingList; items: ShoppingItem[] };

export function useShoppingList(id: string) {
  const router = useRouter();
  const [detail, setDetail] = useState<ListDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiFetch<ListDetail>(`/api/v1/lists/${id}`)
      .then((data) => active && setDetail(data))
      .catch(() => active && setDetail(null))
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  useRealtimeList(id, async () => {
    const data = await apiFetch<ListDetail>(`/api/v1/lists/${id}`);
    setDetail(data);
  }, "detail");

  const update = async (patch: UpdateShoppingListInput) => {
    try {
      const updated = await apiFetch<ShoppingList>(`/api/v1/lists/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      setDetail((current) => (current ? { ...current, list: updated } : current));
      toast.success("Compra actualizada");
      return updated;
    } catch {
      toast.error("No se pudo actualizar la compra", { description: "Inténtalo de nuevo." });
      return undefined;
    }
  };

  const setEsPlantilla = async (esPlantilla: boolean) => {
    await update({ esPlantilla });
  };

  const remove = async () => {
    try {
      await apiFetch(`/api/v1/lists/${id}`, { method: "DELETE" });
      toast.success("Compra eliminada");
      router.push(ROUTES.inicio);
    } catch {
      toast.error("No se pudo eliminar la compra", { description: "Inténtalo de nuevo." });
    }
  };

  const duplicate = async (nuevoNombre?: string) => {
    try {
      if (!detail) throw new Error("Lista no disponible");
      const created = await apiFetch<{ list: ShoppingList; items: ShoppingItem[] }>(
        "/api/v1/lists",
        {
          method: "POST",
          body: JSON.stringify({
            nombre: nuevoNombre?.trim() || `${detail.list.nombre} (copia)`,
            presupuesto: detail.list.presupuesto,
            esPlantilla: false,
            items: detail.items.map((item) => ({
              nombre: item.nombre,
              cantidad: item.cantidad,
              categoria: item.categoria,
              notas: item.notas,
            })),
          }),
        },
      );
      toast.success("Compra duplicada");
      router.push(ROUTES.compra(created.list.id));
      return created.list;
    } catch {
      toast.error("No se pudo duplicar la compra", { description: "Inténtalo de nuevo." });
      return undefined;
    }
  };

  return {
    list: detail?.list ?? null,
    isLoading,
    update,
    setEsPlantilla,
    remove,
    duplicate,
  };
}
