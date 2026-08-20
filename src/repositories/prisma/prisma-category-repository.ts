import { DEFAULT_CATEGORIES } from "@/constants/categories";
import type { Category, CreateCategoryInput } from "@/domain/models/category";
import type { ICategoryRepository } from "@/domain/repositories/category-repository";
import { prisma } from "@/lib/prisma";
import type { PrismaClient } from "@prisma/client";

function mapCategory(record: Category): Category {
  return record;
}

export class PrismaCategoryRepository implements ICategoryRepository {
  constructor(
    private readonly userId: string,
    private readonly db: PrismaClient = prisma,
  ) {}

  async ensureSeeded(): Promise<void> {
    const count = await this.db.category.count({ where: { userId: this.userId } });
    if (count > 0) return;

    await this.db.category.createMany({
      data: DEFAULT_CATEGORIES.map(({ nombre, icono, color, personalizada, orden }) => ({
        userId: this.userId,
        nombre,
        icono,
        color,
        personalizada,
        orden,
      })),
    });
  }

  async getAll(): Promise<Category[]> {
    const records = await this.db.category.findMany({
      where: { userId: this.userId },
      orderBy: { orden: "asc" },
    });
    return records.map(mapCategory);
  }

  async create(input: CreateCategoryInput): Promise<Category> {
    const last = await this.db.category.findFirst({
      where: { userId: this.userId },
      orderBy: { orden: "desc" },
      select: { orden: true },
    });
    const record = await this.db.category.create({
      data: {
        userId: this.userId,
        nombre: input.nombre.trim(),
        icono: input.icono ?? "Tag",
        color: input.color ?? "#6B7280",
        personalizada: true,
        orden: last ? last.orden + 1 : 0,
      },
    });
    return mapCategory(record);
  }

  async update(id: string, patch: Partial<CreateCategoryInput>): Promise<Category> {
    const record = await this.db.category.updateMany({
      where: { id, userId: this.userId },
      data: {
        ...(patch.nombre !== undefined ? { nombre: patch.nombre.trim() } : {}),
        ...(patch.icono !== undefined ? { icono: patch.icono } : {}),
        ...(patch.color !== undefined ? { color: patch.color } : {}),
      },
    });
    if (record.count === 0) throw new Error(`Categoría no encontrada: ${id}`);
    const updated = await this.db.category.findFirstOrThrow({ where: { id, userId: this.userId } });
    return mapCategory(updated);
  }

  async delete(id: string): Promise<void> {
    await this.db.category.deleteMany({ where: { id, userId: this.userId } });
  }
}