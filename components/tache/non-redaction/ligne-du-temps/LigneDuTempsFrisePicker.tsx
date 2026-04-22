"use client";

import {
  ligneDuTempsBoundariesNumericComplete,
  ligneDuTempsPartialPreviewBoundaries,
  type LigneDuTempsPayload,
} from "@/lib/tache/non-redaction/ligne-du-temps-payload";
import {
  LIGNE_TEMPS_RIBBON_POLYGON_POINTS,
  LIGNE_TEMPS_RIBBON_TEAL_PALE,
  LIGNE_TEMPS_RIBBON_VB_H,
  LIGNE_TEMPS_RIBBON_VB_W,
} from "@/lib/tache/non-redaction/ligne-du-temps-ribbon-layout";
import { cn } from "@/lib/utils/cn";
import {
  NR_LIGNE_TEMPS_BLOC3_FRISE_PREVIEW_HINT,
  NR_LIGNE_TEMPS_BLOC3_FRISE_PREVIEW_LEAD,
  NR_LIGNE_TEMPS_SELECT_CORRECT_HELP,
  NR_LIGNE_TEMPS_SELECT_CORRECT_TITLE,
  NR_LIGNE_TEMPS_TIMELINE_EMPTY,
  NR_LIGNE_TEMPS_TIMELINE_PARTIAL_HINT,
} from "@/lib/ui/ui-copy";
import {
  TimeLine,
  type TimeLineSegmentLetter,
} from "@/components/tache/non-redaction/ligne-du-temps/TimeLine";

type Props = {
  payload: LigneDuTempsPayload;
  onPickLetter: (letter: "A" | "B" | "C" | "D") => void;
  /** Densité réduite dans le sommaire / aperçu étroit. */
  density?: "default" | "compact";
  /** Si false : pas de sélection sur la frise (aperçu Bloc 3). */
  interactive?: boolean;
};

const PREVIEW_LETTERS = ["A", "B", "C", "D"] as const;

export function LigneDuTempsFrisePicker({
  payload,
  onPickLetter,
  density = "default",
  interactive = true,
}: Props) {
  const complete = ligneDuTempsBoundariesNumericComplete(payload);
  const nums: number[] | null = complete
    ? (payload.boundaries.slice(0, payload.segmentCount + 1) as number[])
    : ligneDuTempsPartialPreviewBoundaries(payload);

  const visibleSegCount = nums ? nums.length - 1 : 0;
  const visibleLetters = PREVIEW_LETTERS.slice(0, visibleSegCount);
  const cl = payload.correctLetter;
  const selectedSegment: TimeLineSegmentLetter | null =
    (cl === "A" || cl === "B" || cl === "C" || cl === "D") && visibleLetters.includes(cl)
      ? cl
      : null;

  const compact = density === "compact";

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-semibold text-deep">
          {interactive
            ? NR_LIGNE_TEMPS_SELECT_CORRECT_TITLE
            : NR_LIGNE_TEMPS_BLOC3_FRISE_PREVIEW_LEAD}
        </h3>
      </div>
      {interactive ? (
        <p className="text-xs text-muted">{NR_LIGNE_TEMPS_SELECT_CORRECT_HELP}</p>
      ) : (
        <p className="text-xs text-muted">{NR_LIGNE_TEMPS_BLOC3_FRISE_PREVIEW_HINT}</p>
      )}
      <div
        className={cn(
          "rounded-lg border border-border bg-panel p-3",
          compact && "max-w-full origin-top-left scale-[0.92]",
        )}
      >
        {nums ? (
          <>
            <TimeLine
              dates={nums}
              selectedSegment={selectedSegment}
              onSelect={onPickLetter}
              interactive={interactive}
            />
            {!complete ? (
              <p className="mt-2 text-xs text-muted" role="status">
                {NR_LIGNE_TEMPS_TIMELINE_PARTIAL_HINT}
              </p>
            ) : null}
          </>
        ) : (
          <div className="space-y-3">
            <svg
              className="ligne-temps-ribbon-svg max-w-full"
              viewBox={`0 0 ${LIGNE_TEMPS_RIBBON_VB_W} ${LIGNE_TEMPS_RIBBON_VB_H}`}
              width="100%"
              height={LIGNE_TEMPS_RIBBON_VB_H}
              aria-hidden
            >
              <polygon
                fill={LIGNE_TEMPS_RIBBON_TEAL_PALE}
                points={LIGNE_TEMPS_RIBBON_POLYGON_POINTS}
              />
            </svg>
            <p className="text-sm text-muted" role="status">
              {NR_LIGNE_TEMPS_TIMELINE_EMPTY}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
