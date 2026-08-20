"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api/client";
import { useRealtimeList } from "@/hooks/use-realtime-list";
import { summarizeBudget } from "@/domain/services/budget-calculator";
import { calculateItemTotal } from "@/domain/services/budget-calculator";
import { ItemStatus } from "@/domain/models/item-status";
import { generateId } from "@/lib/id";
import type {
  CreateShoppingItemInput,
  ShoppingItem,
  UpdateShoppingItemInput,
} from "@/domain/models/shopping-item";

const REORDER_DEBOUNCE_MS = 400;

/** Cuenta cuántas operaciones en curso protegen a cada id de ser
 * sobrescrito por una recarga. Un Set simple no alcanza: reordenar y editar
 * pueden solapar el mismo producto, y si cualquiera de los dos "suelta" el
 * id al terminar, deja al otro sin protección. Con conteo, el id solo se
 * libera cuando TODAS las operaciones que lo tocaban ya terminaron. */
function usePendingIds() {
  const counts = useRef<Map<string, number>>(new Map());
  return {
    begin: (id: string) => counts.current.set(id, (counts.current.get(id) ?? 0) + 1),
    end: (id: string) => {
      const current = counts.current.get(id) ?? 0;
      if (current <= 1) counts.current.delete(id);
      else counts.current.set(id, current - 1);
    },
    has: (id: string) => (counts.current.get(id) ?? 0) > 0,
  };
}

/**
 * Estado de una lista de productos con soporte para múltiples personas
 * editando la misma compra a la vez ("comprar en conjunto").
 *
 * Tres ideas sostienen esto:
 * 1. Actualizaciones optimistas: cada acción se refleja en pantalla al
 *    instante (sin esperar la red) y solo se revierte si el servidor
 *    responde con un error. Sin esto, marcar un producto se siente lento
 *    en el súper, donde la señal suele ser mala.
 * 2. Los ids con una operación en curso se protegen (ver `usePendingIds`)
 *    de las recargas que dispara Realtime cuando OTRA persona cambia la
 *    lista al mismo tiempo: si no se protegieran, una recarga que llega a
 *    mitad de un arrastre o de una edición podría "pisar" el cambio local
 *    antes de que el propio servidor confirme la operación.
 * 3. Cada mutación que se confirma invalida cualquier recarga anterior que
 *    todavía esté en camino (vía `requestSeq`): sin esto, una carga lenta
 *    (por ejemplo la que dispara el montaje de la página) puede resolver
 *    DESPUÉS de que un producto recién agregado ya se confirmó, y como esa
 *    carga vieja no sabe nada de ese producto, lo borraría de la pantalla
 *    hasta recargar.
 */
