/**
 * Types pour le référentiel connaissances (HEC / HQC) — docs/WORKFLOWS.md §7.
 */

import type { ConnaissanceSelection } from "@/lib/types/fiche";

export type HecConnRow = {
  kind: "hec";
  id: string;
  niveau: string;
  realite_sociale: string;
  section: string;
  sous_section: string | null;
  enonce: string;
};

export type HqcConnRow = {
  kind: "hqc";
  id: string;
  niveau: string;
  periode: string;
  realite_sociale: string;
  section: string;
  sous_section: string | null;
  enonce: string;
};

export type ConnRawRow = HecConnRow | HqcConnRow;

export type ConnaissanceSelectionWithIds = ConnaissanceSelection & { rowId: string };
