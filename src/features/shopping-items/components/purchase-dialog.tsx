"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  purchaseEntrySchema,
  type PurchaseEntryFormValues,
  type PurchaseEntryFormOutput,
} from "@/features/shopping-items/schemas/shopping-item-schema";
import { calculateItemTotal } from "@/domain/services/budget-calculator";
import { formatCurrency } from "@/lib/format";
import type { ShoppingItem } from "@/domain/models/shopping-item";

interface PurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ShoppingItem | null;
  onConfirm: (cantidad: number, precioUnitario: number) => Promise<void>;
}

export function PurchaseDialog({ open, onOpenChange, item, onConfirm }: PurchaseDialogProps) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PurchaseEntryFormValues, unknown, PurchaseEntryFormOutput>({
    resolver: zodResolver(purchaseEntrySchema),
    defaultValues: { cantidad: 1, precioUnitario: 0 },
  });

  React.useEffect(() => {
    if (open && item) {
      reset({
        cantidad: item.cantidad || 1,
        precioUnitario: item.precioUnitario || 0,
      });
    }
  }, [open, item, reset]);

  const cantidad = Number(watch("cantidad")) || 0;
  const precioUnitario = Number(watch("precioUnitario")) || 0;
  const total = cantidad > 0 && precioUnitario >= 0 ? calculateItemTotal(cantidad, precioUnitario) : 0;

  const submit = handleSubmit(async (values) => {
    await onConfirm(values.cantidad, values.precioUnitario);
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-0.5rem)] p-4 sm:max-h-[92dvh] sm:p-6">
        <DialogHeader>
          <DialogTitle>{item?.nombre ?? "Producto"}</DialogTitle>
          <DialogDescription>Ingresa primero el precio unitario y luego la cantidad.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-5 pb-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="compra-precio">Precio unitario</Label>
              <Input
                id="compra-precio"
                type="number"
                inputMode="decimal"
                step="0.01"
                min={0}
                autoFocus
                {...register("precioUnitario")}
                onKeyDown={(event) => {
                  if (["e", "E", "+", "-"].includes(event.key)) event.preventDefault();
                }}
              />
              {errors.precioUnitario && (
                <p className="text-xs text-destructive">{errors.precioUnitario.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="compra-cantidad">Cantidad</Label>
              <Input
                id="compra-cantidad"
                type="number"
                inputMode="numeric"
                step="1"
                min={1}
                {...register("cantidad")}
                onKeyDown={(event) => {
                  if (["e", "E", "+", "-", ".", ","].includes(event.key)) event.preventDefault();
                }}
              />
              {errors.cantidad && <p className="text-xs text-destructive">{errors.cantidad.message}</p>}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-muted px-4 py-3">
            <span className="text-sm font-medium text-muted-foreground">Total</span>
            <span className="tabular font-display text-lg font-bold">{formatCurrency(total)}</span>
          </div>

          <DialogFooter className="sticky bottom-0 z-10 -mx-4 mt-7 bg-card px-4 pt-3 pb-[env(safe-area-inset-bottom)] sm:static sm:mx-0 sm:bg-transparent sm:px-0 sm:pt-0 sm:pb-0">
            <Button type="submit" size="lg" disabled={isSubmitting}>
              Marcar como comprado
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
