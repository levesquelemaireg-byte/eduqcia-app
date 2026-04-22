"use client";

/**
 * Bloc 4 — Moments (OI6 · 6.3).
 * Mode groupé : encadré document + accordéon séquentiel État A / État B.
 * Mode séparé : fallback vers DocumentSlotPanel standard.
 * Spec : docs/SPEC-TEMPLATES-CONSIGNE.md § Bloc 4 — Moments
 * Design : docs/DESIGN-SYSTEM.md § États de progression — accordéons séquentiels
 */
import { useCallback, useId, useMemo, useState } from "react";
import { DocumentSlotPanel } from "@/components/tache/wizard/bloc4";
import { DocumentSlotsAccordionProvider } from "@/components/tache/wizard/bloc4/DocumentSlotsAccordionContext";
import { DocumentSlotsAccordionSync } from "@/components/tache/wizard/bloc4/DocumentSlotsAccordionSync";
import { useTacheForm } from "@/components/tache/wizard/FormState";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { RequiredMark } from "@/components/ui/RequiredMark";
import type { DocumentSlotId } from "@/lib/tache/blueprint-helpers";
import { isBlueprintFieldsComplete } from "@/lib/tache/blueprint-helpers";
import { htmlHasMeaningfulText } from "@/lib/tache/consigne-helpers";
import { emptyMoment } from "@/lib/tache/oi-perspectives/perspectives-helpers";
import type { MomentData } from "@/lib/tache/oi-perspectives/perspectives-types";
import type { Dispatch } from "react";
import type { TacheFormAction } from "@/lib/tache/tache-form-state-types";
import { cn } from "@/lib/utils/cn";
import {
  BLOC4_GATE_WIZARD,
  BLOC4_MOMENTS_TITRE_LABEL,
  BLOC4_MOMENTS_TITRE_PLACEHOLDER,
  BLOC4_MOMENTS_TITRE_HINT,
  BLOC4_MOMENTS_ETAT_A,
  BLOC4_MOMENTS_ETAT_B,
  PERSP_BLOC4_SOURCE_LABEL,
  PERSP_BLOC4_STATUS_LOCKED,
  PERSP_BLOC4_STATUS_AVAILABLE,
  PERSP_BLOC4_STATUS_OPEN,
  PERSP_BLOC4_STATUS_COMPLETE,
} from "@/lib/ui/ui-copy";

// ---------------------------------------------------------------------------
// Composant principal
// ---------------------------------------------------------------------------

