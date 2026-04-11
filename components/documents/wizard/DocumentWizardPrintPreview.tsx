"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { DocumentCardPrint } from "@/components/documents/DocumentCardPrint";
import type { AutonomousDocumentFormValues } from "@/lib/schemas/autonomous-document";
import type { DocumentElement, RendererDocument } from "@/lib/types/document-renderer";
import { parseCategorieTextuelle } from "@/lib/documents/categorie-textuelle";
import { parseTypeIconographique } from "@/lib/documents/type-iconographique";
import { parseDocumentLegendPosition } from "@/lib/tae/document-helpers";

/**
 * Aperçu impression live dans le wizard document — lit le formulaire via
 * `useWatch` (réactif aux changements profonds) et construit un
 * `RendererDocument` pour `DocumentCardPrint`.
 */
export function DocumentWizardPrintPreview() {
  const { control } = useFormContext<AutonomousDocumentFormValues>();
  const titre = useWatch({ control, name: "titre" });
  const structure = useWatch({ control, name: "structure" });
  const elements = useWatch({ control, name: "elements" });

  const els: DocumentElement[] = (elements ?? []).map((el, i) => {
    const base = {
      id: el.id ?? `el_${i}`,
      auteur: el.auteur || undefined,
      repereTemporel: el.repere_temporel || undefined,
      sousTitre: el.sous_titre || undefined,
      source: el.source_citation ?? "",
      sourceType: (el.source_type === "primaire" ? "primaire" : "secondaire") as
        | "primaire"
        | "secondaire",
    };

    if (el.type === "iconographique") {
      return {
        ...base,
        type: "iconographique" as const,
        imageUrl: el.image_url ?? "",
        legende: el.image_legende || undefined,
        legendePosition: parseDocumentLegendPosition(el.image_legende_position) ?? undefined,
        categorieIconographique: parseTypeIconographique(el.type_iconographique) ?? "autre",
      };
    }

    return {
      ...base,
      type: "textuel" as const,
      contenu: el.contenu ?? "",
      categorieTextuelle: parseCategorieTextuelle(el.categorie_textuelle) ?? "autre",
    };
  });

  const rendererDoc: RendererDocument = {
    id: "wizard-preview",
    titre: titre ?? "",
    structure: structure ?? "simple",
    elements: els,
  };

  return <DocumentCardPrint document={rendererDoc} numero={1} />;
}
