/**
 * Parcours non rédactionnel — ordre chronologique (`comportement_id` 1.1).
 * Copy UI : `lib/ui/ui-copy.ts` (`NR_ORDRE_*`) ; spec : `docs/wizard-oi-non-redactionnelle.md`.
 * Options A–D : permutations structurées (4 chiffres 1–4 sans doublon), pas de saisie texte libre.
 */

import {
  NR_ORDRE_PUBLISHED_INTRO_DOC_PLACEHOLDERS,
  NR_ORDRE_PUBLISHED_INTRO_LES_DOCUMENTS,
  NR_ORDRE_PUBLISHED_INTRO_PORTENT_SUR,
  NR_ORDRE_PUBLISHED_INTRO_SUFFIX,
  NR_ORDRE_STUDENT_GUIDAGE,
  NR_ORDRE_STUDENT_SHEET_OPTIONS_GROUP_ARIA,
  NR_ORDRE_STUDENT_SHEET_REPONSE_LABEL,
  NR_ORDRE_WIZARD_DOC_TOKEN_PREFIX,
} from "@/lib/ui/ui-copy";
import {
  areFourDistinctPermutations,
  coerceOrdreDigitCell,
  emptyOrdreOptionRow,
  isCompleteOrdrePermutation,
  parseLegacyOptionString,
  type OrdreOptionRow,
  type OrdrePermutation,
} from "@/lib/tae/non-redaction/ordre-chronologique-permutations";
import {
  computeSlotStatus,
  getSlotData,
  isPublicHttpUrl,
  type DocumentSlotData,
} from "@/lib/tae/document-helpers";
import type { DocumentSlotId } from "@/lib/tae/blueprint-helpers";

/**
 * Ancre HTML (commentaire) entre l’intro et la grille sur la feuille élève.
 * Retirée à l’affichage FicheTache / sommaire ; sert à composer intro → guidage → options à l’impression
 * à partir de `tae.guidage` (masquage sommatif futur sans parser le HTML publié).
 */
export const ORDRE_CHRONO_STUDENT_SHEET_GUIDAGE_ANCHOR =
  "<!--eduqcia:ordre-chrono-student-sheet-guidage-anchor-->";

const ORDRE_STUDENT_ROOT_OPEN =
  '<div data-ordre-chrono-student="true" class="ordre-chrono-student-root">';
const ORDRE_STUDENT_ROOT_CLOSE = "</div>";

/**
 * Découpe `tae.consigne` pour insérer le guidage entre intro et grille ; `null` si ancre absente (brouillon legacy avec guidage intégré, etc.).
 * Chaque segment est une racine `data-ordre-chrono-student` **fermée** : plusieurs `PrintableHtml` consécutifs conservent les styles impression (`app/globals.css`).
 */
export function parseOrdreChronologiqueConsigneForStudentPrint(
  consigne: string,
): { beforeGuidage: string; afterGuidage: string } | null {
  const t = consigne.trim();
  if (!t.includes(ORDRE_CHRONO_STUDENT_SHEET_GUIDAGE_ANCHOR)) return null;
  if (!t.startsWith(ORDRE_STUDENT_ROOT_OPEN) || !t.endsWith(ORDRE_STUDENT_ROOT_CLOSE)) return null;
  const inner = t.slice(ORDRE_STUDENT_ROOT_OPEN.length, t.length - ORDRE_STUDENT_ROOT_CLOSE.length);
  const idx = inner.indexOf(ORDRE_CHRONO_STUDENT_SHEET_GUIDAGE_ANCHOR);
  if (idx === -1) return null;
  const introBit = inner.slice(0, idx);
  const taskBit = inner.slice(idx + ORDRE_CHRONO_STUDENT_SHEET_GUIDAGE_ANCHOR.length);
  return {
    beforeGuidage: `${ORDRE_STUDENT_ROOT_OPEN}${introBit}${ORDRE_STUDENT_ROOT_CLOSE}`,
    afterGuidage: `${ORDRE_STUDENT_ROOT_OPEN}${taskBit}${ORDRE_STUDENT_ROOT_CLOSE}`,
  };
}

/** FicheTache / sommaire : intro et grille contigus (sans trou visuel). */
export function stripOrdreChronologiqueStudentSheetGuidageAnchorForDisplay(
  consigne: string,
): string {
  return consigne.split(ORDRE_CHRONO_STUDENT_SHEET_GUIDAGE_ANCHOR).join("");
}

