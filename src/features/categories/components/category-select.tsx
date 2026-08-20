"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { NewCategoryDialog } from "@/features/categories/components/new-category-dialog";
import { getCategoryIcon } from "@/lib/category-icon";

interface CategorySelectProps {
  value: string;
  onChange: (categoryId: string) => void;
}

export function CategorySelect({ value, onChange }: CategorySelectProps) {
  const { categories, createCategory } = useCategories();
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  return (
    <div className="flex gap-2">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="Elige una categoría" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.icono);
            return (
              <SelectItem key={category.id} value={category.id}>
                <span className="flex items-center gap-2">
                  <Icon className="size-4" style={{ color: category.color }} />
                  {category.nombre}
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Nueva categoría"
        onClick={() => setIsCreateOpen(true)}
      >
        <Plus />
      </Button>
      <NewCategoryDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreate={createCategory}
        onCreated={(category) => onChange(category.id)}
      />
    </div>
  );
}
