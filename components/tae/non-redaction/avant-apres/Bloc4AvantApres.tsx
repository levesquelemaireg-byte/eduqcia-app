"use client";

import { useMemo } from "react";
import { useTaeForm } from "@/components/tae/TaeForm/FormState";
import { isBlueprintFieldsComplete } from "@/lib/tae/blueprint-helpers";
import {
  initialAvantApresPayload,
  isAvantApresRedactionStepCompleteForNext,
  normalizeAvantApresPayload,
} from "@/lib/tae/non-redaction/avant-apres-payload";
import {
  NR_AVANT_APRES_BLOC4_GATE_BLOC3,
  NR_AVANT_APRES_BLOC4_INFO,
  NR_AVANT_APRES_GATE_PRE_DOCS,
} from "@/lib/ui/ui-copy";
import { nonRedactionAvantApresPayload } from "@/lib/tae/wizard-state-nr";

export function Bloc4AvantApres() {
  const { state } = useTaeForm();
  const b = state.bloc2;
  const blueprintOk = isBlueprintFieldsComplete(b) && b.blueprintLocked;

  const p = useMemo(() => {
    return (
      normalizeAvantApresPayload(nonRedactionAvantApresPayload(state)) ?? initialAvantApresPayload()
    );
  }, [state]);

  const bloc3Ok = isAvantApresRedactionStepCompleteForNext(p);

  if (!blueprintOk) {
    return <p className="text-sm leading-relaxed text-muted">{NR_AVANT_APRES_GATE_PRE_DOCS}</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-muted">{NR_AVANT_APRES_BLOC4_INFO}</p>
      {!bloc3Ok ? <p className="text-sm text-muted">{NR_AVANT_APRES_BLOC4_GATE_BLOC3}</p> : null}
    </div>
  );
}
