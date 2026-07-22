"use client";

import * as React from "react";
import { Plus, ShoppingBasket } from "lucide-react";
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
import { EmptyState } from "@/components/shared/empty-state";
import { ProductList } from "@/features/shopping-items/components/product-list";
import { ProductFormDialog } from "@/features/shopping-items/components/product-form-dialog";
import { PurchaseDialog } from "@/features/shopping-items/components/purchase-dialog";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { ItemStatus } from "@/domain/models/item-status";
import { UNCATEGORIZED_ID } from "@/constants/categories";
import type { ShoppingItem, CreateShoppingItemInput, UpdateShoppingItemInput } from "@/domain/models/shopping-item";

interface ShoppingItemManagerProps {
  items: ShoppingItem[];
  addItem: (input: Omit<CreateShoppingItemInput, "shoppingListId">) => Promise<void>;
  updateItem: (id: string, patch: UpdateShoppingItemInput) => Promise<void>;
  markPurchased: (id: string, cantidad: number, precioUnitario: number) => Promise<void>;
  markNotFound: (id: string) => Promise<void>;
  markPending: (id: string) => Promise<void>;
  reorder: (orderedIds: string[]) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
}

export function ShoppingItemManager({
  items,
  addItem,
  updateItem,
  markPurchased,
  markNotFound,
  markPending,
  reorder,
  removeItem,
}: ShoppingItemManagerProps) {
  const { categories } = useCategories();

  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<ShoppingItem | null>(null);
  const [purchasingItem, setPurchasingItem] = React.useState<ShoppingItem | null>(null);
  const [deletingItem, setDeletingItem] = React.useState<ShoppingItem | null>(null);

  const defaultCategoryId = categories[0]?.id ?? UNCATEGORIZED_ID;

  const handleToggle = (item: ShoppingItem) => {
    if (item.estado === ItemStatus.COMPRADO) {
      markPending(item.id);
    } else {
      setPurchasingItem(item);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold">Productos</h2>
        <Button size="sm" onClick={() => setIsAddOpen(true)}>
          <Plus /> Agregar
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<ShoppingBasket />}
          title="Aún no hay productos"
          description="Agrega el primero para empezar tu lista."
          action={
            <Button onClick={() => setIsAddOpen(true)}>
              <Plus /> Agregar producto
            </Button>
          }
        />
      ) : (
        <ProductList
          items={items}
          categories={categories}
          onReorderPending={reorder}
          onToggle={handleToggle}
          onEdit={setEditingItem}
          onDelete={setDeletingItem}
          onMarkNotFound={(item) => markNotFound(item.id)}
        />
      )}

      <ProductFormDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        mode="create"
        defaultCategoryId={defaultCategoryId}
        onSubmit={async (values) => {
          await addItem({
            nombre: values.nombre,
            cantidad: Number(values.cantidad) || 1,
            categoria: values.categoria,
            notas: values.notas,
          });
          toast.success(`${values.nombre} agregado`);
        }}
      />

      <ProductFormDialog
        open={editingItem !== null}
        onOpenChange={(open) => !open && setEditingItem(null)}
        mode="edit"
        defaultCategoryId={editingItem?.categoria ?? defaultCategoryId}
        defaultValues={
          editingItem
            ? {
                nombre: editingItem.nombre,
                cantidad: editingItem.cantidad,
                categoria: editingItem.categoria,
                notas: editingItem.notas ?? "",
              }
            : undefined
        }
        onSubmit={async (values) => {
          if (!editingItem) return;
          await updateItem(editingItem.id, {
            nombre: values.nombre,
            cantidad: Number(values.cantidad) || 1,
            categoria: values.categoria,
            notas: values.notas,
          });
          toast.success("Producto actualizado");
        }}
      />

      <PurchaseDialog
        open={purchasingItem !== null}
        onOpenChange={(open) => !open && setPurchasingItem(null)}
        item={purchasingItem}
        onConfirm={async (cantidad, precioUnitario) => {
          if (!purchasingItem) return;
          await markPurchased(purchasingItem.id, cantidad, precioUnitario);
        }}
      />

      <AlertDialog open={deletingItem !== null} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar {deletingItem?.nombre}?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingItem) removeItem(deletingItem.id);
                setDeletingItem(null);
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
