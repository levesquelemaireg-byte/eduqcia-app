"use client";

/**
 * Bloc 4 — Perspectives (OI3 · 3.3/3.4/3.5).
 * Mode groupé : encadré document + accordéon séquentiel perspectives.
 * Mode séparé : fallback vers DocumentSlotPanel standard.
 * Spec : docs/SPEC-TEMPLATES-CONSIGNE.md § OI3 · Bloc 4
 * Design : docs/DESIGN-SYSTEM.md § États de progression — accordéons séquentiels
 */
import { useCallback, useId, useMemo, useState } from "react";
import { DocumentSlotPanel } from "@/components/tae/TaeForm/bloc4";
import { DocumentSlotsAccordionProvider } from "@/components/tae/TaeForm/bloc4/DocumentSlotsAccordionContext";
import { DocumentSlotsAccordionSync } from "@/components/tae/TaeForm/bloc4/DocumentSlotsAccordionSync";
import { useTaeForm } from "@/components/tae/TaeForm/FormState";
import { RadioCardGroup } from "@/components/ui/RadioCardGroup";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { RequiredMark } from "@/components/ui/RequiredMark";
import type { DocumentSlotId } from "@/lib/tae/blueprint-helpers";
import { isBlueprintFieldsComplete } from "@/lib/tae/blueprint-helpers";
import { htmlHasMeaningfulText } from "@/lib/tae/consigne-helpers";
import { getWizardBlocConfig } from "@/lib/tae/wizard-bloc-config";
import {
  emptyPerspective,
  perspectiveSectionLabel,
} from "@/lib/tae/oi-perspectives/perspectives-helpers";
import type { PerspectiveData } from "@/lib/tae/oi-perspectives/perspectives-types";
import type { Dispatch } from "react";
import type { TaeFormAction } from "@/lib/tae/tae-form-state-types";
import { cn } from "@/lib/utils/cn";
import {
  BLOC4_GATE_WIZARD,
  DOCUMENT_MODULE_TYPE_TEXT,
  DOCUMENT_MODULE_TYPE_IMAGE,
  PERSP_BLOC4_ACTEUR_LABEL,
  PERSP_BLOC4_ACTEUR_PLACEHOLDER,
  PERSP_BLOC4_EXTRAIT_LABEL,
  PERSP_BLOC4_SOURCE_LABEL,
  PERSP_BLOC4_STATUS_LOCKED,
  PERSP_BLOC4_STATUS_AVAILABLE,
  PERSP_BLOC4_STATUS_OPEN,
  PERSP_BLOC4_STATUS_COMPLETE,
  PERSP_BLOC4_TITRE_LABEL,
  PERSP_BLOC4_TITRE_PLACEHOLDER,
} from "@/lib/ui/ui-copy";

// ---------------------------------------------------------------------------
// Composant principal
// ---------------------------------------------------------------------------

