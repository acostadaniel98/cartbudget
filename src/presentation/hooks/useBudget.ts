/**
 * Custom Hook: Use Budget
 * Proporciona métodos para interactuar con el presupuesto
 */

import { useCartBudgetStore } from '@/presentation/store/useCartBudgetStore';
import { useCallback } from 'react';

export const useBudget = () => {
  const { budget, percentage, remaining, isExceeded, isNearLimit, setBudget } =
    useCartBudgetStore();

  const handleSetBudget = useCallback(
    async (amount: number) => {
      try {
        if (amount < 0) {
          throw new Error('El presupuesto no puede ser negativo');
        }
        await setBudget(amount);
      } catch (error) {
        console.error('Failed to set budget:', error);
        throw error;
      }
    },
    [setBudget]
  );

  const getStatusColor = useCallback(() => {
    if (!budget) return 'neutral';
    if (isExceeded) return 'danger';
    if (isNearLimit) return 'warning';
    return 'success';
  }, [budget, isExceeded, isNearLimit]);

  const getStatusLabel = useCallback(() => {
    if (!budget) return 'Sin presupuesto';
    if (isExceeded) return 'Presupuesto excedido';
    if (isNearLimit) return 'Cerca del límite';
    return 'Dentro del presupuesto';
  }, [budget, isExceeded, isNearLimit]);

  return {
    budget,
    percentage,
    remaining,
    isExceeded,
    isNearLimit,
    handleSetBudget,
    getStatusColor,
    getStatusLabel,
  };
};
