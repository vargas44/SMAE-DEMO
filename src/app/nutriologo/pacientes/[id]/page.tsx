import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TotalsBadge } from "@/components/TotalsBadge";
import { calculatePlanTotals, roundTotals } from "@/lib/smae/calculate";
import { ActivatePlanButton } from "@/components/ActivatePlanButton";

type Props = { params: Promise<{ id: string }> };

export default async function PatientDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const { id } = await params;

  const patient = await prisma.patientProfile.findFirst({
    where: { id, nutritionistId: session.user.id },
    include: {
      user: true,
      plans: {
        orderBy: { updatedAt: "desc" },
        include: {
          slots: { include: { items: { include: { food: true } } } },
          exchanges: {
            include: {
              fromFood: true,
              toFood: true,
              user: { select: { name: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      },
    },
  });

  if (!patient) notFound();

  return (
    <div className="su-stack">
      <div className="su-card">
        <p className="su-label">Ficha</p>
        <h2 style={{ margin: "8px 0 0", fontSize: 24 }}>{patient.user.name}</h2>
        <p style={{ marginTop: 4, color: "var(--su-ink-muted)" }}>{patient.user.email}</p>
        <dl
          style={{
            marginTop: 18,
            display: "grid",
            gap: 12,
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            fontSize: 14,
          }}
        >
          <div>
            <dt className="su-label">Edad / Sexo</dt>
            <dd style={{ margin: "6px 0 0" }}>
              {patient.age ?? "—"} / {patient.sex ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="su-label">Peso / Talla</dt>
            <dd style={{ margin: "6px 0 0" }}>
              {patient.weightKg ?? "—"} kg / {patient.heightCm ?? "—"} cm
            </dd>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <dt className="su-label">Objetivo</dt>
            <dd style={{ margin: "6px 0 0" }}>{patient.goal ?? "—"}</dd>
          </div>
        </dl>
        <div style={{ marginTop: 18, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link
            href={`/nutriologo/pacientes/${patient.id}/plan-nuevo`}
            className="su-btn su-btn--primary"
          >
            + Nuevo plan
          </Link>
          <Link href={`/nutriologo/chat/${patient.user.id}`} className="su-btn su-btn--secondary">
            Chat
          </Link>
        </div>
      </div>

      <section className="su-stack">
        <p className="su-label">Historial de planes</p>
        {patient.plans.map((plan) => {
          const totals = roundTotals(
            calculatePlanTotals(plan.slots.flatMap((s) => s.items)),
          );
          return (
            <article key={plan.id} className="su-card su-stack">
              <div className="su-row">
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 17 }}>{plan.title}</p>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--su-ink-muted)" }}>
                    {plan.status} · {new Date(plan.createdAt).toLocaleString("es-AR")}
                  </p>
                  <div style={{ marginTop: 8 }}>
                    {plan.status === "ACTIVE" ? (
                      <span className="su-badge">Activo</span>
                    ) : (
                      <span className="su-badge su-badge--3">{plan.status}</span>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Link
                    href={`/nutriologo/planes/${plan.id}`}
                    className="su-btn su-btn--secondary"
                  >
                    Detalle
                  </Link>
                  {plan.status !== "ACTIVE" ? (
                    <ActivatePlanButton planId={plan.id} />
                  ) : null}
                </div>
              </div>
              <TotalsBadge totals={totals} />
              {plan.exchanges.length > 0 ? (
                <div>
                  <p className="su-label">Últimos intercambios</p>
                  <ul style={{ margin: "8px 0 0", paddingLeft: 18, fontSize: 13 }}>
                    {plan.exchanges.map((ex) => (
                      <li key={ex.id}>
                        {ex.user.name}: {ex.fromFood.name} → {ex.toFood.name} (
                        {ex.servings} eq.)
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </article>
          );
        })}
      </section>
    </div>
  );
}
