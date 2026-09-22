import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const requireRole = vi.fn();
const findUniqueProfile = vi.fn();
const findUniqueItem = vi.fn();
const findUniqueFood = vi.fn();
const updateItem = vi.fn();
const createExchange = vi.fn();
const transaction = vi.fn();

vi.mock("@/lib/session", () => ({
  requireRole: (...args: unknown[]) => requireRole(...args),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    patientProfile: { findUnique: (...args: unknown[]) => findUniqueProfile(...args) },
    planItem: {
      findUnique: (...args: unknown[]) => findUniqueItem(...args),
      update: (...args: unknown[]) => updateItem(...args),
    },
    food: { findUnique: (...args: unknown[]) => findUniqueFood(...args) },
    exchangeLog: { create: (...args: unknown[]) => createExchange(...args) },
    $transaction: (...args: unknown[]) => transaction(...args),
  },
}));

import { POST } from "@/app/api/exchanges/route";

function postJson(body: unknown) {
  return new NextRequest("http://localhost/api/exchanges", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

const fromFood = {
  id: "food-manzana",
  groupId: "FRU",
  subtype: null,
  name: "Manzana",
};

const toFood = {
  id: "food-pera",
  groupId: "FRU",
  subtype: null,
  name: "Pera",
};

const activeItem = {
  id: "item-1",
  foodId: fromFood.id,
  servings: 1,
  food: fromFood,
  mealSlot: {
    planId: "plan-1",
    plan: {
      patientId: "patient-1",
      status: "ACTIVE",
    },
  },
};

describe("POST /api/exchanges", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireRole.mockResolvedValue({
      user: { id: "user-paciente", role: "PACIENTE" },
    });
    findUniqueProfile.mockResolvedValue({ id: "patient-1", userId: "user-paciente" });
    findUniqueItem.mockResolvedValue(activeItem);
    findUniqueFood.mockResolvedValue(toFood);
    updateItem.mockResolvedValue({
      id: "item-1",
      foodId: toFood.id,
      food: { ...toFood, group: { name: "Frutas" } },
    });
    createExchange.mockResolvedValue({ id: "log-1" });
    transaction.mockImplementation(async (ops: Promise<unknown>[]) => Promise.all(ops));
  });

  it("intercambia un equivalente válido y registra el log", async () => {
    const res = await POST(
      postJson({ planItemId: "item-1", toFoodId: "food-pera" }),
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.foodId).toBe("food-pera");
    expect(transaction).toHaveBeenCalled();
  });

  it("rechaza intercambio entre grupos distintos", async () => {
    findUniqueFood.mockResolvedValue({
      id: "food-tortilla",
      groupId: "CER",
      subtype: null,
      name: "Tortilla",
    });

    const res = await POST(
      postJson({ planItemId: "item-1", toFoodId: "food-tortilla" }),
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/mismo grupo/i);
  });

  it("rechaza modificar un plan que no está activo", async () => {
    findUniqueItem.mockResolvedValue({
      ...activeItem,
      mealSlot: {
        ...activeItem.mealSlot,
        plan: { patientId: "patient-1", status: "DRAFT" },
      },
    });

    const res = await POST(
      postJson({ planItemId: "item-1", toFoodId: "food-pera" }),
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/activos/i);
  });

  it("responde 404 si el ítem no pertenece al paciente", async () => {
    findUniqueItem.mockResolvedValue({
      ...activeItem,
      mealSlot: {
        ...activeItem.mealSlot,
        plan: { patientId: "otro-paciente", status: "ACTIVE" },
      },
    });

    const res = await POST(
      postJson({ planItemId: "item-1", toFoodId: "food-pera" }),
    );
    expect(res.status).toBe(404);
  });

  it("propaga 403 si requireRole falla", async () => {
    requireRole.mockRejectedValue(
      new Response(JSON.stringify({ error: "No autorizado" }), { status: 403 }),
    );
    const res = await POST(
      postJson({ planItemId: "item-1", toFoodId: "food-pera" }),
    );
    expect(res.status).toBe(403);
  });
});
