import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAppUrl } from "@/lib/app-url";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next");
  const destination = next?.startsWith("/") && !next.startsWith("//") ? next : "/";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      // El código ya se usó, expiró o es inválido: no hay sesión que dejar
      // aquí. Si el enlace era para restablecer contraseña, mandar a login
      // no sirve (la persona no la recuerda, por eso está aquí): se le
      // ofrece pedir un enlace nuevo en vez de fingir que el destino
      // original va a funcionar igual.
      const fallback = destination === "/restablecer-contrasena" ? "/recuperar-contrasena" : "/login";
      const fallbackUrl = new URL(fallback, getAppUrl(request));
      if (fallback === "/login") fallbackUrl.searchParams.set("next", destination);
      return NextResponse.redirect(fallbackUrl);
    }
  }

  return NextResponse.redirect(new URL(destination, getAppUrl(request)));
}