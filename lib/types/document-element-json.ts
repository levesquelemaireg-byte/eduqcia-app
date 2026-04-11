/**
 * Forme brute d'un élément dans la colonne `documents.elements` (JSONB).
 *
 * 1 élément pour `simple`, 2–3 pour `perspectives`, 2 pour `deux_temps`.
 */
export type DocumentElementJson = {
  type: "textuel" | "iconographique";
  contenu?: string | null;
  image_url?: string | null;
  source_citation: string;
  source_type: "primaire" | "secondaire";
  categorie_textuelle?: string | null;
  categorie_iconographique?: string | null;
  image_legende?: string | null;
  image_legende_position?: string | null;
  auteur?: string | null;
  repere_temporel?: string | null;
  sous_titre?: string | null;
};
