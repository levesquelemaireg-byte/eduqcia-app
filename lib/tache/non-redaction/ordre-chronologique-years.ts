/**
 * Ordre chronologique (OI 1.1) — séquence correcte dérivée des années comparables
 * (`annee_normalisee` ou extraction depuis le repère) — voir `getAnneePourComparaison`.
 */

import type { DocumentSlotId } from "@/lib/tache/blueprint-helpers";
import { getAnneePourComparaison } from "@/lib/tache/document-annee";
import { getSlotData, slotLetter, type DocumentSlotData } from "@/lib/tache/document-helpers";
import type {
  OrdreOptionRow,
  OrdrePermutation,
} from "@/lib/tache/non-redaction/ordre-chronologique-permutations";
import { isCompleteOrdrePermutation } from "@/lib/tache/non-redaction/ordre-chronologique-permutations";

export type OrdreYearResolution =
  | { kind: "missing_years"; slotLetters: ("A" | "B" | "C" | "D")[] }
  | { kind: "tie" }
  | { kind: "ok"; sequence: OrdrePermutation };

/**
 * Détermine si la bonne suite peut être calculée uniquement à partir des années.
 * - Année manquante sur un document → `missing_years`.
 * - Deux documents avec la même année normalisée → `tie` (l’enseignant saisit la séquence en PIN).
 */
export function computeOrdreSequenceFromYears(
  orderedSlotIds: DocumentSlotId[],
  documents: Partial<Record<DocumentSlotId, DocumentSlotData>>,
): OrdreYearResolution {
  if (orderedSlotIds.length === 0) {
    return { kind: "missing_years", slotLetters: [] };
  }

  const missing: ("A" | "B" | "C" | "D")[] = [];
  const entries: { docNum: 1 | 2 | 3 | 4; year: number }[] = [];

  orderedSlotIds.forEach((slotId, idx) => {
    const slot = getSlotData(documents, slotId);
    const docNum = (idx + 1) as 1 | 2 | 3 | 4;
    const y = getAnneePourComparaison(slot);
    if (y === null) {
      missing.push(slotLetter(slotId));
    } else {
      entries.push({ docNum, year: Math.trunc(y) });
    }
  });

  if (missing.length > 0) {
    return { kind: "missing_years", slotLetters: missing };
  }

  const byYear = new Map<number, (1 | 2 | 3 | 4)[]>();
  for (const e of entries) {
    const arr = byYear.get(e.year) ?? [];
    arr.push(e.docNum);
    byYear.set(e.year, arr);
  }
  for (const [, docNums] of byYear) {
    if (docNums.length > 1) {
      return { kind: "tie" };
    }
  }

  const sorted = [...entries].sort((a, b) => a.year - b.year || a.docNum - b.docNum);
  if (sorted.length !== 4) {
    return { kind: "missing_years", slotLetters: [] };
  }
  const sequence: OrdrePermutation = [
    sorted[0]!.docNum,
    sorted[1]!.docNum,
    sorted[2]!.docNum,
    sorted[3]!.docNum,
  ];
  return { kind: "ok", sequence };
}

/** Phrase de justification pour le corrigé enseignant (après génération). */
export function buildOrdreJustificationText(
  sequence: OrdrePermutation,
  orderedSlotIds: DocumentSlotId[],
  documents: Partial<Record<DocumentSlotId, DocumentSlotData>>,
  correctLetter: "A" | "B" | "C" | "D",
): string {
  const parts: string[] = [];
  for (let i = 0; i < 4; i++) {
    const docNum = sequence[i]!;
    const slotId = orderedSlotIds[docNum - 1];
    if (!slotId) {
      parts.push(`${docNum} (—)`);
      continue;
    }
    const slot = getSlotData(documents, slotId);
    const raw = getAnneePourComparaison(slot);
    const y = raw !== null ? Math.trunc(raw) : "—";
    parts.push(`${docNum} (${y})`);
  }
  const list = parts.join(", ");
  return `Les documents sont classés par ordre chronologique : ${list}. L’option ${correctLetter} est la seule qui respecte cet ordre.`;
}

/**
 * Séquence « correcte » pour une génération : automatique, ou saisie manuelle si égalité d’années.
 */
export function resolveOrdreBaseSequenceForGeneration(
  yearRes: OrdreYearResolution,
  manualTieBreak: OrdrePermutation | null,
  pinRow: OrdreOptionRow,
): OrdrePermutation | null {
  if (yearRes.kind === "missing_years") return null;
  if (yearRes.kind === "ok") return yearRes.sequence;
  if (manualTieBreak !== null && isCompleteOrdrePermutation(manualTieBreak)) return manualTieBreak;
  if (isCompleteOrdrePermutation(pinRow)) return pinRow;
  return null;
}
