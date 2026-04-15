/**
 * Règles de visibilité par mode d'impression — print-engine v2.1 §D0/D3.
 *
 * Le guidage est visible uniquement en mode formatif.
 * Les titres de documents sont visibles uniquement en mode formatif.
 */

import type { ModeImpression } from "@/lib/epreuve/pagination/types";

/** Le guidage complémentaire est-il affiché sur la feuille élève ? */
export function estGuidageVisible(mode: ModeImpression): boolean {
  return mode === "formatif";
}

/** Les titres des documents historiques sont-ils affichés ? */
export function estTitreDocumentVisible(mode: ModeImpression): boolean {
  return mode === "formatif";
}
