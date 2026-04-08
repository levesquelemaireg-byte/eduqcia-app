/**
 * Parcours non rédactionnel — ligne du temps (`comportement_id` 1.2).
 * Copy : `lib/ui/ui-copy.ts` (`NR_LIGNE_TEMPS_*`) ; spec : `docs/wizard-oi-non-redactionnelle.md` parcours 2.
 */

import { NR_ORDRE_STUDENT_SHEET_REPONSE_LABEL } from "@/lib/ui/ui-copy";
import {
  NR_LIGNE_TEMPS_LETTERS_FOUR,
  NR_LIGNE_TEMPS_LETTERS_THREE,
  NR_LIGNE_TEMPS_STUDENT_GUIDAGE,
  NR_LIGNE_TEMPS_STUDENT_SHEET_TIMELINE_ARIA,
} from "@/lib/ui/ui-copy";
import {
  ligneTempsBoundariesStrictlyIncreasing,
  ligneTempsLettersForSegmentCount,
  type LigneDuTempsSegmentCount,
} from "@/lib/tae/non-redaction/ligne-du-temps-model";
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
  ligneDuTempsRibbonClipIdForBoundaries,
  ligneDuTempsRibbonFriseLayoutFromDates,
  ligneDuTempsRibbonSegmentFillU,
} from "@/lib/tae/non-redaction/ligne-du-temps-ribbon-layout";
import { prepareAvantApresConsigneForTeacherDisplay } from "@/lib/tae/non-redaction/avant-apres-payload";
import { prepareOrdreChronologiqueConsigneForTeacherDisplay } from "@/lib/tae/non-redaction/ordre-chronologique-payload";

export type { LigneDuTempsSegmentCount };

export type LigneDuTempsCorrectLetter = "" | "A" | "B" | "C" | "D";

export type LigneDuTempsPayload = {
  /** Discriminant JSON / brouillons. */
  variant?: "ligne-du-temps-v1";
  segmentCount: LigneDuTempsSegmentCount;
  /** Longueur `segmentCount + 1`, bornes strictement croissantes lorsque complètes. */
  boundaries: (number | null)[];
  correctLetter: LigneDuTempsCorrectLetter;
};

export const LIGNE_TEMPS_STUDENT_SHEET_GUIDAGE_ANCHOR =
  "<!--eduqcia:ligne-temps-student-sheet-guidage-anchor-->";

const LIGNE_STUDENT_ROOT_OPEN =
  '<div data-ligne-temps-student="true" class="ligne-temps-student-root">';
const LIGNE_STUDENT_ROOT_CLOSE = "</div>";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function initialLigneDuTempsPayload(): LigneDuTempsPayload {
  return {
    variant: "ligne-du-temps-v1",
    segmentCount: 3,
    boundaries: [null, null, null, null],
    correctLetter: "",
  };
}

function coerceBoundary(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function coerceCorrectLetter(v: unknown): LigneDuTempsCorrectLetter {
  if (v === "A" || v === "B" || v === "C" || v === "D") return v;
  return "";
}

export function normalizeLigneDuTempsPayload(raw: unknown): LigneDuTempsPayload | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const sc = o.segmentCount === 4 ? 4 : o.segmentCount === 3 ? 3 : null;
  if (sc === null) return null;
  const need = sc + 1;
  const bIn = Array.isArray(o.boundaries) ? o.boundaries : [];
  const boundaries: (number | null)[] = [];
  for (let i = 0; i < need; i++) {
    boundaries.push(coerceBoundary(bIn[i]));
  }
  return {
    variant: "ligne-du-temps-v1",
    segmentCount: sc,
    boundaries,
    correctLetter: coerceCorrectLetter(o.correctLetter),
  };
}

