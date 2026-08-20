import * as React from "react";
import Image from "next/image";
import { SITE_CONFIG } from "@/config/site";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/** Envoltorio visual compartido por las pantallas de autenticación (login,
 * registro, recuperar y restablecer contraseña) para que las cuatro se vean
 * y se comporten exactamente igual. */
export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <section className="bg-card w-full max-w-md rounded-3xl border p-6 shadow-sm sm:p-8">
        <div className="mb-8 space-y-3">
          <Image
            src="/icons/ABLogo.png"
            alt={SITE_CONFIG.nombre}
            width={64}
            height={64}
            className="size-16 rounded-2xl"
            priority
          />
          <div>
            <p className="text-muted-foreground text-sm font-semibold">{SITE_CONFIG.nombre}</p>
            <h1 className="font-display mt-1 text-3xl font-extrabold">{title}</h1>
            {subtitle && <p className="text-muted-foreground mt-2 text-sm">{subtitle}</p>}
          </div>
        </div>
        {children}
        {footer}
      </section>
    </main>
  );
}
