import { describe, expect, it } from "vitest";
import { validateExchange } from "@/lib/smae/validateExchange";

const manzana = {
  id: "fruta-manzana",
  groupId: "FRU",
  subtype: null,
};

const pera = {
  id: "fruta-pera",
  groupId: "FRU",
  subtype: null,
};

const tortilla = {
  id: "cer-tortilla",
  groupId: "CER",
  subtype: null,
};

const pechugaBaja = {
  id: "aoa-pechuga",
  groupId: "AOA",
  subtype: "bajo",
};

const huevoModerado = {
  id: "aoa-huevo",
  groupId: "AOA",
  subtype: "moderado",
};

const claraBaja = {
  id: "aoa-clara",
  groupId: "AOA",
  subtype: "bajo",
};

describe("validateExchange", () => {
  it("acepta intercambio 1:1 dentro del mismo grupo", () => {
    expect(validateExchange(manzana, pera, 1)).toEqual({ ok: true });
  });

  it("rechaza el mismo alimento", () => {
    const result = validateExchange(manzana, manzana, 1);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toMatch(/distinto/i);
    }
  });

  it("rechaza raciones inválidas", () => {
    const result = validateExchange(manzana, pera, 0);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toMatch(/raciones/i);
    }
  });

  it("rechaza alimentos de distinto grupo SMAE", () => {
    const result = validateExchange(manzana, tortilla, 1);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toMatch(/mismo grupo/i);
    }
  });

  it("rechaza distinto subtipo (AOA bajo vs moderado)", () => {
    const result = validateExchange(pechugaBaja, huevoModerado, 1);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toMatch(/subtipo/i);
    }
  });

  it("acepta mismo grupo y mismo subtipo", () => {
    expect(validateExchange(pechugaBaja, claraBaja, 2)).toEqual({ ok: true });
  });
});
