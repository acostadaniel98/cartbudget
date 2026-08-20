"use client";

import { useEffect, useRef } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function useRealtimeList(
  listId: string,
  onChange: (() => void | Promise<void>) | string,
  legacyOnChange?: () => void | Promise<void>,
) {
  const changeHandler = typeof onChange === "function" ? onChange : legacyOnChange;
  if (!changeHandler) throw new Error("useRealtimeList requiere un callback de actualización");

  const onChangeRef = useRef<() => void | Promise<void>>(changeHandler);
  const channelRef = useRef<ReturnType<ReturnType<typeof createSupabaseBrowserClient>["channel"]> | null>(null);
  onChangeRef.current = changeHandler;

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let disposed = false;

    async function subscribe() {
      if (channelRef.current) {
        await supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      if (disposed) return;

      const channel = supabase.channel(`shopping-list:${listId}`, { config: { private: true } });
      channel
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "shopping_lists", filter: `id=eq.${listId}` },
          () => {
            if (!disposed) void onChangeRef.current();
          },
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "shopping_items",
            filter: `shopping_list_id=eq.${listId}`,
          },
          () => {
            if (!disposed) void onChangeRef.current();
          },
        );

      channelRef.current = channel;
      void channel.subscribe();
    }

    void subscribe();
    return () => {
      disposed = true;
      const channel = channelRef.current;
      channelRef.current = null;
      if (channel) void supabase.removeChannel(channel);
    };
  }, [listId]);
}