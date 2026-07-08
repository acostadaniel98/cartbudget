import {
  type FrequentProduct,
  normalizeProductName,
} from "@/domain/models/frequent-product";

/**
 * Lógica de aprendizaje local de productos frecuentes.
 *
 * Cada vez que un producto se usa, su frecuencia aumenta. No hay IA ni
 * llamadas externas: es un contador simple ordenado por frecuencia.
 */

/** Calcula el siguiente estado de un producto frecuente tras usarlo. */
export function bumpFrequency(
  existing: FrequentProduct | undefined,
  params: { nombre: string; categoria: string; precioUnitario?: number; cantidad?: number },
  now: number = Date.now(),
): Omit<FrequentProduct, "id"> {
  const nombreNormalizado = normalizeProductName(params.nombre);

  if (existing) {
    return {
      nombreNormalizado,
      nombre: params.nombre.trim(),
      categoria: params.categoria,
      frecuencia: existing.frecuencia + 1,
      ultimoPrecioUnitario: params.precioUnitario ?? existing.ultimoPrecioUnitario,
      ultimaCantidad: params.cantidad ?? existing.ultimaCantidad,
      fechaActualizacion: now,
    };
  }

  return {
    nombreNormalizado,
    nombre: params.nombre.trim(),
    categoria: params.categoria,
    frecuencia: 1,
    ultimoPrecioUnitario: params.precioUnitario,
    ultimaCantidad: params.cantidad,
    fechaActualizacion: now,
  };
}

/**
 * Filtra y ordena sugerencias por relevancia:
 * 1) coincidencia al inicio del nombre, 2) frecuencia descendente.
 */
export function getSuggestions(
  products: FrequentProduct[],
  query: string,
  limit = 6,
): FrequentProduct[] {
  const q = normalizeProductName(query);
  if (!q) {
    return [...products].sort((a, b) => b.frecuencia - a.frecuencia).slice(0, limit);
  }

  return products
    .filter((p) => p.nombreNormalizado.includes(q))
    .sort((a, b) => {
      const aStarts = a.nombreNormalizado.startsWith(q) ? 1 : 0;
      const bStarts = b.nombreNormalizado.startsWith(q) ? 1 : 0;
      if (aStarts !== bStarts) return bStarts - aStarts;
      return b.frecuencia - a.frecuencia;
    })
    .slice(0, limit);
}
