"use client";

import { History as HistoryIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { HistoryListItem } from "@/features/history/components/history-list-item";
import { useShoppingLists } from "@/features/shopping-lists/hooks/use-shopping-lists";

export default function HistorialPage() {
  const { lists, isLoading, removeList } = useShoppingLists();

  return (
    <div className="space-y-4 px-4 pb-6">
      <PageHeader title="Historial" />

      {!isLoading && lists.length === 0 && (
        <EmptyState
          icon={<HistoryIcon />}
          title="Sin compras todavía"
          description="Aquí aparecerán todas tus compras pasadas."
        />
      )}

      {isLoading && (
        <div className="space-y-2" role="status" aria-label="Cargando historial">
          <div className="bg-muted h-20 animate-pulse rounded-2xl" />
          <div className="bg-muted h-20 animate-pulse rounded-2xl" />
          <span className="sr-only">Cargando historial</span>
        </div>
      )}

      <div className="space-y-2">
        {lists.map((list) => (
          <HistoryListItem key={list.id} list={list} onDeleted={removeList} />
        ))}
      </div>
    </div>
  );
}
