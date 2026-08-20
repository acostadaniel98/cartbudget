import type {
  CreateShoppingItemInput,
  ShoppingItem,
  UpdateShoppingItemInput,
} from "@/domain/models/shopping-item";
import { ItemStatus } from "@/domain/models/item-status";
import { calculateItemTotal } from "@/domain/services/budget-calculator";
import type { IShoppingItemRepository } from "@/domain/repositories/shopping-item-repository";
import { prisma } from "@/lib/prisma";
import { ItemStatus as PrismaItemStatus, ListMemberRole, type PrismaClient } from "@prisma/client";
import { mapShoppingItem } from "./prisma-mappers";

export class PrismaShoppingItemRepository implements IShoppingItemRepository {
  constructor(
    private readonly userId: string,
    private readonly db: PrismaClient = prisma,
  ) {}

  private async assertCanEditList(shoppingListId: string) {
    const list = await this.db.shoppingList.findFirst({
      where: {
        id: shoppingListId,
        members: {
          some: {
            userId: this.userId,
            role: { in: [ListMemberRole.OWNER, ListMemberRole.EDITOR] },
          },
        },
      },
      select: { id: true },
    });
    if (!list) throw new Error(`Lista de compra no encontrada: ${shoppingListId}`);
  }

  async getByListId(shoppingListId: string): Promise<ShoppingItem[]> {
    const records = await this.db.shoppingItem.findMany({
      where: { shoppingListId, shoppingList: { members: { some: { userId: this.userId } } } },
      orderBy: { orden: "asc" },
    });
    return records.map(mapShoppingItem);
  }

  async getById(id: string): Promise<ShoppingItem | undefined> {
    const record = await this.db.shoppingItem.findFirst({
      where: { id, shoppingList: { members: { some: { userId: this.userId } } } },
    });
    return record ? mapShoppingItem(record) : undefined;
  }

  private async getNextOrder(shoppingListId: string): Promise<number> {
    const last = await this.db.shoppingItem.findFirst({
      where: { shoppingListId, shoppingList: { members: { some: { userId: this.userId, role: { in: [ListMemberRole.OWNER, ListMemberRole.EDITOR] } } } } },
      orderBy: { orden: "desc" },
      select: { orden: true },
    });
    return last ? last.orden + 1 : 0;
  }

  private async assertListOwned(shoppingListId: string): Promise<void> {
    const list = await this.db.shoppingList.findFirst({
      where: { id: shoppingListId, userId: this.userId },
      select: { id: true },
    });
    if (!list) throw new Error(`Lista de compra no encontrada: ${shoppingListId}`);
  }

  async create(input: CreateShoppingItemInput): Promise<ShoppingItem> {
    await this.assertCanEditList(input.shoppingListId);
    await this.assertListOwned(input.shoppingListId);
    const orden = await this.getNextOrder(input.shoppingListId);
    const cantidad = input.cantidad ?? 1;
    const precioUnitario = input.precioUnitario ?? 0;
    const record = await this.db.shoppingItem.create({
      data: {
        shoppingList: { connect: { id: input.shoppingListId } },
        nombre: input.nombre.trim(),
        cantidad,
        precioUnitario,
        precioTotal: calculateItemTotal(cantidad, precioUnitario),
        categoria: input.categoria,
        estado: PrismaItemStatus.PENDIENTE,
        notas: input.notas,
        orden,
      },
    });
    return mapShoppingItem(record);
  }

  async bulkCreate(inputs: CreateShoppingItemInput[]): Promise<ShoppingItem[]> {
    if (inputs.length === 0) return [];
    if (inputs.some((input) => input.shoppingListId !== inputs[0].shoppingListId)) {
      throw new Error("Todos los productos deben pertenecer a la misma lista");
    }
    await this.assertCanEditList(inputs[0].shoppingListId);
    await this.assertListOwned(inputs[0].shoppingListId);
    const startOrder = await this.getNextOrder(inputs[0].shoppingListId);
    const records = await this.db.$transaction(
      inputs.map((input, index) => {
        const cantidad = input.cantidad ?? 1;
        const precioUnitario = input.precioUnitario ?? 0;
        return this.db.shoppingItem.create({
          data: {
            shoppingList: { connect: { id: input.shoppingListId } },
            nombre: input.nombre.trim(),
            cantidad,
            precioUnitario,
            precioTotal: calculateItemTotal(cantidad, precioUnitario),
            categoria: input.categoria,
            estado: PrismaItemStatus.PENDIENTE,
            notas: input.notas,
            orden: startOrder + index,
          },
        });
      }),
    );
    return records.map(mapShoppingItem);
  }

  async update(id: string, patch: UpdateShoppingItemInput): Promise<ShoppingItem> {
    const existing = await this.db.shoppingItem.findFirst({
      where: { id, shoppingList: { members: { some: { userId: this.userId, role: { in: [ListMemberRole.OWNER, ListMemberRole.EDITOR] } } } } },
    });
    if (!existing) throw new Error(`Producto no encontrado: ${id}`);

    const cantidad = patch.cantidad ?? Number(existing.cantidad);
    const precioUnitario = patch.precioUnitario ?? Number(existing.precioUnitario);
    const record = await this.db.shoppingItem.update({
      where: { id },
      data: {
        ...(patch.nombre !== undefined ? { nombre: patch.nombre.trim() } : {}),
        cantidad,
        precioUnitario,
        precioTotal: calculateItemTotal(cantidad, precioUnitario),
        ...(patch.categoria !== undefined ? { categoria: patch.categoria } : {}),
        ...(patch.estado !== undefined ? { estado: patch.estado as PrismaItemStatus } : {}),
        ...(patch.notas !== undefined ? { notas: patch.notas } : {}),
        ...(patch.orden !== undefined ? { orden: patch.orden } : {}),
        ...(patch.estado === ItemStatus.COMPRADO && existing.estado !== PrismaItemStatus.COMPRADO
          ? { fechaCompra: new Date() }
          : {}),
      },
    });
    return mapShoppingItem(record);
  }

  async reorder(shoppingListId: string, orderedIds: string[]): Promise<void> {
    await this.db.$transaction(
      orderedIds.map((id, orden) =>
        this.db.shoppingItem.updateMany({
          where: { id, shoppingListId, shoppingList: { members: { some: { userId: this.userId, role: { in: [ListMemberRole.OWNER, ListMemberRole.EDITOR] } } } } },
          data: { orden },
        }),
      ),
    );
  }

  async delete(id: string): Promise<void> {
    await this.db.shoppingItem.deleteMany({
      where: { id, shoppingList: { members: { some: { userId: this.userId, role: { in: [ListMemberRole.OWNER, ListMemberRole.EDITOR] } } } } },
    });
  }

  async deleteByListId(shoppingListId: string): Promise<void> {
    await this.db.shoppingItem.deleteMany({
      where: { shoppingListId, shoppingList: { members: { some: { userId: this.userId, role: { in: [ListMemberRole.OWNER, ListMemberRole.EDITOR] } } } } },
    });
  }
}