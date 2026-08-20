"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api/client";

export interface ListMember {
  id: string;
  email: string;
  role: "OWNER" | "EDITOR" | "VIEWER";
  createdAt: string;
  isSelf: boolean;
}

export interface PendingInvitation {
  id: string;
  role: "EDITOR" | "VIEWER";
  expiresAt: string;
  createdAt: string;
}

/**
 * Miembros e invitaciones pendientes de una compra compartida. Solo se
 * carga cuando `enabled` es true (el diálogo de "Compartir" está abierto):
 * no tiene sentido pedirlo en cada visita a la compra si nadie va a verlo.
 */
export function useListCollaboration(listId: string, enabled: boolean) {
  const [members, setMembers] = useState<ListMember[] | undefined>(undefined);
  const [invitations, setInvitations] = useState<PendingInvitation[] | undefined>(undefined);

  const loadMembers = useCallback(async () => {
    try {
      setMembers(await apiFetch<ListMember[]>(`/api/v1/lists/${listId}/members`));
    } catch {
      setMembers([]);
    }
  }, [listId]);

  const loadInvitations = useCallback(async () => {
    try {
      setInvitations(await apiFetch<PendingInvitation[]>(`/api/v1/lists/${listId}/invitations`));
    } catch {
      // Quien no es propietario recibe un 403 aquí: sencillamente no hay
      // enlaces que mostrarle, no es un error que deba interrumpir nada.
      setInvitations([]);
    }
  }, [listId]);

  useEffect(() => {
    if (!enabled) return;
    void loadMembers();
    void loadInvitations();
  }, [enabled, loadMembers, loadInvitations]);

  /** Devuelve `true` si se pudo quitar. El llamador decide qué hacer
   * después (por ejemplo, salir de la compra si era la propia persona). */
  const removeMember = async (memberId: string) => {
    const previous = members;
    setMembers((current) => current?.filter((member) => member.id !== memberId));
    try {
      await apiFetch(`/api/v1/lists/${listId}/members/${memberId}`, { method: "DELETE" });
      return true;
    } catch (error) {
      setMembers(previous);
      toast.error(error instanceof Error ? error.message : "No se pudo quitar al colaborador");
      return false;
    }
  };

  const revokeInvitation = async (invitationId: string) => {
    const previous = invitations;
    setInvitations((current) => current?.filter((invitation) => invitation.id !== invitationId));
    try {
      await apiFetch(`/api/v1/lists/${listId}/invitations/${invitationId}`, { method: "DELETE" });
      toast.success("Enlace revocado");
    } catch {
      setInvitations(previous);
      toast.error("No se pudo revocar el enlace", { description: "Inténtalo de nuevo." });
    }
  };

  const addInvitation = (invitation: PendingInvitation) => {
    setInvitations((current) => [invitation, ...(current ?? [])]);
  };

  return {
    members: members ?? [],
    isLoadingMembers: members === undefined,
    invitations: invitations ?? [],
    isLoadingInvitations: invitations === undefined,
    removeMember,
    revokeInvitation,
    addInvitation,
  };
}