export default function Bloc4Moments() {
  const { state, dispatch } = useTacheForm();
  const b = state.bloc2;
  const mode = state.bloc3.perspectivesMode;
  const moments = state.bloc4.moments;
  const titre = state.bloc4.momentsTitre;

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

  // Mode groupé → encadré + accordéon états
  return (
    <div className="rounded-lg border border-border bg-panel">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
          A
        </span>
        <span className="text-sm font-semibold text-deep">Document A</span>
      </div>

      <div className="space-y-1 px-4 pt-4">
        <label htmlFor="moments-titre" className="text-sm font-medium text-deep">
          {BLOC4_MOMENTS_TITRE_LABEL}
        </label>
        <input
          id="moments-titre"
          type="text"
          value={titre}
          onChange={(e) => dispatch({ type: "SET_MOMENTS_TITRE", value: e.target.value })}
          placeholder={BLOC4_MOMENTS_TITRE_PLACEHOLDER}
          autoComplete="off"
          className="auth-input h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-deep placeholder:text-muted"
        />
        <p className="text-xs text-muted">{BLOC4_MOMENTS_TITRE_HINT}</p>
      </div>

      <div className="p-4">
        <MomentsAccordion moments={moments} dispatch={dispatch} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ETAT_LABELS = [BLOC4_MOMENTS_ETAT_A, BLOC4_MOMENTS_ETAT_B] as const;

function isMomentComplete(m: MomentData): boolean {
  return htmlHasMeaningfulText(m.contenu) && htmlHasMeaningfulText(m.source);
}

type MomentUiStatus = "locked" | "available" | "open" | "complete";

function momentStatusIcon(status: MomentUiStatus): { icon: string; cls: string } {
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

function momentStatusText(status: MomentUiStatus): string {
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
// Accordéon séquentiel
// ---------------------------------------------------------------------------

function MomentsAccordion({
  moments,
  dispatch,
}: {
  moments: MomentData[] | null;
  dispatch: Dispatch<TacheFormAction>;
}) {
  const [openIndex, setOpenIndex] = useState(0);

  const statuses = useMemo(() => {
    const result: MomentUiStatus[] = [];
    for (let i = 0; i < 2; i++) {
      const m = moments?.[i] ?? emptyMoment();
      const complete = isMomentComplete(m);
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
  }, [moments, openIndex]);

  return (
    <div className="space-y-2">
      {[0, 1].map((i) => {
        const m = moments?.[i] ?? emptyMoment();
        const status = statuses[i]!;
        const isOpen = i === openIndex && status !== "complete";
        const isLocked = status === "locked";
        const displayStatus = isOpen ? ("open" as const) : status;
        const { icon, cls } = momentStatusIcon(displayStatus);
        const statusCls =
          displayStatus === "complete"
            ? "text-success"
            : displayStatus === "open"
              ? "text-accent"
              : "text-muted";
        const label = ETAT_LABELS[i];

        return (
          <div key={i} className="rounded-md border border-border bg-surface">
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
              <span className={cn("material-symbols-outlined text-[18px]", cls)} aria-hidden="true">
                {icon}
              </span>
              <span>{label}</span>
              <span className={cn("ml-1 text-xs font-normal", statusCls)}>
                {momentStatusText(displayStatus)}
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
            {isOpen ? (
              <div className="border-t border-border px-4 pb-4 pt-3">
                <MomentSection index={i} data={m} dispatch={dispatch} />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section moment individuelle
// ---------------------------------------------------------------------------

function MomentSection({
  index,
  data,
  dispatch,
}: {
  index: number;
  data: MomentData;
  dispatch: Dispatch<TacheFormAction>;
}) {
  const titreId = useId();

  const onPatch = useCallback(
    (patch: Partial<MomentData>) => {
      dispatch({ type: "UPDATE_MOMENT", index, patch });
    },
    [dispatch, index],
  );

  return (
    <div className="space-y-3">
      {/* Titre optionnel */}
      <div className="space-y-1">
        <label htmlFor={titreId} className="text-sm font-medium text-deep">
          {BLOC4_MOMENTS_TITRE_LABEL}
        </label>
        <input
          id={titreId}
          type="text"
          value={data.titre}
          onChange={(e) => onPatch({ titre: e.target.value })}
          placeholder={BLOC4_MOMENTS_TITRE_PLACEHOLDER}
          autoComplete="off"
          className="auth-input h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-deep placeholder:text-muted"
        />
      </div>

      {/* Contenu */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-deep">
          Contenu <RequiredMark />
        </p>
        <RichTextEditor
          instanceId={`moment-contenu-${index}`}
          value={data.contenu}
          onChange={(html) => onPatch({ contenu: html })}
          minHeight={80}
          toolbarAriaLabel={`Mise en forme — ${ETAT_LABELS[index]} contenu`}
        />
      </div>

      {/* Source */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-deep">
          {PERSP_BLOC4_SOURCE_LABEL} <RequiredMark />
        </p>
        <RichTextEditor
          instanceId={`moment-source-${index}`}
          value={data.source}
          onChange={(html) => onPatch({ source: html })}
          minHeight={60}
          toolbarAriaLabel={`Mise en forme — ${ETAT_LABELS[index]} source`}
        />
      </div>
    </div>
  );
}
