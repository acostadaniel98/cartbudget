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
import {
  shoppingListSchema,
  type ShoppingListFormValues,
  type ShoppingListFormOutput,
} from "@/features/shopping-lists/schemas/shopping-list-schema";
import type { ShoppingList, UpdateShoppingListInput } from "@/domain/models/shopping-list";

interface EditListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  list: ShoppingList;
  onSave: (patch: UpdateShoppingListInput) => Promise<unknown>;
}

export function EditListDialog({ open, onOpenChange, list, onSave }: EditListDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ShoppingListFormValues, unknown, ShoppingListFormOutput>({
    resolver: zodResolver(shoppingListSchema),
    defaultValues: {
      nombre: list.nombre,
      presupuesto: list.presupuesto ?? "",
      notas: list.notas ?? "",
    },
  });

  React.useEffect(() => {
    if (open) {
      reset({ nombre: list.nombre, presupuesto: list.presupuesto ?? "", notas: list.notas ?? "" });
    }
  }, [open, list, reset]);

  const submit = handleSubmit(async (values) => {
    await onSave({
      nombre: values.nombre,
      presupuesto: values.presupuesto === undefined ? null : values.presupuesto,
      notas: values.notas,
    });
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar compra</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="editar-nombre">Nombre</Label>
            <Input id="editar-nombre" autoFocus {...register("nombre")} />
            {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="editar-presupuesto">Presupuesto (opcional)</Label>
            <Input
              id="editar-presupuesto"
              type="number"
              inputMode="decimal"
              step="any"
              min={0}
              placeholder="$0.00"
              {...register("presupuesto")}
            />
            {errors.presupuesto && <p className="text-xs text-destructive">{errors.presupuesto.message}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              Guardar cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
