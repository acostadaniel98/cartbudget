"use client";

import Link from "next/link";
import { CheckCircle2, CircleDashed } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatRelativeDay } from "@/lib/format";
import { useListSummary } from "@/features/shopping-items/hooks/use-list-summary";
import { ROUTES } from "@/constants/routes";
import type { ShoppingList } from "@/domain/models/shopping-list";

interface ShoppingListCardProps {
  list: ShoppingList;
}

export function ShoppingListCard({ list }: ShoppingListCardProps) {
  const { summary } = useListSummary(list.id, list.presupuesto);
  const hasBudget = summary.presupuesto !== undefined;
  const isDone = summary.totalProductos > 0 && summary.pendientes === 0;

  return (
    <Link
      href={ROUTES.compra(list.id)}
      className="border-border bg-card block rounded-2xl border p-4 shadow-sm transition-transform active:scale-[0.98]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display truncate font-bold">{list.nombre}</p>
          <p className="text-muted-foreground text-xs">{formatRelativeDay(list.fechaCreacion)}</p>
        </div>
        {isDone && (
          <Badge>
            <CheckCircle2 className="size-3.5" /> Completa
          </Badge>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="tabular font-semibold">
          {formatCurrency(summary.gastado)}
          {hasBudget && (
            <span className="text-muted-foreground font-normal">
              {" "}
              / {formatCurrency(list.presupuesto!)}
            </span>
          )}
        </span>
        <span className="text-muted-foreground flex items-center gap-1 text-xs">
          <CircleDashed className="size-3.5" />
          {summary.pendientes} pendientes
        </span>
      </div>

      {hasBudget && (
        <Progress
          value={summary.porcentaje ?? 0}
          className="mt-2"
          indicatorClassName={summary.sobrePresupuesto ? "bg-destructive" : "bg-primary"}
        />
      )}
    </Link>
  );
}
