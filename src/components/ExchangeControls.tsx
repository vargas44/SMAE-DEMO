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
      <p className="mt-2 text-xs text-slate-500">
        No hay otros equivalentes disponibles en este grupo.
      </p>
    );
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <select
        value={toFoodId}
        onChange={(e) => setToFoodId(e.target.value)}
        className="min-w-[220px] flex-1 rounded-md border border-slate-200 px-2 py-1.5 text-sm"
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
        className="rounded-md bg-emerald-700 px-3 py-1.5 text-sm text-white disabled:opacity-60"
      >
        {loading ? "Cambiando…" : "Cambiar por equivalente"}
      </button>
      {error ? <p className="w-full text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
