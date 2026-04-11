/**
 * Adaptateur FormValues → DocFicheData pour le wizard document.
 * Construit un RendererDocument de preview à partir des valeurs du formulaire.
 */

import type { AutonomousDocumentFormValues } from "@/lib/schemas/autonomous-document";
import type { DocFicheData } from "@/lib/fiche/types";
import type {
  RendererDocument,
  DocumentElement,
  TextuelElement,
  IconographiqueElement,
} from "@/lib/types/document-renderer";
import type { CategorieTextuelleValue } from "@/lib/documents/categorie-textuelle";
import type { DocumentCategorieIconographiqueId } from "@/lib/types/document-categories";

type FormElement = AutonomousDocumentFormValues["elements"][number];

function toRendererElement(el: FormElement): DocumentElement {
  const base = {
    id: el.id,
    source: el.source_citation,
    sourceType: el.source_type,
    auteur: el.auteur,
    repereTemporel: el.repere_temporel,
    sousTitre: el.sous_titre,
  };

  if (el.type === "textuel") {
    return {
      ...base,
      type: "textuel",
      contenu: el.contenu ?? "",
      categorieTextuelle: (el.categorie_textuelle ??
        "documents_officiels") as CategorieTextuelleValue,
    } satisfies TextuelElement;
  }

  return {
    ...base,
    type: "iconographique",
    imageUrl: el.image_url ?? "",
    legende: el.image_legende,
    legendePosition: el.image_legende_position ?? undefined,
    categorieIconographique: (el.type_iconographique ??
      "carte") as DocumentCategorieIconographiqueId,
  } satisfies IconographiqueElement;
}

/** Convertit les valeurs du formulaire document en DocFicheData pour FicheRenderer. */
export function formValuesToDocFicheData(values: AutonomousDocumentFormValues): DocFicheData {
  const firstEl = values.elements[0];

  const rendererDoc: RendererDocument = {
    id: "preview",
    titre: values.titre || "",
    structure: values.structure,
    elements: values.elements.map(toRendererElement),
    repereTemporelDocument: values.repere_temporel,
  };

  const aspects = values.aspects;
  const aspectLabels: string[] = [];
  if (aspects.economique) aspectLabels.push("Économique");
  if (aspects.politique) aspectLabels.push("Politique");
  if (aspects.social) aspectLabels.push("Social");
  if (aspects.culturel) aspectLabels.push("Culturel");
  if (aspects.territorial) aspectLabels.push("Territorial");

  return {
    document: rendererDoc,
    sourceType: firstEl?.source_type ?? "secondaire",
    sourceCitation: firstEl?.source_citation ?? "",
    niveauLabels: "",
    disciplineLabels: "",
    aspectsStr: aspectLabels.join(", "),
    connLabels: values.connaissances_miller.map((c) => c.enonce).join(" · "),
    authorName: "",
    created: "",
    usageCaption: "",
    isPublished: false,
  };
}
