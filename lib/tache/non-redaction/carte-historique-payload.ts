/**
 * Parcours non rédactionnel — carte historique (OI2, comportements 2.1 / 2.2 / 2.3).
 * Copy UI : `lib/ui/copy/non-redaction.ts` (`NR_CARTE_*`).
 *
 * Le payload est aplati (pas de discriminé TS sur `comportementId`) — les fonctions
 * de gate / publication consultent `comportementId` puis valident les seuls champs
 * pertinents pour le comportement actif.
 */

import { z } from "zod";
import {
  isCarteHistoriqueChiffre,
  type CarteHistoriqueChiffre,
  type CarteHistoriquePair,
} from "@/lib/tache/non-redaction/carte-historique-helpers";
import {
  computeSlotStatus,
  getSlotData,
  isPublicHttpUrl,
  type DocumentSlotData,
} from "@/lib/tache/document-helpers";
import type { DocumentSlotId } from "@/lib/tache/blueprint-helpers";
import {
  NR_CARTE_21_QUESTION_PREFIX,
  NR_CARTE_21_QUESTION_SUFFIX,
  NR_CARTE_22_CORRIGE_JUSTIFICATION,
  NR_CARTE_22_QUESTION,
  NR_CARTE_22_TABLE_OPTIONS_GROUP_ARIA,
  NR_CARTE_23_CORRIGE_TEMPLATE,
  NR_CARTE_23_ITEM_PREFIX,
  NR_CARTE_23_ITEM_SUFFIX,
  NR_CARTE_23_QUESTION_LEAD,
  NR_CARTE_CORRIGE_REPONSE_PREFIX,
  NR_CARTE_PUBLISHED_INTRO_DOC_PLACEHOLDER,
  NR_CARTE_PUBLISHED_INTRO_PREFIX,
  NR_CARTE_PUBLISHED_INTRO_SUFFIX,
  NR_CARTE_STUDENT_SHEET_REPONSE_LABEL,
} from "@/lib/ui/ui-copy";

export type CarteHistoriqueComportementId = "2.1" | "2.2" | "2.3";
export type CarteHistoriqueLetter = "A" | "B" | "C" | "D";
export type CarteHistoriqueLetterOrEmpty = CarteHistoriqueLetter | "";

/**
 * Longueurs max / seuils d'avertissement par comportement pour les zones éditables
 * de la consigne (utilisé par `LimitCounterPill` dans le template Bloc 3).
 */
export const CARTE_ELEMENT_LIMITS: Record<
  CarteHistoriqueComportementId,
  { max: number; warn: number }
> = {
  "2.1": { max: 120, warn: 100 },
  "2.2": { max: 60, warn: 50 },
  "2.3": { max: 80, warn: 65 },
};

/** Outils d'évaluation alternatifs pour le comportement 2.1 (1pt / 2pts). */
export const CARTE_21_OUTIL_EVALUATION_2PTS = "OI2_SO1";
export const CARTE_21_OUTIL_EVALUATION_1PT = "OI2_SO1_1PT";

export type Carte21Ponderation = "2pts" | "1pt";

export function ponderationFromOutilEvaluation(outilEvaluation: string | null): Carte21Ponderation {
  return outilEvaluation === CARTE_21_OUTIL_EVALUATION_1PT ? "1pt" : "2pts";
}

export function outilEvaluationFromPonderation(p: Carte21Ponderation): string {
  return p === "1pt" ? CARTE_21_OUTIL_EVALUATION_1PT : CARTE_21_OUTIL_EVALUATION_2PTS;
}

const comportementIdZ = z.enum(["2.1", "2.2", "2.3"]);
const letterOrEmptyZ = z.enum(["A", "B", "C", "D", ""]);
const chiffreZ = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]);
const pairZ = z.tuple([chiffreZ, chiffreZ]);

export const carteHistoriquePayloadZodSchema = z
  .object({
    schemaVersion: z.literal(1).optional().default(1),
    comportementId: comportementIdZ,
    consigneElement1: z.string(),
    consigneElement2: z.string(),
    correctLetter: letterOrEmptyZ,
    correctChiffre1: chiffreZ.nullable(),
    correctChiffre2: chiffreZ.nullable(),
    optionA: pairZ.nullable(),
    optionB: pairZ.nullable(),
    optionC: pairZ.nullable(),
    optionD: pairZ.nullable(),
    generated22: z.boolean(),
    correctLetter1: letterOrEmptyZ,
    correctLetter2: letterOrEmptyZ,
  })
  .superRefine((d, ctx) => {
    if (d.comportementId === "2.2" && d.generated22) {
      const opts = [d.optionA, d.optionB, d.optionC, d.optionD];
      if (opts.some((o) => o === null)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "options A–D requises lorsque generated22 est vrai",
          path: ["optionA"],
        });
      }
    }
  });

