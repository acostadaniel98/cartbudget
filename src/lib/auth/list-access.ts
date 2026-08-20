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