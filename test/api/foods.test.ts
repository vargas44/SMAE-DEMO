import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const requireSession = vi.fn();
const findManyFoods = vi.fn();

vi.mock("@/lib/session", () => ({
  requireSession: (...args: unknown[]) => requireSession(...args),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    food: {
      findMany: (...args: unknown[]) => findManyFoods(...args),
    },
  },
}));

import { GET } from "@/app/api/foods/route";

describe("GET /api/foods", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireSession.mockResolvedValue({
      user: { id: "u1", role: "NUTRIOLOGO" },
    });
    findManyFoods.mockResolvedValue([
      { id: "1", name: "Manzana", group: { code: "FRU", name: "Frutas" } },
    ]);
  });

  it("lista alimentos del catálogo para usuarios autenticados", async () => {
    const req = new NextRequest("http://localhost/api/foods");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(1);
    expect(data[0].name).toBe("Manzana");
  });

  it("aplica filtros de grupo y búsqueda", async () => {
    const req = new NextRequest("http://localhost/api/foods?group=FRU&q=manz");
    await GET(req);
    expect(findManyFoods).toHaveBeenCalled();
    const arg = findManyFoods.mock.calls[0][0];
    expect(arg.where.AND).toEqual(
      expect.arrayContaining([
        { group: { code: "FRU" } },
        expect.objectContaining({
          OR: expect.any(Array),
        }),
      ]),
    );
  });

  it("responde 401 sin sesión", async () => {
    requireSession.mockRejectedValue(
      new Response(JSON.stringify({ error: "No autenticado" }), { status: 401 }),
    );
    const res = await GET(new NextRequest("http://localhost/api/foods"));
    expect(res.status).toBe(401);
  });
});
