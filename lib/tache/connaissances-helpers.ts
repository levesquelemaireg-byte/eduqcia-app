/**
 * docs/WORKFLOWS.md §7 — Connaissances relatives (`hec-sec1-2.json`, `hqc-sec3-4.json`).
 * Implémentation découpée : `connaissances-types`, `connaissances-parse`, `connaissances-filter`,
 * `connaissances-miller-rules`, `connaissances-selection` — ce fichier réexporte pour les imports `@/lib/tache/connaissances-helpers`.
 */

export type {
  ConnRawRow,
  ConnaissanceSelectionWithIds,
  HecConnRow,
  HqcConnRow,
} from "@/lib/tache/connaissances-types";

export { connDataUrlForDiscipline, parseConnJsonArray } from "@/lib/tache/connaissances-parse";
export { filterConnRowsByNiveau, uniqueInOrder } from "@/lib/tache/connaissances-filter";
export {
  hecBranchNeedsSousColumn,
  hqcBranchNeedsSousColumn,
} from "@/lib/tache/connaissances-miller-rules";
export {
  connaissanceRealiteLookupVariants,
  connaissancesToFicheSlice,
  hecRowToSelection,
  hqcRowToSelection,
  rowToSelectionWithIds,
  sanitizeConnaissances,
} from "@/lib/tache/connaissances-selection";
