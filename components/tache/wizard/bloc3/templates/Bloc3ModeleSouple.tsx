"use client";

/**
 * Bloc 3 — modèle souple (OI3 · 3.1, 3.2).
 * TipTap standard + bouton « Utiliser un modèle de consigne » dans la toolbar.
 * Au clic → setContent() remplace le contenu existant par le template.
 * Spec : docs/SPEC-TEMPLATES-CONSIGNE.md § OI3 · 3.1 et 3.2
 */
import { useCallback, useMemo, useState } from "react";
import { Bloc3InfoModals } from "@/components/tache/wizard/bloc3/Bloc3InfoModals";
import { SectionConsigne } from "@/components/tache/wizard/bloc3/SectionConsigne";
import { SectionGuidage } from "@/components/tache/wizard/bloc3/SectionGuidage";
import { useTacheForm } from "@/components/tache/wizard/FormState";
import { isBlueprintFieldsComplete } from "@/lib/tache/blueprint-helpers";
import { getWizardBlocConfig } from "@/lib/tache/wizard-bloc-config";
import { CONSIGNE_TEMPLATES } from "@/lib/tache/consigne-templates";
import { BLOC3_GATE_BLUEPRINT } from "@/lib/ui/ui-copy";
import { PERSP_BLOC3_TEMPLATE_BUTTON } from "@/lib/ui/ui-copy";

export default function Bloc3ModeleSouple() {
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

  const templateButton = useMemo(() => {
    const config = getWizardBlocConfig(b.comportementId);
    if (config?.bloc3.type !== "modele_souple") return undefined;
    const templateKey = config.bloc3.templateKey;
    const templateText = CONSIGNE_TEMPLATES[templateKey];
    return {
      label: PERSP_BLOC3_TEMPLATE_BUTTON,
      onClick: () => {
        dispatch({ type: "SET_CONSIGNE", value: `<p>${templateText}</p>` });
      },
    };
  }, [b.comportementId, dispatch]);

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
        templateButton={templateButton}
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
