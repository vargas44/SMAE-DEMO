import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";

export function AppHeader({
  title,
  roleLabel,
  links,
}: {
  title: string;
  roleLabel: string;
  links: { href: string; label: string }[];
}) {
  return (
    <header className="border-b border-emerald-900/10 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            SMAE Demo
          </p>
          <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
          <p className="text-xs text-slate-500">{roleLabel}</p>
        </div>
        <nav className="flex flex-wrap items-center gap-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-1.5 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-900"
            >
              {l.label}
            </Link>
          ))}
          <SignOutButton />
        </nav>
      </div>
    </header>
  );
}
