import { DexieFrequentProductRepository } from "@/repositories/dexie/dexie-frequent-product-repository";
import { DexieShoppingItemRepository } from "@/repositories/dexie/dexie-shopping-item-repository";
import { DexieShoppingListRepository } from "@/repositories/dexie/dexie-shopping-list-repository";

export const localRepositories = {
  lists: new DexieShoppingListRepository(),
  items: new DexieShoppingItemRepository(),
  frequentProducts: new DexieFrequentProductRepository(),
};