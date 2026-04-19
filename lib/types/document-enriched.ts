import type { DocumentElementJson } from "@/lib/types/document-element-json";

/**
 * Forme retournée par la RPC `get_documents_enriched(filters jsonb)`.
 * Source de vérité unique pour les lectures documents (banque, Mes documents,
 * profil collègue, lecture unitaire). Respecte les RLS via SECURITY INVOKER.
 */

export type DocumentEnrichedType = "textuel" | "iconographique";

export type DocumentEnrichedStructure = "simple" | "perspectives" | "deux_temps";

export type DocumentEnrichedAspect =
  | "Économique"
  | "Politique"
  | "Social"
  | "Culturel"
  | "Territorial";

/** Ligne hiérarchique extraite de `connaissances` — 3 ou 4 niveaux selon discipline. */
export type DocumentEnrichedConnaissance = {
  id: number;
  realite_sociale: string;
  section: string;
  /** NULL pour HQC ; parfois NULL pour HEC. Les 2 derniers niveaux peuvent être (section, enonce) ou (sous_section, enonce). */
  sous_section: string | null;
  enonce: string;
  discipline_id: number;
};

export type DocumentEnrichedAuteur = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  /** `first_name + " " + last_name` (null si auteur anonymisé / supprimé). */
  display_name: string | null;
};

export type DocumentEnrichedRow = {
  id: string;
  titre: string;
  type: DocumentEnrichedType;
  structure: DocumentEnrichedStructure;
  elements: DocumentElementJson[];
  repere_temporel: string | null;
  annee_normalisee: number | null;
  niveaux_ids: number[];
  disciplines_ids: number[];
  aspects_societe: DocumentEnrichedAspect[];
  connaissances_ids: number[];
  source_document_id: string | null;
  source_version: number | null;
  is_modified: boolean;
  version: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  auteur_id: string;
  niveaux_labels: string[];
  disciplines_labels: string[];
  connaissances_breadcrumbs: DocumentEnrichedConnaissance[];
  auteur: DocumentEnrichedAuteur;
  nb_utilisations: number;
};

export type DocumentEnrichedOrderBy =
  | "created_at_desc"
  | "created_at_asc"
  | "updated_at_desc"
  | "titre_asc";

/** Filtres passés à la RPC. Clé absente = filtre non appliqué. */
export type DocumentEnrichedFilters = {
  owner_id?: string;
  profile_id?: string;
  document_id?: string;
  include_drafts?: boolean;
  niveau_ids?: number[];
  discipline_ids?: number[];
  aspects?: DocumentEnrichedAspect[];
  type?: DocumentEnrichedType;
  search_query?: string;
  limit?: number;
  offset?: number;
  order_by?: DocumentEnrichedOrderBy;
};