export type CarteHistoriquePayload = {
  schemaVersion: 1;
  comportementId: CarteHistoriqueComportementId;
  consigneElement1: string;
  consigneElement2: string;
  /** Lettre du corrigé pour 2.1 et 2.2. */
  correctLetter: CarteHistoriqueLetterOrEmpty;
  /** 2.2 : chiffre (1–4) associé à l'élément 1 (saisi avant génération). */
  correctChiffre1: CarteHistoriqueChiffre | null;
  /** 2.2 : chiffre (1–4) associé à l'élément 2. */
  correctChiffre2: CarteHistoriqueChiffre | null;
  /** 2.2 : paires A–D générées (mélange aléatoire). */
  optionA: CarteHistoriquePair | null;
  optionB: CarteHistoriquePair | null;
  optionC: CarteHistoriquePair | null;
  optionD: CarteHistoriquePair | null;
  /** 2.2 : flag de génération réussie. */
  generated22: boolean;
  /** 2.3 : réponse pour le lieu 1. */
  correctLetter1: CarteHistoriqueLetterOrEmpty;
  /** 2.3 : réponse pour le lieu 2. */
  correctLetter2: CarteHistoriqueLetterOrEmpty;
};

export type { CarteHistoriqueChiffre, CarteHistoriquePair };

export function isCarteHistoriqueComportementId(v: unknown): v is CarteHistoriqueComportementId {
  return v === "2.1" || v === "2.2" || v === "2.3";
}

export function isCarteHistoriqueLetter(v: unknown): v is CarteHistoriqueLetter {
  return v === "A" || v === "B" || v === "C" || v === "D";
}

function coerceLetter(v: unknown): CarteHistoriqueLetterOrEmpty {
  if (v === "A" || v === "B" || v === "C" || v === "D" || v === "") return v;
  return "";
}

function coerceChiffre(v: unknown): CarteHistoriqueChiffre | null {
  return isCarteHistoriqueChiffre(v) ? v : null;
}

function coercePair(v: unknown): CarteHistoriquePair | null {
  if (!Array.isArray(v) || v.length !== 2) return null;
  const a = coerceChiffre(v[0]);
  const b = coerceChiffre(v[1]);
  if (a === null || b === null) return null;
  return [a, b] as const;
}

/** Normalise un payload brut (brouillon sessionStorage / colonne JSONB). Retourne `null` si invalide. */
export function normalizeCarteHistoriquePayload(raw: unknown): CarteHistoriquePayload | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if ("schemaVersion" in o) {
    const sv = o.schemaVersion;
    if (typeof sv === "number" && sv !== 1) return null;
  }
  if (!isCarteHistoriqueComportementId(o.comportementId)) return null;
  const candidate = {
    schemaVersion: 1,
    comportementId: o.comportementId,
    consigneElement1: typeof o.consigneElement1 === "string" ? o.consigneElement1 : "",
    consigneElement2: typeof o.consigneElement2 === "string" ? o.consigneElement2 : "",
    correctLetter: coerceLetter(o.correctLetter),
    correctChiffre1: coerceChiffre(o.correctChiffre1),
    correctChiffre2: coerceChiffre(o.correctChiffre2),
    optionA: coercePair(o.optionA),
    optionB: coercePair(o.optionB),
    optionC: coercePair(o.optionC),
    optionD: coercePair(o.optionD),
    generated22: o.generated22 === true,
    correctLetter1: coerceLetter(o.correctLetter1),
    correctLetter2: coerceLetter(o.correctLetter2),
  };
  const parsed = carteHistoriquePayloadZodSchema.safeParse(candidate);
  if (!parsed.success) return null;
  const d = parsed.data;
  return {
    schemaVersion: 1,
    comportementId: d.comportementId,
    consigneElement1: d.consigneElement1,
    consigneElement2: d.consigneElement2,
    correctLetter: d.correctLetter,
    correctChiffre1: d.correctChiffre1,
    correctChiffre2: d.correctChiffre2,
    optionA: d.optionA,
    optionB: d.optionB,
    optionC: d.optionC,
    optionD: d.optionD,
    generated22: d.generated22,
    correctLetter1: d.correctLetter1,
    correctLetter2: d.correctLetter2,
  };
}

