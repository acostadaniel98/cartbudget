"use client";

import { BarChart3, DollarSign, Receipt } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/features/statistics/components/stat-card";
import { CategoryBreakdown } from "@/features/statistics/components/category-breakdown";
import { MonthlyChart } from "@/features/statistics/components/monthly-chart";
import { MostPurchasedList } from "@/features/statistics/components/most-purchased-list";
import { useStatistics } from "@/features/statistics/hooks/use-statistics";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { formatCurrency } from "@/lib/format";

export default function EstadisticasPage() {
  const { stats, isLoading } = useStatistics();
  const { categories } = useCategories();

  if (isLoading || !stats) {
    return (
      <div className="px-4 py-6">
        <PageHeader title="Estadísticas" />
        <p className="text-sm text-muted-foreground">Cargando…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 pb-6">
      <PageHeader title="Estadísticas" />

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Compras totales" value={String(stats.totalCompras)} icon={<Receipt />} />
        <StatCard label="Promedio gastado" value={formatCurrency(stats.promedioGastado)} icon={<DollarSign />} />
      </div>

      <MonthlyChart data={stats.comprasPorMes} />
      <CategoryBreakdown data={stats.gastoPorCategoria} categories={categories} />
      <MostPurchasedList data={stats.productosMasComprados} />

      {stats.totalCompras === 0 && (
        <p className="flex items-center gap-2 rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
          <BarChart3 className="size-4 shrink-0" />
          Tus estadísticas aparecerán aquí a medida que completes compras.
        </p>
      )}
    </div>
  );
}
