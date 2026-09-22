import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { Role } from "@prisma/client";

const requireSession = vi.fn();
const findFirstPatient = vi.fn();
const updateManyPlans = vi.fn();
const createPlan = vi.fn();
const findUniquePlan = vi.fn();

vi.mock("@/lib/session", () => ({
  requireSession: (...args: unknown[]) => requireSession(...args),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    patientProfile: {
      findFirst: (...args: unknown[]) => findFirstPatient(...args),
    },
    mealPlan: {
      updateMany: (...args: unknown[]) => updateManyPlans(...args),
      create: (...args: unknown[]) => createPlan(...args),
      findUnique: (...args: unknown[]) => findUniquePlan(...args),
    },
  },
}));

import { POST } from "@/app/api/plans/route";

function postJson(body: unknown) {
  return new NextRequest("http://localhost/api/plans", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/plans", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireSession.mockResolvedValue({
      user: { id: "nutri-1", role: Role.NUTRIOLOGO },
    });
    findFirstPatient.mockResolvedValue({ id: "patient-1", nutritionistId: "nutri-1" });
    createPlan.mockResolvedValue({ id: "plan-nuevo" });
    findUniquePlan.mockResolvedValue({
      id: "plan-nuevo",
      title: "Plan demo",
      status: "ACTIVE",
      slots: [
        {
          items: [
            {
              servings: 2,
              food: { energyKcal: 70, proteinG: 2, lipidG: 0, carbG: 15 },
            },
          ],
        },
      ],
      patient: { user: { name: "Carlos" } },
      exchanges: [],
    });
  });

  it("crea un plan activo y archiva el anterior", async () => {
    const res = await POST(
      postJson({
        patientId: "patient-1",
        title: "Plan demo",
        targetKcal: 1800,
        activate: true,
        slots: [
          {
            type: "BREAKFAST",
            items: [{ foodId: "food-1", servings: 2 }],
          },
        ],
      }),
    );

    expect(res.status).toBe(201);
    expect(updateManyPlans).toHaveBeenCalledWith({
      where: { patientId: "patient-1", status: "ACTIVE" },
      data: { status: "ARCHIVED" },
    });
    expect(createPlan).toHaveBeenCalled();
    const createArg = createPlan.mock.calls[0][0];
    expect(createArg.data.targetKcal).toBe(1800);
    const data = await res.json();
    expect(data.totals.energyKcal).toBe(140);
  });

  it("rechaza creación si el usuario no es nutriólogo", async () => {
    requireSession.mockResolvedValue({
      user: { id: "pac-1", role: Role.PACIENTE },
    });
    const res = await POST(
      postJson({
        patientId: "patient-1",
        title: "Plan",
        targetKcal: 1500,
        slots: [{ type: "LUNCH", items: [{ foodId: "f1", servings: 1 }] }],
      }),
    );
    expect(res.status).toBe(403);
  });

  it("valida el body del plan", async () => {
    const res = await POST(postJson({ patientId: "patient-1", title: "x" }));
    expect(res.status).toBe(400);
  });

  it("exige targetKcal positivo", async () => {
    const res = await POST(
      postJson({
        patientId: "patient-1",
        title: "Plan sin meta",
        targetKcal: 0,
        slots: [{ type: "LUNCH", items: [{ foodId: "f1", servings: 1 }] }],
      }),
    );
    expect(res.status).toBe(400);
  });
});
