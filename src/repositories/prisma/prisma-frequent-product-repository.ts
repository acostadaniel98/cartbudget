import type { FrequentProduct } from "@/domain/models/frequent-product";
import { normalizeProductName } from "@/domain/models/frequent-product";
import { bumpFrequency } from "@/domain/services/frequent-products";
import type { IFrequentProductRepository } from "@/domain/repositories/frequent-product-repository";
import { prisma } from "@/lib/prisma";
import type { PrismaClient } from "@prisma/client";

function mapFrequentProduct(record: {
  id: string;
  nombreNormalizado: string;
  nombre: string;
  categoria: string;
  frecuencia: number;
  ultimoPrecioUnitario: { toNumber(): number } | null;
  ultimaCantidad: { toNumber(): number } | null;
  fechaActualizacion: Date;
}): FrequentProduct {
  return {
    id: record.id,
    nombreNormalizado: record.nombreNormalizado,
    nombre: record.nombre,
    categoria: record.categoria,
    frecuencia: record.frecuencia,
    ultimoPrecioUnitario: record.ultimoPrecioUnitario?.toNumber(),
    ultimaCantidad: record.ultimaCantidad?.toNumber(),
    fechaActualizacion: record.fechaActualizacion.getTime(),
  };
}

export class PrismaFrequentProductRepository implements IFrequentProductRepository {
  constructor(
    private readonly userId: string,
    private readonly db: PrismaClient = prisma,
  ) {}

  async getAll(): Promise<FrequentProduct[]> {
    const records = await this.db.frequentProduct.findMany({
      where: { userId: this.userId },
      orderBy: { frecuencia: "desc" },
    });
    return records.map(mapFrequentProduct);
  }

  async recordUsage(params: {
    nombre: string;
    categoria: string;
    precioUnitario?: number;
    cantidad?: number;
  }): Promise<FrequentProduct> {
    const normalized = normalizeProductName(params.nombre);
    const existing = await this.db.frequentProduct.findUnique({
      where: { userId_nombreNormalizado: { userId: this.userId, nombreNormalizado: normalized } },
    });
    const next = bumpFrequency(existing ? mapFrequentProduct(existing) : undefined, params);
    const record = await this.db.frequentProduct.upsert({
      where: { userId_nombreNormalizado: { userId: this.userId, nombreNormalizado: normalized } },
      create: {
        userId: this.userId,
        nombreNormalizado: next.nombreNormalizado,
        nombre: next.nombre,
        categoria: next.categoria,
        frecuencia: next.frecuencia,
        ultimoPrecioUnitario: next.ultimoPrecioUnitario,
        ultimaCantidad: next.ultimaCantidad,
      },
      update: {
        nombre: next.nombre,
        categoria: next.categoria,
        frecuencia: next.frecuencia,
        ultimoPrecioUnitario: next.ultimoPrecioUnitario,
        ultimaCantidad: next.ultimaCantidad,
      },
    });
    return mapFrequentProduct(record);
  }
}