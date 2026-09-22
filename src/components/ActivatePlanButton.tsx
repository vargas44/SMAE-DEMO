"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ActivatePlanButton({ planId }: { planId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function activate() {
    setLoading(true);
    await fetch(`/api/plans/${planId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "activate" }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={activate}
      disabled={loading}
      className="rounded-md bg-emerald-700 px-3 py-1 text-sm text-white disabled:opacity-60"
    >
      {loading ? "Activando…" : "Activar"}
    </button>
  );
}
