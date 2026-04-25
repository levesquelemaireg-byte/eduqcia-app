"use client";

/**
 * Stub Lot 1 — composant Bloc 5 pour le parcours « carte historique » (OI2).
 * L'UI complète (3 sous-modes 2.1 / 2.2 / 2.3) est livrée au Lot 2.
 * Présent dès maintenant pour satisfaire le `Record<ComportementSlug, …>` de
 * `BLOC5_DYNAMIC_BY_SLUG` et permettre une compilation propre du Lot 1.
 */

import type { Bloc5Props } from "@/lib/tache/tache-form-state-types";

export default function Bloc5CarteHistorique(_props: Bloc5Props) {
  return (
    <p className="text-sm leading-relaxed text-muted">
      L&rsquo;étape 5 du parcours carte historique sera disponible au prochain lot.
    </p>
  );
}
