/**
 * Associe les lignes `connaissances` (Supabase) aux entrées du JSON Miller (ids string)
 * pour la réhydratation du wizard — voir étape indexation (`selectedIds.has(r.id)`).
 */

import type { DisciplineCode } from "@/lib/tache/blueprint-helpers";
import { connaissanceRealiteLookupVariants } from "@/lib/tache/connaissances-helpers";
import { rowToSelectionWithIds } from "@/lib/tache/connaissances-selection";
import type {
  ConnRawRow,
  ConnaissanceSelectionWithIds,
  HecConnRow,
  HqcConnRow,
} from "@/lib/tache/connaissances-types";

export type DbConnaissanceRow = {
  id: number;
  realite_sociale: string;
  section: string;
  sous_section: string | null;
  enonce: string;
};

function normSous(s: string | null | undefined): string | null {
  if (s === undefined || s === null || s === "") return null;
  return s;
}

function hecRowMatchesDb(r: HecConnRow, db: DbConnaissanceRow): boolean {
  if (r.section !== db.section || r.enonce !== db.enonce) return false;
  if (normSous(r.sous_section) !== normSous(db.sous_section)) return false;
  return r.realite_sociale === db.realite_sociale;
}

function hqcRowMatchesDb(r: HqcConnRow, db: DbConnaissanceRow): boolean {
  if (r.section !== db.section || r.enonce !== db.enonce) return false;
  if (normSous(r.sous_section) !== normSous(db.sous_section)) return false;
  const composite = `${r.periode} — ${r.realite_sociale}`;
  if (db.realite_sociale === composite) return true;
  if (db.realite_sociale === r.realite_sociale) return true;
  const variants = connaissanceRealiteLookupVariants("hqc", db.realite_sociale);
  return variants.includes(r.realite_sociale);
}

/**
 * @param filteredJsonRows — déjà filtré par niveau (`filterConnRowsByNiveau`), comme côté client.
 * @param dbRowsInOrder — ordre `tache.connaissances_ids`.
 */
export function matchDbConnaissancesToJsonSelections(
  discipline: DisciplineCode,
  filteredJsonRows: ConnRawRow[],
  dbRowsInOrder: DbConnaissanceRow[],
): ConnaissanceSelectionWithIds[] | null {
  if (discipline === "geo") return [];
  const out: ConnaissanceSelectionWithIds[] = [];
  for (const db of dbRowsInOrder) {
    const found = filteredJsonRows.find((row) =>
      row.kind === "hec" ? hecRowMatchesDb(row, db) : hqcRowMatchesDb(row, db),
    );
    if (!found) return null;
    out.push(rowToSelectionWithIds(found));
  }
  return out;
}
