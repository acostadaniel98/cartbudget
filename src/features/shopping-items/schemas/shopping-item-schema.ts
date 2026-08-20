import { z } from "zod";

export const shoppingItemSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, "Escribe el nombre del producto")
    .max(80, "El nombre es muy largo (máximo 80 caracteres)"),
  cantidad: z.coerce
    .number({ message: "Ingresa un número válido" })
    .int("La cantidad debe ser un número entero")
    .positive("La cantidad debe ser mayor a 0")
    .default(1),
  categoria: z.string().min(1, "Elige una categoría"),
  notas: z.string().trim().max(140, "Máximo 140 caracteres").optional(),
});

export type ShoppingItemFormValues = z.input<typeof shoppingItemSchema>;
export type ShoppingItemFormOutput = z.output<typeof shoppingItemSchema>;

export const purchaseEntrySchema = z.object({
  cantidad: z.coerce
    .number({ message: "Ingresa un número válido" })
    .int("La cantidad debe ser un número entero")
    .positive("La cantidad debe ser mayor a 0"),
  precioUnitario: z.coerce
    .number({ message: "Ingresa un precio válido" })
    .min(0, "El precio no puede ser negativo"),
});

export type PurchaseEntryFormValues = z.input<typeof purchaseEntrySchema>;
export type PurchaseEntryFormOutput = z.output<typeof purchaseEntrySchema>;
