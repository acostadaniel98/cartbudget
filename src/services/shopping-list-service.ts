import type {
  CreateShoppingListInput,
  ShoppingList,
  UpdateShoppingListInput,
} from "@/domain/models/shopping-list";
import type { CreateShoppingItemInput, ShoppingItem } from "@/domain/models/shopping-item";
import { ItemStatus } from "@/domain/models/item-status";
import type { IFrequentProductRepository } from "@/domain/repositories/frequent-product-repository";
import type { IShoppingItemRepository } from "@/domain/repositories/shopping-item-repository";
import type { IShoppingListRepository } from "@/domain/repositories/shopping-list-repository";
import { localRepositories } from "./local-repositories";

/**
 * Servicio de aplicación: orquesta el repositorio de listas (y, cuando es
 * necesario, el de productos) para exponer casos de uso completos a la
 * capa de UI. No sabe nada de React: cualquier hook puede reutilizarlo tal
 * cual, y en el futuro podría exponerse igual desde un endpoint remoto sin
 * cambiar el dominio.
 */
export class ShoppingListService {
  constructor(
    private readonly lists: IShoppingListRepository,
    private readonly items: IShoppingItemRepository,
    private readonly frequentProducts: IFrequentProductRepository,
  ) {}

  getAll(): Promise<ShoppingList[]> {
    return this.lists.getAll();
  }

  getById(id: string): Promise<ShoppingList | undefined> {
    return this.lists.getById(id);
  }

  getRecent(limit = 5): Promise<ShoppingList[]> {
    return this.lists.getRecent(limit);
  }

  getTemplates(): Promise<ShoppingList[]> {
    return this.lists.getTemplates();
  }

  /** La compra activa es la más reciente que aún tiene productos pendientes. */
  async getActiveList(): Promise<ShoppingList | undefined> {
    const recent = await this.lists.getRecent(20);
    for (const list of recent) {
      const items = await this.items.getByListId(list.id);
      if (items.length === 0) continue;
      const hasPending = items.some((item) => item.estado === ItemStatus.PENDIENTE);
      if (hasPending) return list;
    }
    return undefined;
  }

  create(input: CreateShoppingListInput): Promise<ShoppingList> {
    return this.lists.create(input);
  }

  async createWithItems(
    input: CreateShoppingListInput,
    items: Omit<CreateShoppingItemInput, "shoppingListId">[],
  ): Promise<{ list: ShoppingList; items: ShoppingItem[] }> {
    const result = await this.lists.createWithItems(input, items);
    await Promise.all(
      result.items.map((item) =>
        this.frequentProducts.recordUsage({
          nombre: item.nombre,
          categoria: item.categoria,
          cantidad: item.cantidad,
        }),
      ),
    );
    return result;
  }

  update(id: string, patch: UpdateShoppingListInput): Promise<ShoppingList> {
    return this.lists.update(id, patch);
  }

  setEsPlantilla(id: string, esPlantilla: boolean): Promise<ShoppingList> {
    return this.lists.update(id, { esPlantilla });
  }

  delete(id: string): Promise<void> {
    return this.lists.delete(id);
  }

  /**
   * Duplica una compra existente (o una plantilla): crea una lista nueva con
   * los mismos productos, pero con precios en cero y estado "Pendiente",
   * lista para una nueva salida al supermercado.
   */
  async duplicate(sourceId: string, nuevoNombre?: string): Promise<ShoppingList> {
    const source = await this.lists.getById(sourceId);
    if (!source) throw new Error(`Lista no encontrada: ${sourceId}`);

    const sourceItems = await this.items.getByListId(sourceId);

    const newList = await this.lists.create({
      nombre: nuevoNombre?.trim() || `${source.nombre} (copia)`,
      presupuesto: source.presupuesto,
      esPlantilla: false,
    });

    if (sourceItems.length > 0) {
      await this.items.bulkCreate(
        sourceItems.map((item) => ({
          shoppingListId: newList.id,
          nombre: item.nombre,
          cantidad: item.cantidad,
          categoria: item.categoria,
          notas: item.notas,
        })),
      );
    }

    return newList;
  }
}

export const shoppingListService = new ShoppingListService(
  localRepositories.lists,
  localRepositories.items,
  localRepositories.frequentProducts,
);
