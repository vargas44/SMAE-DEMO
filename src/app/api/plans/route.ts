import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { MealSlotType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { calculatePlanTotals, roundTotals } from "@/lib/smae/calculate";
import { MEAL_SLOT_LABELS } from "@/lib/smae/groups";

const itemSchema = z.object({
  foodId: z.string(),
  servings: z.number().positive(),
});

const slotSchema = z.object({
  type: z.enum(["BREAKFAST", "SNACK1", "LUNCH", "SNACK2", "DINNER", "SNACK3"]),
  items: z.array(itemSchema).min(1),
});

const createSchema = z.object({
  patientId: z.string(),
  title: z.string().min(2),
  notes: z.string().optional(),
  activate: z.boolean().optional(),
  slots: z.array(slotSchema).min(1),
});

async function loadPlanWithTotals(planId: string) {
  const plan = await prisma.mealPlan.findUnique({
    where: { id: planId },
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
        take: 20,
      },
    },
  });
  if (!plan) return null;

  const flatItems = plan.slots.flatMap((s) => s.items);
  const totals = roundTotals(calculatePlanTotals(flatItems));
  return { ...plan, totals };
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession();
    const patientId = req.nextUrl.searchParams.get("patientId");
    const status = req.nextUrl.searchParams.get("status");

    if (session.user.role === "PACIENTE") {
      const profile = await prisma.patientProfile.findUnique({
        where: { userId: session.user.id },
      });
      if (!profile) {
        return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
      }
      const plans = await prisma.mealPlan.findMany({
        where: {
          patientId: profile.id,
          ...(status ? { status: status as "DRAFT" | "ACTIVE" | "ARCHIVED" } : {}),
        },
        orderBy: { updatedAt: "desc" },
        include: {
          slots: { include: { items: { include: { food: { include: { group: true } } } } } },
        },
      });
      const withTotals = plans.map((p) => ({
        ...p,
        totals: roundTotals(
          calculatePlanTotals(p.slots.flatMap((s) => s.items)),
        ),
      }));
      return NextResponse.json(withTotals);
    }

    const plans = await prisma.mealPlan.findMany({
      where: {
        createdById: session.user.id,
        ...(patientId ? { patientId } : {}),
        ...(status ? { status: status as "DRAFT" | "ACTIVE" | "ARCHIVED" } : {}),
      },
      orderBy: { updatedAt: "desc" },
      include: {
        patient: { include: { user: { select: { name: true, email: true } } } },
        slots: { include: { items: { include: { food: true } } } },
      },
    });

    return NextResponse.json(
      plans.map((p) => ({
        ...p,
        totals: roundTotals(
          calculatePlanTotals(p.slots.flatMap((s) => s.items)),
        ),
      })),
    );
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Error al listar planes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    if (session.user.role !== "NUTRIOLOGO") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = createSchema.parse(await req.json());
    const patient = await prisma.patientProfile.findFirst({
      where: { id: body.patientId, nutritionistId: session.user.id },
    });
    if (!patient) {
      return NextResponse.json({ error: "Paciente no encontrado" }, { status: 404 });
    }

    if (body.activate) {
      await prisma.mealPlan.updateMany({
        where: { patientId: body.patientId, status: "ACTIVE" },
        data: { status: "ARCHIVED" },
      });
    }

    const plan = await prisma.mealPlan.create({
      data: {
        patientId: body.patientId,
        createdById: session.user.id,
        title: body.title,
        notes: body.notes,
        status: body.activate ? "ACTIVE" : "DRAFT",
        slots: {
          create: body.slots.map((slot) => ({
            type: slot.type as MealSlotType,
            label: MEAL_SLOT_LABELS[slot.type as MealSlotType],
            items: {
              create: slot.items.map((item) => ({
                foodId: item.foodId,
                servings: item.servings,
              })),
            },
          })),
        },
      },
    });

    const full = await loadPlanWithTotals(plan.id);
    return NextResponse.json(full, { status: 201 });
  } catch (e) {
    if (e instanceof Response) return e;
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Error al crear plan" }, { status: 500 });
  }
}
