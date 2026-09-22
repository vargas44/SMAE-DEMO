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
    <div className="su-stack">
      <div>
        <p className="su-label">Referencia</p>
        <h2 className="su-title" style={{ fontSize: "1.45rem", marginTop: 6 }}>
          Catálogo SMAE
        </h2>
        <p className="su-subtitle">
          Subconjunto demo digitalizado para la defensa del TFG.
        </p>
      </div>
      {groups.map((group) => (
        <section key={group.id} className="su-card" style={{ overflow: "hidden", padding: 0 }}>
          <div
            style={{
              padding: "14px 18px",
              background: "var(--su-teal)",
              color: "var(--su-white)",
            }}
          >
            <h3 style={{ margin: 0, fontSize: 17 }}>
              {group.name}{" "}
              <span style={{ opacity: 0.85, fontSize: 13 }}>({group.code})</span>
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: 12, opacity: 0.85 }}>
              {group.foods.length} alimentos
            </p>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr className="su-label">
                  <th style={{ textAlign: "left", padding: "12px 18px" }}>Alimento</th>
                  <th style={{ textAlign: "left", padding: "12px 18px" }}>Ración</th>
                  <th style={{ textAlign: "left", padding: "12px 18px" }}>kcal</th>
                  <th style={{ textAlign: "left", padding: "12px 18px" }}>P</th>
                  <th style={{ textAlign: "left", padding: "12px 18px" }}>L</th>
                  <th style={{ textAlign: "left", padding: "12px 18px" }}>HC</th>
                </tr>
              </thead>
              <tbody>
                {group.foods.map((f) => (
                  <tr
                    key={f.id}
                    style={{ borderTop: "1px solid var(--su-surface-muted)" }}
                  >
                    <td style={{ padding: "10px 18px" }}>
                      {f.name}
                      {f.subtype ? (
                        <span
                          style={{
                            marginLeft: 6,
                            color: "var(--su-ink-muted)",
                            fontSize: 12,
                          }}
                        >
                          ({f.subtype})
                        </span>
                      ) : null}
                    </td>
                    <td style={{ padding: "10px 18px" }}>{f.portionLabel}</td>
                    <td style={{ padding: "10px 18px" }}>{f.energyKcal}</td>
                    <td style={{ padding: "10px 18px" }}>{f.proteinG}</td>
                    <td style={{ padding: "10px 18px" }}>{f.lipidG}</td>
                    <td style={{ padding: "10px 18px" }}>{f.carbG}</td>
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