export function useShoppingItems(shoppingListId: string, presupuesto: number | undefined) {
  const [items, setItems] = useState<ShoppingItem[] | undefined>(undefined);
  const itemsRef = useRef<ShoppingItem[]>([]);
  itemsRef.current = items ?? [];

  const requestSeq = useRef(0);
  const pendingEdits = usePendingIds();
  const pendingDeleteIds = useRef<Set<string>>(new Set());
  const pendingAddTempIds = useRef<Set<string>>(new Set());

  /** Invalida cualquier `fetchItems` en curso: su respuesta, cuando
   * llegue, se descartará por completo en vez de poder pisar el estado
   * que una mutación recién confirmada acaba de dejar. */
  const invalidateInFlightFetches = () => {
    requestSeq.current += 1;
  };

  const fetchItems = async () => {
    const seq = ++requestSeq.current;
    let data: ShoppingItem[];
    try {
      data = await apiFetch<ShoppingItem[]>(`/api/v1/lists/${shoppingListId}/items`);
    } catch {
      if (seq === requestSeq.current) setItems((current) => current ?? []);
      return;
    }
    if (seq !== requestSeq.current) return; // una respuesta más reciente (o una mutación) ya la invalidó

    setItems((current) => {
      const currentById = new Map((current ?? []).map((item) => [item.id, item]));
      const withoutOptimisticDeletes = data.filter((item) => !pendingDeleteIds.current.has(item.id));
      const merged = withoutOptimisticDeletes.map((item) =>
        pendingEdits.has(item.id) ? (currentById.get(item.id) ?? item) : item,
      );
      const stillPendingAdds = [...pendingAddTempIds.current]
        .map((tempId) => currentById.get(tempId))
        .filter((item): item is ShoppingItem => Boolean(item));
      return [...merged, ...stillPendingAdds];
    });
  };

  useRealtimeList(shoppingListId, fetchItems);

  useEffect(() => {
    setItems(undefined);
    void fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shoppingListId]);

  const resolvedItems = useMemo(() => items ?? [], [items]);

  const summary = useMemo(
    () => summarizeBudget(presupuesto, resolvedItems),
    [presupuesto, resolvedItems],
  );

  const addItem = async (input: Omit<CreateShoppingItemInput, "shoppingListId">) => {
    const tempId = `temp-${generateId()}`;
    const cantidad = input.cantidad ?? 1;
    const precioUnitario = input.precioUnitario ?? 0;
    const optimisticItem: ShoppingItem = {
      id: tempId,
      shoppingListId,
      nombre: input.nombre,
      cantidad,
      precioUnitario,
      precioTotal: calculateItemTotal(cantidad, precioUnitario),
      categoria: input.categoria,
      estado: ItemStatus.PENDIENTE,
      notas: input.notas,
      orden: (itemsRef.current.at(-1)?.orden ?? -1) + 1,
    };

    pendingAddTempIds.current.add(tempId);
    setItems((current) => [...(current ?? []), optimisticItem]);

    try {
      const created = await apiFetch<ShoppingItem>(`/api/v1/lists/${shoppingListId}/items`, {
        method: "POST",
        body: JSON.stringify(input),
      });
      setItems((current) => (current ?? []).map((item) => (item.id === tempId ? created : item)));
    } catch {
      setItems((current) => (current ?? []).filter((item) => item.id !== tempId));
      toast.error("No se pudo agregar el producto", { description: "Inténtalo de nuevo." });
    } finally {
      pendingAddTempIds.current.delete(tempId);
      invalidateInFlightFetches();
    }
  };

  const addItems = async (inputs: Omit<CreateShoppingItemInput, "shoppingListId">[]) => {
    if (inputs.length === 0) return;
    await Promise.all(inputs.map((input) => addItem(input)));
  };

  /** Aplica un patch de forma optimista y lo reconcilia con la respuesta del servidor. */
  const patchItem = async (
    id: string,
    patch: UpdateShoppingItemInput,
    buildOptimistic: (existing: ShoppingItem) => ShoppingItem,
    failureMessage: string,
  ) => {
    const previous = itemsRef.current.find((item) => item.id === id);
    if (!previous) return;

    pendingEdits.begin(id);
    setItems((current) => (current ?? []).map((item) => (item.id === id ? buildOptimistic(item) : item)));

    try {
      const updated = await apiFetch<ShoppingItem>(`/api/v1/lists/${shoppingListId}/items/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      setItems((current) => (current ?? []).map((item) => (item.id === id ? updated : item)));
    } catch {
      setItems((current) => (current ?? []).map((item) => (item.id === id ? previous : item)));
      toast.error(failureMessage, { description: "Inténtalo de nuevo." });
    } finally {
      pendingEdits.end(id);
      invalidateInFlightFetches();
    }
  };

  const updateItem = (id: string, patch: UpdateShoppingItemInput) =>
    patchItem(id, patch, (item) => ({ ...item, ...patch }), "No se pudo actualizar el producto");

  const markPurchased = (id: string, cantidad: number, precioUnitario: number) =>
    patchItem(
      id,
      { cantidad, precioUnitario, estado: ItemStatus.COMPRADO },
      (item) => ({
        ...item,
        cantidad,
        precioUnitario,
        precioTotal: calculateItemTotal(cantidad, precioUnitario),
        estado: ItemStatus.COMPRADO,
        fechaCompra: Date.now(),
      }),
      "No se pudo registrar la compra",
    );

  const markNotFound = (id: string) =>
    patchItem(
      id,
      { estado: ItemStatus.NO_ENCONTRADO },
      (item) => ({ ...item, estado: ItemStatus.NO_ENCONTRADO }),
      "No se pudo actualizar el producto",
    );

  const markPending = (id: string) =>
    patchItem(
      id,
      { estado: ItemStatus.PENDIENTE },
      (item) => ({ ...item, estado: ItemStatus.PENDIENTE }),
      "No se pudo actualizar el producto",
    );

  // El arrastre para reordenar dispara onReorder varias veces por gesto:
  // el orden visual se aplica al instante en cada llamada, pero la
  // persistencia en el servidor se agrupa (debounce) para no saturar la
  // red ni el canal de Realtime con una petición por cada producto que se
  // cruza durante el arrastre.
  const reorderDebounce = useRef<{
    timer: ReturnType<typeof setTimeout> | null;
    orderedIds: string[] | null;
  }>({ timer: null, orderedIds: null });

  const persistReorder = async (orderedIds: string[]) => {
    try {
      await apiFetch(`/api/v1/lists/${shoppingListId}/items/reorder`, {
        method: "POST",
        body: JSON.stringify({ orderedIds }),
      });
    } catch {
      toast.error("No se pudo reordenar la lista", { description: "Inténtalo de nuevo." });
      void fetchItems();
    } finally {
      for (const id of orderedIds) pendingEdits.end(id);
      invalidateInFlightFetches();
    }
  };
  const persistReorderRef = useRef(persistReorder);
  persistReorderRef.current = persistReorder;

  useEffect(() => {
    const state = reorderDebounce.current;
    return () => {
      if (state.timer) clearTimeout(state.timer);
      if (state.orderedIds) void persistReorderRef.current(state.orderedIds);
      state.timer = null;
      state.orderedIds = null;
    };
  }, [shoppingListId]);

  const reorder = async (orderedIds: string[]) => {
    const order = new Map(orderedIds.map((id, index) => [id, index]));
    for (const id of orderedIds) pendingEdits.begin(id);
    setItems((current) =>
      (current ?? []).map((item) => (order.has(item.id) ? { ...item, orden: order.get(item.id)! } : item)),
    );

    reorderDebounce.current.orderedIds = orderedIds;
    if (reorderDebounce.current.timer) clearTimeout(reorderDebounce.current.timer);
    reorderDebounce.current.timer = setTimeout(() => {
      const ids = reorderDebounce.current.orderedIds;
      reorderDebounce.current.timer = null;
      reorderDebounce.current.orderedIds = null;
      if (ids) void persistReorder(ids);
    }, REORDER_DEBOUNCE_MS);
  };

  const removeItem = async (id: string) => {
    const previous = itemsRef.current.find((item) => item.id === id);
    if (!previous) return;

    pendingDeleteIds.current.add(id);
    setItems((current) => (current ?? []).filter((item) => item.id !== id));

    try {
      await apiFetch(`/api/v1/lists/${shoppingListId}/items/${id}`, { method: "DELETE" });
      toast.success("Producto eliminado");
    } catch {
      setItems((current) => [...(current ?? []), previous].sort((a, b) => a.orden - b.orden));
      toast.error("No se pudo eliminar el producto", { description: "Inténtalo de nuevo." });
    } finally {
      pendingDeleteIds.current.delete(id);
      invalidateInFlightFetches();
    }
  };

  return {
    items: resolvedItems,
    isLoading: items === undefined,
    summary,
    addItem,
    addItems,
    updateItem,
    markPurchased,
    markNotFound,
    markPending,
    reorder,
    removeItem,
  };
}
