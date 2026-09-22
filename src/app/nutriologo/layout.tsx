import { AppHeader } from "@/components/AppHeader";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function NutriologoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "NUTRIOLOGO") redirect("/login");

  return (
    <div className="min-h-screen">
      <AppHeader
        title={`Hola, ${session.user.name}`}
        roleLabel="Panel nutriólogo"
        links={[
          { href: "/nutriologo", label: "Pacientes" },
          { href: "/nutriologo/catalogo", label: "Catálogo SMAE" },
          { href: "/nutriologo/planes", label: "Planes" },
        ]}
      />
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
