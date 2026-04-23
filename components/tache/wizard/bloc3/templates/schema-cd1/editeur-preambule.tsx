"use client";

import { useCallback, useState } from "react";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { SimpleModal } from "@/components/ui/SimpleModal";
import { LabelWithInfo } from "@/components/tache/wizard/bloc2/LabelWithInfo";
import { useTacheForm } from "@/components/tache/wizard/FormState";
import {
  SECTION_B_PREAMBULE_LABEL,
  SECTION_B_PREAMBULE_PLACEHOLDER,
  SECTION_B_PREAMBULE_TOOLTIP,
} from "@/lib/ui/ui-copy";

export function EditeurPreambule() {
  const { state, dispatch } = useTacheForm();
  const [helpOpen, setHelpOpen] = useState(false);

  const value = state.bloc3.schemaCd1?.preambule ?? "";

  const onChange = useCallback(
    (html: string) => dispatch({ type: "SET_SCHEMA_PREAMBULE", value: html }),
    [dispatch],
  );

  return (
    <section className="space-y-2">
      <LabelWithInfo labelText={SECTION_B_PREAMBULE_LABEL} onInfoClick={() => setHelpOpen(true)} />
      <p className="text-xs italic text-muted">{SECTION_B_PREAMBULE_PLACEHOLDER}</p>
      <RichTextEditor
        id="preambule-schema-cd1"
        instanceId="preambule-schema-cd1"
        className="mt-2"
        value={value}
        onChange={onChange}
        autosaveKey="eduqcia-tache-preambule-cd1-new"
        minHeight={100}
      />
      <SimpleModal
        open={helpOpen}
        title={SECTION_B_PREAMBULE_LABEL}
        onClose={() => setHelpOpen(false)}
        titleStyle="info-help"
      >
        <p className="text-sm leading-relaxed text-deep">{SECTION_B_PREAMBULE_TOOLTIP}</p>
      </SimpleModal>
    </section>
  );
}
