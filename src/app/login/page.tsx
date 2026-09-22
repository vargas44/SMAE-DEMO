"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { NutritionTipsCarousel } from "@/components/NutritionTipsCarousel";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="su-page su-page--login" style={{ display: "grid", placeItems: "center" }}>
      <div className="su-auth-grid">
        <section className="su-card su-raised-lg su-rise">
          <div className="su-brand" style={{ marginBottom: 18 }}>
            <div className="su-brand-mark" aria-hidden>
              <img
                src="/assets/images/icons/logo.png"
                alt=""
                className="su-brand-mark__img"
              />
            </div>
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
          <NutritionTipsCarousel />
        </section>

        <section className="su-card su-rise su-rise-1">
          <p className="su-label">Acceso demo</p>
          <h2 className="su-title" style={{ fontSize: "1.5rem", marginTop: 8 }}>
            Ingresar
          </h2>
          <form
            className="su-stack"
            style={{ marginTop: 22 }}
            method="post"
            onSubmit={onSubmit}
          >
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
              <div className="su-password-field" style={{ marginTop: 8 }}>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  defaultValue="demo1234"
                  className="su-field"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="su-password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M3 3l18 18M10.6 10.6a2.5 2.5 0 003.5 3.5M9.9 5.2A10.4 10.4 0 0112 5c5.5 0 9.5 4.5 10.5 7-.4 1-1.2 2.4-2.5 3.7M6.1 6.1C4.2 7.5 2.9 9.3 2 12c1 2.5 5 7 10 7 1.4 0 2.7-.3 3.9-.8"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
                    </svg>
                  )}
                </button>
              </div>
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
