/**
 * Ordre d’affichage des auteurs (pied de fiche / sommaire) : tri par nom de famille.
 * `profiles.full_name` est souvent « Prénom Nom » ; si « Nom, Prénom », la partie avant la virgule sert de clé.
 */

export function familyNameSortKey(fullName: string): string {
  const t = fullName.trim();
  if (!t) return "";
  const comma = t.indexOf(",");
  if (comma !== -1) {
    return t.slice(0, comma).trim();
  }
  const parts = t.split(/\s+/u);
  return parts.length > 0 ? parts[parts.length - 1]! : t;
}

export function sortAuteursByFamilyName<T extends { full_name: string }>(
  auteurs: readonly T[],
): T[] {
  return [...auteurs].sort((a, b) => {
    const ka = familyNameSortKey(a.full_name);
    const kb = familyNameSortKey(b.full_name);
    const cmp = ka.localeCompare(kb, "fr-CA", { sensitivity: "base" });
    if (cmp !== 0) return cmp;
    return a.full_name.localeCompare(b.full_name, "fr-CA", { sensitivity: "base" });
  });
}
