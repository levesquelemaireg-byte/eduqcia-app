/**
 * Parcours 1.3 — avant / après (repère commun, QCM 4 partitions 2/2).
 * Copy : `lib/ui/ui-copy.ts` (`NR_AVANT_APRES_*`).
 */

import { z } from "zod";
import type { DocumentSlotId } from "@/lib/tae/blueprint-helpers";
import {
  complementAvantPair,
  computeCorrectAvantPair,
  generateAvantApresOptionPartitions,
  type AvantApresRng,
} from "@/lib/tae/non-redaction/avant-apres-helpers";
import { getSlotData, isPublicHttpUrl, type DocumentSlotData } from "@/lib/tae/document-helpers";
import {
  NR_AVANT_APRES_JUSTIFICATION_AUTO,
  NR_AVANT_APRES_PUBLISHED_INTRO_MIDDLE,
  NR_AVANT_APRES_PUBLISHED_INTRO_PREFIX,
  NR_AVANT_APRES_PUBLISHED_INTRO_SUFFIX,
  NR_AVANT_APRES_STUDENT_GUIDAGE,
  NR_AVANT_APRES_STUDENT_SHEET_OPTIONS_GROUP_ARIA,
  NR_AVANT_APRES_STUDENT_SHEET_REPONSE_LABEL,
  NR_AVANT_APRES_STUDENT_SHEET_TABLE_COL_APRES,
  NR_AVANT_APRES_STUDENT_SHEET_TABLE_COL_AVANT,
  NR_AVANT_APRES_STUDENT_SHEET_TABLE_REPERE_TH_SR,
} from "@/lib/ui/ui-copy";

const slotIdZ = z.enum(["doc_A", "doc_B", "doc_C", "doc_D"]);
const letterZ = z.enum(["A", "B", "C", "D"]);

const optionRowZ = z.object({
  letter: letterZ,
  avantSlots: z.tuple([slotIdZ, slotIdZ]),
  apresSlots: z.tuple([slotIdZ, slotIdZ]),
});

export const avantApresPayloadZodSchema = z
  .object({
    schemaVersion: z.number().int().min(1).max(1).optional().default(1),
    theme: z.string(),
    repere: z.string(),
    anneeRepere: z.number().int(),
    /** Fin de période inclusive (début = `anneeRepere`). Absent = une seule année pivot (comportement historique). */
    anneeRepereFin: z.number().int().optional(),
    /** Clés attendues `doc_*` — `z.record(slotIdZ, …)` Zod exigerait les 4 clés ; on valide les clés en amont via `coerceOverrides`. */
    overrides: z.record(z.string(), z.enum(["avant", "apres"])).optional(),
    optionRows: z.array(optionRowZ),
    correctLetter: letterZ,
    justification: z.string(),
    generated: z.boolean(),
  })
  .superRefine((d, ctx) => {
    if (d.anneeRepereFin != null && d.anneeRepereFin < d.anneeRepere) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "anneeRepereFin doit être >= anneeRepere",
        path: ["anneeRepereFin"],
      });
    }
  });

export type AvantApresOptionLetter = z.infer<typeof letterZ>;
export type AvantApresOptionRow = z.infer<typeof optionRowZ>;

export type AvantApresPayload = {
  schemaVersion: 1;
  theme: string;
  repere: string;
  anneeRepere: number;
  /** Inclusive end year ; absent = single pivot year. */
  anneeRepereFin?: number;
  overrides: Partial<Record<DocumentSlotId, "avant" | "apres">>;
  optionRows: AvantApresOptionRow[];
  correctLetter: AvantApresOptionLetter;
  justification: string;
  generated: boolean;
};

export const AVANT_APRES_STUDENT_SHEET_GUIDAGE_ANCHOR =
  "<!--eduqcia:avant-apres-student-sheet-guidage-anchor-->";

const AVANT_STUDENT_ROOT_OPEN =
  '<div data-avant-apres-student="true" class="avant-apres-student-root">';
const AVANT_STUDENT_ROOT_CLOSE = "</div>";

function sortPair(a: DocumentSlotId, b: DocumentSlotId): [DocumentSlotId, DocumentSlotId] {
  return a < b ? [a, b] : [b, a];
}

