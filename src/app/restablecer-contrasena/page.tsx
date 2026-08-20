"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@/features/auth/components/auth-card";
import { getAuthErrorMessage } from "@/features/auth/lib/auth-error";
import { newPasswordSchema } from "@/features/auth/schemas/auth-schemas";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Status = "checking" | "ready" | "invalid" | "success";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("checking");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // El enlace del correo (vía /auth/callback) ya debería haber dejado una
  // sesión activa. Si no la hay -es la única forma segura de confirmar el
  // enlace sin depender de parámetros en la URL, que se pueden manipular-
  // significa que expiró, ya se usó o nunca fue válido.
  useEffect(() => {
    let active = true;
    createSupabaseBrowserClient()
      .auth.getSession()
      .then(({ data }: { data: { session: unknown } }) => {
        if (!active) return;
        setStatus(data.session ? "ready" : "invalid");
      })
      .catch(() => active && setStatus("invalid"));
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const parsed = newPasswordSchema.safeParse({ password, confirmation });
    if (!parsed.success) {
      setErrorMessage(parsed.error.issues[0]?.message ?? "Revisa los datos ingresados.");
      return;
    }

    setIsSubmitting(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    setIsSubmitting(false);

    if (error) {
      setErrorMessage(
        getAuthErrorMessage(error, "No se pudo actualizar la contraseña. Inténtalo de nuevo."),
      );
      return;
    }

    setStatus("success");
  }

  if (status === "checking") {
    return (
      <AuthCard title="Restablecer contraseña">
        <p className="text-muted-foreground text-sm" role="status">
          Comprobando el enlace…
        </p>
      </AuthCard>
    );
  }

  if (status === "invalid") {
    return (
      <AuthCard
        title="Enlace no válido"
        subtitle="Este enlace ya expiró o ya fue usado. Solicita uno nuevo para continuar."
      >
        <Button asChild className="w-full">
          <Link href="/recuperar-contrasena">Solicitar nuevo enlace</Link>
        </Button>
      </AuthCard>
    );
  }

  if (status === "success") {
    return (
      <AuthCard title="Contraseña actualizada" subtitle="Ya puedes seguir usando tu cuenta con la nueva contraseña.">
        <Button
          className="w-full"
          onClick={() => {
            router.replace("/");
            router.refresh();
          }}
        >
          Ir a mis compras
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Crea una nueva contraseña" subtitle="Elige una contraseña que no hayas usado antes.">
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <div className="space-y-2">
          <Label htmlFor="new-password">Nueva contraseña</Label>
          <PasswordInput
            id="new-password"
            autoComplete="new-password"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            autoFocus
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
            maxLength={128}
            aria-describedby="new-password-requirements"
          />
          <p id="new-password-requirements" className="text-muted-foreground text-xs">
            Usa al menos 8 caracteres, una mayúscula, una minúscula y un número.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-password-confirmation">Confirmar contraseña</Label>
          <PasswordInput
            id="new-password-confirmation"
            autoComplete="new-password"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            required
            minLength={8}
            maxLength={128}
          />
        </div>
        {errorMessage && (
          <p className="text-destructive text-sm" role="alert">
            {errorMessage}
          </p>
        )}
        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando…" : "Guardar contraseña"}
        </Button>
      </form>
    </AuthCard>
  );
}
