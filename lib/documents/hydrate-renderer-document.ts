/**
 * Hydrate un `RendererDocument` à partir d'une ligne `documents` et de ses
 * `document_elements` en base. Utilisé par la page `/documents/[id]` et
 * le `DocumentCardReader`.
 */

import type { Database } from "@/lib/types/database";
import type {
  DocumentElement,
  DocumentStructure,
  IconographiqueElement,
  RendererDocument,
  TextuelElement,
} from "@/lib/types/document-renderer";
import { parseCategorieTextuelle } from "@/lib/documents/categorie-textuelle";
import { parseTypeIconographique } from "@/lib/documents/type-iconographique";
import { parseDocumentLegendPosition } from "@/lib/tae/document-helpers";

type DocumentRow = Database["public"]["Tables"]["documents"]["Row"];
type ElementRow = Database["public"]["Tables"]["document_elements"]["Row"];

/**
 * Construit un `RendererDocument` à partir de la ligne `documents` et des
 * lignes `document_elements` (ordonnées par `position`).
 *
 * Pour les documents `simple` sans entrée dans `document_elements`, l'élément
 * est reconstruit à partir des colonnes flat de la table `documents`.
 */
export function hydrateRendererDocument(
  doc: DocumentRow,
  elementRows: ElementRow[],
): RendererDocument {
  const structure: DocumentStructure = (["simple", "perspectives", "deux_temps"] as const).includes(
    doc.structure as DocumentStructure,
  )
    ? (doc.structure as DocumentStructure)
    : "simple";

  let elements: DocumentElement[];

  if (elementRows.length > 0) {
    elements = elementRows
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((row) => hydrateElement(row));
  } else {
    // Fallback : document simple stocké en colonnes flat
    elements = [hydrateFlatElement(doc)];
  }

  return {
    id: doc.id,
    titre: doc.titre,
    structure,
    elements,
    repereTemporelDocument: doc.repere_temporel ?? undefined,
  };
}

function hydrateElement(row: ElementRow): DocumentElement {
  const base = {
    id: row.id,
    auteur: row.auteur ?? undefined,
    repereTemporel: row.repere_temporel ?? undefined,
    sousTitre: row.sous_titre ?? undefined,
    source: row.source_citation,
    sourceType: row.source_type === "primaire" ? ("primaire" as const) : ("secondaire" as const),
  };

  if (row.type === "iconographique") {
    return {
      ...base,
      type: "iconographique",
      imageUrl: row.image_url ?? "",
      legende: row.legende ?? undefined,
      legendePosition: parseDocumentLegendPosition(row.legende_position) ?? undefined,
      categorieIconographique: parseTypeIconographique(row.categorie_iconographique) ?? "autre",
    } satisfies IconographiqueElement;
  }

  return {
    ...base,
    type: "textuel",
    contenu: row.contenu ?? "",
    categorieTextuelle: parseCategorieTextuelle(row.categorie_textuelle) ?? "autre",
  } satisfies TextuelElement;
}

function hydrateFlatElement(doc: DocumentRow): DocumentElement {
  const base = {
    id: `${doc.id}_flat`,
    auteur: undefined,
    repereTemporel: undefined,
    sousTitre: undefined,
    source: doc.source_citation,
    sourceType: doc.source_type === "primaire" ? ("primaire" as const) : ("secondaire" as const),
  };

  if (doc.type === "iconographique") {
    return {
      ...base,
      type: "iconographique",
      imageUrl: doc.image_url ?? "",
      legende: doc.image_legende ?? undefined,
      legendePosition: parseDocumentLegendPosition(doc.image_legende_position) ?? undefined,
      categorieIconographique: parseTypeIconographique(doc.type_iconographique) ?? "autre",
    } satisfies IconographiqueElement;
  }

  return {
    ...base,
    type: "textuel",
    contenu: doc.contenu ?? "",
    categorieTextuelle: parseCategorieTextuelle(doc.categorie_textuelle) ?? "autre",
  } satisfies TextuelElement;
}
