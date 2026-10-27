import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const requireRole = vi.fn();
const findUniqueProfile = vi.fn();
const findUniqueAdherence = vi.fn();
const findManyAdherence = vi.fn();
const upsertAdherence = vi.fn();

vi.mock("@/lib/session", () => ({
  requireRole: (...args: unknown[]) => requireRole(...args),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    patientProfile: {
      findUnique: (...args: unknown[]) => findUniqueProfile(...args),
    },
    dailyAdherence: {
      findUnique: (...args: unknown[]) => findUniqueAdherence(...args),
      findMany: (...args: unknown[]) => findManyAdherence(...args),
      upsert: (...args: unknown[]) => upsertAdherence(...args),
    },
  },
}));

import { GET, POST } from "@/app/api/adherence/route";

function postJson(body: unknown) {
  return new NextRequest("http://localhost/api/adherence", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("GET /api/adherence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireRole.mockResolvedValue({
      user: { id: "user-pac", role: "PACIENTE" },
    });
    findUniqueProfile.mockResolvedValue({ id: "patient-1", userId: "user-pac" });
  });

  it("devuelve adherencia de un día concreto", async () => {
    findUniqueAdherence.mockResolvedValue({
      date: "2026-09-22",
      breakfast: true,
      lunch: true,
    });
    const res = await GET(
      new NextRequest("http://localhost/api/adherence?date=2026-09-22"),
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.breakfast).toBe(true);
    expect(findUniqueAdherence).toHaveBeenCalled();
  });

  it("lista historial reciente si no hay date", async () => {
    findManyAdherence.mockResolvedValue([{ date: "2026-09-21" }]);
    const res = await GET(new NextRequest("http://localhost/api/adherence"));
    expect(res.status).toBe(200);
    expect(findManyAdherence).toHaveBeenCalled();
  });

  it("responde 404 sin perfil de paciente", async () => {
    findUniqueProfile.mockResolvedValue(null);
    const res = await GET(new NextRequest("http://localhost/api/adherence"));
    expect(res.status).toBe(404);
  });
});

describe("POST /api/adherence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireRole.mockResolvedValue({
      user: { id: "user-pac", role: "PACIENTE" },
    });
    findUniqueProfile.mockResolvedValue({ id: "patient-1", userId: "user-pac" });
    upsertAdherence.mockResolvedValue({
      date: "2026-09-22",
      breakfast: true,
      lunch: false,
    });
  });

  it("guarda adherencia diaria con upsert", async () => {
    const res = await POST(
      postJson({
        date: "2026-09-22",
        breakfast: true,
        lunch: false,
        notes: "Ok",
      }),
    );
    expect(res.status).toBe(200);
    expect(upsertAdherence).toHaveBeenCalled();
    const arg = upsertAdherence.mock.calls[0][0];
    expect(arg.create.patientId).toBe("patient-1");
    expect(arg.create.breakfast).toBe(true);
  });

  it("valida formato de fecha", async () => {
    const res = await POST(postJson({ date: "22-09-2026", breakfast: true }));
    expect(res.status).toBe(400);
  });

  it("propaga 403 si el rol no es paciente", async () => {
    requireRole.mockRejectedValue(
      new Response(JSON.stringify({ error: "No autorizado" }), { status: 403 }),
    );
    const res = await POST(postJson({ date: "2026-09-22", breakfast: true }));
    expect(res.status).toBe(403);
  });
});
