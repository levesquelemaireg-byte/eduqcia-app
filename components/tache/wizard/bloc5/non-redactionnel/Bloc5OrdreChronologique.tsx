"use client";

import { useCallback, useMemo, useState } from "react";
import type { DocumentSlotId } from "@/lib/tache/blueprint-helpers";
import { FieldHelpModalButton } from "@/components/ui/FieldHelpModalButton";
import { RequiredMark } from "@/components/ui/RequiredMark";
import { SimpleModal } from "@/components/ui/SimpleModal";
import { SequenceOptionsGenerator } from "@/components/tache/non-redaction/ordre-chronologique/SequenceOptionsGenerator";
import { useOrdreChronologiquePayloadBootstrap } from "@/components/tache/non-redaction/ordre-chronologique/useOrdreChronologiquePayloadBootstrap";
import { isBlueprintFieldsComplete } from "@/lib/tache/blueprint-helpers";
import {
  clearedOrdreOptionsPatch,
  initialOrdreChronologiquePayload,
  isOrdreChronologiqueDocumentsStepComplete,
  isOrdreChronologiqueStep3ConsigneComplete,
  normalizeOrdreChronologiquePayload,
  type OrdreChronologiquePayload,
} from "@/lib/tache/non-redaction/ordre-chronologique-payload";
import type { Bloc5Props } from "@/lib/tache/tae-form-state-types";
import {
  NR_ORDRE_GATE_BLOC5_OPTIONS,
  NR_ORDRE_GATE_BLOC5_PRE_CONSIGNE,
  NR_ORDRE_GATE_PRE_DOCS,
  NR_ORDRE_OPTIONS_HELP,
  NR_ORDRE_OPTIONS_LABEL,
} from "@/lib/ui/ui-copy";
import { nonRedactionOrdrePayload } from "@/lib/tache/wizard-state-nr";

export default function Bloc5OrdreChronologique({ state, dispatch }: Bloc5Props) {
  const [optionsHelpOpen, setOptionsHelpOpen] = useState(false);

  useOrdreChronologiquePayloadBootstrap();

  const b = state.bloc2;
  const blueprintGate = isBlueprintFieldsComplete(b) && b.blueprintLocked;

  const p = useMemo(() => {
    return (
      normalizeOrdreChronologiquePayload(nonRedactionOrdrePayload(state)) ??
      initialOrdreChronologiquePayload()
    );
  }, [state]);

  const docsOk = isOrdreChronologiqueDocumentsStepComplete(b.documentSlots, state.bloc4.documents);
  const consigneStep3Ok = isOrdreChronologiqueStep3ConsigneComplete(p);

  const orderedSlotIds = useMemo(
    () => b.documentSlots.map((s) => s.slotId) as DocumentSlotId[],
    [b.documentSlots],
  );

  const sequenceGeneratorValue = useMemo(
    () => ({
      optionA: p.optionA,
      optionB: p.optionB,
      optionC: p.optionC,
      optionD: p.optionD,
      correctLetter: p.correctLetter,
      optionsJustification: p.optionsJustification,
      manualTieBreakSequence: p.manualTieBreakSequence,
    }),
    [
      p.optionA,
      p.optionB,
      p.optionC,
      p.optionD,
      p.correctLetter,
      p.optionsJustification,
      p.manualTieBreakSequence,
    ],
  );

  const handleGeneratorChange = useCallback(
    (
      patch: Pick<
        OrdreChronologiquePayload,
        | "optionA"
        | "optionB"
        | "optionC"
        | "optionD"
        | "correctLetter"
        | "optionsJustification"
        | "manualTieBreakSequence"
      > | null,
    ) => {
      if (patch === null) {
        dispatch({
          type: "NON_REDACTION_PATCH_ORDRE_CHRONO",
          patch: clearedOrdreOptionsPatch(),
        });
        return;
      }
      dispatch({ type: "NON_REDACTION_PATCH_ORDRE_CHRONO", patch });
    },
    [dispatch],
  );

  if (!blueprintGate) {
    return <p className="text-sm leading-relaxed text-muted">{NR_ORDRE_GATE_PRE_DOCS}</p>;
  }

  if (!consigneStep3Ok) {
    return <p className="text-sm leading-relaxed text-muted">{NR_ORDRE_GATE_BLOC5_PRE_CONSIGNE}</p>;
  }

  if (!docsOk) {
    return <p className="text-sm leading-relaxed text-muted">{NR_ORDRE_GATE_BLOC5_OPTIONS}</p>;
  }

  return (
    <div className="space-y-6">
      <fieldset className="space-y-3">
        <SimpleModal
          open={optionsHelpOpen}
          title={NR_ORDRE_OPTIONS_LABEL}
          onClose={() => setOptionsHelpOpen(false)}
          titleStyle="info-help"
        >
          <p className="text-sm leading-relaxed text-deep">{NR_ORDRE_OPTIONS_HELP}</p>
        </SimpleModal>
        <legend className="flex w-full flex-wrap items-center gap-1.5 text-sm font-semibold text-deep">
          <span>
            {NR_ORDRE_OPTIONS_LABEL} <RequiredMark />
          </span>
          <FieldHelpModalButton onClick={() => setOptionsHelpOpen(true)} />
        </legend>
        <p className="text-xs text-muted">{NR_ORDRE_OPTIONS_HELP}</p>

        <SequenceOptionsGenerator
          value={sequenceGeneratorValue}
          onChange={handleGeneratorChange}
          orderedSlotIds={orderedSlotIds}
          documents={state.bloc4.documents}
        />
      </fieldset>
    </div>
  );
}
