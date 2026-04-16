/**
 * Règles de visibilité par mode d'impression — couche 1 partagée.
 *
 * Factorisé depuis lib/epreuve/transformation/regles-visibilite.ts.
 * Réutilisé par construireBlocsTache (tâche seule) et epreuveVersImprimable.
 *
 * Spec : docs/specs/spec-impression-tache-seule.md §3, couche 1.
 */

import type { ModeImpression } from "@/lib/epreuve/pagination/types";

export type ReglesVisibilite = {
  guidageVisible: boolean;
  titresDocumentsVisibles: boolean;
};

/** Retourne les règles de visibilité pour un mode d'impression donné. */
export function reglesVisibilite(mode: ModeImpression): ReglesVisibilite {
  return {
    guidageVisible: mode === "formatif",
    titresDocumentsVisibles: mode === "formatif",
  };
}
