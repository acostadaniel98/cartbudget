/**
 * Badge Component - Atomic Design
 */

import React from 'react';
import clsx from 'clsx';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'neutral';
  children: React.ReactNode;
  className?: string;
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ variant = 'neutral', children, className }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          'inline-block px-3 py-1 rounded-full text-sm font-medium',
          {
            'bg-green-100 text-green-800': variant === 'success',
            'bg-yellow-100 text-yellow-800': variant === 'warning',
            'bg-red-100 text-red-800': variant === 'danger',
            'bg-gray-100 text-gray-800': variant === 'neutral',
          },
          className
        )}
      >
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';
