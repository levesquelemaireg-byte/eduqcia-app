"use client";

import { useCallback, useId, useLayoutEffect, useMemo, useState } from "react";
import { sanitize } from "@/lib/fiche/helpers";
import { FieldHelpModalButton } from "@/components/ui/FieldHelpModalButton";
import { RequiredMark } from "@/components/ui/RequiredMark";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { SimpleModal } from "@/components/ui/SimpleModal";
import { BLOC3_MODAL_GUIDAGE_TITLE } from "@/components/tae/TaeForm/bloc3/modalCopy";
import { BLOC3_SECTION_ICON } from "@/components/tae/TaeForm/bloc3-stepper-icons";
import { OrdreChronologiqueConsigneMinisterialBadge } from "@/components/tae/non-redaction/consigne-template/OrdreChronologiqueConsigneTemplate";
import { getRedactionSliceForPreview, useTaeForm } from "@/components/tae/TaeForm/FormState";
import { isBlueprintFieldsComplete } from "@/lib/tae/blueprint-helpers";
import {
  buildLigneDuTempsGuidageHtml,
  buildLigneDuTempsIntroHtml,
  initialLigneDuTempsPayload,
  mergeLigneDuTempsPayload,
  normalizeLigneDuTempsPayload,
  type LigneDuTempsPayload,
} from "@/lib/tae/non-redaction/ligne-du-temps-payload";
import { getVariantSlugForComportementId } from "@/lib/tae/non-redaction/registry";
import { materialIconTooltip } from "@/lib/tae/icon-justifications";
import {
  NR_LIGNE_TEMPS_DATE_CHAINED_HINT,
  NR_LIGNE_TEMPS_DATE_END,
  NR_LIGNE_TEMPS_DATE_START,
  NR_LIGNE_TEMPS_GATE_BLOC3,
  NR_LIGNE_TEMPS_GUIDAGE_FORM_LEAD,
  NR_LIGNE_TEMPS_GUIDAGE_INFO_MODAL_BODY,
  NR_LIGNE_TEMPS_OPTION_3,
  NR_LIGNE_TEMPS_OPTION_4,
  NR_LIGNE_TEMPS_PERIOD_PREFIX,
  NR_LIGNE_TEMPS_SEGMENT_COUNT_LABEL,
  NR_LIGNE_TEMPS_TIMELINE_PREVIEW_TITLE,
  NR_ORDRE_CONSIGNE_HELP,
  NR_ORDRE_CONSIGNE_LABEL,
} from "@/lib/ui/ui-copy";
import { LigneDuTempsFrisePicker } from "@/components/tae/non-redaction/ligne-du-temps/LigneDuTempsFrisePicker";
import { resolveConsigneHtmlForDisplay } from "@/lib/tae/consigne-helpers";
import { nonRedactionLignePayload } from "@/lib/tae/wizard-state-nr";

