import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

const sendSchema = z.object({
  toUserId: z.string(),
  body: z.string().min(1).max(2000),
});

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession();
    const withUserId = req.nextUrl.searchParams.get("with");

    if (!withUserId) {
      return NextResponse.json({ error: "Falta parámetro with" }, { status: 400 });
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { fromUserId: session.user.id, toUserId: withUserId },
          { fromUserId: withUserId, toUserId: session.user.id },
        ],
      },
      orderBy: { createdAt: "asc" },
      include: {
        fromUser: { select: { id: true, name: true, role: true } },
      },
    });

    await prisma.message.updateMany({
      where: {
        fromUserId: withUserId,
        toUserId: session.user.id,
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    return NextResponse.json(messages);
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Error al cargar mensajes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const body = sendSchema.parse(await req.json());

    const message = await prisma.message.create({
      data: {
        fromUserId: session.user.id,
        toUserId: body.toUserId,
        body: body.body,
      },
      include: {
        fromUser: { select: { id: true, name: true, role: true } },
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (e) {
    if (e instanceof Response) return e;
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al enviar mensaje" }, { status: 500 });
  }
}
