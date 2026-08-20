"use client";

import * as React from "react";
import { Reorder, motion, useDragControls, useAnimation, type DragControls } from "framer-motion";
import { ArrowDown, ArrowUp, Ellipsis, GripVertical, Pencil, SearchX, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { getCategoryIcon } from "@/lib/category-icon";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ItemStatus } from "@/domain/models/item-status";
import type { ShoppingItem } from "@/domain/models/shopping-item";
import type { Category } from "@/domain/models/category";

const ACTION_WIDTH = 76;
const OPEN_X = -ACTION_WIDTH * 3;

interface ProductItemRowContentProps {
  item: ShoppingItem;
  category: Category | undefined;
  dragControls?: DragControls;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMarkNotFound: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

function ProductItemRowContent({
  item,
  category,
  dragControls,
  onToggle,
  onEdit,
  onDelete,
  onMarkNotFound,
  onMoveUp,
  onMoveDown,
}: ProductItemRowContentProps) {
  const swipeControls = useAnimation();
  const Icon = category ? getCategoryIcon(category.icono) : undefined;
  const isPurchased = item.estado === ItemStatus.COMPRADO;
  const isNotFound = item.estado === ItemStatus.NO_ENCONTRADO;
  const closeSwipe = () => swipeControls.start({ x: 0 });

  return (
    <div className="relative">
      {/* Acciones reveladas al deslizar hacia la izquierda */}
      <div className="absolute inset-y-1 right-0 flex overflow-hidden rounded-r-2xl">
        <button
          type="button"
          aria-label="Marcar como no encontrado"
          onClick={() => {
            closeSwipe();
            onMarkNotFound();
          }}
          style={{ width: ACTION_WIDTH }}
          className="flex flex-col items-center justify-center gap-1 bg-warning text-accent-foreground text-[11px] font-medium"
        >
          <SearchX className="size-4" />
          Agotado
        </button>
        <button
          type="button"
          aria-label="Editar producto"
          onClick={() => {
            closeSwipe();
            onEdit();
          }}
          style={{ width: ACTION_WIDTH }}
          className="flex flex-col items-center justify-center gap-1 bg-secondary text-secondary-foreground text-[11px] font-medium"
        >
          <Pencil className="size-4" />
          Editar
        </button>
        <button
          type="button"
          aria-label="Eliminar producto"
          onClick={() => {
            closeSwipe();
            onDelete();
          }}
          style={{ width: ACTION_WIDTH }}
          className="flex flex-col items-center justify-center gap-1 bg-destructive text-destructive-foreground text-[11px] font-medium"
        >
          <Trash2 className="size-4" />
          Eliminar
        </button>
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: OPEN_X, right: 0 }}
        dragElastic={0.06}
        dragMomentum={false}
        animate={swipeControls}
        onDragEnd={(_, info) => {
          swipeControls.start({ x: info.offset.x < -60 ? OPEN_X : 0 });
        }}
        className="relative z-10 flex items-center gap-3 rounded-2xl border border-border bg-card px-3 py-3 shadow-sm touch-pan-y"
      >
        {dragControls && (
          <button
            type="button"
            aria-label="Reordenar"
            data-tap-ignore
            onPointerDown={(e) => dragControls.start(e)}
            onClick={(e) => e.stopPropagation()}
            className="flex size-8 shrink-0 cursor-grab touch-none items-center justify-center text-muted-foreground active:cursor-grabbing"
          >
            <GripVertical className="size-5" />
          </button>
        )}

        <div data-tap-ignore onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
          <Checkbox
            checked={isPurchased}
            onCheckedChange={onToggle}
            aria-label={`Marcar ${item.nombre} como comprado`}
          />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "truncate font-medium",
              isPurchased && "text-muted-foreground line-through",
              isNotFound && "text-muted-foreground italic",
            )}
          >
            {item.nombre}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {Icon && <Icon className="size-3.5" style={{ color: category?.color }} />}
            <span className="tabular">{item.cantidad}</span>
            {isNotFound && (
              <span className="flex items-center gap-1 text-warning">
                <SearchX className="size-3.5" /> No encontrado
              </span>
            )}
          </div>
        </div>

        {isPurchased && (
          <span className="tabular shrink-0 text-sm font-semibold">{formatCurrency(item.precioTotal)}</span>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label={`Acciones para ${item.nombre}`}>
              <Ellipsis />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={onEdit}>
              <Pencil className="size-4" /> Editar producto
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onMarkNotFound}>
              <SearchX className="size-4" /> Marcar como agotado
            </DropdownMenuItem>
            {(onMoveUp || onMoveDown) && <DropdownMenuSeparator />}
            {onMoveUp && (
              <DropdownMenuItem onSelect={onMoveUp}>
                <ArrowUp className="size-4" /> Mover arriba
              </DropdownMenuItem>
            )}
            {onMoveDown && (
              <DropdownMenuItem onSelect={onMoveDown}>
                <ArrowDown className="size-4" /> Mover abajo
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={onDelete}>
              <Trash2 className="size-4" /> Eliminar producto
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>
    </div>
  );
}

interface ProductItemProps {
  item: ShoppingItem;
  category: Category | undefined;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMarkNotFound: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

/** Fila arrastrable: debe usarse dentro de un <Reorder.Group>. */
export function ReorderableProductItem(props: ProductItemProps) {
  const dragControls = useDragControls();
  return (
    <Reorder.Item value={props.item} dragListener={false} dragControls={dragControls} as="div">
      <ProductItemRowContent {...props} dragControls={dragControls} />
    </Reorder.Item>
  );
}

/** Fila estática (sin arrastre), para productos ya resueltos. */
export function StaticProductItem(props: ProductItemProps) {
  return <ProductItemRowContent {...props} />;
}
