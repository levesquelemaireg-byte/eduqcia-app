import type { SupabaseClient } from "@supabase/supabase-js";

import { parseTypeIconographique } from "@/lib/documents/type-iconographique";
import { BANK_PAGE_SIZE } from "@/lib/queries/bank-tasks";
import type { Database } from "@/lib/types/database";
import type { DocumentElementJson } from "@/lib/types/document-element-json";
import type { DocumentCategorieIconographiqueId } from "@/lib/types/document-categories";

type DocumentTypeIconoSlug = DocumentCategorieIconographiqueId;

type Client = SupabaseClient<Database>;

export type BankDocumentListRow = {
  id: string;
  titre: string;
  type: "textuel" | "iconographique";
  source_citation: string;
  source_type: "primaire" | "secondaire";
  created_at: string;
  image_url: string | null;
  image_legende: string | null;
  contenu: string | null;
  structure: "simple" | "perspectives" | "deux_temps";
  type_iconographique: string | null;
  categorie_textuelle: string | null;
  niveaux_ids: number[];
  disciplines_ids: number[];
  /** Nombre d'éléments dans le document. */
  elementCount: number;
};

export type BankDocumentFilters = {
  search?: string;
  disciplineId?: number;
  niveauId?: number;
  docType?: "textuel" | "iconographique";
  iconoCategories?: DocumentTypeIconoSlug[];
};

/** Lien `/bank` onglet Documents avec les mêmes filtres. */
export function serializeBankDocumentsQueryForHref(
  filters: BankDocumentFilters,
  page: number,
): string {
  const u = new URLSearchParams();
  u.set("onglet", "documents");
  const s = filters.search?.trim();
  if (s) u.set("q", s);
  if (filters.disciplineId != null) u.set("discipline", String(filters.disciplineId));
  if (filters.niveauId != null) u.set("niveau", String(filters.niveauId));
  if (filters.docType) u.set("dtype", filters.docType);
  if (filters.iconoCategories && filters.iconoCategories.length > 0) {
    for (const c of filters.iconoCategories) {
      u.append("icat", c);
    }
  }
  if (page > 0) u.set("page", String(page));
  return `/bank?${u.toString()}`;
}

/** Paramètres `icat` répétés (cases à cocher banque). */
export function parseBankDocumentIconoCategories(
  sp: Record<string, string | string[] | undefined>,
): DocumentTypeIconoSlug[] {
  const raw = sp.icat;
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : [raw];
  const out: DocumentTypeIconoSlug[] = [];
  for (const x of list) {
    const p = parseTypeIconographique(x);
    if (p) out.push(p);
  }
  return out;
}

const BANK_DOCUMENTS_SELECT = `
      id,
      titre,
      type,
      created_at,
      structure,
      elements,
      niveaux_ids,
      disciplines_ids
    `;

function bankDocumentsFilteredQuery(
  supabase: Client,
  filters: BankDocumentFilters,
  countMode: "exact" | "none",
) {
  let q = supabase
    .from("documents")
    .select(BANK_DOCUMENTS_SELECT, countMode === "exact" ? { count: "exact" } : undefined)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  const search = filters.search?.trim();
  if (search) {
    const pat = `%${search.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_")}%`;
    q = q.ilike("titre", pat);
  }
  if (filters.disciplineId != null) {
    q = q.contains("disciplines_ids", [filters.disciplineId]);
  }
  if (filters.niveauId != null) {
    q = q.contains("niveaux_ids", [filters.niveauId]);
  }
  if (filters.docType) {
    q = q.eq("type", filters.docType);
  }
  return q;
}

