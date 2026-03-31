"use client";

/**
 * Étape 3 — Consigne et production attendue — docs/WORKFLOWS.md + CONSIGNE-EDITOR.md (TipTap).
 */
import { useCallback, useState } from "react";
import { Bloc3InfoModals } from "@/components/tae/TaeForm/bloc3/Bloc3InfoModals";
import { IntroPhraseBanner } from "@/components/tae/TaeForm/bloc3/IntroPhraseBanner";
import { SectionAspects } from "@/components/tae/TaeForm/bloc3/SectionAspects";
import { SectionConsigne } from "@/components/tae/TaeForm/bloc3/SectionConsigne";
import { SectionCorrige } from "@/components/tae/TaeForm/bloc3/SectionCorrige";
import { SectionGuidage } from "@/components/tae/TaeForm/bloc3/SectionGuidage";
import { getRedactionSliceForPreview, useTaeForm } from "@/components/tae/TaeForm/FormState";
import { isBlueprintFieldsComplete } from "@/lib/tae/blueprint-helpers";
import type { AspectSocieteKey } from "@/lib/tae/redaction-helpers";

export function Bloc3ConsigneProduction() {
  const { state, dispatch } = useTaeForm();
  const b = state.bloc2;
  const r = getRedactionSliceForPreview(state);

  const [modalConsigne, setModalConsigne] = useState(false);
  const [modalAspects, setModalAspects] = useState(false);
  const [modalCorrige, setModalCorrige] = useState(false);
  const [modalGuidage, setModalGuidage] = useState(false);

  const blueprintOk = isBlueprintFieldsComplete(b) && b.blueprintLocked;

  const setConsigne = useCallback(
    (html: string) => dispatch({ type: "SET_CONSIGNE", value: html }),
    [dispatch],
  );
  const setCorrige = useCallback(
    (html: string) => dispatch({ type: "SET_CORRIGE", value: html }),
    [dispatch],
  );
  const setGuidage = useCallback(
    (html: string) => dispatch({ type: "SET_GUIDAGE", value: html }),
    [dispatch],
  );

  const toggleAspect = useCallback(
    (aspect: AspectSocieteKey) => {
      dispatch({
        type: "SET_ASPECT",
        aspect,
        value: !r.aspects[aspect],
      });
    },
    [dispatch, r.aspects],
  );

  if (!blueprintOk) {
    return (
      <p className="text-sm leading-relaxed text-muted">
        Complétez d&apos;abord l&apos;étape « Paramètres de la tâche » (étape 2) et passez à
        l&apos;étape suivante pour définir la consigne et la production attendue.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <IntroPhraseBanner nbDocuments={b.nbDocuments} />

      <SectionConsigne
        blueprint={b}
        consigneHtml={r.consigne}
        onConsigneChange={setConsigne}
        onInfoClick={() => setModalConsigne(true)}
      />

      <SectionAspects
        aspects={r.aspects}
        onToggle={toggleAspect}
        onInfoClick={() => setModalAspects(true)}
      />

      <SectionCorrige
        value={r.corrige}
        onChange={setCorrige}
        onInfoClick={() => setModalCorrige(true)}
      />

      <SectionGuidage
        value={r.guidage}
        onChange={setGuidage}
        onInfoClick={() => setModalGuidage(true)}
      />

      <Bloc3InfoModals
        openConsigne={modalConsigne}
        openAspects={modalAspects}
        openCorrige={modalCorrige}
        openGuidage={modalGuidage}
        onCloseConsigne={() => setModalConsigne(false)}
        onCloseAspects={() => setModalAspects(false)}
        onCloseCorrige={() => setModalCorrige(false)}
        onCloseGuidage={() => setModalGuidage(false)}
      />
    </div>
  );
}