function partitionKeySlots(avant: [DocumentSlotId, DocumentSlotId]): string {
  const [x, y] = sortPair(avant[0], avant[1]);
  return `${x},${y}`;
}

function rowPartitionKey(row: AvantApresOptionRow): string {
  return partitionKeySlots(row.avantSlots);
}

function isValidPartitionRow(row: AvantApresOptionRow): boolean {
  const a = sortPair(row.avantSlots[0], row.avantSlots[1]);
  const eApres = complementAvantPair(a);
  const gApres = sortPair(row.apresSlots[0], row.apresSlots[1]);
  return eApres[0] === gApres[0] && eApres[1] === gApres[1];
}

/** Valide les invariants métier (Zod déjà passé ou forme équivalente). */
export function validateAvantApresPayloadInvariants(p: AvantApresPayload): boolean {
  if (p.schemaVersion !== 1) return false;
  if (p.generated) {
    if (p.optionRows.length !== 4) return false;
    const letters = new Set(p.optionRows.map((r) => r.letter));
    if (letters.size !== 4) return false;
    for (const row of p.optionRows) {
      if (!isValidPartitionRow(row)) return false;
    }
    if (!p.optionRows.some((r) => r.letter === p.correctLetter)) return false;
  } else if (p.optionRows.length > 0) {
    return false;
  }
  return true;
}

function coerceOverrides(raw: unknown): Partial<Record<DocumentSlotId, "avant" | "apres">> {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const out: Partial<Record<DocumentSlotId, "avant" | "apres">> = {};
  const ids: DocumentSlotId[] = ["doc_A", "doc_B", "doc_C", "doc_D"];
  for (const id of ids) {
    const v = o[id];
    if (v === "avant" || v === "apres") out[id] = v;
  }
  return out;
}

function coerceLetter(raw: unknown): AvantApresOptionLetter {
  if (raw === "A" || raw === "B" || raw === "C" || raw === "D") return raw;
  return "A";
}

function isDocSlotId(v: unknown): v is DocumentSlotId {
  return v === "doc_A" || v === "doc_B" || v === "doc_C" || v === "doc_D";
}

function coerceOptionRow(raw: unknown): AvantApresOptionRow | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const letter = coerceLetter(o.letter);
  const av = o.avantSlots;
  const ap = o.apresSlots;
  if (!Array.isArray(av) || av.length !== 2 || !Array.isArray(ap) || ap.length !== 2) return null;
  const a0 = av[0];
  const a1 = av[1];
  const p0 = ap[0];
  const p1 = ap[1];
  if (!isDocSlotId(a0) || !isDocSlotId(a1) || !isDocSlotId(p0) || !isDocSlotId(p1)) return null;
  return {
    letter,
    avantSlots: [a0, a1],
    apresSlots: [p0, p1],
  };
}

function coerceOptionRows(raw: unknown): AvantApresOptionRow[] {
  if (!Array.isArray(raw)) return [];
  const out: AvantApresOptionRow[] = [];
  for (const item of raw) {
    const r = coerceOptionRow(item);
    if (r) out.push(r);
  }
  return out;
}

function coerceAnnee(raw: unknown): number {
  if (typeof raw === "number" && Number.isFinite(raw)) return Math.trunc(raw);
  if (typeof raw === "string" && /^-?\d+$/.test(raw.trim())) return parseInt(raw.trim(), 10);
  return 0;
}

/** Parse `anneeRepere` chaîne `AAAA–AAAA` / `AAAA-AAAA` ou nombre + `anneeRepereFin` optionnel. */
function coerceRepereAnnees(o: Record<string, unknown>): {
  anneeRepere: number;
  anneeRepereFin?: number;
} {
  const raw = o.anneeRepere;
  if (typeof raw === "string") {
    const range = raw
      .trim()
      .match(/^(\d{4})\s*[\u2013\-]\s*(\d{4})$/u);
    if (range) {
      const a = parseInt(range[1]!, 10);
      const b = parseInt(range[2]!, 10);
      const start = Math.min(a, b);
      const end = Math.max(a, b);
      return { anneeRepere: start, anneeRepereFin: end };
    }
  }
  const start = coerceAnnee(raw);
  const rawFin = o.anneeRepereFin;
  if (rawFin !== undefined && rawFin !== null && String(rawFin).trim() !== "") {
    const f = coerceAnnee(rawFin);
    if (f >= start && f > 0) return { anneeRepere: start, anneeRepereFin: f };
  }
  return { anneeRepere: start };
}

