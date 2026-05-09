/**
 * Builder de bloc quadruplet — couche 1.
 *
 * Transforme les champs d'une tâche en Bloc quadruplet imprimable
 * (consigne + guidage + espace de production + outil d'évaluation).
 *
 * Pour les parcours NR, la consigne string est découpée en `FragmentsNR`
 * (intro / corps / reponse) afin que le renderer puisse insérer le guidage
 * entre intro et corps (cf. spec §3.2 et §3.3). Pour les rédactionnels, la
 * consigne reste un string.
 *
 * Spec : docs/specs/SPEC-PIPELINE-RENDU-IMPRIME.md §3.1-3.3, §12 Phase 1.
 */

import type {
  DonneesTache,
  Guidage,
  EspaceProduction,
  OutilEvaluation,
} from "@/lib/tache/contrats/donnees";
import type { Bloc } from "@/lib/epreuve/pagination/types";
import { extraireFragmentsNR, type FragmentsNR } from "@/lib/impression/extraire-fragments-nr";

export type OptionsBlocQuadruplet = {
  guidageVisible: boolean;
};

/** Contenu structuré d'un bloc quadruplet (consommé par SectionQuadruplet). */
export type ContenuBlocQuadruplet = {
  titre: string;
  /** String pour les rédactionnels, `FragmentsNR` (intro/corps/reponse) pour les NR. */
  consigne: string | FragmentsNR;
  guidage: Guidage;
  /** `null` pour les NR — la zone réponse est dans `consigne.reponse` ou `consigne.corps`. */
  espaceProduction: EspaceProduction | null;
  outilEvaluation: OutilEvaluation;
};

/**
 * Construit un Bloc de type "quadruplet" à partir des champs d'une tâche.
 *
 * Si `guidageVisible` est false, le guidage est mis à null (mode sommatif).
 * Si la consigne est un parcours NR (détecté via les attributs `data-*-eleve`),
 * elle est découpée en `FragmentsNR` pour le renderer.
 */
export function construireBlocQuadruplet(
  tache: Pick<
    DonneesTache,
    "id" | "titre" | "consigne" | "guidage" | "espaceProduction" | "outilEvaluation"
  >,
  options: OptionsBlocQuadruplet,
): Bloc {
  const guidage: Guidage = options.guidageVisible ? tache.guidage : null;
  const fragments = extraireFragmentsNR(tache.consigne);
  const consigne: string | FragmentsNR = fragments ?? tache.consigne;

  return {
    id: `quadruplet-${tache.id}`,
    kind: "quadruplet",
    tacheId: tache.id,
    content: {
      titre: tache.titre,
      consigne,
      guidage,
      espaceProduction: tache.espaceProduction,
      outilEvaluation: tache.outilEvaluation,
    } satisfies ContenuBlocQuadruplet,
  };
}
