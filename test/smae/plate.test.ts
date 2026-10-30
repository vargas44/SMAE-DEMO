import { describe, expect, it } from "vitest";
import { buildPlateSlices } from "@/lib/smae/plate";

describe("buildPlateSlices", () => {
  it("devuelve vacío si no hay energía", () => {
    expect(buildPlateSlices([])).toEqual([]);
  });

  it("asigna 100% a un solo grupo", () => {
    const slices = buildPlateSlices([
      {
        servings: 2,
        food: {
          energyKcal: 70,
          group: { code: "CER", name: "Cereales y tubérculos" },
        },
      },
    ]);
    expect(slices).toHaveLength(1);
    expect(slices[0]?.code).toBe("CER");
    expect(slices[0]?.pct).toBe(100);
  });

  it("reparte porcentajes que suman 100", () => {
    const slices = buildPlateSlices([
      {
        servings: 3,
        food: {
          energyKcal: 70,
          group: { code: "CER", name: "Cereales y tubérculos" },
        },
      },
      {
        servings: 2,
        food: {
          energyKcal: 40,
          group: {
            code: "AOA_B",
            name: "Alimentos de origen animal (bajo en grasa)",
          },
        },
      },
    ]);
    const totalPct = slices.reduce((sum, s) => sum + s.pct, 0);
    expect(totalPct).toBe(100);
    expect(slices[0]?.code).toBe("CER");
  });
});
