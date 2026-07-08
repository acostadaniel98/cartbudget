import { DexieFrequentProductRepository } from "@/repositories/dexie/dexie-frequent-product-repository";
import { getSuggestions } from "@/domain/services/frequent-products";
import type { FrequentProduct } from "@/domain/models/frequent-product";

export class FrequentProductService {
  constructor(private readonly repo = new DexieFrequentProductRepository()) {}

  async suggest(query: string, limit = 6): Promise<FrequentProduct[]> {
    const all = await this.repo.getAll();
    return getSuggestions(all, query, limit);
  }
}

export const frequentProductService = new FrequentProductService();
