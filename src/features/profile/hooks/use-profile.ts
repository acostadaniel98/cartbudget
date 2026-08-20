"use client";

import { useEffect, useState } from "react";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export interface Profile {
  id: string;
  email: string;
  /** Nombre elegido por la persona. Vacío si nunca lo configuró. */
  displayName: string;
}

function mapProfile(user: User): Profile {
  const rawName = user.user_metadata?.full_name;
  return {
    id: user.id,
    email: user.email ?? "",
    displayName: typeof rawName === "string" ? rawName.trim() : "",
  };
}

/** Iniciales para mostrar como "avatar" simple, sin necesidad de foto. */
export function getInitials(profile: Pick<Profile, "displayName" | "email"> | null): string {
  const source = profile?.displayName || profile?.email || "";
  const letters = source
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return letters || "?";
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const supabase = createSupabaseBrowserClient();

    supabase.auth
      .getUser()
      .then(({ data }: { data: { user: User | null } }) => {
        if (!active) return;
        setProfile(data.user ? mapProfile(data.user) : null);
      })
      .catch(() => active && setProfile(null))
      .finally(() => active && setIsLoading(false));

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        if (!active) return;
        setProfile(session?.user ? mapProfile(session.user) : null);
      },
    );

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const updateDisplayName = async (name: string) => {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.auth.updateUser({ data: { full_name: name } });
    if (error) throw error;
    if (data.user) setProfile(mapProfile(data.user));
  };

  const signOut = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
  };

  return { profile, isLoading, updateDisplayName, signOut };
}
