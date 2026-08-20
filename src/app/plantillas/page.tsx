"use client";

import Link from "next/link";
import { LayoutTemplate, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { TemplateCard } from "@/features/templates/components/template-card";
import { useTemplates } from "@/features/shopping-lists/hooks/use-shopping-lists";

export default function PlantillasPage() {
  const { templates, isLoading, removeTemplate } = useTemplates();

  return (
    <div className="space-y-4 px-4 pb-6">
      <PageHeader
        title="Plantillas"
        action={
          <Button asChild size="sm">
            <Link href="/nueva-compra?plantilla=1">
              <Plus /> Nueva
            </Link>
          </Button>
        }
      />

      {!isLoading && templates.length === 0 && (
        <EmptyState
          icon={<LayoutTemplate />}
          title="Sin plantillas todavía"
          description='Guarda compras recurrentes como "Despensa" o "Limpieza" para reutilizarlas en segundos.'
          action={
            <Button asChild>
              <Link href="/nueva-compra?plantilla=1">
                <Plus /> Crear plantilla
              </Link>
            </Button>
          }
        />
      )}

      {isLoading && (
        <div className="grid gap-3 sm:grid-cols-2" role="status" aria-label="Cargando plantillas">
          <div className="bg-muted h-32 animate-pulse rounded-2xl" />
          <div className="bg-muted h-32 animate-pulse rounded-2xl" />
          <span className="sr-only">Cargando plantillas</span>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {templates.map((template) => (
          <TemplateCard key={template.id} template={template} onDeleted={removeTemplate} />
        ))}
      </div>
    </div>
  );
}
