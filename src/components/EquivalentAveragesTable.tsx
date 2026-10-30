import { buildEquivalentAverages, type AverageGroup } from "@/lib/smae/equivalentAverages";

/** Consulta didáctica — para revertir, dejá de usar <EquivalentAveragesTable />. */

export function EquivalentAveragesTable({ groups }: { groups: AverageGroup[] }) {
  const rows = buildEquivalentAverages(groups);
  if (rows.length === 0) return null;

  return (
    <section className="su-card su-eq">
      <p className="su-label">Consulta</p>
      <h3 className="su-eq__title">Aporte nutrimental promedio</h3>
      <p className="su-eq__lead">
        Un equivalente del mismo grupo y subgrupo aporta lo mismo. Valores del
        subconjunto demo, no del libro SMAE completo.
      </p>
      <div className="su-table-scroll">
        <table className="su-eq-table">
          <thead>
            <tr>
              <th rowSpan={2} className="su-eq-table__stub">
                Grupo
              </th>
              <th rowSpan={2} className="su-eq-table__stub">
                Subgrupos
              </th>
              <th colSpan={4} className="su-eq-table__banner">
                Aporte nutrimental promedio
              </th>
            </tr>
            <tr>
              <th>Energía</th>
              <th>Proteína (g)</th>
              <th>Lípidos (g)</th>
              <th>Hidratos (g)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.code}-${row.subgroup}`}>
                {row.showGroup ? (
                  <th scope="row" rowSpan={row.rowSpan} className="su-eq-table__group">
                    {row.group}
                  </th>
                ) : null}
                <td className="su-eq-table__sub">{row.subgroup}</td>
                <td>{row.energyKcal}</td>
                <td className={row.highlight.protein ? "su-eq-hl su-eq-hl--protein" : undefined}>
                  {row.proteinG}
                </td>
                <td className={row.highlight.lipid ? "su-eq-hl su-eq-hl--lipid" : undefined}>
                  {row.lipidG}
                </td>
                <td className={row.highlight.carb ? "su-eq-hl su-eq-hl--carb" : undefined}>
                  {row.carbG}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
