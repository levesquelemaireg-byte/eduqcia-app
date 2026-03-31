/**
 * docs/WORKFLOWS.md §7 — Connaissances relatives (`hec-sec1-2.json`, `hqc-sec3-4.json`).
 * Implémentation découpée : `connaissances-types`, `connaissances-parse`, `connaissances-filter`,
 * `connaissances-miller-rules`, `connaissances-selection` — ce fichier réexporte pour les imports `@/lib/tae/connaissances-helpers`.
 */

export type {
  ConnRawRow,
  ConnaissanceSelectionWithIds,
  HecConnRow,
  HqcConnRow,
} from "@/lib/tae/connaissances-types";

export { connDataUrlForDiscipline, parseConnJsonArray } from "@/lib/tae/connaissances-parse";
export { filterConnRowsByNiveau, uniqueInOrder } from "@/lib/tae/connaissances-filter";
export {
  hecBranchNeedsSousColumn,
  hqcBranchNeedsSousColumn,
} from "@/lib/tae/connaissances-miller-rules";
export {
  connaissanceRealiteLookupVariants,
  connaissancesToFicheSlice,
  hecRowToSelection,
  hqcRowToSelection,
  rowToSelectionWithIds,
  sanitizeConnaissances,
} from "@/lib/tae/connaissances-selection";
