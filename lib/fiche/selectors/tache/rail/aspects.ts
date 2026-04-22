import type { TacheFicheData } from "@/lib/types/fiche";

export function selectRailAspects(state: TacheFicheData): { labels: string[] } | null {
  if (state.aspects_societe.length === 0) return null;
  return { labels: state.aspects_societe };
}
