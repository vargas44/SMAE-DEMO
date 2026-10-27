import Link from "next/link";

export default function NotFound() {
  return (
    <div className="su-page" style={{ display: "grid", placeItems: "center" }}>
      <section className="su-card" style={{ maxWidth: 420 }}>
        <p className="su-label">Error 404</p>
        <h1 className="su-title" style={{ marginTop: 8 }}>
          Página no encontrada
        </h1>
        <p className="su-subtitle">
          La dirección no existe o ya no está disponible.
        </p>
        <Link href="/" className="su-btn su-btn--primary" style={{ marginTop: 18 }}>
          Volver al inicio
        </Link>
      </section>
    </div>
  );
}
