/**
 * CartBudget - Configuración Global
 * Este archivo centraliza todas las configuraciones de la aplicación
 */

export const CONFIG = {
  APP_NAME: 'CartBudget',
  APP_VERSION: '1.0.0',
  APP_DESCRIPTION: 'Calculadora de compras inteligente en tiempo real',

  /**
   * Configuración de presupuesto
   */
  BUDGET: {
    MIN: 0.01,
    MAX: 999999,
    DEFAULT: 100,
    WARNING_THRESHOLD_PERCENT: 80,
  },

  /**
   * Configuración de productos
   */
  PRODUCT: {
    PRICE_MIN: 0.01,
    PRICE_MAX: 999999,
    QUANTITY_MIN: 1,
    QUANTITY_MAX: 999,
    NAME_MAX_LENGTH: 50,
  },

  /**
   * Configuración de localStorage
   */
  STORAGE: {
    PRODUCTS_KEY: 'cartbudget_products',
    BUDGET_KEY: 'cartbudget_budget',
  },

  /**
   * Configuración de UI
   */
  UI: {
    ANIMATION_DURATION_MS: 200,
    DEBOUNCE_DELAY_MS: 300,
  },

  /**
   * Estados de presupuesto
   */
  STATUS: {
    SAFE: 'safe',
    WARNING: 'warning',
    DANGER: 'danger',
  },
} as const;

/**
 * Validadores reutilizables
 */
export const VALIDATORS = {
  isValidPrice: (price: number) => price > 0 && price <= CONFIG.PRODUCT.PRICE_MAX,
  isValidQuantity: (qty: number) => Number.isInteger(qty) && qty >= CONFIG.PRODUCT.QUANTITY_MIN && qty <= CONFIG.PRODUCT.QUANTITY_MAX,
  isValidBudget: (budget: number) => budget > 0 && budget <= CONFIG.BUDGET.MAX,
  isValidProductName: (name: string) => name.trim().length > 0 && name.length <= CONFIG.PRODUCT.NAME_MAX_LENGTH,
};
