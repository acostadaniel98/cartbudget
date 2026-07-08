"use client";

import { History as HistoryIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { HistoryListItem } from "@/features/history/components/history-list-item";
import { useShoppingLists } from "@/features/shopping-lists/hooks/use-shopping-lists";

export default function HistorialPage() {
  const { lists, isLoading } = useShoppingLists();

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

      <div className="space-y-2">
        {lists.map((list) => (
          <HistoryListItem key={list.id} list={list} />
        ))}
      </div>
    </div>
  );
}
