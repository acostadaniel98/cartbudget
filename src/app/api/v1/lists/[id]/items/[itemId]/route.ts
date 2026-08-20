import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, UnauthorizedError, ForbiddenError } from "@/lib/auth/require-user";
import { requireListRole } from "@/lib/auth/list-access";
import { ListMemberRole } from "@prisma/client";
import { PrismaShoppingItemRepository } from "@/repositories/prisma/prisma-shopping-item-repository";

const updateItemSchema = z
  .object({
    nombre: z.string().trim().min(1).max(80).optional(),
    cantidad: z.number().positive().max(100000).optional(),
    precioUnitario: z.number().nonnegative().max(100000000).optional(),
    categoria: z.string().trim().min(1).max(60).optional(),
    estado: z.enum(["pendiente", "comprado", "no_encontrado"]).optional(),
    notas: z.string().trim().max(140).optional(),
    orden: z.number().int().nonnegative().optional(),
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
  if (error instanceof Error && error.message.includes("no encontrado")) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Producto no encontrado" } },
      { status: 404 },
    );
  }
  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message: "No se pudo completar la operación" } },
    { status: 500 },
  );
}

type RouteContext = { params: Promise<{ id: string; itemId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await requireUser();
    const { id, itemId } = await context.params;
    await requireListRole(id, user.id, [ListMemberRole.OWNER, ListMemberRole.EDITOR]);
    const patch = updateItemSchema.parse(await request.json());
    const repository = new PrismaShoppingItemRepository(user.id);
    const item = await repository.getById(itemId);
    if (!item || item.shoppingListId !== id) throw new Error("Producto no encontrado");
    return NextResponse.json({ data: await repository.update(itemId, patch) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const user = await requireUser();
    const { id, itemId } = await context.params;
    await requireListRole(id, user.id, [ListMemberRole.OWNER, ListMemberRole.EDITOR]);
    const repository = new PrismaShoppingItemRepository(user.id);
    const item = await repository.getById(itemId);
    if (!item || item.shoppingListId !== id) throw new Error("Producto no encontrado");
    await repository.delete(itemId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return errorResponse(error);
  }
}