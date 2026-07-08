import { describe, expect, it } from "vitest";
import type { FrequentProduct } from "@/domain/models/frequent-product";
import { normalizeProductName } from "@/domain/models/frequent-product";
import { bumpFrequency, getSuggestions } from "@/domain/services/frequent-products";

describe("normalizeProductName", () => {
  it("convierte a minúsculas y colapsa espacios", () => {
    expect(normalizeProductName("  Leche  Entera  ")).toBe("leche entera");
  });
});

describe("bumpFrequency", () => {
  it("crea un registro nuevo con frecuencia 1 si no existe", () => {
    const result = bumpFrequency(undefined, { nombre: "Leche", categoria: "lacteos" }, 1000);
    expect(result).toEqual({
      nombreNormalizado: "leche",
      nombre: "Leche",
      categoria: "lacteos",
      frecuencia: 1,
      ultimoPrecioUnitario: undefined,
      ultimaCantidad: undefined,
      fechaActualizacion: 1000,
    });
  });

  it("incrementa la frecuencia de un registro existente", () => {
    const existing: FrequentProduct = {
      id: "1",
      nombreNormalizado: "leche",
      nombre: "Leche",
      categoria: "lacteos",
      frecuencia: 3,
      fechaActualizacion: 500,
    };
    const result = bumpFrequency(
      existing,
      { nombre: "Leche", categoria: "lacteos", precioUnitario: 1.5, cantidad: 2 },
      2000,
    );
    expect(result.frecuencia).toBe(4);
    expect(result.ultimoPrecioUnitario).toBe(1.5);
    expect(result.ultimaCantidad).toBe(2);
    expect(result.fechaActualizacion).toBe(2000);
  });
});

describe("getSuggestions", () => {
  const products: FrequentProduct[] = [
    { id: "1", nombreNormalizado: "leche entera", nombre: "Leche Entera", categoria: "lacteos", frecuencia: 5, fechaActualizacion: 1 },
    { id: "2", nombreNormalizado: "leche deslactosada", nombre: "Leche Deslactosada", categoria: "lacteos", frecuencia: 8, fechaActualizacion: 1 },
    { id: "3", nombreNormalizado: "pan integral", nombre: "Pan Integral", categoria: "panaderia", frecuencia: 10, fechaActualizacion: 1 },
  ];

  it("sin query, ordena por frecuencia descendente", () => {
    const result = getSuggestions(products, "");
    expect(result.map((p) => p.id)).toEqual(["3", "2", "1"]);
  });

  it("filtra por coincidencia parcial", () => {
    const result = getSuggestions(products, "leche");
    expect(result.map((p) => p.id).sort()).toEqual(["1", "2"]);
  });

  it("prioriza coincidencias al inicio del nombre sobre la frecuencia", () => {
    const result = getSuggestions(products, "leche");
    expect(result[0].id).toBe("2");
  });

  it("respeta el límite solicitado", () => {
    const result = getSuggestions(products, "", 2);
    expect(result).toHaveLength(2);
  });
});
