/**
 * FormState wizard création TAÉ — voir docs/WORKFLOWS.md §12.1
 * (stubs pour la checklist architecture.)
 */
export interface DocumentSlot {
  id: string;
  titre: string;
  type: "textuel" | "iconographique";
  contenu: string;
  source_citation: string;
  image_url: string | null;
  source_document_id: string | null;
  source_version: number | null;
  is_modified: boolean;
}

export interface FormState {
  niveau_id: number | null;
  discipline_id: number | null;
  oi_id: string | null;
  comportement_id: string | null;
  nb_lignes: number | null;
  nb_documents: number | null;
  consigne: string;
  guidage: string;
  corrige: string;
  aspects_societe: string[];
  documents: DocumentSlot[];
  cd_id: number | null;
  connaissances_ids: number[];
  post_id: string | null;
  version: number;
  status: "draft" | "published";
}
