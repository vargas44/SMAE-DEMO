import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

const schema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  breakfast: z.boolean().optional(),
  snack1: z.boolean().optional(),
  lunch: z.boolean().optional(),
  snack2: z.boolean().optional(),
  dinner: z.boolean().optional(),
  snack3: z.boolean().optional(),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await requireRole("PACIENTE");
    const date = req.nextUrl.searchParams.get("date");
    const profile = await prisma.patientProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!profile) {
      return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
    }

    if (date) {
      const row = await prisma.dailyAdherence.findUnique({
        where: { patientId_date: { patientId: profile.id, date } },
      });
      return NextResponse.json(row);
    }

    const rows = await prisma.dailyAdherence.findMany({
      where: { patientId: profile.id },
      orderBy: { date: "desc" },
      take: 30,
    });
    return NextResponse.json(rows);
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Error al obtener adherencia" }, { status: 500 });
  }
}

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

    const row = await prisma.dailyAdherence.upsert({
      where: {
        patientId_date: { patientId: profile.id, date: body.date },
      },
      create: {
        patientId: profile.id,
        date: body.date,
        breakfast: body.breakfast ?? false,
        snack1: body.snack1 ?? false,
        lunch: body.lunch ?? false,
        snack2: body.snack2 ?? false,
        dinner: body.dinner ?? false,
        snack3: body.snack3 ?? false,
        notes: body.notes,
      },
      update: {
        breakfast: body.breakfast,
        snack1: body.snack1,
        lunch: body.lunch,
        snack2: body.snack2,
        dinner: body.dinner,
        snack3: body.snack3,
        notes: body.notes,
      },
    });

    return NextResponse.json(row);
  } catch (e) {
    if (e instanceof Response) return e;
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al guardar adherencia" }, { status: 500 });
  }
}
