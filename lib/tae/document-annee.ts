import { extractYearFromString } from "@/lib/utils/extract-year";
import type { DocumentSlotData } from "@/lib/tae/document-helpers";

/** Priorité : année normalisée persistée, sinon extraction depuis le repère texte. */
export function getAnneePourComparaison(doc: DocumentSlotData): number | null {
  if (doc.annee_normalisee != null && doc.annee_normalisee !== undefined) {
    return Number.isFinite(doc.annee_normalisee) ? doc.annee_normalisee : null;
  }
  return extractYearFromString(doc.repere_temporel ?? "");
}
