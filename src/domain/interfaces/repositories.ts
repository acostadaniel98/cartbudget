/**
 * Interfaces de repositorio para la capa de almacenamiento
 */

import { Product } from '../entities/Product';
import { Budget } from '../entities/Budget';

export interface IProductRepository {
  add(product: Product): Promise<void>;
  remove(productId: string): Promise<void>;
  getAll(): Promise<Product[]>;
  update(product: Product): Promise<void>;
  clear(): Promise<void>;
}

export interface IBudgetRepository {
  get(): Promise<Budget | null>;
  set(budget: Budget): Promise<void>;
  clear(): Promise<void>;
}
