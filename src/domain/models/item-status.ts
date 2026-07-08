/**
 * Estados posibles de un producto dentro de una lista de compra.
 * Este archivo no depende de React ni de ninguna librería de UI:
 * es una regla de negocio pura del dominio.
 */
export const ItemStatus = {
  PENDIENTE: "pendiente",
  COMPRADO: "comprado",
  NO_ENCONTRADO: "no_encontrado",
} as const;

export type ItemStatus = (typeof ItemStatus)[keyof typeof ItemStatus];

export const ITEM_STATUS_VALUES: ItemStatus[] = [
  ItemStatus.PENDIENTE,
  ItemStatus.COMPRADO,
  ItemStatus.NO_ENCONTRADO,
];

export function isValidItemStatus(value: string): value is ItemStatus {
  return (ITEM_STATUS_VALUES as string[]).includes(value);
}
