import { expect, test } from "@playwright/test";

/**
 * Tests visuels des pages imprimées — print-engine PDF-10.
 *
 * Charge les golden payloads via la route dev-only `/apercu/test/[slug]`
 * et compare les screenshots aux baselines.
 *
 * Baselines : `npx playwright test --update-snapshots` sur le même OS que la CI.
 */

const GOLDEN_PAYLOADS = [
  {
    slug: "redactionnel-simple",
    label: "rédactionnel simple (formatif, 1 tâche, corrigé)",
    expectedPages: 1,
    hasDossierDocumentaire: false,
  },
  {
    slug: "ordre-chrono",
    label: "ordre chronologique (formatif, 2 docs, cases)",
    expectedPages: 1,
    hasDossierDocumentaire: false,
  },
  {
    slug: "sommatif-3-taches",
    label: "sommatif 3 tâches (dossier documentaire séparé)",
    expectedPages: 2, // au moins 2 : dossier doc + questionnaire
    hasDossierDocumentaire: true,
  },
] as const;

test.describe("impression-pdf — tests de visibilité", () => {
  for (const payload of GOLDEN_PAYLOADS) {
    test(`affiche le golden payload ${payload.slug}`, async ({ page }) => {
      await page.goto(`/apercu/test/${payload.slug}`);

      // Vérifier que des pages sont rendues
      const pages = page.locator("section.page");
      await expect(pages.first()).toBeVisible();

      // Vérifier le nombre minimum de pages
      const count = await pages.count();
      expect(count).toBeGreaterThanOrEqual(payload.expectedPages);
    });
  }

  test("sommatif-3-taches contient un dossier documentaire", async ({ page }) => {
    await page.goto("/apercu/test/sommatif-3-taches");

    // Le sommatif-standard sépare les documents dans un dossier documentaire
    const docsBlocs = page.locator(".bloc-document");
    await expect(docsBlocs.first()).toBeVisible();

    // 5 documents au total (1 + 2 + 2) dans le dossier documentaire
    const docsCount = await docsBlocs.count();
    expect(docsCount).toBe(5);
  });

  test("redactionnel-simple contient un corrigé", async ({ page }) => {
    await page.goto("/apercu/test/redactionnel-simple");

    // Le payload a estCorrige: true — un bloc corrigé doit être présent
    const corrige = page.locator(".bloc-corrige");
    await expect(corrige.first()).toBeVisible();
  });

  test("ordre-chrono ne contient pas de corrigé", async ({ page }) => {
    await page.goto("/apercu/test/ordre-chrono");

    // estCorrige: false — pas de bloc corrigé
    const corrige = page.locator(".bloc-corrige");
    expect(await corrige.count()).toBe(0);
  });

  test("ordre-chrono contient des cases de réponse", async ({ page }) => {
    await page.goto("/apercu/test/ordre-chrono");

    // L'espace de production est de type "cases"
    const quadruplet = page.locator(".bloc-quadruplet");
    await expect(quadruplet.first()).toBeVisible();
  });
});

test.describe("impression-pdf — snapshots visuels", () => {
  for (const payload of GOLDEN_PAYLOADS) {
    test(`capture visuelle ${payload.slug}`, async ({ page }) => {
      await page.goto(`/apercu/test/${payload.slug}`);
      await page.waitForLoadState("networkidle");

      // Capturer chaque page séparément pour une comparaison précise
      const pages = page.locator("section.page");
      const count = await pages.count();

      for (let i = 0; i < count; i++) {
        await expect(pages.nth(i)).toHaveScreenshot(`${payload.slug}-page-${i + 1}.png`, {
          maxDiffPixels: 900,
          animations: "disabled",
        });
      }
    });
  }
});
