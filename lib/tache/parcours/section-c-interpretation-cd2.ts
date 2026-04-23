import type { ParcoursTache } from "./types";

/**
 * Parcours Section C — Interprétation (CD2).
 *
 * Désactivé pour l'instant (actif: false).
 * L'élève rédige un texte d'environ 150 mots expliquant les transformations
 * d'une réalité sociale, souvent précédé d'un tableau préparatoire.
 * Le verbe directeur est « Expliquez » (vs « Décrivez » pour Section B).
 */
export const PARCOURS_SECTION_C_INTERPRETATION_CD2: ParcoursTache = {
  id: "section-c-interpretation-cd2",
  label: "Section C — Interprétation",
  critereOfficiel: "Rigueur de l'interprétation",
  description: "Explication des transformations d'une réalité sociale (texte ~150 mots)",
  actif: false,
  oiAutoAssignee: true,
  comportementAutoAssigne: true,
  oiIdFixe: "CD2",
  comportementIdFixe: "CD2.interpretation",
  grilleFixe: "CD2_INTERPRETATION",
  documentsMin: 4,
  documentsMax: 8,
  aspectsRequis: false,
  bloc3Type: "interpretation_cd2",
  bloc4Type: "dossier_cd2",
  bloc5Type: "corrige_cd2",
};
