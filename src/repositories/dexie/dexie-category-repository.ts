import type { ICategoryRepository } from "@/domain/repositories/category-repository";
import type { Category, CreateCategoryInput } from "@/domain/models/category";
import { DEFAULT_CATEGORIES } from "@/constants/categories";
import { generateId } from "@/lib/id";
import { getDb } from "./database";

export class DexieCategoryRepository implements ICategoryRepository {
  async ensureSeeded(): Promise<void> {
    const db = getDb();
    const count = await db.categories.count();
    if (count > 0) return;

    await db.categories.bulkAdd(DEFAULT_CATEGORIES);
  }

  async getAll(): Promise<Category[]> {
    const all = await getDb().categories.toArray();
    return all.sort((a, b) => a.orden - b.orden);
  }

  async create(input: CreateCategoryInput): Promise<Category> {
    const db = getDb();
    const existing = await db.categories.toArray();
    const category: Category = {
      id: generateId(),
      nombre: input.nombre.trim(),
      icono: input.icono ?? "Tag",
      color: input.color ?? "#6B7280",
      personalizada: true,
      orden: existing.length,
    };
    await db.categories.add(category);
    return category;
  }

  async update(id: string, patch: Partial<CreateCategoryInput>): Promise<Category> {
    const db = getDb();
    const existing = await db.categories.get(id);
    if (!existing) throw new Error(`Categoría no encontrada: ${id}`);

    const updated: Category = {
      ...existing,
      ...(patch.nombre !== undefined ? { nombre: patch.nombre.trim() } : {}),
      ...(patch.icono !== undefined ? { icono: patch.icono } : {}),
      ...(patch.color !== undefined ? { color: patch.color } : {}),
    };
    await db.categories.put(updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await getDb().categories.delete(id);
  }
}
