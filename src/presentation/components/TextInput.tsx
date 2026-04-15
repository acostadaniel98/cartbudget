/**
 * TextInput Component - Atomic Design
 * Input básico para texto
 */

'use client';

import React from 'react';
import clsx from 'clsx';

interface TextInputProps {
    label?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: () => void;
    error?: string;
    helperText?: string;
    placeholder?: string;
    disabled?: boolean;
    maxLength?: number;
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
    ({
        label,
        value,
        onChange,
        onBlur,
        error,
        helperText,
        placeholder = '',
        disabled = false,
        maxLength,
    }, ref) => {
        return (
            <div className="flex flex-col gap-1">
                {label && (
                    <label className="text-sm font-medium text-gray-800">
                        {label}
                    </label>
                )}

                <input
                    ref={ref}
                    type="text"
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    disabled={disabled}
                    maxLength={maxLength}
                    className={clsx(
                        'px-3 py-2 text-base rounded-lg border transition-colors',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                        error
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-300 bg-white',
                        disabled && 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    )}
                />

                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
                {helperText && !error && (
                    <p className="mt-1 text-xs text-gray-500">{helperText}</p>
                )}
            </div>
        );
    }
);

TextInput.displayName = 'TextInput';
