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
    return shoppingListService.update(id, patch);
  };

  const setEsPlantilla = async (esPlantilla: boolean) => {
    await shoppingListService.setEsPlantilla(id, esPlantilla);
    toast.success(esPlantilla ? "Guardada como plantilla" : "Ya no es una plantilla");
  };

  const remove = async () => {
    await shoppingListService.delete(id);
    toast.success("Compra eliminada");
    router.push(ROUTES.inicio);
  };

  const duplicate = async (nuevoNombre?: string) => {
    const newList = await shoppingListService.duplicate(id, nuevoNombre);
    toast.success("Compra duplicada");
    router.push(ROUTES.compra(newList.id));
    return newList;
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
