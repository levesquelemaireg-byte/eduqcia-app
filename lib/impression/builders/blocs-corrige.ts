/**
 * Builder de bloc corrigé — couche 1.
 *
 * Construit un Bloc contenant le corrigé d'une tâche.
 * Utilisé quand `estCorrige === true` et que le corrigé est non vide.
 *
 * Spec : docs/specs/spec-impression-tache-seule.md §3, couche 1.
 */

import type { DonneesTache, OutilEvaluation } from "@/lib/tache/contrats/donnees";
import type { Bloc } from "@/lib/epreuve/pagination/types";

/** Contenu structuré d'un bloc corrigé (consommé par SectionCorrige). */
export type ContenuBlocCorrige = {
  titre: string;
  corrige: string;
  outilEvaluation: OutilEvaluation;
};

/**
 * Construit un Bloc de type "quadruplet" contenant le corrigé.
 *
 * Utilise `kind: "quadruplet"` pour réutiliser le dispatch de rendu existant
 * (distinction par type guard sur `corrige` vs `consigne`).
 */
export function construireBlocCorrige(
  tache: Pick<DonneesTache, "id" | "titre" | "corrige" | "outilEvaluation">,
): Bloc {
  return {
    id: `corrige-${tache.id}`,
    kind: "quadruplet",
    tacheId: tache.id,
    content: {
      titre: tache.titre,
      corrige: tache.corrige,
      outilEvaluation: tache.outilEvaluation,
    } satisfies ContenuBlocCorrige,
  };
}
