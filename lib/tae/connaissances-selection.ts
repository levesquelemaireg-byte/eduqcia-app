/**
 * Sélection / persistance connaissances (UI, fiche, lookup publication).
 */

import type { DisciplineCode } from "@/lib/tae/blueprint-helpers";
import type {
  ConnRawRow,
  ConnaissanceSelectionWithIds,
  HecConnRow,
  HqcConnRow,
} from "@/lib/tae/connaissances-types";
import type { ConnaissanceSelection } from "@/lib/types/fiche";

export function hecRowToSelection(r: HecConnRow): ConnaissanceSelection {
  return {
    realite_sociale: r.realite_sociale,
    section: r.section,
    sous_section: r.sous_section,
    enonce: r.enonce,
  };
}

/** Colonne 1 HQC : période + réalité sociale (DOMAIN §6.4). */
export function hqcRowToSelection(r: HqcConnRow): ConnaissanceSelection {
  return {
    realite_sociale: `${r.periode} — ${r.realite_sociale}`,
    section: r.section,
    sous_section: r.sous_section,
    enonce: r.enonce,
  };
}

export function rowToSelectionWithIds(r: ConnRawRow): ConnaissanceSelectionWithIds {
  if (r.kind === "hec") {
    return { rowId: r.id, ...hecRowToSelection(r) };
  }
  return { rowId: r.id, ...hqcRowToSelection(r) };
}

const HQC_REALITE_SEP = " — ";

/**
 * Valeurs possibles de `realite_sociale` pour un lookup SQL sur `connaissances`.
 * HQC : l’UI / `hqcRowToSelection` utilisent « période — réalité » (DOMAIN §6.4) alors que le seed
 * historique n’insérait que le libellé `realite_sociale` du JSON — il faut essayer les deux.
 */
export function connaissanceRealiteLookupVariants(
  discipline: DisciplineCode,
  realiteSociale: string,
): string[] {
  const v = realiteSociale.trim();
  const out: string[] = [v];
  if (discipline === "hqc") {
    const i = v.indexOf(HQC_REALITE_SEP);
    if (i >= 0) {
      const tail = v.slice(i + HQC_REALITE_SEP.length).trim();
      if (tail.length > 0 && !out.includes(tail)) out.push(tail);
    }
  }
  return out;
}

/** Pour `TaeFicheData` / API — retire l’identifiant de ligne du JSON source. */
export function connaissancesToFicheSlice(
  rows: ConnaissanceSelectionWithIds[],
): ConnaissanceSelection[] {
  return rows.map(({ rowId: _rowId, ...rest }) => rest);
}

export function sanitizeConnaissances(raw: unknown): ConnaissanceSelectionWithIds[] {
  if (!Array.isArray(raw)) return [];
  const out: ConnaissanceSelectionWithIds[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    let rowId = typeof o.rowId === "string" ? o.rowId : "";
    const realite_sociale = typeof o.realite_sociale === "string" ? o.realite_sociale : "";
    const section = typeof o.section === "string" ? o.section : "";
    const enonce = typeof o.enonce === "string" ? o.enonce : "";
    const sous_section =
      o.sous_section === null ? null : typeof o.sous_section === "string" ? o.sous_section : null;
    if (!realite_sociale || !section || !enonce) continue;
    if (!rowId) {
      rowId = `derived:${realite_sociale}\x1f${section}\x1f${sous_section ?? ""}\x1f${enonce}`;
    }
    out.push({ rowId, realite_sociale, section, sous_section, enonce });
  }
  return out;
}
