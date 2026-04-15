/**
 * ProductItem - Molecule
 * Representa un producto individual en el carrito
 */

'use client';

import React, { useCallback, useState } from 'react';
import { Product } from '@/domain/entities/Product';
import { Card } from './Card';
import { Button } from './Button';
import { NumberInput } from './NumberInput';
import { useCart } from '@/presentation/hooks/useCart';

interface ProductItemProps {
  product: Product;
}

export const ProductItem: React.FC<ProductItemProps> = ({ product }) => {
  const [quantity, setQuantity] = useState(product.getQuantity().toString());
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const { handleRemoveProduct, handleUpdateQuantity } = useCart();

  const onRemove = useCallback(async () => {
    setIsDeleting(true);
    try {
      await handleRemoveProduct(product.getId());
    } catch (error) {
      console.error('Error:', error);
      setIsDeleting(false);
    }
  }, [product, handleRemoveProduct]);

  const onUpdateQuantity = useCallback(async () => {
    const newQty = parseInt(quantity);

    if (isNaN(newQty) || newQty < 1) {
      setError('La cantidad debe ser al menos 1');
      return;
    }

    if (newQty === product.getQuantity()) {
      return;
    }

    if (newQty > 999) {
      setError('La cantidad máxima es 999');
      return;
    }

    setIsUpdating(true);
    setError('');
    try {
      await handleUpdateQuantity(product.getId(), newQty);
      setIsUpdating(false);
    } catch (err) {
      console.error('Error:', err);
      setQuantity(product.getQuantity().toString());
      setError('Error al actualizar cantidad');
      setIsUpdating(false);
    }
  }, [quantity, product, handleUpdateQuantity]);

  const handleQuantityChange = useCallback((value: string) => {
    // Evitar negativos
    if (value.startsWith('-')) {
      value = value.slice(1);
    }
    // Solo números
    value = value.replace(/[^0-9]/g, '');

    setQuantity(value || '1');
    setError('');
  }, []);

  return (
    <Card className="p-4">
      <div className="flex gap-3 items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate text-lg">
            {product.getName()}
          </h3>

          <div className="mt-3 space-y-3">
            <div className="flex justify-between text-sm bg-gray-50 p-2 rounded">
              <span className="text-gray-600">Precio unitario</span>
              <span className="font-semibold text-gray-900">
                {product.getPrice().format()}
              </span>
            </div>

            <div className="flex justify-between text-lg bg-green-50 p-2 rounded border-2 border-green-200">
              <span className="font-medium text-green-700">Subtotal</span>
              <span className="font-bold text-green-700">
                {product.getTotal().format()}
              </span>
            </div>

            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <NumberInput
                  min={1}
                  max={999}
                  value={quantity}
                  onChange={handleQuantityChange}
                  onBlur={onUpdateQuantity}
                  label="Cantidad"
                  placeholder="1"
                  step={1}
                />
              </div>
              <Button
                onClick={onUpdateQuantity}
                disabled={isUpdating || quantity === product.getQuantity().toString()}
                variant="secondary"
                size="md"
                className="flex-shrink-0 px-3"
              >
                {isUpdating ? 'Actualizando...' : 'Guardar'}
              </Button>
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 p-2 rounded">
                {error}
              </p>
            )}
          </div>
        </div>

        <Button
          onClick={onRemove}
          isLoading={isDeleting}
          variant="danger"
          size="md"
          className="flex-shrink-0"
        >
          ✕
        </Button>
      </div>
    </Card>
  );
};