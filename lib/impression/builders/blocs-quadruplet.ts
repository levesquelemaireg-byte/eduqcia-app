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
 * Phase 5 lot 3 : injection du corrigé « simple » (rouge, overlay) directement
 * dans les fragments NR ; pour les rédactionnels, le texte du corrigé est
 * stocké dans `corrigeTexte` et le renderer le positionne sur les lignes
 * vierges (spec §3.5).
 *
 * Spec : docs/specs/SPEC-PIPELINE-RENDU-IMPRIME.md §3.1-3.3, §3.5, §12 Phase 5.
 */

import type {
  DonneesTache,
  Guidage,
  EspaceProduction,
  OutilEvaluation,
} from "@/lib/tache/contrats/donnees";
import type { Bloc } from "@/lib/epreuve/pagination/types";
import type { ModeCorrige } from "@/lib/impression/types";
import { extraireFragmentsNR, type FragmentsNR } from "@/lib/impression/extraire-fragments-nr";
import { produireCorrigeSimpleNR } from "@/lib/impression/produire-corrige-simple";

export type OptionsBlocQuadruplet = {
  guidageVisible: boolean;
  /** Mode du corrigé — pilote l'overlay rouge (cf. spec §3.5). */
  corrige: ModeCorrige;
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
  /**
   * Pour les rédactionnels avec corrigé : texte de la réponse attendue
   * positionné en rouge italique sur les lignes vierges. `null` sinon.
   * Les NR n'utilisent pas ce champ — l'overlay est déjà dans les fragments.
   */
  corrigeTexte: string | null;
};

/**
 * Construit un Bloc de type "quadruplet" à partir des champs d'une tâche.
 *
 * Si `guidageVisible` est false, le guidage est mis à null (mode sommatif).
 * Si la consigne est un parcours NR (détecté via les attributs `data-*-eleve`),
 * elle est découpée en `FragmentsNR` pour le renderer ; quand `corrige !== null`,
 * l'overlay rouge est injecté dans ces fragments via `produireCorrigeSimpleNR`.
 */
export function construireBlocQuadruplet(
  tache: Pick<
    DonneesTache,
    "id" | "titre" | "consigne" | "guidage" | "espaceProduction" | "outilEvaluation" | "corrige"
  >,
  options: OptionsBlocQuadruplet,
): Bloc {
  const guidage: Guidage = options.guidageVisible ? tache.guidage : null;
  const fragments = extraireFragmentsNR(tache.consigne);
  const aCorrige = options.corrige !== null && tache.corrige.trim().length > 0;

  let consigne: string | FragmentsNR;
  let corrigeTexte: string | null = null;
  if (fragments) {
    consigne = aCorrige ? produireCorrigeSimpleNR(fragments, tache.corrige) : fragments;
  } else {
    consigne = tache.consigne;
    corrigeTexte = aCorrige ? tache.corrige : null;
  }

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
      corrigeTexte,
    } satisfies ContenuBlocQuadruplet,
  };
}
