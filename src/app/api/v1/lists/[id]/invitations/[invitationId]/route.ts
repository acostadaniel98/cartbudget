import { NextResponse } from "next/server";
import { ListMemberRole } from "@prisma/client";
import { requireUser, UnauthorizedError } from "@/lib/auth/require-user";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string; invitationId: string }> };

/** Revoca un enlace de invitación antes de que alguien lo use. No borra el
 * registro (queda como historial de que existió y se revocó); solo evita
 * que `POST /invitations/[token]` vuelva a aceptarlo. */
export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const user = await requireUser();
    const { id: listId, invitationId } = await context.params;

    const owner = await prisma.listMember.findFirst({
      where: { listId, userId: user.id, role: ListMemberRole.OWNER },
      select: { id: true },
    });
    if (!owner) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Solo el propietario puede revocar invitaciones" } },
        { status: 403 },
      );
    }

    const result = await prisma.listInvitation.updateMany({
      where: { id: invitationId, listId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    if (result.count === 0) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Esa invitación ya no está disponible" } },
        { status: 404 },
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: error.message } }, { status: 401 });
    }
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "No se pudo revocar la invitación" } },
      { status: 500 },
    );
  }
}