export function mergeLigneDuTempsPayload(
  prev: unknown,
  patch: Partial<LigneDuTempsPayload>,
): LigneDuTempsPayload {
  const base = normalizeLigneDuTempsPayload(prev) ?? initialLigneDuTempsPayload();
  const segmentCount = (patch.segmentCount ?? base.segmentCount) as LigneDuTempsSegmentCount;
  const need = segmentCount + 1;
  let boundaries = (patch.boundaries ?? base.boundaries).slice(0, need);
  while (boundaries.length < need) boundaries.push(null);
  if (boundaries.length > need) boundaries = boundaries.slice(0, need);
  return {
    variant: "ligne-du-temps-v1",
    segmentCount,
    boundaries,
    correctLetter: patch.correctLetter ?? base.correctLetter,
  };
}

export function isLigneDuTempsPayload(raw: unknown): boolean {
  return normalizeLigneDuTempsPayload(raw) !== null;
}

export function ligneDuTempsBoundariesNumericComplete(p: LigneDuTempsPayload): boolean {
  const need = p.segmentCount + 1;
  if (p.boundaries.length < need) return false;
  const nums: number[] = [];
  for (let i = 0; i < need; i++) {
    const x = p.boundaries[i];
    if (x === null || x === undefined || !Number.isFinite(x)) return false;
    nums.push(x);
  }
  return ligneTempsBoundariesStrictlyIncreasing(nums);
}

/**
 * Bornes pour l’aperçu wizard : préfixe strictement croissant, s’arrête au premier trou ou à la première incohérence.
 * Dès **deux** dates valides (ex. début + fin de la période 1), la frise affiche au moins le segment A.
 */
export function ligneDuTempsPartialPreviewBoundaries(p: LigneDuTempsPayload): number[] | null {
  const need = p.segmentCount + 1;
  const nums: number[] = [];
  for (let i = 0; i < need; i++) {
    const x = p.boundaries[i];
    if (x === null || x === undefined || !Number.isFinite(x)) break;
    if (nums.length > 0 && x <= nums[nums.length - 1]!) break;
    nums.push(x);
  }
  return nums.length >= 2 ? nums : null;
}

export function isLigneDuTempsCorrectLetterValid(p: LigneDuTempsPayload): boolean {
  const letters = ligneTempsLettersForSegmentCount(p.segmentCount);
  return letters.includes(p.correctLetter);
}

/**
 * Étape 3 wizard : consigne + frise (dates aux séparateurs). Le **segment corrigé** se choisit à l’**étape 5** (`isLigneDuTempsStep5SegmentComplete`).
 */
export function isLigneDuTempsStep3Complete(p: LigneDuTempsPayload): boolean {
  return ligneDuTempsBoundariesNumericComplete(p);
}

/** Étape 5 wizard : lettre du segment correct (corrigé questionnaire). */
export function isLigneDuTempsStep5SegmentComplete(p: LigneDuTempsPayload): boolean {
  return isLigneDuTempsCorrectLetterValid(p);
}

/** Intro HTML — consigne fixe ; `{{doc_A}}` résolu à l’affichage / impression. */
export function buildLigneDuTempsIntroHtml(segmentCount: LigneDuTempsSegmentCount): string {
  const range = segmentCount === 3 ? NR_LIGNE_TEMPS_LETTERS_THREE : NR_LIGNE_TEMPS_LETTERS_FOUR;
  const inner = `Sur la ligne du temps ci-dessous, quelle lettre (${range}) correspond à la période où se situent les faits présentés dans le document {{doc_A}} ?`;
  return `<p class="ligne-temps-student-intro">${inner}</p>`;
}

