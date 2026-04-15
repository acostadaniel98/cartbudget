/**
 * NumberInput Component - Atomic Design
 * Input especializado para números con controles de increment/decrement
 */

import React, { useCallback } from 'react';
import clsx from 'clsx';

interface NumberInputProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    error?: string;
    helperText?: string;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    placeholder?: string;
}

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
    ({
        label,
        value,
        onChange,
        onBlur,
        error,
        helperText,
        min = 0,
        max,
        step = 1,
        disabled = false,
        placeholder = '0',
    }, ref) => {

        const numValue = parseFloat(value) || 0;

        const handleIncrement = useCallback(() => {
            const newValue = numValue + step;
            if (max === undefined || newValue <= max) {
                onChange(newValue.toFixed(step < 1 ? 2 : 0));
            }
        }, [numValue, step, max, onChange]);

        const handleDecrement = useCallback(() => {
            const newValue = numValue - step;
            if (newValue >= min) {
                onChange(newValue.toFixed(step < 1 ? 2 : 0));
            }
        }, [numValue, step, min, onChange]);

        const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
            let val = e.target.value;

            // Evitar valores negativos
            if (val.startsWith('-')) {
                val = val.slice(1);
            }

            onChange(val);
        }, [onChange]);

        const canDecrement = numValue > min;
        const canIncrement = max === undefined || numValue < max;

        return (
            <div className="w-full">
                {label && (
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                        {label}
                    </label>
                )}
                <div className="relative flex items-center gap-0">
                    {/* Botón decrementar */}
                    <button
                        type="button"
                        onClick={handleDecrement}
                        disabled={!canDecrement || disabled}
                        className={clsx(
                            'px-3 py-3 rounded-l-lg border-2 border-r-0 transition-colors',
                            'font-bold text-lg active:scale-95',
                            {
                                'border-gray-300 bg-white text-gray-700 hover:bg-gray-100 active:bg-gray-200': canDecrement && !disabled,
                                'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed': !canDecrement || disabled,
                            }
                        )}
                        aria-label="Decrementar"
                    >
                        −
                    </button>

                    {/* Input */}
                    <input
                        ref={ref}
                        type="number"
                        inputMode="decimal"
                        value={value}
                        onChange={handleChange}
                        onBlur={onBlur}
                        placeholder={placeholder}
                        disabled={disabled}
                        min={min}
                        max={max}
                        step={step}
                        className={clsx(
                            'flex-1 px-4 py-3 text-center border-2 text-base font-semibold',
                            'transition-colors duration-200 focus:outline-none',
                            {
                                'border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200': !error,
                                'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-200': error,
                                'bg-gray-50 text-gray-500 cursor-not-allowed': disabled,
                            }
                        )}
                    />

                    {/* Botón incrementar */}
                    <button
                        type="button"
                        onClick={handleIncrement}
                        disabled={!canIncrement || disabled}
                        className={clsx(
                            'px-3 py-3 rounded-r-lg border-2 border-l-0 transition-colors',
                            'font-bold text-lg active:scale-95',
                            {
                                'border-gray-300 bg-white text-gray-700 hover:bg-gray-100 active:bg-gray-200': canIncrement && !disabled,
                                'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed': !canIncrement || disabled,
                            }
                        )}
                        aria-label="Incrementar"
                    >
                        +
                    </button>
                </div>

                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
                {helperText && !error && (
                    <p className="mt-1 text-xs text-gray-500">{helperText}</p>
                )}
            </div>
        );
    }
);

NumberInput.displayName = 'NumberInput';
