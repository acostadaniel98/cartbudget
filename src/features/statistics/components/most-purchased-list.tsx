import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProductoMasComprado } from "@/domain/services/statistics-calculator";

export function MostPurchasedList({ data }: { data: ProductoMasComprado[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Productos más comprados</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {data.length === 0 && (
          <p className="text-muted-foreground text-sm">Aún no hay compras registradas.</p>
        )}
        {data.map((entry, index) => (
          <div key={entry.nombre} className="flex items-center justify-between py-1.5 text-sm">
            <span className="flex items-center gap-2 font-medium">
              <span className="tabular bg-muted text-muted-foreground flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold">
                {index + 1}
              </span>
              {entry.nombre}
            </span>
            <span className="tabular text-muted-foreground text-xs">{entry.vecesComprado}×</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
