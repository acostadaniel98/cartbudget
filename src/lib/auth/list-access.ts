import { ListMemberRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ForbiddenError } from "./require-user";

export async function requireListRole(
  listId: string,
  userId: string,
  roles: ListMemberRole[],
) {
  const member = await prisma.listMember.findFirst({
    where: { listId, userId, role: { in: roles } },
    select: { role: true },
  });
  if (!member) throw new ForbiddenError();
  return member.role;
}

/** Como `requireListRole` pero sin restringir por rol: útil para saber qué
 * puede hacer la persona (por ejemplo, para que la UI oculte acciones que
 * de todas formas fallarían) sin bloquear el acceso de lectura. */
export async function getListRole(
  listId: string,
  userId: string,
): Promise<ListMemberRole | undefined> {
  const member = await prisma.listMember.findFirst({
    where: { listId, userId },
    select: { role: true },
  });
  return member?.role;
}