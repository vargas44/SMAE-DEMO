export function TotalsBadge({
  totals,
}: {
  totals: {
    energyKcal: number;
    proteinG: number;
    lipidG: number;
    carbG: number;
  };
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {[
        { label: "Energía", value: `${totals.energyKcal} kcal` },
        { label: "Proteína", value: `${totals.proteinG} g` },
        { label: "Lípidos", value: `${totals.lipidG} g` },
        { label: "HC", value: `${totals.carbG} g` },
      ].map((item) => (
        <div
          key={item.label}
          className="rounded-lg border border-emerald-100 bg-emerald-50/70 px-3 py-2"
        >
          <p className="text-[11px] uppercase tracking-wide text-emerald-800/70">
            {item.label}
          </p>
          <p className="text-sm font-semibold text-emerald-950">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
