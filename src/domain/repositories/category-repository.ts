import type { Category, CreateCategoryInput } from "@/domain/models/category";

export interface ICategoryRepository {
  getAll(): Promise<Category[]>;
  create(input: CreateCategoryInput): Promise<Category>;
  update(id: string, patch: Partial<CreateCategoryInput>): Promise<Category>;
  delete(id: string): Promise<void>;
  ensureSeeded(): Promise<void>;
}
