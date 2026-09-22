import { describe, expect, it } from "vitest";
import { MEAL_SLOT_LABELS, MEAL_SLOT_ORDER } from "@/lib/smae/groups";

describe("grupos / tiempos de comida SMAE", () => {
  it("tiene etiqueta para cada tiempo de comida", () => {
    for (const slot of MEAL_SLOT_ORDER) {
      expect(MEAL_SLOT_LABELS[slot]).toBeTruthy();
    }
  });

  it("ordena el día de desayuno a colación nocturna", () => {
    expect(MEAL_SLOT_ORDER[0]).toBe("BREAKFAST");
    expect(MEAL_SLOT_ORDER.at(-1)).toBe("SNACK3");
    expect(MEAL_SLOT_ORDER).toHaveLength(6);
  });
});
