import type { ShoppingItem } from "@/domain/models/shopping-item";
import type { ShoppingList } from "@/domain/models/shopping-list";
import { apiFetch } from "./client";

export async function duplicateShoppingList(source: ShoppingList, name?: string) {
  const detail = await apiFetch<{ list: ShoppingList; items: ShoppingItem[] }>(
    `/api/v1/lists/${source.id}`,
  );
  return apiFetch<{ list: ShoppingList; items: ShoppingItem[] }>("/api/v1/lists", {
    method: "POST",
    body: JSON.stringify({
      nombre: name?.trim() || `${source.nombre} (copia)`,
      presupuesto: source.presupuesto,
      esPlantilla: false,
      items: detail.items.map((item) => ({
        nombre: item.nombre,
        cantidad: item.cantidad,
        categoria: item.categoria,
        notas: item.notas,
      })),
    }),
  });
}