/**
 * Use Case: Calculate Total
 */

import { Money } from '../../domain/value-objects/Money';
import { IProductRepository } from '../../domain/interfaces/repositories';

export class CalculateTotalUseCase {
  constructor(private productRepository: IProductRepository) { }

  async execute(): Promise<Money> {
    const products = await this.productRepository.getAll();

    return products.reduce(
      (total, product) => total.add(product.getTotal()),
      new Money(0)
    );
  }
}
