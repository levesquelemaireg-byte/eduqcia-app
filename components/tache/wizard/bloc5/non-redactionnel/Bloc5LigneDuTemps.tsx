"use client";

import { useCallback, useEffect, useId, useMemo, useRef } from "react";
import { RequiredMark } from "@/components/ui/RequiredMark";
import { LigneDuTempsFrisePicker } from "@/components/tache/non-redaction/ligne-du-temps/LigneDuTempsFrisePicker";
import { useTacheForm } from "@/components/tache/wizard/FormState";
import { isBlueprintFieldsComplete } from "@/lib/tache/blueprint-helpers";
import type { DocumentSlotId } from "@/lib/tache/blueprint-helpers";
import { getAnneePourComparaison } from "@/lib/tache/document-annee";
import { getSlotData } from "@/lib/tache/document-helpers";
import {
  determineSegmentIndexFromYear,
  ligneDuTempsSegmentYearBounds,
  segmentLetterFromIndex,
} from "@/lib/tache/non-redaction/ligne-du-temps-helpers";
import {
  ligneDuTempsBoundariesNumericComplete,
  normalizeLigneDuTempsPayload,
  type LigneDuTempsCorrectLetter,
  type LigneDuTempsPayload,
} from "@/lib/tache/non-redaction/ligne-du-temps-payload";
import { ligneTempsLettersForSegmentCount } from "@/lib/tache/non-redaction/ligne-du-temps-model";
import type { Bloc5Props } from "@/lib/tache/tache-form-state-types";
import { nonRedactionLignePayload } from "@/lib/tache/wizard-state-nr";
import {
  NR_LIGNE_TEMPS_BLOC5_FRISE_RECAP_TITLE,
  NR_LIGNE_TEMPS_BLOC5_GATE,
  NR_LIGNE_TEMPS_BLOC5_INTRO,
  NR_LIGNE_TEMPS_BLOC5_NO_YEAR,
  NR_LIGNE_TEMPS_BLOC5_SEGMENT_AUTO,
  NR_LIGNE_TEMPS_BLOC5_SEGMENT_RADIO_ARIA,
  NR_LIGNE_TEMPS_BLOC5_SEGMENTS_LABEL,
  NR_LIGNE_TEMPS_BLOC5_SEGMENT_SUMMARY_PREFIX,
  NR_LIGNE_TEMPS_BLOC5_TITLE,
  NR_LIGNE_TEMPS_BLOC5_YEAR_OUTSIDE,
} from "@/lib/ui/ui-copy";
import { cn } from "@/lib/utils/cn";

function computedLetterFromYearAndBoundaries(
  year: number | null,
  segmentCount: 3 | 4,
  boundaries: number[],
): LigneDuTempsCorrectLetter | null {
  if (year === null || !Number.isFinite(year)) return null;
  const idx = determineSegmentIndexFromYear(Math.trunc(year), boundaries);
  if (idx === null) return null;
  const letters = ligneTempsLettersForSegmentCount(segmentCount);
  return segmentLetterFromIndex(idx, letters);
}

