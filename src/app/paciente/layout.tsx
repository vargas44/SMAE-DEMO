import { AppShell } from "@/components/AppShell";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function PacienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "PACIENTE") redirect("/login");

  const profile = await prisma.patientProfile.findUnique({
    where: { userId: session.user.id },
  });

  const links = [
    { href: "/paciente", label: "Mi plan" },
    { href: "/paciente/adherencia", label: "Adherencia" },
    { href: "/paciente/catalogo", label: "Catálogo" },
  ];
  if (profile) {
    links.push({
      href: `/paciente/chat/${profile.nutritionistId}`,
      label: "Chat",
    });
  }

  return (
    <AppShell
      brand="SMAE"
      title="Mi plan"
      subtitle={`${session.user.name} · Panel paciente`}
      links={links}
    >
      {children}
    </AppShell>
  );
}
