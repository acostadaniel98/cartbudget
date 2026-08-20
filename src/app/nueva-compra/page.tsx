"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ShoppingListForm } from "@/features/shopping-lists/components/shopping-list-form";
import {
  QuickAddProducts,
  type DraftProduct,
} from "@/features/shopping-lists/components/quick-add-products";
import type { ShoppingListFormValues } from "@/features/shopping-lists/schemas/shopping-list-schema";
import { apiFetch } from "@/lib/api/client";
import { UNCATEGORIZED_ID } from "@/constants/categories";
import { ROUTES } from "@/constants/routes";

function NuevaCompraForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const esPlantilla = searchParams.get("plantilla") === "1";

  const [listValues, setListValues] = React.useState<ShoppingListFormValues>({
    nombre: "",
    presupuesto: "",
    notas: "",
  });
  const [isListValid, setIsListValid] = React.useState(false);
  const [products, setProducts] = React.useState<DraftProduct[]>([]);
  const [isSaving, setIsSaving] = React.useState(false);

  const canSave = isListValid && listValues.nombre?.trim().length > 0 && !isSaving;

  const handleListValuesChange = React.useCallback(
    (values: ShoppingListFormValues, valid: boolean) => {
      setListValues(values);
      setIsListValid(valid);
    },
    [],
  );

  const handleSave = async () => {
    if (!canSave) return;
    setIsSaving(true);
    try {
      const presupuestoValue =
        listValues.presupuesto === "" || listValues.presupuesto === undefined
          ? undefined
          : Number(listValues.presupuesto);

      const { list: newList } = await apiFetch<{ list: { id: string } }>("/api/v1/lists", {
        method: "POST",
        body: JSON.stringify({
          nombre: listValues.nombre.trim(),
          presupuesto: presupuestoValue,
          notas: listValues.notas?.trim() || undefined,
          esPlantilla,
          items: products.map((p) => ({
            nombre: p.nombre,
            cantidad: p.cantidad,
            categoria: p.categoria,
          })),
        }),
      });

      toast.success(esPlantilla ? "Plantilla creada" : "Compra creada");
      router.push(ROUTES.compra(newList.id));
    } catch {
      toast.error("No se pudo guardar la compra", {
        description: "Revisa tu conexión e inténtalo de nuevo.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="pb-28">
      <PageHeader title={esPlantilla ? "Nueva plantilla" : "Nueva compra"} showBack />

      <div className="space-y-6 px-4">
        <ShoppingListForm formId="nueva-compra-form" onValuesChange={handleListValuesChange} />

        <div>
          <h2 className="font-display mb-2 font-bold">Productos</h2>
          <QuickAddProducts
            value={products}
            onChange={setProducts}
            defaultCategoryId={UNCATEGORIZED_ID}
          />
        </div>
      </div>

      <div className="safe-bottom border-border bg-background/95 fixed inset-x-0 bottom-0 border-t px-4 py-3 backdrop-blur-sm">
        <Button className="w-full" size="lg" disabled={!canSave} onClick={handleSave}>
          {esPlantilla ? "Guardar plantilla" : "Guardar compra"}
        </Button>
      </div>
    </div>
  );
}

export default function NuevaCompraPage() {
  return (
    <React.Suspense fallback={null}>
      <NuevaCompraForm />
    </React.Suspense>
  );
}