export default function Bloc5LigneDuTemps(_props: Bloc5Props) {
  const { state, dispatch } = useTacheForm();
  const b = state.bloc2;
  const groupId = useId();
  const manualLockRef = useRef(false);

  const blueprintGate = isBlueprintFieldsComplete(b) && b.blueprintLocked;
  const orderedSlotIds = useMemo(
    () => b.documentSlots.map((s) => s.slotId) as DocumentSlotId[],
    [b.documentSlots],
  );
  const firstSlotId = orderedSlotIds[0];
  const slot = firstSlotId
    ? getSlotData(state.bloc4.documents, firstSlotId)
    : getSlotData({}, "doc_A");

  const p = useMemo(() => normalizeLigneDuTempsPayload(nonRedactionLignePayload(state)), [state]);

  const patch = useCallback(
    (partial: Partial<LigneDuTempsPayload>) => {
      dispatch({ type: "NON_REDACTION_PATCH_LIGNE_TEMPS", patch: partial });
    },
    [dispatch],
  );

  const friseOk = p !== null && ligneDuTempsBoundariesNumericComplete(p);
  const nums = useMemo(() => {
    if (!p || !friseOk) return null;
    return p.boundaries.slice(0, p.segmentCount + 1) as number[];
  }, [p, friseOk]);

  const boundariesKey = nums?.join(",") ?? "";

  const yearComparable = useMemo(() => getAnneePourComparaison(slot), [slot]);
  const yearTrunc = yearComparable !== null ? Math.trunc(yearComparable) : null;

  const computedLetter = useMemo(() => {
    if (!p || !nums) return null;
    return computedLetterFromYearAndBoundaries(yearTrunc, p.segmentCount, nums);
  }, [p, nums, yearTrunc]);

  useEffect(() => {
    manualLockRef.current = false;
  }, [boundariesKey, firstSlotId]);

  useEffect(() => {
    if (!p || !nums || computedLetter === null) return;
    if (manualLockRef.current) return;
    if (p.correctLetter === computedLetter) return;
    patch({ correctLetter: computedLetter });
  }, [computedLetter, nums, p, patch]);

  const yearOutside =
    yearTrunc !== null && nums !== null && determineSegmentIndexFromYear(yearTrunc, nums) === null;

  const showAutoBadge =
    computedLetter !== null &&
    yearTrunc !== null &&
    !yearOutside &&
    p !== null &&
    p.correctLetter === computedLetter;

  const letters = p ? ligneTempsLettersForSegmentCount(p.segmentCount) : [];

  const pickLetter = useCallback(
    (letter: "A" | "B" | "C" | "D") => {
      manualLockRef.current = letter !== computedLetter;
      patch({ correctLetter: letter });
    },
    [computedLetter, patch],
  );

  if (!blueprintGate || !p) {
    return <p className="text-sm leading-relaxed text-muted">{NR_LIGNE_TEMPS_BLOC5_GATE}</p>;
  }

  if (!friseOk || orderedSlotIds.length === 0) {
    return <p className="text-sm leading-relaxed text-muted">{NR_LIGNE_TEMPS_BLOC5_GATE}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-deep">{NR_LIGNE_TEMPS_BLOC5_TITLE}</h2>
        <p className="text-sm leading-relaxed text-muted">{NR_LIGNE_TEMPS_BLOC5_INTRO}</p>
      </div>

      <div className="rounded-lg border border-border bg-panel-alt/30 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          {NR_LIGNE_TEMPS_BLOC5_FRISE_RECAP_TITLE}
        </p>
        <ul className="mt-2 space-y-1 text-sm text-deep">
          {letters.map((letter, i) => {
            const bounds = nums ? ligneDuTempsSegmentYearBounds(nums, i) : null;
            return (
              <li key={letter}>
                {bounds ? (
                  <>
                    <span className="font-semibold">{letter}</span> —{" "}
                    {NR_LIGNE_TEMPS_BLOC5_SEGMENT_SUMMARY_PREFIX}
                    {i + 1} : {bounds.start} – {bounds.end}
                  </>
                ) : (
                  letter
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {yearOutside ? (
        <div
          className="icon-lead rounded-lg border-l-4 border-warning bg-warning/[0.07] py-3 pl-4 pr-4 text-sm text-steel ring-1 ring-warning/15"
          role="status"
        >
          <span className="min-w-0 leading-relaxed">
            {NR_LIGNE_TEMPS_BLOC5_YEAR_OUTSIDE(yearTrunc!)}
          </span>
        </div>
      ) : null}

      {yearTrunc === null && !yearOutside ? (
        <p className="text-sm leading-relaxed text-deep" role="status">
          {NR_LIGNE_TEMPS_BLOC5_NO_YEAR}
        </p>
      ) : null}

      {showAutoBadge && computedLetter !== null && nums ? (
        <div
          className="flex flex-wrap items-start gap-2 rounded-lg border border-success/40 bg-success/10 px-3 py-3 text-sm text-deep"
          role="status"
        >
          <span
            className="material-symbols-outlined mt-[0.125em] shrink-0 text-[1em] leading-none text-success"
            aria-hidden
          >
            check_circle
          </span>
          <span>
            {(() => {
              const idx = letters.indexOf(computedLetter);
              const bounds = idx >= 0 ? ligneDuTempsSegmentYearBounds(nums, idx) : null;
              return bounds
                ? NR_LIGNE_TEMPS_BLOC5_SEGMENT_AUTO(computedLetter, bounds.start, bounds.end)
                : null;
            })()}
          </span>
        </div>
      ) : null}

      <fieldset className="space-y-3">
        <legend className="sr-only">{NR_LIGNE_TEMPS_BLOC5_SEGMENTS_LABEL}</legend>
        <div className="space-y-2" role="radiogroup" aria-labelledby={groupId}>
          <p id={groupId} className="text-sm font-medium text-deep">
            {NR_LIGNE_TEMPS_BLOC5_SEGMENTS_LABEL} <RequiredMark />
          </p>
          {letters.map((letter, i) => {
            const bounds = nums ? ligneDuTempsSegmentYearBounds(nums, i) : null;
            const id = `${groupId}-${letter}`;
            return (
              <label
                key={letter}
                htmlFor={id}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2 text-sm",
                  p.correctLetter === letter
                    ? "border-accent bg-accent/10 text-deep"
                    : "border-border text-deep",
                )}
              >
                <input
                  id={id}
                  type="radio"
                  name="ligne-temps-segment-correct"
                  checked={p.correctLetter === letter}
                  onChange={() => pickLetter(letter as "A" | "B" | "C" | "D")}
                  className="accent-accent mt-1"
                  aria-label={
                    bounds
                      ? NR_LIGNE_TEMPS_BLOC5_SEGMENT_RADIO_ARIA(letter, bounds.start, bounds.end)
                      : letter
                  }
                />
                <span>
                  <span className="font-semibold">{letter}</span>
                  {bounds ? (
                    <>
                      {" "}
                      — {NR_LIGNE_TEMPS_BLOC5_SEGMENT_SUMMARY_PREFIX}
                      {i + 1} : {bounds.start} – {bounds.end}
                    </>
                  ) : null}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <LigneDuTempsFrisePicker payload={p} onPickLetter={pickLetter} />
    </div>
  );
}
