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
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Adherencia diaria</h2>
        <p className="text-sm text-slate-600">
          Marcá los tiempos de comida que cumpliste hoy.
        </p>
      </div>
      <AdherenceForm date={today} initial={todayRow} />
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="font-medium">Historial reciente</h3>
        <ul className="mt-2 space-y-1 text-sm">
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
              <li key={h.id}>
                {h.date}: {done}/6 tiempos
              </li>
            );
          })}
          {history.length === 0 ? (
            <li className="text-slate-500">Sin registros aún.</li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
