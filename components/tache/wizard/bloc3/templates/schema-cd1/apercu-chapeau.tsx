"use client";

import { useTacheForm } from "@/components/tache/wizard/FormState";
import { ASPECT_LABEL } from "@/lib/tache/aspect-labels";
import {
  SECTION_B_CHAPEAU_APERCU_LABEL,
  SECTION_B_CHAPEAU_APERCU_PLACEHOLDER_ASPECT,
  SECTION_B_CHAPEAU_APERCU_PLACEHOLDER_OBJET,
  SECTION_B_CHAPEAU_APERCU_PLACEHOLDER_PERIODE,
} from "@/lib/ui/ui-copy";

export function ApercuChapeau() {
  const { state } = useTacheForm();
  const schema = state.bloc3.schemaCd1;

  const objet = schema?.chapeauObjet.trim() ?? "";
  const periode = schema?.chapeauPeriode.trim() ?? "";
  const aspectAKey = state.bloc2.aspectA;
  const aspectBKey = state.bloc2.aspectB;

  const aspectA = aspectAKey ? ASPECT_LABEL[aspectAKey].toLowerCase() : null;
  const aspectB = aspectBKey ? ASPECT_LABEL[aspectBKey].toLowerCase() : null;

  const objetDisplay = objet.length > 0 ? objet : null;
  const periodeDisplay = periode.length > 0 ? periode : null;

  return (
    <div className="rounded-md border border-border bg-panel px-4 py-3">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
        {SECTION_B_CHAPEAU_APERCU_LABEL}
      </p>
      <p className="text-sm font-semibold leading-relaxed text-deep">
        Décrivez{" "}
        {objetDisplay ? (
          <span>{objetDisplay}</span>
        ) : (
          <span className="italic text-muted">{SECTION_B_CHAPEAU_APERCU_PLACEHOLDER_OBJET}</span>
        )}{" "}
        {periodeDisplay ? (
          <span>{periodeDisplay}</span>
        ) : (
          <span className="italic text-muted">{SECTION_B_CHAPEAU_APERCU_PLACEHOLDER_PERIODE}</span>
        )}{" "}
        sous ses aspects{" "}
        {aspectA ? (
          <span>{aspectA}</span>
        ) : (
          <span className="italic text-muted">{SECTION_B_CHAPEAU_APERCU_PLACEHOLDER_ASPECT}</span>
        )}{" "}
        et{" "}
        {aspectB ? (
          <span>{aspectB}</span>
        ) : (
          <span className="italic text-muted">{SECTION_B_CHAPEAU_APERCU_PLACEHOLDER_ASPECT}</span>
        )}
        .
      </p>
    </div>
  );
}
