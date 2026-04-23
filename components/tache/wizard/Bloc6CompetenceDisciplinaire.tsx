"use client";

import { useEffect, useState } from "react";
import type { DisciplineCode } from "@/lib/tache/blueprint-helpers";
import { MillerCdColumns } from "@/components/tache/wizard/bloc5/MillerCdColumns";
import { useTacheForm } from "@/components/tache/wizard/FormState";
import { isCdStepGateOk } from "@/lib/tache/cd-step-guards";
import {
  cdDataUrlForDiscipline,
  parseCdJsonArray,
  type CdCompetenceNode,
} from "@/lib/tache/cd-helpers";
import { resoudreParcours } from "@/lib/tache/parcours/resolveur";
import {
  BLOC5_CD_GATE_WIZARD,
  WIZARD_REFERENTIEL_CD_INDISPO,
  WIZARD_REFERENTIEL_LOAD_FAILED,
} from "@/lib/ui/ui-copy";
/**
 * Étape 6 — Compétence disciplinaire — BLOC5-CD.md (`state.bloc6.cd`)
 */
export function Bloc6CompetenceDisciplinaire() {
  const { state, dispatch } = useTacheForm();
  const discipline = state.bloc2.discipline as DisciplineCode;
  const [rows, setRows] = useState<CdCompetenceNode[] | null>(null);
  const [loadError, setLoadError] = useState(false);

  const gateOk = isCdStepGateOk(state);
  const dataUrl = cdDataUrlForDiscipline(discipline);
  const parcours = resoudreParcours(state.bloc2.typeTache);

  useEffect(() => {
    if (!dataUrl) return;
    let cancelled = false;
    fetch(dataUrl)
      .then((r) => {
        if (!r.ok) throw new Error("fetch");
        return r.json();
      })
      .then((raw: unknown) => {
        if (cancelled) return;
        setLoadError(false);
        setRows(parseCdJsonArray(raw));
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [dataUrl]);

  if (!gateOk) {
    return <p className="text-sm leading-relaxed text-muted">{BLOC5_CD_GATE_WIZARD}</p>;
  }

  if (discipline === "geo") {
    return <p className="text-sm leading-relaxed text-muted">{WIZARD_REFERENTIEL_CD_INDISPO}</p>;
  }

  if (loadError) {
    return (
      <p className="text-sm text-error" role="alert">
        {WIZARD_REFERENTIEL_LOAD_FAILED}
      </p>
    );
  }

  if (rows === null) {
    return <div className="h-40 animate-pulse rounded-xl bg-border/30" aria-hidden="true" />;
  }

  if (rows.length === 0) {
    return <p className="text-sm text-muted">Aucun élément pour le moment.</p>;
  }

  // Compétence imposée par le parcours (Section B/C) — dérivation Pull.
  if (parcours.cdAutoAssignee) {
    const cdId = parcours.cdParNiveau?.[state.bloc2.niveau];
    const competence = cdId ? rows.find((r) => r.id === cdId) : undefined;
    if (!competence) {
      return (
        <p className="text-sm text-error" role="alert">
          Compétence disciplinaire introuvable pour ce niveau.
        </p>
      );
    }
    return (
      <div className="rounded-lg border border-border bg-panel-alt/60 p-4">
        <p className="text-sm font-semibold text-deep">{competence.titre}</p>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          Compétence imposée par le type de tâche — sélectionnée automatiquement selon le niveau
          scolaire.
        </p>
      </div>
    );
  }

  return (
    <MillerCdColumns
      key={
        state.bloc6.cd.selection
          ? `${state.bloc6.cd.selection.competenceId}-${state.bloc6.cd.selection.composanteId}-${state.bloc6.cd.selection.critereId}`
          : "none"
      }
      competences={rows}
      selection={state.bloc6.cd.selection}
      onSelectCritere={(sel) => dispatch({ type: "SET_CD_SELECTION", selection: sel })}
    />
  );
}
