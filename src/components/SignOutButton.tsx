import { signOutAction } from "@/lib/actions";

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button type="submit" className="su-btn su-btn--secondary">
        Salir
      </button>
    </form>
  );
}
