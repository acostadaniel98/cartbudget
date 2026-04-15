/**
 * Format utilities
 */

import { Money } from '@/domain/value-objects/Money';

/**
 * Formatear número como moneda USD
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Formatear Money como moneda
 */
export const formatMoney = (money: Money): string => {
  return money.format();
};

/**
 * Formatear porcentaje
 */
export const formatPercentage = (value: number): string => {
  return `${Math.round(value)}%`;
};
