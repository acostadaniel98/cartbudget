"use client";

import * as React from "react";
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

interface DuplicateListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  defaultName: string;
  confirmLabel: string;
  onConfirm: (nombre: string) => Promise<unknown>;
}

export function DuplicateListDialog({
  open,
  onOpenChange,
  title,
  description,
  defaultName,
  confirmLabel,
  onConfirm,
}: DuplicateListDialogProps) {
  const [nombre, setNombre] = React.useState(defaultName);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open) setNombre(defaultName);
  }, [open, defaultName]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    setIsSubmitting(true);
    try {
      await onConfirm(nombre.trim());
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="duplicar-nombre">Nombre de la nueva compra</Label>
            <Input id="duplicar-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} autoFocus />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!nombre.trim() || isSubmitting}>
              {confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
