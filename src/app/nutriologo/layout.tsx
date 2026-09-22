import { AppShell } from "@/components/AppShell";
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
    <AppShell
      brand="SMAE"
      title="Dashboard"
      subtitle={`${session.user.name} · Panel nutriólogo`}
      links={[
        { href: "/nutriologo", label: "Pacientes" },
        { href: "/nutriologo/catalogo", label: "Catálogo SMAE" },
        { href: "/nutriologo/planes", label: "Planes" },
      ]}
    >
      {children}
    </AppShell>
  );
}
