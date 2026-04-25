/**
 * Seuils d'avertissement pour les champs libres des documents historiques.
 *
 * Les seuils sont purement informatifs : ils n'empêchent pas la saisie ni la
 * publication. L'UI affiche une pastille / bannière colorée (vert / orange /
 * rouge) pour signaler à l'enseignant que son contenu risque d'impacter la
 * mise en page imprimée.
 *
 * Les seuils "span 2" du contenu textuel s'alignent avec le moteur de layout
 * (`lib/impression/constantes-dossier-documentaire.ts`) : un texte de 151+ mots
 * (rouge) déclenche automatiquement le span 2 à l'impression.
 *
 * Référence copy UI : `docs/UI-COPY.md` (à compléter lors du lot D).
 */

import { stripHtmlToPlainText } from "@/lib/documents/strip-html";
import { countWords } from "@/lib/documents/word-count";

// ---------------------------------------------------------------------------
// Seuils — titre du document
// ---------------------------------------------------------------------------

/** 1-8 mots : neutre (pastille grise discrète). */
export const TITRE_SEUIL_OK_MAX = 8;

/** 9-12 mots : orange (avertissement doux). */
export const TITRE_SEUIL_ORANGE_MAX = 12;
// 13+ mots : rouge (avertissement fort).

// ---------------------------------------------------------------------------
// Seuils — contenu textuel
// ---------------------------------------------------------------------------

/** < ce seuil : rouge (texte trop court pour être exploitable). */
export const CONTENU_SEUIL_TROP_COURT_MIN = 15;

/** De `CONTENU_SEUIL_TROP_COURT_MIN` à ce seuil : neutre. */
export const CONTENU_SEUIL_OK_MAX = 100;

/** 101 à ce seuil : orange. Au-delà : rouge + span 2 à l'impression. */
export const CONTENU_SEUIL_ORANGE_MAX = 150;

// ---------------------------------------------------------------------------
// Seuils — légende iconographique (déjà en place, repris pour unification)
// ---------------------------------------------------------------------------

export const LEGENDE_SEUIL_ORANGE_MIN = 45;
export const LEGENDE_MAX = 50;

// ---------------------------------------------------------------------------
// Niveaux d'avertissement
// ---------------------------------------------------------------------------

export type NiveauAvertissement = "neutre" | "orange" | "rouge";

// ---------------------------------------------------------------------------
// Évaluation par champ
// ---------------------------------------------------------------------------

export function evaluerTitre(texte: string): NiveauAvertissement {
  const n = countWords(texte);
  if (n === 0) return "neutre";
  if (n <= TITRE_SEUIL_OK_MAX) return "neutre";
  if (n <= TITRE_SEUIL_ORANGE_MAX) return "orange";
  return "rouge";
}

/**
 * Évalue un contenu textuel. Accepte aussi bien du HTML (éditeur riche) que
 * du texte brut (textarea) : le HTML est stripé avant comptage.
 */
export function evaluerContenuTextuel(texte: string): NiveauAvertissement {
  const plat = stripHtmlToPlainText(texte);
  const n = countWords(plat);
  if (n === 0) return "neutre"; // champ vide : pas d'avertissement ici (géré par validation requise)
  if (n < CONTENU_SEUIL_TROP_COURT_MIN) return "rouge";
  if (n <= CONTENU_SEUIL_OK_MAX) return "neutre";
  if (n <= CONTENU_SEUIL_ORANGE_MAX) return "orange";
  return "rouge";
}

export function evaluerLegende(texte: string): NiveauAvertissement {
  const n = countWords(texte);
  if (n <= LEGENDE_SEUIL_ORANGE_MIN) return "neutre";
  if (n < LEGENDE_MAX) return "orange";
  return "rouge"; // ≥ LEGENDE_MAX : validation Zod bloque déjà, ce rouge est informatif
}