function buildLigneDuTempsTimelineHtml(
  boundaries: number[],
  segmentCount: LigneDuTempsSegmentCount,
): string {
  const nums = boundaries.slice(0, segmentCount + 1);
  const layout = ligneDuTempsRibbonFriseLayoutFromDates(nums);
  if (!layout) return "";

  const { xs, segments } = layout;
  const clipId = ligneDuTempsRibbonClipIdForBoundaries(nums);
  const half = LIGNE_TEMPS_RIBBON_LETTER_BOX_U / 2;

  const defs = `<defs><clipPath id="${escapeHtml(clipId)}"><polygon points="${LIGNE_TEMPS_RIBBON_POLYGON_POINTS}" /></clipPath></defs>`;
  const polyBg = `<polygon points="${LIGNE_TEMPS_RIBBON_POLYGON_POINTS}" fill="${LIGNE_TEMPS_RIBBON_TEAL_PALE}" />`;

  const segRects: string[] = [];
  segments.forEach((seg, i) => {
    segRects.push(
      `<rect x="${seg.x0}" y="0" width="${seg.x1 - seg.x0}" height="${LIGNE_TEMPS_RIBBON_RIBBON_H}" fill="${ligneDuTempsRibbonSegmentFillU(i)}" />`,
    );
  });

  const friseLines: string[] = [];
  for (let j = 0; j < xs.length; j++) {
    const x = xs[j]!;
    friseLines.push(
      `<line x1="${x}" y1="0" x2="${x}" y2="${LIGNE_TEMPS_RIBBON_RIBBON_H}" stroke="${LIGNE_TEMPS_RIBBON_INK}" stroke-width="1.5" />`,
    );
  }

  const letters: string[] = [];
  for (const seg of segments) {
    const cx = (seg.x0 + seg.x1) / 2;
    const bx = cx - half;
    letters.push(
      `<rect x="${bx}" y="${LIGNE_TEMPS_RIBBON_LETTER_BOX_TOP_U}" width="${LIGNE_TEMPS_RIBBON_LETTER_BOX_U}" height="${LIGNE_TEMPS_RIBBON_LETTER_BOX_U}" rx="0" fill="#ffffff" stroke="${LIGNE_TEMPS_RIBBON_INK}" stroke-width="1" />` +
        `<text x="${cx}" y="${LIGNE_TEMPS_RIBBON_LETTER_TEXT_CENTER_Y}" dominant-baseline="central" text-anchor="middle" fill="${LIGNE_TEMPS_RIBBON_INK}" font-size="${LIGNE_TEMPS_RIBBON_LETTER_FONT_SIZE}" font-weight="700" font-family="var(--font-sans)">${escapeHtml(String(seg.letter))}</text>`,
    );
  }

  const clippedMain = `<g clip-path="url(#${escapeHtml(clipId)})">${segRects.join("")}${friseLines.join("")}${letters.join("")}</g>`;

  const connectors: string[] = [];
  for (let j = 0; j < nums.length; j++) {
    const x = xs[j]!;
    connectors.push(
      `<line x1="${x}" y1="${LIGNE_TEMPS_RIBBON_RIBBON_H}" x2="${x}" y2="${String(LIGNE_TEMPS_RIBBON_CONNECTOR_Y2)}" stroke="${LIGNE_TEMPS_RIBBON_INK}" stroke-width="1" />`,
    );
  }

  const dateTexts: string[] = [];
  for (let j = 0; j < nums.length; j++) {
    const x = xs[j]!;
    dateTexts.push(
      `<text x="${x}" y="${String(LIGNE_TEMPS_RIBBON_DATE_TEXT_Y)}" dominant-baseline="middle" text-anchor="middle" fill="#444444" font-size="${LIGNE_TEMPS_RIBBON_DATE_FONT_SIZE}" font-weight="${LIGNE_TEMPS_RIBBON_DATE_FONT_WEIGHT}" font-family="var(--font-sans)">${escapeHtml(String(nums[j]))}</text>`,
    );
  }

  const svgInner = `${defs}${polyBg}${clippedMain}${connectors.join("")}${dateTexts.join("")}`;
  const svg = `<svg class="ligne-temps-ribbon-svg" viewBox="0 0 ${LIGNE_TEMPS_RIBBON_VB_W} ${LIGNE_TEMPS_RIBBON_VB_H}" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">${svgInner}</svg>`;

  return `<div class="ligne-temps-frise" role="group" aria-label="${escapeHtml(NR_LIGNE_TEMPS_STUDENT_SHEET_TIMELINE_ARIA)}">${svg}</div>`;
}

export function buildLigneDuTempsStudentReponseHtml(): string {
  return `<div class="ligne-temps-student-reponse"><span class="ligne-temps-student-reponse-label">${escapeHtml(NR_ORDRE_STUDENT_SHEET_REPONSE_LABEL)}</span><span class="ligne-temps-student-reponse-box" aria-hidden="true"></span></div>`;
}

