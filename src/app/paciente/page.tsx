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
    return <p>No se encontró el perfil de paciente.</p>;
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
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Sin plan activo</h2>
        <p className="mt-2 text-sm text-slate-600">
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
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">{plan.title}</h2>
        <p className="text-sm text-slate-600">
          Podés intercambiar alimentos del mismo grupo SMAE sin romper las
          raciones.
        </p>
      </div>
      <TotalsBadge totals={totals} />
      {plan.slots.map((slot) => (
        <section
          key={slot.id}
          className="space-y-3 rounded-xl border border-slate-200 bg-white p-4"
        >
          <h3 className="font-medium">
            {slot.label || MEAL_SLOT_LABELS[slot.type]}
          </h3>
          {slot.items.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-slate-100 bg-slate-50 p-3"
            >
              <p className="text-sm font-medium">
                {item.servings} × {item.food.name}
              </p>
              <p className="text-xs text-slate-500">
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
