"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { MoreVertical, Pencil, Copy, LayoutTemplate, Trash2, Share2, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { BudgetSummary } from "@/features/shopping-items/components/budget-summary";
import { ShoppingItemManager } from "@/features/shopping-items/components/shopping-item-manager";
import { useShoppingItems } from "@/features/shopping-items/hooks/use-shopping-items";
import { useShoppingList } from "@/features/shopping-lists/hooks/use-shopping-list";
import { EditListDialog } from "@/features/shopping-lists/components/edit-list-dialog";
import { DuplicateListDialog } from "@/features/shopping-lists/components/duplicate-list-dialog";
import { ShareListDialog } from "@/features/shopping-lists/components/share-list-dialog";
import { ROUTES } from "@/constants/routes";

export default function CompraDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const { list, role, isLoading, update, setEsPlantilla, remove, duplicate } = useShoppingList(id);
  const isOwner = role === "OWNER";
  const canEdit = role === "OWNER" || role === "EDITOR";
  const {
    items,
    summary,
    addItem,
    updateItem,
    markPurchased,
    markNotFound,
    markPending,
    reorder,
    removeItem,
  } = useShoppingItems(id, list?.presupuesto);

  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDuplicateOpen, setIsDuplicateOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isShareOpen, setIsShareOpen] = React.useState(false);

  if (isLoading) {
    return <div className="text-muted-foreground px-4 py-6 text-sm">Cargando…</div>;
  }

  if (!list) {
    return (
      <div className="px-4 py-6">
        <p className="text-muted-foreground text-sm">Esta compra ya no existe.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title={list.nombre}
        showBack
        action={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Más opciones">
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canEdit && (
                <DropdownMenuItem onSelect={() => setIsEditOpen(true)}>
                  <Pencil className="size-4" /> Editar
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onSelect={() => setIsDuplicateOpen(true)}>
                <Copy className="size-4" /> Duplicar compra
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setIsShareOpen(true)}>
                {isOwner ? <Share2 className="size-4" /> : <Users className="size-4" />}
                {isOwner ? "Compartir compra" : "Colaboradores"}
              </DropdownMenuItem>
              {canEdit && (
                <DropdownMenuItem onSelect={() => setEsPlantilla(!list.esPlantilla)}>
                  <LayoutTemplate className="size-4" />
                  {list.esPlantilla ? "Quitar de plantillas" : "Guardar como plantilla"}
                </DropdownMenuItem>
              )}
              {isOwner && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onSelect={() => setIsDeleteOpen(true)}>
                    <Trash2 className="size-4" /> Eliminar
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      <div className="px-4">
        <BudgetSummary summary={summary} />
      </div>

      <div className="px-4">
        <ShoppingItemManager
          items={items}
          addItem={addItem}
          updateItem={updateItem}
          markPurchased={markPurchased}
          markNotFound={markNotFound}
          markPending={markPending}
          reorder={reorder}
          removeItem={removeItem}
          readOnly={role === "VIEWER"}
        />
      </div>

      <EditListDialog open={isEditOpen} onOpenChange={setIsEditOpen} list={list} onSave={update} />

      <DuplicateListDialog
        open={isDuplicateOpen}
        onOpenChange={setIsDuplicateOpen}
        title="Duplicar compra"
        description="Se creará una nueva compra con los mismos productos, lista para una nueva salida."
        defaultName={`${list.nombre} (copia)`}
        confirmLabel="Duplicar"
        onConfirm={(nombre) => duplicate(nombre)}
      />

      <ShareListDialog
        listId={id}
        open={isShareOpen}
        onOpenChange={setIsShareOpen}
        role={role}
        onLeft={() => router.replace(ROUTES.inicio)}
      />

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar &ldquo;{list.nombre}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminarán también todos sus productos. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => remove()}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
