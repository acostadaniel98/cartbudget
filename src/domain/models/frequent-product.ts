export interface FrequentProduct {
  id: string;
  nombreNormalizado: string;
  nombre: string;
  categoria: string;
  frecuencia: number;
  ultimoPrecioUnitario?: number;
  ultimaCantidad?: number;
  fechaActualizacion: number;
}

export function normalizeProductName(nombre: string): string {
  return nombre.trim().toLowerCase().replace(/\s+/g, " ");
}
