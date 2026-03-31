import { expect, test } from "@playwright/test";

/** Les 22 outils — aligné sur `public/data/grilles-evaluation.json`. */
const GRILLE_IDS = [
  "OI0_SO1",
  "OI1_SO1",
  "OI1_SO2",
  "OI1_SO3",
  "OI2_SO1",
  "OI2_SO2",
  "OI2_SO3",
  "OI3_SO1",
  "OI3_SO2",
  "OI3_SO3",
  "OI3_SO4",
  "OI3_SO5",
  "OI4_SO1",
  "OI4_SO2",
  "OI4_SO3",
  "OI4_SO4",
  "OI5_SO1",
  "OI5_SO2",
  "OI6_SO1",
  "OI6_SO2",
  "OI6_SO3",
  "OI7_SO1",
] as const;

/** Captures `toHaveScreenshot` — OI0_SO1 : pilote rendu générique ; OI3_SO5 / OI6_SO3 / OI7_SO1 : grilles complexes validées pixel-perfect (voir docs/ARCHITECTURE.md). */
const SNAPSHOT_PILOTS = ["OI0_SO1", "OI3_SO5", "OI6_SO3", "OI7_SO1"] as const;

test.describe("eval-grid-snapshot", () => {
  for (const id of GRILLE_IDS) {
    test(`affiche la grille ${id}`, async ({ page }) => {
      await page.goto(`/eval-grid-snapshot/${id}`);
      const root = page.getByTestId(`eval-grid-${id}`);
      await expect(root).toBeVisible();
      await expect(root.locator("table")).toBeVisible();
    });
  }

  for (const id of SNAPSHOT_PILOTS) {
    test(`capture pilote ${id}`, async ({ page }) => {
      await page.goto(`/eval-grid-snapshot/${id}`);
      const root = page.getByTestId(`eval-grid-${id}`);
      await expect(root).toHaveScreenshot(`${id}.png`, {
        maxDiffPixels: 900,
        animations: "disabled",
      });
    });
  }
});
