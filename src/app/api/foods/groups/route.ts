import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export async function GET() {
  try {
    await requireSession();
    const groups = await prisma.foodGroup.findMany({
      include: { _count: { select: { foods: true } } },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(groups);
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Error al listar grupos" }, { status: 500 });
  }
}
