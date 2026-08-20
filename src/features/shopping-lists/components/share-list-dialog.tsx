"use client";

import { useState } from "react";
import { Check, Copy, Link2, LogOut, ShieldOff, UserRound, Users, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiFetch } from "@/lib/api/client";
import { formatDate } from "@/lib/format";
import {
  useListCollaboration,
  type PendingInvitation,
} from "@/features/shopping-lists/hooks/use-list-collaboration";
import type { ListRole } from "@/features/shopping-lists/hooks/use-shopping-list";

const ROLE_LABELS: Record<string, string> = {
  OWNER: "Propietario",
  EDITOR: "Puede editar",
  VIEWER: "Solo puede ver",
};

type ShareListDialogProps = {
  listId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: ListRole | undefined;
  /** Se llama cuando la persona se quita a sí misma de la compra: ya no
   * tiene acceso, así que la pantalla que la contiene debe navegar fuera. */
  onLeft?: () => void;
};

export function ShareListDialog({ listId, open, onOpenChange, role, onLeft }: ShareListDialogProps) {
  const isOwner = role === "OWNER";
  const {
    members,
    isLoadingMembers,
    invitations,
    isLoadingInvitations,
    removeMember,
    updateMemberRole,
    revokeInvitation,
    addInvitation,
  } = useListCollaboration(listId, open);

  const [inviteRole, setInviteRole] = useState<"EDITOR" | "VIEWER">("EDITOR");
  const [expiresInHours, setExpiresInHours] = useState("72");
  const [url, setUrl] = useState<string | null>(null);
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const selfMember = members.find((member) => member.isSelf);

  const createLink = async () => {
    setIsCreatingLink(true);
    setIsCopied(false);
    try {
      const result = await apiFetch<PendingInvitation & { url: string }>(
        `/api/v1/lists/${listId}/invitations`,
        { method: "POST", body: JSON.stringify({ role: inviteRole, expiresInHours: Number(expiresInHours) }) },
      );
      setUrl(result.url);
      addInvitation(result);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo crear el enlace");
    } finally {
      setIsCreatingLink(false);
    }
  };

  const copyLink = async () => {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setIsCopied(true);
    toast.success("Enlace copiado");
  };

  const handleRemoveMember = async (memberId: string, isSelf: boolean) => {
    const removed = await removeMember(memberId);
    if (removed && isSelf) {
      toast.success("Saliste de la compra");
      onOpenChange(false);
      onLeft?.();
    } else if (removed) {
      toast.success("Colaborador eliminado");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) {
          setUrl(null);
          setIsCopied(false);
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Comprar en conjunto</DialogTitle>
          <DialogDescription>Invita a alguien más o revisa quién ya colabora contigo.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={isOwner ? "invitar" : "miembros"}>
          <TabsList className={isOwner ? "grid grid-cols-2" : "hidden"}>
            <TabsTrigger value="invitar">Invitar</TabsTrigger>
            <TabsTrigger value="miembros">
              Miembros {members.length > 0 && `(${members.length})`}
            </TabsTrigger>
          </TabsList>

          {isOwner && (
            <TabsContent value="invitar" className="space-y-4">
              {!url ? (
                <div className="space-y-4">
                  <label className="block space-y-2 text-sm font-medium">
                    Permiso
                    <select
                      className="border-input bg-card h-11 w-full rounded-xl border px-3"
                      value={inviteRole}
                      onChange={(event) => setInviteRole(event.target.value as "EDITOR" | "VIEWER")}
                    >
                      <option value="EDITOR">Puede agregar y actualizar productos</option>
                      <option value="VIEWER">Solo puede ver la compra</option>
                    </select>
                  </label>
                  <label className="block space-y-2 text-sm font-medium">
                    Expira en
                    <select
                      className="border-input bg-card h-11 w-full rounded-xl border px-3"
                      value={expiresInHours}
                      onChange={(event) => setExpiresInHours(event.target.value)}
                    >
                      <option value="24">24 horas</option>
                      <option value="72">3 días</option>
                      <option value="168">7 días</option>
                    </select>
                  </label>
                  <Button className="w-full" onClick={createLink} disabled={isCreatingLink}>
                    <Link2 /> {isCreatingLink ? "Generando…" : "Generar enlace"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    Comparte este enlace con la persona que se unirá:
                  </p>
                  <div className="bg-muted rounded-xl p-3 text-sm break-all">{url}</div>
                  <Button className="w-full" onClick={copyLink}>
                    {isCopied ? <Check /> : <Copy />} {isCopied ? "Copiado" : "Copiar enlace"}
                  </Button>
                  <Button variant="ghost" className="w-full" onClick={() => setUrl(null)}>
                    Generar otro enlace
                  </Button>
                </div>
              )}

              <div className="space-y-2 border-t pt-4">
                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  Enlaces activos
                </p>
                {isLoadingInvitations ? (
                  <div className="bg-muted h-12 animate-pulse rounded-xl" />
                ) : invitations.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No tienes enlaces sin usar en este momento.</p>
                ) : (
                  <ul className="space-y-2">
                    {invitations.map((invitation) => (
                      <li
                        key={invitation.id}
                        className="border-border flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm"
                      >
                        <div className="min-w-0">
                          <p className="font-medium">{ROLE_LABELS[invitation.role]}</p>
                          <p className="text-muted-foreground text-xs">
                            Expira el {formatDate(new Date(invitation.expiresAt).getTime())}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Revocar enlace"
                          onClick={() => revokeInvitation(invitation.id)}
                        >
                          <ShieldOff className="text-destructive size-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </TabsContent>
          )}

          <TabsContent value="miembros" className="space-y-2">
            {isLoadingMembers ? (
              <div className="space-y-2">
                <div className="bg-muted h-14 animate-pulse rounded-xl" />
                <div className="bg-muted h-14 animate-pulse rounded-xl" />
              </div>
            ) : (
              <ul className="space-y-2">
                {members.map((member) => (
                  <li
                    key={member.id}
                    className="border-border flex items-center gap-3 rounded-xl border px-3 py-2.5"
                  >
                    <div className="bg-secondary text-secondary-foreground flex size-9 shrink-0 items-center justify-center rounded-full">
                      <UserRound className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {member.email}
                        {member.isSelf && <span className="text-muted-foreground"> (tú)</span>}
                      </p>
                      {isOwner && !member.isSelf && member.role !== "OWNER" ? (
                        <select
                          aria-label={`Permiso de ${member.email}`}
                          className="border-input bg-card mt-1 h-8 rounded-lg border px-2 text-xs"
                          value={member.role}
                          onChange={(event) =>
                            updateMemberRole(member.id, event.target.value as "EDITOR" | "VIEWER")
                          }
                        >
                          <option value="EDITOR">Puede editar</option>
                          <option value="VIEWER">Solo puede ver</option>
                        </select>
                      ) : (
                        <p className="text-muted-foreground text-xs">{ROLE_LABELS[member.role]}</p>
                      )}
                    </div>
                    {member.role !== "OWNER" && (isOwner || member.isSelf) && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={member.isSelf ? "Salir de la compra" : `Quitar a ${member.email}`}
                        onClick={() => handleRemoveMember(member.id, member.isSelf)}
                      >
                        {member.isSelf ? (
                          <LogOut className="text-destructive size-4" />
                        ) : (
                          <X className="text-destructive size-4" />
                        )}
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {!isOwner && (
              <p className="text-muted-foreground flex items-center gap-1.5 pt-1 text-xs">
                <Users className="size-3.5" /> Solo el propietario puede invitar o quitar colaboradores.
              </p>
            )}
            {selfMember && selfMember.role === "OWNER" && members.length === 1 && (
              <p className="text-muted-foreground pt-1 text-xs">
                Todavía nadie más se ha unido a esta compra.
              </p>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
