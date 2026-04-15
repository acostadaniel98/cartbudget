/**
 * LocalStorage Adapter
 * Implementa los repositorios usando localStorage como persistencia
 */

import { Product } from '../../domain/entities/Product';
import { Budget } from '../../domain/entities/Budget';
import { IProductRepository, IBudgetRepository } from '../../domain/interfaces/repositories';

const PRODUCTS_KEY = 'cartbudget_products';
const BUDGET_KEY = 'cartbudget_budget';

export class LocalStorageProductRepository implements IProductRepository {
  async add(product: Product): Promise<void> {
    const products = await this.getAll();
    products.push(product);
    this.save(products);
  }

  async remove(productId: string): Promise<void> {
    const products = await this.getAll();
    const filtered = products.filter((p) => p.getId() !== productId);
    this.save(filtered);
  }

  async getAll(): Promise<Product[]> {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const data = window.localStorage.getItem(PRODUCTS_KEY);
      if (!data) {
        return [];
      }

      const parsed = JSON.parse(data);
      return parsed.map((item: any) => Product.fromPlainObject(item));
    } catch (error) {
      console.error('Error reading products from localStorage:', error);
      return [];
    }
  }

  async update(product: Product): Promise<void> {
    const products = await this.getAll();
    const index = products.findIndex((p) => p.getId() === product.getId());

    if (index !== -1) {
      products[index] = product;
      this.save(products);
    }
  }

  async clear(): Promise<void> {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(PRODUCTS_KEY);
    }
  }

  private save(products: Product[]): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const data = products.map((p) => p.toPlainObject());
      window.localStorage.setItem(PRODUCTS_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving products to localStorage:', error);
    }
  }
}

export class LocalStorageBudgetRepository implements IBudgetRepository {
  async get(): Promise<Budget | null> {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const data = window.localStorage.getItem(BUDGET_KEY);
      if (!data) {
        return null;
      }

      const parsed = JSON.parse(data);
      return Budget.fromPlainObject(parsed);
    } catch (error) {
      console.error('Error reading budget from localStorage:', error);
      return null;
    }
  }

  async set(budget: Budget): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const data = budget.toPlainObject();
      window.localStorage.setItem(BUDGET_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving budget to localStorage:', error);
    }
  }

  async clear(): Promise<void> {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(BUDGET_KEY);
    }
  }
}
