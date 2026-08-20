import { ItemStatus } from "@/domain/models/item-status";
import type { ShoppingItem } from "@/domain/models/shopping-item";

/**
 * Reglas de negocio del presupuesto. Funciones puras, sin efectos
 * secundarios y sin ninguna dependencia de React o de la base de datos.
 * Esto permite probarlas de forma aislada (ver __tests__) y reutilizarlas
 * tanto en los servicios de aplicación como en las estadísticas.
 */

/** Redondea a 2 decimales evitando errores de coma flotante (0.1 + 0.2). */
export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** precioTotal = cantidad × precioUnitario */
export function calculateItemTotal(cantidad: number, precioUnitario: number): number {
  if (cantidad < 0 || precioUnitario < 0) {
    throw new Error("La cantidad y el precio unitario no pueden ser negativos");
  }
  return roundCurrency(cantidad * precioUnitario);
}

/** Suma el precioTotal de todos los productos marcados como comprados. */
export function calculateSpent(items: ShoppingItem[]): number {
  const total = items
    .filter((item) => item.estado === ItemStatus.COMPRADO)
    .reduce((sum, item) => sum + item.precioTotal, 0);
  return roundCurrency(total);
}

/**
 * Dinero restante = presupuesto − gastado.
 * Si no existe presupuesto, retorna `null` (la UI no debe mostrar restante).
 */
export function calculateRemaining(presupuesto: number | undefined, spent: number): number | null {
  if (presupuesto === undefined || presupuesto === null) return null;
  return roundCurrency(presupuesto - spent);
}

/**
 * Porcentaje del presupuesto utilizado (0-100+, puede superar 100 si hay
 * sobregasto). Si no existe presupuesto, retorna `null`.
 */
export function calculatePercentageUsed(
  presupuesto: number | undefined,
  spent: number,
): number | null {
  if (presupuesto === undefined || presupuesto === null || presupuesto <= 0) return null;
  return roundCurrency((spent / presupuesto) * 100);
}

export function countByStatus(items: ShoppingItem[]) {
  return {
    pendientes: items.filter((i) => i.estado === ItemStatus.PENDIENTE).length,
    comprados: items.filter((i) => i.estado === ItemStatus.COMPRADO).length,
    noEncontrados: items.filter((i) => i.estado === ItemStatus.NO_ENCONTRADO).length,
  };
}

export interface BudgetSummary {
  presupuesto?: number;
  gastado: number;
  restante: number | null;
  porcentaje: number | null;
  sobrePresupuesto: boolean;
  pendientes: number;
  comprados: number;
  noEncontrados: number;
  totalProductos: number;
}

/** Calcula el resumen completo de presupuesto para una lista de compra. */
export function summarizeBudget(
  presupuesto: number | undefined,
  items: ShoppingItem[],
): BudgetSummary {
  const gastado = calculateSpent(items);
  const restante = calculateRemaining(presupuesto, gastado);
  const porcentaje = calculatePercentageUsed(presupuesto, gastado);
  const { pendientes, comprados, noEncontrados } = countByStatus(items);

  return {
    presupuesto,
    gastado,
    restante,
    porcentaje,
    sobrePresupuesto: restante !== null && restante < 0,
    pendientes,
    comprados,
    noEncontrados,
    totalProductos: items.length,
  };
}
