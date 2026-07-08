import type { IFrequentProductRepository } from "@/domain/repositories/frequent-product-repository";
import type { FrequentProduct } from "@/domain/models/frequent-product";
import { normalizeProductName } from "@/domain/models/frequent-product";
import { bumpFrequency } from "@/domain/services/frequent-products";
import { generateId } from "@/lib/id";
import { getDb } from "./database";

export class DexieFrequentProductRepository implements IFrequentProductRepository {
  async getAll(): Promise<FrequentProduct[]> {
    return getDb().frequentProducts.toArray();
  }

  async recordUsage(params: {
    nombre: string;
    categoria: string;
    precioUnitario?: number;
    cantidad?: number;
  }): Promise<FrequentProduct> {
    const db = getDb();
    const nombreNormalizado = normalizeProductName(params.nombre);
    const existing = await db.frequentProducts
      .where("nombreNormalizado")
      .equals(nombreNormalizado)
      .first();

    const bumped = bumpFrequency(existing, params);
    const record: FrequentProduct = { id: existing?.id ?? generateId(), ...bumped };
    await db.frequentProducts.put(record);
    return record;
  }
}
