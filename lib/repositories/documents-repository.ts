import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import type { DocumentElementJson } from "@/lib/types/document-element-json";
import type {
  DocumentEnrichedAspect,
  DocumentEnrichedAuteur,
  DocumentEnrichedConnaissance,
  DocumentEnrichedFilters,
  DocumentEnrichedOrderBy,
  DocumentEnrichedRow,
  DocumentEnrichedStructure,
  DocumentEnrichedType,
} from "@/lib/types/document-enriched";

/**
 * Data Access Layer — source unique de vérité pour toutes les lectures
 * documents (banque, Mes documents, profil collègue, lecture unitaire).
 *
 * Implémentation : appelle la RPC Supabase `get_documents_enriched(filters jsonb)`.
 * Filtres conditionnels côté SQL, RLS respectée via SECURITY INVOKER.
 */

type RawRpcRow = {
  id: string;
  titre: string;
  type: DocumentEnrichedType;
  structure: DocumentEnrichedStructure;
  elements: unknown;
  repere_temporel: string | null;
  annee_normalisee: number | null;
  niveaux_ids: number[] | null;
  disciplines_ids: number[] | null;
  aspects_societe: DocumentEnrichedAspect[] | null;
  connaissances_ids: number[] | null;
  source_document_id: string | null;
  source_version: number | null;
  is_modified: boolean;
  version: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  auteur_id: string;
  niveaux_labels: string[] | null;
  disciplines_labels: string[] | null;
  connaissances_breadcrumbs: unknown;
  auteur: unknown;
  nb_utilisations: number | null;
};

function isDocumentElementJsonArray(value: unknown): value is DocumentElementJson[] {
  return Array.isArray(value);
}

function parseAuteur(value: unknown): DocumentEnrichedAuteur {
  const a = (value ?? {}) as Partial<DocumentEnrichedAuteur> & { id?: unknown };
  return {
    id: typeof a.id === "string" ? a.id : "",
    first_name: typeof a.first_name === "string" ? a.first_name : null,
    last_name: typeof a.last_name === "string" ? a.last_name : null,
    display_name: typeof a.display_name === "string" ? a.display_name : null,
  };
}

function parseConnaissances(value: unknown): DocumentEnrichedConnaissance[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item): DocumentEnrichedConnaissance | null => {
      if (!item || typeof item !== "object") return null;
      const c = item as Record<string, unknown>;
      const id = typeof c.id === "number" ? c.id : null;
      const realite = typeof c.realite_sociale === "string" ? c.realite_sociale : null;
      const section = typeof c.section === "string" ? c.section : null;
      const enonce = typeof c.enonce === "string" ? c.enonce : null;
      const disciplineId = typeof c.discipline_id === "number" ? c.discipline_id : null;
      if (
        id === null ||
        realite === null ||
        section === null ||
        enonce === null ||
        disciplineId === null
      ) {
        return null;
      }
      return {
        id,
        realite_sociale: realite,
        section,
        sous_section: typeof c.sous_section === "string" ? c.sous_section : null,
        enonce,
        discipline_id: disciplineId,
      };
    })
    .filter((x): x is DocumentEnrichedConnaissance => x !== null);
}

function normalizeRow(row: RawRpcRow): DocumentEnrichedRow {
  return {
    id: row.id,
    titre: row.titre,
    type: row.type,
    structure: row.structure,
    elements: isDocumentElementJsonArray(row.elements) ? row.elements : [],
    repere_temporel: row.repere_temporel,
    annee_normalisee: row.annee_normalisee,
    niveaux_ids: row.niveaux_ids ?? [],
    disciplines_ids: row.disciplines_ids ?? [],
    aspects_societe: row.aspects_societe ?? [],
    connaissances_ids: row.connaissances_ids ?? [],
    source_document_id: row.source_document_id,
    source_version: row.source_version,
    is_modified: row.is_modified,
    version: row.version,
    is_published: row.is_published,
    created_at: row.created_at,
    updated_at: row.updated_at,
    auteur_id: row.auteur_id,
    niveaux_labels: row.niveaux_labels ?? [],
    disciplines_labels: row.disciplines_labels ?? [],
    connaissances_breadcrumbs: parseConnaissances(row.connaissances_breadcrumbs),
    auteur: parseAuteur(row.auteur),
    nb_utilisations: row.nb_utilisations ?? 0,
  };
}

