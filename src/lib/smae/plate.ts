export type PlateItem = {
  servings: number;
  food: {
    energyKcal: number;
    group: { code: string; name: string };
  };
};

export type PlateSlice = {
  code: string;
  name: string;
  shortName: string;
  kcal: number;
  pct: number;
  color: string;
};

const GROUP_STYLE: Record<string, { shortName: string; color: string }> = {
  VEG: { shortName: "Verduras", color: "#3d7a5a" },
  FRU: { shortName: "Frutas", color: "#c45c5c" },
  CER: { shortName: "Cereales", color: "#b08a3c" },
  AOA_B: { shortName: "Carne magra", color: "#8b3a3a" },
  AOA_M: { shortName: "Carne", color: "#6b2d2d" },
  LAC_D: { shortName: "Lácteos desc.", color: "#5a7a8a" },
  LAC_S: { shortName: "Lácteos", color: "#3d5c6b" },
  GRA: { shortName: "Grasas", color: "#6b8a3d" },
  AZU: { shortName: "Azúcares", color: "#b07a4c" },
  LEG: { shortName: "Legumbres", color: "#6b5428" },
};

const FALLBACK = { shortName: "Grupo", color: "#5a6a72" };

export function buildPlateSlices(items: PlateItem[]): PlateSlice[] {
  const byCode = new Map<string, { name: string; kcal: number }>();

  for (const item of items) {
    const kcal = item.food.energyKcal * item.servings;
    if (kcal <= 0) continue;
    const code = item.food.group.code;
    const prev = byCode.get(code);
    if (prev) {
      prev.kcal += kcal;
    } else {
      byCode.set(code, { name: item.food.group.name, kcal });
    }
  }

  const total = [...byCode.values()].reduce((sum, g) => sum + g.kcal, 0);
  if (total <= 0) return [];

  const raw = [...byCode.entries()].map(([code, g]) => {
    const style = GROUP_STYLE[code] ?? { ...FALLBACK, shortName: g.name };
    return {
      code,
      name: g.name,
      shortName: style.shortName,
      kcal: g.kcal,
      pct: (g.kcal / total) * 100,
      color: style.color,
    };
  });

  raw.sort((a, b) => b.kcal - a.kcal);

  const rounded = raw.map((s) => ({ ...s, pct: Math.round(s.pct) }));
  const drift = 100 - rounded.reduce((sum, s) => sum + s.pct, 0);
  if (rounded.length > 0 && drift !== 0) {
    rounded[0] = { ...rounded[0], pct: rounded[0].pct + drift };
  }

  return rounded.filter((s) => s.pct > 0);
}
