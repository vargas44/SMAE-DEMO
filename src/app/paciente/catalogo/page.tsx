import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function PacienteCatalogoPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const groups = await prisma.foodGroup.findMany({
    include: { foods: { orderBy: { name: "asc" } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Catálogo SMAE</h2>
      {groups.map((group) => (
        <details
          key={group.id}
          className="rounded-xl border border-slate-200 bg-white p-4"
        >
          <summary className="cursor-pointer font-medium">
            {group.name} ({group.foods.length})
          </summary>
          <ul className="mt-3 space-y-1 text-sm text-slate-700">
            {group.foods.map((f) => (
              <li key={f.id}>
                {f.name} — {f.portionLabel} · {f.energyKcal} kcal
              </li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  );
}
