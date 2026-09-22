import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const requireSession = vi.fn();
const findManyMessages = vi.fn();
const updateManyMessages = vi.fn();
const createMessage = vi.fn();

vi.mock("@/lib/session", () => ({
  requireSession: (...args: unknown[]) => requireSession(...args),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    message: {
      findMany: (...args: unknown[]) => findManyMessages(...args),
      updateMany: (...args: unknown[]) => updateManyMessages(...args),
      create: (...args: unknown[]) => createMessage(...args),
    },
  },
}));

import { GET, POST } from "@/app/api/messages/route";

function postJson(body: unknown) {
  return new NextRequest("http://localhost/api/messages", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("GET /api/messages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireSession.mockResolvedValue({
      user: { id: "nutri-1", role: "NUTRIOLOGO" },
    });
    findManyMessages.mockResolvedValue([
      { id: "m1", body: "Hola", fromUserId: "nutri-1" },
    ]);
    updateManyMessages.mockResolvedValue({ count: 0 });
  });

  it("lista el hilo con otro usuario y marca leídos", async () => {
    const res = await GET(
      new NextRequest("http://localhost/api/messages?with=pac-1"),
    );
    expect(res.status).toBe(200);
    expect(findManyMessages).toHaveBeenCalled();
    expect(updateManyMessages).toHaveBeenCalled();
  });

  it("exige parámetro with", async () => {
    const res = await GET(new NextRequest("http://localhost/api/messages"));
    expect(res.status).toBe(400);
  });
});

describe("POST /api/messages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireSession.mockResolvedValue({
      user: { id: "nutri-1", role: "NUTRIOLOGO" },
    });
    createMessage.mockResolvedValue({
      id: "m2",
      body: "Seguimos el plan",
      fromUser: { id: "nutri-1", name: "Ana", role: "NUTRIOLOGO" },
    });
  });

  it("envía un mensaje", async () => {
    const res = await POST(
      postJson({ toUserId: "pac-1", body: "Seguimos el plan" }),
    );
    expect(res.status).toBe(201);
    expect(createMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          fromUserId: "nutri-1",
          toUserId: "pac-1",
        }),
      }),
    );
  });

  it("valida body vacío", async () => {
    const res = await POST(postJson({ toUserId: "pac-1", body: "" }));
    expect(res.status).toBe(400);
  });
});
