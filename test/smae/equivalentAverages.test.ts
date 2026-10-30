import { describe, expect, it } from "vitest";
import { buildEquivalentAverages } from "@/lib/smae/equivalentAverages";

describe("buildEquivalentAverages", () => {
  it("devuelve vacío si no hay alimentos", () => {
    expect(buildEquivalentAverages([{ code: "VEG", name: "Verduras", foods: [] }])).toEqual(
      [],
    );
  });

  it("toma el aporte del primer alimento de cada grupo", () => {
    const rows = buildEquivalentAverages([
      {
        code: "VEG",
        name: "Verduras",
        foods: [
          { subtype: null, energyKcal: 25, proteinG: 2, lipidG: 0, carbG: 4 },
          { subtype: null, energyKcal: 25, proteinG: 2, lipidG: 0, carbG: 4 },
        ],
      },
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      group: "Verduras",
      subgroup: "",
      energyKcal: 25,
      proteinG: 2,
      lipidG: 0,
      carbG: 4,
      showGroup: true,
      rowSpan: 1,
      highlight: { protein: false, lipid: false, carb: true },
    });
  });

  it("agrupa AOA con rowspan y destaca proteína", () => {
    const rows = buildEquivalentAverages([
      {
        code: "AOA_M",
        name: "Alimentos de origen animal (moderado en grasa)",
        foods: [{ subtype: "moderado", energyKcal: 75, proteinG: 7, lipidG: 5, carbG: 0 }],
      },
      {
        code: "AOA_B",
        name: "Alimentos de origen animal (bajo en grasa)",
        foods: [{ subtype: "bajo", energyKcal: 40, proteinG: 7, lipidG: 1, carbG: 0 }],
      },
    ]);
    expect(rows.map((r) => r.subgroup)).toEqual(["Bajo en grasa", "Moderado en grasa"]);
    expect(rows[0]).toMatchObject({
      group: "Alimentos de origen animal",
      showGroup: true,
      rowSpan: 2,
      highlight: { protein: true, lipid: true, carb: false },
    });
    expect(rows[1]).toMatchObject({
      showGroup: false,
      rowSpan: 1,
      highlight: { protein: true, lipid: true, carb: false },
    });
  });

  it("en leguminosas destaca proteína y no hidratos", () => {
    const rows = buildEquivalentAverages([
      {
        code: "LEG",
        name: "Leguminosas",
        foods: [{ subtype: null, energyKcal: 120, proteinG: 8, lipidG: 1, carbG: 20 }],
      },
    ]);
    expect(rows[0]?.highlight).toEqual({ protein: true, lipid: false, carb: false });
  });
});
