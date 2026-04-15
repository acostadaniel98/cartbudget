/**
 * Use Case: Set Budget
 */

import { Budget } from '../../domain/entities/Budget';
import { Money } from '../../domain/value-objects/Money';
import { IBudgetRepository } from '../../domain/interfaces/repositories';

export class SetBudgetUseCase {
  constructor(private budgetRepository: IBudgetRepository) { }

  async execute(amount: number): Promise<Budget> {
    const budget = new Budget({
      limit: new Money(amount),
    });

    await this.budgetRepository.set(budget);
    return budget;
  }
}