/**
 * Normalise un payload (brouillon ou colonne JSONB). Retourne `null` si structure invalide ou invariants KO.
 */
export function normalizeAvantApresPayload(raw: unknown): AvantApresPayload | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if ("schemaVersion" in o) {
    const sv = o.schemaVersion;
    if (typeof sv === "number" && sv !== 1) return null;
  }
  const { anneeRepere: ar, anneeRepereFin: arfFromCoerce } = coerceRepereAnnees(o);
  const candidate = {
    schemaVersion: 1,
    theme: typeof o.theme === "string" ? o.theme : "",
    repere: typeof o.repere === "string" ? o.repere : "",
    anneeRepere: ar,
    anneeRepereFin: arfFromCoerce,
    overrides: coerceOverrides(o.overrides),
    optionRows: coerceOptionRows(o.optionRows),
    correctLetter: coerceLetter(o.correctLetter),
    justification: typeof o.justification === "string" ? o.justification : "",
    generated: o.generated === true,
  };
  const parsed = avantApresPayloadZodSchema.safeParse(candidate);
  if (!parsed.success) return null;
  const d = parsed.data;
  const p: AvantApresPayload = {
    schemaVersion: 1,
    theme: d.theme,
    repere: d.repere,
    anneeRepere: d.anneeRepere,
    ...(d.anneeRepereFin != null ? { anneeRepereFin: d.anneeRepereFin } : {}),
    overrides: coerceOverrides(d.overrides ?? {}),
    optionRows: d.optionRows,
    correctLetter: d.correctLetter,
    justification: d.justification,
    generated: d.generated,
  };
  if (!validateAvantApresPayloadInvariants(p)) return null;
  return p;
}

export function initialAvantApresPayload(): AvantApresPayload {
  return {
    schemaVersion: 1,
    theme: "",
    repere: "",
    anneeRepere: new Date().getFullYear(),
    overrides: {},
    optionRows: [],
    correctLetter: "A",
    justification: "",
    generated: false,
  };
}

/** Année document sur le repère : égalité pivot, ou inclusion dans [anneeRepere, anneeRepereFin]. */
export function avantApresDocYearNeedsOverride(y: number, p: AvantApresPayload): boolean {
  const fin = p.anneeRepereFin;
  if (fin === undefined) return y === p.anneeRepere;
  return y >= p.anneeRepere && y <= fin;
}

/** Affichage intro / tableaux : `AAAA` ou `AAAA–AAAA`. */
export function formatAvantApresAnneeForDisplay(p: AvantApresPayload): string {
  const fin = p.anneeRepereFin;
  if (fin != null && fin !== p.anneeRepere) {
    return `${p.anneeRepere}–${fin}`;
  }
  return String(p.anneeRepere);
}

export function clearedAvantApresOptionsPatch(): Pick<
  AvantApresPayload,
  "optionRows" | "correctLetter" | "justification" | "generated"
> {
  return {
    optionRows: [],
    correctLetter: "A",
    justification: "",
    generated: false,
  };
}

