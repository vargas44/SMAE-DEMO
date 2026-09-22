import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TotalsBadge } from "@/components/TotalsBadge";
import { calculatePlanTotals, roundTotals } from "@/lib/smae/calculate";
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

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">{plan.title}</h2>
        <p className="text-sm text-slate-500">
          {plan.patient.user.name} · {plan.status}
        </p>
      </div>
      <TotalsBadge totals={totals} />
      {plan.slots.map((slot) => (
        <section
          key={slot.id}
          className="rounded-xl border border-slate-200 bg-white p-4"
        >
          <h3 className="font-medium">{slot.label || MEAL_SLOT_LABELS[slot.type]}</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {slot.items.map((item) => (
              <li key={item.id}>
                {item.servings} × {item.food.name}{" "}
                <span className="text-slate-500">
                  ({item.food.group.name} · {item.food.portionLabel})
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="font-medium">Log de intercambios</h3>
        {plan.exchanges.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">Sin intercambios aún.</p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm">
            {plan.exchanges.map((ex) => (
              <li key={ex.id}>
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
