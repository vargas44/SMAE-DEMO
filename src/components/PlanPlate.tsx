"use client";

import { useState } from "react";
import { GroupFoodIcon } from "@/components/GroupFoodIcon";
import { buildPlateSlices, type PlateItem } from "@/lib/smae/plate";

/**
 * Plato didáctico del plan (grupos SMAE + %).
 * Para revertir: sacá <PlanPlate /> de las páginas de plan y este archivo.
 * Hover leyenda/arco: borrar estado `hot` y el bloque CSS PLATO HOVER.
 */

function polar(cx: number, cy: number, r: number, angle: number) {
  const a = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function donutPath(
  cx: number,
  cy: number,
  rOut: number,
  rIn: number,
  start: number,
  end: number,
) {
  const sweep = Math.min(359.999, Math.max(0, end - start));
  if (sweep < 0.2) return "";
  const large = sweep > 180 ? 1 : 0;
  const p1 = polar(cx, cy, rOut, start);
  const p2 = polar(cx, cy, rOut, start + sweep);
  const p3 = polar(cx, cy, rIn, start + sweep);
  const p4 = polar(cx, cy, rIn, start);
  return [
    `M ${p1.x} ${p1.y}`,
    `A ${rOut} ${rOut} 0 ${large} 1 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${rIn} ${rIn} 0 ${large} 0 ${p4.x} ${p4.y}`,
    "Z",
  ].join(" ");
}

export function PlanPlate({ items }: { items: PlateItem[] }) {
  const slices = buildPlateSlices(items);
  const [hot, setHot] = useState<string | null>(null);
  if (slices.length === 0) return null;

  const cx = 120;
  const cy = 120;
  const rOut = 92;
  const rIn = 42;
  let cursor = 0;
  const arcs = slices.map((slice) => {
    const start = cursor;
    cursor += (slice.pct / 100) * 360;
    return { ...slice, d: donutPath(cx, cy, rOut, rIn, start, cursor) };
  });

  return (
    <section className={`su-card su-plate${hot ? " is-hovering" : ""}`}>
      <p className="su-label">Plato SMAE</p>
      <p className="su-plate__lead">
        Así se reparte la energía del plan entre grupos. Un equivalente se
        cambia por otro del mismo grupo.
      </p>
      <div className="su-plate__body">
        <div className="su-plate__legend" aria-label="Porcentaje por grupo">
          {arcs.map((slice) => (
            <button
              key={slice.code}
              type="button"
              className={`su-plate__chip${hot === slice.code ? " is-hot" : ""}`}
              onMouseEnter={() => setHot(slice.code)}
              onMouseLeave={() => setHot(null)}
              onFocus={() => setHot(slice.code)}
              onBlur={() => setHot(null)}
            >
              <span
                className="su-plate__glyph"
                style={{ background: slice.color }}
              >
                <GroupFoodIcon code={slice.code} color="#f5f2e8" />
              </span>
              <span className="su-plate__pct">{slice.pct}%</span>
              <span className="su-plate__name">{slice.shortName}</span>
            </button>
          ))}
        </div>
        <div className="su-plate__dish">
          <svg viewBox="0 0 240 240" className="su-plate__svg">
            <circle cx={cx} cy={cy} r="110" fill="var(--su-surface)" />
            <circle
              cx={cx}
              cy={cy}
              r="104"
              fill="none"
              stroke="#004d54"
              strokeWidth="10"
            />
            {arcs.map((slice) =>
              slice.d ? (
                <path
                  key={slice.code}
                  d={slice.d}
                  fill={slice.color}
                  className={`su-plate__slice${hot === slice.code ? " is-hot" : ""}`}
                  aria-label={`${slice.shortName}: ${slice.pct}%`}
                  onMouseEnter={() => setHot(slice.code)}
                  onMouseLeave={() => setHot(null)}
                />
              ) : null,
            )}
            <circle cx={cx} cy={cy} r={rIn - 2} fill="var(--su-surface)" pointerEvents="none" />
            <text
              x={cx}
              y={cy + 5}
              textAnchor="middle"
              fill="#004d54"
              fontSize="13"
              fontWeight="700"
              fontFamily="var(--su-font), system-ui, sans-serif"
              pointerEvents="none"
            >
              SMAE
            </text>
          </svg>
        </div>
      </div>
    </section>
  );
}
