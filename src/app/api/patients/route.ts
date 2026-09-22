import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6).optional().default("demo1234"),
  age: z.number().int().positive().optional(),
  sex: z.string().optional(),
  weightKg: z.number().positive().optional(),
  heightCm: z.number().positive().optional(),
  goal: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET() {
  try {
    const session = await requireRole("NUTRIOLOGO");
    const patients = await prisma.patientProfile.findMany({
      where: { nutritionistId: session.user.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        plans: {
          where: { status: "ACTIVE" },
          select: { id: true, title: true, status: true },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(patients);
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Error al listar pacientes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole("NUTRIOLOGO");
    const body = createSchema.parse(await req.json());

    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) {
      return NextResponse.json({ error: "El email ya está registrado" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(body.password, 10);
    const patient = await prisma.patientProfile.create({
      data: {
        age: body.age,
        sex: body.sex,
        weightKg: body.weightKg,
        heightCm: body.heightCm,
        goal: body.goal,
        notes: body.notes,
        nutritionist: { connect: { id: session.user.id } },
        user: {
          create: {
            email: body.email,
            name: body.name,
            role: Role.PACIENTE,
            passwordHash,
          },
        },
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json(patient, { status: 201 });
  } catch (e) {
    if (e instanceof Response) return e;
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al crear paciente" }, { status: 500 });
  }
}
