import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreatePatientForm } from "@/components/CreatePatientForm";

export default async function NutriologoHomePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const patients = await prisma.patientProfile.findMany({
    where: { nutritionistId: session.user.id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      plans: {
        where: { status: "ACTIVE" },
        select: { id: true, title: true },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const withPlan = patients.filter((p) => p.plans.length > 0).length;
  const coveragePct =
    patients.length === 0 ? 0 : Math.round((withPlan / patients.length) * 100);

  return (
    <div className="su-stack">
      <section className="su-grid-metrics">
        <div className="su-card su-rise">
          <p className="su-label">Pacientes</p>
          <p className="su-metric">{patients.length}</p>
        </div>
        <div className="su-card su-rise su-rise-1">
          <p className="su-label">Con plan activo</p>
          <p className="su-metric su-metric--muted">{withPlan}</p>
        </div>
        <div className="su-card su-rise su-rise-2">
          <p className="su-label">Catálogo</p>
          <p className="su-metric su-metric--muted">SMAE</p>
        </div>
        <div className="su-card su-rise su-rise-3">
          <p className="su-label">Cobertura de planes</p>
          <div className="su-progress" style={{ marginTop: 14 }}>
            <div className="su-progress__track">
              <div
                className="su-progress__fill"
                style={{ width: `${coveragePct}%` }}
              />
            </div>
            <span style={{ fontWeight: 700, color: "var(--su-teal)" }}>
              {coveragePct}%
            </span>
          </div>
        </div>
      </section>

      <div>
        <p className="su-label">My patients</p>
        <h2 className="su-title" style={{ fontSize: "1.35rem", marginTop: 6 }}>
          Pacientes
        </h2>
      </div>

      <div className="su-stack">
        {patients.map((p) => (
          <article key={p.id} className="su-card su-list-item">
            <div className="su-row">
              <div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
                  {p.user.name}
                </h3>
                <p style={{ margin: "4px 0 0", color: "var(--su-ink-muted)", fontSize: 14 }}>
                  {p.user.email}
                </p>
                <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                  {p.plans[0] ? (
                    <span className="su-badge">Plan activo</span>
                  ) : (
                    <span className="su-badge su-badge--2">Sin plan</span>
                  )}
                  {p.goal ? <span className="su-badge su-badge--3">{p.goal}</span> : null}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Link href={`/nutriologo/pacientes/${p.id}`} className="su-btn su-btn--primary">
                  Ver ficha
                </Link>
                <Link
                  href={`/nutriologo/pacientes/${p.id}/plan-nuevo`}
                  className="su-btn su-btn--secondary"
                >
                  + Nuevo plan
                </Link>
                <Link href={`/nutriologo/chat/${p.user.id}`} className="su-btn su-btn--secondary">
                  Chat
                </Link>
              </div>
            </div>
          </article>
        ))}
        {patients.length === 0 ? (
          <p style={{ color: "var(--su-ink-muted)" }}>Todavía no hay pacientes.</p>
        ) : null}
      </div>

      <CreatePatientForm />
    </div>
  );
}
