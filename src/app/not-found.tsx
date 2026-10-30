import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";

export default function NotFound() {
  return (
    <div className="su-page" style={{ display: "grid", placeItems: "center" }} suppressHydrationWarning>
      <section className="su-card" style={{ maxWidth: 420 }}>
        <EmptyState
          title="Página no encontrada"
          action={
            <Link href="/" className="su-btn su-btn--primary" style={{ marginTop: 8 }}>
              Volver al inicio
            </Link>
          }
        >
          <p style={{ margin: 0 }}>La dirección no existe o ya no está disponible.</p>
        </EmptyState>
      </section>
    </div>
  );
}
