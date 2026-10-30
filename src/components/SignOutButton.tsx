import { signOutAction } from "@/lib/actions";

export function SignOutButton() {
  return (
    <form action={signOutAction} suppressHydrationWarning>
      <button type="submit" className="su-btn su-btn--primary" suppressHydrationWarning>
        Salir
      </button>
    </form>
  );
}
