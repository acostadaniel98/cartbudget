"use client";

import { useState } from "react";
import { Check, Copy, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiFetch } from "@/lib/api/client";

type ShareListDialogProps = {
  listId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ShareListDialog({ listId, open, onOpenChange }: ShareListDialogProps) {
  const [role, setRole] = useState<"EDITOR" | "VIEWER">("EDITOR");
  const [expiresInHours, setExpiresInHours] = useState("72");
  const [url, setUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const createLink = async () => {
    setIsLoading(true);
    setIsCopied(false);
    try {
      const result = await apiFetch<{ url: string }>(`/api/v1/lists/${listId}/invitations`, {
        method: "POST",
        body: JSON.stringify({ role, expiresInHours: Number(expiresInHours) }),
      });
      setUrl(result.url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo crear el enlace");
    } finally {
      setIsLoading(false);
    }
  };

  const copyLink = async () => {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setIsCopied(true);
    toast.success("Enlace copiado");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Compartir compra</DialogTitle>
          <DialogDescription>Genera un enlace temporal para comprar en conjunto.</DialogDescription>
        </DialogHeader>

        {!url ? (
          <div className="space-y-4">
            <label className="block space-y-2 text-sm font-medium">
              Permiso
              <select className="border-input bg-card h-11 w-full rounded-xl border px-3" value={role} onChange={(event) => setRole(event.target.value as "EDITOR" | "VIEWER")}>
                <option value="EDITOR">Puede agregar y actualizar productos</option>
                <option value="VIEWER">Solo puede ver la compra</option>
              </select>
            </label>
            <label className="block space-y-2 text-sm font-medium">
              Expira en
              <select className="border-input bg-card h-11 w-full rounded-xl border px-3" value={expiresInHours} onChange={(event) => setExpiresInHours(event.target.value)}>
                <option value="24">24 horas</option>
                <option value="72">3 días</option>
                <option value="168">7 días</option>
              </select>
            </label>
            <Button className="w-full" onClick={createLink} disabled={isLoading}>
              <Link2 /> {isLoading ? "Generando…" : "Generar enlace"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">Comparte este enlace con la persona que se unirá:</p>
            <div className="bg-muted rounded-xl p-3 text-sm break-all">{url}</div>
            <Button className="w-full" onClick={copyLink}>
              {isCopied ? <Check /> : <Copy />} {isCopied ? "Copiado" : "Copiar enlace"}
            </Button>
          </div>
        )}
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}