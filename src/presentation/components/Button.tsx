/**
 * Button Component - Atomic Design
 */

import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', size = 'md', isLoading = false, className, children, disabled, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(
          'font-semibold rounded-lg transition-all duration-200 ease-in-out',
          'active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
          {
            // Sizes
            'px-3 py-2 text-sm': size === 'sm',
            'px-4 py-3 text-base': size === 'md',
            'px-6 py-4 text-lg': size === 'lg',

            // Variants
            'bg-green-500 text-white hover:bg-green-600 active:bg-green-700': variant === 'primary',
            'bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400': variant === 'secondary',
            'bg-red-500 text-white hover:bg-red-600 active:bg-red-700': variant === 'danger',
          },
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            {children}
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
