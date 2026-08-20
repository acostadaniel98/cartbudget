import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, UnauthorizedError } from "@/lib/auth/require-user";
import { calculateItemTotal } from "@/domain/services/budget-calculator";
import { prisma } from "@/lib/prisma";
import { ItemStatus as PrismaItemStatus, ListMemberRole } from "@prisma/client";

const itemSchema = z.object({
  nombre: z.string().trim().min(1).max(80),
  cantidad: z.number().positive().max(100000),
  precioUnitario: z.number().nonnegative().max(100000000),
  categoria: z.string().trim().min(1).max(60),
  estado: z.enum(["pendiente", "comprado", "no_encontrado"]),
  notas: z.string().trim().max(140).optional(),
  orden: z.number().int().nonnegative(),
  fechaCompra: z.number().int().positive().optional(),
});

const listSchema = z.object({
  legacyId: z.string().min(1).max(100),
  nombre: z.string().trim().min(1).max(60),
  presupuesto: z.number().positive().max(100000000).optional(),
  esPlantilla: z.boolean(),
  notas: z.string().trim().max(200).optional(),
  fechaCreacion: z.number().int().positive(),
  fechaActualizacion: z.number().int().positive(),
  items: z.array(itemSchema).max(500),
});

const migrationSchema = z.object({
  lists: z.array(listSchema).max(500),
  categories: z.array(z.object({
    nombre: z.string().trim().min(1).max(40),
    icono: z.string().trim().min(1).max(40),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    personalizada: z.boolean(),
    orden: z.number().int().nonnegative(),
  })).max(100),
  frequentProducts: z.array(z.object({
    nombreNormalizado: z.string().trim().min(1).max(100),
    nombre: z.string().trim().min(1).max(80),
    categoria: z.string().trim().min(1).max(60),
    frecuencia: z.number().int().positive(),
    ultimoPrecioUnitario: z.number().nonnegative().optional(),
    ultimaCantidad: z.number().positive().optional(),
  })).max(1000),
}).strict();

function dateFromMilliseconds(value: number) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error("Fecha local inválida");
  return date;
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const payload = migrationSchema.parse(await request.json());
    const [existingLists, existingProducts] = await Promise.all([
      prisma.shoppingList.count({ where: { userId: user.id } }),
      prisma.frequentProduct.count({ where: { userId: user.id } }),
    ]);
    if (existingLists > 0 || existingProducts > 0) {
      return NextResponse.json(
        { error: { code: "MIGRATION_NOT_NEEDED", message: "La cuenta ya contiene listas" } },
        { status: 409 },
      );
    }

    const imported = await prisma.$transaction(async (tx) => {
      const ids = new Map<string, string>();
      let itemCount = 0;
      for (const list of payload.lists) {
        const created = await tx.shoppingList.create({
          data: {
            userId: user.id,
            nombre: list.nombre,
            presupuesto: list.presupuesto,
            esPlantilla: list.esPlantilla,
            notas: list.notas,
            fechaCreacion: dateFromMilliseconds(list.fechaCreacion),
            fechaActualizacion: dateFromMilliseconds(list.fechaActualizacion),
            members: { create: { userId: user.id, email: user.email ?? "", role: ListMemberRole.OWNER } },
          },
        });
        ids.set(list.legacyId, created.id);
        for (const item of list.items) {
          await tx.shoppingItem.create({
            data: {
              shoppingListId: created.id,
              nombre: item.nombre,
              cantidad: item.cantidad,
              precioUnitario: item.precioUnitario,
              precioTotal: calculateItemTotal(item.cantidad, item.precioUnitario),
              categoria: item.categoria,
              estado: item.estado as PrismaItemStatus,
              notas: item.notas,
              orden: item.orden,
              fechaCompra: item.fechaCompra ? dateFromMilliseconds(item.fechaCompra) : undefined,
            },
          });
          itemCount += 1;
        }
      }

      if (payload.categories.length > 0) {
        await tx.category.createMany({
          data: payload.categories.map((category) => ({ ...category, userId: user.id })),
          skipDuplicates: true,
        });
      }
      for (const product of payload.frequentProducts) {
        await tx.frequentProduct.upsert({
          where: { userId_nombreNormalizado: { userId: user.id, nombreNormalizado: product.nombreNormalizado } },
          create: { ...product, userId: user.id },
          update: { ...product },
        });
      }
      return { listCount: ids.size, itemCount };
    });

    return NextResponse.json({ data: imported }, { status: 201 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: error.message } }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Los datos locales no son válidos", issues: error.issues } }, { status: 400 });
    }
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "No se pudieron migrar los datos locales" } }, { status: 500 });
  }
}