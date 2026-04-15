/**
 * Tipos compartidos de la aplicación
 */

import { Money } from '@/domain/value-objects/Money';

/**
 * Información de un producto en la UI
 */
export interface ProductDisplayData {
  id: string;
  name: string;
  price: Money;
  quantity: number;
  total: Money;
}

/**
 * Información del presupuesto en la UI
 */
export interface BudgetDisplayData {
  budget: Money | null;
  spent: Money;
  remaining: Money;
  percentage: number;
  isExceeded: boolean;
  isNearLimit: boolean;
  status: 'safe' | 'warning' | 'danger' | 'none';
}

/**
 * Errores de formulario
 */
export interface FormErrors {
  [key: string]: string | undefined;
}

/**
 * Estados de carga
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Notificación en la UI
 */
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}
