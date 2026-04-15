/**
 * BudgetCard - Molecule
 * Tarjeta que muestra el estado del presupuesto
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { NumberInput } from './NumberInput';
import { Badge } from './Badge';
import { ProgressBar } from './ProgressBar';
import { useBudget } from '@/presentation/hooks/useBudget';

export const BudgetCard: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');
  const {
    budget,
    percentage,
    remaining,
    isExceeded,
    isNearLimit,
    handleSetBudget,
    getStatusColor,
    getStatusLabel,
  } = useBudget();

  const onSubmit = useCallback(async () => {
    setInputError('');

    const amount = parseFloat(inputValue);
    if (isNaN(amount) || amount <= 0) {
      setInputError('El presupuesto debe ser mayor a 0');
      return;
    }

    if (amount > 999999) {
      setInputError('El presupuesto es muy alto');
      return;
    }

    setIsSubmitting(true);
    try {
      await handleSetBudget(amount);
      setIsOpen(false);
      setInputValue('');
    } catch (error) {
      console.error('Error:', error);
      setInputError('Error al guardar el presupuesto');
    } finally {
      setIsSubmitting(false);
    }
  }, [inputValue, handleSetBudget]);

  const statusColor = getStatusColor();
  const statusLabel = getStatusLabel();

  return (
    <Card className="p-4 bg-gradient-to-br from-gray-50 to-white">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Presupuesto
          </p>
          <h2 className="text-2xl font-bold text-gray-900 mt-1">
            {budget ? budget.format() : 'No definido'}
          </h2>
        </div>
        <Badge variant={statusColor as any}>{statusLabel}</Badge>
      </div>

      {budget && (
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Restante</span>
            <span
              className={`font-semibold ${isExceeded
                ? 'text-red-600'
                : isNearLimit
                  ? 'text-yellow-600'
                  : 'text-green-600'
                }`}
            >
              {remaining.format()}
            </span>
          </div>

          <ProgressBar percentage={percentage} variant={statusColor as any} />

          <div className="flex justify-between text-xs text-gray-500">
            <span>{Math.round(percentage)}% usado</span>
            <span className="font-medium">{100 - Math.round(percentage)}% disponible</span>
          </div>
        </div>
      )}

      <Button
        onClick={() => {
          setIsOpen(!isOpen);
          setInputValue(budget?.toDollars().toString() || '');
          setInputError('');
        }}
        variant="secondary"
        size="sm"
        className="w-full mt-4"
      >
        {budget ? 'Editar presupuesto' : 'Definir presupuesto'}
      </Button>

      {isOpen && (
        <div className="mt-4 space-y-3">
          <NumberInput
            label="Nuevo presupuesto (USD)"
            placeholder="0.00"
            value={inputValue}
            onChange={(value: string) => {
              setInputValue(value);
              setInputError('');
            }}
            min={0}
            max={999999}
            step={0.01}
            error={inputError}
          />

          <div className="flex gap-2">
            <Button
              onClick={() => {
                setIsOpen(false);
                setInputValue('');
                setInputError('');
              }}
              variant="secondary"
              size="sm"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={onSubmit}
              isLoading={isSubmitting}
              size="sm"
              className="flex-1"
            >
              Guardar
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};