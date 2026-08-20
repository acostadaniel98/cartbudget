"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getInitials, useProfile } from "@/features/profile/hooks/use-profile";
import { displayNameSchema } from "@/features/profile/schemas/profile-schema";

export default function ProfilePage() {
  const router = useRouter();
  const { profile, isLoading, updateDisplayName, signOut } = useProfile();
  const [name, setName] = React.useState("");
  const [hasEdited, setHasEdited] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  React.useEffect(() => {
    if (profile && !hasEdited) setName(profile.displayName);
  }, [profile, hasEdited]);

  const isDirty = profile !== null && name.trim() !== profile.displayName;

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    const parsed = displayNameSchema.safeParse(name);
    if (!parsed.success) {
      setErrorMessage(parsed.error.issues[0]?.message ?? "Revisa el nombre ingresado.");
      return;
    }

    setIsSaving(true);
    try {
      await updateDisplayName(parsed.data);
      setName(parsed.data);
      setHasEdited(false);
      toast.success("Perfil actualizado");
    } catch {
      setErrorMessage("No se pudo guardar el nombre. Inténtalo de nuevo.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSignOut() {
    setIsSigningOut(true);
    await signOut();
    router.replace("/login");
    router.refresh();
  }

  if (isLoading) {
    return (
      <div className="space-y-6 px-4 pb-6">
        <PageHeader title="Tu perfil" showBack />
        <div
          className="bg-muted h-40 animate-pulse rounded-2xl"
          role="status"
          aria-label="Cargando perfil"
        />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-6 px-4 pb-6">
        <PageHeader title="Tu perfil" showBack />
        <p className="text-muted-foreground text-sm">No se pudo cargar tu perfil.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 pb-6">
      <PageHeader title="Tu perfil" showBack />

      <div className="border-border bg-card flex items-center gap-4 rounded-2xl border p-5 shadow-sm">
        <div className="bg-primary text-primary-foreground font-display flex size-16 shrink-0 items-center justify-center rounded-full text-xl font-bold">
          {getInitials(profile)}
        </div>
        <div className="min-w-0">
          <p className="font-display truncate text-lg font-bold">{profile.displayName || "Sin nombre"}</p>
          <p className="text-muted-foreground truncate text-sm">{profile.email}</p>
        </div>
      </div>

      <form
        onSubmit={handleSave}
        className="border-border bg-card space-y-4 rounded-2xl border p-5 shadow-sm"
      >
        <div className="space-y-1.5">
          <Label htmlFor="perfil-nombre">Nombre</Label>
          <Input
            id="perfil-nombre"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setHasEdited(true);
            }}
            placeholder="¿Cómo quieres que te llamemos?"
            maxLength={40}
          />
          <p className="text-muted-foreground text-xs">
            Puedes dejarlo en blanco si prefieres no personalizarlo.
          </p>
        </div>
        {errorMessage && (
          <p className="text-destructive text-sm" role="alert">
            {errorMessage}
          </p>
        )}
        <Button type="submit" disabled={!isDirty || isSaving}>
          {isSaving ? "Guardando…" : "Guardar cambios"}
        </Button>
      </form>

      <div className="border-border bg-card space-y-3 rounded-2xl border p-5 shadow-sm">
        <div>
          <p className="font-display font-bold">Sesión</p>
          <p className="text-muted-foreground text-sm">Cierra tu sesión en este dispositivo.</p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleSignOut}
          disabled={isSigningOut}
        >
          <LogOut /> {isSigningOut ? "Cerrando sesión…" : "Cerrar sesión"}
        </Button>
      </div>
    </div>
  );
}
