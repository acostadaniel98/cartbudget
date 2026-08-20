"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const registrationSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(128, "La contraseña es demasiado larga")
    .regex(/[A-Z]/, "La contraseña debe incluir una mayúscula")
    .regex(/[a-z]/, "La contraseña debe incluir una minúscula")
    .regex(/[0-9]/, "La contraseña debe incluir un número"),
  confirmation: z.string().min(8).max(128),
}).refine((values) => values.password === values.confirmation, {
  path: ["confirmation"],
  message: "Las contraseñas no coinciden",
});

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
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      setMessage("No se pudo completar el registro. Revisa los datos e inténtalo nuevamente.");
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
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <section className="bg-card w-full max-w-md rounded-3xl border p-6 shadow-sm sm:p-8">
        <Image src="/icons/ABLogo.png" alt="CartBudget" width={64} height={64} className="size-16 rounded-2xl" priority />
        <div className="mt-5 mb-8 space-y-2">
          <p className="text-muted-foreground text-sm font-semibold">CartBudget</p>
          <h1 className="font-display text-3xl font-extrabold">Crea tu cuenta</h1>
          <p className="text-muted-foreground text-sm">Guarda tus compras y colabora con tu equipo.</p>
        </div>

        {isSuccess ? (
          <div className="space-y-4">
            <p className="text-sm" role="status">{message}</p>
            <Button asChild className="w-full"><Link href="/login">Ir a iniciar sesión</Link></Button>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="space-y-2">
              <Label htmlFor="registration-email">Correo electrónico</Label>
              <Input id="registration-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={254} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registration-password">Contraseña</Label>
              <PasswordInput id="registration-password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} maxLength={128} aria-describedby="password-requirements" />
              <p id="password-requirements" className="text-muted-foreground text-xs">Usa al menos 8 caracteres, una mayúscula, una minúscula y un número.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="registration-confirmation">Confirmar contraseña</Label>
              <PasswordInput id="registration-confirmation" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required minLength={8} maxLength={128} />
            </div>
            {message && <p className="text-destructive text-sm" role="alert">{message}</p>}
            <Button className="w-full" type="submit" disabled={isSubmitting}>{isSubmitting ? "Creando cuenta…" : "Crear cuenta"}</Button>
            <p className="text-muted-foreground text-center text-sm">¿Ya tienes cuenta? <Link className="text-primary font-semibold hover:underline" href="/login">Inicia sesión</Link></p>
          </form>
        )}
      </section>
    </main>
  );
}