export type ExchangeFood = {
  id: string;
  groupId: string;
  subtype: string | null;
};

export type ExchangeResult =
  | { ok: true }
  | { ok: false; reason: string };

/**
 * Un intercambio SMAE es válido si el alimento pertenece al mismo grupo
 * (y al mismo subtipo cuando aplica) y se mantienen las raciones.
 */
export function validateExchange(
  fromFood: ExchangeFood,
  toFood: ExchangeFood,
  servings: number,
): ExchangeResult {
  if (fromFood.id === toFood.id) {
    return { ok: false, reason: "Debes elegir un alimento distinto." };
  }
  if (servings <= 0) {
    return { ok: false, reason: "Las raciones deben ser mayores a cero." };
  }
  if (fromFood.groupId !== toFood.groupId) {
    return {
      ok: false,
      reason: "Solo se pueden intercambiar alimentos del mismo grupo SMAE.",
    };
  }
  if ((fromFood.subtype ?? null) !== (toFood.subtype ?? null)) {
    return {
      ok: false,
      reason: "El subtipo del grupo no coincide (p. ej. AOA bajo vs moderado).",
    };
  }
  return { ok: true };
}
