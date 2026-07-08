/**
 * Entidad de dominio: Lista de compra.
 *
 * Una ShoppingList representa una compra (real o plantilla). No conoce
 * nada sobre React, Dexie o la interfaz: es un objeto de datos puro con
 * las reglas de forma que el resto de capas deben respetar.
 */
export interface ShoppingList {
  id: string;
  nombre: string;
  /** Presupuesto opcional. Si es `undefined`, la app no calcula restante ni porcentaje. */
  presupuesto?: number;
  fechaCreacion: number;
  fechaActualizacion: number;
  /** Indica si esta lista se guarda como plantilla reutilizable. */
  esPlantilla: boolean;
  /** Notas generales de la compra (opcional). */
  notas?: string;
}

export interface CreateShoppingListInput {
  nombre: string;
  presupuesto?: number;
  esPlantilla?: boolean;
  notas?: string;
}

export interface UpdateShoppingListInput {
  nombre?: string;
  presupuesto?: number | null;
  esPlantilla?: boolean;
  notas?: string;
}
