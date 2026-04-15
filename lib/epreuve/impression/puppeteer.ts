import "server-only";

import puppeteer, { type Page } from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";

import { PAGE_WIDTH_PX, PAGE_HEIGHT_PX } from "@/lib/epreuve/pagination/constantes";
import { attendreFontsChargees, attendreImagesDecodees, assertAucuneMutation } from "./preflight";

/**
 * Wrapper Puppeteer server-only — print-engine D4.
 *
 * Lance Chromium headless via @sparticuz/chromium-min (optimisé Vercel),
 * navigue vers la route SSR /apercu/[token], exécute le preflight complet,
 * puis génère le PDF ou les PNG pages.
 */

/** Timeout navigation + preflight total. */
const NAVIGATION_TIMEOUT_MS = 25_000;

/**
 * Lance un navigateur Chromium headless optimisé pour Vercel serverless.
 */
async function lancerNavigateur() {
  const executablePath = await chromium.executablePath();

  return puppeteer.launch({
    args: chromium.args,
    defaultViewport: {
      width: PAGE_WIDTH_PX,
      height: PAGE_HEIGHT_PX,
      deviceScaleFactor: 1,
    },
    executablePath,
    headless: true,
  });
}

/**
 * Exécute le preflight complet sur une page Puppeteer :
 * 1. Fonts chargées
 * 2. Images décodées
 * 3. Aucune mutation DOM post-render
 */
async function executerPreflight(page: Page) {
  await attendreFontsChargees(page);
  await attendreImagesDecodees(page);
  await assertAucuneMutation(page);
}

/**
 * Génère un PDF à partir de la route SSR d'aperçu.
 *
 * @param url - URL complète de la route SSR /apercu/[token]
 * @returns Buffer contenant le PDF Letter portrait, marges 0 (marges CSS)
 */
export async function genererPdf(url: string): Promise<Buffer> {
  const browser = await lancerNavigateur();

  try {
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(NAVIGATION_TIMEOUT_MS);

    await page.goto(url, { waitUntil: "networkidle0" });
    await executerPreflight(page);

    const pdf = await page.pdf({
      format: "Letter",
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
      printBackground: true,
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

/**
 * Génère un PNG par page pour le carrousel d'aperçu.
 *
 * @param url - URL complète de la route SSR /apercu/[token]
 * @returns Tableau de Buffer PNG, un par page
 */
export async function genererPngPages(url: string): Promise<Buffer[]> {
  const browser = await lancerNavigateur();

  try {
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(NAVIGATION_TIMEOUT_MS);

    await page.goto(url, { waitUntil: "networkidle0" });
    await executerPreflight(page);

    // Déterminer le nombre de pages via les éléments .page-impression
    const nombrePages = await page.evaluate(() => {
      return document.querySelectorAll("[data-page-impression]").length;
    });

    const pages: Buffer[] = [];

    for (let i = 0; i < nombrePages; i++) {
      // Scroll vers la page cible et capture
      const screenshot = await page
        .evaluate((index: number) => {
          const pageElements = document.querySelectorAll("[data-page-impression]");
          if (pageElements[index]) {
            pageElements[index].scrollIntoView({ behavior: "instant" as ScrollBehavior });
          }
        }, i)
        .then(() =>
          page.screenshot({
            type: "png",
            clip: {
              x: 0,
              y: i * PAGE_HEIGHT_PX,
              width: PAGE_WIDTH_PX,
              height: PAGE_HEIGHT_PX,
            },
          }),
        );

      pages.push(Buffer.from(screenshot));
    }

    return pages;
  } finally {
    await browser.close();
  }
}
