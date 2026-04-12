import type { TaeFicheData } from "@/lib/types/fiche";

export function selectRailStatut(state: TaeFicheData): { statut: "brouillon" | "publiee" } {
  return { statut: state.is_published ? "publiee" : "brouillon" };
}