/** Enseignant / sommaire : masquer la zone « Réponse : » + case (réservée à la feuille élève imprimée). */
export function stripOrdreChronologiqueStudentSheetResponseBlockForDisplay(
  consigne: string,
): string {
  return consigne.replace(/<div class="ordre-chrono-student-reponse"[^>]*>[\s\S]*?<\/div>/, "");
}

/** Consigne ordre chrono affichée côté enseignant (fiche, sommaire) : sans ancre ni bloc réponse élève. */
export function prepareOrdreChronologiqueConsigneForTeacherDisplay(consigne: string): string {
  return stripOrdreChronologiqueStudentSheetResponseBlockForDisplay(
    stripOrdreChronologiqueStudentSheetGuidageAnchorForDisplay(consigne),
  );
}

/** Longueur max du thème (zone éditable ministérielle). */
export const ORDRE_CONSIGNE_THEME_MAX_LEN = 80;
/** Seuil d’avertissement compteur (aperçu wizard). */
export const ORDRE_CONSIGNE_THEME_WARN_LEN = 65;

export type OrdreChronologiquePayload = {
  /** Réalité sociale ou thème — seule partie saisie ; la phrase complète est reconstruite à la publication avec `{{doc_*}}`. */
  consigneTheme: string;
  optionA: OrdreOptionRow;
  optionB: OrdreOptionRow;
  optionC: OrdreOptionRow;
  optionD: OrdreOptionRow;
  correctLetter: "" | "A" | "B" | "C" | "D";
};

export type { OrdreOptionRow, OrdrePermutation };

function coerceOptionRowField(v: unknown): OrdreOptionRow {
  if (Array.isArray(v) && v.length === 4) {
    return [
      coerceOrdreDigitCell(v[0]),
      coerceOrdreDigitCell(v[1]),
      coerceOrdreDigitCell(v[2]),
      coerceOrdreDigitCell(v[3]),
    ];
  }
  if (typeof v === "string") return parseLegacyOptionString(v);
  return emptyOrdreOptionRow();
}

function coerceCorrectLetter(v: unknown): OrdreChronologiquePayload["correctLetter"] {
  if (v === "A" || v === "B" || v === "C" || v === "D") return v;
  return "";
}

/**
 * Libellé du jeton « documents » dans le wizard (tâche seule : plage 1–N).
 * Ne pas utiliser dans le HTML publié — utiliser `{{doc_A}}`…`{{doc_D}}`.
 */
export function formatOrdreWizardDocTokenLabel(docCount: number): string {
  const prefix = NR_ORDRE_WIZARD_DOC_TOKEN_PREFIX;
  if (docCount < 1) return prefix;
  if (docCount === 1) return `${prefix} 1`;
  return `${prefix} 1–${docCount}`;
}

/** Liste « 1 », « 1 et 2 », « 1, 2, 3 et 4 » pour aperçu wizard (tâche seule). */
export function formatFrenchDocNumbersForWizardPreview(n: number): string {
  const c = Math.min(Math.max(n, 0), 4);
  if (c <= 0) return "";
  if (c === 1) return "1";
  const nums = Array.from({ length: c }, (_, i) => String(i + 1));
  if (c === 2) return `${nums[0]} et ${nums[1]}`;
  return `${nums.slice(0, -1).join(", ")} et ${nums[c - 1]!}`;
}

/** Normalise un payload brut (brouillon ancien avec `option*` en string, `consigneText` sans `consigneTheme`, etc.). */
export function normalizeOrdreChronologiquePayload(raw: unknown): OrdreChronologiquePayload | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  let consigneTheme: string | null = null;
  if (typeof o.consigneTheme === "string") {
    consigneTheme = o.consigneTheme;
  } else if (typeof o.consigneText === "string") {
    consigneTheme = "";
  }
  if (consigneTheme === null) return null;
  return {
    consigneTheme,
    optionA: coerceOptionRowField(o.optionA),
    optionB: coerceOptionRowField(o.optionB),
    optionC: coerceOptionRowField(o.optionC),
    optionD: coerceOptionRowField(o.optionD),
    correctLetter: coerceCorrectLetter(o.correctLetter),
  };
}

export function initialOrdreChronologiquePayload(): OrdreChronologiquePayload {
  const empty = emptyOrdreOptionRow();
  return {
    consigneTheme: "",
    optionA: empty,
    optionB: empty,
    optionC: empty,
    optionD: empty,
    correctLetter: "",
  };
}

