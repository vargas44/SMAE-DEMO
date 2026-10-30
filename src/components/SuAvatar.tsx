/** Kit muestra — para revertir, dejá de usar <SuAvatar />. */

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "?";
  const b = parts[1]?.[0] ?? "";
  return `${a}${b}`.toUpperCase();
}

export function SuAvatar({ name }: { name: string | null | undefined }) {
  return (
    <span className="su-avatar" aria-hidden="true">
      {initials(name ?? "")}
    </span>
  );
}
