/**
 * Ordre d'affichage des auteurs (pied de fiche / sommaire) : tri par nom de famille.
 */

import { getSortKey } from "@/lib/utils/profile-display";

export function sortAuteursByFamilyName<T extends { first_name: string; last_name: string }>(
  auteurs: readonly T[],
): T[] {
  return [...auteurs].sort((a, b) => {
    const ka = getSortKey(a.first_name, a.last_name);
    const kb = getSortKey(b.first_name, b.last_name);
    return ka.localeCompare(kb, "fr-CA", { sensitivity: "base" });
  });
}

/**
 * Découpe un « displayName » (ex. "Prénom Nom") en first_name/last_name.
 * Utilisé pour les collaborateurs du wizard dont on n'a que displayName.
 */
export function splitDisplayName(displayName: string): { first_name: string; last_name: string } {
  const t = displayName.trim();
  if (!t) return { first_name: "", last_name: "" };
  const lastSpace = t.lastIndexOf(" ");
  if (lastSpace === -1) return { first_name: t, last_name: "" };
  return {
    first_name: t.slice(0, lastSpace),
    last_name: t.slice(lastSpace + 1),
  };
}
