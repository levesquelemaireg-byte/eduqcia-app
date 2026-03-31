import type { ComportementAttenduJson, OiEntryJson } from "@/lib/types/oi";

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

export type DocumentSlotId = "doc_A" | "doc_B" | "doc_C" | "doc_D";

export function documentSlotsFromCount(n: number): { slotId: DocumentSlotId }[] {
  const ids: DocumentSlotId[] = ["doc_A", "doc_B", "doc_C", "doc_D"];
  return ids.slice(0, Math.min(n, 4)).map((slotId) => ({ slotId }));
}

export function isBlueprintFieldsComplete(b: {
  niveau: string;
  discipline: string;
  oiId: string;
  comportementId: string;
  nbLignes: number | null;
  nbDocuments: number | null;
}): boolean {
  if (!b.niveau || !b.discipline || !b.oiId || !b.comportementId) return false;
  if (b.nbDocuments == null) return false;
  if (b.nbLignes == null || b.nbLignes < 0 || b.nbLignes > 10) return false;
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
