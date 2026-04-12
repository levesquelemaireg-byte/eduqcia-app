import type { TaeFicheData } from "@/lib/types/fiche";

export function selectRailNiveau(state: TaeFicheData): { label: string } {
  return { label: state.niveau.label };
}
