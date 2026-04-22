"use client";

import { useId, useLayoutEffect, useMemo, useState } from "react";
import { sanitize } from "@/lib/fiche/helpers";
import { FieldHelpModalButton } from "@/components/ui/FieldHelpModalButton";
import { RequiredMark } from "@/components/ui/RequiredMark";
import { SimpleModal } from "@/components/ui/SimpleModal";
import { BLOC3_SECTION_ICON } from "@/components/tache/wizard/bloc3-stepper-icons";
import {
  OrdreChronologiqueConsigneMinisterialBadge,
  OrdreChronologiqueConsigneTemplate,
} from "@/components/tache/non-redaction/consigne-template/OrdreChronologiqueConsigneTemplate";
import { useOrdreChronologiquePayloadBootstrap } from "@/components/tache/non-redaction/ordre-chronologique/useOrdreChronologiquePayloadBootstrap";
import { getRedactionSliceForPreview, useTacheForm } from "@/components/tache/wizard/FormState";
import { isBlueprintFieldsComplete } from "@/lib/tache/blueprint-helpers";
import {
  buildOrdreChronologiqueGuidageHtml,
  initialOrdreChronologiquePayload,
  normalizeOrdreChronologiquePayload,
} from "@/lib/tache/non-redaction/ordre-chronologique-payload";
import { getVariantSlugForComportementId } from "@/lib/tache/non-redaction/registry";
import { materialIconTooltip } from "@/lib/tache/icon-justifications";
import {
  NR_ORDRE_CONSIGNE_HELP,
  NR_ORDRE_CONSIGNE_LABEL,
  NR_ORDRE_GATE_BLOC3,
  NR_ORDRE_GUIDAGE_FORM_LEAD,
  NR_ORDRE_GUIDAGE_INFO_MODAL_BODY,
} from "@/lib/ui/ui-copy";
import { BLOC3_MODAL_GUIDAGE_TITLE } from "@/components/tache/wizard/bloc3/modalCopy";
import { nonRedactionOrdrePayload } from "@/lib/tache/wizard-state-nr";

export function Bloc3OrdreChronologique() {
  const { state, dispatch } = useTacheForm();
  const b = state.bloc2;
  const r = getRedactionSliceForPreview(state);
  const consigneId = useId();
  const consigneHelpDescId = useId();
  const [consigneHelpOpen, setConsigneHelpOpen] = useState(false);
  const [modalGuidageOrdre, setModalGuidageOrdre] = useState(false);

  const blueprintOk = isBlueprintFieldsComplete(b) && b.blueprintLocked;
  const docCount = b.documentSlots.length;

  useOrdreChronologiquePayloadBootstrap();

  const fixedGuidageHtml = useMemo(() => buildOrdreChronologiqueGuidageHtml(), []);

  useLayoutEffect(() => {
    if (
      !blueprintOk ||
      getVariantSlugForComportementId(state.bloc2.comportementId) !== "ordre-chronologique"
    ) {
      return;
    }
    if (r.guidage !== fixedGuidageHtml) {
      dispatch({ type: "SET_GUIDAGE", value: fixedGuidageHtml });
    }
  }, [blueprintOk, dispatch, fixedGuidageHtml, r.guidage, state.bloc2.comportementId]);

  const p = useMemo(() => {
    return (
      normalizeOrdreChronologiquePayload(nonRedactionOrdrePayload(state)) ??
      initialOrdreChronologiquePayload()
    );
  }, [state]);

  if (!blueprintOk) {
    return <p className="text-sm leading-relaxed text-muted">{NR_ORDRE_GATE_BLOC3}</p>;
  }

  return (
    <div className="space-y-6">
      <SimpleModal
        open={modalGuidageOrdre}
        title={BLOC3_MODAL_GUIDAGE_TITLE}
        onClose={() => setModalGuidageOrdre(false)}
        titleStyle="info-help"
      >
        <p className="text-sm leading-relaxed text-deep">{NR_ORDRE_GUIDAGE_INFO_MODAL_BODY}</p>
      </SimpleModal>

      <div className="space-y-3">
        <SimpleModal
          open={consigneHelpOpen}
          title={NR_ORDRE_CONSIGNE_LABEL}
          onClose={() => setConsigneHelpOpen(false)}
          titleStyle="info-help"
        >
          <p className="text-sm leading-relaxed text-deep">{NR_ORDRE_CONSIGNE_HELP}</p>
        </SimpleModal>
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
              {NR_ORDRE_CONSIGNE_LABEL} <RequiredMark />
            </span>
            <OrdreChronologiqueConsigneMinisterialBadge />
            <FieldHelpModalButton onClick={() => setConsigneHelpOpen(true)} />
          </label>
        </div>
        <p id={consigneHelpDescId} className="text-sm leading-relaxed text-muted">
          {NR_ORDRE_CONSIGNE_HELP}
        </p>
        <OrdreChronologiqueConsigneTemplate
          docCount={docCount}
          value={p.consigneTheme}
          onChange={(next) =>
            dispatch({
              type: "NON_REDACTION_PATCH_ORDRE_CHRONO",
              patch: { consigneTheme: next },
            })
          }
          describedByIds={consigneHelpDescId}
          themeInputId={consigneId}
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
            <FieldHelpModalButton onClick={() => setModalGuidageOrdre(true)} />
          </div>
        </div>
        <p className="text-sm leading-relaxed text-muted">{NR_ORDRE_GUIDAGE_FORM_LEAD}</p>
        <div
          className="rounded-lg border border-border bg-panel px-3 py-3 text-sm leading-relaxed text-steel [&_strong]:font-bold [&_em]:italic [&_u]:underline [&_ul]:list-disc [&_ul]:pl-4"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: sanitize(fixedGuidageHtml) }}
        />
      </section>
    </div>
  );
}
