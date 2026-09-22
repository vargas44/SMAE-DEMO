import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { calculatePlanTotals, roundTotals } from "@/lib/smae/calculate";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await requireSession();
    const { id } = await params;

    const plan = await prisma.mealPlan.findUnique({
      where: { id },
      include: {
        patient: { include: { user: { select: { id: true, name: true, email: true } } } },
        slots: {
          include: {
            items: { include: { food: { include: { group: true } } } },
          },
        },
        exchanges: {
          include: {
            fromFood: true,
            toFood: true,
            user: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 });
    }

    if (session.user.role === "NUTRIOLOGO" && plan.createdById !== session.user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    if (session.user.role === "PACIENTE" && plan.patient.userId !== session.user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const totals = roundTotals(
      calculatePlanTotals(plan.slots.flatMap((s) => s.items)),
    );

    return NextResponse.json({ ...plan, totals });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Error al obtener plan" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const session = await requireSession();
    if (session.user.role !== "NUTRIOLOGO") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const action = body.action as string | undefined;

    const plan = await prisma.mealPlan.findFirst({
      where: { id, createdById: session.user.id },
    });
    if (!plan) {
      return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 });
    }

    if (action === "activate") {
      await prisma.mealPlan.updateMany({
        where: { patientId: plan.patientId, status: "ACTIVE" },
        data: { status: "ARCHIVED" },
      });
      const updated = await prisma.mealPlan.update({
        where: { id },
        data: { status: "ACTIVE" },
      });
      return NextResponse.json(updated);
    }

    if (action === "archive") {
      const updated = await prisma.mealPlan.update({
        where: { id },
        data: { status: "ARCHIVED" },
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Error al actualizar plan" }, { status: 500 });
  }
}
