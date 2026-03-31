"use client";

import { useCallback, useId, useLayoutEffect, useMemo, useState } from "react";
import { FieldHelpModalButton } from "@/components/ui/FieldHelpModalButton";
import { RequiredMark } from "@/components/ui/RequiredMark";
import { SimpleModal } from "@/components/ui/SimpleModal";
import { SectionAspects } from "@/components/tae/TaeForm/bloc3/SectionAspects";
import {
  BLOC3_MODAL_ASPECTS_BODY,
  BLOC3_MODAL_ASPECTS_TITLE,
} from "@/components/tae/TaeForm/bloc3/modalCopy";
import { BLOC3_SECTION_ICON } from "@/components/tae/TaeForm/bloc3-stepper-icons";
import {
  OrdreChronologiqueConsigneMinisterialBadge,
  OrdreChronologiqueConsigneTemplate,
} from "@/components/tae/non-redaction/consigne-template/OrdreChronologiqueConsigneTemplate";
import { SequenceOptionsGenerator } from "@/components/tae/non-redaction/ordre-chronologique/SequenceOptionsGenerator";
import { getRedactionSliceForPreview, useTaeForm } from "@/components/tae/TaeForm/FormState";
import { isBlueprintFieldsComplete } from "@/lib/tae/blueprint-helpers";
import {
  buildOrdreChronologiqueGuidageHtml,
  clearedOrdreOptionsPatch,
  hasCompleteOrdreOptionsOnly,
  initialOrdreChronologiquePayload,
  normalizeOrdreChronologiquePayload,
  type OrdreChronologiquePayload,
} from "@/lib/tae/non-redaction/ordre-chronologique-payload";
import { getVariantSlugForComportementId } from "@/lib/tae/non-redaction/registry";
import type { AspectSocieteKey } from "@/lib/tae/redaction-helpers";
import { materialIconTooltip } from "@/lib/tae/icon-justifications";
import {
  NR_ORDRE_CONSIGNE_HELP,
  NR_ORDRE_CONSIGNE_LABEL,
  NR_ORDRE_GATE_BLOC3,
  NR_ORDRE_GUIDAGE_FORM_LEAD,
  NR_ORDRE_GUIDAGE_INFO_MODAL_BODY,
  NR_ORDRE_OPTIONS_HELP,
  NR_ORDRE_OPTIONS_LABEL,
  NR_ORDRE_THEME_REQUIRED,
} from "@/lib/ui/ui-copy";
import { BLOC3_MODAL_GUIDAGE_TITLE } from "@/components/tae/TaeForm/bloc3/modalCopy";
import { nonRedactionOrdrePayload } from "@/lib/tae/wizard-state-nr";

export function Bloc3OrdreChronologique() {
  const { state, dispatch } = useTaeForm();
  const b = state.bloc2;
  const r = getRedactionSliceForPreview(state);
  const consigneId = useId();
  const consigneHelpDescId = useId();
  const [consigneHelpOpen, setConsigneHelpOpen] = useState(false);
  const [optionsHelpOpen, setOptionsHelpOpen] = useState(false);
  const [modalAspects, setModalAspects] = useState(false);
  const [modalGuidageOrdre, setModalGuidageOrdre] = useState(false);

  const blueprintOk = isBlueprintFieldsComplete(b) && b.blueprintLocked;
  const docCount = b.documentSlots.length;

  useLayoutEffect(() => {
    const n = normalizeOrdreChronologiquePayload(nonRedactionOrdrePayload(state));
    if (!n) {
      dispatch({
        type: "NON_REDACTION_PATCH_ORDRE_CHRONO",
        patch: initialOrdreChronologiquePayload(),
      });
      return;
    }
    const raw = nonRedactionOrdrePayload(state);
    if (raw && typeof raw === "object") {
      const ro = raw as Record<string, unknown>;
      const legacy =
        typeof ro.optionA === "string" ||
        typeof ro.optionB === "string" ||
        typeof ro.optionC === "string" ||
        typeof ro.optionD === "string";
      if (legacy) {
        dispatch({ type: "NON_REDACTION_PATCH_ORDRE_CHRONO", patch: n });
      }
    }
  }, [dispatch, state.bloc5.nonRedaction]);

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

  const sequenceGeneratorValue = useMemo(
    () => ({
      optionA: p.optionA,
      optionB: p.optionB,
      optionC: p.optionC,
      optionD: p.optionD,
      correctLetter: p.correctLetter,
    }),
    [p.optionA, p.optionB, p.optionC, p.optionD, p.correctLetter],
  );

  const handleGeneratorChange = useCallback(
    (
      patch: Pick<
        OrdreChronologiquePayload,
        "optionA" | "optionB" | "optionC" | "optionD" | "correctLetter"
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

  const themeError =
    !p.consigneTheme.trim() && hasCompleteOrdreOptionsOnly(p) ? NR_ORDRE_THEME_REQUIRED : undefined;

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

      <SimpleModal
        open={modalAspects}
        title={BLOC3_MODAL_ASPECTS_TITLE}
        onClose={() => setModalAspects(false)}
        titleStyle="info-help"
      >
        <p className="text-sm leading-relaxed text-deep">{BLOC3_MODAL_ASPECTS_BODY}</p>
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
          error={themeError}
          describedByIds={consigneHelpDescId}
          themeInputId={consigneId}
        />
        {themeError ? (
          <p className="text-sm font-medium text-error" role="alert">
            {themeError}
          </p>
        ) : null}
      </div>

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

        <SequenceOptionsGenerator value={sequenceGeneratorValue} onChange={handleGeneratorChange} />
      </fieldset>

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
          dangerouslySetInnerHTML={{ __html: fixedGuidageHtml }}
        />
      </section>

      <SectionAspects
        aspects={r.aspects}
        onToggle={toggleAspect}
        onInfoClick={() => setModalAspects(true)}
      />
    </div>
  );
}
