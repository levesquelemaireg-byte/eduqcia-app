/**
 * Orchestrateur de builders — couche 1.
 *
 * Assemble les blocs d'une tâche selon le mode d'impression et le flag corrigé :
 *   1. Dossier (1 bloc dossier-page par page de grille bicolonnée)
 *   2. Quadruplet (consigne + guidage + espace prod + outil eval)
 *   3. Corrigé (optionnel, si `estCorrige` et corrigé non vide)
 *
 * Réutilisé par `tacheVersImprimable` (tâche seule — tous les blocs paginés
 * ensemble) et indirectement par `epreuveVersImprimable` via les builders
 * homologues du feuillet épreuve.
 */

import type { DonneesTache } from "@/lib/tache/contrats/donnees";
import type { ModeImpression, Bloc } from "@/lib/epreuve/pagination/types";
import { reglesVisibilite } from "./regles-visibilite";
import { construireBlocsDossierPages } from "./blocs-dossier-pages";
import { construireBlocQuadruplet } from "./blocs-quadruplet";
import { construireBlocCorrige } from "./blocs-corrige";

export type OptionsBlocsTache = {
  mode: ModeImpression;
  estCorrige: boolean;
};

/**
 * Sous-ensemble de `DonneesTache` consommé par l'orchestrateur.
 */
type TacheImpression = Pick<
  DonneesTache,
  | "id"
  | "titre"
  | "consigne"
  | "guidage"
  | "documents"
  | "espaceProduction"
  | "outilEvaluation"
  | "corrige"
>;

export function construireBlocsTache(tache: TacheImpression, options: OptionsBlocsTache): Bloc[] {
  const regles = reglesVisibilite(options.mode);
  const blocs: Bloc[] = [];

  // Dossier documentaire — pages de grille bicolonnée. Numéros 1..N locaux à la tâche.
  const docsNumerotes = tache.documents.map((document, i) => ({
    numeroGlobal: i + 1,
    document,
  }));
  blocs.push(
    ...construireBlocsDossierPages(
      docsNumerotes,
      { titresVisibles: regles.titresDocumentsVisibles },
      `tache-${tache.id}-dossier`,
    ),
  );

  // Quadruplet
  blocs.push(construireBlocQuadruplet(tache, { guidageVisible: regles.guidageVisible }));

  // Corrigé optionnel
  if (options.estCorrige && tache.corrige) {
    blocs.push(construireBlocCorrige(tache));
  }

  return blocs;
}
