"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  showBack = false,
  action,
  className,
}: PageHeaderProps) {
  const router = useRouter();

  return (
    <header
      className={cn(
        "safe-top border-border bg-background/95 sticky top-0 z-30 -mx-4 mb-4 flex items-center gap-2 border-b px-4 py-3 backdrop-blur-sm",
        className,
      )}
    >
      {showBack && (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Volver"
          onClick={() => router.back()}
          className="-ml-2 shrink-0"
        >
          <ChevronLeft />
        </Button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="font-display truncate text-lg leading-tight font-bold">{title}</h1>
        {subtitle && <p className="text-muted-foreground truncate text-xs">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
