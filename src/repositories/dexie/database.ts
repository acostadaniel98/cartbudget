import Dexie, { type EntityTable } from "dexie";
import type { ShoppingList } from "@/domain/models/shopping-list";
import type { ShoppingItem } from "@/domain/models/shopping-item";
import type { FrequentProduct } from "@/domain/models/frequent-product";
import type { Category } from "@/domain/models/category";

/**
 * Única puerta de entrada a IndexedDB. Toda la persistencia de la app pasa
 * por aquí usando Dexie.js. Ningún otro archivo fuera de
 * `repositories/dexie` debe importar Dexie directamente: el dominio y los
 * servicios de aplicación solo conocen las interfaces en
 * `domain/repositories`.
 */
export class CartBudgetDatabase extends Dexie {
  shoppingLists!: EntityTable<ShoppingList, "id">;
  shoppingItems!: EntityTable<ShoppingItem, "id">;
  frequentProducts!: EntityTable<FrequentProduct, "id">;
  categories!: EntityTable<Category, "id">;

  constructor() {
    super("CartBudgetDatabase");

    this.version(1).stores({
      shoppingLists: "id, fechaCreacion, fechaActualizacion",
      shoppingItems: "id, shoppingListId, estado, categoria, orden",
      frequentProducts: "id, &nombreNormalizado, frecuencia",
      categories: "id, orden",
    });
  }
}

let instance: CartBudgetDatabase | undefined;

/**
 * Devuelve la instancia única (singleton) de la base de datos, creándola de
 * forma perezosa. Next.js renderiza los componentes cliente también en el
 * servidor para generar el HTML inicial, y `indexedDB` no existe ahí; por
 * eso nunca se instancia Dexie a nivel de módulo, solo cuando algo la pide
 * de verdad (siempre desde un efecto o un manejador de evento en el
 * navegador).
 */
export function getDb(): CartBudgetDatabase {
  if (typeof window === "undefined") {
    throw new Error(
      "CartBudgetDatabase solo puede usarse en el navegador (IndexedDB no existe en el servidor)",
    );
  }
  if (!instance) {
    instance = new CartBudgetDatabase();
  }
  return instance;
}