export function initialCarteHistoriquePayload(
  comportementId: CarteHistoriqueComportementId = "2.1",
): CarteHistoriquePayload {
  return {
    schemaVersion: 1,
    comportementId,
    consigneElement1: "",
    consigneElement2: "",
    correctLetter: "",
    correctChiffre1: null,
    correctChiffre2: null,
    optionA: null,
    optionB: null,
    optionC: null,
    optionD: null,
    generated22: false,
    correctLetter1: "",
    correctLetter2: "",
  };
}

/** Vide les options A–D et la lettre du corrigé 2.2 (reset / re-saisie). */
export function clearedCarte22OptionsPatch(): Pick<
  CarteHistoriquePayload,
  "optionA" | "optionB" | "optionC" | "optionD" | "correctLetter" | "generated22"
> {
  return {
    optionA: null,
    optionB: null,
    optionC: null,
    optionD: null,
    correctLetter: "",
    generated22: false,
  };
}

export function mergeCarteHistoriquePayload(
  prev: unknown,
  patch: Partial<CarteHistoriquePayload>,
): CarteHistoriquePayload {
  const base =
    normalizeCarteHistoriquePayload(prev) ??
    initialCarteHistoriquePayload(
      isCarteHistoriqueComportementId(patch.comportementId) ? patch.comportementId : "2.1",
    );
  return {
    schemaVersion: 1,
    comportementId: patch.comportementId ?? base.comportementId,
    consigneElement1: patch.consigneElement1 ?? base.consigneElement1,
    consigneElement2: patch.consigneElement2 ?? base.consigneElement2,
    correctLetter: patch.correctLetter ?? base.correctLetter,
    correctChiffre1:
      patch.correctChiffre1 !== undefined ? patch.correctChiffre1 : base.correctChiffre1,
    correctChiffre2:
      patch.correctChiffre2 !== undefined ? patch.correctChiffre2 : base.correctChiffre2,
    optionA: patch.optionA !== undefined ? patch.optionA : base.optionA,
    optionB: patch.optionB !== undefined ? patch.optionB : base.optionB,
    optionC: patch.optionC !== undefined ? patch.optionC : base.optionC,
    optionD: patch.optionD !== undefined ? patch.optionD : base.optionD,
    generated22: patch.generated22 ?? base.generated22,
    correctLetter1: patch.correctLetter1 ?? base.correctLetter1,
    correctLetter2: patch.correctLetter2 ?? base.correctLetter2,
  };
}

/* -------------------------------------------------------------------------- */
/*  Gates                                                                      */
/* -------------------------------------------------------------------------- */

function nonEmpty(s: string): boolean {
  return s.trim().length > 0;
}

/** Étape 3 — consigne complète selon le comportement. */
export function isCarteHistoriqueStep3Complete(p: CarteHistoriquePayload): boolean {
  if (!nonEmpty(p.consigneElement1)) return false;
  if (p.comportementId === "2.2" || p.comportementId === "2.3") {
    return nonEmpty(p.consigneElement2);
  }
  return true;
}

/** Étape 5 — corrigé complet selon le comportement. */
export function isCarteHistoriqueStep5Complete(p: CarteHistoriquePayload): boolean {
  if (p.comportementId === "2.1") {
    return isCarteHistoriqueLetter(p.correctLetter);
  }
  if (p.comportementId === "2.2") {
    if (!p.generated22) return false;
    if (!isCarteHistoriqueLetter(p.correctLetter)) return false;
    if (p.correctChiffre1 === null || p.correctChiffre2 === null) return false;
    if (p.correctChiffre1 === p.correctChiffre2) return false;
    return [p.optionA, p.optionB, p.optionC, p.optionD].every((o) => o !== null);
  }
  // 2.3
  return isCarteHistoriqueLetter(p.correctLetter1) && isCarteHistoriqueLetter(p.correctLetter2);
}

/** Slot document complet — 1 seul slot pour tous les comportements carte historique. */
export function isCarteHistoriqueSlotComplete(slot: DocumentSlotData): boolean {
  return computeSlotStatus(slot) === "complete";
}

