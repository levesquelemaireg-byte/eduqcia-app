"use client";

import { useId, useLayoutEffect, useMemo, useState } from "react";
import { FieldHelpModalButton } from "@/components/ui/FieldHelpModalButton";
import { RequiredMark } from "@/components/ui/RequiredMark";
import { SimpleModal } from "@/components/ui/SimpleModal";
import { BLOC3_SECTION_ICON } from "@/components/tae/TaeForm/bloc3-stepper-icons";
import { BLOC3_MODAL_GUIDAGE_TITLE } from "@/components/tae/TaeForm/bloc3/modalCopy";
import { useAvantApresPayloadBootstrap } from "@/components/tae/non-redaction/avant-apres/useAvantApresPayloadBootstrap";
import { getRedactionSliceForPreview, useTaeForm } from "@/components/tae/TaeForm/FormState";
import { isBlueprintFieldsComplete } from "@/lib/tae/blueprint-helpers";
import {
  buildAvantApresGuidageHtml,
  clearedAvantApresOptionsPatch,
  formatAvantApresAnneeForDisplay,
  initialAvantApresPayload,
  normalizeAvantApresPayload,
  type AvantApresPayload,
} from "@/lib/tae/non-redaction/avant-apres-payload";
import { getVariantSlugForComportementId } from "@/lib/tae/non-redaction/registry";
import { materialIconTooltip } from "@/lib/tae/icon-justifications";
import {
  NR_AVANT_APRES_ANNEE_HELP,
  NR_AVANT_APRES_ANNEE_LABEL,
  NR_AVANT_APRES_CONSIGNE_INFO_MODAL_BODY,
  NR_AVANT_APRES_CONSIGNE_MINISTERIAL_BADGE,
  NR_AVANT_APRES_GATE_BLOC3,
  NR_AVANT_APRES_GUIDAGE_FORM_LEAD,
  NR_AVANT_APRES_GUIDAGE_INFO_MODAL_BODY,
  NR_AVANT_APRES_REPERE_HELP,
  NR_AVANT_APRES_REPERE_LABEL,
  NR_AVANT_APRES_REPERE_PLACEHOLDER,
  NR_AVANT_APRES_THEME_HELP,
  NR_AVANT_APRES_THEME_LABEL,
  NR_AVANT_APRES_THEME_PLACEHOLDER,
} from "@/lib/ui/ui-copy";
import { cn } from "@/lib/utils/cn";
import { nonRedactionAvantApresPayload } from "@/lib/tae/wizard-state-nr";

