/**
 * Application State Store (Zustand)
 * Gestiona el estado global de la aplicación
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Product } from '@/domain/entities/Product';
import { Money } from '@/domain/value-objects/Money';
import {
  AddProductUseCase,
  RemoveProductUseCase,
  UpdateQuantityUseCase,
  CalculateTotalUseCase,
  CalculateRemainingBudgetUseCase,
  SetBudgetUseCase,
} from '@/application/use-cases';
import {
  LocalStorageProductRepository,
  LocalStorageBudgetRepository,
} from '@/infrastructure/storage/LocalStorageAdapter';

interface CartBudgetState {
  // State
  products: Product[];
  budget: Money | null;
  total: Money;
  remaining: Money;
  percentage: number;
  isExceeded: boolean;
  isNearLimit: boolean;
  isLoading: boolean;

  // Actions
  initializeStore: () => Promise<void>;
  addProduct: (name: string, price: number, quantity: number) => Promise<void>;
  removeProduct: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  setBudget: (amount: number) => Promise<void>;
  clearAll: () => Promise<void>;
  recalculate: () => Promise<void>;
}

// Instanciar repositorios
const productRepository = new LocalStorageProductRepository();
const budgetRepository = new LocalStorageBudgetRepository();

// Instanciar use cases
const addProductUseCase = new AddProductUseCase(productRepository);
const removeProductUseCase = new RemoveProductUseCase(productRepository);
const updateQuantityUseCase = new UpdateQuantityUseCase(productRepository);
const calculateTotalUseCase = new CalculateTotalUseCase(productRepository);
const calculateRemainingBudgetUseCase = new CalculateRemainingBudgetUseCase(
  productRepository,
  budgetRepository
);
const setBudgetUseCase = new SetBudgetUseCase(budgetRepository);

export const useCartBudgetStore = create<CartBudgetState>()(
  devtools((set, get) => ({
    // Initial state
    products: [],
    budget: null,
    total: new Money(0),
    remaining: new Money(0),
    percentage: 0,
    isExceeded: false,
    isNearLimit: false,
    isLoading: false,

    // Initialize store from localStorage
    initializeStore: async () => {
      set({ isLoading: true });
      try {
        const products = await productRepository.getAll();
        const budget = await budgetRepository.get();

        // Calculate totals
        const total = products.reduce(
          (acc, p) => acc.add(p.getTotal()),
          new Money(0)
        );

        let remaining = new Money(0);
        let percentage = 0;
        let isExceeded = false;
        let isNearLimit = false;

        if (budget) {
          const result = await calculateRemainingBudgetUseCase.execute();
          remaining = result.remaining;
          percentage = result.percentage;
          isExceeded = result.isExceeded;
          isNearLimit = result.isNearLimit;
        }

        set({
          products,
          budget: budget ? budget.getLimit() : null,
          total,
          remaining,
          percentage,
          isExceeded,
          isNearLimit,
        });
      } finally {
        set({ isLoading: false });
      }
    },

    // Add a new product
    addProduct: async (name: string, price: number, quantity: number) => {
      try {
        await addProductUseCase.execute({ name, price, quantity });
        await get().recalculate();
      } catch (error) {
        console.error('Error adding product:', error);
        throw error;
      }
    },

    // Remove a product
    removeProduct: async (productId: string) => {
      try {
        await removeProductUseCase.execute(productId);
        await get().recalculate();
      } catch (error) {
        console.error('Error removing product:', error);
        throw error;
      }
    },

    // Update product quantity
    updateQuantity: async (productId: string, quantity: number) => {
      try {
        await updateQuantityUseCase.execute({ productId, newQuantity: quantity });
        await get().recalculate();
      } catch (error) {
        console.error('Error updating quantity:', error);
        throw error;
      }
    },

    // Set budget
    setBudget: async (amount: number) => {
      try {
        const budget = await setBudgetUseCase.execute(amount);
        set({ budget: budget.getLimit() });
        await get().recalculate();
      } catch (error) {
        console.error('Error setting budget:', error);
        throw error;
      }
    },

    // Clear all data
    clearAll: async () => {
      try {
        await productRepository.clear();
        await budgetRepository.clear();
        set({
          products: [],
          budget: null,
          total: new Money(0),
          remaining: new Money(0),
          percentage: 0,
          isExceeded: false,
          isNearLimit: false,
        });
      } catch (error) {
        console.error('Error clearing data:', error);
        throw error;
      }
    },

    // Recalculate all values
    recalculate: async () => {
      try {
        const products = await productRepository.getAll();
        const total = await calculateTotalUseCase.execute();
        const result = await calculateRemainingBudgetUseCase.execute();

        set({
          products,
          total,
          remaining: result.remaining,
          percentage: result.percentage,
          isExceeded: result.isExceeded,
          isNearLimit: result.isNearLimit,
        });
      } catch (error) {
        console.error('Error recalculating:', error);
        throw error;
      }
    },
  }), { name: 'CartBudget' })
);

/**
 * Selectores optimizados para prevenir renders innecesarios
 */

export const selectProducts = (state: CartBudgetState) => state.products;
export const selectBudget = (state: CartBudgetState) => state.budget;
export const selectTotal = (state: CartBudgetState) => state.total;
export const selectRemaining = (state: CartBudgetState) => state.remaining;
export const selectPercentage = (state: CartBudgetState) => state.percentage;
export const selectIsExceeded = (state: CartBudgetState) => state.isExceeded;
export const selectIsNearLimit = (state: CartBudgetState) => state.isNearLimit;
export const selectIsLoading = (state: CartBudgetState) => state.isLoading;

// Selector compuesto para información presupuestaria
export const selectBudgetInfo = (state: CartBudgetState) => ({
  budget: state.budget,
  remaining: state.remaining,
  percentage: state.percentage,
  isExceeded: state.isExceeded,
  isNearLimit: state.isNearLimit,
});
