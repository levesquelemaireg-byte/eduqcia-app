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
  const executablePath = process.env.CHROMIUM_EXECUTABLE_PATH ?? (await chromium.executablePath());

  return puppeteer.launch({
    args: process.env.CHROMIUM_EXECUTABLE_PATH
      ? ["--no-sandbox", "--disable-setuid-sandbox"]
      : chromium.args,
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
 * CSS de défense en profondeur — masque les dev tools Next.js au cas où
 * le layout d'aperçu ne les masque pas (version future, route différente).
 */
const CSS_MASQUE_DEV_TOOLS = `
  nextjs-portal,
  [data-nextjs-toast],
  [data-nextjs-dialog-overlay],
  [data-nextjs-dev-tools-button],
  [data-nextjs-dev-tools-menu],
  [data-nextjs-scroll-focus-boundary],
  #__next-build-watcher,
  #__next-prerender-indicator {
    display: none !important;
  }
`;

/**
 * Exécute le preflight complet sur une page Puppeteer :
 * 1. Fonts chargées
 * 2. Images décodées
 * 3. Aucune mutation DOM post-render
 */
async function executerPreflight(page: Page) {
  // Injecter le CSS de masquage des dev tools avant toute capture
  await page.addStyleTag({ content: CSS_MASQUE_DEV_TOOLS });

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

    // PDF: neutraliser les marges CSS @page pour eviter un double comptage
    // (marges @page + padding interne 2cm de .page).
    await page.addStyleTag({
      content: `
        @page {
          size: letter portrait;
          margin: 0 !important;
        }
        html,
        body {
          margin: 0 !important;
          padding: 0 !important;
        }
      `,
    });

    const pdf = await page.pdf({
      format: "Letter",
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
      preferCSSPageSize: false,
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

    // Capturer chaque page via element.screenshot() — plus fiable que clip calculé
    const pageElements = await page.$$("[data-page-impression]");

    const pages: Buffer[] = [];

    for (const el of pageElements) {
      const screenshot = await el.screenshot({ type: "png" });
      pages.push(Buffer.from(screenshot));
    }

    return pages;
  } finally {
    await browser.close();
  }
}
