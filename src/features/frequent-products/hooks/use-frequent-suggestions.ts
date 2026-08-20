"use client";

import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { apiFetch } from "@/lib/api/client";
import type { FrequentProduct } from "@/domain/models/frequent-product";

export function useFrequentSuggestions(query: string, limit = 6) {
  const debouncedQuery = useDebounce(query, 150);
  const [products, setProducts] = useState<FrequentProduct[]>([]);

  useEffect(() => {
    let active = true;
    apiFetch<FrequentProduct[]>("/api/v1/frequent-products")
      .then((data) => active && setProducts(data))
      .catch(() => active && setProducts([]));
    return () => {
      active = false;
    };
  }, []);

  const queryValue = debouncedQuery.trim().toLowerCase();
  return products
    .filter((product) => !queryValue || product.nombreNormalizado.includes(queryValue))
    .sort((a, b) => b.frecuencia - a.frecuencia)
    .slice(0, limit);
}
