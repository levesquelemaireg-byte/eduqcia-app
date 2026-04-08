/**
 * Parcours 1.3 — partitions 2/2, distracteurs C(4,2), mélange (RNG injectable).
 */

import type { DocumentSlotId } from "@/lib/tae/blueprint-helpers";
import { getAnneePourComparaison } from "@/lib/tae/document-annee";
import { getSlotData, type DocumentSlotData } from "@/lib/tae/document-helpers";

export const AVANT_APRES_ALL_SLOTS: readonly DocumentSlotId[] = [
  "doc_A",
  "doc_B",
  "doc_C",
  "doc_D",
] as const;

export type AvantApresPartitionRow = {
  avantSlots: [DocumentSlotId, DocumentSlotId];
  apresSlots: [DocumentSlotId, DocumentSlotId];
};

/** RNG retourne un réel dans [0, 1). */
export type AvantApresRng = () => number;

function sortSlotPair(a: DocumentSlotId, b: DocumentSlotId): [DocumentSlotId, DocumentSlotId] {
  return a < b ? [a, b] : [b, a];
}

function partitionKey(p: [DocumentSlotId, DocumentSlotId]): string {
  const [x, y] = sortSlotPair(p[0], p[1]);
  return `${x},${y}`;
}

/** Les 6 partitions 2/2 sur 4 documents (paire « avant » canonique triée). */
export function allAvantApresPartitions(): [DocumentSlotId, DocumentSlotId][] {
  const slots = [...AVANT_APRES_ALL_SLOTS];
  const out: [DocumentSlotId, DocumentSlotId][] = [];
  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      out.push(sortSlotPair(slots[i]!, slots[j]!));
    }
  }
  return out;
}

export function complementAvantPair(
  avant: [DocumentSlotId, DocumentSlotId],
): [DocumentSlotId, DocumentSlotId] {
  const set = new Set<DocumentSlotId>([avant[0], avant[1]]);
  const apres = AVANT_APRES_ALL_SLOTS.filter((s) => !set.has(s));
  if (apres.length !== 2) {
    return sortSlotPair(avant[0], avant[1]);
  }
  return sortSlotPair(apres[0]!, apres[1]!);
}

export function rowFromAvantPair(avant: [DocumentSlotId, DocumentSlotId]): AvantApresPartitionRow {
  const a = sortSlotPair(avant[0], avant[1]);
  return { avantSlots: a, apresSlots: complementAvantPair(a) };
}

export type ComputeCorrectPairResult =
  | { ok: true; pair: [DocumentSlotId, DocumentSlotId] }
  | { ok: false; code: "missing_year" | "tie_without_override" | "not_two_before" };

/**
 * Détermine la paire « avant le repère » (2 documents) à partir des années et des overrides en cas d’égalité.
 */
/**
 * @param anneeRepereFin — si défini : période fermée [anneeRepere, anneeRepereFin] (inclusive).
 *   Années strictement avant le début → « avant » ; strictement après la fin → « après » ;
 *   à l’intérieur (ou aux bornes) → `overrides` obligatoire pour classer en avant / après.
 *   Si absent : comportement historique (une seule année pivot).
 */
export function computeCorrectAvantPair(
  orderedSlotIds: DocumentSlotId[],
  documents: Partial<Record<DocumentSlotId, DocumentSlotData>>,
  anneeRepere: number,
  overrides: Partial<Record<DocumentSlotId, "avant" | "apres">>,
  anneeRepereFin?: number,
): ComputeCorrectPairResult {
  const fin = anneeRepereFin;
  const avantList: DocumentSlotId[] = [];
  for (const slotId of orderedSlotIds) {
    const doc = getSlotData(documents, slotId);
    const y = getAnneePourComparaison(doc);
    if (y === null) return { ok: false, code: "missing_year" };
    if (fin === undefined) {
      if (y < anneeRepere) {
        avantList.push(slotId);
      } else if (y > anneeRepere) {
        continue;
      } else {
        const o = overrides[slotId];
        if (o !== "avant" && o !== "apres") return { ok: false, code: "tie_without_override" };
        if (o === "avant") avantList.push(slotId);
      }
    } else {
      if (fin < anneeRepere) return { ok: false, code: "not_two_before" };
      if (y < anneeRepere) {
        avantList.push(slotId);
      } else if (y > fin) {
        continue;
      } else {
        const o = overrides[slotId];
        if (o !== "avant" && o !== "apres") return { ok: false, code: "tie_without_override" };
        if (o === "avant") avantList.push(slotId);
      }
    }
  }
  if (avantList.length !== 2) return { ok: false, code: "not_two_before" };
  return { ok: true, pair: sortSlotPair(avantList[0]!, avantList[1]!) };
}

function shuffleIndices4(rng: AvantApresRng): number[] {
  const idx = [0, 1, 2, 3];
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = idx[i]!;
    idx[i] = idx[j]!;
    idx[j] = tmp;
  }
  return idx;
}

const LETTERS = ["A", "B", "C", "D"] as const;

export type GenerateAvantApresOptionsErrorCode =
  | "missing_year"
  | "tie_without_override"
  | "not_two_before";

export type GenerateAvantApresOptionsResult =
  | {
      ok: true;
      optionRows: AvantApresPartitionRow[];
      /** Lettre affichée (A–D) pour la bonne partition. */
      correctLetter: (typeof LETTERS)[number];
    }
  | { ok: false; code: GenerateAvantApresOptionsErrorCode };

/**
 * Construit 4 lignes (bonne réponse + 3 distracteurs), ordre mélangé. `correct` est toujours l’index 0 dans l’entrée interne avant shuffle.
 */
export function generateAvantApresOptionPartitions(
  orderedSlotIds: DocumentSlotId[],
  documents: Partial<Record<DocumentSlotId, DocumentSlotData>>,
  anneeRepere: number,
  overrides: Partial<Record<DocumentSlotId, "avant" | "apres">>,
  rng: AvantApresRng,
  anneeRepereFin?: number,
): GenerateAvantApresOptionsResult {
  const computed = computeCorrectAvantPair(
    orderedSlotIds,
    documents,
    anneeRepere,
    overrides,
    anneeRepereFin,
  );
  if (!computed.ok) return computed;

  const correctPair = computed.pair;
  const all = allAvantApresPartitions();
  const distractorCandidates = all.filter((p) => partitionKey(p) !== partitionKey(correctPair));
  if (distractorCandidates.length !== 5) {
    return { ok: false, code: "not_two_before" };
  }

  const pickThree: [DocumentSlotId, DocumentSlotId][] = [];
  const pool = [...distractorCandidates];
  for (let k = 0; k < 3; k++) {
    const pick = Math.floor(rng() * pool.length);
    const chosen = pool.splice(pick, 1)[0]!;
    pickThree.push(chosen);
  }

  const fourPairs: [DocumentSlotId, DocumentSlotId][] = [correctPair, ...pickThree];
  const order = shuffleIndices4(rng);
  const shuffled: AvantApresPartitionRow[] = order.map((oi) => rowFromAvantPair(fourPairs[oi]!));

  const correctShuffledIndex = order.indexOf(0);
  if (correctShuffledIndex < 0) {
    return { ok: false, code: "not_two_before" };
  }
  const correctLetter = LETTERS[correctShuffledIndex]!;
  return { ok: true, optionRows: shuffled, correctLetter };
}

export function avantApresRowsMatch(a: AvantApresPartitionRow, b: AvantApresPartitionRow): boolean {
  return (
    partitionKey(a.avantSlots) === partitionKey(b.avantSlots) &&
    partitionKey(a.apresSlots) === partitionKey(b.apresSlots)
  );
}
