import type {
  CreateShoppingItemInput,
  ShoppingItem,
  UpdateShoppingItemInput,
} from "@/domain/models/shopping-item";
import { ItemStatus } from "@/domain/models/item-status";
import type { IFrequentProductRepository } from "@/domain/repositories/frequent-product-repository";
import type { IShoppingItemRepository } from "@/domain/repositories/shopping-item-repository";

/**
 * Servicio de aplicación para productos dentro de una lista de compra.
 * Además de delegar en el repositorio, se encarga de registrar el uso en
 * "productos frecuentes" cada vez que se agrega o compra un producto, para
 * que las sugerencias mejoren con el tiempo.
 */
export class ShoppingItemService {
  constructor(
    private readonly items: IShoppingItemRepository,
    private readonly frequentProducts: IFrequentProductRepository,
  ) {}

  getByListId(shoppingListId: string): Promise<ShoppingItem[]> {
    return this.items.getByListId(shoppingListId);
  }

  async add(input: CreateShoppingItemInput): Promise<ShoppingItem> {
    const item = await this.items.create(input);
    await this.frequentProducts.recordUsage({
      nombre: item.nombre,
      categoria: item.categoria,
      cantidad: item.cantidad,
    });
    return item;
  }

  async addMany(inputs: CreateShoppingItemInput[]): Promise<ShoppingItem[]> {
    const created = await this.items.bulkCreate(inputs);
    await Promise.all(
      created.map((item) =>
        this.frequentProducts.recordUsage({
          nombre: item.nombre,
          categoria: item.categoria,
          cantidad: item.cantidad,
        }),
      ),
    );
    return created;
  }

  update(id: string, patch: UpdateShoppingItemInput): Promise<ShoppingItem> {
    return this.items.update(id, patch);
  }

  async markPurchased(id: string, cantidad: number, precioUnitario: number): Promise<ShoppingItem> {
    const updated = await this.items.update(id, {
      cantidad,
      precioUnitario,
      estado: ItemStatus.COMPRADO,
    });
    await this.frequentProducts.recordUsage({
      nombre: updated.nombre,
      categoria: updated.categoria,
      cantidad: updated.cantidad,
      precioUnitario: updated.precioUnitario,
    });
    return updated;
  }

  markNotFound(id: string): Promise<ShoppingItem> {
    return this.items.update(id, { estado: ItemStatus.NO_ENCONTRADO });
  }

  markPending(id: string): Promise<ShoppingItem> {
    return this.items.update(id, { estado: ItemStatus.PENDIENTE });
  }

  reorder(shoppingListId: string, orderedIds: string[]): Promise<void> {
    return this.items.reorder(shoppingListId, orderedIds);
  }

  delete(id: string): Promise<void> {
    return this.items.delete(id);
  }
}
