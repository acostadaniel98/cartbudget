import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, UnauthorizedError, ForbiddenError } from "@/lib/auth/require-user";
import { requireListRole } from "@/lib/auth/list-access";
import { ListMemberRole } from "@prisma/client";
import { PrismaShoppingItemRepository } from "@/repositories/prisma/prisma-shopping-item-repository";

const reorderSchema = z.object({ orderedIds: z.array(z.string().uuid()).max(500) }).strict();

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    await requireListRole(id, user.id, [ListMemberRole.OWNER, ListMemberRole.EDITOR]);
    const { orderedIds } = reorderSchema.parse(await request.json());
    await new PrismaShoppingItemRepository(user.id).reorder(id, orderedIds);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
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
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "No se pudo reordenar la lista" } },
      { status: 500 },
    );
  }
}