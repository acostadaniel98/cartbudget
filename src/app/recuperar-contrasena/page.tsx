"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@/features/auth/components/auth-card";
import { getAuthErrorMessage } from "@/features/auth/lib/auth-error";
import { emailSchema } from "@/features/auth/schemas/auth-schemas";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { SITE_CONFIG } from "@/config/site";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setErrorMessage(parsed.error.issues[0]?.message ?? "Ingresa un correo válido.");
      return;
    }

    setIsSubmitting(true);
    const supabase = createSupabaseBrowserClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? SITE_CONFIG.url;
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: `${appUrl}/auth/callback?next=/restablecer-contrasena`,
    });
    setIsSubmitting(false);

    if (error) {
      setErrorMessage(getAuthErrorMessage(error, "No se pudo enviar el enlace. Inténtalo de nuevo."));
      return;
    }

    // Mismo mensaje exista o no la cuenta: así nadie puede usar este
    // formulario para averiguar qué correos están registrados.
    setIsSent(true);
  }

  return (
    <AuthCard
      title="Recupera tu acceso"
      subtitle="Escribe el correo de tu cuenta y te enviaremos un enlace para crear una contraseña nueva."
      footer={
        <p className="text-muted-foreground mt-6 text-center text-sm">
          <Link className="text-primary font-semibold hover:underline" href="/login">
            Volver a iniciar sesión
          </Link>
        </p>
      }
    >
      {isSent ? (
        <div className="space-y-4">
          <div className="bg-secondary flex items-start gap-3 rounded-2xl p-4">
            <Mail className="text-primary mt-0.5 size-5 shrink-0" aria-hidden="true" />
            <p className="text-sm" role="status">
              Si <strong>{email}</strong> tiene una cuenta con nosotros, te enviamos un enlace para
              restablecer la contraseña. Revisa también la carpeta de spam.
            </p>
          </div>
          <Button variant="outline" className="w-full" onClick={() => setIsSent(false)}>
            Usar otro correo
          </Button>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <div className="space-y-2">
            <Label htmlFor="forgot-email">Correo electrónico</Label>
            <Input
              id="forgot-email"
              type="email"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              autoFocus
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              maxLength={254}
            />
          </div>
          {errorMessage && (
            <p className="text-destructive text-sm" role="alert">
              {errorMessage}
            </p>
          )}
          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enviando…" : "Enviar enlace"}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
