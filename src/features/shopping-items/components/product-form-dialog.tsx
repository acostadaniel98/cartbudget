"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProductAutocomplete } from "@/features/frequent-products/components/product-autocomplete";
import { CategorySelect } from "@/features/categories/components/category-select";
import {
  shoppingItemSchema,
  type ShoppingItemFormValues,
} from "@/features/shopping-items/schemas/shopping-item-schema";
import { UNCATEGORIZED_ID } from "@/constants/categories";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  defaultCategoryId: string;
  defaultValues?: Partial<ShoppingItemFormValues>;
  onSubmit: (values: ShoppingItemFormValues) => Promise<void>;
}

export function ProductFormDialog({
  open,
  onOpenChange,
  mode,
  defaultCategoryId,
  defaultValues,
  onSubmit,
}: ProductFormDialogProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ShoppingItemFormValues>({
    resolver: zodResolver(shoppingItemSchema),
    defaultValues: {
      nombre: "",
      cantidad: 1,
      categoria: defaultCategoryId || UNCATEGORIZED_ID,
      notas: "",
      ...defaultValues,
    },
  });

  React.useEffect(() => {
    if (open) {
      reset({
        nombre: "",
        cantidad: 1,
        categoria: defaultCategoryId || UNCATEGORIZED_ID,
        notas: "",
        ...defaultValues,
      });
    }
  }, [open, defaultCategoryId, defaultValues, reset]);

  const nombre = watch("nombre") ?? "";
  const categoria = watch("categoria");

  const submit = handleSubmit(async (values) => {
    await onSubmit(values);
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-0.5rem)] p-4 sm:max-h-[92dvh] sm:p-6">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Agregar producto" : "Editar producto"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-5 pb-1">
          <div className="space-y-1.5">
            <Label htmlFor="producto-nombre">Producto</Label>
            <ProductAutocomplete
              value={nombre}
              onChange={(value) => setValue("nombre", value, { shouldValidate: true })}
              onSelectSuggestion={(product) => {
                setValue("nombre", product.nombre, { shouldValidate: true });
                setValue("categoria", product.categoria);
                if (product.ultimaCantidad) setValue("cantidad", product.ultimaCantidad);
              }}
              autoFocus={mode === "create"}
            />
            {errors.nombre && <p className="text-destructive text-xs">{errors.nombre.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="producto-cantidad">Cantidad</Label>
              <Input
                id="producto-cantidad"
                type="number"
                inputMode="numeric"
                step="1"
                min={1}
                {...register("cantidad")}
                onKeyDown={(event) => {
                  if (["e", "E", "+", "-", ".", ","].includes(event.key)) event.preventDefault();
                }}
              />
              {errors.cantidad && (
                <p className="text-destructive text-xs">{errors.cantidad.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Categoría</Label>
              <CategorySelect
                value={categoria}
                onChange={(value) => setValue("categoria", value, { shouldValidate: true })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="producto-notas">Notas (opcional)</Label>
            <Textarea
              id="producto-notas"
              placeholder="Ej. marca específica, tamaño…"
              rows={2}
              {...register("notas")}
            />
          </div>

          <DialogFooter className="bg-card sticky bottom-0 z-10 -mx-4 mt-7 px-4 pt-3 pb-[env(safe-area-inset-bottom)] sm:static sm:mx-0 sm:bg-transparent sm:px-0 sm:pt-0 sm:pb-0">
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {mode === "create" ? "Agregar" : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
