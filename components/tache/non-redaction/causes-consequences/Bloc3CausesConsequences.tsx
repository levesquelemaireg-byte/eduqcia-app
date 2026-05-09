"use client";

import { useCallback, useId, useMemo, useState } from "react";
import { CausesConsequencesConsigneTemplate } from "@/components/tache/non-redaction/consigne-template/CausesConsequencesConsigneTemplate";
import { useCausesConsequencesPayloadBootstrap } from "@/components/tache/non-redaction/causes-consequences/useCausesConsequencesPayloadBootstrap";
import { FieldHelpModalButton } from "@/components/ui/FieldHelpModalButton";
import { RequiredMark } from "@/components/ui/RequiredMark";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { SimpleModal } from "@/components/ui/SimpleModal";
import { BLOC3_MODAL_GUIDAGE_TITLE } from "@/components/tache/wizard/bloc3/modalCopy";
import { useTacheForm } from "@/components/tache/wizard/FormState";
import { isBlueprintFieldsComplete } from "@/lib/tache/blueprint-helpers";
import {
  initialCausesConsequencesPayload,
  isCausesConsequencesComportementId,
  normalizeCausesConsequencesPayload,
  type CausesConsequencesPayload,
} from "@/lib/tache/non-redaction/causes-consequences-payload";
import { nonRedactionCausesConsequencesPayload } from "@/lib/tache/wizard-state-nr";
import {
  BLOC3_GUIDAGE_FORMATIF_SOMMATIF_HINT,
  NR_CAUSES_CONSEQUENCES_CONSIGNE_HELP_43,
  NR_CAUSES_CONSEQUENCES_CONSIGNE_HELP_44,
  NR_CAUSES_CONSEQUENCES_CONSIGNE_INFO_MODAL_BODY,
  NR_CAUSES_CONSEQUENCES_CONSIGNE_LABEL,
  NR_CAUSES_CONSEQUENCES_GATE_BLOC3,
  NR_CAUSES_CONSEQUENCES_GUIDAGE_INFO_MODAL_BODY,
  NR_CAUSES_CONSEQUENCES_SUJET_LABEL,
} from "@/lib/ui/ui-copy";

export function Bloc3CausesConsequences() {
  const { state, dispatch } = useTacheForm();
  const b = state.bloc2;
  const consigneId = useId();
  const consigneHelpDescId = useId();
  const [consigneHelpOpen, setConsigneHelpOpen] = useState(false);
  const [guidageHelpOpen, setGuidageHelpOpen] = useState(false);

  useCausesConsequencesPayloadBootstrap();

  const blueprintOk = isBlueprintFieldsComplete(b) && b.blueprintLocked;

  const p: CausesConsequencesPayload = useMemo(() => {
    const cid = isCausesConsequencesComportementId(b.comportementId) ? b.comportementId : "4.3";
    return (
      normalizeCausesConsequencesPayload(nonRedactionCausesConsequencesPayload(state)) ??
      initialCausesConsequencesPayload(cid)
    );
  }, [state, b.comportementId]);

  const onConsigneSujetChange = useCallback(
    (next: string) => {
      dispatch({
        type: "NON_REDACTION_PATCH_CAUSES_CONSEQUENCES",
        patch: { consigneSujet: next },
      });
    },
    [dispatch],
  );

  const onGuidageChange = useCallback(
    (html: string) => {
      dispatch({ type: "SET_GUIDAGE", value: html });
    },
    [dispatch],
  );

  if (!blueprintOk) {
    return (
      <p className="text-sm leading-relaxed text-muted">{NR_CAUSES_CONSEQUENCES_GATE_BLOC3}</p>
    );
  }

  const consigneHelp =
    p.comportementId === "4.3"
      ? NR_CAUSES_CONSEQUENCES_CONSIGNE_HELP_43
      : NR_CAUSES_CONSEQUENCES_CONSIGNE_HELP_44;

  return (
    <div className="space-y-6">
      <SimpleModal
        open={consigneHelpOpen}
        title={NR_CAUSES_CONSEQUENCES_CONSIGNE_LABEL}
        onClose={() => setConsigneHelpOpen(false)}
        titleStyle="info-help"
      >
        <p className="text-sm leading-relaxed text-deep">
          {NR_CAUSES_CONSEQUENCES_CONSIGNE_INFO_MODAL_BODY}
        </p>
      </SimpleModal>

      <SimpleModal
        open={guidageHelpOpen}
        title={BLOC3_MODAL_GUIDAGE_TITLE}
        onClose={() => setGuidageHelpOpen(false)}
        titleStyle="info-help"
      >
        <p className="text-sm leading-relaxed text-deep">
          {NR_CAUSES_CONSEQUENCES_GUIDAGE_INFO_MODAL_BODY}
        </p>
      </SimpleModal>

      {/* Section consigne ministérielle */}
      <section aria-labelledby={consigneId} className="space-y-3">
        <div className="flex items-center gap-2">
          <h3 id={consigneId} className="text-sm font-semibold text-deep">
            {NR_CAUSES_CONSEQUENCES_SUJET_LABEL} <RequiredMark />
          </h3>
          <FieldHelpModalButton onClick={() => setConsigneHelpOpen(true)} />
        </div>
        <p id={consigneHelpDescId} className="text-sm leading-relaxed text-muted">
          {consigneHelp}
        </p>
        <CausesConsequencesConsigneTemplate
          comportementId={p.comportementId}
          consigneSujet={p.consigneSujet}
          onConsigneSujetChange={onConsigneSujetChange}
          describedByIds={consigneHelpDescId}
          inputId={`${consigneId}-input`}
        />
      </section>

      {/* Section guidage */}
      <section className="space-y-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-deep">Guidage complémentaire</h3>
          <FieldHelpModalButton onClick={() => setGuidageHelpOpen(true)} />
        </div>
        <p className="text-xs leading-relaxed text-muted">{BLOC3_GUIDAGE_FORMATIF_SOMMATIF_HINT}</p>
        <RichTextEditor
          instanceId="causes-consequences-guidage"
          value={state.bloc3.guidage}
          onChange={onGuidageChange}
          minHeight={100}
          toolbarAriaLabel="Mise en forme — guidage complémentaire"
        />
      </section>
    </div>
  );
}
