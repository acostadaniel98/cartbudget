import { describe, expect, it } from "vitest";
import { ItemStatus } from "@/domain/models/item-status";
import type { ShoppingItem } from "@/domain/models/shopping-item";
import type { ShoppingList } from "@/domain/models/shopping-list";
import {
  getAverageSpent,
  getMostPurchasedProducts,
  getMostUsedCategories,
  getPurchasesByMonth,
  getSpendByCategory,
} from "@/domain/services/statistics-calculator";

function makeItem(overrides: Partial<ShoppingItem> = {}): ShoppingItem {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    shoppingListId: "list-1",
    nombre: "Leche",
    cantidad: 1,
    precioUnitario: 0,
    precioTotal: 0,
    categoria: "lacteos",
    estado: ItemStatus.PENDIENTE,
    orden: 0,
    ...overrides,
  };
}

function makeList(overrides: Partial<ShoppingList> = {}): ShoppingList {
  const now = Date.now();
  return {
    id: overrides.id ?? crypto.randomUUID(),
    nombre: "Compra semanal",
    fechaCreacion: now,
    fechaActualizacion: now,
    esPlantilla: false,
    ...overrides,
  };
}

describe("getMostPurchasedProducts", () => {
  it("cuenta veces compradas y cantidad total, ignorando pendientes", () => {
    const items = [
      makeItem({ nombre: "Leche", cantidad: 2, estado: ItemStatus.COMPRADO }),
      makeItem({ nombre: "leche", cantidad: 1, estado: ItemStatus.COMPRADO }),
      makeItem({ nombre: "Pan", cantidad: 3, estado: ItemStatus.PENDIENTE }),
    ];
    const result = getMostPurchasedProducts(items);
    expect(result).toEqual([{ nombre: "Leche", vecesComprado: 2, cantidadTotal: 3 }]);
  });

  it("ordena de mayor a menor frecuencia y respeta el límite", () => {
    const items = [
      makeItem({ nombre: "A", estado: ItemStatus.COMPRADO }),
      makeItem({ nombre: "B", estado: ItemStatus.COMPRADO }),
      makeItem({ nombre: "B", estado: ItemStatus.COMPRADO }),
    ];
    const result = getMostPurchasedProducts(items, 1);
    expect(result).toEqual([{ nombre: "B", vecesComprado: 2, cantidadTotal: 2 }]);
  });
});

describe("getAverageSpent", () => {
  it("promedia solo las listas con gasto mayor a cero", () => {
    const listA = makeList();
    const listB = makeList();
    const listC = makeList();
    const itemsByListId = new Map([
      [listA.id, [makeItem({ estado: ItemStatus.COMPRADO, precioTotal: 10 })]],
      [listB.id, [makeItem({ estado: ItemStatus.COMPRADO, precioTotal: 30 })]],
      [listC.id, [makeItem({ estado: ItemStatus.PENDIENTE, precioTotal: 999 })]],
    ]);
    expect(getAverageSpent([listA, listB, listC], itemsByListId)).toBe(20);
  });

  it("retorna 0 si no hay ninguna lista con gasto", () => {
    const list = makeList();
    const itemsByListId = new Map([[list.id, []]]);
    expect(getAverageSpent([list], itemsByListId)).toBe(0);
  });
});

describe("getPurchasesByMonth", () => {
  it("agrupa por año-mes y ordena cronológicamente", () => {
    const enero = new Date(2026, 0, 15).getTime();
    const marzo = new Date(2026, 2, 3).getTime();
    const lists = [
      makeList({ fechaCreacion: enero }),
      makeList({ fechaCreacion: marzo }),
      makeList({ fechaCreacion: enero }),
    ];
    expect(getPurchasesByMonth(lists)).toEqual([
      { mes: "2026-01", cantidad: 2 },
      { mes: "2026-03", cantidad: 1 },
    ]);
  });
});

describe("getSpendByCategory", () => {
  it("suma el gasto por categoría solo de productos comprados", () => {
    const items = [
      makeItem({ categoria: "lacteos", precioTotal: 5, estado: ItemStatus.COMPRADO }),
      makeItem({ categoria: "lacteos", precioTotal: 3, estado: ItemStatus.COMPRADO }),
      makeItem({ categoria: "carnes", precioTotal: 20, estado: ItemStatus.COMPRADO }),
      makeItem({ categoria: "carnes", precioTotal: 999, estado: ItemStatus.PENDIENTE }),
    ];
    expect(getSpendByCategory(items)).toEqual([
      { categoria: "carnes", total: 20 },
      { categoria: "lacteos", total: 8 },
    ]);
  });
});

describe("getMostUsedCategories", () => {
  it("cuenta todas las apariciones sin importar el estado", () => {
    const items = [
      makeItem({ categoria: "lacteos" }),
      makeItem({ categoria: "lacteos" }),
      makeItem({ categoria: "carnes" }),
    ];
    expect(getMostUsedCategories(items)).toEqual([
      { categoria: "lacteos", vecesUtilizada: 2 },
      { categoria: "carnes", vecesUtilizada: 1 },
    ]);
  });
});
