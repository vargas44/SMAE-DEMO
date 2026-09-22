import { describe, expect, it } from "vitest";
import {
  calculatePlanTotals,
  roundTotals,
} from "@/lib/smae/calculate";

const tortilla = {
  energyKcal: 70,
  proteinG: 2,
  lipidG: 0,
  carbG: 15,
};

const pechuga = {
  energyKcal: 40,
  proteinG: 7,
  lipidG: 1,
  carbG: 0,
};

describe("calculatePlanTotals", () => {
  it("devuelve ceros cuando no hay ítems", () => {
    expect(calculatePlanTotals([])).toEqual({
      energyKcal: 0,
      proteinG: 0,
      lipidG: 0,
      carbG: 0,
      servings: 0,
    });
  });

  it("suma macros respetando las raciones (equivalentes)", () => {
    const totals = calculatePlanTotals([
      { food: tortilla, servings: 2 },
      { food: pechuga, servings: 1 },
    ]);

    expect(totals).toEqual({
      energyKcal: 180,
      proteinG: 11,
      lipidG: 1,
      carbG: 30,
      servings: 3,
    });
  });

  it("soporta raciones fraccionarias", () => {
    const totals = calculatePlanTotals([{ food: tortilla, servings: 0.5 }]);
    expect(totals.energyKcal).toBe(35);
    expect(totals.carbG).toBe(7.5);
    expect(totals.servings).toBe(0.5);
  });
});

describe("roundTotals", () => {
  it("redondea a 1 decimal por defecto", () => {
    expect(
      roundTotals({
        energyKcal: 70.16,
        proteinG: 2.04,
        lipidG: 0.05,
        carbG: 15.55,
        servings: 1.25,
      }),
    ).toEqual({
      energyKcal: 70.2,
      proteinG: 2,
      lipidG: 0.1,
      carbG: 15.6,
      servings: 1.3,
    });
  });
});
