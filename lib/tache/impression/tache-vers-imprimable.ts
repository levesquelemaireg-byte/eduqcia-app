/**
 * Point d'entrée impression tâche seule — couche 2.
 *
 * Transforme une `DonneesTache` + options en `RenduImprimable`.
 * Utilise les builders de couche 1, puis le pager existant.
 *
 * Pas d'en-tête, pas de feuillets — tous les blocs paginés ensemble.
 *
 * Spec : docs/specs/spec-impression-tache-seule.md §3, couche 2.
 */

import type { DonneesTache } from "@/lib/tache/contrats/donnees";
import type { ModeImpression } from "@/lib/epreuve/pagination/types";
import type { Mesureur } from "@/lib/epreuve/pagination/pager";
import { mesurerBloc, verifierDebordement, paginer } from "@/lib/epreuve/pagination/pager";
import { construireBlocsTache } from "@/lib/impression/builders/blocs-tache";
import type { RenduImprimable } from "@/lib/impression/types";

export type OptionsTacheImprimable = {
  mode: ModeImpression;
  estCorrige: boolean;
};

/**
 * Calcule une empreinte déterministe pour la détection d'invalidation.
 * Hash FNV-1a 32 bits — suffisant pour la détection de changement.
 */
function calculerEmpreinte(tache: DonneesTache, options: OptionsTacheImprimable): string {
  const payload = JSON.stringify({
    id: tache.id,
    consigne: tache.consigne,
    guidage: tache.guidage,
    documents: tache.documents.map((d) => d.id),
    corrige: tache.corrige,
    mode: options.mode,
    estCorrige: options.estCorrige,
  });
  let hash = 0x811c9dc5;
  for (let i = 0; i < payload.length; i++) {
    hash ^= payload.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

/**
 * Transforme une tâche seule en rendu imprimable.
 *
 * Fonction pure : pas d'effet de bord, pas de DOM, pas d'I/O.
 * Le `mesureur` est injecté pour permettre le test unitaire.
 */
export function tacheVersImprimable(
  tache: DonneesTache,
  options: OptionsTacheImprimable,
  mesureur: Mesureur,
): RenduImprimable {
  // Couche 1 : construire les blocs
  const blocs = construireBlocsTache(tache, options);

  // Mesurer chaque bloc
  const blocsMesures = blocs.map((b) => mesurerBloc(b, mesureur));

  // Vérifier le débordement
  const erreur = verifierDebordement(blocsMesures);
  if (erreur) {
    return { ok: false, erreur };
  }

  // Paginer — feuillet 'questionnaire' (valeur par défaut pour tâche seule)
  const pages = paginer(blocsMesures, "questionnaire");

  return {
    ok: true,
    empreinte: calculerEmpreinte(tache, options),
    contexte: { type: "tache", mode: options.mode, estCorrige: options.estCorrige },
    enTete: null,
    pages,
  };
}
