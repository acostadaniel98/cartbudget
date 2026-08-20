import type { IShoppingListRepository } from "@/domain/repositories/shopping-list-repository";
import type {
  CreateShoppingListInput,
  ShoppingList,
  UpdateShoppingListInput,
} from "@/domain/models/shopping-list";
import type { CreateShoppingItemInput, ShoppingItem } from "@/domain/models/shopping-item";
import { calculateItemTotal } from "@/domain/services/budget-calculator";
import { ItemStatus } from "@/domain/models/item-status";
import { generateId } from "@/lib/id";
import { getDb } from "./database";

export class DexieShoppingListRepository implements IShoppingListRepository {
  async getAll(): Promise<ShoppingList[]> {
    return getDb().shoppingLists.orderBy("fechaCreacion").reverse().toArray();
  }

  async getById(id: string): Promise<ShoppingList | undefined> {
    return getDb().shoppingLists.get(id);
  }

  async getRecent(limit: number): Promise<ShoppingList[]> {
    const all = await getDb().shoppingLists.toArray();
    return all
      .filter((list) => !list.esPlantilla)
      .sort((a, b) => b.fechaCreacion - a.fechaCreacion)
      .slice(0, limit);
  }

  async getTemplates(): Promise<ShoppingList[]> {
    const all = await getDb().shoppingLists.toArray();
    return all
      .filter((list) => list.esPlantilla)
      .sort((a, b) => b.fechaActualizacion - a.fechaActualizacion);
  }

  async create(input: CreateShoppingListInput): Promise<ShoppingList> {
    const now = Date.now();
    const list: ShoppingList = {
      id: generateId(),
      nombre: input.nombre.trim(),
      presupuesto: input.presupuesto,
      esPlantilla: input.esPlantilla ?? false,
      notas: input.notas,
      fechaCreacion: now,
      fechaActualizacion: now,
    };
    await getDb().shoppingLists.add(list);
    return list;
  }

  async createWithItems(
    input: CreateShoppingListInput,
    inputs: Omit<CreateShoppingItemInput, "shoppingListId">[],
  ): Promise<{ list: ShoppingList; items: ShoppingItem[] }> {
    const now = Date.now();
    const list: ShoppingList = {
      id: generateId(),
      nombre: input.nombre.trim(),
      presupuesto: input.presupuesto,
      esPlantilla: input.esPlantilla ?? false,
      notas: input.notas,
      fechaCreacion: now,
      fechaActualizacion: now,
    };
    const items: ShoppingItem[] = inputs.map((input, index) => {
      const cantidad = input.cantidad ?? 1;
      const precioUnitario = input.precioUnitario ?? 0;
      return {
        id: generateId(),
        shoppingListId: list.id,
        nombre: input.nombre.trim(),
        cantidad,
        precioUnitario,
        precioTotal: calculateItemTotal(cantidad, precioUnitario),
        categoria: input.categoria,
        estado: ItemStatus.PENDIENTE,
        notas: input.notas,
        orden: index,
      };
    });
    const db = getDb();
    await db.transaction("rw", db.shoppingLists, db.shoppingItems, async () => {
      await db.shoppingLists.add(list);
      if (items.length > 0) await db.shoppingItems.bulkAdd(items);
    });
    return { list, items };
  }

  async update(id: string, patch: UpdateShoppingListInput): Promise<ShoppingList> {
    const db = getDb();
    const existing = await db.shoppingLists.get(id);
    if (!existing) throw new Error(`Lista de compra no encontrada: ${id}`);

    const updated: ShoppingList = {
      ...existing,
      ...(patch.nombre !== undefined ? { nombre: patch.nombre.trim() } : {}),
      ...(patch.presupuesto !== undefined
        ? { presupuesto: patch.presupuesto === null ? undefined : patch.presupuesto }
        : {}),
      ...(patch.esPlantilla !== undefined ? { esPlantilla: patch.esPlantilla } : {}),
      ...(patch.notas !== undefined ? { notas: patch.notas } : {}),
      fechaActualizacion: Date.now(),
    };

    await db.shoppingLists.put(updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const db = getDb();
    await db.transaction("rw", db.shoppingLists, db.shoppingItems, async () => {
      await db.shoppingItems.where("shoppingListId").equals(id).delete();
      await db.shoppingLists.delete(id);
    });
  }
}
