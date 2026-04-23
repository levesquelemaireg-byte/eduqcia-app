/**
 * Source de vérité unique de l'icône associée à la structure d'un document.
 * Tout rendu d'icône lié à la structure (sommaire wizard, fiche lecture, miniature,
 * impression) DOIT passer par cette fonction — jamais de glyphe en dur.
 *
 * Mapping canonique (Material Symbols Outlined) :
 *   - Document simple                → `crop_square`
 *   - Document à 2 perspectives      → `view_column_2`
 *   - Document à 3 perspectives      → `view_column`
 *   - Document à deux temps          → `view_column_2`
 *
 * Voir `docs/DESIGN-SYSTEM.md` (mapping icônes) et `docs/DECISIONS.md`
 * (cohérence d'icône doc/tâche).
 */
export function iconForDocumentStructure(
  structure: "simple" | "perspectives" | "deux_temps" | null | undefined,
  elementCount: number,
): string {
  if (structure === "perspectives") {
    return elementCount === 3 ? "view_column" : "view_column_2";
  }
  if (structure === "deux_temps") return "view_column_2";
  return "crop_square";
}