export function isCarteHistoriqueDocumentsStepComplete(
  documentSlots: { slotId: DocumentSlotId }[],
  documents: Partial<Record<DocumentSlotId, DocumentSlotData>>,
): boolean {
  if (documentSlots.length === 0) return false;
  for (const { slotId } of documentSlots) {
    const slot = getSlotData(documents, slotId);
    if (!isCarteHistoriqueSlotComplete(slot)) return false;
    if (!slot.repere_temporel.trim()) return false;
  }
  return true;
}

export function isCarteHistoriqueDocumentsPublishable(
  documentSlots: { slotId: DocumentSlotId }[],
  documents: Partial<Record<DocumentSlotId, DocumentSlotData>>,
): boolean {
  if (!isCarteHistoriqueDocumentsStepComplete(documentSlots, documents)) return false;
  for (const { slotId } of documentSlots) {
    const slot = getSlotData(documents, slotId);
    if (slot.mode === "create" && slot.type === "iconographique") {
      if (!isPublicHttpUrl(slot.imageUrl)) return false;
    }
  }
  return true;
}

/* -------------------------------------------------------------------------- */
/*  Builders HTML — feuille élève + corrigé enseignant                         */
/* -------------------------------------------------------------------------- */

const STUDENT_ROOT_OPEN =
  '<div data-carte-historique-student="true" class="carte-historique-student-root">';
const STUDENT_ROOT_CLOSE = "</div>";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildIntroHtml(): string {
  // `{{doc_1}}` est réécrit à l'impression (épreuve / feuille élève).
  return `<p class="carte-historique-student-intro">${NR_CARTE_PUBLISHED_INTRO_PREFIX}${NR_CARTE_PUBLISHED_INTRO_DOC_PLACEHOLDER}${NR_CARTE_PUBLISHED_INTRO_SUFFIX}</p>`;
}

function buildReponseBoxHtml(): string {
  return `<div class="carte-historique-student-reponse"><span class="carte-historique-student-reponse-label">${escapeHtml(NR_CARTE_STUDENT_SHEET_REPONSE_LABEL)}</span><span class="carte-historique-student-reponse-box" aria-hidden="true"></span></div>`;
}

function build21ConsigneHtml(p: CarteHistoriquePayload): string {
  const e1 = escapeHtml(p.consigneElement1.trim());
  const question = `<p class="carte-historique-student-question">${escapeHtml(NR_CARTE_21_QUESTION_PREFIX)}<strong>${e1}</strong>${escapeHtml(NR_CARTE_21_QUESTION_SUFFIX)}</p>`;
  return `${STUDENT_ROOT_OPEN}${buildIntroHtml()}${question}${buildReponseBoxHtml()}${STUDENT_ROOT_CLOSE}`;
}

function build22OptionRowHtml(letter: CarteHistoriqueLetter, pair: CarteHistoriquePair): string {
  return `<tr class="carte-historique-student-option-row"><th scope="row" class="carte-historique-student-letter-cell"><strong>${escapeHtml(letter)})</strong></th><td>${escapeHtml(String(pair[0]))}</td><td>${escapeHtml(String(pair[1]))}</td></tr>`;
}

function build22TableHtml(p: CarteHistoriquePayload): string {
  const e1 = escapeHtml(p.consigneElement1.trim());
  const e2 = escapeHtml(p.consigneElement2.trim());
  const head = `<thead><tr><th scope="col" class="carte-historique-student-th-letter">&#160;</th><th scope="col">${e1}</th><th scope="col">${e2}</th></tr></thead>`;
  const rows = (
    [
      ["A", p.optionA] as const,
      ["B", p.optionB] as const,
      ["C", p.optionC] as const,
      ["D", p.optionD] as const,
    ] as const
  )
    .filter((row): row is readonly [CarteHistoriqueLetter, CarteHistoriquePair] => row[1] !== null)
    .map(([letter, pair]) => build22OptionRowHtml(letter, pair))
    .join("");
  const body = `<tbody>${rows}</tbody>`;
  return `<table class="carte-historique-student-table" role="grid" aria-label="${escapeHtml(NR_CARTE_22_TABLE_OPTIONS_GROUP_ARIA)}">${head}${body}</table>`;
}

