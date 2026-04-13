/**
 * Hydrate un `RendererDocument` à partir d'une ligne `documents` qui contient
 * les éléments dans la colonne JSONB `elements`.
 */

import type { DocumentElementJson } from "@/lib/types/document-element-json";
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

/** Colonnes minimales requises pour hydrater un RendererDocument. */
type DocumentHydrationInput = {
  id: string;
  titre: string;
  structure: string | null;
  elements: unknown;
  repere_temporel: string | null;
};

/**
 * Construit un `RendererDocument` à partir de la ligne `documents`.
 * Les éléments sont lus depuis `doc.elements` (JSONB).
 */
export function hydrateRendererDocument(doc: DocumentHydrationInput): RendererDocument {
  const structure: DocumentStructure = (["simple", "perspectives", "deux_temps"] as const).includes(
    doc.structure as DocumentStructure,
  )
    ? (doc.structure as DocumentStructure)
    : "simple";

  const rawElements = (Array.isArray(doc.elements) ? doc.elements : []) as DocumentElementJson[];

  const elements: DocumentElement[] =
    rawElements.length > 0
      ? rawElements.map((el, i) => hydrateJsonElement(el, `${doc.id}_${i}`))
      : [];

  return {
    id: doc.id,
    titre: doc.titre,
    structure,
    elements,
    repereTemporelDocument: doc.repere_temporel ?? undefined,
  };
}

function hydrateJsonElement(el: DocumentElementJson, fallbackId: string): DocumentElement {
  const base = {
    id: fallbackId,
    auteur: el.auteur ?? undefined,
    repereTemporel: el.repere_temporel ?? undefined,
    sousTitre: el.sous_titre ?? undefined,
    source: el.source_citation ?? "",
    sourceType: el.source_type === "primaire" ? ("primaire" as const) : ("secondaire" as const),
  };

  if (el.type === "iconographique") {
    return {
      ...base,
      type: "iconographique",
      imageUrl: el.image_url ?? "",
      legende: el.image_legende ?? undefined,
      legendePosition: parseDocumentLegendPosition(el.image_legende_position) ?? undefined,
      categorieIconographique: parseTypeIconographique(el.categorie_iconographique) ?? "autre",
    } satisfies IconographiqueElement;
  }

  return {
    ...base,
    type: "textuel",
    contenu: el.contenu ?? "",
    categorieTextuelle: parseCategorieTextuelle(el.categorie_textuelle) ?? "autre",
  } satisfies TextuelElement;
}
