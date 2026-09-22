import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdherenceForm } from "@/components/AdherenceForm";

export default async function AdherencePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const profile = await prisma.patientProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) redirect("/paciente");

  const today = new Date().toISOString().slice(0, 10);
  const todayRow = await prisma.dailyAdherence.findUnique({
    where: { patientId_date: { patientId: profile.id, date: today } },
  });
  const history = await prisma.dailyAdherence.findMany({
    where: { patientId: profile.id },
    orderBy: { date: "desc" },
    take: 14,
  });

  return (
    <div className="su-stack">
      <div>
        <p className="su-label">Seguimiento</p>
        <h2 className="su-title" style={{ fontSize: "1.45rem", marginTop: 6 }}>
          Adherencia diaria
        </h2>
        <p className="su-subtitle">Marcá los tiempos de comida que cumpliste hoy.</p>
      </div>
      <AdherenceForm date={today} initial={todayRow} />
      <section className="su-card">
        <p className="su-label">Historial reciente</p>
        <ul style={{ margin: "12px 0 0", padding: 0, listStyle: "none" }} className="su-stack">
          {history.map((h) => {
            const done = [
              h.breakfast,
              h.snack1,
              h.lunch,
              h.snack2,
              h.dinner,
              h.snack3,
            ].filter(Boolean).length;
            return (
              <li key={h.id} className="su-row">
                <span>{h.date}</span>
                <span className="su-badge">{done}/6 tiempos</span>
              </li>
            );
          })}
          {history.length === 0 ? (
            <li style={{ color: "var(--su-ink-muted)" }}>Sin registros aún.</li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
