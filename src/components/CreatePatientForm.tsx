"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const inputClass =
  "rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-emerald-600 focus:ring-2";

export function CreatePatientForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setOk("");
    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name")),
      email: String(form.get("email")),
      password: String(form.get("password") || "demo1234"),
      age: form.get("age") ? Number(form.get("age")) : undefined,
      sex: String(form.get("sex") || "") || undefined,
      weightKg: form.get("weightKg") ? Number(form.get("weightKg")) : undefined,
      heightCm: form.get("heightCm") ? Number(form.get("heightCm")) : undefined,
      goal: String(form.get("goal") || "") || undefined,
    };

    const res = await fetch("/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "No se pudo crear");
      return;
    }
    setOk(`Paciente creado: ${data.user.email}`);
    e.currentTarget.reset();
    router.refresh();
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="font-semibold text-slate-900">Alta de paciente</h3>
      <form onSubmit={onSubmit} className="mt-4 grid gap-3 sm:grid-cols-2">
        <input name="name" required placeholder="Nombre" className={inputClass} />
        <input name="email" type="email" required placeholder="Email" className={inputClass} />
        <input name="password" placeholder="Contraseña (default demo1234)" className={inputClass} />
        <input name="age" type="number" placeholder="Edad" className={inputClass} />
        <input name="sex" placeholder="Sexo (M/F)" className={inputClass} />
        <input name="weightKg" type="number" step="0.1" placeholder="Peso kg" className={inputClass} />
        <input name="heightCm" type="number" step="0.1" placeholder="Talla cm" className={inputClass} />
        <input name="goal" placeholder="Objetivo" className={`${inputClass} sm:col-span-2`} />
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white sm:col-span-2"
        >
          Crear paciente
        </button>
      </form>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      {ok ? <p className="mt-2 text-sm text-emerald-700">{ok}</p> : null}
    </section>
  );
}
