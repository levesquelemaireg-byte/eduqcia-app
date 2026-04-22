"use client";

/**
 * Étape 3 — Consigne et guidage complémentaire — docs/WORKFLOWS.md + CONSIGNE-EDITOR.md (TipTap).
 */
import { useCallback, useState } from "react";
import { Bloc3InfoModals } from "@/components/tache/wizard/bloc3/Bloc3InfoModals";
import { SectionConsigne } from "@/components/tache/wizard/bloc3/SectionConsigne";
import { SectionGuidage } from "@/components/tache/wizard/bloc3/SectionGuidage";
import { useTacheForm } from "@/components/tache/wizard/FormState";
import { isBlueprintFieldsComplete } from "@/lib/tache/blueprint-helpers";
import { BLOC3_GATE_BLUEPRINT } from "@/lib/ui/ui-copy";

export function Bloc3ConsigneProduction() {
  const { state, dispatch } = useTacheForm();
  const b = state.bloc2;

  const [modalConsigne, setModalConsigne] = useState(false);
  const [modalGuidage, setModalGuidage] = useState(false);

  const blueprintOk = isBlueprintFieldsComplete(b) && b.blueprintLocked;

  const setConsigne = useCallback(
    (html: string) => dispatch({ type: "SET_CONSIGNE", value: html }),
    [dispatch],
  );
  const setGuidage = useCallback(
    (html: string) => dispatch({ type: "SET_GUIDAGE", value: html }),
    [dispatch],
  );

  if (!blueprintOk) {
    return <p className="text-sm leading-relaxed text-muted">{BLOC3_GATE_BLUEPRINT}</p>;
  }

  return (
    <div className="space-y-5">
      <SectionConsigne
        blueprint={b}
        consigneHtml={state.bloc3.consigne}
        onConsigneChange={setConsigne}
        onInfoClick={() => setModalConsigne(true)}
      />

      <SectionGuidage
        value={state.bloc3.guidage}
        onChange={setGuidage}
        onInfoClick={() => setModalGuidage(true)}
      />

      <Bloc3InfoModals
        openConsigne={modalConsigne}
        openGuidage={modalGuidage}
        onCloseConsigne={() => setModalConsigne(false)}
        onCloseGuidage={() => setModalGuidage(false)}
      />
    </div>
  );
}
