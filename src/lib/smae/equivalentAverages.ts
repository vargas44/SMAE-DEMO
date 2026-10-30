/** Aporte promedio por equivalente, derivado del catálogo demo.
 *  Para revertir: borrar este archivo, el test, EquivalentAveragesTable y el CSS su-eq. */

export type AverageFood = {
  subtype: string | null;
  energyKcal: number;
  proteinG: number;
  lipidG: number;
  carbG: number;
};

export type AverageGroup = {
  code: string;
  name: string;
  foods: AverageFood[];
};

export type EquivalentAverageRow = {
  code: string;
  group: string;
  subgroup: string;
  energyKcal: number;
  proteinG: number;
  lipidG: number;
  carbG: number;
  rowSpan: number;
  showGroup: boolean;
  highlight: {
    protein: boolean;
    lipid: boolean;
    carb: boolean;
  };
};

const GROUP_ORDER = [
  "VEG",
  "FRU",
  "CER",
  "LEG",
  "AOA_B",
  "AOA_M",
  "LAC_D",
  "LAC_S",
  "GRA",
  "AZU",
];

const DISPLAY: Record<string, { group: string; subgroup?: string }> = {
  VEG: { group: "Verduras" },
  FRU: { group: "Frutas" },
  CER: { group: "Cereales y tubérculos" },
  LEG: { group: "Leguminosas" },
  AOA_B: { group: "Alimentos de origen animal", subgroup: "Bajo en grasa" },
  AOA_M: { group: "Alimentos de origen animal", subgroup: "Moderado en grasa" },
  LAC_D: { group: "Lácteos", subgroup: "Descremados" },
  LAC_S: { group: "Lácteos", subgroup: "Semidescremados" },
  GRA: { group: "Grasas" },
  AZU: { group: "Azúcares" },
};

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

function highlightFor(row: Pick<EquivalentAverageRow, "proteinG" | "lipidG" | "carbG">) {
  return {
    protein: row.proteinG >= 7,
    lipid: row.lipidG >= 5 || (row.lipidG >= 1 && row.proteinG >= 7 && row.carbG === 0),
    carb:
      (row.carbG >= 15 && row.proteinG < 7) ||
      (row.carbG >= 4 && row.proteinG <= 2 && row.lipidG === 0),
  };
}

function labelFor(group: AverageGroup) {
  const mapped = DISPLAY[group.code];
  if (mapped) return mapped;
  const paren = group.name.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (paren?.[1] && paren[2]) {
    return { group: paren[1], subgroup: paren[2] };
  }
  return { group: group.name };
}

export function buildEquivalentAverages(groups: AverageGroup[]): EquivalentAverageRow[] {
  const samples: Omit<EquivalentAverageRow, "rowSpan" | "showGroup">[] = [];

  const ordered = [...groups].sort((a, b) => {
    const ia = GROUP_ORDER.indexOf(a.code);
    const ib = GROUP_ORDER.indexOf(b.code);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  for (const group of ordered) {
    if (group.foods.length === 0) continue;
    const byKey = new Map<string, AverageFood>();
    for (const food of group.foods) {
      const key = food.subtype ?? "";
      if (!byKey.has(key)) byKey.set(key, food);
    }
    const label = labelFor(group);
    for (const food of byKey.values()) {
      const macros = {
        energyKcal: round1(food.energyKcal),
        proteinG: round1(food.proteinG),
        lipidG: round1(food.lipidG),
        carbG: round1(food.carbG),
      };
      samples.push({
        code: group.code,
        group: label.group,
        subgroup: label.subgroup ?? "",
        ...macros,
        highlight: highlightFor(macros),
      });
    }
  }

  return samples.map((row, index) => {
    const prev = samples[index - 1];
    const showGroup = prev?.group !== row.group;
    let rowSpan = 1;
    if (showGroup) {
      for (let i = index + 1; i < samples.length && samples[i]?.group === row.group; i += 1) {
        rowSpan += 1;
      }
    }
    return { ...row, showGroup, rowSpan };
  });
}
