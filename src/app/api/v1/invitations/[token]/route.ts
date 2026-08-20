import { NextResponse } from "next/server";
import { ListMemberRole, Prisma } from "@prisma/client";
import { requireUser, UnauthorizedError } from "@/lib/auth/require-user";
import { hashInvitationToken } from "@/lib/auth/invitation-token";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, context: { params: Promise<{ token: string }> }) {
  try {
    const user = await requireUser();
    const { token } = await context.params;
    const invitation = await prisma.listInvitation.findFirst({
      where: {
        tokenHash: hashInvitationToken(token),
        acceptedAt: null,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: { id: true, listId: true, role: true },
    });
    if (!invitation) {
      return NextResponse.json(
        { error: { code: "INVITATION_INVALID", message: "La invitación expiró o ya no está disponible" } },
        { status: 410 },
      );
    }

    await prisma.$transaction(async (tx) => {
      const existing = await tx.listMember.findUnique({
        where: { listId_userId: { listId: invitation.listId, userId: user.id } },
        select: { role: true },
      });
      const role = existing?.role === ListMemberRole.OWNER || existing?.role === ListMemberRole.EDITOR
        ? existing.role
        : invitation.role;
      await tx.listMember.upsert({
        where: { listId_userId: { listId: invitation.listId, userId: user.id } },
        create: { listId: invitation.listId, userId: user.id, role },
        update: { role },
      });
      await tx.listInvitation.update({
        where: { id: invitation.id },
        data: { acceptedAt: new Date(), acceptedByUserId: user.id },
      });
    });

    return NextResponse.json({ data: { listId: invitation.listId } });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: error.message } }, { status: 401 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: { code: "INVITATION_INVALID", message: "La invitación ya no está disponible" } }, { status: 410 });
    }
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "No se pudo aceptar la invitación" } }, { status: 500 });
  }
}