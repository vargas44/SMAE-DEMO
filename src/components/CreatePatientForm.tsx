"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

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
    <section className="su-card">
      <p className="su-label">Altas</p>
      <h3 style={{ margin: "8px 0 0", fontSize: 20 }}>+ Nuevo paciente</h3>
      <form
        onSubmit={onSubmit}
        style={{
          marginTop: 18,
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        }}
      >
        <input name="name" required placeholder="Nombre" className="su-field" />
        <input name="email" type="email" required placeholder="Email" className="su-field" />
        <input name="password" placeholder="Contraseña (default demo1234)" className="su-field" />
        <input name="age" type="number" placeholder="Edad" className="su-field" />
        <input name="sex" placeholder="Sexo (M/F)" className="su-field" />
        <input name="weightKg" type="number" step="0.1" placeholder="Peso kg" className="su-field" />
        <input name="heightCm" type="number" step="0.1" placeholder="Talla cm" className="su-field" />
        <input
          name="goal"
          placeholder="Objetivo"
          className="su-field"
          style={{ gridColumn: "1 / -1" }}
        />
        <button
          type="submit"
          className="su-btn su-btn--primary"
          style={{ gridColumn: "1 / -1", width: "fit-content" }}
        >
          + Crear paciente
        </button>
      </form>
      {error ? (
        <p style={{ marginTop: 12, color: "var(--su-danger)", fontWeight: 600 }}>{error}</p>
      ) : null}
      {ok ? (
        <p style={{ marginTop: 12, color: "var(--su-success)", fontWeight: 600 }}>{ok}</p>
      ) : null}
    </section>
  );
}
