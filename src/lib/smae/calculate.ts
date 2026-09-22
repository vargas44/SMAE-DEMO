export type MacroFood = {
  energyKcal: number;
  proteinG: number;
  lipidG: number;
  carbG: number;
};

export type PlanItemLike = {
  servings: number;
  food: MacroFood;
};

export type Totals = {
  energyKcal: number;
  proteinG: number;
  lipidG: number;
  carbG: number;
  servings: number;
};

export function calculatePlanTotals(items: PlanItemLike[]): Totals {
  return items.reduce<Totals>(
    (acc, item) => {
      const s = item.servings;
      acc.energyKcal += item.food.energyKcal * s;
      acc.proteinG += item.food.proteinG * s;
      acc.lipidG += item.food.lipidG * s;
      acc.carbG += item.food.carbG * s;
      acc.servings += s;
      return acc;
    },
    { energyKcal: 0, proteinG: 0, lipidG: 0, carbG: 0, servings: 0 },
  );
}

export function roundTotals(totals: Totals, digits = 1): Totals {
  const r = (n: number) => Math.round(n * 10 ** digits) / 10 ** digits;
  return {
    energyKcal: r(totals.energyKcal),
    proteinG: r(totals.proteinG),
    lipidG: r(totals.lipidG),
    carbG: r(totals.carbG),
    servings: r(totals.servings),
  };
}
