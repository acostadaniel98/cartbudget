"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { categoryService } from "@/services/category-service";
import { useMounted } from "@/hooks/use-mounted";
import type { Category, CreateCategoryInput } from "@/domain/models/category";

export function useCategories() {
  const mounted = useMounted();

  const categories = useLiveQuery(async () => {
    if (!mounted) return undefined;
    return categoryService.getAll();
  }, [mounted]);

  const createCategory = async (input: CreateCategoryInput): Promise<Category> => {
    return categoryService.create(input);
  };

  return {
    categories: categories ?? [],
    isLoading: categories === undefined,
    createCategory,
  };
}
