import { expect, test } from "@playwright/test";

test.describe("Composition épreuve", () => {
  test("création sans session redirige vers la connexion", async ({ page }) => {
    await page.goto("/evaluations/new");
    await expect(page).toHaveURL(/\/login/);
  });

  test("édition sans session redirige vers la connexion", async ({ page }) => {
    await page.goto("/evaluations/00000000-0000-4000-8000-000000000001/edit");
    await expect(page).toHaveURL(/\/login/);
  });
});
