import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, UnauthorizedError, ForbiddenError } from "@/lib/auth/require-user";
import { getListRole, requireListRole } from "@/lib/auth/list-access";
import { ListMemberRole } from "@prisma/client";
import { PrismaShoppingItemRepository } from "@/repositories/prisma/prisma-shopping-item-repository";
import { PrismaShoppingListRepository } from "@/repositories/prisma/prisma-shopping-list-repository";

const updateListSchema = z
  .object({
    nombre: z.string().trim().min(1).max(60).optional(),
    presupuesto: z.number().positive().max(100000000).nullable().optional(),
    esPlantilla: z.boolean().optional(),
    notas: z.string().trim().max(200).optional(),
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
    const lists = new PrismaShoppingListRepository(user.id);
    const list = await lists.getById(id);
    if (!list) return errorResponse(new Error("Lista no encontrada"));
    const [items, role] = await Promise.all([
      new PrismaShoppingItemRepository(user.id).getByListId(id),
      getListRole(id, user.id),
    ]);
    return NextResponse.json({ data: { list, items, role } });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const patch = updateListSchema.parse(await request.json());
    await requireListRole(id, user.id, [ListMemberRole.OWNER, ListMemberRole.EDITOR]);
    const list = await new PrismaShoppingListRepository(user.id).update(id, patch);
    return NextResponse.json({ data: list });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    await requireListRole(id, user.id, [ListMemberRole.OWNER]);
    const repository = new PrismaShoppingListRepository(user.id);
    if (!(await repository.getById(id))) return errorResponse(new Error("Lista no encontrada"));
    await repository.delete(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return errorResponse(error);
  }
}