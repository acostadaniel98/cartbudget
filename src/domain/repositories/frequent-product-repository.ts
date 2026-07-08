import type { FrequentProduct } from "@/domain/models/frequent-product";

export interface IFrequentProductRepository {
  getAll(): Promise<FrequentProduct[]>;
  recordUsage(params: {
    nombre: string;
    categoria: string;
    precioUnitario?: number;
    cantidad?: number;
  }): Promise<FrequentProduct>;
}
