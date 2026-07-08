import type { ItemStatus } from "./item-status";

/**
 * Entidad de dominio: Producto dentro de una lista de compra.
 *
 * precioTotal es siempre una función derivada de cantidad * precioUnitario
 * (ver domain/services/budget-calculator.ts). Se persiste igualmente para
 * simplificar lecturas y estadísticas, pero nunca debe calcularse a mano
 * fuera del dominio.
 */
export interface ShoppingItem {
  id: string;
  shoppingListId: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  precioTotal: number;
  categoria: string;
  estado: ItemStatus;
  notas?: string;
  orden: number;
  fechaCompra?: number;
}

export interface CreateShoppingItemInput {
  shoppingListId: string;
  nombre: string;
  cantidad?: number;
  precioUnitario?: number;
  categoria: string;
  notas?: string;
}

export interface UpdateShoppingItemInput {
  nombre?: string;
  cantidad?: number;
  precioUnitario?: number;
  categoria?: string;
  estado?: ItemStatus;
  notas?: string;
  orden?: number;
}
