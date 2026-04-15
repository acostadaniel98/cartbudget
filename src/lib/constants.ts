/**
 * Constants
 */

// Presupuesto
export const DEFAULT_BUDGET = 100;
export const MIN_BUDGET = 0.01;
export const MAX_BUDGET = 999999;

// Productos
export const MIN_PRICE = 0.01;
export const MAX_PRICE = 999999;
export const MIN_QUANTITY = 1;
export const MAX_QUANTITY = 999;

// Budget status
export const BUDGET_STATUS_COLORS = {
  safe: 'green',
  warning: 'yellow',
  danger: 'red',
} as const;

// Límite de alerta (porcentaje)
export const BUDGET_WARNING_THRESHOLD = 80;
