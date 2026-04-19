import type { DocumentElementFormValues } from "@/lib/schemas/autonomous-document";

/**
 * Crée un élément de document vide avec un ID client unique.
 * §2.10 — aucune pré-sélection : `type` et `source_type` sont `null`
 * tant que l'utilisateur n'a rien choisi.
 */
export function createEmptyElement(): DocumentElementFormValues {
  return {
    id: crypto.randomUUID(),
    type: null,
    contenu: "",
    image_url: "",
    image_intrinsic_width: undefined,
    image_intrinsic_height: undefined,
    source_citation: "",
    source_type: null,
    image_legende: "",
    image_legende_position: null,
    type_iconographique: null,
    categorie_textuelle: null,
    auteur: "",
    repere_temporel: "",
    sous_titre: "",
  };
}

/** Crée le tableau d'éléments vides selon la structure et le nombre de perspectives. */
export function createElementsForStructure(
  structure: "simple" | "perspectives" | "deux_temps",
  nbPerspectives?: 2 | 3,
): DocumentElementFormValues[] {
  if (structure === "simple") return [createEmptyElement()];
  if (structure === "perspectives") {
    const count = nbPerspectives ?? 2;
    return Array.from({ length: count }, () => createEmptyElement());
  }
  return [createEmptyElement(), createEmptyElement()];
}
