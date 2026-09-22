import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TotalsBadge } from "@/components/TotalsBadge";
import { calculatePlanTotals, roundTotals } from "@/lib/smae/calculate";

export default async function PlanesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const plans = await prisma.mealPlan.findMany({
    where: { createdById: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      patient: { include: { user: { select: { name: true } } } },
      slots: { include: { items: { include: { food: true } } } },
    },
  });

  return (
    <div className="su-stack">
      <div>
        <p className="su-label">Planes</p>
        <h2 className="su-title" style={{ fontSize: "1.45rem", marginTop: 6 }}>
          Historial
        </h2>
      </div>
      {plans.map((plan) => {
        const totals = roundTotals(
          calculatePlanTotals(plan.slots.flatMap((s) => s.items)),
        );
        return (
          <article key={plan.id} className="su-card su-stack">
            <div className="su-row">
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 17 }}>{plan.title}</p>
                <p style={{ margin: "4px 0 0", color: "var(--su-ink-muted)", fontSize: 14 }}>
                  {plan.patient.user.name} · {plan.status}
                </p>
              </div>
              <Link href={`/nutriologo/planes/${plan.id}`} className="su-btn su-btn--primary">
                Abrir
              </Link>
            </div>
            <div className="su-progress">
              <div className="su-progress__track">
                <div className="su-progress__fill" style={{ width: "58%" }} />
              </div>
              <span style={{ fontWeight: 700, color: "var(--su-teal)" }}>58%</span>
            </div>
            <TotalsBadge totals={totals} />
          </article>
        );
      })}
    </div>
  );
}
