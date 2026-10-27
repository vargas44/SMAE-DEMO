import { describe, expect, it } from "vitest";
import {
  calculatePlanTotals,
  energyProgressPct,
  roundTotals,
} from "@/lib/smae/calculate";
import { validateExchange } from "@/lib/smae/validateExchange";

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

const arroz = {
  energyKcal: 70,
  proteinG: 2,
  lipidG: 0,
  carbG: 15,
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

  it("respeta la cantidad de decimales pedida", () => {
    expect(
      roundTotals(
        {
          energyKcal: 70.166,
          proteinG: 2.044,
          lipidG: 0.049,
          carbG: 15.555,
          servings: 1.249,
        },
        2,
      ),
    ).toEqual({
      energyKcal: 70.17,
      proteinG: 2.04,
      lipidG: 0.05,
      carbG: 15.56,
      servings: 1.25,
    });
  });
});

describe("energyProgressPct", () => {
  it("calcula el % de energía respecto a la meta", () => {
    expect(energyProgressPct(1105, 1800)).toBe(61);
    expect(energyProgressPct(900, 1800)).toBe(50);
    expect(energyProgressPct(1800, 1800)).toBe(100);
  });

  it("permite superar el 100% si el plan se pasa de la meta", () => {
    expect(energyProgressPct(2160, 1800)).toBe(120);
  });

  it("devuelve 0 sin meta válida", () => {
    expect(energyProgressPct(1105, null)).toBe(0);
    expect(energyProgressPct(1105, 0)).toBe(0);
    expect(energyProgressPct(1105, undefined)).toBe(0);
    expect(energyProgressPct(1105, -100)).toBe(0);
  });
});

describe("invariante SMAE: intercambio válido no cambia totales", () => {
  it("conserva energía y macros al cambiar tortilla por arroz (mismo grupo y raciones)", () => {
    const from = { id: "cer-tortilla", groupId: "CER", subtype: null };
    const to = { id: "cer-arroz", groupId: "CER", subtype: null };
    expect(validateExchange(from, to, 2)).toEqual({ ok: true });

    const antes = calculatePlanTotals([
      { food: tortilla, servings: 2 },
      { food: pechuga, servings: 1 },
    ]);
    const despues = calculatePlanTotals([
      { food: arroz, servings: 2 },
      { food: pechuga, servings: 1 },
    ]);

    expect(despues).toEqual(antes);
  });
});