export function buildLigneDuTempsConsigneHtml(p: LigneDuTempsPayload): string {
  if (!ligneDuTempsBoundariesNumericComplete(p)) return "";
  const nums = p.boundaries.slice(0, p.segmentCount + 1) as number[];
  const intro = buildLigneDuTempsIntroHtml(p.segmentCount);
  const frise = buildLigneDuTempsTimelineHtml(nums, p.segmentCount);
  const reponse = buildLigneDuTempsStudentReponseHtml();
  return `${LIGNE_STUDENT_ROOT_OPEN}${intro}${LIGNE_TEMPS_STUDENT_SHEET_GUIDAGE_ANCHOR}${frise}${reponse}${LIGNE_STUDENT_ROOT_CLOSE}`;
}

export function buildLigneDuTempsCorrigeText(p: LigneDuTempsPayload): string {
  if (!isLigneDuTempsCorrectLetterValid(p)) return "";
  return `Réponse attendue : ${p.correctLetter}.`;
}

export function buildLigneDuTempsCorrigeHtml(p: LigneDuTempsPayload): string {
  const t = buildLigneDuTempsCorrigeText(p);
  return t ? `<p>${escapeHtml(t)}</p>` : "";
}

export function buildLigneDuTempsGuidageHtml(): string {
  return `<p>${escapeHtml(NR_LIGNE_TEMPS_STUDENT_GUIDAGE)}</p>`;
}

/**
 * Découpe pour impression élève (guidage entre intro et frise). Deux racines fermées pour `PrintableHtml`.
 */
export function parseLigneDuTempsConsigneForStudentPrint(
  consigne: string,
): { beforeGuidage: string; afterGuidage: string } | null {
  const t = consigne.trim();
  if (!t.includes(LIGNE_TEMPS_STUDENT_SHEET_GUIDAGE_ANCHOR)) return null;
  if (!t.startsWith(LIGNE_STUDENT_ROOT_OPEN) || !t.endsWith(LIGNE_STUDENT_ROOT_CLOSE)) return null;
  const inner = t.slice(LIGNE_STUDENT_ROOT_OPEN.length, t.length - LIGNE_STUDENT_ROOT_CLOSE.length);
  const idx = inner.indexOf(LIGNE_TEMPS_STUDENT_SHEET_GUIDAGE_ANCHOR);
  if (idx === -1) return null;
  const introBit = inner.slice(0, idx);
  const rest = inner.slice(idx + LIGNE_TEMPS_STUDENT_SHEET_GUIDAGE_ANCHOR.length);
  return {
    beforeGuidage: `${LIGNE_STUDENT_ROOT_OPEN}${introBit}${LIGNE_STUDENT_ROOT_CLOSE}`,
    afterGuidage: `${LIGNE_STUDENT_ROOT_OPEN}${rest}${LIGNE_STUDENT_ROOT_CLOSE}`,
  };
}

export function stripLigneDuTempsStudentSheetGuidageAnchorForDisplay(consigne: string): string {
  return consigne.split(LIGNE_TEMPS_STUDENT_SHEET_GUIDAGE_ANCHOR).join("");
}

export function stripLigneDuTempsStudentSheetResponseBlockForDisplay(consigne: string): string {
  return consigne.replace(/<div class="ligne-temps-student-reponse"[^>]*>[\s\S]*?<\/div>/, "");
}

export function prepareLigneDuTempsConsigneForTeacherDisplay(consigne: string): string {
  return stripLigneDuTempsStudentSheetResponseBlockForDisplay(
    stripLigneDuTempsStudentSheetGuidageAnchorForDisplay(consigne),
  );
}

/** Chaîne affichée fiche / sommaire : applique ordre puis ligne du temps puis avant / après. */
export function prepareNonRedactionConsigneForTeacherDisplay(consigne: string): string {
  return prepareAvantApresConsigneForTeacherDisplay(
    prepareLigneDuTempsConsigneForTeacherDisplay(
      prepareOrdreChronologiqueConsigneForTeacherDisplay(consigne),
    ),
  );
}