function mapBankDocumentRows(
  data: unknown,
  iconoFilter: DocumentTypeIconoSlug[] | undefined,
): BankDocumentListRow[] {
  type Raw = {
    id: string;
    titre: string;
    type: string;
    created_at: string;
    structure: string;
    elements: unknown;
    niveaux_ids: number[] | null;
    disciplines_ids: number[] | null;
  };

  const rows = (data as Raw[]).map((row) => {
    const rawElements = (Array.isArray(row.elements) ? row.elements : []) as DocumentElementJson[];
    const firstEl = rawElements[0];
    const typeIcono = firstEl?.categorie_iconographique ?? null;
    const categorieTextuelle = firstEl?.categorie_textuelle ?? null;
    return {
      id: row.id,
      titre: row.titre,
      type: (row.type === "iconographique" ? "iconographique" : "textuel") as
        | "textuel"
        | "iconographique",
      source_citation: firstEl?.source_citation ?? "",
      source_type: (firstEl?.source_type === "primaire" ? "primaire" : "secondaire") as
        | "primaire"
        | "secondaire",
      created_at: row.created_at,
      image_url: firstEl?.image_url ?? null,
      image_legende: firstEl?.image_legende ?? null,
      contenu: firstEl?.contenu ?? null,
      structure: (["simple", "perspectives", "deux_temps"].includes(row.structure)
        ? row.structure
        : "simple") as "simple" | "perspectives" | "deux_temps",
      type_iconographique: typeIcono,
      categorie_textuelle: categorieTextuelle,
      niveaux_ids: row.niveaux_ids ?? [],
      disciplines_ids: row.disciplines_ids ?? [],
      elementCount: rawElements.length,
    };
  });

  // Filtrage icono en application (PostgREST ne supporte pas le filtre sur clé JSONB tableau)
  if (iconoFilter && iconoFilter.length > 0) {
    const set = new Set<string>(iconoFilter);
    return rows.filter(
      (r) =>
        r.type !== "iconographique" ||
        (r.type_iconographique != null && set.has(r.type_iconographique)),
    );
  }
  return rows;
}

/**
 * Documents publiés visibles en banque (RLS `documents_select`) — page + total.
 */
export async function getBankPublishedDocumentsPage(
  supabase: Client,
  filters: BankDocumentFilters,
  page: number,
): Promise<{ rows: BankDocumentListRow[]; total: number }> {
  const p = Number.isFinite(page) && page >= 0 ? Math.floor(page) : 0;
  const hasIconoFilter =
    filters.docType !== "textuel" && filters.iconoCategories && filters.iconoCategories.length > 0;

  if (hasIconoFilter) {
    // Filtrage icono en JS (PostgREST ne supporte pas le filtre sur clé JSONB tableau).
    // On charge tous les résultats DB pour filtrer et paginer localement.
    const { data, error } = await bankDocumentsFilteredQuery(supabase, filters, "none");
    if (error || !data) return { rows: [], total: 0 };

    const mapped = mapBankDocumentRows(data, filters.iconoCategories);
    const start = p * BANK_PAGE_SIZE;
    return {
      rows: mapped.slice(start, start + BANK_PAGE_SIZE),
      total: mapped.length,
    };
  }

  // Chemin standard : pagination DB
  const from = p * BANK_PAGE_SIZE;
  const to = from + BANK_PAGE_SIZE - 1;
  const { data, error, count } = await bankDocumentsFilteredQuery(supabase, filters, "exact").range(
    from,
    to,
  );
  if (error || !data) return { rows: [], total: 0 };

  const mapped = mapBankDocumentRows(data, undefined);
  return { rows: mapped, total: count ?? 0 };
}

/**
 * Liste limitée (ex. picker Bloc 4) — sans comptage total.
 */
export async function getBankPublishedDocuments(
  supabase: Client,
  filters: BankDocumentFilters,
  limit = 80,
): Promise<BankDocumentListRow[]> {
  const lim = Number.isFinite(limit) && limit > 0 ? Math.min(Math.floor(limit), 200) : 80;
  const { data, error } = await bankDocumentsFilteredQuery(supabase, filters, "none").limit(lim);
  if (error || !data) return [];
  return mapBankDocumentRows(data, filters.iconoCategories);
}

/** Compteur d'usages TAÉ publiées par document — `docs/FEATURES.md` §5.4. */
export async function countPublishedUsagesByDocumentIds(
  supabase: Client,
  documentIds: string[],
): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (documentIds.length === 0) return map;
  const { data, error } = await supabase
    .from("tache_documents")
    .select("document_id, tae_id, tache!inner(is_published)")
    .in("document_id", documentIds)
    .eq("tache.is_published", true);
  if (error || !data) return map;
  const byDoc = new Map<string, Set<string>>();
  for (const row of data as { document_id: string; tae_id: string }[]) {
    let set = byDoc.get(row.document_id);
    if (!set) {
      set = new Set();
      byDoc.set(row.document_id, set);
    }
    set.add(row.tae_id);
  }
  for (const [id, set] of byDoc) map.set(id, set.size);
  return map;
}
