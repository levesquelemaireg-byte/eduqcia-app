import type { DocumentFiche } from "@/lib/types/fiche";
import { stripHtmlToPlainText } from "@/lib/utils/stripHtml";

/**
 * PROVISOIRE — Heuristique pour pleine largeur de la cellule document à l’impression.
 * Remplaçable par un champ métier (`print_full_width` / `span_print`) — voir docs/BACKLOG.md.
 */

/** En dessous : laisser `auto-fit` décider (pas de pleine largeur forcée). */
export const PRINT_DOC_FULL_WIDTH_MIN_CHARS = 400;

/** Au-dessus : texte dense → occuper toute la grille (1 ligne). */
export const PRINT_DOC_FULL_WIDTH_ALWAYS = 950;

/** Seuil de `<li` pour considérer une liste `<ul>` comme « large ». */
export const PRINT_DOC_FULL_WIDTH_UL_LI_THRESHOLD = 12;

/** Seuil de `<li` pour considérer une liste `<ol>` comme « large ». */
export const PRINT_DOC_FULL_WIDTH_OL_LI_THRESHOLD = 10;

export function shouldPrintDocumentFullWidth(doc: DocumentFiche): boolean {
  if (doc.type === "iconographique") {
    return false;
  }

  const plainText = stripHtmlToPlainText(doc.contenu ?? "");
  const length = plainText.length;

  if (length > PRINT_DOC_FULL_WIDTH_ALWAYS) {
    return true;
  }
  if (length < PRINT_DOC_FULL_WIDTH_MIN_CHARS) {
    return false;
  }

  const html = (doc.contenu ?? "").toLowerCase();
  if (html.includes("<table")) {
    return true;
  }

  if (html.includes("<ul")) {
    const liCount = html.split("<li").length - 1;
    if (liCount > PRINT_DOC_FULL_WIDTH_UL_LI_THRESHOLD) {
      return true;
    }
  }

  if (html.includes("<ol")) {
    const liCount = html.split("<li").length - 1;
    if (liCount > PRINT_DOC_FULL_WIDTH_OL_LI_THRESHOLD) {
      return true;
    }
  }

  return false;
}