/** Vide les options A–D et la lettre du corrigé (générateur : reset, dirty, échec défensif). */
export function clearedOrdreOptionsPatch(): Pick<
  OrdreChronologiquePayload,
  "optionA" | "optionB" | "optionC" | "optionD" | "correctLetter"
> {
  const empty = emptyOrdreOptionRow();
  return {
    optionA: empty,
    optionB: empty,
    optionC: empty,
    optionD: empty,
    correctLetter: "",
  };
}

/** Vrai si le brut peut être normalisé en payload ordre chrono (y compris brouillon legacy `option*` en string). */
export function isOrdreChronologiquePayload(raw: unknown): boolean {
  return normalizeOrdreChronologiquePayload(raw) !== null;
}

export function getOrdreOptionRowForLetter(
  p: Pick<OrdreChronologiquePayload, "optionA" | "optionB" | "optionC" | "optionD">,
  letter: "A" | "B" | "C" | "D",
): OrdreOptionRow {
  switch (letter) {
    case "A":
      return p.optionA;
    case "B":
      return p.optionB;
    case "C":
      return p.optionC;
    default:
      return p.optionD;
  }
}

/** Permutation associée à la lettre du corrigé — `null` si options incomplètes ou lettre absente. */
export function ordreChronologiqueCorrectPermutation(
  p: OrdreChronologiquePayload,
): OrdrePermutation | null {
  const letter = p.correctLetter;
  if (letter !== "A" && letter !== "B" && letter !== "C" && letter !== "D") return null;
  const row = getOrdreOptionRowForLetter(p, letter);
  return isCompleteOrdrePermutation(row) ? row : null;
}

export function mergeOrdreChronologiquePayload(
  prev: unknown,
  patch: Partial<OrdreChronologiquePayload>,
): OrdreChronologiquePayload {
  const base = normalizeOrdreChronologiquePayload(prev) ?? initialOrdreChronologiquePayload();
  return {
    consigneTheme: patch.consigneTheme ?? base.consigneTheme,
    optionA: patch.optionA ?? base.optionA,
    optionB: patch.optionB ?? base.optionB,
    optionC: patch.optionC ?? base.optionC,
    optionD: patch.optionD ?? base.optionD,
    correctLetter: patch.correctLetter ?? base.correctLetter,
  };
}

function nonEmpty(s: string): boolean {
  return s.trim().length > 0;
}

/** Options A–D + lettre du corrigé complètes et valides (sans exiger la consigne). Utile pour l’hydratation du générateur de suites. */
export function hasCompleteOrdreOptionsOnly(
  p: Pick<
    OrdreChronologiquePayload,
    "optionA" | "optionB" | "optionC" | "optionD" | "correctLetter"
  >,
): boolean {
  const rows = [p.optionA, p.optionB, p.optionC, p.optionD];
  const perms: OrdrePermutation[] = [];
  for (const r of rows) {
    if (!isCompleteOrdrePermutation(r)) return false;
    perms.push(r);
  }
  if (!areFourDistinctPermutations(perms[0]!, perms[1]!, perms[2]!, perms[3]!)) return false;
  return (
    p.correctLetter === "A" ||
    p.correctLetter === "B" ||
    p.correctLetter === "C" ||
    p.correctLetter === "D"
  );
}

export function isOrdreChronologiqueStep3Complete(p: OrdreChronologiquePayload): boolean {
  if (!nonEmpty(p.consigneTheme)) return false;
  return hasCompleteOrdreOptionsOnly(p);
}

export function isOrdreChronologiqueSlotComplete(slot: DocumentSlotData): boolean {
  return computeSlotStatus(slot) === "complete";
}

export function isOrdreChronologiqueDocumentsStepComplete(
  documentSlots: { slotId: DocumentSlotId }[],
  documents: Partial<Record<DocumentSlotId, DocumentSlotData>>,
): boolean {
  if (documentSlots.length === 0) return true;
  for (const { slotId } of documentSlots) {
    if (!isOrdreChronologiqueSlotComplete(getSlotData(documents, slotId))) return false;
  }
  return true;
}

