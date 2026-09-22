import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function CatalogoPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const groups = await prisma.foodGroup.findMany({
    include: { foods: { orderBy: { name: "asc" } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Catálogo SMAE</h2>
        <p className="text-sm text-slate-600">
          Subconjunto demo digitalizado para la defensa del TFG.
        </p>
      </div>
      {groups.map((group) => (
        <section
          key={group.id}
          className="overflow-hidden rounded-xl border border-slate-200 bg-white"
        >
          <div className="border-b border-slate-100 bg-emerald-50/60 px-4 py-3">
            <h3 className="font-medium">
              {group.name}{" "}
              <span className="text-xs text-slate-500">({group.code})</span>
            </h3>
            <p className="text-xs text-slate-500">{group.foods.length} alimentos</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-2">Alimento</th>
                  <th className="px-4 py-2">Ración</th>
                  <th className="px-4 py-2">kcal</th>
                  <th className="px-4 py-2">P</th>
                  <th className="px-4 py-2">L</th>
                  <th className="px-4 py-2">HC</th>
                </tr>
              </thead>
              <tbody>
                {group.foods.map((f) => (
                  <tr key={f.id} className="border-t border-slate-100">
                    <td className="px-4 py-2">
                      {f.name}
                      {f.subtype ? (
                        <span className="ml-1 text-xs text-slate-400">
                          ({f.subtype})
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-2">{f.portionLabel}</td>
                    <td className="px-4 py-2">{f.energyKcal}</td>
                    <td className="px-4 py-2">{f.proteinG}</td>
                    <td className="px-4 py-2">{f.lipidG}</td>
                    <td className="px-4 py-2">{f.carbG}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