export function Bloc3LigneDuTemps() {
  const { state, dispatch } = useTaeForm();
  const b = state.bloc2;
  const r = getRedactionSliceForPreview(state);
  const [modalGuidage, setModalGuidage] = useState(false);
  const [consigneHelpOpen, setConsigneHelpOpen] = useState(false);
  const segFieldId = useId();

  const blueprintOk = isBlueprintFieldsComplete(b) && b.blueprintLocked;
  const docCount = b.documentSlots.length;

  useLayoutEffect(() => {
    const n = normalizeLigneDuTempsPayload(nonRedactionLignePayload(state));
    if (!n) {
      dispatch({
        type: "NON_REDACTION_PATCH_LIGNE_TEMPS",
        patch: initialLigneDuTempsPayload(),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seul bloc5.nonRedaction déclenche l'init
  }, [dispatch, state.bloc5.nonRedaction]);

  const fixedGuidageHtml = useMemo(() => buildLigneDuTempsGuidageHtml(), []);

  useLayoutEffect(() => {
    if (!blueprintOk || getVariantSlugForComportementId(b.comportementId) !== "ligne-du-temps") {
      return;
    }
    if (r.guidage !== fixedGuidageHtml) {
      dispatch({ type: "SET_GUIDAGE", value: fixedGuidageHtml });
    }
  }, [blueprintOk, b.comportementId, dispatch, fixedGuidageHtml, r.guidage]);

  const p = useMemo(
    () =>
      normalizeLigneDuTempsPayload(nonRedactionLignePayload(state)) ?? initialLigneDuTempsPayload(),
    [state],
  );

  const patch = useCallback(
    (partial: Partial<LigneDuTempsPayload>) => {
      dispatch({ type: "NON_REDACTION_PATCH_LIGNE_TEMPS", patch: partial });
    },
    [dispatch],
  );

  const introPreviewHtml = useMemo(
    () => buildLigneDuTempsIntroHtml(p.segmentCount),
    [p.segmentCount],
  );
  const introResolved = useMemo(
    () => resolveConsigneHtmlForDisplay(introPreviewHtml, docCount),
    [introPreviewHtml, docCount],
  );

  const need = p.segmentCount + 1;

  const setBoundary = (index: number, raw: string) => {
    const nextB = [...p.boundaries];
    while (nextB.length < need) nextB.push(null);
    const t = raw.trim();
    if (t === "") {
      nextB[index] = null;
      patch({ boundaries: nextB });
      return;
    }
    const n = Number(t);
    if (!Number.isFinite(n)) return;
    nextB[index] = n;
    patch({ boundaries: nextB });
  };

  if (!blueprintOk) {
    return <p className="text-sm leading-relaxed text-muted">{NR_LIGNE_TEMPS_GATE_BLOC3}</p>;
  }

  return (
    <div className="space-y-6">
      <SimpleModal
        open={modalGuidage}
        title={BLOC3_MODAL_GUIDAGE_TITLE}
        onClose={() => setModalGuidage(false)}
        titleStyle="info-help"
      >
        <p className="text-sm leading-relaxed text-deep">
          {NR_LIGNE_TEMPS_GUIDAGE_INFO_MODAL_BODY}
        </p>
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
          <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-deep">
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
          </div>
        </div>
        <p className="text-sm leading-relaxed text-muted">{NR_ORDRE_CONSIGNE_HELP}</p>
        <div
          className="rounded-lg border border-border bg-panel px-3 py-3 text-sm font-semibold leading-relaxed text-deep [&_strong]:font-bold"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: sanitize(introResolved) }}
        />
      </div>

      <fieldset className="space-y-3">
        <legend id={segFieldId} className="text-sm font-semibold text-deep">
          {NR_LIGNE_TEMPS_SEGMENT_COUNT_LABEL} <RequiredMark />
        </legend>
        <SegmentedControl
          aria-labelledby={segFieldId}
          options={[
            { value: "3", label: NR_LIGNE_TEMPS_OPTION_3 },
            { value: "4", label: NR_LIGNE_TEMPS_OPTION_4 },
          ]}
          value={String(p.segmentCount)}
          onChange={(v) => {
            const n = v === "4" ? 4 : 3;
            const base = mergeLigneDuTempsPayload(p, { segmentCount: n });
            patch({ segmentCount: n, boundaries: base.boundaries, correctLetter: "" });
          }}
        />
        <p className="text-xs text-muted">{NR_LIGNE_TEMPS_DATE_CHAINED_HINT}</p>

        <div className="space-y-4">
          {Array.from({ length: p.segmentCount }, (_, i) => {
            const startVal = i === 0 ? p.boundaries[0] : p.boundaries[i];
            const endVal = p.boundaries[i + 1];
            const startStr = startVal === null || startVal === undefined ? "" : String(startVal);
            const endStr = endVal === null || endVal === undefined ? "" : String(endVal);
            return (
              <div
                key={i}
                className="grid gap-3 rounded-lg border border-border bg-surface p-3 sm:grid-cols-2"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-muted sm:col-span-2">
                  {NR_LIGNE_TEMPS_PERIOD_PREFIX}
                  {i + 1}
                </p>
                <div>
                  <label className="block text-xs font-medium text-deep">
                    {NR_LIGNE_TEMPS_DATE_START} <RequiredMark />
                  </label>
                  {i === 0 ? (
                    <input
                      type="number"
                      className="mt-1 w-full rounded-md border border-border bg-panel px-2 py-2 text-sm text-deep"
                      value={startStr}
                      onChange={(e) => setBoundary(0, e.target.value)}
                    />
                  ) : (
                    <input
                      type="text"
                      readOnly
                      className="mt-1 w-full cursor-not-allowed rounded-md border border-border bg-border/20 px-2 py-2 text-sm text-steel"
                      value={startStr}
                      aria-label={NR_LIGNE_TEMPS_DATE_START}
                    />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-deep">
                    {NR_LIGNE_TEMPS_DATE_END} <RequiredMark />
                  </label>
                  <input
                    type="number"
                    className="mt-1 w-full rounded-md border border-border bg-panel px-2 py-2 text-sm text-deep"
                    value={endStr}
                    onChange={(e) => setBoundary(i + 1, e.target.value)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </fieldset>

      <section className="space-y-3 border-t border-border pt-4">
        <p className="text-sm font-semibold text-deep">{NR_LIGNE_TEMPS_TIMELINE_PREVIEW_TITLE}</p>
        <LigneDuTempsFrisePicker payload={p} onPickLetter={() => {}} interactive={false} />
      </section>

      <section className="space-y-2 border-t border-border pt-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-deep">
          <span
            className="material-symbols-outlined text-[1em] text-accent"
            aria-hidden="true"
            title={materialIconTooltip(BLOC3_SECTION_ICON.guidage) ?? undefined}
          >
            {BLOC3_SECTION_ICON.guidage}
          </span>
          <span>Guidage complémentaire</span>
          <FieldHelpModalButton onClick={() => setModalGuidage(true)} />
        </div>
        <p className="text-sm leading-relaxed text-muted">{NR_LIGNE_TEMPS_GUIDAGE_FORM_LEAD}</p>
        <div
          className="rounded-lg border border-border bg-panel px-3 py-3 text-sm leading-relaxed text-steel [&_strong]:font-bold [&_em]:italic"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: sanitize(fixedGuidageHtml) }}
        />
      </section>
    </div>
  );
}
