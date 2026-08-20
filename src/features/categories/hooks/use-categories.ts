"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api/client";
import type { Category, CreateCategoryInput } from "@/domain/models/category";

export function useCategories() {
  const [categories, setCategories] = useState<Category[] | undefined>(undefined);

  useEffect(() => {
    apiFetch<Category[]>("/api/v1/categories").then(setCategories).catch(() => setCategories([]));
  }, []);

  const createCategory = async (input: CreateCategoryInput): Promise<Category> => {
    const category = await apiFetch<Category>("/api/v1/categories", {
      method: "POST",
      body: JSON.stringify(input),
    });
    setCategories((current) => [...(current ?? []), category]);
    return category;
  };

  return {
    categories: categories ?? [],
    isLoading: categories === undefined,
    createCategory,
  };
}
