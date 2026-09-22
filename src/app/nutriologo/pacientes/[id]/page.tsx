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
            include: { fromFood: true, toFood: true, user: { select: { name: true } } },
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      },
    },
  });

  if (!patient) notFound();

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-xl font-semibold">{patient.user.name}</h2>
        <p className="text-sm text-slate-500">{patient.user.email}</p>
        <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Edad / Sexo</dt>
            <dd>
              {patient.age ?? "—"} / {patient.sex ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Peso / Talla</dt>
            <dd>
              {patient.weightKg ?? "—"} kg / {patient.heightCm ?? "—"} cm
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-slate-500">Objetivo</dt>
            <dd>{patient.goal ?? "—"}</dd>
          </div>
        </dl>
        <div className="mt-4 flex gap-2">
          <Link
            href={`/nutriologo/pacientes/${patient.id}/plan-nuevo`}
            className="rounded-md bg-emerald-700 px-3 py-1.5 text-sm text-white"
          >
            Nuevo plan
          </Link>
          <Link
            href={`/nutriologo/chat/${patient.user.id}`}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm"
          >
            Chat
          </Link>
        </div>
      </div>

      <section className="space-y-3">
        <h3 className="font-semibold">Historial de planes</h3>
        {patient.plans.map((plan) => {
          const totals = roundTotals(
            calculatePlanTotals(plan.slots.flatMap((s) => s.items)),
          );
          return (
            <article
              key={plan.id}
              className="space-y-3 rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{plan.title}</p>
                  <p className="text-xs text-slate-500">
                    Estado: {plan.status} · {new Date(plan.createdAt).toLocaleString("es-AR")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/nutriologo/planes/${plan.id}`}
                    className="rounded-md border px-3 py-1 text-sm"
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
                <div className="text-xs text-slate-600">
                  <p className="mb-1 font-medium">Últimos intercambios</p>
                  <ul className="space-y-1">
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
