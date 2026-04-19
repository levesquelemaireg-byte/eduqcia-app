import { parseCategorieTextuelle } from "@/lib/documents/categorie-textuelle";
import { parseTypeIconographique } from "@/lib/documents/type-iconographique";
import { emptyDocumentSlot, parseDocumentLegendPosition } from "@/lib/tae/document-helpers";
import type { DocumentSlotData } from "@/lib/tae/document-helpers";
import type { DocumentEnrichedRow } from "@/lib/types/document-enriched";

/**
 * Convertit un document enrichi (banque / auto) en `DocumentSlotData` en mode `reuse`.
 * Utilisé par le deep-link banque → wizard tâche (SPEC §4).
 */
export function injectDocumentIntoSlot(doc: DocumentEnrichedRow): DocumentSlotData {
  const firstEl = doc.elements[0];
  const type: "textuel" | "iconographique" =
    doc.type === "iconographique" ? "iconographique" : "textuel";

  const sourceType =
    firstEl?.source_type === "primaire" || firstEl?.source_type === "secondaire"
      ? firstEl.source_type
      : "secondaire";

  const imageLegendePosition = parseDocumentLegendPosition(firstEl?.image_legende_position);
  const typeIcono = parseTypeIconographique(firstEl?.categorie_iconographique ?? null);
  const categorieTextuelle = parseCategorieTextuelle(firstEl?.categorie_textuelle ?? null);

  const reuseAuthor = doc.auteur.display_name ?? "";

  return {
    ...emptyDocumentSlot(),
    mode: "reuse",
    type,
    titre: doc.titre,
    contenu: firstEl?.contenu ?? "",
    source_citation: firstEl?.source_citation ?? "",
    imageUrl: firstEl?.image_url ?? null,
    source_document_id: doc.id,
    source_version: doc.version,
    update_available: false,
    reuse_author: reuseAuthor,
    reuse_source_citation: firstEl?.source_citation ?? "",
    source_type: sourceType,
    image_legende: firstEl?.image_legende ?? "",
    image_legende_position: imageLegendePosition,
    repere_temporel: doc.repere_temporel ?? "",
    annee_normalisee: doc.annee_normalisee,
    type_iconographique: typeIcono,
    categorie_textuelle: categorieTextuelle,
  };
}
