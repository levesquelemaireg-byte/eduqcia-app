/**
 * Orchestrateur de builders — couche 1.
 *
 * Assemble les blocs d'une tâche (documents + quadruplet + corrigé optionnel)
 * selon le mode d'impression et le flag corrigé.
 *
 * Réutilisé par :
 * - `tacheVersImprimable` (tâche seule — tous les blocs paginés ensemble)
 * - `epreuveVersImprimable` (épreuve — blocs séparés ensuite par feuillet)
 *
 * Spec : docs/specs/spec-impression-tache-seule.md §3, couche 1.
 */

import type { DonneesTache } from "@/lib/tache/contrats/donnees";
import type { ModeImpression, Bloc } from "@/lib/epreuve/pagination/types";
import { reglesVisibilite } from "./regles-visibilite";
import { construireBlocDocument } from "./blocs-document";
import { construireBlocQuadruplet } from "./blocs-quadruplet";
import { construireBlocCorrige } from "./blocs-corrige";

export type OptionsBlocsTache = {
  mode: ModeImpression;
  estCorrige: boolean;
};

/**
 * Sous-ensemble de `DonneesTache` consommé par l'orchestrateur.
 * Défini comme Pick local (spec D0).
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

/**
 * Construit tous les blocs d'une tâche dans l'ordre d'impression :
 * 1. Documents (un bloc par document)
 * 2. Quadruplet (consigne + guidage + espace prod + outil eval)
 * 3. Corrigé (optionnel, si `estCorrige` et corrigé non vide)
 *
 * Applique les règles de visibilité (titres docs, guidage) selon le mode.
 */
export function construireBlocsTache(tache: TacheImpression, options: OptionsBlocsTache): Bloc[] {
  const regles = reglesVisibilite(options.mode);
  const blocs: Bloc[] = [];

  // Documents
  for (const doc of tache.documents) {
    blocs.push(construireBlocDocument(doc, { titreVisible: regles.titresDocumentsVisibles }));
  }

  // Quadruplet
  blocs.push(construireBlocQuadruplet(tache, { guidageVisible: regles.guidageVisible }));

  // Corrigé optionnel
  if (options.estCorrige && tache.corrige) {
    blocs.push(construireBlocCorrige(tache));
  }

  return blocs;
}
