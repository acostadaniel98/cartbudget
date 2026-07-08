import type {
  CreateShoppingItemInput,
  ShoppingItem,
  UpdateShoppingItemInput,
} from "@/domain/models/shopping-item";

export interface IShoppingItemRepository {
  getByListId(shoppingListId: string): Promise<ShoppingItem[]>;
  getById(id: string): Promise<ShoppingItem | undefined>;
  create(input: CreateShoppingItemInput): Promise<ShoppingItem>;
  bulkCreate(inputs: CreateShoppingItemInput[]): Promise<ShoppingItem[]>;
  update(id: string, patch: UpdateShoppingItemInput): Promise<ShoppingItem>;
  reorder(shoppingListId: string, orderedIds: string[]): Promise<void>;
  delete(id: string): Promise<void>;
  deleteByListId(shoppingListId: string): Promise<void>;
}
