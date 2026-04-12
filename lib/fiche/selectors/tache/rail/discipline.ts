import type { TaeFicheData } from "@/lib/types/fiche";

export function selectRailDiscipline(state: TaeFicheData): { label: string } {
  return { label: state.discipline.label };
}
