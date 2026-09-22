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
      className="su-btn su-btn--primary"
    >
      {loading ? "Activando…" : "Activar"}
    </button>
  );
}
