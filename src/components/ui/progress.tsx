"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.ComponentProps<typeof ProgressPrimitive.Root> {
  indicatorClassName?: string;
}

function Progress({ className, value, indicatorClassName, ...props }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value ?? 0));
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn("relative h-3 w-full overflow-hidden rounded-full bg-muted", className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn("h-full rounded-full bg-primary transition-[width] duration-500 ease-out", indicatorClassName)}
        style={{ width: `${clamped}%` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
