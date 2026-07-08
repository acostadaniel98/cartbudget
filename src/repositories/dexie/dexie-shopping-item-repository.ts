import type { IShoppingItemRepository } from "@/domain/repositories/shopping-item-repository";
import type {
  CreateShoppingItemInput,
  ShoppingItem,
  UpdateShoppingItemInput,
} from "@/domain/models/shopping-item";
import { ItemStatus } from "@/domain/models/item-status";
import { calculateItemTotal } from "@/domain/services/budget-calculator";
import { generateId } from "@/lib/id";
import { getDb } from "./database";

export class DexieShoppingItemRepository implements IShoppingItemRepository {
  async getByListId(shoppingListId: string): Promise<ShoppingItem[]> {
    const items = await getDb()
      .shoppingItems.where("shoppingListId")
      .equals(shoppingListId)
      .toArray();
    return items.sort((a, b) => a.orden - b.orden);
  }

  async getById(id: string): Promise<ShoppingItem | undefined> {
    return getDb().shoppingItems.get(id);
  }

  private async nextOrder(shoppingListId: string): Promise<number> {
    const existing = await this.getByListId(shoppingListId);
    return existing.length === 0 ? 0 : Math.max(...existing.map((i) => i.orden)) + 1;
  }

  async create(input: CreateShoppingItemInput): Promise<ShoppingItem> {
    const cantidad = input.cantidad ?? 1;
    const precioUnitario = input.precioUnitario ?? 0;
    const orden = await this.nextOrder(input.shoppingListId);

    const item: ShoppingItem = {
      id: generateId(),
      shoppingListId: input.shoppingListId,
      nombre: input.nombre.trim(),
      cantidad,
      precioUnitario,
      precioTotal: calculateItemTotal(cantidad, precioUnitario),
      categoria: input.categoria,
      estado: ItemStatus.PENDIENTE,
      notas: input.notas,
      orden,
    };

    await getDb().shoppingItems.add(item);
    return item;
  }

  async bulkCreate(inputs: CreateShoppingItemInput[]): Promise<ShoppingItem[]> {
    if (inputs.length === 0) return [];
    const listId = inputs[0].shoppingListId;
    const startOrder = await this.nextOrder(listId);

    const items: ShoppingItem[] = inputs.map((input, index) => {
      const cantidad = input.cantidad ?? 1;
      const precioUnitario = input.precioUnitario ?? 0;
      return {
        id: generateId(),
        shoppingListId: input.shoppingListId,
        nombre: input.nombre.trim(),
        cantidad,
        precioUnitario,
        precioTotal: calculateItemTotal(cantidad, precioUnitario),
        categoria: input.categoria,
        estado: ItemStatus.PENDIENTE,
        notas: input.notas,
        orden: startOrder + index,
      };
    });

    await getDb().shoppingItems.bulkAdd(items);
    return items;
  }

  async update(id: string, patch: UpdateShoppingItemInput): Promise<ShoppingItem> {
    const db = getDb();
    const existing = await db.shoppingItems.get(id);
    if (!existing) throw new Error(`Producto no encontrado: ${id}`);

    const cantidad = patch.cantidad ?? existing.cantidad;
    const precioUnitario = patch.precioUnitario ?? existing.precioUnitario;
    const estadoCambioAComprado =
      patch.estado === ItemStatus.COMPRADO && existing.estado !== ItemStatus.COMPRADO;

    const updated: ShoppingItem = {
      ...existing,
      ...(patch.nombre !== undefined ? { nombre: patch.nombre.trim() } : {}),
      cantidad,
      precioUnitario,
      precioTotal: calculateItemTotal(cantidad, precioUnitario),
      ...(patch.categoria !== undefined ? { categoria: patch.categoria } : {}),
      ...(patch.estado !== undefined ? { estado: patch.estado } : {}),
      ...(patch.notas !== undefined ? { notas: patch.notas } : {}),
      ...(patch.orden !== undefined ? { orden: patch.orden } : {}),
      ...(estadoCambioAComprado ? { fechaCompra: Date.now() } : {}),
    };

    await db.shoppingItems.put(updated);
    return updated;
  }

  async reorder(shoppingListId: string, orderedIds: string[]): Promise<void> {
    const db = getDb();
    await db.transaction("rw", db.shoppingItems, async () => {
      await Promise.all(
        orderedIds.map((id, index) => db.shoppingItems.update(id, { orden: index })),
      );
    });
  }

  async delete(id: string): Promise<void> {
    await getDb().shoppingItems.delete(id);
  }

  async deleteByListId(shoppingListId: string): Promise<void> {
    await getDb().shoppingItems.where("shoppingListId").equals(shoppingListId).delete();
  }
}
