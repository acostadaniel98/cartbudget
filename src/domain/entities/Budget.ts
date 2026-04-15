/**
 * Entity: Budget
 * Representa el presupuesto del usuario
 */

import { Money } from '../value-objects/Money';

export interface BudgetProps {
  limit: Money;
}

export class Budget {
  private limit: Money;

  constructor(props: BudgetProps) {
    this.validateBudget(props);
    this.limit = props.limit;
  }

  getLimit(): Money {
    return this.limit;
  }

  /**
   * Actualizar el límite del presupuesto
   */
  updateLimit(newLimit: Money): void {
    if (newLimit.isLessThan(new Money(0))) {
      throw new Error('El presupuesto no puede ser negativo');
    }
    this.limit = newLimit;
  }

  /**
   * Calcular el porcentaje de presupuesto utilizado
   */
  calculateUsagePercentage(spent: Money): number {
    if (this.limit.toDollars() === 0) {
      return 0;
    }
    const percentage = (spent.toDollars() / this.limit.toDollars()) * 100;
    return Math.min(percentage, 100);
  }

  /**
   * Calcular el dinero restante
   */
  calculateRemaining(spent: Money): Money {
    return this.limit.subtract(spent);
  }

  /**
   * Verificar si se ha excedido el presupuesto
   */
  isExceeded(spent: Money): boolean {
    return spent.isGreaterThan(this.limit);
  }

  /**
   * Verificar si se está cerca del límite (80%)
   */
  isNearLimit(spent: Money): boolean {
    const percentage = this.calculateUsagePercentage(spent);
    return percentage >= 80;
  }

  toPlainObject() {
    return {
      limit: this.limit.getRawValue(),
    };
  }

  static fromPlainObject(obj: any): Budget {
    return new Budget({
      limit: Money.fromCents(obj.limit),
    });
  }

  private validateBudget(props: BudgetProps): void {
    if (props.limit.isLessThan(new Money(0))) {
      throw new Error('El presupuesto no puede ser negativo');
    }
  }
}
