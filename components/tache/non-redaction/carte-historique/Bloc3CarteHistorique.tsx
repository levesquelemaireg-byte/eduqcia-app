"use client";

import { useCallback, useId, useMemo, useState } from "react";
import {
  CarteHistoriqueConsigneMinisterialBadge,
  CarteHistoriqueConsigneTemplate,
} from "@/components/tache/non-redaction/consigne-template/CarteHistoriqueConsigneTemplate";
import { useCarteHistoriquePayloadBootstrap } from "@/components/tache/non-redaction/carte-historique/useCarteHistoriquePayloadBootstrap";
import { FieldHelpModalButton } from "@/components/ui/FieldHelpModalButton";
import { RequiredMark } from "@/components/ui/RequiredMark";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { SimpleModal } from "@/components/ui/SimpleModal";
import { BLOC3_SECTION_ICON } from "@/components/tache/wizard/bloc3-stepper-icons";
import { BLOC3_MODAL_GUIDAGE_TITLE } from "@/components/tache/wizard/bloc3/modalCopy";
import { useTacheForm } from "@/components/tache/wizard/FormState";
import { isBlueprintFieldsComplete } from "@/lib/tache/blueprint-helpers";
import {
  initialCarteHistoriquePayload,
  isCarteHistoriqueComportementId,
  normalizeCarteHistoriquePayload,
  type CarteHistoriquePayload,
} from "@/lib/tache/non-redaction/carte-historique-payload";
import { materialIconTooltip } from "@/lib/tache/icon-justifications";
import { nonRedactionCartePayload } from "@/lib/tache/wizard-state-nr";
import {
  BLOC3_GUIDAGE_FORMATIF_SOMMATIF_HINT,
  NR_CARTE_CONSIGNE_HELP_21,
  NR_CARTE_CONSIGNE_HELP_22,
  NR_CARTE_CONSIGNE_HELP_23,
  NR_CARTE_CONSIGNE_INFO_MODAL_BODY,
  NR_CARTE_CONSIGNE_LABEL,
  NR_CARTE_GATE_BLOC3,
  NR_CARTE_GUIDAGE_INFO_MODAL_BODY,
} from "@/lib/ui/ui-copy";

function helpForComportement(comportementId: string): string {
  if (comportementId === "2.2") return NR_CARTE_CONSIGNE_HELP_22;
  if (comportementId === "2.3") return NR_CARTE_CONSIGNE_HELP_23;
  return NR_CARTE_CONSIGNE_HELP_21;
}

export function Bloc3CarteHistorique() {
  const { state, dispatch } = useTacheForm();
  const b = state.bloc2;
  const consigneId = useId();
  const element2Id = useId();
  const consigneHelpDescId = useId();
  const [consigneHelpOpen, setConsigneHelpOpen] = useState(false);
  const [guidageHelpOpen, setGuidageHelpOpen] = useState(false);

  useCarteHistoriquePayloadBootstrap();

  const blueprintOk = isBlueprintFieldsComplete(b) && b.blueprintLocked;

  const p: CarteHistoriquePayload = useMemo(() => {
    const cid = isCarteHistoriqueComportementId(b.comportementId) ? b.comportementId : "2.1";
    return (
      normalizeCarteHistoriquePayload(nonRedactionCartePayload(state)) ??
      initialCarteHistoriquePayload(cid)
    );
  }, [state, b.comportementId]);

  const onElement1Change = useCallback(
    (next: string) => {
      dispatch({
        type: "NON_REDACTION_PATCH_CARTE_HISTORIQUE",
        patch: { consigneElement1: next },
      });
    },
    [dispatch],
  );

  const onElement2Change = useCallback(
    (next: string) => {
      dispatch({
        type: "NON_REDACTION_PATCH_CARTE_HISTORIQUE",
        patch: { consigneElement2: next },
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
    return <p className="text-sm leading-relaxed text-muted">{NR_CARTE_GATE_BLOC3}</p>;
  }

  return (
    <div className="space-y-6">
      <SimpleModal
        open={consigneHelpOpen}
        title={NR_CARTE_CONSIGNE_LABEL}
        onClose={() => setConsigneHelpOpen(false)}
        titleStyle="info-help"
      >
        <p className="text-sm leading-relaxed text-deep">{NR_CARTE_CONSIGNE_INFO_MODAL_BODY}</p>
      </SimpleModal>
      <SimpleModal
        open={guidageHelpOpen}
        title={BLOC3_MODAL_GUIDAGE_TITLE}
        onClose={() => setGuidageHelpOpen(false)}
        titleStyle="info-help"
      >
        <p className="text-sm leading-relaxed text-deep">{NR_CARTE_GUIDAGE_INFO_MODAL_BODY}</p>
      </SimpleModal>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <label
            htmlFor={consigneId}
            className="flex flex-wrap items-center gap-2 text-sm font-semibold text-deep"
          >
            <span
              className="material-symbols-outlined text-[1em] text-accent"
              aria-hidden="true"
              title={materialIconTooltip(BLOC3_SECTION_ICON.consigne) ?? undefined}
            >
              {BLOC3_SECTION_ICON.consigne}
            </span>
            <span>
              {NR_CARTE_CONSIGNE_LABEL} <RequiredMark />
            </span>
            <CarteHistoriqueConsigneMinisterialBadge />
            <FieldHelpModalButton onClick={() => setConsigneHelpOpen(true)} />
          </label>
        </div>
        <p id={consigneHelpDescId} className="text-sm leading-relaxed text-muted">
          {helpForComportement(p.comportementId)}
        </p>
        <CarteHistoriqueConsigneTemplate
          comportementId={p.comportementId}
          element1={p.consigneElement1}
          element2={p.consigneElement2}
          onElement1Change={onElement1Change}
          onElement2Change={onElement2Change}
          describedByIds={consigneHelpDescId}
          element1InputId={consigneId}
          element2InputId={element2Id}
        />
      </div>

      <section className="space-y-2 border-t border-border pt-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-deep">
            <span
              className="material-symbols-outlined text-[1em] text-accent"
              aria-hidden="true"
              title={materialIconTooltip(BLOC3_SECTION_ICON.guidage) ?? undefined}
            >
              {BLOC3_SECTION_ICON.guidage}
            </span>
            <span>Guidage complémentaire</span>
            <FieldHelpModalButton onClick={() => setGuidageHelpOpen(true)} />
          </div>
        </div>
        <p className="text-xs text-muted">
          Ajoutez, au besoin, des indications supplémentaires pour soutenir l&apos;élève dans la
          compréhension de la tâche.
        </p>
        <RichTextEditor
          id="guidage-carte-historique"
          instanceId="guidage-carte-historique"
          className="mt-2"
          value={state.bloc3.guidage}
          onChange={onGuidageChange}
          autosaveKey="eduqcia-tache-guidage-new"
          minHeight={88}
        />
        <p className="text-xs italic text-muted">{BLOC3_GUIDAGE_FORMATIF_SOMMATIF_HINT}</p>
      </section>
    </div>
  );
}
