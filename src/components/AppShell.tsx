"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/SignOutButton";

export function AppShell({
  brand,
  title,
  subtitle,
  links,
  children,
}: {
  brand: string;
  title: string;
  subtitle: string;
  links: { href: string; label: string }[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <div className="su-page" suppressHydrationWarning>
      <div className="su-shell" suppressHydrationWarning>
        <header className="su-topbar" suppressHydrationWarning>
          <div className="su-brand">
            <div className="su-brand-mark su-brand-mark--wordmark">
              <img
                src="/assets/images/icons/logo.png?v=2"
                alt={brand}
                className="su-brand-mark__img"
              />
            </div>
          </div>
          <nav className="su-tabs" aria-label="Navegación principal">
            {links.map((link) => {
              const active =
                pathname === link.href ||
                (link.href !== "/nutriologo" &&
                  link.href !== "/paciente" &&
                  pathname.startsWith(`${link.href}/`));
              const className = `su-tab${active ? " is-active" : ""}`;
              if (!ready) {
                return (
                  <span key={link.href} className={className}>
                    {link.label}
                  </span>
                );
              }
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={className}
                  suppressHydrationWarning
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          {ready ? <SignOutButton /> : (
            <span className="su-btn su-btn--primary">Salir</span>
          )}
        </header>

        <div className="su-main">
          <div className="su-header su-rise">
            <div>
              <h1 className="su-title">{title}</h1>
              <p className="su-subtitle">{subtitle}</p>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
