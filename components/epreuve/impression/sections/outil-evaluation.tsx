/**
 * SectionOutilEvaluation — wrapper impression de la grille canonique.
 *
 * Délègue à `<GrilleEvalTable entry={...} viewport="compact" />` qui route
 * via le registre `renderGrilleNode` (4 grilles dédiées pixel-perfect +
 * `GenericEchelleGrid` pour les autres). Source de vérité unique partagée
 * avec le wizard, la fiche détaillée et la modale.
 *
 * Invariants ministériels (§0.4 print-engine) — Arial, noir, austère —
 * déjà encapsulés dans `eval-grid.module.css` (`.evalViewport`,
 * `.viewportCompact`). Aucune duplication, aucune surcouche.
 */

import { GrilleEvalTable } from "@/components/tache/grilles/GrilleEvalTable";
import type { OutilEvaluation } from "@/lib/tache/contrats/donnees";

export type SectionOutilEvaluationProps = {
  outilEvaluation: OutilEvaluation;
};

export function SectionOutilEvaluation({ outilEvaluation }: SectionOutilEvaluationProps) {
  if (outilEvaluation === null) return null;

  return (
    <GrilleEvalTable
      entry={outilEvaluation}
      outilEvaluationId={outilEvaluation.id}
      viewport="compact"
    />
  );
}