export function Bloc3AvantApres() {
  const { state, dispatch } = useTaeForm();
  const b = state.bloc2;
  const r = getRedactionSliceForPreview(state);
  const themeId = useId();
  const repereId = useId();
  const anneeId = useId();
  const [modalGuidage, setModalGuidage] = useState(false);
  const [modalConsigne, setModalConsigne] = useState(false);
  const [anneeDraft, setAnneeDraft] = useState("");

  useAvantApresPayloadBootstrap();

  const blueprintOk = isBlueprintFieldsComplete(b) && b.blueprintLocked;
  const fixedGuidageHtml = useMemo(() => buildAvantApresGuidageHtml(), []);

  useLayoutEffect(() => {
    if (
      !blueprintOk ||
      getVariantSlugForComportementId(state.bloc2.comportementId) !== "avant-apres"
    ) {
      return;
    }
    if (r.guidage !== fixedGuidageHtml) {
      dispatch({ type: "SET_GUIDAGE", value: fixedGuidageHtml });
    }
  }, [blueprintOk, dispatch, fixedGuidageHtml, r.guidage, state.bloc2.comportementId]);

  const p = useMemo(() => {
    return (
      normalizeAvantApresPayload(nonRedactionAvantApresPayload(state)) ?? initialAvantApresPayload()
    );
  }, [state]);

  useLayoutEffect(() => {
    setAnneeDraft(formatAvantApresAnneeForDisplay(p));
  }, [p.anneeRepere, p.anneeRepereFin]);

  const patchPayload = (patch: Partial<AvantApresPayload>) => {
    const clear = p.generated ? clearedAvantApresOptionsPatch() : {};
    dispatch({
      type: "NON_REDACTION_PATCH_AVANT_APRES",
      patch: { ...clear, ...patch },
    });
  };

  if (!blueprintOk) {
    return <p className="text-sm leading-relaxed text-muted">{NR_AVANT_APRES_GATE_BLOC3}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="material-symbols-outlined text-[1em] text-accent"
            aria-hidden="true"
            title={materialIconTooltip(BLOC3_SECTION_ICON.consigne) ?? undefined}
          >
            {BLOC3_SECTION_ICON.consigne}
          </span>
          <span className="text-sm font-semibold text-deep">
            {NR_AVANT_APRES_THEME_LABEL} <RequiredMark />
          </span>
          <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-deep">
            {NR_AVANT_APRES_CONSIGNE_MINISTERIAL_BADGE}
          </span>
          <FieldHelpModalButton onClick={() => setModalConsigne(true)} />
        </div>
        <SimpleModal
          open={modalConsigne}
          title={NR_AVANT_APRES_THEME_LABEL}
          onClose={() => setModalConsigne(false)}
          titleStyle="info-help"
        >
          <p className="text-sm leading-relaxed text-deep">
            {NR_AVANT_APRES_CONSIGNE_INFO_MODAL_BODY}
          </p>
        </SimpleModal>
        <p className="text-sm leading-relaxed text-muted">{NR_AVANT_APRES_THEME_HELP}</p>
        <input
          id={themeId}
          type="text"
          value={p.theme}
          onChange={(e) => patchPayload({ theme: e.target.value })}
          placeholder={NR_AVANT_APRES_THEME_PLACEHOLDER}
          maxLength={200}
          className={cn(
            "w-full max-w-xl rounded-md border border-input bg-background px-3 py-2 text-sm text-deep shadow-sm",
            "placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
          autoComplete="off"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
        <div className="space-y-2">
          <label
            htmlFor={repereId}
            className="flex flex-wrap items-center gap-1 text-sm font-semibold text-deep"
          >
            {NR_AVANT_APRES_REPERE_LABEL} <RequiredMark />
          </label>
          <p className="text-xs text-muted">{NR_AVANT_APRES_REPERE_HELP}</p>
          <input
            id={repereId}
            type="text"
            value={p.repere}
            onChange={(e) => patchPayload({ repere: e.target.value })}
            placeholder={NR_AVANT_APRES_REPERE_PLACEHOLDER}
            maxLength={200}
            className={cn(
              "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-deep shadow-sm",
              "placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
            autoComplete="off"
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor={anneeId}
            className="flex flex-wrap items-center gap-1 text-sm font-semibold text-deep"
          >
            {NR_AVANT_APRES_ANNEE_LABEL} <RequiredMark />
          </label>
          <p className="text-xs text-muted">{NR_AVANT_APRES_ANNEE_HELP}</p>
          <input
            id={anneeId}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={anneeDraft}
            onChange={(e) => setAnneeDraft(e.target.value)}
            onBlur={() => {
              const t = anneeDraft.trim();
              const range = t.match(/^(\d{4})\s*[\u2013\-]\s*(\d{4})$/u);
              if (range) {
                const a = parseInt(range[1]!, 10);
                const b = parseInt(range[2]!, 10);
                patchPayload({
                  anneeRepere: Math.min(a, b),
                  anneeRepereFin: Math.max(a, b),
                });
                return;
              }
              if (/^\d{4}$/.test(t)) {
                const v = parseInt(t, 10);
                if (Number.isFinite(v)) {
                  patchPayload({ anneeRepere: v, anneeRepereFin: undefined });
                }
                return;
              }
              setAnneeDraft(formatAvantApresAnneeForDisplay(p));
            }}
            className={cn(
              "w-full max-w-56 rounded-md border border-input bg-background px-3 py-2 text-sm text-deep shadow-sm",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
          />
        </div>
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
            <FieldHelpModalButton onClick={() => setModalGuidage(true)} />
          </div>
        </div>
        <SimpleModal
          open={modalGuidage}
          title={BLOC3_MODAL_GUIDAGE_TITLE}
          onClose={() => setModalGuidage(false)}
          titleStyle="info-help"
        >
          <p className="text-sm leading-relaxed text-deep">
            {NR_AVANT_APRES_GUIDAGE_INFO_MODAL_BODY}
          </p>
        </SimpleModal>
        <p className="text-sm text-muted">{NR_AVANT_APRES_GUIDAGE_FORM_LEAD}</p>
        <div
          className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm leading-relaxed text-deep [&_p]:m-0"
          dangerouslySetInnerHTML={{ __html: fixedGuidageHtml }}
        />
      </section>
    </div>
  );
}
