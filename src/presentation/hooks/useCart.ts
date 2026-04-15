/**
 * Custom Hook: Use Cart
 * Proporciona métodos para interactuar con el carrito
 */

import { useCartBudgetStore } from '@/presentation/store/useCartBudgetStore';
import { useCallback } from 'react';

export const useCart = () => {
  const { products, total, addProduct, removeProduct, updateQuantity } =
    useCartBudgetStore();

  const handleAddProduct = useCallback(
    async (name: string, price: number, quantity: number) => {
      try {
        await addProduct(name, price, quantity);
      } catch (error) {
        console.error('Failed to add product:', error);
        throw error;
      }
    },
    [addProduct]
  );

  const handleRemoveProduct = useCallback(
    async (productId: string) => {
      try {
        await removeProduct(productId);
      } catch (error) {
        console.error('Failed to remove product:', error);
        throw error;
      }
    },
    [removeProduct]
  );

  const handleUpdateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      try {
        if (quantity <= 0) {
          await handleRemoveProduct(productId);
        } else {
          await updateQuantity(productId, quantity);
        }
      } catch (error) {
        console.error('Failed to update quantity:', error);
        throw error;
      }
    },
    [updateQuantity, handleRemoveProduct]
  );

  return {
    products,
    total,
    handleAddProduct,
    handleRemoveProduct,
    handleUpdateQuantity,
  };
};
