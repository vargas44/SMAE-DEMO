"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TotalsBadge } from "@/components/TotalsBadge";
import { calculatePlanTotals, roundTotals } from "@/lib/smae/calculate";
import { MEAL_SLOT_LABELS, MEAL_SLOT_ORDER } from "@/lib/smae/groups";
import type { MealSlotType } from "@prisma/client";

type FoodOption = {
  id: string;
  name: string;
  portionLabel: string;
  energyKcal: number;
  proteinG: number;
  lipidG: number;
  carbG: number;
  subtype: string | null;
  group: { id: string; code: string; name: string };
};

type DraftItem = { key: string; foodId: string; servings: number };

type DraftSlot = { type: MealSlotType; items: DraftItem[] };

export function PlanBuilder({
  patientId,
  foods,
}: {
  patientId: string;
  foods: FoodOption[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState("Plan SMAE personalizado");
  const [notes, setNotes] = useState("");
  const [activate, setActivate] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [slots, setSlots] = useState<DraftSlot[]>([
    { type: "BREAKFAST", items: [] },
    { type: "LUNCH", items: [] },
    { type: "DINNER", items: [] },
  ]);

  const foodMap = useMemo(() => new Map(foods.map((f) => [f.id, f])), [foods]);

  const totals = useMemo(() => {
    const items = slots.flatMap((s) =>
      s.items
        .map((i) => {
          const food = foodMap.get(i.foodId);
          if (!food) return null;
          return { servings: i.servings, food };
        })
        .filter(Boolean) as { servings: number; food: FoodOption }[],
    );
    return roundTotals(calculatePlanTotals(items));
  }, [slots, foodMap]);

  function addSlot(type: MealSlotType) {
    if (slots.some((s) => s.type === type)) return;
    setSlots((prev) =>
      [...prev, { type, items: [] }].sort(
        (a, b) => MEAL_SLOT_ORDER.indexOf(a.type) - MEAL_SLOT_ORDER.indexOf(b.type),
      ),
    );
  }

  function addItem(slotType: MealSlotType) {
    const first = foods[0];
    if (!first) return;
    setSlots((prev) =>
      prev.map((s) =>
        s.type === slotType
          ? {
              ...s,
              items: [
                ...s.items,
                {
                  key: `${Date.now()}-${Math.random()}`,
                  foodId: first.id,
                  servings: 1,
                },
              ],
            }
          : s,
      ),
    );
  }

  function updateItem(
    slotType: MealSlotType,
    key: string,
    patch: Partial<DraftItem>,
  ) {
    setSlots((prev) =>
      prev.map((s) =>
        s.type === slotType
          ? {
              ...s,
              items: s.items.map((i) => (i.key === key ? { ...i, ...patch } : i)),
            }
          : s,
      ),
    );
  }

  function removeItem(slotType: MealSlotType, key: string) {
    setSlots((prev) =>
      prev.map((s) =>
        s.type === slotType
          ? { ...s, items: s.items.filter((i) => i.key !== key) }
          : s,
      ),
    );
  }

  async function save() {
    setSaving(true);
    setError("");
    const payload = {
      patientId,
      title,
      notes,
      activate,
      slots: slots
        .filter((s) => s.items.length > 0)
        .map((s) => ({
          type: s.type,
          items: s.items.map((i) => ({
            foodId: i.foodId,
            servings: i.servings,
          })),
        })),
    };

    if (payload.slots.length === 0) {
      setError("Agregá al menos un alimento en algún tiempo de comida.");
      setSaving(false);
      return;
    }

    const res = await fetch("/api/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError("No se pudo guardar el plan");
      return;
    }
    router.push(`/nutriologo/pacientes/${patientId}`);
    router.refresh();
  }

  return (
    <div className="su-stack">
      <div className="su-card" style={{ display: "grid", gap: 12 }}>
        <label>
          <span className="su-label">Título</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="su-field"
            style={{ marginTop: 8 }}
          />
        </label>
        <label>
          <span className="su-label">Notas</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="su-field"
            style={{ marginTop: 8 }}
            rows={2}
          />
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
          <input
            type="checkbox"
            className="su-check"
            checked={activate}
            onChange={(e) => setActivate(e.target.checked)}
          />
          Activar al guardar (archiva el plan activo anterior)
        </label>
      </div>

      <TotalsBadge totals={totals} />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {MEAL_SLOT_ORDER.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => addSlot(type)}
            className="su-btn su-btn--secondary"
          >
            + {MEAL_SLOT_LABELS[type]}
          </button>
        ))}
      </div>

      {slots.map((slot) => (
        <section key={slot.type} className="su-card su-stack">
          <div className="su-row">
            <h3 style={{ margin: 0, fontSize: 18 }}>{MEAL_SLOT_LABELS[slot.type]}</h3>
            <button
              type="button"
              onClick={() => addItem(slot.type)}
              className="su-btn su-btn--primary"
            >
              + Alimento
            </button>
          </div>
          {slot.items.map((item) => {
            const food = foodMap.get(item.foodId);
            return (
              <div
                key={item.key}
                className="su-inset-box"
                style={{
                  borderRadius: 20,
                  padding: 14,
                  display: "grid",
                  gap: 8,
                  gridTemplateColumns: "1fr 100px auto",
                }}
              >
                <select
                  value={item.foodId}
                  onChange={(e) =>
                    updateItem(slot.type, item.key, { foodId: e.target.value })
                  }
                  className="su-field"
                >
                  {foods.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.group.name}: {f.name} ({f.portionLabel})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={0.5}
                  step={0.5}
                  value={item.servings}
                  onChange={(e) =>
                    updateItem(slot.type, item.key, {
                      servings: Number(e.target.value),
                    })
                  }
                  className="su-field"
                />
                <button
                  type="button"
                  onClick={() => removeItem(slot.type, item.key)}
                  className="su-btn su-btn--secondary"
                >
                  Quitar
                </button>
                {food ? (
                  <p
                    style={{
                      gridColumn: "1 / -1",
                      margin: 0,
                      fontSize: 13,
                      color: "var(--su-ink-muted)",
                    }}
                  >
                    {food.energyKcal * item.servings} kcal · P{" "}
                    {food.proteinG * item.servings}g · L {food.lipidG * item.servings}g ·
                    HC {food.carbG * item.servings}g
                  </p>
                ) : null}
              </div>
            );
          })}
          {slot.items.length === 0 ? (
            <p style={{ color: "var(--su-ink-muted)", margin: 0 }}>
              Sin alimentos en este tiempo.
            </p>
          ) : null}
        </section>
      ))}

      {error ? (
        <p style={{ color: "var(--su-danger)", fontWeight: 600 }}>{error}</p>
      ) : null}
      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="su-btn su-btn--primary"
        style={{ width: "fit-content", opacity: saving ? 0.7 : 1 }}
      >
        {saving ? "Guardando…" : "Guardar plan"}
      </button>
    </div>
  );
}
