"use client";

import * as React from "react";
import { Tag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { Category } from "@/domain/models/category";

const COLOR_SWATCHES = [
  "#2F6B4F",
  "#E8A33D",
  "#3B82F6",
  "#DC2626",
  "#8B5CF6",
  "#0EA5E9",
  "#EA580C",
  "#DB2777",
];

interface NewCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (input: { nombre: string; color: string }) => Promise<Category>;
  onCreated: (category: Category) => void;
}

export function NewCategoryDialog({ open, onOpenChange, onCreate, onCreated }: NewCategoryDialogProps) {
  const [nombre, setNombre] = React.useState("");
  const [color, setColor] = React.useState(COLOR_SWATCHES[0]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    setIsSubmitting(true);
    try {
      const category = await onCreate({ nombre, color });
      onCreated(category);
      setNombre("");
      setColor(COLOR_SWATCHES[0]);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva categoría</DialogTitle>
          <DialogDescription>Créala una vez y úsala en todas tus compras.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="categoria-nombre">Nombre</Label>
            <Input
              id="categoria-nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Snacks"
              autoFocus
              maxLength={30}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {COLOR_SWATCHES.map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  aria-label={`Elegir color ${swatch}`}
                  onClick={() => setColor(swatch)}
                  className={cn(
                    "flex size-10 items-center justify-center rounded-full border-2 transition-transform",
                    color === swatch ? "scale-110 border-foreground" : "border-transparent",
                  )}
                  style={{ backgroundColor: swatch }}
                >
                  {color === swatch && <Tag className="size-4 text-white" strokeWidth={2.5} />}
                </button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!nombre.trim() || isSubmitting}>
              Crear categoría
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
