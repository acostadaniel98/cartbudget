/**
 * Use Case: Add Product
 */

import { Product } from '../../domain/entities/Product';
import { Money } from '../../domain/value-objects/Money';
import { IProductRepository } from '../../domain/interfaces/repositories';

export interface AddProductInput {
  name: string;
  price: number;
  quantity: number;
}

export class AddProductUseCase {
  constructor(private productRepository: IProductRepository) { }

  async execute(input: AddProductInput): Promise<Product> {
    const id = this.generateId();
    const product = new Product({
      id,
      name: input.name,
      price: new Money(input.price),
      quantity: input.quantity,
    });

    await this.productRepository.add(product);
    return product;
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
