/**
 * Builder de bloc quadruplet — couche 1.
 *
 * Transforme les champs d'une tâche en Bloc quadruplet imprimable
 * (consigne + guidage + espace de production + outil d'évaluation).
 *
 * Spec : docs/specs/spec-impression-tache-seule.md §3, couche 1.
 */

import type {
  DonneesTache,
  Guidage,
  EspaceProduction,
  OutilEvaluation,
} from "@/lib/tache/contrats/donnees";
import type { Bloc } from "@/lib/epreuve/pagination/types";

export type OptionsBlocQuadruplet = {
  guidageVisible: boolean;
};

/** Contenu structuré d'un bloc quadruplet (consommé par SectionQuadruplet). */
export type ContenuBlocQuadruplet = {
  titre: string;
  consigne: string;
  guidage: Guidage;
  espaceProduction: EspaceProduction;
  outilEvaluation: OutilEvaluation;
};

/**
 * Construit un Bloc de type "quadruplet" à partir des champs d'une tâche.
 *
 * Si `guidageVisible` est false, le guidage est mis à null (mode sommatif).
 */
export function construireBlocQuadruplet(
  tache: Pick<
    DonneesTache,
    "id" | "titre" | "consigne" | "guidage" | "espaceProduction" | "outilEvaluation"
  >,
  options: OptionsBlocQuadruplet,
): Bloc {
  const guidage: Guidage = options.guidageVisible ? tache.guidage : null;

  return {
    id: `quadruplet-${tache.id}`,
    kind: "quadruplet",
    tacheId: tache.id,
    content: {
      titre: tache.titre,
      consigne: tache.consigne,
      guidage,
      espaceProduction: tache.espaceProduction,
      outilEvaluation: tache.outilEvaluation,
    } satisfies ContenuBlocQuadruplet,
  };
}