function build22ConsigneHtml(p: CarteHistoriquePayload): string {
  const question = `<p class="carte-historique-student-question">${escapeHtml(NR_CARTE_22_QUESTION)}</p>`;
  const table = build22TableHtml(p);
  return `${STUDENT_ROOT_OPEN}${buildIntroHtml()}${question}${table}${buildReponseBoxHtml()}${STUDENT_ROOT_CLOSE}`;
}

function build23ItemHtml(label: string): string {
  return `<li class="carte-historique-student-item">${escapeHtml(NR_CARTE_23_ITEM_PREFIX)}<strong>${escapeHtml(label)}</strong>${escapeHtml(NR_CARTE_23_ITEM_SUFFIX)}<span class="carte-historique-student-reponse"><span class="carte-historique-student-reponse-label">${escapeHtml(NR_CARTE_STUDENT_SHEET_REPONSE_LABEL)}</span><span class="carte-historique-student-reponse-box" aria-hidden="true"></span></span></li>`;
}

function build23ConsigneHtml(p: CarteHistoriquePayload): string {
  const lead = `<p class="carte-historique-student-question">${escapeHtml(NR_CARTE_23_QUESTION_LEAD)}</p>`;
  const items = `<ul class="carte-historique-student-items">${build23ItemHtml(p.consigneElement1.trim())}${build23ItemHtml(p.consigneElement2.trim())}</ul>`;
  return `${STUDENT_ROOT_OPEN}${buildIntroHtml()}${lead}${items}${STUDENT_ROOT_CLOSE}`;
}

/** HTML stocké en `tache.consigne` — feuille élève complète selon comportement. */
export function buildCarteHistoriqueConsigneHtml(p: CarteHistoriquePayload): string {
  if (p.comportementId === "2.1") return build21ConsigneHtml(p);
  if (p.comportementId === "2.2") return build22ConsigneHtml(p);
  return build23ConsigneHtml(p);
}

/** HTML enseignant — `tache.corrige`. */
export function buildCarteHistoriqueCorrigeHtml(p: CarteHistoriquePayload): string {
  if (p.comportementId === "2.1") {
    if (!isCarteHistoriqueLetter(p.correctLetter)) return "";
    return `<p>${escapeHtml(`${NR_CARTE_CORRIGE_REPONSE_PREFIX}${p.correctLetter}.`)}</p>`;
  }
  if (p.comportementId === "2.2") {
    if (!isCarteHistoriqueLetter(p.correctLetter)) return "";
    if (p.correctChiffre1 === null || p.correctChiffre2 === null) return "";
    const lead = `<p>${escapeHtml(`${NR_CARTE_CORRIGE_REPONSE_PREFIX}${p.correctLetter}.`)}</p>`;
    const just = NR_CARTE_22_CORRIGE_JUSTIFICATION.replace("{{c1}}", String(p.correctChiffre1))
      .replace("{{element1}}", p.consigneElement1.trim())
      .replace("{{c2}}", String(p.correctChiffre2))
      .replace("{{element2}}", p.consigneElement2.trim());
    return `${lead}<p class="carte-historique-corrige-justification">${escapeHtml(just)}</p>`;
  }
  // 2.3
  if (!isCarteHistoriqueLetter(p.correctLetter1) || !isCarteHistoriqueLetter(p.correctLetter2)) {
    return "";
  }
  const text = NR_CARTE_23_CORRIGE_TEMPLATE.replace("{{letter1}}", p.correctLetter1)
    .replace("{{element1}}", p.consigneElement1.trim())
    .replace("{{letter2}}", p.correctLetter2)
    .replace("{{element2}}", p.consigneElement2.trim());
  return `<p>${escapeHtml(NR_CARTE_CORRIGE_REPONSE_PREFIX.trim())} ${escapeHtml(text)}</p>`;
}

/** Enseignant / sommaire : retire la zone réponse de la consigne (réservée à la feuille élève imprimée). */
export function stripCarteHistoriqueStudentSheetResponseBlockForDisplay(consigne: string): string {
  return consigne
    .replace(/<div class="carte-historique-student-reponse"[^>]*>[\s\S]*?<\/div>/g, "")
    .replace(
      /<span class="carte-historique-student-reponse"[^>]*>[\s\S]*?<\/span>\s*<\/li>/g,
      "</li>",
    );
}

export function prepareCarteHistoriqueConsigneForTeacherDisplay(consigne: string): string {
  return stripCarteHistoriqueStudentSheetResponseBlockForDisplay(consigne);
}
