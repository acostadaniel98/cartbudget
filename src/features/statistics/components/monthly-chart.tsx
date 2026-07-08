import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMonthLabel } from "@/lib/format";
import type { CompraPorMes } from "@/domain/services/statistics-calculator";

export function MonthlyChart({ data }: { data: CompraPorMes[] }) {
  const max = Math.max(...data.map((d) => d.cantidad), 1);
  const recent = data.slice(-6);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compras por mes</CardTitle>
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aún no hay compras registradas.</p>
        ) : (
          <div className="flex h-32 items-end gap-3">
            {recent.map((entry) => (
              <div key={entry.mes} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="tabular text-xs font-semibold">{entry.cantidad}</span>
                <div
                  className="w-full rounded-t-md bg-primary"
                  style={{ height: `${Math.max(6, (entry.cantidad / max) * 100)}%` }}
                />
                <span className="text-[10px] whitespace-nowrap text-muted-foreground capitalize">
                  {formatMonthLabel(entry.mes).split(" ")[0].slice(0, 3)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
