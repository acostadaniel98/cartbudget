"use client";

import { useEffect, useRef } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type ChangeHandler = () => void | Promise<void>;
type RealtimeChannel = ReturnType<ReturnType<typeof createSupabaseBrowserClient>["channel"]>;
type ChannelEntry = { channel: RealtimeChannel; handlers: Set<ChangeHandler> };

const channels = new Map<string, ChannelEntry>();

function notify(entry: ChannelEntry) {
  for (const handler of entry.handlers) void handler();
}

export function useRealtimeList(
  listId: string,
  onChange: ChangeHandler | string,
  legacyOnChange?: ChangeHandler,
) {
  const handler = typeof onChange === "function" ? onChange : legacyOnChange;
  if (!handler) throw new Error("useRealtimeList requiere un callback de actualización");

  const handlerRef = useRef<ChangeHandler>(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let entry = channels.get(listId);

    if (!entry) {
      entry = {
        channel: supabase
          .channel(`shopping-list:${listId}`, { config: { private: true } })
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "shopping_lists", filter: `id=eq.${listId}` },
            () => entry && notify(entry),
          )
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "shopping_items",
              filter: `shopping_list_id=eq.${listId}`,
            },
            () => entry && notify(entry),
          ),
        handlers: new Set(),
      };
      channels.set(listId, entry);
      void entry.channel.subscribe((status: string) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") channels.delete(listId);
      });
    }

    const registeredHandler = () => handlerRef.current();
    entry.handlers.add(registeredHandler);

    return () => {
      const current = channels.get(listId);
      if (!current) return;
      current.handlers.delete(registeredHandler);
      if (current.handlers.size === 0) {
        channels.delete(listId);
        void supabase.removeChannel(current.channel);
      }
    };
  }, [listId]);
}