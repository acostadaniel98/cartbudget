import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, UnauthorizedError } from "@/lib/auth/require-user";
import { PrismaCategoryRepository } from "@/repositories/prisma/prisma-category-repository";

const createCategorySchema = z.object({
  nombre: z.string().trim().min(1).max(40),
  icono: z.string().trim().min(1).max(40).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
}).strict();

function errorResponse(error: unknown) {
  if (error instanceof UnauthorizedError) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: error.message } }, { status: 401 });
  }
  if (error instanceof z.ZodError) {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Los datos enviados no son válidos", issues: error.issues } }, { status: 400 });
  }
  return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "No se pudo completar la operación" } }, { status: 500 });
}

export async function GET() {
  try {
    const user = await requireUser();
    const repository = new PrismaCategoryRepository(user.id);
    await repository.ensureSeeded();
    return NextResponse.json({ data: await repository.getAll() });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const input = createCategorySchema.parse(await request.json());
    return NextResponse.json(
      { data: await new PrismaCategoryRepository(user.id).create(input) },
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}