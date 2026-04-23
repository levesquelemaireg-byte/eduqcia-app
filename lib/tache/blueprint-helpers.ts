import type { ComportementAttenduJson, OiEntryJson } from "@/lib/types/oi";
import type { AspectSocieteKey } from "@/lib/tache/redaction-helpers";

/** Valeur par défaut du nombre de lignes (wizard bloc 2) — réinitialisée avec OI / comportement / niveau / discipline. */
export const BLUEPRINT_INITIAL_NB_LIGNES = 5;

export type NiveauCode = "sec1" | "sec2" | "sec3" | "sec4";
export type DisciplineCode = "hec" | "geo" | "hqc";

/** docs/WORKFLOWS.md §3.2 — cascade niveau → discipline */
export function disciplinesForNiveau(niveau: NiveauCode | ""): DisciplineCode[] {
  if (niveau === "sec1" || niveau === "sec2") return ["hec", "geo"];
  if (niveau === "sec3" || niveau === "sec4") return ["hqc"];
  return [];
}

/** Sec 3 / 4 : une seule discipline — assignation automatique en lecture seule au wizard. */
export function isDisciplineAutoAssignedForNiveau(niveau: string): boolean {
  return niveau === "sec3" || niveau === "sec4";
}

/** docs/FEATURES.md §2.2 — comportement sélectionnable au formulaire */
export function isComportementSelectable(c: ComportementAttenduJson): boolean {
  if ((c.status ?? "active") === "coming_soon") return false;
  if (c.nb_documents == null) return false;
  return true;
}

export function findOi(oiList: OiEntryJson[], oiId: string): OiEntryJson | undefined {
  return oiList.find((o) => o.id === oiId);
}

export function findComportement(
  oi: OiEntryJson | undefined,
  comportementId: string,
): ComportementAttenduJson | undefined {
  return oi?.comportements_attendus.find((c) => c.id === comportementId);
}

export type DocumentSlotId = `doc_${number}`;

export function documentSlotsFromCount(n: number): { slotId: DocumentSlotId }[] {
  if (n <= 0) return [];
  return Array.from({ length: n }, (_, i) => ({ slotId: `doc_${i + 1}` as DocumentSlotId }));
}

export function isBlueprintFieldsComplete(b: {
  niveau: string;
  discipline: string;
  oiId: string;
  comportementId: string;
  nbLignes: number | null;
  nbDocuments: number | null;
  typeTache?: "section_a" | "section_b" | "section_c";
  aspectA?: AspectSocieteKey | null;
  aspectB?: AspectSocieteKey | null;
}): boolean {
  if (!b.niveau || !b.discipline || !b.oiId || !b.comportementId) return false;
  if (b.nbDocuments == null) return false;
  if (b.nbLignes == null || b.nbLignes < 0 || b.nbLignes > 10) return false;
  if (b.typeTache === "section_b") {
    if (!b.aspectA || !b.aspectB) return false;
    if (b.aspectA === b.aspectB) return false;
  }
  return true;
}

/** Valeur `nb_lignes` ministérielle pour le blueprint — source `oi.json` uniquement. */
export function nbLignesFromComportementJson(c: ComportementAttenduJson): number {
  const raw = c.nb_lignes;
  if (typeof raw === "number" && Number.isFinite(raw)) {
    const r = Math.round(raw);
    if (r >= 0 && r <= 10) return r;
  }
  return BLUEPRINT_INITIAL_NB_LIGNES;
}
