"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { shoppingListService } from "@/services/shopping-list-service";
import { useMounted } from "@/hooks/use-mounted";
import { ROUTES } from "@/constants/routes";
import type { UpdateShoppingListInput } from "@/domain/models/shopping-list";

export function useShoppingList(id: string) {
  const mounted = useMounted();
  const router = useRouter();

  const list = useLiveQuery(async () => {
    if (!mounted) return undefined;
    return (await shoppingListService.getById(id)) ?? null;
  }, [mounted, id]);

  const update = async (patch: UpdateShoppingListInput) => {
    try {
      const updated = await shoppingListService.update(id, patch);
      toast.success("Compra actualizada");
      return updated;
    } catch {
      toast.error("No se pudo actualizar la compra", { description: "Inténtalo de nuevo." });
      return undefined;
    }
  };

  const setEsPlantilla = async (esPlantilla: boolean) => {
    try {
      await shoppingListService.setEsPlantilla(id, esPlantilla);
      toast.success(esPlantilla ? "Guardada como plantilla" : "Ya no es una plantilla");
    } catch {
      toast.error("No se pudo actualizar la plantilla", { description: "Inténtalo de nuevo." });
    }
  };

  const remove = async () => {
    try {
      await shoppingListService.delete(id);
      toast.success("Compra eliminada");
      router.push(ROUTES.inicio);
    } catch {
      toast.error("No se pudo eliminar la compra", { description: "Inténtalo de nuevo." });
    }
  };

  const duplicate = async (nuevoNombre?: string) => {
    try {
      const newList = await shoppingListService.duplicate(id, nuevoNombre);
      toast.success("Compra duplicada");
      router.push(ROUTES.compra(newList.id));
      return newList;
    } catch {
      toast.error("No se pudo duplicar la compra", { description: "Inténtalo de nuevo." });
      return undefined;
    }
  };

  return {
    list: list ?? null,
    isLoading: list === undefined,
    update,
    setEsPlantilla,
    remove,
    duplicate,
  };
}
