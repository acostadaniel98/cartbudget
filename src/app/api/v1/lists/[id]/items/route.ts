import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, UnauthorizedError, ForbiddenError } from "@/lib/auth/require-user";
import { requireListRole } from "@/lib/auth/list-access";
import { ListMemberRole } from "@prisma/client";
import { PrismaFrequentProductRepository } from "@/repositories/prisma/prisma-frequent-product-repository";
import { PrismaShoppingItemRepository } from "@/repositories/prisma/prisma-shopping-item-repository";
import { ShoppingItemService } from "@/services/shopping-item-service";

const itemSchema = z
  .object({
    nombre: z.string().trim().min(1).max(80),
    cantidad: z.number().positive().max(100000).optional(),
    precioUnitario: z.number().nonnegative().max(100000000).optional(),
    categoria: z.string().trim().min(1).max(60),
    notas: z.string().trim().max(140).optional(),
  })
  .strict();

function errorResponse(error: unknown) {
  if (error instanceof UnauthorizedError) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: error.message } },
      { status: 401 },
    );
  }
  if (error instanceof ForbiddenError) {
    return NextResponse.json({ error: { code: "FORBIDDEN", message: error.message } }, { status: 403 });
  }
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Los datos enviados no son válidos", issues: error.issues } },
      { status: 400 },
    );
  }
  if (error instanceof Error && error.message.includes("no encontrada")) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Lista de compra no encontrada" } },
      { status: 404 },
    );
  }
  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message: "No se pudo completar la operación" } },
    { status: 500 },
  );
}

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    await requireListRole(id, user.id, [ListMemberRole.OWNER, ListMemberRole.EDITOR]);
    const items = await new PrismaShoppingItemRepository(user.id).getByListId(id);
    return NextResponse.json({ data: items });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const input = itemSchema.parse(await request.json());
    const service = new ShoppingItemService(
      new PrismaShoppingItemRepository(user.id),
      new PrismaFrequentProductRepository(user.id),
    );
    const item = await service.add({ ...input, shoppingListId: id });
    return NextResponse.json({ data: item }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}