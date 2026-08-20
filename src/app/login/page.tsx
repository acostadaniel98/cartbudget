"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@/features/auth/components/auth-card";
import { getAuthErrorMessage } from "@/features/auth/lib/auth-error";
import { emailSchema } from "@/features/auth/schemas/auth-schemas";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const MAX_ATTEMPTS_BEFORE_COOLDOWN = 5;
const COOLDOWN_SECONDS = 30;

export default function LoginPage() {
  const router = useRouter();
  const nextPath = new URLSearchParams(typeof window === "undefined" ? "" : window.location.search).get("next");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [remainingCooldown, setRemainingCooldown] = useState(0);

  // Freno del lado del cliente ante intentos repetidos: no reemplaza el
  // límite que ya aplica Supabase por IP, pero desalienta probar
  // contraseñas a mano una y otra vez desde el mismo formulario.
  useEffect(() => {
    if (!cooldownUntil) return;
    const tick = () => {
      const secondsLeft = Math.ceil((cooldownUntil - Date.now()) / 1000);
      if (secondsLeft <= 0) {
        setCooldownUntil(null);
        setRemainingCooldown(0);
        return;
      }
      setRemainingCooldown(secondsLeft);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [cooldownUntil]);

  const isLocked = cooldownUntil !== null && remainingCooldown > 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLocked) return;
    setErrorMessage(null);

    const parsedEmail = emailSchema.safeParse(email);
    if (!parsedEmail.success) {
      setErrorMessage(parsedEmail.error.issues[0]?.message ?? "Ingresa un correo válido.");
      return;
    }
    if (password.length === 0) {
      setErrorMessage("Ingresa tu contraseña.");
      return;
    }

    setIsSubmitting(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: parsedEmail.data,
      password,
    });

    if (error) {
      setIsSubmitting(false);
      // Mensaje genérico: nunca decimos si el correo existe o no, para no
      // dar pistas a alguien probando cuentas al azar.
      setErrorMessage(getAuthErrorMessage(error, "El correo o la contraseña no son correctos."));
      const attempts = failedAttempts + 1;
      setFailedAttempts(attempts);
      if (attempts >= MAX_ATTEMPTS_BEFORE_COOLDOWN) {
        setCooldownUntil(Date.now() + COOLDOWN_SECONDS * 1000);
        setFailedAttempts(0);
      }
      return;
    }

    const destination = nextPath?.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/";
    router.replace(destination);
    router.refresh();
  }

  return (
    <AuthCard
      title="Inicia sesión"
      subtitle="Tus listas y registros estarán disponibles desde cualquier dispositivo."
      footer={
        <p className="text-muted-foreground mt-6 text-center text-sm">
          ¿No tienes cuenta?{" "}
          <Link
            className="text-primary font-semibold hover:underline"
            href={nextPath ? `/registro?next=${encodeURIComponent(nextPath)}` : "/registro"}
          >
            Regístrate
          </Link>
        </p>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Contraseña</Label>
            <Link
              href="/recuperar-contrasena"
              className="text-primary text-xs font-semibold hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        {errorMessage && (
          <p className="text-destructive text-sm" role="alert">
            {errorMessage}
          </p>
        )}
        {isLocked && (
          <p className="text-muted-foreground text-sm" role="status">
            Demasiados intentos fallidos. Espera {remainingCooldown}s antes de volver a intentar.
          </p>
        )}

        <Button className="w-full" type="submit" disabled={isSubmitting || isLocked}>
          {isSubmitting ? "Comprobando…" : "Entrar"}
        </Button>
      </form>
    </AuthCard>
  );
}
