/**
 * TotalCard - Molecule
 * Tarjeta que muestra el total del carrito
 */

'use client';

import React, { useMemo } from 'react';
import { Money } from '@/domain/value-objects/Money';
import { Card } from './Card';
import { Badge } from './Badge';

interface TotalCardProps {
  total: Money;
  isExceeded?: boolean;
  isNearLimit?: boolean;
}

export const TotalCard: React.FC<TotalCardProps> = ({
  total,
  isExceeded = false,
  isNearLimit = false,
}) => {
  const statusVariant = useMemo(() => {
    if (isExceeded) return 'danger';
    if (isNearLimit) return 'warning';
    return 'success';
  }, [isExceeded, isNearLimit]);

  return (
    <Card className="p-4 bg-gradient-to-br from-green-50 to-white sticky bottom-0 shadow-lg">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            Total del carrito
          </p>
          <h2 className="text-3xl font-bold text-gray-900 mt-1">
            {total.format()}
          </h2>
        </div>
        {(isExceeded || isNearLimit) && (
          <Badge variant={statusVariant}>
            {isExceeded ? 'Excedido' : 'Alerta'}
          </Badge>
        )}
      </div>
    </Card>
  );
};
