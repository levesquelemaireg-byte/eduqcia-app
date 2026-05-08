"use client";

/**
 * Bloc 3 — modèle souple (OI3 · 3.1, 3.2 ; OI4 · 4.1, 4.2 ; OI6 · 6.1, 6.2).
 * TipTap standard + bouton « Utiliser un modèle de consigne » dans la toolbar.
 * Au clic → setContent() remplace le contenu existant par le template.
 *
 * Pour 6.1 et 6.2 (`bloc4.type === "moments"`) : ajoute un RadioCardGroup
 * en tête de section pour basculer mode groupé (1 doc à 2 moments) / séparé
 * (2 docs distincts). Le template inséré change selon le mode.
 *
 * Spec : docs/SPEC-TEMPLATES-CONSIGNE.md § OI3 · 3.1 et 3.2 ; § OI6 · 6.1 et 6.2
 */
import { useCallback, useMemo, useState } from "react";
import { Bloc3InfoModals } from "@/components/tache/wizard/bloc3/Bloc3InfoModals";
import { SectionConsigne } from "@/components/tache/wizard/bloc3/SectionConsigne";
import { SectionGuidage } from "@/components/tache/wizard/bloc3/SectionGuidage";
import { useTacheForm } from "@/components/tache/wizard/FormState";
import { RadioCardGroup } from "@/components/ui/RadioCardGroup";
import { isBlueprintFieldsComplete } from "@/lib/tache/blueprint-helpers";
import { getWizardBlocConfig } from "@/lib/tache/wizard-bloc-config";
import { CONSIGNE_TEMPLATES, type ConsigneTemplateKey } from "@/lib/tache/consigne-templates";
import {
  BLOC3_GATE_BLUEPRINT,
  BLOC4_MOMENTS_STRUCTURE_GROUPE,
  BLOC4_MOMENTS_STRUCTURE_SEPARE,
  PERSP_BLOC3_STRUCTURE_LABEL,
  PERSP_BLOC3_TEMPLATE_BUTTON,
} from "@/lib/ui/ui-copy";

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

  const config = useMemo(() => getWizardBlocConfig(b.comportementId), [b.comportementId]);
  const isMomentsMode = config?.bloc4.type === "moments";
  const modeStructure = state.bloc3.perspectivesMode ?? "groupe";

  const templateButton = useMemo(() => {
    if (config?.bloc3.type !== "modele_souple") return undefined;
    const baseKey = config.bloc3.templateKey;
    // En mode séparé pour OI6.1/6.2 : suffixer la clé pour récupérer le template à 2 docs.
    const finalKey: ConsigneTemplateKey =
      isMomentsMode && modeStructure === "separe"
        ? (`${baseKey}-separe` as ConsigneTemplateKey)
        : baseKey;
    const templateText = CONSIGNE_TEMPLATES[finalKey];
    return {
      label: PERSP_BLOC3_TEMPLATE_BUTTON,
      onClick: () => {
        dispatch({ type: "SET_CONSIGNE", value: `<p>${templateText}</p>` });
      },
    };
  }, [config, isMomentsMode, modeStructure, dispatch]);

  if (!blueprintOk) {
    return <p className="text-sm leading-relaxed text-muted">{BLOC3_GATE_BLUEPRINT}</p>;
  }

  return (
    <div className="space-y-5">
      {isMomentsMode ? (
        <RadioCardGroup
          name="modeStructureModeleSouple"
          label={PERSP_BLOC3_STRUCTURE_LABEL}
          required
          options={[
            { value: "groupe", label: BLOC4_MOMENTS_STRUCTURE_GROUPE },
            { value: "separe", label: BLOC4_MOMENTS_STRUCTURE_SEPARE },
          ]}
          value={modeStructure}
          onChange={(v) =>
            dispatch({
              type: "SET_PERSPECTIVES_MODE_WITH_MIGRATION",
              value: v as "groupe" | "separe",
              count: 2,
            })
          }
        />
      ) : null}

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
