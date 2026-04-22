"use client";

/**
 * Bloc 2 — Paramètres de la tâche (étape 2 du wizard, `currentStep === 1`).
 * Textes de l’étape : `docs/DECISIONS.md` — Étape 2 — Paramètres de la tâche.
 */
import { useCallback, useMemo, useState } from "react";
import { BlueprintLockedView } from "@/components/tache/wizard/bloc2/BlueprintLockedView";
import { Bloc2EditFields } from "@/components/tache/wizard/bloc2/Bloc2EditFields";
import { useGrilles, useOiData } from "@/components/tache/wizard/bloc2/useBloc2Data";
import { useTaeForm } from "@/components/tache/wizard/FormState";
import {
  disciplinesForNiveau,
  findComportement,
  findOi,
  isComportementSelectable,
  nbLignesFromComportementJson,
  type DisciplineCode,
  type NiveauCode,
} from "@/lib/tache/blueprint-helpers";
import type { ComportementAttenduJson } from "@/lib/types/oi";
import { BLOC2_LOADING_PARAMETERS } from "@/lib/ui/ui-copy";
import { isActiveNonRedactionVariant } from "@/lib/tache/non-redaction/wizard-variant";

export function Bloc2ParametresTache() {
  const { state, dispatch } = useTaeForm();
  const b = state.bloc2;
  const { oiList, error: oiError } = useOiData();
  const grilles = useGrilles();

  const [grilleModalOpen, setGrilleModalOpen] = useState(false);
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [modalOiOpen, setModalOiOpen] = useState(false);
  const [modalComportementOpen, setModalComportementOpen] = useState(false);

  const selectedOi = useMemo(() => findOi(oiList ?? [], b.oiId), [oiList, b.oiId]);
  const selectedComportement = useMemo(
    () => findComportement(selectedOi, b.comportementId),
    [selectedOi, b.comportementId],
  );

  const disciplineOptions = useMemo(() => {
    if (!b.niveau) return [] as DisciplineCode[];
    return disciplinesForNiveau(b.niveau as NiveauCode);
  }, [b.niveau]);

  const comportementsSelectable = useMemo(() => {
    if (!selectedOi) return [] as ComportementAttenduJson[];
    return selectedOi.comportements_attendus.filter(isComportementSelectable);
  }, [selectedOi]);

  const grilleForModal = useMemo(() => {
    if (!b.outilEvaluation || !grilles) return null;
    return grilles.find((g) => g.id === b.outilEvaluation) ?? null;
  }, [b.outilEvaluation, grilles]);

  const nonRedactionParcours = isActiveNonRedactionVariant(state);

  const setNiveau = useCallback(
    (niveau: string) => {
      if (niveau === "sec5") return;
      dispatch({ type: "SET_NIVEAU", niveau });
    },
    [dispatch],
  );

  const setDiscipline = useCallback(
    (discipline: string) => {
      dispatch({ type: "SET_DISCIPLINE", discipline });
    },
    [dispatch],
  );

  const setOi = useCallback(
    (oiId: string) => {
      dispatch({ type: "SET_OI", oiId });
    },
    [dispatch],
  );

  const setComportement = useCallback(
    (c: ComportementAttenduJson) => {
      if (!isComportementSelectable(c) || c.nb_documents == null) return;
      dispatch({
        type: "SET_COMPORTEMENT",
        comportementId: c.id,
        nbDocuments: c.nb_documents,
        outilEvaluation: c.outil_evaluation,
        nbLignes: nbLignesFromComportementJson(c),
      });
    },
    [dispatch],
  );

  const confirmUnlock = useCallback(() => {
    dispatch({ type: "UNLOCK_BLUEPRINT" });
    setUnlockModalOpen(false);
  }, [dispatch]);

  if (oiError) {
    return (
      <p className="rounded-lg border border-error/40 bg-error/10 px-3 py-2 text-sm text-error">
        {oiError}
      </p>
    );
  }

  if (!oiList) {
    return (
      <p className="text-sm text-muted" role="status">
        {BLOC2_LOADING_PARAMETERS}
      </p>
    );
  }

  if (b.blueprintLocked) {
    return (
      <BlueprintLockedView
        blueprint={b}
        selectedOi={selectedOi}
        selectedComportement={selectedComportement}
        hideNbLignesSummary={nonRedactionParcours}
        unlockModalOpen={unlockModalOpen}
        onUnlockModalOpenChange={setUnlockModalOpen}
        onConfirmUnlock={confirmUnlock}
      />
    );
  }

  return (
    <Bloc2EditFields
      blueprint={b}
      oiList={oiList}
      selectedOi={selectedOi}
      selectedComportement={selectedComportement}
      disciplineOptions={disciplineOptions}
      comportementsSelectable={comportementsSelectable}
      grilleForModal={grilleForModal}
      onSetNiveau={setNiveau}
      onSetDiscipline={setDiscipline}
      onSetOi={setOi}
      onSetComportement={setComportement}
      grilleModalOpen={grilleModalOpen}
      onGrilleModalOpenChange={setGrilleModalOpen}
      modalOiOpen={modalOiOpen}
      onModalOiOpenChange={setModalOiOpen}
      modalComportementOpen={modalComportementOpen}
      onModalComportementOpenChange={setModalComportementOpen}
    />
  );
}
