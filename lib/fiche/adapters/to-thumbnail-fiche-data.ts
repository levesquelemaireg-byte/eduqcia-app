/**
 * Adapter : données minimales liste → TaeFicheData pour FicheThumbnail.
 *
 * En mode thumbnail, seuls header (OI icon + titre, niveau) et consigne
 * (line-clamp 3) sont rendus. Les champs non affichés reçoivent des
 * valeurs par défaut neutres.
 */

import type { TaeFicheData } from "@/lib/types/fiche";

/** Entrée minimale nécessaire pour construire un TaeFicheData thumbnail. */
export type ThumbnailInput = {
  id: string;
  consigne: string;
  is_published: boolean;
  updated_at: string;
  auteur_id: string;
  oi: { id: string; titre: string; icone: string } | null;
  niveau: string;
  discipline: string;
  /** Nombre de documents liés — pour resolveDocPlaceholders dans la consigne. */
  nbDocuments: number;
};

/** Construit un TaeFicheData valide pour le mode thumbnail uniquement. */
export function toThumbnailFicheData(input: ThumbnailInput): TaeFicheData {
  const fakeDocs = Array.from({ length: input.nbDocuments }, (_, i) => ({
    letter: (["A", "B", "C", "D"] as const)[i] ?? ("A" as const),
    titre: "",
    contenu: "",
    source_citation: "",
    type: "textuel" as const,
    image_url: null,
    imagePixelWidth: null,
    imagePixelHeight: null,
    printImpressionScale: 1,
    imageLegende: null,
    imageLegendePosition: null,
  }));

  return {
    id: input.id,
    auteur_id: input.auteur_id,
    auteurs: [],
    consigne: input.consigne,
    guidage: "",
    corrige: "",
    aspects_societe: [],
    nb_lignes: 0,
    niveau: { label: input.niveau },
    discipline: { label: input.discipline },
    oi: input.oi ?? { id: "", titre: "", icone: "cognition" },
    comportement: { id: "", enonce: "" },
    outilEvaluation: null,
    cd: null,
    connaissances: [],
    documents: fakeDocs,
    version: 1,
    version_updated_at: null,
    is_published: input.is_published,
    created_at: input.updated_at,
    updated_at: input.updated_at,
  };
}
