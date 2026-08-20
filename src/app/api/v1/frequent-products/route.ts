import { NextResponse } from "next/server";
import { requireUser, UnauthorizedError } from "@/lib/auth/require-user";
import { PrismaFrequentProductRepository } from "@/repositories/prisma/prisma-frequent-product-repository";

export async function GET() {
  try {
    const user = await requireUser();
    return NextResponse.json({ data: await new PrismaFrequentProductRepository(user.id).getAll() });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: error.message } }, { status: 401 });
    }
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "No se pudieron cargar las sugerencias" } }, { status: 500 });
  }
}