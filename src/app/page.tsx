"use client";

import Link from "next/link";
import { Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { BudgetSummary } from "@/features/shopping-items/components/budget-summary";
import { ShoppingListCard } from "@/features/shopping-lists/components/shopping-list-card";
import {
  useActiveShoppingList,
  useRecentShoppingLists,
} from "@/features/shopping-lists/hooks/use-shopping-lists";
import { useListSummary } from "@/features/shopping-items/hooks/use-list-summary";
import { ROUTES } from "@/constants/routes";
import { SITE_CONFIG } from "@/config/site";

function ActiveListSummary({ listId, presupuesto }: { listId: string; presupuesto: number | undefined }) {
  const { summary } = useListSummary(listId, presupuesto);
  return <BudgetSummary summary={summary} />;
}

export default function DashboardPage() {
  const { activeList, isLoading: isLoadingActive } = useActiveShoppingList();
  const { lists: recent, isLoading: isLoadingRecent } = useRecentShoppingLists(6);

  const otherRecent = recent.filter((l) => l.id !== activeList?.id);

  return (
    <div className="space-y-6 px-4 pb-6">
      <header className="flex items-center justify-between pt-2">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {SITE_CONFIG.nombre}
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-extrabold">
            ¿Qué vamos a comprar?
          </h1>
        </div>
      </header>

      <Button asChild size="lg" className="w-full">
        <Link href={ROUTES.nuevaCompra}>
          <Plus /> Nueva compra
        </Link>
      </Button>

      {!isLoadingActive && activeList && (
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-[family-name:var(--font-display)] font-bold">Compra activa</h2>
            <Link href={ROUTES.compra(activeList.id)} className="text-sm font-semibold text-primary">
              Continuar →
            </Link>
          </div>
          <Link href={ROUTES.compra(activeList.id)} className="block">
            <ActiveListSummary listId={activeList.id} presupuesto={activeList.presupuesto} />
          </Link>
        </section>
      )}

      <section className="space-y-2">
        <h2 className="font-[family-name:var(--font-display)] font-bold">Compras recientes</h2>

        {!isLoadingRecent && otherRecent.length === 0 && !activeList && (
          <EmptyState
            icon={<ShoppingCart />}
            title="Todavía no tienes compras"
            description="Crea tu primera lista para empezar a ahorrar tiempo en el súper."
          />
        )}

        <div className="space-y-2">
          {otherRecent.map((list) => (
            <ShoppingListCard key={list.id} list={list} />
          ))}
        </div>
      </section>
    </div>
  );
}
