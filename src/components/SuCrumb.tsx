import Link from "next/link";

/** Kit muestra — para revertir, dejá de usar <SuCrumb />. */

export function SuCrumb({
  items,
}: {
  items: { href?: string; label: string }[];
}) {
  return (
    <nav className="su-crumb" aria-label="Ubicación">
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="su-crumb__item">
          {i > 0 ? <span className="su-crumb__sep"> / </span> : null}
          {item.href ? (
            <Link href={item.href}>{item.label}</Link>
          ) : (
            <span className="su-crumb__now">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
