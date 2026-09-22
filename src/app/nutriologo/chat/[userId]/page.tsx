import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ChatBox } from "@/components/ChatBox";

type Props = { params: Promise<{ userId: string }> };

export default async function NutriChatPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const { userId } = await params;

  const other = await prisma.user.findUnique({ where: { id: userId } });
  if (!other) notFound();

  if (session.user.role === "NUTRIOLOGO") {
    const linked = await prisma.patientProfile.findFirst({
      where: { userId, nutritionistId: session.user.id },
    });
    if (!linked) notFound();
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Chat con {other.name}</h2>
        <p className="text-sm text-slate-600">Mensajería simple de la demo.</p>
      </div>
      <ChatBox withUserId={other.id} />
    </div>
  );
}
