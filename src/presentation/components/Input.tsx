'use client';

import React, { useCallback, useRef } from 'react';
import clsx from 'clsx';

interface NumberInputProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    helperText?: string;
    min?: number;
    max?: number;
    step?: number;
}

export const NumberInput: React.FC<NumberInputProps> = ({
    label,
    value,
    onChange,
    error,
    helperText,
    min = 0,
    max,
    step = 1,
}) => {
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const parseValue = () => {
        const num = parseFloat(value);
        return isNaN(num) ? 0 : num;
    };

    const clamp = (val: number) => {
        if (val < min) return min;
        if (max !== undefined && val > max) return max;
        return val;
    };

    const updateValue = useCallback(
        (val: number) => {
            const clamped = clamp(val);
            onChange(clamped.toString());
        },
        [onChange]
    );

    const increment = useCallback(() => {
        updateValue(parseValue() + step);
    }, [step, updateValue]);

    const decrement = useCallback(() => {
        updateValue(parseValue() - step);
    }, [step, updateValue]);

    // HOLD (mantener presionado)
    const startHold = (action: () => void) => {
        action();
        intervalRef.current = setInterval(action, 150);
    };

    const stopHold = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    };

    const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value;

        // evitar negativos
        if (val.startsWith('-')) return;

        onChange(val);
    };

    return (
        <div className="w-full">
            {label && (
                <label className="block mb-2 text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}

            <div
                className={clsx(
                    'flex items-center border-2 rounded-lg overflow-hidden',
                    {
                        'border-gray-300 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200': !error,
                        'border-red-500': error,
                    }
                )}
            >
                {/* BOTÓN - */}
                <button
                    type="button"
                    onMouseDown={() => startHold(decrement)}
                    onMouseUp={stopHold}
                    onMouseLeave={stopHold}
                    onTouchStart={() => startHold(decrement)}
                    onTouchEnd={stopHold}
                    className="px-4 py-3 text-xl font-bold bg-gray-100 active:bg-gray-200 select-none"
                >
                    −
                </button>

                {/* INPUT */}
                <input
                    type="number"
                    inputMode="decimal"
                    value={value}
                    onChange={handleManualChange}
                    className="w-full text-center py-3 text-base font-semibold outline-none"
                />

                {/* BOTÓN + */}
                <button
                    type="button"
                    onMouseDown={() => startHold(increment)}
                    onMouseUp={stopHold}
                    onMouseLeave={stopHold}
                    onTouchStart={() => startHold(increment)}
                    onTouchEnd={stopHold}
                    className="px-4 py-3 text-xl font-bold bg-gray-100 active:bg-gray-200 select-none"
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
};