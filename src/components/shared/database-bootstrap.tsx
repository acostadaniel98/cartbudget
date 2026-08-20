"use client";

import { useEffect } from "react";
import { categoryService } from "@/services/category-service";

export function DatabaseBootstrap() {
  useEffect(() => {
    categoryService.ensureSeeded().catch(() => {});
  }, []);

  return null;
}
