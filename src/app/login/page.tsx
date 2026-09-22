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
    <div className="su-page" style={{ display: "grid", placeItems: "center" }}>
      <div className="su-auth-grid">
        <section className="su-card su-raised-lg su-rise">
          <div className="su-brand" style={{ marginBottom: 18 }}>
            <div className="su-brand-mark">SM</div>
            <div>
              <p className="su-brand-name">SMAE Demo</p>
              <p className="su-brand-sub">Soft UI kit</p>
            </div>
          </div>
          <p className="su-label">Trabajo final</p>
          <h1 className="su-title" style={{ marginTop: 8 }}>
            Equivalentes con profundidad suave
          </h1>
          <p className="su-subtitle">
            Controles neumórficos (raised / inset) y acento teal para la demo
            nutriólogo ↔ paciente.
          </p>
          <div className="su-progress" style={{ marginTop: 28 }}>
            <div className="su-progress__track">
              <div className="su-progress__fill" style={{ width: "68%" }} />
            </div>
            <span style={{ fontWeight: 700, color: "var(--su-teal)" }}>68%</span>
          </div>
        </section>

        <section className="su-card su-rise su-rise-1">
          <p className="su-label">Acceso demo</p>
          <h2 className="su-title" style={{ fontSize: "1.5rem", marginTop: 8 }}>
            Ingresar
          </h2>
          <form className="su-stack" style={{ marginTop: 22 }} onSubmit={onSubmit}>
            <label>
              <span className="su-label">Email</span>
              <input
                name="email"
                type="email"
                required
                defaultValue="nutri@demo.com"
                className="su-field"
                style={{ marginTop: 8 }}
              />
            </label>
            <label>
              <span className="su-label">Contraseña</span>
              <input
                name="password"
                type="password"
                required
                defaultValue="demo1234"
                className="su-field"
                style={{ marginTop: 8 }}
              />
            </label>
            {error ? (
              <p className="su-field-hint" style={{ color: "var(--su-danger)", margin: 0 }}>
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={loading}
              className={`su-btn su-btn--primary${loading ? " is-loading" : ""}`}
            >
              {loading ? "Sending…" : "Submit Now"}
            </button>
          </form>
          <div className="su-inset-box" style={{ marginTop: 18, borderRadius: 12, padding: 14 }}>
            <p className="su-label">Usuarios seed</p>
            <p style={{ margin: "8px 0 0", fontSize: 14 }}>nutri@demo.com / demo1234</p>
            <p style={{ margin: 0, fontSize: 14 }}>paciente@demo.com / demo1234</p>
          </div>
        </section>
      </div>
    </div>
  );
}
