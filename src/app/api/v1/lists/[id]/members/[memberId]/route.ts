import { NextResponse } from "next/server";
import { z } from "zod";
import { ListMemberRole } from "@prisma/client";
import { requireUser, UnauthorizedError, ForbiddenError } from "@/lib/auth/require-user";
import { prisma } from "@/lib/prisma";

const updateRoleSchema = z.object({ role: z.enum(["EDITOR", "VIEWER"]) }).strict();

function errorResponse(error: unknown) {
  if (error instanceof UnauthorizedError) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: error.message } }, { status: 401 });
  }
  if (error instanceof ForbiddenError) {
    return NextResponse.json({ error: { code: "FORBIDDEN", message: error.message } }, { status: 403 });
  }
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "El rol enviado no es válido", issues: error.issues } },
      { status: 400 },
    );
  }
  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message: "No se pudo completar la operación" } },
    { status: 500 },
  );
}

type RouteContext = { params: Promise<{ id: string; memberId: string }> };

/** Solo el propietario puede cambiar el permiso de otro colaborador entre
 * "puede editar" y "solo puede ver". El propietario mismo no tiene rol que
 * cambiar por aquí: para eso no existe traspaso de propiedad. */
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await requireUser();
    const { id: listId, memberId } = await context.params;
    const { role } = updateRoleSchema.parse(await request.json());

    const owner = await prisma.listMember.findFirst({
      where: { listId, userId: user.id, role: ListMemberRole.OWNER },
      select: { id: true },
    });
    if (!owner) throw new ForbiddenError("Solo el propietario puede cambiar permisos");

    const target = await prisma.listMember.findFirst({
      where: { id: memberId, listId },
      select: { role: true },
    });
    if (!target) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Ese colaborador ya no está en la compra" } },
        { status: 404 },
      );
    }
    if (target.role === ListMemberRole.OWNER) {
      throw new ForbiddenError("No puedes cambiar el permiso del propietario");
    }

    const updated = await prisma.listMember.update({
      where: { id: memberId },
      data: { role },
      select: { id: true, email: true, role: true, createdAt: true, userId: true },
    });

    return NextResponse.json({
      data: {
        id: updated.id,
        email: updated.email,
        role: updated.role,
        createdAt: updated.createdAt,
        isSelf: updated.userId === user.id,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * Quita a un miembro de la compra: la propia persona puede salirse
 * ("dejar la compra"), y el propietario puede quitar a cualquier otro
 * colaborador. El propietario nunca puede quitarse a sí mismo por aquí —no
 * existe traspaso de propiedad— para no dejar la compra huérfana; para eso
 * está "Eliminar compra".
 */
export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const user = await requireUser();
    const { id: listId, memberId } = await context.params;

    const [caller, target] = await Promise.all([
      prisma.listMember.findFirst({ where: { listId, userId: user.id }, select: { role: true } }),
      prisma.listMember.findFirst({ where: { id: memberId, listId }, select: { id: true, userId: true, role: true } }),
    ]);

    if (!caller) throw new ForbiddenError("No perteneces a esta compra");
    if (!target) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Ese colaborador ya no está en la compra" } },
        { status: 404 },
      );
    }
    if (target.role === ListMemberRole.OWNER) {
      throw new ForbiddenError("No puedes quitar al propietario de la compra");
    }

    const isSelf = target.userId === user.id;
    if (!isSelf && caller.role !== ListMemberRole.OWNER) {
      throw new ForbiddenError("Solo el propietario puede quitar a otros colaboradores");
    }

    await prisma.listMember.delete({ where: { id: memberId } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return errorResponse(error);
  }
}
