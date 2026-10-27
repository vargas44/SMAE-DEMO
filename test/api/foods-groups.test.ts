import { beforeEach, describe, expect, it, vi } from "vitest";

const requireSession = vi.fn();
const findManyGroups = vi.fn();

vi.mock("@/lib/session", () => ({
  requireSession: (...args: unknown[]) => requireSession(...args),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    foodGroup: {
      findMany: (...args: unknown[]) => findManyGroups(...args),
    },
  },
}));

import { GET } from "@/app/api/foods/groups/route";

describe("GET /api/foods/groups", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireSession.mockResolvedValue({
      user: { id: "u1", role: "NUTRIOLOGO" },
    });
    findManyGroups.mockResolvedValue([
      { id: "g1", code: "FRU", name: "Frutas", _count: { foods: 12 } },
    ]);
  });

  it("lista grupos del catálogo para usuarios autenticados", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data[0].code).toBe("FRU");
    expect(findManyGroups).toHaveBeenCalled();
  });

  it("responde 401 sin sesión", async () => {
    requireSession.mockRejectedValue(
      new Response(JSON.stringify({ error: "No autenticado" }), { status: 401 }),
    );
    const res = await GET();
    expect(res.status).toBe(401);
  });
});