function filtersToPayload(filters: DocumentEnrichedFilters): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (filters.owner_id) payload.owner_id = filters.owner_id;
  if (filters.profile_id) payload.profile_id = filters.profile_id;
  if (filters.document_id) payload.document_id = filters.document_id;
  if (filters.include_drafts !== undefined) payload.include_drafts = filters.include_drafts;
  if (filters.niveau_ids && filters.niveau_ids.length > 0) payload.niveau_ids = filters.niveau_ids;
  if (filters.discipline_ids && filters.discipline_ids.length > 0) {
    payload.discipline_ids = filters.discipline_ids;
  }
  if (filters.aspects && filters.aspects.length > 0) payload.aspects = filters.aspects;
  if (filters.type) payload.type = filters.type;
  if (filters.search_query && filters.search_query.trim()) {
    payload.search_query = filters.search_query.trim();
  }
  if (filters.limit !== undefined) payload.limit = filters.limit;
  if (filters.offset !== undefined) payload.offset = filters.offset;
  if (filters.order_by) payload.order_by = filters.order_by;
  return payload;
}

async function callRpc(
  client: SupabaseClient,
  filters: DocumentEnrichedFilters,
): Promise<DocumentEnrichedRow[]> {
  const { data, error } = await client.rpc("get_documents_enriched", {
    filters: filtersToPayload(filters),
  });
  if (error) {
    throw new Error(`[documents-repository] get_documents_enriched: ${error.message}`);
  }
  if (!Array.isArray(data)) return [];
  return (data as RawRpcRow[]).map(normalizeRow);
}

async function getClient(): Promise<SupabaseClient> {
  return (await createClient()) as SupabaseClient;
}

export type BankDocumentsListFilters = {
  search?: string;
  niveauIds?: number[];
  disciplineIds?: number[];
  aspects?: DocumentEnrichedAspect[];
  type?: DocumentEnrichedType;
  limit?: number;
  offset?: number;
  orderBy?: DocumentEnrichedOrderBy;
};

export type ProfileDocumentsListFilters = {
  limit?: number;
  offset?: number;
  orderBy?: DocumentEnrichedOrderBy;
};

export type OwnerDocumentsListFilters = {
  search?: string;
  type?: DocumentEnrichedType;
  includeDrafts?: boolean;
  limit?: number;
  offset?: number;
  orderBy?: DocumentEnrichedOrderBy;
};

export const documentsRepository = {
  /** Banque collaborative — publiés uniquement. */
  async listForBank(filters: BankDocumentsListFilters = {}): Promise<DocumentEnrichedRow[]> {
    const client = await getClient();
    return callRpc(client, {
      include_drafts: false,
      search_query: filters.search,
      niveau_ids: filters.niveauIds,
      discipline_ids: filters.disciplineIds,
      aspects: filters.aspects,
      type: filters.type,
      limit: filters.limit,
      offset: filters.offset,
      order_by: filters.orderBy ?? "created_at_desc",
    });
  },

  /** Profil collègue — contributions publiées d'un auteur. */
  async listForProfile(
    profileId: string,
    filters: ProfileDocumentsListFilters = {},
  ): Promise<DocumentEnrichedRow[]> {
    const client = await getClient();
    return callRpc(client, {
      profile_id: profileId,
      include_drafts: false,
      limit: filters.limit,
      offset: filters.offset,
      order_by: filters.orderBy ?? "created_at_desc",
    });
  },

  /** Mes documents — brouillons et publiés du propriétaire. */
  async listForOwner(
    ownerId: string,
    filters: OwnerDocumentsListFilters = {},
  ): Promise<DocumentEnrichedRow[]> {
    const client = await getClient();
    return callRpc(client, {
      owner_id: ownerId,
      include_drafts: filters.includeDrafts ?? true,
      search_query: filters.search,
      type: filters.type,
      limit: filters.limit,
      offset: filters.offset,
      order_by: filters.orderBy ?? "created_at_desc",
    });
  },

  /** Lecture unitaire enrichie — null si non trouvé / RLS bloquée. */
  async getById(documentId: string): Promise<DocumentEnrichedRow | null> {
    const client = await getClient();
    const rows = await callRpc(client, { document_id: documentId, limit: 1 });
    return rows[0] ?? null;
  },
};

export type DocumentsRepository = typeof documentsRepository;