export function isOrdreChronologiqueDocumentsPublishable(
  documentSlots: { slotId: DocumentSlotId }[],
  documents: Partial<Record<DocumentSlotId, DocumentSlotData>>,
): boolean {
  if (!isOrdreChronologiqueDocumentsStepComplete(documentSlots, documents)) return false;
  for (const { slotId } of documentSlots) {
    const slot = getSlotData(documents, slotId);
    if (slot.mode !== "create" || slot.type !== "iconographique") continue;
    if (!isPublicHttpUrl(slot.imageUrl)) return false;
  }
  return true;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function ordreStudentDigitCellsHtml(row: OrdreOptionRow): string {
  const parts: string[] = [];
  for (let i = 0; i < 4; i++) {
    if (i > 0) {
      parts.push('<span class="ordre-chrono-student-sep">–</span>');
    }
    const d = row[i];
    const inner = d === null ? "&#160;" : escapeHtml(String(d));
    parts.push(`<span class="ordre-chrono-student-digit">${inner}</span>`);
  }
  return parts.join("");
}

function ordreStudentOptionRowHtml(letter: string, row: OrdreOptionRow): string {
  return `<div class="ordre-chrono-student-option"><span class="ordre-chrono-student-letter-label"><strong>${escapeHtml(letter)})</strong></span><span class="ordre-chrono-student-seq">${ordreStudentDigitCellsHtml(row)}</span></div>`;
}

/** Phrase d’intro feuille élève avec jetons `{{doc_*}}` (réécrits à l’impression épreuve). */
export function buildOrdreChronologiqueIntroHtml(themeTrimmed: string): string {
  const inner =
    NR_ORDRE_PUBLISHED_INTRO_LES_DOCUMENTS +
    NR_ORDRE_PUBLISHED_INTRO_DOC_PLACEHOLDERS +
    NR_ORDRE_PUBLISHED_INTRO_PORTENT_SUR +
    escapeHtml(themeTrimmed) +
    NR_ORDRE_PUBLISHED_INTRO_SUFFIX;
  return `<p class="ordre-chrono-student-intro">${inner}</p>`;
}

/**
 * HTML stocké en `tae.consigne` — intro, ancre (`ORDRE_CHRONO_STUDENT_SHEET_GUIDAGE_ANCHOR`), grille 2×2 (A–D), zone « Réponse : ».
 * Le texte de guidage élève est dans `tae.guidage` (`buildOrdreChronologiqueGuidageHtml`) ; l’impression compose l’ordre intro → guidage → options.
 */
export function buildOrdreChronologiqueConsigneHtml(p: OrdreChronologiquePayload): string {
  const intro = buildOrdreChronologiqueIntroHtml(p.consigneTheme.trim());
  const grid = `<div class="ordre-chrono-student-grid" role="group" aria-label="${escapeHtml(NR_ORDRE_STUDENT_SHEET_OPTIONS_GROUP_ARIA)}">${ordreStudentOptionRowHtml("A", p.optionA)}${ordreStudentOptionRowHtml("B", p.optionB)}${ordreStudentOptionRowHtml("C", p.optionC)}${ordreStudentOptionRowHtml("D", p.optionD)}</div>`;
  const reponse = `<div class="ordre-chrono-student-reponse"><span class="ordre-chrono-student-reponse-label">${escapeHtml(NR_ORDRE_STUDENT_SHEET_REPONSE_LABEL)}</span><span class="ordre-chrono-student-reponse-box" aria-hidden="true"></span></div>`;
  return `<div data-ordre-chrono-student="true" class="ordre-chrono-student-root">${intro}${ORDRE_CHRONO_STUDENT_SHEET_GUIDAGE_ANCHOR}${grid}${reponse}</div>`;
}

/** Texte enseignant — `tae.corrige`. */
export function buildOrdreChronologiqueCorrigeText(p: OrdreChronologiquePayload): string {
  return `Réponse attendue : ${p.correctLetter}.`;
}

/** HTML sommaire / RPC — `tae.corrige`. */
export function buildOrdreChronologiqueCorrigeHtml(p: OrdreChronologiquePayload): string {
  if (
    p.correctLetter !== "A" &&
    p.correctLetter !== "B" &&
    p.correctLetter !== "C" &&
    p.correctLetter !== "D"
  ) {
    return "";
  }
  return `<p>${escapeHtml(buildOrdreChronologiqueCorrigeText(p))}</p>`;
}

/** HTML — `tae.guidage` : guidage **élève**, fixe (non modifiable par l’enseignant). */
export function buildOrdreChronologiqueGuidageHtml(): string {
  return `<p>${escapeHtml(NR_ORDRE_STUDENT_GUIDAGE)}</p>`;
}
