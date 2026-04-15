/**
 * Use Case: Update Product Quantity
 */

import { IProductRepository } from '../../domain/interfaces/repositories';

export interface UpdateQuantityInput {
  productId: string;
  newQuantity: number;
}

export class UpdateQuantityUseCase {
  constructor(private productRepository: IProductRepository) { }

  async execute(input: UpdateQuantityInput): Promise<void> {
    const products = await this.productRepository.getAll();
    const product = products.find((p) => p.getId() === input.productId);

    if (!product) {
      throw new Error('Producto no encontrado');
    }

    product.updateQuantity(input.newQuantity);
    await this.productRepository.update(product);
  }
}
