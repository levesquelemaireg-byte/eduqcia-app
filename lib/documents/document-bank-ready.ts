import type { Database } from "@/lib/types/database";

type DocRow = Pick<
  Database["public"]["Tables"]["documents"]["Row"],
  | "niveaux_ids"
  | "disciplines_ids"
  | "connaissances_ids"
  | "aspects_societe"
  | "repere_temporel"
  | "annee_normalisee"
>;

/**
 * Document éligible à la banque : indexation minimale + repère temporel ou année normalisée.
 */
export function isDocumentReadyForBank(row: DocRow): boolean {
  const n = row.niveaux_ids ?? [];
  const d = row.disciplines_ids ?? [];
  const c = row.connaissances_ids ?? [];
  const a = row.aspects_societe ?? [];
  if (n.length === 0 || d.length === 0 || c.length === 0 || a.length === 0) return false;
  const rt = (row.repere_temporel ?? "").trim();
  if (rt.length > 0) return true;
  if (row.annee_normalisee != null && Number.isFinite(row.annee_normalisee)) return true;
  return false;
}
