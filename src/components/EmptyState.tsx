import type { ReactNode } from "react";

/** Kit muestra — para revertir, dejá de usar <EmptyState />. */

export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="su-empty">
      <div className="su-empty__icon" aria-hidden="true">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h3 className="su-empty__title">{title}</h3>
      {children ? <div className="su-empty__text">{children}</div> : null}
      {action}
    </section>
  );
}
