import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PlanBuilder } from "@/components/PlanBuilder";

type Props = { params: Promise<{ id: string }> };

export default async function NewPlanPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const { id } = await params;

  const patient = await prisma.patientProfile.findFirst({
    where: { id, nutritionistId: session.user.id },
    include: { user: { select: { name: true } } },
  });
  if (!patient) notFound();

  const foods = await prisma.food.findMany({
    include: { group: true },
    orderBy: [{ group: { name: "asc" } }, { name: "asc" }],
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Nuevo plan SMAE</h2>
        <p className="text-sm text-slate-600">Paciente: {patient.user.name}</p>
      </div>
      <PlanBuilder patientId={patient.id} foods={foods} />
    </div>
  );
}
