import type { TaeFicheData } from "@/lib/types/fiche";

export function selectRailAspects(state: TaeFicheData): { labels: string[] } | null {
  if (state.aspects_societe.length === 0) return null;
  return { labels: state.aspects_societe };
}
