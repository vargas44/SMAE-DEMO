import { describe, expect, it } from "vitest";
import {
  MEAL_SLOT_LABELS,
  MEAL_SLOT_ORDER,
  PLAN_STATUS_LABELS,
} from "@/lib/smae/groups";

describe("tiempos de comida SMAE", () => {
  it("tiene etiqueta en español para cada tiempo de comida", () => {
    for (const slot of MEAL_SLOT_ORDER) {
      expect(MEAL_SLOT_LABELS[slot]).toBeTruthy();
    }
    expect(MEAL_SLOT_LABELS.BREAKFAST).toBe("Desayuno");
    expect(MEAL_SLOT_LABELS.LUNCH).toBe("Comida");
    expect(MEAL_SLOT_LABELS.DINNER).toBe("Cena");
  });

  it("ordena el día de desayuno a colación nocturna", () => {
    expect(MEAL_SLOT_ORDER[0]).toBe("BREAKFAST");
    expect(MEAL_SLOT_ORDER.at(-1)).toBe("SNACK3");
    expect(MEAL_SLOT_ORDER).toHaveLength(6);
  });
});

describe("estados del plan", () => {
  it("traduce los estados al español", () => {
    expect(PLAN_STATUS_LABELS.DRAFT).toBe("Borrador");
    expect(PLAN_STATUS_LABELS.ACTIVE).toBe("Activo");
    expect(PLAN_STATUS_LABELS.ARCHIVED).toBe("Archivado");
  });
});
