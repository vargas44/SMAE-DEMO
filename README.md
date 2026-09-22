# SMAE Demo

Demo web funcional del **Sistema Mexicano de Alimentos Equivalentes (SMAE)** para un Trabajo Final de Grado.

La aplicación digitaliza un catálogo SMAE, permite a un **nutriólogo** diseñar planes alimenticios por tiempos de comida y a un **paciente** consultar su plan e **intercambiar equivalentes** del mismo grupo sin romper las raciones ni los totales estimados de energía y macronutrientes.

---

## Funcionalidades

### Autenticación y roles
- Login con credenciales
- Roles `NUTRIOLOGO` y `PACIENTE` con rutas y API protegidas

### Nutriólogo
- Listado y alta de pacientes
- Ficha del paciente (datos básicos, objetivo, historial)
- Diseño de planes SMAE por tiempos de comida (desayuno, colaciones, comida, cena)
- Cálculo automático de kcal, proteína, lípidos y carbohidratos
- Activación / archivado de planes
- Consulta del catálogo SMAE
- Visualización del log de intercambios realizados por el paciente
- Chat simple con el paciente

### Paciente
- Visualización del plan activo
- Intercambio de alimentos por equivalentes del mismo grupo (y subtipo, si aplica)
- Registro de adherencia diaria por tiempo de comida
- Consulta del catálogo SMAE
- Chat con el nutriólogo

### Motor SMAE
- Validación de equivalencias (`validateExchange`)
- Totales nutricionales del plan (`calculatePlanTotals`)
- Seed con ~10 grupos y más de 80 alimentos de ejemplo

---

## UI — Soft UI (neumorfismo)

La interfaz usa el kit **Soft UI**: superficie crema monócroma con profundidad por **doble sombra** (raised / inset / pressed) y acento **teal** `#004D54`.

### Cambios de diseño incluidos
- Tokens CSS Soft UI (`--su-*`) en `src/app/globals.css`
- Tipografía **DM Sans**
- Shell con topbar + navegación tipo **tabs** neumórficas
- Botones pill (primary teal / secondary raised)
- Inputs **inset**, cards raised, badges y barras de progreso soft
- Login, paneles nutriólogo/paciente, catálogo, chat y diseñador de plan alineados al mismo sistema

### Paleta principal

| Token | Hex | Uso |
| --- | --- | --- |
| `--su-bg` / `--su-surface` | `#F5F2E8` | Fondo y superficies |
| `--su-teal` | `#004D54` | CTA y acentos |
| `--su-ink` | `#2C2C2C` | Texto principal |
| `--su-ink-muted` | `#6B6B63` | Texto secundario |

---

## Stack

| Capa | Tecnología |
| --- | --- |
| Frontend + API | Next.js (App Router) |
| Auth | Auth.js (NextAuth v5) |
| Base de datos | Prisma + SQLite |
| UI | React + Tailwind CSS + Soft UI |
| Tests | Vitest |

---

## Requisitos

- [Node.js](https://nodejs.org/) 20 o superior
- npm (incluido con Node.js)

---

## Cómo correrlo

```bash
# 1. Clonar el repositorio
git clone https://github.com/vargas44/SMAE-DEMO.git
cd SMAE-DEMO

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
copy .env.example .env
# En Linux/macOS: cp .env.example .env

# 4. Crear la base de datos e insertar datos demo
npx prisma db push
npm run db:seed

# 5. Levantar el servidor de desarrollo
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000) en el navegador.

### Scripts útiles

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servidor de producción (después del build) |
| `npm run db:push` | Sincroniza el esquema Prisma con SQLite |
| `npm run db:seed` | Carga usuarios, catálogo y un plan demo |
| `npm run db:reset` | Recrea la DB y vuelve a sembrar datos |
| `npm run test` | Ejecuta los tests (Vitest) |
| `npm run test:watch` | Tests en modo watch |

---

## Usuarios demo

| Rol | Email | Contraseña |
| --- | --- | --- |
| Nutriólogo | `nutri@demo.com` | `demo1234` |
| Paciente | `paciente@demo.com` | `demo1234` |
| Paciente 2 | `paciente2@demo.com` | `demo1234` |

El paciente principal (`paciente@demo.com`) ya tiene un **plan activo** cargado para probar intercambios de inmediato.

---

## Guion rápido de demo (5 minutos)

1. Ingresá como **nutriólogo** y revisá la lista de pacientes.
2. Abrí el catálogo SMAE y el detalle de Carlos Mendoza.
3. Creá o activá un plan y observá los totales kcal/macros.
4. Cerrá sesión e ingresá como **paciente**.
5. Cambiá un alimento por un equivalente del mismo grupo.
6. Volvé como nutriólogo y verificá el log de intercambios / chat.

---

## Tests

La suite (27 tests) cubre:

- Cálculo de macros / totales del plan (`calculatePlanTotals`)
- Validación de intercambios SMAE (`validateExchange`)
- Orden y etiquetas de tiempos de comida
- RBAC de sesión (`requireSession` / `requireRole`)
- API de intercambios, planes y catálogo (con mocks)

```bash
npm run test
```

---

## Estructura del proyecto

```
smae-demo/
  prisma/           # Schema, seed y catálogo JSON
  public/assets/    # Assets estáticos
  src/
    app/            # Páginas y Route Handlers (API)
    components/     # UI Soft UI (AppShell, cards, forms)
    lib/            # Auth, Prisma y motor SMAE
  vitest.config.ts  # Configuración de tests
```

---

## Notas

- La base SQLite se crea en `prisma/dev.db` (no se versiona).
- No subas el archivo `.env` al repositorio; usá `.env.example` como plantilla.
- Es una **demo académica**, no un producto clínico en producción.
