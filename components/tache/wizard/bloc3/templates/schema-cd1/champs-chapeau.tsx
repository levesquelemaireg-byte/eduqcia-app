"use client";

import { useState } from "react";
import { SimpleModal } from "@/components/ui/SimpleModal";
import { LabelWithInfo } from "@/components/tache/wizard/bloc2/LabelWithInfo";
import { useTacheForm } from "@/components/tache/wizard/FormState";
import { RequiredMark } from "@/components/ui/RequiredMark";
import {
  SECTION_B_CHAPEAU_OBJET_LABEL,
  SECTION_B_CHAPEAU_OBJET_PLACEHOLDER,
  SECTION_B_CHAPEAU_PERIODE_LABEL,
  SECTION_B_CHAPEAU_PERIODE_PLACEHOLDER,
  SECTION_B_CONSIGNE_LABEL,
  SECTION_B_CONSIGNE_TOOLTIP,
} from "@/lib/ui/ui-copy";

export function ChampsChapeau() {
  const { state, dispatch } = useTacheForm();
  const [helpOpen, setHelpOpen] = useState(false);

  const objet = state.bloc3.schemaCd1?.chapeauObjet ?? "";
  const periode = state.bloc3.schemaCd1?.chapeauPeriode ?? "";

  return (
    <section className="space-y-3">
      <LabelWithInfo labelText={SECTION_B_CONSIGNE_LABEL} onInfoClick={() => setHelpOpen(true)} />

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="chapeau-objet" className="text-sm font-medium text-deep">
            {SECTION_B_CHAPEAU_OBJET_LABEL} <RequiredMark />
          </label>
          <input
            id="chapeau-objet"
            type="text"
            value={objet}
            onChange={(e) => dispatch({ type: "SET_SCHEMA_CHAPEAU_OBJET", value: e.target.value })}
            placeholder={SECTION_B_CHAPEAU_OBJET_PLACEHOLDER}
            autoComplete="off"
            className="auth-input h-11 w-full rounded-lg border border-border bg-panel px-3 text-sm text-deep placeholder:text-muted"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="chapeau-periode" className="text-sm font-medium text-deep">
            {SECTION_B_CHAPEAU_PERIODE_LABEL} <RequiredMark />
          </label>
          <input
            id="chapeau-periode"
            type="text"
            value={periode}
            onChange={(e) =>
              dispatch({ type: "SET_SCHEMA_CHAPEAU_PERIODE", value: e.target.value })
            }
            placeholder={SECTION_B_CHAPEAU_PERIODE_PLACEHOLDER}
            autoComplete="off"
            className="auth-input h-11 w-full rounded-lg border border-border bg-panel px-3 text-sm text-deep placeholder:text-muted"
          />
        </div>
      </div>

      <SimpleModal
        open={helpOpen}
        title={SECTION_B_CONSIGNE_LABEL}
        onClose={() => setHelpOpen(false)}
        titleStyle="info-help"
      >
        <p className="text-sm leading-relaxed text-deep">{SECTION_B_CONSIGNE_TOOLTIP}</p>
      </SimpleModal>
    </section>
  );
}
