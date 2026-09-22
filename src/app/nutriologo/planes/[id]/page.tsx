import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TotalsBadge } from "@/components/TotalsBadge";
import {
  calculatePlanTotals,
  energyProgressPct,
  roundTotals,
} from "@/lib/smae/calculate";
import { MEAL_SLOT_LABELS } from "@/lib/smae/groups";

type Props = { params: Promise<{ id: string }> };

export default async function PlanDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const { id } = await params;

  const plan = await prisma.mealPlan.findFirst({
    where: { id, createdById: session.user.id },
    include: {
      patient: { include: { user: true } },
      slots: {
        include: { items: { include: { food: { include: { group: true } } } } },
      },
      exchanges: {
        include: {
          fromFood: true,
          toFood: true,
          user: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!plan) notFound();

  const totals = roundTotals(
    calculatePlanTotals(plan.slots.flatMap((s) => s.items)),
  );
  const pct = energyProgressPct(totals.energyKcal, plan.targetKcal);
  const fillPct = Math.min(100, pct);

  return (
    <div className="su-stack">
      <div>
        <p className="su-label">Detalle</p>
        <h2 className="su-title" style={{ fontSize: "1.45rem", marginTop: 6 }}>
          {plan.title}
        </h2>
        <p className="su-subtitle">
          {plan.patient.user.name} · {plan.status} · meta {plan.targetKcal} kcal
        </p>
      </div>
      <div className="su-card">
        <p className="su-label" style={{ marginBottom: 8 }}>
          Energía vs objetivo ({Math.round(totals.energyKcal)} / {plan.targetKcal} kcal)
        </p>
        <div className="su-progress">
          <div className="su-progress__track">
            <div className="su-progress__fill" style={{ width: `${fillPct}%` }} />
          </div>
          <span style={{ fontWeight: 700, color: "var(--su-teal)" }}>{pct}%</span>
        </div>
      </div>
      <TotalsBadge totals={totals} />
      {plan.slots.map((slot) => (
        <section key={slot.id} className="su-card">
          <h3 style={{ margin: 0, fontSize: 17 }}>
            {slot.label || MEAL_SLOT_LABELS[slot.type]}
          </h3>
          <ul style={{ marginTop: 12, paddingLeft: 18, fontSize: 14 }}>
            {slot.items.map((item) => (
              <li key={item.id} style={{ marginBottom: 6 }}>
                {item.servings} × {item.food.name}{" "}
                <span style={{ color: "var(--su-ink-muted)" }}>
                  ({item.food.group.name} · {item.food.portionLabel})
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <section className="su-card">
        <p className="su-label">Log de intercambios</p>
        {plan.exchanges.length === 0 ? (
          <p style={{ marginTop: 10, color: "var(--su-ink-muted)" }}>
            Sin intercambios aún.
          </p>
        ) : (
          <ul style={{ marginTop: 10, paddingLeft: 18, fontSize: 14 }}>
            {plan.exchanges.map((ex) => (
              <li key={ex.id} style={{ marginBottom: 6 }}>
                {new Date(ex.createdAt).toLocaleString("es-AR")} — {ex.user.name}:{" "}
                {ex.fromFood.name} → {ex.toFood.name}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
