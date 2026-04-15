/**
 * Use Case: Calculate Remaining Budget
 */

import { Money } from '../../domain/value-objects/Money';
import { IProductRepository, IBudgetRepository } from '../../domain/interfaces/repositories';

export interface RemainingBudgetResult {
  spent: Money;
  remaining: Money;
  percentage: number;
  isExceeded: boolean;
  isNearLimit: boolean;
}

export class CalculateRemainingBudgetUseCase {
  constructor(
    private productRepository: IProductRepository,
    private budgetRepository: IBudgetRepository
  ) { }

  async execute(): Promise<RemainingBudgetResult> {
    const products = await this.productRepository.getAll();
    const budget = await this.budgetRepository.get();

    const spent = products.reduce(
      (total, product) => total.add(product.getTotal()),
      new Money(0)
    );

    if (!budget) {
      return {
        spent,
        remaining: new Money(0),
        percentage: 0,
        isExceeded: false,
        isNearLimit: false,
      };
    }

    const remaining = budget.calculateRemaining(spent);
    const percentage = budget.calculateUsagePercentage(spent);
    const isExceeded = budget.isExceeded(spent);
    const isNearLimit = budget.isNearLimit(spent);

    return {
      spent,
      remaining,
      percentage,
      isExceeded,
      isNearLimit,
    };
  }
}
