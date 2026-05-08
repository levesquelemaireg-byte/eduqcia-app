"use client";

/**
 * Bloc 5 — manifestations (OI5, comportements 5.1 / 5.2).
 *
 * Étape de corrigé : assignation manuelle de chaque document à sa catégorie.
 * Implémentation complète au Lot 2 — ce fichier sert de point de branchement
 * pour le `BLOC5_DYNAMIC_BY_SLUG` au Lot 1, afin que le typage `ComportementSlug`
 * reste exhaustif sur le `Record<ComportementSlug, ComponentType<Bloc5Props>>`.
 */

import type { Bloc5Props } from "@/lib/tache/tache-form-state-types";

export default function Bloc5Manifestations(_props: Bloc5Props) {
  return (
    <p className="text-sm leading-relaxed text-muted">
      Implémentation à venir au Lot 2 — assignation des documents aux catégories.
    </p>
  );
}
