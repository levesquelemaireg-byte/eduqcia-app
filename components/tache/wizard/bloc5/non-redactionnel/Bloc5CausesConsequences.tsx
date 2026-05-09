"use client";

/**
 * Bloc 5 — causes-consequences (OI4, comportements 4.3 / 4.4).
 *
 * Étape de corrigé : assignation manuelle de chaque document à son rôle
 * causal (facteur explicatif, cause, conséquence). Implémentation complète
 * au Lot 2 — ce fichier sert de point de branchement pour le
 * `BLOC5_DYNAMIC_BY_SLUG` au Lot 1, afin que le typage `ComportementSlug`
 * reste exhaustif sur le `Record<ComportementSlug, ComponentType<Bloc5Props>>`.
 */

import type { Bloc5Props } from "@/lib/tache/tache-form-state-types";

export default function Bloc5CausesConsequences(_props: Bloc5Props) {
  return (
    <p className="text-sm leading-relaxed text-muted">
      Implémentation à venir au Lot 2 — assignation des documents aux rôles causaux.
    </p>
  );
}
