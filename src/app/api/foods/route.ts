import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    await requireSession();
    const group = req.nextUrl.searchParams.get("group");
    const q = req.nextUrl.searchParams.get("q")?.trim();

    const foods = await prisma.food.findMany({
      where: {
        AND: [
          group ? { group: { code: group } } : {},
          q
            ? {
                OR: [
                  { name: { contains: q } },
                  { group: { name: { contains: q } } },
                ],
              }
            : {},
        ],
      },
      include: { group: true },
      orderBy: [{ group: { name: "asc" } }, { name: "asc" }],
      take: 300,
    });

    return NextResponse.json(foods);
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Error al listar alimentos" }, { status: 500 });
  }
}
