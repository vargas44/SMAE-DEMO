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
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[rgba(231,233,225,0.82)] backdrop-blur-md">
      <div className="shell flex flex-wrap items-end justify-between gap-4 py-4">
        <div className="reveal">
          <p className="kicker">SMAE</p>
          <h1 className="font-display mt-1 text-2xl tracking-[-0.03em] md:text-3xl">
            {title}
          </h1>
          <p className="muted mt-1 text-sm">{roleLabel}</p>
        </div>
        <nav className="reveal reveal-delay-1 flex flex-wrap items-center gap-1.5">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="btn btn-ghost">
              {l.label}
            </Link>
          ))}
          <SignOutButton />
        </nav>
      </div>
    </header>
  );
}
