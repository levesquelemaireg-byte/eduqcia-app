/**
 * docs/WORKFLOWS.md §7.2 — afficher la colonne « Sous-section » seulement si la branche en contient.
 * Les données HEC sont homogènes par (réalité, section) : soit toutes les lignes ont `sous_section`,
 * soit aucune. Même règle HQC pour (période, réalité sociale, section).
 */

import type { HecConnRow, HqcConnRow } from "@/lib/tache/connaissances-types";

export function hecBranchNeedsSousColumn(
  rows: HecConnRow[],
  realite: string,
  section: string,
): boolean {
  const row = rows.find((r) => r.realite_sociale === realite && r.section === section);
  return row != null && row.sous_section !== null;
}

export function hqcBranchNeedsSousColumn(
  rows: HqcConnRow[],
  periode: string,
  realiteSociale: string,
  section: string,
): boolean {
  const row = rows.find(
    (r) => r.periode === periode && r.realite_sociale === realiteSociale && r.section === section,
  );
  return row != null && row.sous_section !== null;
}
