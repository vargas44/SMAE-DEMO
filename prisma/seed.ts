import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { readFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

type FoodSeed = {
  name: string;
  portionLabel: string;
  energyKcal: number;
  proteinG: number;
  lipidG: number;
  carbG: number;
  subtype?: string;
};

const GROUP_META: Record<string, { code: string; name: string; description: string }> = {
  vegetales: {
    code: "VEG",
    name: "Verduras",
    description: "Grupo de verduras SMAE",
  },
  frutas: {
    code: "FRU",
    name: "Frutas",
    description: "Grupo de frutas SMAE",
  },
  cereales: {
    code: "CER",
    name: "Cereales y tubérculos",
    description: "Grupo de cereales SMAE",
  },
  aoa_bajo: {
    code: "AOA_B",
    name: "Alimentos de origen animal (bajo en grasa)",
    description: "AOA bajo en grasa",
  },
  aoa_moderado: {
    code: "AOA_M",
    name: "Alimentos de origen animal (moderado en grasa)",
    description: "AOA moderado en grasa",
  },
  lacteos_descremados: {
    code: "LAC_D",
    name: "Lácteos descremados",
    description: "Lácteos descremados",
  },
  lacteos_semidescremados: {
    code: "LAC_S",
    name: "Lácteos semidescremados",
    description: "Lácteos semidescremados",
  },
  grasas: {
    code: "GRA",
    name: "Grasas",
    description: "Grupo de grasas SMAE",
  },
  azucares: {
    code: "AZU",
    name: "Azúcares",
    description: "Grupo de azúcares SMAE",
  },
  leguminosas: {
    code: "LEG",
    name: "Leguminosas",
    description: "Grupo de leguminosas SMAE",
  },
};

async function main() {
  console.log("Limpiando base de datos...");
  await prisma.exchangeLog.deleteMany();
  await prisma.dailyAdherence.deleteMany();
  await prisma.message.deleteMany();
  await prisma.planItem.deleteMany();
  await prisma.mealSlot.deleteMany();
  await prisma.mealPlan.deleteMany();
  await prisma.food.deleteMany();
  await prisma.foodGroup.deleteMany();
  await prisma.patientProfile.deleteMany();
  await prisma.user.deleteMany();

  const foodsPath = join(__dirname, "data", "smae-foods.json");
  const foodsData = JSON.parse(readFileSync(foodsPath, "utf-8")) as Record<
    string,
    FoodSeed[]
  >;

  console.log("Sembrando catálogo SMAE...");
  for (const [key, foods] of Object.entries(foodsData)) {
    const meta = GROUP_META[key];
    if (!meta) continue;

    const group = await prisma.foodGroup.create({
      data: {
        code: meta.code,
        name: meta.name,
        description: meta.description,
      },
    });

    await prisma.food.createMany({
      data: foods.map((f) => ({
        groupId: group.id,
        name: f.name,
        portionLabel: f.portionLabel,
        energyKcal: f.energyKcal,
        proteinG: f.proteinG,
        lipidG: f.lipidG,
        carbG: f.carbG,
        subtype: f.subtype ?? null,
      })),
    });
  }

  const passwordHash = await bcrypt.hash("demo1234", 10);

  console.log("Creando usuarios demo...");
  const nutriologo = await prisma.user.create({
    data: {
      email: "nutri@demo.com",
      name: "Dra. Ana Ruiz",
      role: "NUTRIOLOGO",
      passwordHash,
    },
  });

  const pacienteUser = await prisma.user.create({
    data: {
      email: "paciente@demo.com",
      name: "Carlos Mendoza",
      role: "PACIENTE",
      passwordHash,
    },
  });

  const paciente2User = await prisma.user.create({
    data: {
      email: "paciente2@demo.com",
      name: "María López",
      role: "PACIENTE",
      passwordHash,
    },
  });

  const patient = await prisma.patientProfile.create({
    data: {
      userId: pacienteUser.id,
      nutritionistId: nutriologo.id,
      age: 34,
      sex: "M",
      weightKg: 82,
      heightCm: 175,
      goal: "Pérdida de peso gradual y control glucémico",
      notes: "Paciente demo principal",
    },
  });

  await prisma.patientProfile.create({
    data: {
      userId: paciente2User.id,
      nutritionistId: nutriologo.id,
      age: 28,
      sex: "F",
      weightKg: 68,
      heightCm: 162,
      goal: "Mantener peso y mejorar hábitos",
    },
  });

  const tortilla = await prisma.food.findFirst({ where: { name: "Tortilla de maíz" } });
  const pechuga = await prisma.food.findFirst({ where: { name: "Pechuga de pollo sin piel" } });
  const nopal = await prisma.food.findFirst({ where: { name: "Nopales cocidos" } });
  const manzana = await prisma.food.findFirst({ where: { name: "Manzana" } });
  const leche = await prisma.food.findFirst({ where: { name: "Leche descremada" } });
  const aguacate = await prisma.food.findFirst({ where: { name: "Aguacate" } });
  const frijol = await prisma.food.findFirst({ where: { name: "Frijol cocido" } });

  if (tortilla && pechuga && nopal && manzana && leche && aguacate && frijol) {
    console.log("Creando plan demo activo...");
    await prisma.mealPlan.create({
      data: {
        patientId: patient.id,
        createdById: nutriologo.id,
        title: "Plan 1800 kcal — semana demo",
        notes: "Plan de ejemplo para la defensa del TFG",
        targetKcal: 1800,
        status: "ACTIVE",
        slots: {
          create: [
            {
              type: "BREAKFAST",
              label: "Desayuno",
              items: {
                create: [
                  { foodId: leche.id, servings: 1 },
                  { foodId: tortilla.id, servings: 2 },
                  { foodId: pechuga.id, servings: 1 },
                  { foodId: manzana.id, servings: 1 },
                ],
              },
            },
            {
              type: "LUNCH",
              label: "Comida",
              items: {
                create: [
                  { foodId: nopal.id, servings: 2 },
                  { foodId: tortilla.id, servings: 3 },
                  { foodId: pechuga.id, servings: 2 },
                  { foodId: frijol.id, servings: 1 },
                  { foodId: aguacate.id, servings: 1 },
                ],
              },
            },
            {
              type: "DINNER",
              label: "Cena",
              items: {
                create: [
                  { foodId: nopal.id, servings: 1 },
                  { foodId: tortilla.id, servings: 2 },
                  { foodId: pechuga.id, servings: 1 },
                  { foodId: manzana.id, servings: 1 },
                ],
              },
            },
          ],
        },
      },
    });
  }

  await prisma.message.create({
    data: {
      fromUserId: nutriologo.id,
      toUserId: pacienteUser.id,
      body: "Hola Carlos, ya tienes tu plan activo. Puedes intercambiar alimentos del mismo grupo SMAE.",
    },
  });

  console.log("Seed completado.");
  console.log("Usuarios:");
  console.log("  nutri@demo.com / demo1234");
  console.log("  paciente@demo.com / demo1234");
  console.log("  paciente2@demo.com / demo1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
