import type { DocumentElementFormValues } from "@/lib/schemas/autonomous-document";
import type { DocumentElementJson } from "@/lib/types/document-element-json";

/**
 * Convertit les valeurs de formulaire d'éléments en JSONB prêt pour la colonne `documents.elements`.
 *
 * Appelé après `safeParse` Zod côté serveur : `type` et `source_type` sont
 * garantis non-null par la validation (§2.10.1).
 */
export function buildElementsJsonb(elements: DocumentElementFormValues[]): DocumentElementJson[] {
  return elements.map((el) => {
    if (el.type == null || el.source_type == null) {
      throw new Error("buildElementsJsonb: type ou source_type null — validation Zod manquante.");
    }
    const legendTrim = el.image_legende?.trim() ?? "";
    const legendPos =
      el.type === "iconographique" && legendTrim.length > 0
        ? (el.image_legende_position ?? null)
        : null;

    return {
      type: el.type,
      contenu: el.type === "textuel" ? (el.contenu ?? "").trim() || null : null,
      image_url: el.type === "iconographique" ? (el.image_url ?? "").trim() || null : null,
      source_citation: el.source_citation.trim(),
      source_type: el.source_type,
      categorie_textuelle:
        el.type === "textuel" && el.categorie_textuelle != null ? el.categorie_textuelle : null,
      categorie_iconographique:
        el.type === "iconographique" && el.type_iconographique != null
          ? el.type_iconographique
          : null,
      image_legende: legendTrim.length > 0 ? legendTrim : null,
      image_legende_position: legendPos,
      auteur: el.auteur?.trim() || null,
      repere_temporel: el.repere_temporel?.trim() || null,
      sous_titre: el.sous_titre?.trim() || null,
    };
  });
}
