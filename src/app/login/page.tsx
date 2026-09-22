"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);
    if (res?.error) {
      setError("Credenciales inválidas");
      return;
    }
    router.refresh();
    router.push("/");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
      <div className="rounded-2xl border border-emerald-900/10 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">
          Demo TFG
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          SMAE Web
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Ingresá con un usuario demo para ver el flujo nutriólogo ↔ paciente.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block text-sm">
            <span className="mb-1 block text-slate-700">Email</span>
            <input
              name="email"
              type="email"
              required
              defaultValue="nutri@demo.com"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none ring-emerald-600 focus:ring-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-slate-700">Contraseña</span>
            <input
              name="password"
              type="password"
              required
              defaultValue="demo1234"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none ring-emerald-600 focus:ring-2"
            />
          </label>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
          >
            {loading ? "Ingresando…" : "Ingresar"}
          </button>
        </form>

        <div className="mt-6 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
          <p className="font-medium text-slate-800">Usuarios seed</p>
          <p>nutri@demo.com / demo1234</p>
          <p>paciente@demo.com / demo1234</p>
        </div>
      </div>
    </main>
  );
}
