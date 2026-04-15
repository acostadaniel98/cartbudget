/**
 * ProductList - Organism
 * Lista de productos en el carrito
 */

'use client';

import React, { useMemo } from 'react';
import { Product } from '@/domain/entities/Product';
import { ProductItem } from './ProductItem';

interface ProductListProps {
  products: Product[];
  isLoading?: boolean;
}

export const ProductList: React.FC<ProductListProps> = ({ products, isLoading = false }) => {
  const isEmpty = useMemo(() => products.length === 0, [products]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 bg-gray-200 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-5xl mb-3">🛒</div>
        <p className="text-gray-500 font-medium">Tu carrito está vacío</p>
        <p className="text-sm text-gray-400 mt-1">
          Agrega productos para comenzar
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {products.map((product) => (
        <ProductItem key={product.getId()} product={product} />
      ))}
    </div>
  );
};
