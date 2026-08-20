"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@/features/auth/components/auth-card";
import { getAuthErrorMessage } from "@/features/auth/lib/auth-error";
import { emailSchema, newPasswordSchema } from "@/features/auth/schemas/auth-schemas";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { SITE_CONFIG } from "@/config/site";

const registrationSchema = z.object({ email: emailSchema }).and(newPasswordSchema);

export default function RegistrationPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    const parsed = registrationSchema.safeParse({ email, password, confirmation });
    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message ?? "Revisa los datos ingresados.");
      return;
    }

    setIsSubmitting(true);
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? SITE_CONFIG.url}/auth/callback` },
    });

    if (error) {
      setMessage(getAuthErrorMessage(error, "No se pudo completar el registro. Revisa los datos e inténtalo nuevamente."));
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    if (data.session) {
      router.replace("/");
      router.refresh();
      return;
    }
    setIsSuccess(true);
    setMessage("Revisa tu correo para confirmar la cuenta.");
  }

  return (
    <AuthCard title="Crea tu cuenta" subtitle="Guarda tus compras y colabora con tu equipo.">
      {isSuccess ? (
        <div className="space-y-4">
          <p className="text-sm" role="status">
            {message}
          </p>
          <Button asChild className="w-full">
            <Link href="/login">Ir a iniciar sesión</Link>
          </Button>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <div className="space-y-2">
            <Label htmlFor="registration-email">Correo electrónico</Label>
            <Input
              id="registration-email"
              type="email"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              maxLength={254}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="registration-password">Contraseña</Label>
            <PasswordInput
              id="registration-password"
              autoComplete="new-password"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
              maxLength={128}
              aria-describedby="password-requirements"
            />
            <p id="password-requirements" className="text-muted-foreground text-xs">
              Usa al menos 8 caracteres, una mayúscula, una minúscula y un número.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="registration-confirmation">Confirmar contraseña</Label>
            <PasswordInput
              id="registration-confirmation"
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
          {message && (
            <p className="text-destructive text-sm" role="alert">
              {message}
            </p>
          )}
          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creando cuenta…" : "Crear cuenta"}
          </Button>
          <p className="text-muted-foreground text-center text-sm">
            ¿Ya tienes cuenta?{" "}
            <Link className="text-primary font-semibold hover:underline" href="/login">
              Inicia sesión
            </Link>
          </p>
        </form>
      )}
    </AuthCard>
  );
}
