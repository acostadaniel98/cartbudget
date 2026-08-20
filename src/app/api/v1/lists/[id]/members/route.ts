import { NextResponse } from "next/server";
import { ListMemberRole } from "@prisma/client";
import { requireUser, UnauthorizedError, ForbiddenError } from "@/lib/auth/require-user";
import { requireListRole } from "@/lib/auth/list-access";
import { prisma } from "@/lib/prisma";

function errorResponse(error: unknown) {
  if (error instanceof UnauthorizedError) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: error.message } }, { status: 401 });
  }
  if (error instanceof ForbiddenError) {
    return NextResponse.json({ error: { code: "FORBIDDEN", message: error.message } }, { status: 403 });
  }
  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message: "No se pudo completar la operación" } },
    { status: 500 },
  );
}

/** Cualquier miembro (incluida una persona con solo lectura) puede ver
 * quién más colabora en la compra. */
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id: listId } = await context.params;
    await requireListRole(listId, user.id, [
      ListMemberRole.OWNER,
      ListMemberRole.EDITOR,
      ListMemberRole.VIEWER,
    ]);

    const members = await prisma.listMember.findMany({
      where: { listId },
      orderBy: [{ role: "asc" }, { createdAt: "asc" }],
      select: { id: true, userId: true, email: true, role: true, createdAt: true },
    });

    const data = members.map((member) => ({
      id: member.id,
      email: member.email,
      role: member.role,
      createdAt: member.createdAt,
      isSelf: member.userId === user.id,
    }));

    return NextResponse.json({ data });
  } catch (error) {
    return errorResponse(error);
  }
}
