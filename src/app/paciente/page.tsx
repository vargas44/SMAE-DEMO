import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TotalsBadge } from "@/components/TotalsBadge";
import { calculatePlanTotals, roundTotals } from "@/lib/smae/calculate";
import { MEAL_SLOT_LABELS } from "@/lib/smae/groups";
import { ExchangeControls } from "@/components/ExchangeControls";

export default async function PacienteHomePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const profile = await prisma.patientProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) {
    return <p style={{ color: "var(--su-ink-muted)" }}>No se encontró el perfil de paciente.</p>;
  }

  const plan = await prisma.mealPlan.findFirst({
    where: { patientId: profile.id, status: "ACTIVE" },
    include: {
      slots: {
        include: { items: { include: { food: { include: { group: true } } } } },
      },
    },
  });

  if (!plan) {
    return (
      <div className="su-card">
        <p className="su-label">Plan</p>
        <h2 style={{ margin: "8px 0 0" }}>Sin plan activo</h2>
        <p style={{ marginTop: 10, color: "var(--su-ink-muted)" }}>
          Tu nutriólogo todavía no activó un plan SMAE.
        </p>
      </div>
    );
  }

  const totals = roundTotals(
    calculatePlanTotals(plan.slots.flatMap((s) => s.items)),
  );

  const foodsByGroup = await prisma.food.findMany({
    include: { group: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="su-stack">
      <div>
        <p className="su-label">Plan activo</p>
        <h2 className="su-title" style={{ fontSize: "1.45rem", marginTop: 6 }}>
          {plan.title}
        </h2>
        <p className="su-subtitle">
          Intercambiá alimentos del mismo grupo SMAE sin romper las raciones.
        </p>
      </div>
      <TotalsBadge totals={totals} />
      {plan.slots.map((slot) => (
        <section key={slot.id} className="su-card su-stack">
          <div className="su-row">
            <h3 style={{ margin: 0, fontSize: 17 }}>
              {slot.label || MEAL_SLOT_LABELS[slot.type]}
            </h3>
            <span className="su-badge">{slot.items.length} eq.</span>
          </div>
          {slot.items.map((item) => (
            <div
              key={item.id}
              className="su-inset-box"
              style={{ borderRadius: 12, padding: 14 }}
            >
              <p style={{ margin: 0, fontWeight: 700 }}>
                {item.servings} × {item.food.name}
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--su-ink-muted)" }}>
                {item.food.group.name} · {item.food.portionLabel} ·{" "}
                {item.food.energyKcal * item.servings} kcal
              </p>
              <ExchangeControls
                planItemId={item.id}
                currentFoodId={item.food.id}
                groupId={item.food.groupId}
                subtype={item.food.subtype}
                foods={foodsByGroup}
              />
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
