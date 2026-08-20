"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function LoginPage() {
  const router = useRouter();
  const nextPath = new URLSearchParams(typeof window === "undefined" ? "" : window.location.search).get("next");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErrorMessage("El correo o la contraseña no son correctos.");
      setIsSubmitting(false);
      return;
    }

    const destination = nextPath?.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/";
    router.replace(destination);
    router.refresh();
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <section className="bg-card w-full max-w-md rounded-3xl border p-6 shadow-sm sm:p-8">
        <div className="mb-8 space-y-3">
          <Image src="/icons/ABLogo.png" alt="CartBudget" width={64} height={64} className="size-16 rounded-2xl" priority />
          <div>
            <p className="text-muted-foreground text-sm font-semibold">CartBudget</p>
            <h1 className="font-display mt-1 text-3xl font-extrabold">Inicia sesión</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Tus listas y registros estarán disponibles desde cualquier dispositivo.
            </p>
          </div>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <PasswordInput
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              required
            />
          </div>

          {errorMessage && (
            <p className="text-destructive text-sm" role="alert">
              {errorMessage}
            </p>
          )}

          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Comprobando…" : "Entrar"}
          </Button>
          <p className="text-muted-foreground text-center text-sm">
            ¿No tienes cuenta? <Link className="text-primary font-semibold hover:underline" href="/registro">Regístrate</Link>
          </p>
        </form>
      </section>
    </main>
  );
}