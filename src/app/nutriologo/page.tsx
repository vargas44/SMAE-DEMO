import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreatePatientForm } from "@/components/CreatePatientForm";

export default async function NutriologoHomePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const patients = await prisma.patientProfile.findMany({
    where: { nutritionistId: session.user.id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      plans: {
        where: { status: "ACTIVE" },
        select: { id: true, title: true },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-semibold text-slate-900">Pacientes</h2>
        <p className="mt-1 text-sm text-slate-600">
          Gestioná perfiles, planes SMAE e intercambios.
        </p>
      </section>

      <div className="grid gap-3">
        {patients.map((p) => (
          <div
            key={p.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
          >
            <div>
              <p className="font-medium text-slate-900">{p.user.name}</p>
              <p className="text-sm text-slate-500">{p.user.email}</p>
              <p className="text-xs text-slate-500">
                {p.goal || "Sin objetivo cargado"}
                {p.plans[0] ? ` · Plan activo: ${p.plans[0].title}` : " · Sin plan activo"}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/nutriologo/pacientes/${p.id}`}
                className="rounded-md bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800"
              >
                Ver ficha
              </Link>
              <Link
                href={`/nutriologo/pacientes/${p.id}/plan-nuevo`}
                className="rounded-md border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50"
              >
                Nuevo plan
              </Link>
              <Link
                href={`/nutriologo/chat/${p.user.id}`}
                className="rounded-md border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50"
              >
                Chat
              </Link>
            </div>
          </div>
        ))}
        {patients.length === 0 ? (
          <p className="text-sm text-slate-500">Todavía no hay pacientes.</p>
        ) : null}
      </div>

      <CreatePatientForm />
    </div>
  );
}
