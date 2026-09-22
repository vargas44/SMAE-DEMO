import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { Role } from "@prisma/client";

const requireSession = vi.fn();
const findUniquePlan = vi.fn();
const findFirstPlan = vi.fn();
const updateManyPlans = vi.fn();
const updatePlan = vi.fn();

vi.mock("@/lib/session", () => ({
  requireSession: (...args: unknown[]) => requireSession(...args),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    mealPlan: {
      findUnique: (...args: unknown[]) => findUniquePlan(...args),
      findFirst: (...args: unknown[]) => findFirstPlan(...args),
      updateMany: (...args: unknown[]) => updateManyPlans(...args),
      update: (...args: unknown[]) => updatePlan(...args),
    },
  },
}));

import { GET, POST } from "@/app/api/plans/[id]/route";

const params = Promise.resolve({ id: "plan-1" });

describe("GET /api/plans/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireSession.mockResolvedValue({
      user: { id: "nutri-1", role: Role.NUTRIOLOGO },
    });
    findUniquePlan.mockResolvedValue({
      id: "plan-1",
      createdById: "nutri-1",
      targetKcal: 1800,
      patient: { userId: "pac-1", user: { name: "Carlos" } },
      slots: [
        {
          items: [
            {
              servings: 1,
              food: { energyKcal: 70, proteinG: 2, lipidG: 0, carbG: 15 },
            },
          ],
        },
      ],
      exchanges: [],
    });
  });

  it("devuelve plan con totales", async () => {
    const res = await GET(new NextRequest("http://localhost/api/plans/plan-1"), {
      params,
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.totals.energyKcal).toBe(70);
    expect(data.targetKcal).toBe(1800);
  });

  it("bloquea a otro nutriólogo", async () => {
    findUniquePlan.mockResolvedValue({
      id: "plan-1",
      createdById: "otro-nutri",
      patient: { userId: "pac-1" },
      slots: [],
      exchanges: [],
    });
    const res = await GET(new NextRequest("http://localhost/api/plans/plan-1"), {
      params,
    });
    expect(res.status).toBe(403);
  });
});

describe("POST /api/plans/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireSession.mockResolvedValue({
      user: { id: "nutri-1", role: Role.NUTRIOLOGO },
    });
    findFirstPlan.mockResolvedValue({
      id: "plan-1",
      patientId: "patient-1",
      createdById: "nutri-1",
    });
    updateManyPlans.mockResolvedValue({ count: 1 });
    updatePlan.mockResolvedValue({ id: "plan-1", status: "ACTIVE" });
  });

  it("activa un plan y archiva el anterior", async () => {
    const res = await POST(
      new NextRequest("http://localhost/api/plans/plan-1", {
        method: "POST",
        body: JSON.stringify({ action: "activate" }),
        headers: { "Content-Type": "application/json" },
      }),
      { params },
    );
    expect(res.status).toBe(200);
    expect(updateManyPlans).toHaveBeenCalled();
    expect(updatePlan).toHaveBeenCalledWith({
      where: { id: "plan-1" },
      data: { status: "ACTIVE" },
    });
  });

  it("rechaza acción inválida", async () => {
    const res = await POST(
      new NextRequest("http://localhost/api/plans/plan-1", {
        method: "POST",
        body: JSON.stringify({ action: "borrar" }),
        headers: { "Content-Type": "application/json" },
      }),
      { params },
    );
    expect(res.status).toBe(400);
  });
});
