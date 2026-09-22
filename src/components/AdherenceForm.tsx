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
    <div className="su-card su-stack">
      <p className="su-label">Fecha: {date}</p>
      <div
        style={{
          display: "grid",
          gap: 8,
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        }}
      >
        {fields.map(([key, label]) => (
          <label
            key={key}
            className="su-raised-sm"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              borderRadius: 9999,
              padding: "10px 14px",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            <input
              type="checkbox"
              className="su-check"
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
        className="su-field"
        rows={2}
      />
      <button
        type="button"
        onClick={save}
        className="su-btn su-btn--primary"
        style={{ width: "fit-content" }}
      >
        Guardar adherencia
      </button>
      {msg ? (
        <p style={{ color: "var(--su-success)", fontWeight: 600 }}>{msg}</p>
      ) : null}
    </div>
  );
}