export default function Bloc4Perspectives() {
  const { state, dispatch } = useTaeForm();
  const b = state.bloc2;
  const mode = state.bloc3.perspectivesMode;
  const perspectives = state.bloc4.perspectives;
  const titre = state.bloc4.perspectivesTitre;

  const config = getWizardBlocConfig(b.comportementId);
  const count = config?.bloc4.type === "perspectives" ? config.bloc4.count : 2;

  const orderedIds = useMemo(
    () => b.documentSlots.map((s) => s.slotId) as DocumentSlotId[],
    [b.documentSlots],
  );

  const blueprintGate = isBlueprintFieldsComplete(b) && b.blueprintLocked;
  if (!blueprintGate) {
    return <p className="text-sm leading-relaxed text-muted">{BLOC4_GATE_WIZARD}</p>;
  }

  // Mode séparé → slots standard
  if (mode === "separe") {
    return (
      <div className="space-y-8">
        <DocumentSlotsAccordionProvider initialExpandedSlotId={orderedIds[0]!}>
          <DocumentSlotsAccordionSync orderedIds={orderedIds} />
          <div className="space-y-3">
            {orderedIds.map((slotId, idx) => (
              <DocumentSlotPanel
                key={slotId}
                slotId={slotId}
                slotIndex={idx}
                orderedIds={orderedIds}
              />
            ))}
          </div>
        </DocumentSlotsAccordionProvider>
      </div>
    );
  }

  // Mode groupé → encadré document + accordéon perspectives
  return (
    <div className="rounded-lg border border-border bg-panel">
      {/* En-tête avec pastille */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
          A
        </span>
        <span className="text-sm font-semibold text-deep">Document A</span>
      </div>

      {/* Champ titre */}
      <div className="space-y-1 px-4 pt-4">
        <label htmlFor="persp-titre" className="text-sm font-medium text-deep">
          {PERSP_BLOC4_TITRE_LABEL} <RequiredMark />
        </label>
        <input
          id="persp-titre"
          type="text"
          value={titre}
          onChange={(e) => dispatch({ type: "SET_PERSPECTIVES_TITRE", value: e.target.value })}
          placeholder={PERSP_BLOC4_TITRE_PLACEHOLDER}
          autoComplete="off"
          className="auth-input h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-deep placeholder:text-muted"
        />
      </div>

      {/* Accordéon perspectives */}
      <div className="p-4">
        <PerspectivesGroupeAccordion
          perspectives={perspectives}
          count={count}
          dispatch={dispatch}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helper : complétion d'une perspective
// ---------------------------------------------------------------------------

function isPerspectiveComplete(p: PerspectiveData): boolean {
  return (
    p.acteur.trim().length > 0 &&
    htmlHasMeaningfulText(p.contenu) &&
    htmlHasMeaningfulText(p.source)
  );
}

type PerspectiveUiStatus = "locked" | "available" | "open" | "complete";

function perspectiveStatusIcon(status: PerspectiveUiStatus): { icon: string; cls: string } {
  switch (status) {
    case "locked":
      return { icon: "lock", cls: "text-muted" };
    case "available":
      return { icon: "lock_open", cls: "text-muted" };
    case "open":
      return { icon: "lock_open", cls: "text-accent" };
    case "complete":
      return { icon: "fact_check", cls: "text-success" };
  }
}

function perspectiveStatusText(status: PerspectiveUiStatus): string {
  switch (status) {
    case "locked":
      return PERSP_BLOC4_STATUS_LOCKED;
    case "available":
      return PERSP_BLOC4_STATUS_AVAILABLE;
    case "open":
      return PERSP_BLOC4_STATUS_OPEN;
    case "complete":
      return PERSP_BLOC4_STATUS_COMPLETE;
  }
}

// ---------------------------------------------------------------------------
// Sous-composant : accordéon séquentiel groupé
// ---------------------------------------------------------------------------

function PerspectivesGroupeAccordion({
  perspectives,
  count,
  dispatch,
}: {
  perspectives: PerspectiveData[] | null;
  count: 2 | 3;
  dispatch: Dispatch<TaeFormAction>;
}) {
  const [openIndex, setOpenIndex] = useState(0);

  const statuses = useMemo(() => {
    const result: PerspectiveUiStatus[] = [];
    for (let i = 0; i < count; i++) {
      const p = perspectives?.[i] ?? emptyPerspective();
      const complete = isPerspectiveComplete(p);
      if (complete) {
        result.push("complete");
      } else if (i === openIndex) {
        result.push("open");
      } else if (i === 0 || result[i - 1] === "complete") {
        result.push("available");
      } else {
        result.push("locked");
      }
    }
    return result;
  }, [perspectives, count, openIndex]);

  return (
    <div className="space-y-2">
      {Array.from({ length: count }, (_, i) => {
        const p = perspectives?.[i] ?? emptyPerspective();
        const status = statuses[i]!;
        const isOpen = i === openIndex && status !== "complete";
        const isLocked = status === "locked";
        const displayStatus = isOpen ? ("open" as const) : status;
        const { icon, cls } = perspectiveStatusIcon(displayStatus);
        const statusCls =
          displayStatus === "complete"
            ? "text-success"
            : displayStatus === "open"
              ? "text-accent"
              : "text-muted";
        const label = perspectiveSectionLabel(i);

        return (
          <div key={i} className="rounded-md border border-border bg-surface">
            {/* Header — div interactif */}
            <div
              role="button"
              tabIndex={isLocked ? -1 : 0}
              onClick={() => {
                if (!isLocked) setOpenIndex(isOpen ? -1 : i);
              }}
              onKeyDown={(e) => {
                if (isLocked) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setOpenIndex(isOpen ? -1 : i);
                }
              }}
              aria-expanded={isOpen}
              aria-disabled={isLocked}
              className={cn(
                "flex w-full items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors select-none",
                isLocked
                  ? "cursor-not-allowed text-muted"
                  : "cursor-pointer text-deep hover:bg-panel-alt",
                isOpen ? "rounded-t-md" : "rounded-md",
              )}
            >
              <span
                className={cn("material-symbols-outlined text-[18px]", cls)}
                aria-hidden="true"
              >
                {icon}
              </span>
              <span>{label}</span>
              <span className={cn("ml-1 text-xs font-normal", statusCls)}>
                {perspectiveStatusText(displayStatus)}
              </span>
              {!isLocked ? (
                <span
                  className="material-symbols-outlined ml-auto text-[20px] text-muted"
                  aria-hidden="true"
                >
                  {isOpen ? "expand_less" : "expand_more"}
                </span>
              ) : null}
            </div>
            {/* Contenu — frère du header */}
            {isOpen ? (
              <div className="border-t border-border px-4 pb-4 pt-3">
                <PerspectiveSection index={i} data={p} dispatch={dispatch} />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sous-composant : section perspective individuelle
// ---------------------------------------------------------------------------

const TYPE_OPTIONS = [
  { value: "textuel", label: DOCUMENT_MODULE_TYPE_TEXT },
  { value: "iconographique", label: DOCUMENT_MODULE_TYPE_IMAGE },
];

function PerspectiveSection({
  index,
  data,
  dispatch,
}: {
  index: number;
  data: PerspectiveData;
  dispatch: Dispatch<TaeFormAction>;
}) {
  const acteurId = useId();

  const onPatch = useCallback(
    (patch: Partial<PerspectiveData>) => {
      dispatch({ type: "UPDATE_PERSPECTIVE", index, patch });
    },
    [dispatch, index],
  );

  return (
    <div className="space-y-3">
      {/* Type de document */}
      <RadioCardGroup
        name={`persp-type-${index}`}
        label="Type de document"
        required
        columns={2}
        options={TYPE_OPTIONS}
        value={data.type}
        onChange={(v) => onPatch({ type: v as "textuel" | "iconographique" })}
      />

      {/* Acteur ou historien */}
      <div className="space-y-1">
        <label htmlFor={acteurId} className="text-sm font-medium text-deep">
          {PERSP_BLOC4_ACTEUR_LABEL} <RequiredMark />
        </label>
        <input
          id={acteurId}
          type="text"
          value={data.acteur}
          onChange={(e) => onPatch({ acteur: e.target.value })}
          placeholder={PERSP_BLOC4_ACTEUR_PLACEHOLDER}
          autoComplete="off"
          className="auth-input h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-deep placeholder:text-muted"
        />
      </div>

      {/* Extrait */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-deep">
          {PERSP_BLOC4_EXTRAIT_LABEL} <RequiredMark />
        </p>
        <RichTextEditor
          instanceId={`persp-extrait-${index}`}
          value={data.contenu}
          onChange={(html) => onPatch({ contenu: html })}
          minHeight={80}
          toolbarAriaLabel={`Mise en forme — ${perspectiveSectionLabel(index)} extrait`}
        />
      </div>

      {/* Source */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-deep">
          {PERSP_BLOC4_SOURCE_LABEL} <RequiredMark />
        </p>
        <RichTextEditor
          instanceId={`persp-source-${index}`}
          value={data.source}
          onChange={(html) => onPatch({ source: html })}
          minHeight={60}
          toolbarAriaLabel={`Mise en forme — ${perspectiveSectionLabel(index)} source`}
        />
      </div>
    </div>
  );
}
