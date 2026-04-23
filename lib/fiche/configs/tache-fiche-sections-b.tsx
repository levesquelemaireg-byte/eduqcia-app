"use client";

import type { FicheSectionEntry } from "@/lib/fiche/types";
import type { TacheFormState } from "@/lib/tache/tache-form-state-types";
import {
  SECTION_CD,
  SECTION_CONNAISSANCES,
  SECTION_CONSIGNE,
  SECTION_CORRIGE,
  SECTION_DOCUMENTS,
  SECTION_FOOTER,
  SECTION_GRILLE,
  SECTION_GUIDAGE,
  SECTION_HEADER,
} from "@/lib/fiche/configs/tache-fiche-sections";

/**
 * Force une section à retourner systématiquement `skeleton` — utilisé pour les sections
 * Section B dont l'UI de saisie n'est pas encore livrée. Le rendu affiche le squelette
 * pulsant défini sur la section (ou un fallback neutre si absent).
 */
function forcerSkeleton(
  section: FicheSectionEntry<TacheFormState>,
): FicheSectionEntry<TacheFormState> {
  return {
    ...section,
    resolve: () => ({ status: "skeleton" }),
  };
}

/**
 * Configuration Sommaire pour le parcours Section B (Schéma CD1).
 * Réutilise les sections communes avec `tache-fiche-sections.tsx`.
 * Les sections dont le contenu n'est pas encore disponible en Section B
 * affichent le squelette pulsant.
 */
export const TACHE_FICHE_SECTIONS_B = [
  SECTION_HEADER,
  forcerSkeleton(SECTION_CONSIGNE),
  forcerSkeleton(SECTION_GUIDAGE),
  forcerSkeleton(SECTION_DOCUMENTS),
  forcerSkeleton(SECTION_CORRIGE),
  SECTION_GRILLE,
  // SECTION_CD : pas de skeleton forcé — le selector dérive la CD auto-assignée dès l'étape 2.
  SECTION_CD,
  forcerSkeleton(SECTION_CONNAISSANCES),
  SECTION_FOOTER,
] as const;
