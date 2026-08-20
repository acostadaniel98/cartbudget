"use client";

import { Reorder } from "framer-motion";
import { ReorderableProductItem, StaticProductItem } from "@/features/shopping-items/components/product-item-row";
import { ItemStatus } from "@/domain/models/item-status";
import type { ShoppingItem } from "@/domain/models/shopping-item";
import type { Category } from "@/domain/models/category";

interface ProductListProps {
  items: ShoppingItem[];
  categories: Category[];
  onReorderPending: (orderedIds: string[]) => void;
  onToggle: (item: ShoppingItem) => void;
  onEdit: (item: ShoppingItem) => void;
  onDelete: (item: ShoppingItem) => void;
  onMarkNotFound: (item: ShoppingItem) => void;
}

export function ProductList({
  items,
  categories,
  onReorderPending,
  onToggle,
  onEdit,
  onDelete,
  onMarkNotFound,
}: ProductListProps) {
  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const pendientes = items.filter((i) => i.estado === ItemStatus.PENDIENTE).sort((a, b) => a.orden - b.orden);
  const resueltos = items
    .filter((i) => i.estado !== ItemStatus.PENDIENTE)
    .sort((a, b) => (b.fechaCompra ?? 0) - (a.fechaCompra ?? 0));

  return (
    <div className="space-y-6">
      {pendientes.length > 0 && (
        <>
          <p id="orden-productos-ayuda" className="sr-only">
            Puedes arrastrar productos o usar las acciones para moverlos arriba y abajo.
          </p>
          <Reorder.Group
            as="div"
            axis="y"
            values={pendientes}
            onReorder={(newOrder) => onReorderPending(newOrder.map((i) => i.id))}
            aria-describedby="orden-productos-ayuda"
            className="space-y-2"
          >
            {pendientes.map((item, index) => (
              <ReorderableProductItem
                key={item.id}
                item={item}
                category={categoryById.get(item.categoria)}
                onToggle={() => onToggle(item)}
                onEdit={() => onEdit(item)}
                onDelete={() => onDelete(item)}
                onMarkNotFound={() => onMarkNotFound(item)}
                onMoveUp={
                  index > 0
                    ? () => {
                        const nextOrder = [...pendientes];
                        [nextOrder[index - 1], nextOrder[index]] = [nextOrder[index], nextOrder[index - 1]];
                        onReorderPending(nextOrder.map((product) => product.id));
                      }
                    : undefined
                }
                onMoveDown={
                  index < pendientes.length - 1
                    ? () => {
                        const nextOrder = [...pendientes];
                        [nextOrder[index], nextOrder[index + 1]] = [nextOrder[index + 1], nextOrder[index]];
                        onReorderPending(nextOrder.map((product) => product.id));
                      }
                    : undefined
                }
              />
            ))}
          </Reorder.Group>
        </>
      )}

      {resueltos.length > 0 && (
        <div className="space-y-2">
          <p className="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Ya resueltos
          </p>
          <div className="space-y-2 opacity-80">
            {resueltos.map((item) => (
              <div key={item.id} className="relative">
                <StaticProductItem
                  item={item}
                  category={categoryById.get(item.categoria)}
                  onToggle={() => onToggle(item)}
                  onEdit={() => onEdit(item)}
                  onDelete={() => onDelete(item)}
                  onMarkNotFound={() => onMarkNotFound(item)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
