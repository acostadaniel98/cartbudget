"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LayoutTemplate, Play, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DuplicateListDialog } from "@/features/shopping-lists/components/duplicate-list-dialog";
import { useListSummary } from "@/features/shopping-items/hooks/use-list-summary";
import { apiFetch } from "@/lib/api/client";
import { duplicateShoppingList } from "@/lib/api/shopping-lists";
import { ROUTES } from "@/constants/routes";
import type { ShoppingList } from "@/domain/models/shopping-list";

export function TemplateCard({ template }: { template: ShoppingList }) {
  const router = useRouter();
  const { summary } = useListSummary(template.id, template.presupuesto);
  const [isUseOpen, setIsUseOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);

  return (
    <div className="border-border bg-card rounded-2xl border p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="bg-accent/15 text-accent-foreground flex size-10 shrink-0 items-center justify-center rounded-xl">
          <LayoutTemplate className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display truncate font-bold">{template.nombre}</p>
          <p className="text-muted-foreground text-xs">{summary.totalProductos} productos</p>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <Button className="flex-1" onClick={() => setIsUseOpen(true)}>
          <Play /> Usar plantilla
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label="Eliminar plantilla"
          onClick={() => setIsDeleteOpen(true)}
        >
          <Trash2 />
        </Button>
      </div>

      <DuplicateListDialog
        open={isUseOpen}
        onOpenChange={setIsUseOpen}
        title="Nueva compra desde plantilla"
        description="Se creará una nueva compra con los productos de esta plantilla."
        defaultName={template.nombre}
        confirmLabel="Crear compra"
        onConfirm={async (nombre) => {
          const { list: newList } = await duplicateShoppingList(template, nombre);
          toast.success("Compra creada desde la plantilla");
          router.push(ROUTES.compra(newList.id));
        }}
      />

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Eliminar la plantilla &ldquo;{template.nombre}&rdquo;?
            </AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await apiFetch(`/api/v1/lists/${template.id}`, { method: "DELETE" });
                toast.success("Plantilla eliminada");
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
