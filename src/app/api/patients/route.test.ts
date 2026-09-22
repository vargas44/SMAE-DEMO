import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { Role } from "@prisma/client";

const requireRole = vi.fn();
const findManyPatients = vi.fn();
const findUniqueUser = vi.fn();
const createPatient = vi.fn();

vi.mock("@/lib/session", () => ({
  requireRole: (...args: unknown[]) => requireRole(...args),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    patientProfile: {
      findMany: (...args: unknown[]) => findManyPatients(...args),
      create: (...args: unknown[]) => createPatient(...args),
    },
    user: {
      findUnique: (...args: unknown[]) => findUniqueUser(...args),
    },
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn(async () => "hashed"),
  },
}));

import { GET, POST } from "@/app/api/patients/route";

function postJson(body: unknown) {
  return new NextRequest("http://localhost/api/patients", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("GET /api/patients", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireRole.mockResolvedValue({
      user: { id: "nutri-1", role: Role.NUTRIOLOGO },
    });
    findManyPatients.mockResolvedValue([
      { id: "p1", user: { name: "Carlos", email: "paciente@demo.com" } },
    ]);
  });

  it("lista pacientes del nutriólogo", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data[0].user.name).toBe("Carlos");
    expect(findManyPatients).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { nutritionistId: "nutri-1" },
      }),
    );
  });

  it("propaga 403 si no es nutriólogo", async () => {
    requireRole.mockRejectedValue(
      new Response(JSON.stringify({ error: "No autorizado" }), { status: 403 }),
    );
    const res = await GET();
    expect(res.status).toBe(403);
  });
});

describe("POST /api/patients", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireRole.mockResolvedValue({
      user: { id: "nutri-1", role: Role.NUTRIOLOGO },
    });
    findUniqueUser.mockResolvedValue(null);
    createPatient.mockResolvedValue({
      id: "p-new",
      user: { id: "u-new", name: "Ana", email: "ana@demo.com" },
    });
  });

  it("crea un paciente nuevo", async () => {
    const res = await POST(
      postJson({
        name: "Ana López",
        email: "ana@demo.com",
        age: 30,
        goal: "Bajar grasa",
      }),
    );
    expect(res.status).toBe(201);
    expect(createPatient).toHaveBeenCalled();
    const data = await res.json();
    expect(data.user.email).toBe("ana@demo.com");
  });

  it("rechaza email duplicado", async () => {
    findUniqueUser.mockResolvedValue({ id: "exists" });
    const res = await POST(
      postJson({ name: "Ana", email: "paciente@demo.com" }),
    );
    expect(res.status).toBe(409);
  });

  it("valida el body", async () => {
    const res = await POST(postJson({ name: "A", email: "no-email" }));
    expect(res.status).toBe(400);
  });
});
