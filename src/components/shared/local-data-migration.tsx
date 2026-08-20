"use client";

import { useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { apiFetch } from "@/lib/api/client";
import { getDb } from "@/repositories/dexie/database";
import type { Category } from "@/domain/models/category";
import type { FrequentProduct } from "@/domain/models/frequent-product";
import type { ShoppingItem } from "@/domain/models/shopping-item";
import type { ShoppingList } from "@/domain/models/shopping-list";

export function LocalDataMigration() {
  useEffect(() => {
    let active = true;
    async function migrate() {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getUser();
      if (!active || !data.user) return;

      const remoteLists = await apiFetch<ShoppingList[]>('/api/v1/lists');
      if (remoteLists.length > 0) return;

      const db = getDb();
      const [lists, items, categories, frequentProducts] = await Promise.all([
        db.shoppingLists.toArray(),
        db.shoppingItems.toArray(),
        db.categories.toArray(),
        db.frequentProducts.toArray(),
      ]);
      if (!active || lists.length === 0) return;

      const itemsByList = new Map<string, ShoppingItem[]>();
      for (const item of items) {
        const current = itemsByList.get(item.shoppingListId) ?? [];
        current.push(item);
        itemsByList.set(item.shoppingListId, current);
      }
      await apiFetch('/api/v1/migrations/local', {
        method: 'POST',
        body: JSON.stringify({
          lists: lists.map((list: ShoppingList) => ({
            legacyId: list.id,
            nombre: list.nombre,
            presupuesto: list.presupuesto,
            esPlantilla: list.esPlantilla,
            notas: list.notas,
            fechaCreacion: list.fechaCreacion,
            fechaActualizacion: list.fechaActualizacion,
            items: (itemsByList.get(list.id) ?? []).map((item) => ({
              nombre: item.nombre,
              cantidad: item.cantidad,
              precioUnitario: item.precioUnitario,
              categoria: item.categoria,
              estado: item.estado,
              notas: item.notas,
              orden: item.orden,
              fechaCompra: item.fechaCompra,
            })),
          })),
          categories: categories.map((category: Category) => ({
            nombre: category.nombre,
            icono: category.icono,
            color: category.color,
            personalizada: category.personalizada,
            orden: category.orden,
          })),
          frequentProducts: frequentProducts.map((product: FrequentProduct) => ({
            nombreNormalizado: product.nombreNormalizado,
            nombre: product.nombre,
            categoria: product.categoria,
            frecuencia: product.frecuencia,
            ultimoPrecioUnitario: product.ultimoPrecioUnitario,
            ultimaCantidad: product.ultimaCantidad,
          })),
        }),
      });
    }

    migrate().catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  return null;
}