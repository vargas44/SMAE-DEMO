import { auth } from "@/lib/auth";
import type { Role } from "@prisma/client";

export async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Response(JSON.stringify({ error: "No autenticado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return session;
}

export async function requireRole(role: Role) {
  const session = await requireSession();
  if (session.user.role !== role) {
    throw new Response(JSON.stringify({ error: "No autorizado" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }
  return session;
}
