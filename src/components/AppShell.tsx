"use client";

import Link from "next/link";
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

  return (
    <div className="su-page">
      <div className="su-shell">
        <header className="su-topbar">
          <div className="su-brand">
            <div className="su-brand-mark" aria-hidden>
              <img
                src="/assets/images/icons/logo.png"
                alt=""
                className="su-brand-mark__img"
              />
            </div>
            <div>
              <p className="su-brand-name">{brand}</p>
              <p className="su-brand-sub">Soft UI · Demo TFG</p>
            </div>
          </div>
          <nav className="su-tabs" aria-label="Navegación principal">
            {links.map((link) => {
              const active =
                pathname === link.href ||
                (link.href !== "/nutriologo" &&
                  link.href !== "/paciente" &&
                  pathname.startsWith(`${link.href}/`));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`su-tab${active ? " is-active" : ""}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <SignOutButton />
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
