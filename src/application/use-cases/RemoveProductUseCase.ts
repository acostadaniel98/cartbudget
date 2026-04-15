/**
 * Use Case: Remove Product
 */

import { IProductRepository } from '../../domain/interfaces/repositories';

export class RemoveProductUseCase {
  constructor(private productRepository: IProductRepository) { }

  async execute(productId: string): Promise<void> {
    await this.productRepository.remove(productId);
  }
}
