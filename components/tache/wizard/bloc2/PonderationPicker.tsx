"use client";

import { useId } from "react";
import { useTacheForm } from "@/components/tache/wizard/FormState";
import { ListboxField } from "@/components/ui/ListboxField";
import { RequiredMark } from "@/components/ui/RequiredMark";
import {
  CARTE_21_OUTIL_EVALUATION_1PT,
  CARTE_21_OUTIL_EVALUATION_2PTS,
  outilEvaluationFromPonderation,
  ponderationFromOutilEvaluation,
} from "@/lib/tache/non-redaction/carte-historique-payload";
import { materialIconTooltip } from "@/lib/tache/icon-justifications";
import { ICONES_METIER } from "@/lib/ui/icons/icones-metier";
import {
  BLOC2_PONDERATION_HELP,
  BLOC2_PONDERATION_LABEL,
  BLOC2_PONDERATION_OPTION_1_PT,
  BLOC2_PONDERATION_OPTION_2_PTS,
} from "@/lib/ui/ui-copy";

const PONDERATION_OPTIONS = [
  { value: "2pts", label: BLOC2_PONDERATION_OPTION_2_PTS },
  { value: "1pt", label: BLOC2_PONDERATION_OPTION_1_PT },
];

/**
 * Sélecteur de pondération — visible uniquement pour le comportement 2.1 (OI2).
 * Bascule entre les outils d'évaluation `OI2_SO1` (2 points) et `OI2_SO1_1PT` (1 point)
 * via l'action `SET_OUTIL_EVALUATION_OVERRIDE` qui ne réinitialise pas les blocs en aval.
 */
export function PonderationPicker() {
  const { state, dispatch } = useTacheForm();
  const id = useId();
  const helpId = useId();
  const current = ponderationFromOutilEvaluation(state.bloc2.outilEvaluation);

  const handleChange = (value: string) => {
    if (value !== "1pt" && value !== "2pts") return;
    const next = outilEvaluationFromPonderation(value);
    if (next === state.bloc2.outilEvaluation) return;
    dispatch({ type: "SET_OUTIL_EVALUATION_OVERRIDE", outilEvaluation: next });
  };

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="icon-text text-sm font-semibold text-deep">
        <span
          className="material-symbols-outlined text-accent"
          aria-hidden="true"
          title={materialIconTooltip(ICONES_METIER.comportement) ?? undefined}
        >
          balance
        </span>
        <span>
          {BLOC2_PONDERATION_LABEL} <RequiredMark />
        </span>
      </label>
      <p id={helpId} className="text-sm leading-relaxed text-muted">
        {BLOC2_PONDERATION_HELP}
      </p>
      <ListboxField
        id={id}
        value={current}
        onChange={handleChange}
        className="w-full max-w-md"
        options={PONDERATION_OPTIONS}
        aria-describedby={helpId}
      />
    </div>
  );
}

/** Libellé court de la pondération courante (ex. « 2 points »), pour l'affichage verrouillé. */
export function ponderationLabelFromOutilEvaluation(outilEvaluation: string | null): string {
  if (outilEvaluation === CARTE_21_OUTIL_EVALUATION_1PT) return BLOC2_PONDERATION_OPTION_1_PT;
  if (outilEvaluation === CARTE_21_OUTIL_EVALUATION_2PTS) return BLOC2_PONDERATION_OPTION_2_PTS;
  return "—";
}
