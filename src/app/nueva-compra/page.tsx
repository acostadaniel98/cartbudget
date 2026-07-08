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
import { shoppingListService } from "@/services/shopping-list-service";
import { shoppingItemService } from "@/services/shopping-item-service";
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

  const handleSave = async () => {
    if (!canSave) return;
    setIsSaving(true);
    try {
      const presupuestoValue =
        listValues.presupuesto === "" || listValues.presupuesto === undefined
          ? undefined
          : Number(listValues.presupuesto);

      const newList = await shoppingListService.create({
        nombre: listValues.nombre.trim(),
        presupuesto: presupuestoValue,
        notas: listValues.notas?.trim() || undefined,
        esPlantilla,
      });

      if (products.length > 0) {
        await shoppingItemService.addMany(
          products.map((p) => ({
            shoppingListId: newList.id,
            nombre: p.nombre,
            cantidad: p.cantidad,
            categoria: p.categoria,
          })),
        );
      }

      toast.success(esPlantilla ? "Plantilla creada" : "Compra creada");
      router.push(ROUTES.compra(newList.id));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="pb-28">
      <PageHeader title={esPlantilla ? "Nueva plantilla" : "Nueva compra"} showBack />

      <div className="space-y-6 px-4">
        <ShoppingListForm
          formId="nueva-compra-form"
          onValuesChange={(values, valid) => {
            setListValues(values);
            setIsListValid(valid);
          }}
        />

        <div>
          <h2 className="mb-2 font-[family-name:var(--font-display)] font-bold">Productos</h2>
          <QuickAddProducts value={products} onChange={setProducts} defaultCategoryId={UNCATEGORIZED_ID} />
        </div>
      </div>

      <div className="safe-bottom fixed inset-x-0 bottom-0 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-sm">
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
