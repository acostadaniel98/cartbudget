import type { IShoppingListRepository } from "@/domain/repositories/shopping-list-repository";
import type { CreateShoppingItemInput } from "@/domain/models/shopping-item";
import type {
  CreateShoppingListInput,
  ShoppingList,
  UpdateShoppingListInput,
} from "@/domain/models/shopping-list";
import { calculateItemTotal } from "@/domain/services/budget-calculator";
import { prisma } from "@/lib/prisma";
import { mapShoppingItem, mapShoppingList } from "./prisma-mappers";
import { ItemStatus as PrismaItemStatus, ListMemberRole, type PrismaClient } from "@prisma/client";

export class PrismaShoppingListRepository implements IShoppingListRepository {
  constructor(
    private readonly userId: string,
    private readonly db: PrismaClient = prisma,
  ) {}

  async getAll(): Promise<ShoppingList[]> {
    const records = await this.db.shoppingList.findMany({
      where: { members: { some: { userId: this.userId } } },
      orderBy: { fechaCreacion: "desc" },
    });
    return records.map(mapShoppingList);
  }

  async getById(id: string): Promise<ShoppingList | undefined> {
    const record = await this.db.shoppingList.findFirst({
      where: { id, members: { some: { userId: this.userId } } },
    });
    return record ? mapShoppingList(record) : undefined;
  }

  async getRecent(limit: number): Promise<ShoppingList[]> {
    const records = await this.db.shoppingList.findMany({
      where: { esPlantilla: false, members: { some: { userId: this.userId } } },
      orderBy: { fechaCreacion: "desc" },
      take: limit,
    });
    return records.map(mapShoppingList);
  }

  async getTemplates(): Promise<ShoppingList[]> {
    const records = await this.db.shoppingList.findMany({
      where: { esPlantilla: true, members: { some: { userId: this.userId } } },
      orderBy: { fechaActualizacion: "desc" },
    });
    return records.map(mapShoppingList);
  }

  async create(input: CreateShoppingListInput, userEmail: string): Promise<ShoppingList> {
    const record = await this.db.shoppingList.create({
      data: {
        userId: this.userId,
        nombre: input.nombre.trim(),
        presupuesto: input.presupuesto,
        esPlantilla: input.esPlantilla ?? false,
        notas: input.notas,
        members: { create: { userId: this.userId, email: userEmail, role: ListMemberRole.OWNER } },
      },
    });
    return mapShoppingList(record);
  }

  async createWithItems(
    input: CreateShoppingListInput,
    inputs: Omit<CreateShoppingItemInput, "shoppingListId">[],
    userEmail: string,
  ): Promise<{ list: ShoppingList; items: ReturnType<typeof mapShoppingItem>[] }> {
    const result = await this.db.$transaction(async (tx) => {
      const list = await tx.shoppingList.create({
        data: {
          userId: this.userId,
          nombre: input.nombre.trim(),
          presupuesto: input.presupuesto,
          esPlantilla: input.esPlantilla ?? false,
          notas: input.notas,
          members: { create: { userId: this.userId, email: userEmail, role: ListMemberRole.OWNER } },
        },
      });
      const items = await Promise.all(
        inputs.map((item, orden) => {
          const cantidad = item.cantidad ?? 1;
          const precioUnitario = item.precioUnitario ?? 0;
          return tx.shoppingItem.create({
            data: {
              shoppingListId: list.id,
              nombre: item.nombre.trim(),
              cantidad,
              precioUnitario,
              precioTotal: calculateItemTotal(cantidad, precioUnitario),
              categoria: item.categoria,
              estado: PrismaItemStatus.PENDIENTE,
              notas: item.notas,
              orden,
            },
          });
        }),
      );
      return { list, items };
    });
    return { list: mapShoppingList(result.list), items: result.items.map(mapShoppingItem) };
  }

  async update(id: string, patch: UpdateShoppingListInput): Promise<ShoppingList> {
    const existing = await this.db.shoppingList.findFirst({
      where: {
        id,
        members: { some: { userId: this.userId, role: { in: [ListMemberRole.OWNER, ListMemberRole.EDITOR] } } },
      },
    });
    if (!existing) throw new Error(`Lista de compra no encontrada: ${id}`);

    const record = await this.db.shoppingList.update({
      where: { id },
      data: {
        ...(patch.nombre !== undefined ? { nombre: patch.nombre.trim() } : {}),
        ...(patch.presupuesto !== undefined ? { presupuesto: patch.presupuesto } : {}),
        ...(patch.esPlantilla !== undefined ? { esPlantilla: patch.esPlantilla } : {}),
        ...(patch.notas !== undefined ? { notas: patch.notas } : {}),
      },
    });
    return mapShoppingList(record);
  }

  async delete(id: string): Promise<void> {
    await this.db.shoppingList.deleteMany({
      where: { id, members: { some: { userId: this.userId, role: ListMemberRole.OWNER } } },
    });
  }
}