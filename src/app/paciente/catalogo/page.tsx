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
    <div className="su-stack">
      <div>
        <p className="su-label">Consulta</p>
        <h2 className="su-title" style={{ fontSize: "1.45rem", marginTop: 6 }}>
          Catálogo SMAE
        </h2>
      </div>
      {groups.map((group) => (
        <details key={group.id} className="su-card">
          <summary style={{ cursor: "pointer", fontWeight: 700, fontSize: 16 }}>
            {group.name}{" "}
            <span style={{ color: "var(--su-ink-muted)", fontWeight: 600, fontSize: 13 }}>
              ({group.foods.length})
            </span>
          </summary>
          <ul style={{ marginTop: 14, paddingLeft: 18, color: "var(--su-ink-muted)" }}>
            {group.foods.map((f) => (
              <li key={f.id} style={{ marginBottom: 6 }}>
                <strong style={{ color: "var(--su-ink)" }}>{f.name}</strong> —{" "}
                {f.portionLabel} · {f.energyKcal} kcal
              </li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  );
}
