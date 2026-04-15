/**
 * FICHE-TACHE.md — prévisualisation fiche, sommaire formulaire, skeleton vs contenu.
 */

import { formatDateFrCaMedium } from "@/lib/utils/format-date-fr-ca";

/**
 * Détermine si une section HTML a du contenu textuel significatif.
 * Si false → afficher le skeleton (FICHE-TACHE.md §15, §20).
 */
export function hasFicheContent(value: string | null | undefined): boolean {
  if (!value) return false;
  const stripped = value.replace(/<[^>]*>/g, "").trim();
  return stripped.length > 0;
}

/** Métadonnées affichées dans le pied de fiche — sommaire wizard (`/questions/new`). */
export type WizardFichePreviewMeta = {
  authorFullName: string;
  draftStartedAtIso: string;
};

export function formatFicheDate(iso: string | null | undefined): string {
  return formatDateFrCaMedium(iso);
}
