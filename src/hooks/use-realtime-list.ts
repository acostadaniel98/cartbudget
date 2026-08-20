"use client";

import { useEffect, useRef } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type ChangeHandler = () => void | Promise<void>;
type SupabaseClient = ReturnType<typeof createSupabaseBrowserClient>;
type RealtimeChannel = ReturnType<SupabaseClient["channel"]>;
type ChannelEntry = {
  channel: RealtimeChannel;
  handlers: Set<ChangeHandler>;
  reconnectTimer: ReturnType<typeof setTimeout> | null;
};

const channels = new Map<string, ChannelEntry>();
const RECONNECT_DELAY_MS = 2000;
const POLL_FALLBACK_MS = 20000;

function notify(entry: ChannelEntry) {
  for (const handler of entry.handlers) void handler();
}

/**
 * (Re)abre el canal privado de una lista, mutando `entry.channel` en su
 * lugar en vez de reemplazar el objeto `entry`. Así todos los hooks que ya
 * registraron un handler en `entry.handlers` siguen viéndolo sin importar
 * cuántas veces se reconecte el canal por debajo.
 *
 * Es clave para "comprar en conjunto": la señal dentro de un súper se corta
 * seguido, y sin reintento automático el canal quedaba muerto en silencio
 * (CHANNEL_ERROR/TIMED_OUT) hasta que alguien salía de la compra y volvía a
 * entrar. Ahora se reintenta solo y, al reconectar, se fuerza un refresco
 * por si se perdió algún cambio mientras estuvo caído.
 */
function subscribeChannel(supabase: SupabaseClient, listId: string, entry: ChannelEntry) {
  entry.channel = supabase
    .channel(`shopping-list:${listId}`, { config: { private: true } })
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "shopping_lists", filter: `id=eq.${listId}` },
      () => notify(entry),
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "shopping_items", filter: `shopping_list_id=eq.${listId}` },
      () => notify(entry),
    );

  void entry.channel.subscribe((status: string) => {
    if (status !== "CHANNEL_ERROR" && status !== "TIMED_OUT") return;
    if (channels.get(listId) !== entry) return; // este canal ya fue reemplazado o cerrado

    void supabase.removeChannel(entry.channel);

    if (entry.handlers.size === 0) {
      channels.delete(listId);
      return;
    }

    entry.reconnectTimer = setTimeout(() => {
      entry.reconnectTimer = null;
      if (channels.get(listId) !== entry) return;
      subscribeChannel(supabase, listId, entry);
      notify(entry);
    }, RECONNECT_DELAY_MS);
  });
}

function getOrCreateEntry(supabase: SupabaseClient, listId: string): ChannelEntry {
  const existing = channels.get(listId);
  if (existing) return existing;

  const entry: ChannelEntry = {
    channel: null as unknown as RealtimeChannel,
    handlers: new Set(),
    reconnectTimer: null,
  };
  channels.set(listId, entry);
  subscribeChannel(supabase, listId, entry);
  return entry;
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
    const entry = getOrCreateEntry(supabase, listId);

    const registeredHandler = () => handlerRef.current();
    entry.handlers.add(registeredHandler);

    // Respaldo además del canal en vivo, no en su lugar: un WebSocket puede
    // fallar en silencio por razones ajenas a nuestro código (proxy de la
    // red, extensión del navegador, etc.) y la exigencia aquí es que los
    // colaboradores vean los cambios "sin necesidad de recargar nada" pase
    // lo que pase con esa conexión. Un sondeo ocasional, más un refresco
    // inmediato al volver a la pestaña, garantiza que eso siga siendo
    // cierto aunque el canal en vivo esté teniendo problemas.
    const pollInterval = setInterval(() => {
      if (document.visibilityState === "hidden") return;
      handlerRef.current();
    }, POLL_FALLBACK_MS);

    const handleVisible = () => {
      if (document.visibilityState === "visible") handlerRef.current();
    };
    document.addEventListener("visibilitychange", handleVisible);
    window.addEventListener("focus", handleVisible);

    return () => {
      clearInterval(pollInterval);
      document.removeEventListener("visibilitychange", handleVisible);
      window.removeEventListener("focus", handleVisible);

      entry.handlers.delete(registeredHandler);
      if (entry.handlers.size > 0) return;
      if (entry.reconnectTimer) clearTimeout(entry.reconnectTimer);
      if (channels.get(listId) === entry) {
        channels.delete(listId);
        void supabase.removeChannel(entry.channel);
      }
    };
  }, [listId]);
}
