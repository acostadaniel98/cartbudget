"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  shoppingListSchema,
  type ShoppingListFormValues,
} from "@/features/shopping-lists/schemas/shopping-list-schema";

interface ShoppingListFormProps {
  defaultValues?: Partial<ShoppingListFormValues>;
  onValuesChange: (values: ShoppingListFormValues, isValid: boolean) => void;
  formId: string;
}

/**
 * Formulario "vivo": no tiene botón propio de envío porque su padre
 * (la pantalla de nueva compra) necesita combinarlo con la lista de
 * productos antes de guardar todo junto.
 */
export function ShoppingListForm({ defaultValues, onValuesChange, formId }: ShoppingListFormProps) {
  const {
    register,
    control,
    formState: { errors, isValid },
  } = useForm<ShoppingListFormValues>({
    resolver: zodResolver(shoppingListSchema),
    mode: "onChange",
    defaultValues: { nombre: "", presupuesto: "", notas: "", ...defaultValues },
  });

  const values = useWatch({ control }) as ShoppingListFormValues;
  const serializedValues = JSON.stringify(values);
  const valuesRef = React.useRef(values);
  valuesRef.current = values;

  React.useEffect(() => {
    onValuesChange(valuesRef.current, isValid);
  }, [isValid, onValuesChange, serializedValues]);

  return (
    <form id={formId} className="space-y-5" onSubmit={(e) => e.preventDefault()}>
      <div className="space-y-1.5">
        <Label htmlFor="lista-nombre">Nombre de la compra</Label>
        <Input
          id="lista-nombre"
          placeholder="Ej. Compra semanal"
          autoFocus
          {...register("nombre")}
        />
        {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="lista-presupuesto">Presupuesto (opcional)</Label>
        <Input
          id="lista-presupuesto"
          type="number"
          inputMode="decimal"
          step="0.01"
          min={0}
          placeholder="$0.00"
          aria-describedby="lista-presupuesto-ayuda"
          {...register("presupuesto")}
          onKeyDown={(event) => {
            if (["e", "E", "+", "-"].includes(event.key)) event.preventDefault();
          }}
        />
        {errors.presupuesto && <p className="text-xs text-destructive">{errors.presupuesto.message}</p>}
        <p id="lista-presupuesto-ayuda" className="text-xs text-muted-foreground">
          Si lo dejas vacío, solo veremos cuánto llevas gastado, sin restante ni porcentaje.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="lista-notas">Notas (opcional)</Label>
        <Textarea
          id="lista-notas"
          rows={3}
          maxLength={200}
          placeholder="Ej. Comprar en la tienda del barrio"
          {...register("notas")}
        />
        {errors.notas && <p className="text-xs text-destructive">{errors.notas.message}</p>}
      </div>
    </form>
  );
}
