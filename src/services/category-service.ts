import { DexieCategoryRepository } from "@/repositories/dexie/dexie-category-repository";
import type { Category, CreateCategoryInput } from "@/domain/models/category";

export class CategoryService {
  constructor(private readonly repo = new DexieCategoryRepository()) {}

  /**
   * Debe llamarse una sola vez, fuera de cualquier liveQuery (ver
   * DatabaseBootstrap). Dexie prohíbe escribir dentro de la función
   * observada por useLiveQuery, así que sembrar las categorías por
   * defecto no puede vivir dentro de getAll().
   */
  ensureSeeded(): Promise<void> {
    return this.repo.ensureSeeded();
  }

  getAll(): Promise<Category[]> {
    return this.repo.getAll();
  }

  create(input: CreateCategoryInput): Promise<Category> {
    return this.repo.create(input);
  }

  update(id: string, patch: Partial<CreateCategoryInput>): Promise<Category> {
    return this.repo.update(id, patch);
  }

  delete(id: string): Promise<void> {
    return this.repo.delete(id);
  }
}

export const categoryService = new CategoryService();
