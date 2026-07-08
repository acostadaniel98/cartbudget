"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductAutocomplete } from "@/features/frequent-products/components/product-autocomplete";
import { getCategoryIcon } from "@/lib/category-icon";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { generateId } from "@/lib/id";
import type { FrequentProduct } from "@/domain/models/frequent-product";

export interface DraftProduct {
  tempId: string;
  nombre: string;
  cantidad: number;
  categoria: string;
}

interface QuickAddProductsProps {
  value: DraftProduct[];
  onChange: (items: DraftProduct[]) => void;
  defaultCategoryId: string;
}

export function QuickAddProducts({ value, onChange, defaultCategoryId }: QuickAddProductsProps) {
  const [draftName, setDraftName] = React.useState("");
  const [draftCategoria, setDraftCategoria] = React.useState(defaultCategoryId);
  const { categories } = useCategories();

  React.useEffect(() => {
    if (!draftCategoria && defaultCategoryId) setDraftCategoria(defaultCategoryId);
  }, [defaultCategoryId, draftCategoria]);

  const categoryById = new Map(categories.map((c) => [c.id, c]));

  const commit = () => {
    const nombre = draftName.trim();
    if (!nombre) return;
    onChange([
      ...value,
      { tempId: generateId(), nombre, cantidad: 1, categoria: draftCategoria || defaultCategoryId },
    ]);
    setDraftName("");
  };

  const handleSelectSuggestion = (product: FrequentProduct) => {
    onChange([
      ...value,
      {
        tempId: generateId(),
        nombre: product.nombre,
        cantidad: product.ultimaCantidad ?? 1,
        categoria: product.categoria,
      },
    ]);
    setDraftName("");
  };

  const updateCantidad = (tempId: string, delta: number) => {
    onChange(
      value.map((item) =>
        item.tempId === tempId ? { ...item, cantidad: Math.max(1, item.cantidad + delta) } : item,
      ),
    );
  };

  const removeItem = (tempId: string) => {
    onChange(value.filter((item) => item.tempId !== tempId));
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1">
          <ProductAutocomplete
            value={draftName}
            onChange={setDraftName}
            onSelectSuggestion={handleSelectSuggestion}
            placeholder="Escribe un producto y presiona +"
          />
        </div>
        <Button
          type="button"
          size="icon"
          aria-label="Agregar producto"
          onClick={commit}
          onKeyDown={(e) => e.key === "Enter" && commit()}
        >
          <Plus />
        </Button>
      </div>

      {value.length > 0 && (
        <ul className="space-y-2">
          {value.map((item) => {
            const category = categoryById.get(item.categoria);
            const Icon = category ? getCategoryIcon(category.icono) : undefined;
            return (
              <li
                key={item.tempId}
                className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5"
              >
                {Icon && <Icon className="size-4 shrink-0" style={{ color: category?.color }} />}
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.nombre}</span>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    aria-label="Quitar uno"
                    onClick={() => updateCantidad(item.tempId, -1)}
                    className="flex size-7 items-center justify-center rounded-full bg-muted text-muted-foreground"
                  >
                    –
                  </button>
                  <span className="tabular w-5 text-center text-sm font-semibold">{item.cantidad}</span>
                  <button
                    type="button"
                    aria-label="Agregar uno"
                    onClick={() => updateCantidad(item.tempId, 1)}
                    className="flex size-7 items-center justify-center rounded-full bg-muted text-muted-foreground"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  aria-label={`Quitar ${item.nombre}`}
                  onClick={() => removeItem(item.tempId)}
                  className="shrink-0 text-muted-foreground"
                >
                  <X className="size-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
