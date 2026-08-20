"use client";

import { AlertTriangle, CheckCircle2, CircleDashed } from "lucide-react";
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
  const isNearLimit = hasBudget && !sobrePresupuesto && (porcentaje ?? 0) >= 80;

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
              "tabular font-display text-3xl font-extrabold",
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
            aria-label={`Porcentaje del presupuesto utilizado: ${Math.round(porcentaje ?? 0)}%`}
            indicatorClassName={sobrePresupuesto ? "bg-destructive" : "bg-primary"}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="tabular">{formatCurrency(gastado)} gastado</span>
            <span className="tabular">{Math.round(porcentaje ?? 0)}%</span>
          </div>
        </div>
      )}

      {hasBudget && sobrePresupuesto && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-destructive/10 px-3 py-2.5 text-sm text-destructive" role="alert">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p>Has superado tu presupuesto por {formatCurrency(Math.abs(restante ?? 0))}.</p>
        </div>
      )}

      {hasBudget && isNearLimit && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-warning/15 px-3 py-2.5 text-sm text-accent-foreground" role="status">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p>Ya utilizaste el {Math.round(porcentaje ?? 0)}% de tu presupuesto.</p>
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
