"use client";

import { useId, useMemo } from "react";
import {
  LIGNE_TEMPS_RIBBON_CONNECTOR_Y2,
  LIGNE_TEMPS_RIBBON_DATE_FONT_SIZE,
  LIGNE_TEMPS_RIBBON_DATE_FONT_WEIGHT,
  LIGNE_TEMPS_RIBBON_DATE_TEXT_Y,
  LIGNE_TEMPS_RIBBON_INK,
  LIGNE_TEMPS_RIBBON_LETTER_BOX_TOP_U,
  LIGNE_TEMPS_RIBBON_LETTER_BOX_U,
  LIGNE_TEMPS_RIBBON_LETTER_FONT_SIZE,
  LIGNE_TEMPS_RIBBON_LETTER_TEXT_CENTER_Y,
  LIGNE_TEMPS_RIBBON_POLYGON_POINTS,
  LIGNE_TEMPS_RIBBON_RIBBON_H,
  LIGNE_TEMPS_RIBBON_TEAL_PALE,
  LIGNE_TEMPS_RIBBON_VB_H,
  LIGNE_TEMPS_RIBBON_VB_W,
  ligneDuTempsRibbonFriseLayoutFromDates,
  ligneDuTempsRibbonSegmentFillU,
} from "@/lib/tae/non-redaction/ligne-du-temps-ribbon-layout";
import { cn } from "@/lib/utils/cn";

export type TimeLineSegmentLetter = "A" | "B" | "C" | "D";

type Props = {
  dates: number[];
  selectedSegment: TimeLineSegmentLetter | null;
  onSelect: (letter: TimeLineSegmentLetter) => void;
  /** Si false : frise en lecture seule (aperçu Bloc 3). */
  interactive?: boolean;
};

export function TimeLine({ dates, selectedSegment, onSelect, interactive = true }: Props) {
  const layout = useMemo(() => ligneDuTempsRibbonFriseLayoutFromDates(dates), [dates]);
  const rawId = useId();
  const clipId = `lt-clip-${rawId.replace(/:/g, "")}`;

  if (!layout) return null;

  const { xs, segments } = layout;
  const letterHalf = LIGNE_TEMPS_RIBBON_LETTER_BOX_U / 2;

  return (
    <svg
      className="ligne-temps-ribbon-svg max-w-full"
      viewBox={`0 0 ${LIGNE_TEMPS_RIBBON_VB_W} ${LIGNE_TEMPS_RIBBON_VB_H}`}
      width="100%"
      height="auto"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-hidden
    >
      <defs>
        <clipPath id={clipId}>
          <polygon points={LIGNE_TEMPS_RIBBON_POLYGON_POINTS} />
        </clipPath>
      </defs>

      <polygon points={LIGNE_TEMPS_RIBBON_POLYGON_POINTS} fill={LIGNE_TEMPS_RIBBON_TEAL_PALE} />

      <g clipPath={`url(#${clipId})`}>
        {segments.map((seg, i) => {
          const isSegSelected = selectedSegment === seg.letter;
          return (
            <rect
              key={`seg-${seg.letter}`}
              x={seg.x0}
              y={0}
              width={seg.x1 - seg.x0}
              height={LIGNE_TEMPS_RIBBON_RIBBON_H}
              fill={
                isSegSelected
                  ? "var(--color-background-success)"
                  : ligneDuTempsRibbonSegmentFillU(i)
              }
            />
          );
        })}
        {xs.map((x, j) => (
          <line
            key={`frise-${j}`}
            x1={x}
            y1={0}
            x2={x}
            y2={LIGNE_TEMPS_RIBBON_RIBBON_H}
            stroke={LIGNE_TEMPS_RIBBON_INK}
            strokeWidth={1.5}
          />
        ))}
        {segments.map((seg) => {
          const cx = (seg.x0 + seg.x1) / 2;
          const bx = cx - letterHalf;
          const isSel = selectedSegment === seg.letter;
          return (
            <g key={`letter-${seg.letter}`}>
              <rect
                x={bx}
                y={LIGNE_TEMPS_RIBBON_LETTER_BOX_TOP_U}
                width={LIGNE_TEMPS_RIBBON_LETTER_BOX_U}
                height={LIGNE_TEMPS_RIBBON_LETTER_BOX_U}
                rx={0}
                fill="#ffffff"
                stroke={isSel ? undefined : LIGNE_TEMPS_RIBBON_INK}
                strokeWidth={isSel ? undefined : 1}
                className={cn(isSel && "ligne-temps-ribbon-letter-selected")}
              />
              <text
                x={cx}
                y={LIGNE_TEMPS_RIBBON_LETTER_TEXT_CENTER_Y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={LIGNE_TEMPS_RIBBON_INK}
                fontSize={LIGNE_TEMPS_RIBBON_LETTER_FONT_SIZE}
                fontWeight={700}
                fontFamily="var(--font-sans)"
                pointerEvents="none"
              >
                {seg.letter}
              </text>
            </g>
          );
        })}
      </g>

      {xs.map((x, j) => (
        <line
          key={`conn-${j}`}
          x1={x}
          y1={LIGNE_TEMPS_RIBBON_RIBBON_H}
          x2={x}
          y2={LIGNE_TEMPS_RIBBON_CONNECTOR_Y2}
          stroke={LIGNE_TEMPS_RIBBON_INK}
          strokeWidth={1}
        />
      ))}

      {dates.map((d, j) => (
        <text
          key={`date-${j}`}
          x={xs[j]!}
          y={LIGNE_TEMPS_RIBBON_DATE_TEXT_Y}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#444444"
          fontSize={LIGNE_TEMPS_RIBBON_DATE_FONT_SIZE}
          fontWeight={LIGNE_TEMPS_RIBBON_DATE_FONT_WEIGHT}
          fontFamily="var(--font-sans)"
        >
          {d}
        </text>
      ))}

      {interactive ? (
        <g clipPath={`url(#${clipId})`}>
          {segments.map((seg) => (
            <rect
              key={`hit-${seg.letter}`}
              x={seg.x0}
              y={0}
              width={seg.x1 - seg.x0}
              height={LIGNE_TEMPS_RIBBON_RIBBON_H}
              fill="transparent"
              className="ligne-temps-ribbon-hit"
              role="button"
              tabIndex={0}
              aria-pressed={selectedSegment === seg.letter}
              aria-label={`Sélectionner la période ${seg.letter}`}
              onClick={() => onSelect(seg.letter as TimeLineSegmentLetter)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(seg.letter as TimeLineSegmentLetter);
                }
              }}
            />
          ))}
        </g>
      ) : null}
    </svg>
  );
}
