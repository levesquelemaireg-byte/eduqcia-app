import type { Page } from "puppeteer-core";

/**
 * Fonctions preflight Puppeteer — print-engine D4.
 *
 * Chaque fonction bloque jusqu'à ce que la condition soit remplie
 * ou que le timeout expire (rejet avec erreur descriptive).
 */

const TIMEOUT_PAR_DEFAUT_MS = 10_000;

/**
 * Attend que toutes les polices de la page soient chargées.
 * Arial est système mais on vérifie quand même (défense en profondeur).
 */
export async function attendreFontsChargees(
  page: Page,
  timeoutMs = TIMEOUT_PAR_DEFAUT_MS,
): Promise<void> {
  await page.waitForFunction(() => document.fonts.status === "loaded", {
    timeout: timeoutMs,
  });
}

/**
 * Attend que toutes les images de la page soient décodées (complete === true).
 */
export async function attendreImagesDecodees(
  page: Page,
  timeoutMs = TIMEOUT_PAR_DEFAUT_MS,
): Promise<void> {
  await page.waitForFunction(() => Array.from(document.images).every((img) => img.complete), {
    timeout: timeoutMs,
  });
}

/**
 * Observe le DOM pendant `timeoutMs` et rejette si une mutation survient.
 * Résout si aucune mutation n'est détectée avant la fin du délai.
 *
 * Objectif : détecter des re-renders React tardifs qui causeraient
 * une divergence entre l'aperçu wizard et le PDF Puppeteer.
 */
export async function assertAucuneMutation(page: Page, timeoutMs = 2000): Promise<void> {
  await page.evaluate((ms: number) => {
    return new Promise<void>((resolve, reject) => {
      let mutationDetectee = false;

      const observer = new MutationObserver(() => {
        mutationDetectee = true;
        observer.disconnect();
        reject(new Error("Mutation DOM détectée après le chargement initial."));
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
      });

      setTimeout(() => {
        observer.disconnect();
        if (!mutationDetectee) {
          resolve();
        }
      }, ms);
    });
  }, timeoutMs);
}
