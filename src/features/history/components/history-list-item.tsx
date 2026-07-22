"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, MoreVertical, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { DuplicateListDialog } from "@/features/shopping-lists/components/duplicate-list-dialog";
import { useListSummary } from "@/features/shopping-items/hooks/use-list-summary";
import { shoppingListService } from "@/services/shopping-list-service";
import { formatCurrency, formatDate } from "@/lib/format";
import { ROUTES } from "@/constants/routes";
import type { ShoppingList } from "@/domain/models/shopping-list";

export function HistoryListItem({ list }: { list: ShoppingList }) {
  const router = useRouter();
  const { summary } = useListSummary(list.id, list.presupuesto);
  const [isDuplicateOpen, setIsDuplicateOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);

  return (
    <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <Link href={ROUTES.compra(list.id)} className="min-w-0 flex-1">
        <p className="truncate font-display font-bold">{list.nombre}</p>
        <p className="text-xs text-muted-foreground">{formatDate(list.fechaCreacion)}</p>
        <div className="mt-1.5 flex items-center gap-2 text-sm">
          <span className="tabular font-semibold">{formatCurrency(summary.gastado)}</span>
          {summary.presupuesto !== undefined && (
            <span className="text-xs text-muted-foreground">de {formatCurrency(summary.presupuesto)}</span>
          )}
          <span className="text-xs text-muted-foreground">· {summary.totalProductos} productos</span>
        </div>
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Más opciones para ${list.nombre}`}>
            <MoreVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setIsDuplicateOpen(true)}>
            <Copy className="size-4" /> Duplicar compra
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={() => setIsDeleteOpen(true)}>
            <Trash2 className="size-4" /> Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DuplicateListDialog
        open={isDuplicateOpen}
        onOpenChange={setIsDuplicateOpen}
        title="Duplicar compra"
        description="Se creará una nueva compra con los mismos productos, lista para una nueva salida."
        defaultName={`${list.nombre} (copia)`}
        confirmLabel="Duplicar"
        onConfirm={async (nombre) => {
          const newList = await shoppingListService.duplicate(list.id, nombre);
          toast.success("Compra duplicada");
          router.push(ROUTES.compra(newList.id));
        }}
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
            <AlertDialogAction
              onClick={async () => {
                await shoppingListService.delete(list.id);
                toast.success("Compra eliminada");
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
