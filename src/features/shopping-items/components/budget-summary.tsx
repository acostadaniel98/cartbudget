"use client";

import { CheckCircle2, CircleDashed } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { BudgetSummary as BudgetSummaryData } from "@/domain/services/budget-calculator";

interface BudgetSummaryProps {
  summary: BudgetSummaryData;
  className?: string;
}

export function BudgetSummary({ summary, className }: BudgetSummaryProps) {
  const { presupuesto, gastado, restante, porcentaje, sobrePresupuesto, pendientes, comprados } = summary;
  const hasBudget = presupuesto !== undefined;

  return (
    <div
      className={cn(
        "receipt-edge relative overflow-hidden rounded-2xl bg-card px-5 pt-5 pb-7 shadow-sm",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {hasBudget ? "Disponible" : "Gastado hasta ahora"}
          </p>
          <p
            className={cn(
              "tabular font-[family-name:var(--font-display)] text-3xl font-extrabold",
              hasBudget && sobrePresupuesto ? "text-destructive" : "text-foreground",
            )}
          >
            {formatCurrency(hasBudget ? (restante ?? 0) : gastado)}
          </p>
        </div>
        {hasBudget && (
          <div className="text-right">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Presupuesto</p>
            <p className="tabular text-sm font-semibold text-muted-foreground">{formatCurrency(presupuesto)}</p>
          </div>
        )}
      </div>

      {hasBudget && (
        <div className="mt-4 space-y-1.5">
          <Progress
            value={porcentaje ?? 0}
            indicatorClassName={sobrePresupuesto ? "bg-destructive" : "bg-primary"}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="tabular">{formatCurrency(gastado)} gastado</span>
            <span className="tabular">{Math.round(porcentaje ?? 0)}%</span>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center gap-4 border-t border-dashed border-border pt-3 text-xs">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <CircleDashed className="size-4" />
          <span className="tabular font-semibold text-foreground">{pendientes}</span> pendientes
        </span>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <CheckCircle2 className="size-4 text-primary" />
          <span className="tabular font-semibold text-foreground">{comprados}</span> comprados
        </span>
      </div>
    </div>
  );
}
