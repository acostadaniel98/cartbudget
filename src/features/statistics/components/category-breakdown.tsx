import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCategoryIcon } from "@/lib/category-icon";
import { formatCurrency } from "@/lib/format";
import type { GastoPorCategoria } from "@/domain/services/statistics-calculator";
import type { Category } from "@/domain/models/category";

interface CategoryBreakdownProps {
  data: GastoPorCategoria[];
  categories: Category[];
}

export function CategoryBreakdown({ data, categories }: CategoryBreakdownProps) {
  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const max = Math.max(...data.map((d) => d.total), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gasto por categoría</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.length === 0 && <p className="text-sm text-muted-foreground">Aún no hay compras registradas.</p>}
        {data.map((entry) => {
          const category = categoryById.get(entry.categoria);
          const Icon = category ? getCategoryIcon(category.icono) : undefined;
          const width = Math.max(6, (entry.total / max) * 100);
          return (
            <div key={entry.categoria} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 font-medium">
                  {Icon && <Icon className="size-3.5" style={{ color: category?.color }} />}
                  {category?.nombre ?? entry.categoria}
                </span>
                <span className="tabular text-muted-foreground">{formatCurrency(entry.total)}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${width}%`, backgroundColor: category?.color ?? "var(--primary)" }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
