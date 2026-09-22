import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { validateExchange } from "@/lib/smae/validateExchange";

const schema = z.object({
  planItemId: z.string(),
  toFoodId: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole("PACIENTE");
    const body = schema.parse(await req.json());

    const profile = await prisma.patientProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!profile) {
      return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
    }

    const item = await prisma.planItem.findUnique({
      where: { id: body.planItemId },
      include: {
        food: true,
        mealSlot: { include: { plan: true } },
      },
    });

    if (!item || item.mealSlot.plan.patientId !== profile.id) {
      return NextResponse.json({ error: "Ítem no encontrado" }, { status: 404 });
    }
    if (item.mealSlot.plan.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Solo se pueden modificar planes activos" },
        { status: 400 },
      );
    }

    const toFood = await prisma.food.findUnique({ where: { id: body.toFoodId } });
    if (!toFood) {
      return NextResponse.json({ error: "Alimento destino no encontrado" }, { status: 404 });
    }

    const result = validateExchange(item.food, toFood, item.servings);
    if (!result.ok) {
      return NextResponse.json({ error: result.reason }, { status: 400 });
    }

    const [updated] = await prisma.$transaction([
      prisma.planItem.update({
        where: { id: item.id },
        data: { foodId: toFood.id },
        include: { food: { include: { group: true } } },
      }),
      prisma.exchangeLog.create({
        data: {
          planId: item.mealSlot.planId,
          userId: session.user.id,
          fromFoodId: item.foodId,
          toFoodId: toFood.id,
          servings: item.servings,
          planItemId: item.id,
        },
      }),
    ]);

    return NextResponse.json(updated);
  } catch (e) {
    if (e instanceof Response) return e;
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al intercambiar" }, { status: 500 });
  }
}
