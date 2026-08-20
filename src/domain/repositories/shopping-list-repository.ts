import type {
  CreateShoppingListInput,
  ShoppingList,
  UpdateShoppingListInput,
} from "@/domain/models/shopping-list";
import type { CreateShoppingItemInput, ShoppingItem } from "@/domain/models/shopping-item";

/**
 * Contrato que debe cumplir cualquier implementación de persistencia para
 * ShoppingList. El dominio depende de esta interfaz, nunca de Dexie
 * directamente, lo que permite reemplazar IndexedDB por sincronización en
 * la nube en el futuro sin tocar el dominio ni los servicios de aplicación.
 */
export interface IShoppingListRepository {
  getAll(): Promise<ShoppingList[]>;
  getById(id: string): Promise<ShoppingList | undefined>;
  getRecent(limit: number): Promise<ShoppingList[]>;
  getTemplates(): Promise<ShoppingList[]>;
  create(input: CreateShoppingListInput, userEmail: string): Promise<ShoppingList>;
  createWithItems(
    input: CreateShoppingListInput,
    items: Omit<CreateShoppingItemInput, "shoppingListId">[],
    userEmail: string,
  ): Promise<{ list: ShoppingList; items: ShoppingItem[] }>;
  update(id: string, patch: UpdateShoppingListInput): Promise<ShoppingList>;
  delete(id: string): Promise<void>;
}