export function mergeAvantApresPayload(
  prev: unknown,
  patch: Partial<AvantApresPayload>,
): AvantApresPayload {
  const base = normalizeAvantApresPayload(prev) ?? initialAvantApresPayload();
  return {
    schemaVersion: 1,
    theme: patch.theme ?? base.theme,
    repere: patch.repere ?? base.repere,
    anneeRepere: patch.anneeRepere ?? base.anneeRepere,
    anneeRepereFin: "anneeRepereFin" in patch ? patch.anneeRepereFin : base.anneeRepereFin,
    overrides:
      patch.overrides !== undefined
        ? { ...base.overrides, ...patch.overrides }
        : { ...base.overrides },
    optionRows: patch.optionRows ?? base.optionRows,
    correctLetter: patch.correctLetter ?? base.correctLetter,
    justification: patch.justification ?? base.justification,
    generated: patch.generated ?? base.generated,
  };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function docTokensForPair(avant: [DocumentSlotId, DocumentSlotId]): string {
  const [x, y] = sortPair(avant[0], avant[1]);
  return `{{${x}}} et {{${y}}}`;
}

function buildJustificationFromGeneration(
  correctLetter: AvantApresOptionLetter,
  correctRow: AvantApresOptionRow,
): string {
  const avantT = docTokensForPair(correctRow.avantSlots);
  const apresT = docTokensForPair(correctRow.apresSlots);
  return NR_AVANT_APRES_JUSTIFICATION_AUTO.replace("{{correctLetter}}", correctLetter)
    .replace("{{avantDocs}}", avantT)
    .replace("{{apresDocs}}", apresT);
}

/**
 * Génère options + justification ; met à jour `generated`. Utilise `Math.random` si `rng` absent.
 */
export function runAvantApresGeneration(
  p: AvantApresPayload,
  orderedSlotIds: DocumentSlotId[],
  documents: Partial<Record<DocumentSlotId, DocumentSlotData>>,
  rng?: AvantApresRng,
): { payload: AvantApresPayload; errorCode: string | null } {
  const random = rng ?? Math.random;
  const gen = generateAvantApresOptionPartitions(
    orderedSlotIds,
    documents,
    p.anneeRepere,
    p.overrides,
    random,
    p.anneeRepereFin,
  );
  if (!gen.ok) {
    return {
      payload: { ...p, ...clearedAvantApresOptionsPatch() },
      errorCode: gen.code,
    };
  }
  const letters: AvantApresOptionLetter[] = ["A", "B", "C", "D"];
  const optionRows: AvantApresOptionRow[] = gen.optionRows.map((row, i) => ({
    letter: letters[i]!,
    avantSlots: row.avantSlots,
    apresSlots: row.apresSlots,
  }));
  const correctRow = optionRows.find((r) => r.letter === gen.correctLetter);
  if (!correctRow) {
    return {
      payload: { ...p, ...clearedAvantApresOptionsPatch() },
      errorCode: "not_two_before",
    };
  }
  const justification = buildJustificationFromGeneration(gen.correctLetter, correctRow);
  const next: AvantApresPayload = {
    ...p,
    optionRows,
    correctLetter: gen.correctLetter,
    justification,
    generated: true,
  };
  if (!validateAvantApresPayloadInvariants(next)) {
    return {
      payload: { ...p, ...clearedAvantApresOptionsPatch() },
      errorCode: "not_two_before",
    };
  }
  return { payload: next, errorCode: null };
}

export function isAvantApresStep3ThemeComplete(p: AvantApresPayload): boolean {
  return p.theme.trim().length > 0 && p.repere.trim().length > 0;
}

export function isAvantApresStep5OptionsComplete(p: AvantApresPayload): boolean {
  return p.generated && validateAvantApresPayloadInvariants(p);
}

/** Étape 3 — thème, repère et année (sans exiger la génération des options). */
export function isAvantApresRedactionStepCompleteForNext(p: AvantApresPayload): boolean {
  return isAvantApresStep3ThemeComplete(p);
}

/** Après étape 5 — options générées et valides. */
export function isAvantApresBloc5CompleteForNext(p: AvantApresPayload): boolean {
  return isAvantApresStep5OptionsComplete(p);
}

/** Garde accès étape CD (même logique qu’ordre chrono : consigne + options complètes). */
export function isAvantApresPayloadCompleteForCdGate(p: AvantApresPayload): boolean {
  return isAvantApresStep3ThemeComplete(p) && isAvantApresStep5OptionsComplete(p);
}

/** Alignement options / documents / repère — requis pour publier. */
export function isAvantApresPayloadConsistentWithDocuments(
  p: AvantApresPayload,
  orderedSlotIds: DocumentSlotId[],
  documents: Partial<Record<DocumentSlotId, DocumentSlotData>>,
): boolean {
  if (!isAvantApresStep5OptionsComplete(p)) return false;
  const computed = computeCorrectAvantPair(
    orderedSlotIds,
    documents,
    p.anneeRepere,
    p.overrides,
    p.anneeRepereFin,
  );
  if (!computed.ok) return false;
  const correctRow = p.optionRows.find((r) => r.letter === p.correctLetter);
  if (!correctRow) return false;
  return partitionKeySlots(computed.pair) === rowPartitionKey(correctRow);
}

export function isAvantApresDocumentsStepComplete(
  documentSlots: { slotId: DocumentSlotId }[],
  documents: Partial<Record<DocumentSlotId, DocumentSlotData>>,
): boolean {
  for (const { slotId } of documentSlots) {
    const slot = getSlotData(documents, slotId);
    if (slot.mode === "idle") return false;
    if (!slot.titre.trim() || !slot.source_citation.trim()) return false;
    if (slot.type === "textuel" && !slot.contenu.trim()) return false;
    if (slot.type === "iconographique" && !slot.imageUrl) return false;
    if (!slot.repere_temporel.trim()) return false;
  }
  return true;
}

export function isAvantApresDocumentsPublishable(
  documentSlots: { slotId: DocumentSlotId }[],
  documents: Partial<Record<DocumentSlotId, DocumentSlotData>>,
): boolean {
  if (!isAvantApresDocumentsStepComplete(documentSlots, documents)) return false;
  for (const { slotId } of documentSlots) {
    const slot = getSlotData(documents, slotId);
    if (slot.mode === "create" && slot.type === "iconographique") {
      if (!isPublicHttpUrl(slot.imageUrl)) return false;
    }
  }
  return true;
}

export function buildAvantApresIntroHtml(p: AvantApresPayload): string {
  const theme = escapeHtml(p.theme.trim());
  const rep = escapeHtml(p.repere.trim());
  const yr = escapeHtml(formatAvantApresAnneeForDisplay(p));
  const inner =
    NR_AVANT_APRES_PUBLISHED_INTRO_PREFIX +
    NR_AVANT_APRES_PUBLISHED_INTRO_MIDDLE.replace("{{theme}}", theme)
      .replace("{{repere}}", rep)
      .replace("{{annee}}", yr) +
    NR_AVANT_APRES_PUBLISHED_INTRO_SUFFIX;
  return `<p class="avant-apres-student-intro">${inner}</p>`;
}

/** Contenu de la colonne pivot (feuille élève) : événement / intervalle ; année entre parenthèses si utile. */
function buildStudentSheetReperePivotInnerHtml(p: AvantApresPayload): string {
  const r = p.repere.trim();
  const y = formatAvantApresAnneeForDisplay(p);
  if (!r) return escapeHtml(y);
  if (r === y) return escapeHtml(r);
  return `${escapeHtml(r)} (${escapeHtml(y)})`;
}

function optionTableFirstRowHtml(p: AvantApresPayload, row: AvantApresOptionRow): string {
  const av = docTokensForPair(row.avantSlots);
  const ap = docTokensForPair(row.apresSlots);
  const repInner = buildStudentSheetReperePivotInnerHtml(p);
  return `<tr class="avant-apres-student-option-row"><th scope="row" class="avant-apres-student-letter-cell"><strong>${escapeHtml(row.letter)})</strong></th><td class="avant-apres-student-cell-avant">${av}</td><td class="avant-apres-student-cell-repere" rowspan="4">${repInner}</td><td class="avant-apres-student-cell-apres">${ap}</td></tr>`;
}

function optionTableFollowRowHtml(row: AvantApresOptionRow): string {
  const av = docTokensForPair(row.avantSlots);
  const ap = docTokensForPair(row.apresSlots);
  return `<tr class="avant-apres-student-option-row"><th scope="row" class="avant-apres-student-letter-cell"><strong>${escapeHtml(row.letter)})</strong></th><td class="avant-apres-student-cell-avant">${av}</td><td class="avant-apres-student-cell-apres">${ap}</td></tr>`;
}

export function buildAvantApresConsigneHtml(p: AvantApresPayload): string {
  const intro = buildAvantApresIntroHtml(p);
  const head = `<thead><tr><th scope="col" class="avant-apres-student-th-letter">&#160;</th><th scope="col" class="avant-apres-student-col-avant">${escapeHtml(NR_AVANT_APRES_STUDENT_SHEET_TABLE_COL_AVANT)}</th><th scope="col" class="avant-apres-student-col-repere avant-apres-student-th-repere-empty"><span class="avant-apres-sr-only">${escapeHtml(NR_AVANT_APRES_STUDENT_SHEET_TABLE_REPERE_TH_SR)}</span></th><th scope="col" class="avant-apres-student-col-apres">${escapeHtml(NR_AVANT_APRES_STUDENT_SHEET_TABLE_COL_APRES)}</th></tr></thead>`;
  const rows = p.optionRows;
  const bodyRows =
    rows.length === 0
      ? ""
      : [
          optionTableFirstRowHtml(p, rows[0]!),
          ...rows.slice(1).map((r) => optionTableFollowRowHtml(r)),
        ].join("");
  const body = `<tbody>${bodyRows}</tbody>`;
  const table = `<table class="avant-apres-student-table" role="grid" aria-label="${escapeHtml(NR_AVANT_APRES_STUDENT_SHEET_OPTIONS_GROUP_ARIA)}">${head}${body}</table>`;
  const reponse = `<div class="avant-apres-student-reponse"><span class="avant-apres-student-reponse-label">${escapeHtml(NR_AVANT_APRES_STUDENT_SHEET_REPONSE_LABEL)}</span><span class="avant-apres-student-reponse-box" aria-hidden="true"></span></div>`;
  return `${AVANT_STUDENT_ROOT_OPEN}${intro}${AVANT_APRES_STUDENT_SHEET_GUIDAGE_ANCHOR}${table}${reponse}${AVANT_STUDENT_ROOT_CLOSE}`;
}

export function buildAvantApresCorrigeHtml(p: AvantApresPayload): string {
  if (!isAvantApresStep5OptionsComplete(p)) return "";
  const lead = `<p>${escapeHtml(`Réponse attendue : ${p.correctLetter}.`)}</p>`;
  const j = p.justification.trim();
  if (!j) return lead;
  return `${lead}<p class="avant-apres-corrige-justification">${escapeHtml(j)}</p>`;
}

export function buildAvantApresGuidageHtml(): string {
  return `<p>${escapeHtml(NR_AVANT_APRES_STUDENT_GUIDAGE)}</p>`;
}

export function parseAvantApresConsigneForStudentPrint(
  consigne: string,
): { beforeGuidage: string; afterGuidage: string } | null {
  const t = consigne.trim();
  if (!t.includes(AVANT_APRES_STUDENT_SHEET_GUIDAGE_ANCHOR)) return null;
  if (!t.startsWith(AVANT_STUDENT_ROOT_OPEN) || !t.endsWith(AVANT_STUDENT_ROOT_CLOSE)) return null;
  const inner = t.slice(AVANT_STUDENT_ROOT_OPEN.length, t.length - AVANT_STUDENT_ROOT_CLOSE.length);
  const idx = inner.indexOf(AVANT_APRES_STUDENT_SHEET_GUIDAGE_ANCHOR);
  if (idx === -1) return null;
  const introBit = inner.slice(0, idx);
  const taskBit = inner.slice(idx + AVANT_APRES_STUDENT_SHEET_GUIDAGE_ANCHOR.length);
  return {
    beforeGuidage: `${AVANT_STUDENT_ROOT_OPEN}${introBit}${AVANT_STUDENT_ROOT_CLOSE}`,
    afterGuidage: `${AVANT_STUDENT_ROOT_OPEN}${taskBit}${AVANT_STUDENT_ROOT_CLOSE}`,
  };
}

export function stripAvantApresStudentSheetGuidageAnchorForDisplay(consigne: string): string {
  return consigne.split(AVANT_APRES_STUDENT_SHEET_GUIDAGE_ANCHOR).join("");
}

export function stripAvantApresStudentSheetResponseBlockForDisplay(consigne: string): string {
  return consigne.replace(/<div class="avant-apres-student-reponse"[^>]*>[\s\S]*?<\/div>/, "");
}

export function prepareAvantApresConsigneForTeacherDisplay(consigne: string): string {
  return stripAvantApresStudentSheetResponseBlockForDisplay(
    stripAvantApresStudentSheetGuidageAnchorForDisplay(consigne),
  );
}

export function isAvantApresStudentConsigneHtml(consigne: string): boolean {
  return parseAvantApresConsigneForStudentPrint(consigne) !== null;
}
