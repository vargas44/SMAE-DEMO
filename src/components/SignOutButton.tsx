import { signOut } from "@/lib/auth";

export function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/login" });
      }}
    >
      <button
        type="submit"
        className="rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-700"
      >
        Salir
      </button>
    </form>
  );
}
