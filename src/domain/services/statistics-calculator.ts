import { ItemStatus } from "@/domain/models/item-status";
import type { ShoppingItem } from "@/domain/models/shopping-item";
import type { ShoppingList } from "@/domain/models/shopping-list";
import { calculateSpent, roundCurrency } from "./budget-calculator";

/**
 * Cálculos de estadísticas. Toman datos ya cargados (listas + productos) y
 * devuelven estructuras simples para la UI. Todo se calcula localmente,
 * sin llamadas de red ni IA.
 */

export interface ProductoMasComprado {
  nombre: string;
  vecesComprado: number;
  cantidadTotal: number;
}

export function getMostPurchasedProducts(
  items: ShoppingItem[],
  limit = 10,
): ProductoMasComprado[] {
  const purchased = items.filter((i) => i.estado === ItemStatus.COMPRADO);
  const map = new Map<string, ProductoMasComprado>();

  for (const item of purchased) {
    const key = item.nombre.trim().toLowerCase();
    const existing = map.get(key);
    if (existing) {
      existing.vecesComprado += 1;
      existing.cantidadTotal += item.cantidad;
    } else {
      map.set(key, {
        nombre: item.nombre,
        vecesComprado: 1,
        cantidadTotal: item.cantidad,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => b.vecesComprado - a.vecesComprado).slice(0, limit);
}

/** Promedio gastado entre las listas que tienen al menos un producto comprado. */
export function getAverageSpent(
  lists: ShoppingList[],
  itemsByListId: Map<string, ShoppingItem[]>,
): number {
  const spentAmounts = lists
    .map((list) => calculateSpent(itemsByListId.get(list.id) ?? []))
    .filter((spent) => spent > 0);

  if (spentAmounts.length === 0) return 0;
  const total = spentAmounts.reduce((sum, value) => sum + value, 0);
  return roundCurrency(total / spentAmounts.length);
}

export interface CompraPorMes {
  mes: string; 
  cantidad: number;
}

export function getPurchasesByMonth(lists: ShoppingList[]): CompraPorMes[] {
  const map = new Map<string, number>();

  for (const list of lists) {
    const date = new Date(list.fechaCreacion);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    map.set(key, (map.get(key) ?? 0) + 1);
  }

  return Array.from(map.entries())
    .map(([mes, cantidad]) => ({ mes, cantidad }))
    .sort((a, b) => a.mes.localeCompare(b.mes));
}

export interface GastoPorCategoria {
  categoria: string;
  total: number;
}

export function getSpendByCategory(items: ShoppingItem[]): GastoPorCategoria[] {
  const purchased = items.filter((i) => i.estado === ItemStatus.COMPRADO);
  const map = new Map<string, number>();

  for (const item of purchased) {
    map.set(item.categoria, roundCurrency((map.get(item.categoria) ?? 0) + item.precioTotal));
  }

  return Array.from(map.entries())
    .map(([categoria, total]) => ({ categoria, total }))
    .sort((a, b) => b.total - a.total);
}

export interface CategoriaMasUtilizada {
  categoria: string;
  vecesUtilizada: number;
}

export function getMostUsedCategories(
  items: ShoppingItem[],
  limit = 5,
): CategoriaMasUtilizada[] {
  const map = new Map<string, number>();
  for (const item of items) {
    map.set(item.categoria, (map.get(item.categoria) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([categoria, vecesUtilizada]) => ({ categoria, vecesUtilizada }))
    .sort((a, b) => b.vecesUtilizada - a.vecesUtilizada)
    .slice(0, limit);
}
