import type { TaeFicheData } from "@/lib/types/fiche";
import { lookupPeriode } from "@/lib/tache/periode-lookup";

/** Retourne le parent racine des connaissances (réalité sociale du premier élément) et sa période. */
export function selectRailChapitreConnaissances(
  state: TaeFicheData,
): { racine: string; periode: string | null } | null {
  if (state.connaissances.length === 0) return null;
  const racine = state.connaissances[0].realite_sociale;
  return { racine, periode: lookupPeriode(racine) };
}
