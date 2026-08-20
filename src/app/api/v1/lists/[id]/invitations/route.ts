import { NextResponse } from "next/server";
import { z } from "zod";
import { ListMemberRole } from "@prisma/client";
import { requireUser, UnauthorizedError } from "@/lib/auth/require-user";
import { createInvitationToken } from "@/lib/auth/invitation-token";
import { prisma } from "@/lib/prisma";
import { getAppUrl } from "@/lib/app-url";

const invitationSchema = z.object({
  role: z.enum(["EDITOR", "VIEWER"]).default("EDITOR"),
  expiresInHours: z.number().int().min(1).max(24 * 7).default(72),
}).strict();

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id: listId } = await context.params;
    const input = invitationSchema.parse(await request.json().catch(() => ({})));
    const owner = await prisma.listMember.findFirst({
      where: { listId, userId: user.id, role: ListMemberRole.OWNER },
      select: { id: true },
    });
    if (!owner) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Solo el propietario puede invitar colaboradores" } },
        { status: 403 },
      );
    }

    const { token, tokenHash } = createInvitationToken();
    const invitation = await prisma.listInvitation.create({
      data: {
        listId,
        inviterId: user.id,
        tokenHash,
        role: input.role as ListMemberRole,
        expiresAt: new Date(Date.now() + input.expiresInHours * 60 * 60 * 1000),
      },
      select: { id: true, role: true, expiresAt: true },
    });
    const url = new URL(`/compartir/${token}`, getAppUrl(request));
    return NextResponse.json(
      { data: { ...invitation, url: url.toString() } },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: error.message } }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "La invitación no es válida", issues: error.issues } }, { status: 400 });
    }
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "No se pudo crear la invitación" } }, { status: 500 });
  }
}