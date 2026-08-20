import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, UnauthorizedError } from "@/lib/auth/require-user";
import { PrismaShoppingListRepository } from "@/repositories/prisma/prisma-shopping-list-repository";

const itemInputSchema = z.object({
  nombre: z.string().trim().min(1).max(80),
  cantidad: z.number().positive().max(100000).optional(),
  precioUnitario: z.number().nonnegative().max(100000000).optional(),
  categoria: z.string().trim().min(1).max(60),
  notas: z.string().trim().max(140).optional(),
}).strict();

const createListSchema = z.object({
  nombre: z.string().trim().min(1).max(60),
  presupuesto: z.number().positive().max(100000000).nullable().optional(),
  esPlantilla: z.boolean().optional(),
  notas: z.string().trim().max(200).optional(),
  items: z.array(itemInputSchema).max(500).optional(),
}).strict();

function errorResponse(error: unknown) {
  if (error instanceof UnauthorizedError) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: error.message } },
      { status: 401 },
    );
  }
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Los datos enviados no son válidos", issues: error.issues } },
      { status: 400 },
    );
  }
  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message: "No se pudo completar la operación" } },
    { status: 500 },
  );
}

export async function GET() {
  try {
    const user = await requireUser();
    const repository = new PrismaShoppingListRepository(user.id);
    return NextResponse.json({ data: await repository.getAll() });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = createListSchema.parse(await request.json());
    const repository = new PrismaShoppingListRepository(user.id);
    const { items, ...listInput } = body;
    const normalizedListInput = {
      ...listInput,
      presupuesto: listInput.presupuesto ?? undefined,
    };
    const data =
      items && items.length > 0
        ? await repository.createWithItems(normalizedListInput, items)
        : { list: await repository.create(normalizedListInput), items: [] };
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}