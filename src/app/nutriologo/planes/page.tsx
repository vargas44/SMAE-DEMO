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
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Planes</h2>
      {plans.map((plan) => {
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
                <p className="text-sm text-slate-500">
                  {plan.patient.user.name} · {plan.status}
                </p>
              </div>
              <Link
                href={`/nutriologo/planes/${plan.id}`}
                className="rounded-md border px-3 py-1.5 text-sm"
              >
                Abrir
              </Link>
            </div>
            <TotalsBadge totals={totals} />
          </article>
        );
      })}
    </div>
  );
}
