/**
 * Garde de publication — parcours Section B (Schéma de caractérisation).
 *
 * Produit une liste de critères vérifiables avec statut ✓ / ✗ pour alimenter
 * la checklist visible dans le wizard et bloquer la publication tant qu'un
 * critère n'est pas satisfait.
 */

import type { TacheFormState } from "@/lib/tache/tache-form-state-types";
import { computeSlotStatus, getSlotData } from "@/lib/tache/document-helpers";
import { caseEstComplete, obtenirCase, TOUTES_LES_CASES } from "./types";

export type IdCritereCompletionCd1 =
  | "preambule"
  | "chapeau-objet"
  | "chapeau-periode"
  | "case-objet"
  | "bloc-a-pivot"
  | "bloc-a-p1"
  | "bloc-a-p2"
  | "bloc-b-pivot"
  | "bloc-b-p1"
  | "bloc-b-p2"
  | "documents-min"
  | "leurres-min"
  | "associations-min";

export type CritereCompletion = {
  id: IdCritereCompletionCd1;
  label: string;
  complet: boolean;
};

/** Minimaux du parcours Section B — alignés avec la spec. */
const MIN_DOCUMENTS_COMPLETS = 8;
const MIN_LEURRES = 2;
const MIN_ASSOCIATIONS = 5;

function htmlHasContent(html: string): boolean {
  const stripped = html.replace(/<[^>]*>/g, "").trim();
  return stripped.length > 0;
}

export function criteresCompletionSchemaCd1(state: TacheFormState): CritereCompletion[] {
  const schema = state.bloc3.schemaCd1;
  const slots = state.bloc2.documentSlots;
  const docs = state.bloc4.documents;

  const checkCase = (cle: (typeof TOUTES_LES_CASES)[number]) =>
    schema ? caseEstComplete(obtenirCase(schema, cle)) : false;

  const documentsComplets = slots.filter(
    (s) => computeSlotStatus(getSlotData(docs, s.slotId)) === "complete",
  ).length;

  const leurres = slots.filter((s) => docs[s.slotId]?.estLeurre === true).length;

  const associations = slots.filter((s) => {
    const d = docs[s.slotId];
    return d && !d.estLeurre && d.casesAssociees.length > 0;
  }).length;

  return [
    {
      id: "preambule",
      label: "Mise en contexte rédigée",
      complet: schema ? htmlHasContent(schema.preambule) : false,
    },
    {
      id: "chapeau-objet",
      label: "Objet d'étude défini",
      complet: (schema?.chapeauObjet.trim().length ?? 0) > 0,
    },
    {
      id: "chapeau-periode",
      label: "Période définie",
      complet: (schema?.chapeauPeriode.trim().length ?? 0) > 0,
    },
    { id: "case-objet", label: "Objet de la description complet", complet: checkCase("objet") },
    {
      id: "bloc-a-pivot",
      label: "Élément central (aspect A) complet",
      complet: checkCase("blocA.pivot"),
    },
    {
      id: "bloc-a-p1",
      label: "Précision 1 (aspect A) complète",
      complet: checkCase("blocA.precision1"),
    },
    {
      id: "bloc-a-p2",
      label: "Précision 2 (aspect A) complète",
      complet: checkCase("blocA.precision2"),
    },
    {
      id: "bloc-b-pivot",
      label: "Élément central (aspect B) complet",
      complet: checkCase("blocB.pivot"),
    },
    {
      id: "bloc-b-p1",
      label: "Précision 1 (aspect B) complète",
      complet: checkCase("blocB.precision1"),
    },
    {
      id: "bloc-b-p2",
      label: "Précision 2 (aspect B) complète",
      complet: checkCase("blocB.precision2"),
    },
    {
      id: "documents-min",
      label: `Au moins ${MIN_DOCUMENTS_COMPLETS} documents complétés`,
      complet: documentsComplets >= MIN_DOCUMENTS_COMPLETS,
    },
    {
      id: "leurres-min",
      label: `Au moins ${MIN_LEURRES} documents non pertinents`,
      complet: leurres >= MIN_LEURRES,
    },
    {
      id: "associations-min",
      label: `Au moins ${MIN_ASSOCIATIONS} documents pertinents associés`,
      complet: associations >= MIN_ASSOCIATIONS,
    },
  ];
}

/** Étape du wizard cible pour chaque critère — utile pour la navigation cliquable. */
export function stepCibleCritere(id: IdCritereCompletionCd1): number {
  if (id === "documents-min" || id === "leurres-min" || id === "associations-min") {
    return 3; // Étape 4 (index 3) — documents
  }
  return 2; // Étape 3 (index 2) — consigne + schéma
}

export function estSchemaCd1Complet(state: TacheFormState): boolean {
  return criteresCompletionSchemaCd1(state).every((c) => c.complet);
}
