"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type FoodOption = {
  id: string;
  name: string;
  portionLabel: string;
  groupId: string;
  subtype: string | null;
  group: { name: string };
};

export function ExchangeControls({
  planItemId,
  currentFoodId,
  groupId,
  subtype,
  foods,
}: {
  planItemId: string;
  currentFoodId: string;
  groupId: string;
  subtype: string | null;
  foods: FoodOption[];
}) {
  const router = useRouter();
  const options = useMemo(
    () =>
      foods.filter(
        (f) =>
          f.groupId === groupId &&
          (f.subtype ?? null) === (subtype ?? null) &&
          f.id !== currentFoodId,
      ),
    [foods, groupId, subtype, currentFoodId],
  );
  const [toFoodId, setToFoodId] = useState(options[0]?.id ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function exchange() {
    if (!toFoodId) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/exchanges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planItemId, toFoodId }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "No se pudo intercambiar");
      return;
    }
    router.refresh();
  }

  if (options.length === 0) {
    return (
      <p style={{ marginTop: 10, fontSize: 13, color: "var(--su-ink-muted)" }}>
        No hay otros equivalentes disponibles en este grupo.
      </p>
    );
  }

  return (
    <div
      style={{
        marginTop: 12,
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        alignItems: "center",
      }}
    >
      <select
        value={toFoodId}
        onChange={(e) => setToFoodId(e.target.value)}
        className="su-field"
        style={{ minWidth: 220, flex: 1 }}
      >
        {options.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name} ({f.portionLabel})
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={exchange}
        disabled={loading}
        className="su-btn su-btn--primary"
      >
        {loading ? "Cambiando…" : "Cambiar equivalente"}
      </button>
      {error ? (
        <p style={{ width: "100%", color: "var(--su-danger)", fontSize: 13 }}>{error}</p>
      ) : null}
    </div>
  );
}
