"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Check, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api/client";
import { ROUTES } from "@/constants/routes";
import { SITE_CONFIG } from "@/config/site";

export default function ShareInvitationPage({ params }: { params: Promise<{ code: string }> }) {
  const router = useRouter();
  const [code, setCode] = useState<string | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "accepted" | "error">("loading");
  const [message, setMessage] = useState("Comprobando invitación…");

  useEffect(() => {
    params.then(({ code: invitationCode }) => {
      setCode(invitationCode);
      setState("ready");
      setMessage("Te han invitado a colaborar en una lista de compras.");
    });
  }, [params]);

  const accept = async () => {
    if (!code) return;
    setState("loading");
    setMessage("Uniéndote a la lista…");
    try {
      const result = await apiFetch<{ listId: string }>(`/api/v1/invitations/${code}`, {
        method: "POST",
      });
      setState("accepted");
      setMessage("Ya puedes comprar en conjunto.");
      router.replace(ROUTES.compra(result.listId));
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "La invitación no está disponible.");
    }
  };

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <section className="bg-card w-full max-w-md rounded-3xl border p-6 text-center shadow-sm sm:p-8">
        <Image src="/icons/ABLogo.png" alt={SITE_CONFIG.nombre} width={80} height={80} className="mx-auto size-20 rounded-3xl" priority />
        <div className="mt-6 space-y-3">
          <div className="text-primary mx-auto flex size-12 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-950">
            {state === "accepted" ? <Check aria-hidden="true" /> : <UsersRound aria-hidden="true" />}
          </div>
          <h1 className="font-display text-2xl font-extrabold">Compartir compra</h1>
          <p className="text-muted-foreground text-sm">{message}</p>
        </div>
        {state === "ready" && (
          <Button className="mt-8 w-full" onClick={accept}>
            Unirme a la compra
          </Button>
        )}
        {state === "error" && (
          <Button className="mt-8 w-full" variant="outline" onClick={() => router.replace("/")}>
            Ir al inicio
          </Button>
        )}
      </section>
    </main>
  );
}