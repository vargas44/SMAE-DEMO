"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Adherence = {
  breakfast: boolean;
  snack1: boolean;
  lunch: boolean;
  snack2: boolean;
  dinner: boolean;
  snack3: boolean;
  notes?: string | null;
} | null;

const fields = [
  ["breakfast", "Desayuno"],
  ["snack1", "Colación 1"],
  ["lunch", "Comida"],
  ["snack2", "Colación 2"],
  ["dinner", "Cena"],
  ["snack3", "Colación 3"],
] as const;

export function AdherenceForm({
  date,
  initial,
}: {
  date: string;
  initial: Adherence;
}) {
  const router = useRouter();
  const [state, setState] = useState({
    breakfast: initial?.breakfast ?? false,
    snack1: initial?.snack1 ?? false,
    lunch: initial?.lunch ?? false,
    snack2: initial?.snack2 ?? false,
    dinner: initial?.dinner ?? false,
    snack3: initial?.snack3 ?? false,
    notes: initial?.notes ?? "",
  });
  const [msg, setMsg] = useState("");

  async function save() {
    const res = await fetch("/api/adherence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, ...state }),
    });
    setMsg(res.ok ? "Guardado" : "Error al guardar");
    router.refresh();
  }

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">Fecha: {date}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {fields.map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={state[key]}
              onChange={(e) =>
                setState((prev) => ({ ...prev, [key]: e.target.checked }))
              }
            />
            {label}
          </label>
        ))}
      </div>
      <textarea
        value={state.notes}
        onChange={(e) => setState((prev) => ({ ...prev, notes: e.target.value }))}
        placeholder="Notas (opcional)"
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        rows={2}
      />
      <button
        type="button"
        onClick={save}
        className="rounded-lg bg-emerald-700 px-4 py-2 text-sm text-white"
      >
        Guardar adherencia
      </button>
      {msg ? <p className="text-sm text-emerald-700">{msg}</p> : null}
    </div>
  );
}
