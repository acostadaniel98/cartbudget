import { DexieShoppingListRepository } from "@/repositories/dexie/dexie-shopping-list-repository";
import { DexieShoppingItemRepository } from "@/repositories/dexie/dexie-shopping-item-repository";
import {
  getAverageSpent,
  getMostPurchasedProducts,
  getMostUsedCategories,
  getPurchasesByMonth,
  getSpendByCategory,
} from "@/domain/services/statistics-calculator";
import type { ShoppingItem } from "@/domain/models/shopping-item";

export interface StatisticsData {
  productosMasComprados: ReturnType<typeof getMostPurchasedProducts>;
  promedioGastado: number;
  comprasPorMes: ReturnType<typeof getPurchasesByMonth>;
  gastoPorCategoria: ReturnType<typeof getSpendByCategory>;
  categoriasMasUtilizadas: ReturnType<typeof getMostUsedCategories>;
  totalCompras: number;
}

export class StatisticsService {
  constructor(
    private readonly lists = new DexieShoppingListRepository(),
    private readonly items = new DexieShoppingItemRepository(),
  ) {}

  async getStatistics(): Promise<StatisticsData> {
    const allLists = (await this.lists.getAll()).filter((l) => !l.esPlantilla);
    const itemsByListId = new Map<string, ShoppingItem[]>();
    const allItems: ShoppingItem[] = [];

    for (const list of allLists) {
      const listItems = await this.items.getByListId(list.id);
      itemsByListId.set(list.id, listItems);
      allItems.push(...listItems);
    }

    return {
      productosMasComprados: getMostPurchasedProducts(allItems),
      promedioGastado: getAverageSpent(allLists, itemsByListId),
      comprasPorMes: getPurchasesByMonth(allLists),
      gastoPorCategoria: getSpendByCategory(allItems),
      categoriasMasUtilizadas: getMostUsedCategories(allItems),
      totalCompras: allLists.length,
    };
  }
}

export const statisticsService = new StatisticsService();
