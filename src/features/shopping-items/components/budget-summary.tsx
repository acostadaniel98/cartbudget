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
  const { presupuesto, gastado, restante, porcentaje, sobrePresupuesto, pendientes, comprados } =
    summary;
  const hasBudget = presupuesto !== undefined;
  const isNearLimit = hasBudget && !sobrePresupuesto && (porcentaje ?? 0) >= 80;

  return (
    <div
      className={cn(
        "receipt-edge bg-card relative overflow-hidden rounded-2xl px-5 pt-5 pb-7 shadow-sm",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
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
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Presupuesto
            </p>
            <p className="tabular text-muted-foreground text-sm font-semibold">
              {formatCurrency(presupuesto)}
            </p>
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
          <div className="text-muted-foreground flex justify-between text-xs">
            <span className="tabular">{formatCurrency(gastado)} gastado</span>
            <span className="tabular">{Math.round(porcentaje ?? 0)}%</span>
          </div>
        </div>
      )}

      {hasBudget && sobrePresupuesto && (
        <div
          className="bg-destructive/10 text-destructive mt-4 flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm"
          role="alert"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p>Has superado tu presupuesto por {formatCurrency(Math.abs(restante ?? 0))}.</p>
        </div>
      )}

      {hasBudget && isNearLimit && (
        <div
          className="bg-warning/15 text-accent-foreground mt-4 flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm"
          role="status"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p>Ya utilizaste el {Math.round(porcentaje ?? 0)}% de tu presupuesto.</p>
        </div>
      )}

      <div className="border-border mt-4 flex items-center gap-4 border-t border-dashed pt-3 text-xs">
        <span className="text-muted-foreground flex items-center gap-1.5">
          <CircleDashed className="size-4" />
          <span className="tabular text-foreground font-semibold">{pendientes}</span> pendientes
        </span>
        <span className="text-muted-foreground flex items-center gap-1.5">
          <CheckCircle2 className="text-primary size-4" />
          <span className="tabular text-foreground font-semibold">{comprados}</span> comprados
        </span>
      </div>
    </div>
  );
}
