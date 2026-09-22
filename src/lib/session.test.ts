import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Role } from "@prisma/client";

const authMock = vi.fn();

vi.mock("@/lib/auth", () => ({
  auth: () => authMock(),
}));

import { requireRole, requireSession } from "@/lib/session";

function session(role: Role, id = "user-1") {
  return {
    user: {
      id,
      email: `${role.toLowerCase()}@demo.com`,
      name: "Demo",
      role,
    },
  };
}

describe("requireSession / requireRole", () => {
  beforeEach(() => {
    authMock.mockReset();
  });

  it("exige sesión autenticada", async () => {
    authMock.mockResolvedValue(null);
    await expect(requireSession()).rejects.toBeInstanceOf(Response);
    try {
      await requireSession();
    } catch (e) {
      expect((e as Response).status).toBe(401);
    }
  });

  it("permite sesión válida", async () => {
    authMock.mockResolvedValue(session("NUTRIOLOGO"));
    const result = await requireSession();
    expect(result.user.role).toBe("NUTRIOLOGO");
  });

  it("bloquea rol incorrecto con 403", async () => {
    authMock.mockResolvedValue(session("PACIENTE"));
    try {
      await requireRole("NUTRIOLOGO");
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(Response);
      expect((e as Response).status).toBe(403);
    }
  });

  it("acepta el rol requerido", async () => {
    authMock.mockResolvedValue(session("PACIENTE"));
    const result = await requireRole("PACIENTE");
    expect(result.user.id).toBe("user-1");
  });
});
