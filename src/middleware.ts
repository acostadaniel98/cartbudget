import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return url && key ? { url, key } : null;
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const isPublicRoute =
    request.nextUrl.pathname === "/login" ||
    request.nextUrl.pathname === "/registro" ||
    request.nextUrl.pathname === "/recuperar-contrasena" ||
    request.nextUrl.pathname === "/restablecer-contrasena" ||
    request.nextUrl.pathname === "/auth/callback";
  const isApiRoute = request.nextUrl.pathname.startsWith("/api/");
  const supabaseConfig = getSupabaseConfig();

  if (!supabaseConfig) {
    if (isPublicRoute) return response;
    return NextResponse.json(
      { error: { code: "AUTH_CONFIGURATION_ERROR", message: "La autenticación no está configurada" } },
      { status: 503 },
    );
  }

  const supabase = createServerClient(
    supabaseConfig.url,
    supabaseConfig.key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  let user;
  try {
    ({
      data: { user },
    } = await supabase.auth.getUser());
  } catch {
    if (isPublicRoute) return response;
    return NextResponse.json(
      { error: { code: "AUTH_UNAVAILABLE", message: "El servicio de autenticación no está disponible" } },
      { status: 503 },
    );
  }

  if (!user && !isPublicRoute && !isApiRoute) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  if (user && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/registro")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)",
  ],
};