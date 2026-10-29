import { expect, test, type Page } from "@playwright/test";

async function ingresar(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: "Ingresar" }).click();
}

test.describe("login de la demo", () => {
  test("muestra el acceso y los usuarios de demostración", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Ingresar" })).toBeVisible();
    await expect(page.getByText("nutri@demo.com / demo1234")).toBeVisible();
    await expect(page.getByText("paciente@demo.com / demo1234")).toBeVisible();
  });

  test("rechaza credenciales inválidas", async ({ page }) => {
    await ingresar(page, "nutri@demo.com", "clave-incorrecta");
    await expect(page.getByText("Credenciales inválidas")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("el nutriólogo entra al panel de pacientes", async ({ page }) => {
    await ingresar(page, "nutri@demo.com", "demo1234");
    await expect(page).toHaveURL(/\/nutriologo/);
    await expect(page.getByRole("heading", { name: "Panel" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Pacientes" })).toBeVisible();
  });

  test("el paciente entra a su plan activo", async ({ page }) => {
    await ingresar(page, "paciente@demo.com", "demo1234");
    await expect(page).toHaveURL(/\/paciente/);
    await expect(page.getByRole("heading", { name: "Mi plan" })).toBeVisible();
    await expect(page.getByText("Plan activo")).toBeVisible();
  });
});
