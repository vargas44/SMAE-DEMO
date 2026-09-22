import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ChatBox } from "@/components/ChatBox";

type Props = { params: Promise<{ userId: string }> };

export default async function PacienteChatPage({ params }: Props) {
  const session = await auth();
  if (!session?.user || session.user.role !== "PACIENTE") redirect("/login");
  const { userId } = await params;

  const profile = await prisma.patientProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile || profile.nutritionistId !== userId) notFound();

  const other = await prisma.user.findUnique({ where: { id: userId } });
  if (!other) notFound();

  return (
    <div className="su-stack">
      <div>
        <p className="su-label">Mensajes</p>
        <h2 className="su-title" style={{ fontSize: "1.45rem", marginTop: 6 }}>
          Chat con {other.name}
        </h2>
        <p className="su-subtitle">Mensajería simple de la demo.</p>
      </div>
      <ChatBox withUserId={other.id} />
    </div>
  );
}
