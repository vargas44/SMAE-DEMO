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
  const items = [
    {
      label: "Energía",
      value: totals.energyKcal,
      unit: "kcal",
      delay: "su-rise",
    },
    {
      label: "Proteína",
      value: totals.proteinG,
      unit: "g",
      delay: "su-rise su-rise-1",
      muted: true,
    },
    {
      label: "Lípidos",
      value: totals.lipidG,
      unit: "g",
      delay: "su-rise su-rise-2",
      muted: true,
    },
    {
      label: "HC",
      value: totals.carbG,
      unit: "g",
      delay: "su-rise su-rise-3",
    },
  ];

  return (
    <div className="su-grid-metrics">
      {items.map((item) => (
        <div key={item.label} className={`su-card ${item.delay}`}>
          <p className="su-label">{item.label}</p>
          <p className={`su-metric${item.muted ? " su-metric--muted" : ""}`}>
            {item.value}
            <span
              style={{
                marginLeft: 6,
                fontSize: 14,
                fontWeight: 600,
                color: "var(--su-ink-muted)",
              }}
            >
              {item.unit}
            </span>
          </p>
        </div>
      ))}
    </div>
  );
}
