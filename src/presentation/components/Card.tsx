/**
 * Card Component - Atomic Design
 */

import React from 'react';
import clsx from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  onClick?: () => void;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, onClick, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        onClick={onClick}
        className={clsx(
          'bg-white rounded-lg shadow-sm border border-gray-200',
          'transition-all duration-200 ease-in-out',
          {
            'cursor-pointer hover:shadow-md hover:border-gray-300': onClick,
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
