import type { MealSlotType } from "@prisma/client";

export const MEAL_SLOT_LABELS: Record<MealSlotType, string> = {
  BREAKFAST: "Desayuno",
  SNACK1: "Colación 1",
  LUNCH: "Comida",
  SNACK2: "Colación 2",
  DINNER: "Cena",
  SNACK3: "Colación 3",
};

export const MEAL_SLOT_ORDER: MealSlotType[] = [
  "BREAKFAST",
  "SNACK1",
  "LUNCH",
  "SNACK2",
  "DINNER",
  "SNACK3",
];
