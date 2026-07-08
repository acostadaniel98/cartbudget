import { z } from "zod";

export const shoppingListSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, "Ponle un nombre a la compra")
    .max(60, "El nombre es muy largo (máximo 60 caracteres)"),
  presupuesto: z
    .union([z.coerce.number().positive("El presupuesto debe ser mayor a 0"), z.literal("")])
    .optional()
    .transform((value) => (value === "" || value === undefined ? undefined : value)),
  notas: z.string().trim().max(200, "Máximo 200 caracteres").optional(),
});

export type ShoppingListFormValues = z.input<typeof shoppingListSchema>;
export type ShoppingListFormOutput = z.output<typeof shoppingListSchema>;
