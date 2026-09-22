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
    <div className="space-y-5">
      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block text-slate-600">Título</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block text-slate-600">Notas</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
            rows={2}
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={activate}
            onChange={(e) => setActivate(e.target.checked)}
          />
          Activar al guardar (archiva el plan activo anterior)
        </label>
      </div>

      <TotalsBadge totals={totals} />

      <div className="flex flex-wrap gap-2">
        {MEAL_SLOT_ORDER.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => addSlot(type)}
            className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs"
          >
            + {MEAL_SLOT_LABELS[type]}
          </button>
        ))}
      </div>

      {slots.map((slot) => (
        <section
          key={slot.type}
          className="space-y-3 rounded-xl border border-slate-200 bg-white p-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{MEAL_SLOT_LABELS[slot.type]}</h3>
            <button
              type="button"
              onClick={() => addItem(slot.type)}
              className="text-sm text-emerald-700"
            >
              + Alimento
            </button>
          </div>
          {slot.items.map((item) => {
            const food = foodMap.get(item.foodId);
            return (
              <div
                key={item.key}
                className="grid gap-2 rounded-lg bg-slate-50 p-3 sm:grid-cols-[1fr_100px_auto]"
              >
                <select
                  value={item.foodId}
                  onChange={(e) =>
                    updateItem(slot.type, item.key, { foodId: e.target.value })
                  }
                  className="rounded-md border border-slate-200 px-2 py-1.5 text-sm"
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
                  className="rounded-md border border-slate-200 px-2 py-1.5 text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeItem(slot.type, item.key)}
                  className="text-sm text-red-600"
                >
                  Quitar
                </button>
                {food ? (
                  <p className="text-xs text-slate-500 sm:col-span-3">
                    {food.energyKcal * item.servings} kcal · P{" "}
                    {food.proteinG * item.servings}g · L {food.lipidG * item.servings}g ·
                    HC {food.carbG * item.servings}g
                  </p>
                ) : null}
              </div>
            );
          })}
          {slot.items.length === 0 ? (
            <p className="text-sm text-slate-500">Sin alimentos en este tiempo.</p>
          ) : null}
        </section>
      ))}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {saving ? "Guardando…" : "Guardar plan"}
      </button>
    </div>
  );
}
