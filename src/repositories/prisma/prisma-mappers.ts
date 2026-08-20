import type { ItemStatus as DomainItemStatus } from "@/domain/models/item-status";
import type { ShoppingItem } from "@/domain/models/shopping-item";
import type { ShoppingList } from "@/domain/models/shopping-list";
import type { Prisma, ItemStatus as PrismaItemStatus } from "@prisma/client";

export function mapShoppingList(record: {
  id: string;
  nombre: string;
  presupuesto: Prisma.Decimal | null;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  esPlantilla: boolean;
  notas: string | null;
}): ShoppingList {
  return {
    id: record.id,
    nombre: record.nombre,
    presupuesto: record.presupuesto === null ? undefined : Number(record.presupuesto),
    fechaCreacion: record.fechaCreacion.getTime(),
    fechaActualizacion: record.fechaActualizacion.getTime(),
    esPlantilla: record.esPlantilla,
    notas: record.notas ?? undefined,
  };
}

export function mapShoppingItem(record: {
  id: string;
  shoppingListId: string;
  nombre: string;
  cantidad: Prisma.Decimal;
  precioUnitario: Prisma.Decimal;
  precioTotal: Prisma.Decimal;
  categoria: string;
  estado: PrismaItemStatus;
  notas: string | null;
  orden: number;
  fechaCompra: Date | null;
}): ShoppingItem {
  return {
    id: record.id,
    shoppingListId: record.shoppingListId,
    nombre: record.nombre,
    cantidad: Number(record.cantidad),
    precioUnitario: Number(record.precioUnitario),
    precioTotal: Number(record.precioTotal),
    categoria: record.categoria,
    estado: record.estado as DomainItemStatus,
    notas: record.notas ?? undefined,
    orden: record.orden,
    fechaCompra: record.fechaCompra?.getTime(),
  };
}