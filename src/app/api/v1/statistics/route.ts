import { NextResponse } from "next/server";
import { requireUser, UnauthorizedError } from "@/lib/auth/require-user";
import { PrismaShoppingItemRepository } from "@/repositories/prisma/prisma-shopping-item-repository";
import { PrismaShoppingListRepository } from "@/repositories/prisma/prisma-shopping-list-repository";
import { StatisticsService } from "@/services/statistics-service";

export async function GET() {
  try {
    const user = await requireUser();
    const stats = await new StatisticsService(
      new PrismaShoppingListRepository(user.id),
      new PrismaShoppingItemRepository(user.id),
    ).getStatistics();
    return NextResponse.json({ data: stats });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: error.message } }, { status: 401 });
    }
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "No se pudieron cargar las estadísticas" } }, { status: 500 });
  }
}