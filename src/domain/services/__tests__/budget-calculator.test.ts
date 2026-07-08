import { describe, expect, it } from "vitest";
import { ItemStatus } from "@/domain/models/item-status";
import type { ShoppingItem } from "@/domain/models/shopping-item";
import {
  calculateItemTotal,
  calculatePercentageUsed,
  calculateRemaining,
  calculateSpent,
  countByStatus,
  roundCurrency,
  summarizeBudget,
} from "@/domain/services/budget-calculator";

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

describe("roundCurrency", () => {
  it("evita errores de coma flotante", () => {
    expect(roundCurrency(0.1 + 0.2)).toBe(0.3);
  });
});

describe("calculateItemTotal", () => {
  it("multiplica cantidad por precio unitario", () => {
    expect(calculateItemTotal(3, 1.5)).toBe(4.5);
  });

  it("redondea a 2 decimales", () => {
    expect(calculateItemTotal(3, 0.1)).toBe(0.3);
  });

  it("lanza error si la cantidad es negativa", () => {
    expect(() => calculateItemTotal(-1, 2)).toThrowError();
  });

  it("lanza error si el precio unitario es negativo", () => {
    expect(() => calculateItemTotal(1, -2)).toThrowError();
  });
});

describe("calculateSpent", () => {
  it("suma solo los productos comprados", () => {
    const items = [
      makeItem({ estado: ItemStatus.COMPRADO, precioTotal: 10 }),
      makeItem({ estado: ItemStatus.PENDIENTE, precioTotal: 999 }),
      makeItem({ estado: ItemStatus.COMPRADO, precioTotal: 5.5 }),
      makeItem({ estado: ItemStatus.NO_ENCONTRADO, precioTotal: 50 }),
    ];
    expect(calculateSpent(items)).toBe(15.5);
  });

  it("retorna 0 si no hay productos comprados", () => {
    const items = [makeItem({ estado: ItemStatus.PENDIENTE, precioTotal: 100 })];
    expect(calculateSpent(items)).toBe(0);
  });
});

describe("calculateRemaining", () => {
  it("retorna null si no hay presupuesto", () => {
    expect(calculateRemaining(undefined, 20)).toBeNull();
  });

  it("resta lo gastado del presupuesto", () => {
    expect(calculateRemaining(100, 30)).toBe(70);
  });

  it("puede ser negativo si hay sobregasto", () => {
    expect(calculateRemaining(50, 80)).toBe(-30);
  });
});

describe("calculatePercentageUsed", () => {
  it("retorna null si no hay presupuesto", () => {
    expect(calculatePercentageUsed(undefined, 20)).toBeNull();
  });

  it("retorna null si el presupuesto es cero", () => {
    expect(calculatePercentageUsed(0, 20)).toBeNull();
  });

  it("calcula el porcentaje correctamente", () => {
    expect(calculatePercentageUsed(200, 50)).toBe(25);
  });

  it("puede superar 100 si hay sobregasto", () => {
    expect(calculatePercentageUsed(100, 150)).toBe(150);
  });
});

describe("countByStatus", () => {
  it("cuenta productos por cada estado", () => {
    const items = [
      makeItem({ estado: ItemStatus.PENDIENTE }),
      makeItem({ estado: ItemStatus.PENDIENTE }),
      makeItem({ estado: ItemStatus.COMPRADO }),
      makeItem({ estado: ItemStatus.NO_ENCONTRADO }),
    ];
    expect(countByStatus(items)).toEqual({ pendientes: 2, comprados: 1, noEncontrados: 1 });
  });
});

describe("summarizeBudget", () => {
  it("arma un resumen completo con presupuesto", () => {
    const items = [
      makeItem({ estado: ItemStatus.COMPRADO, precioTotal: 20 }),
      makeItem({ estado: ItemStatus.PENDIENTE }),
    ];
    const summary = summarizeBudget(100, items);
    expect(summary).toEqual({
      presupuesto: 100,
      gastado: 20,
      restante: 80,
      porcentaje: 20,
      sobrePresupuesto: false,
      pendientes: 1,
      comprados: 1,
      noEncontrados: 0,
      totalProductos: 2,
    });
  });

  it("marca sobrePresupuesto cuando el restante es negativo", () => {
    const items = [makeItem({ estado: ItemStatus.COMPRADO, precioTotal: 150 })];
    const summary = summarizeBudget(100, items);
    expect(summary.sobrePresupuesto).toBe(true);
    expect(summary.restante).toBe(-50);
  });

  it("no calcula restante ni porcentaje sin presupuesto", () => {
    const items = [makeItem({ estado: ItemStatus.COMPRADO, precioTotal: 10 })];
    const summary = summarizeBudget(undefined, items);
    expect(summary.restante).toBeNull();
    expect(summary.porcentaje).toBeNull();
  });
});
