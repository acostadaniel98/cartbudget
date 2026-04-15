/**
 * ProgressBar Component - Atomic Design
 */

import React, { useMemo } from 'react';
import clsx from 'clsx';

interface ProgressBarProps {
  percentage: number;
  variant?: 'success' | 'warning' | 'danger';
  animated?: boolean;
}

export const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ percentage, variant = 'success', animated = true }, ref) => {
    const clampedPercentage = useMemo(
      () => Math.min(Math.max(percentage, 0), 100),
      [percentage]
    );

    const displayVariant = useMemo(() => {
      if (percentage >= 100) return 'danger';
      if (percentage >= 80) return 'warning';
      return variant;
    }, [percentage, variant]);

    return (
      <div
        ref={ref}
        className="w-full h-3 bg-gray-200 rounded-full overflow-hidden"
      >
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-500',
            {
              'bg-green-500': displayVariant === 'success',
              'bg-yellow-500': displayVariant === 'warning',
              'bg-red-500': displayVariant === 'danger',
              'animate-pulse': animated && percentage >= 80,
            }
          )}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
    );
  }
);

ProgressBar.displayName = 'ProgressBar';
