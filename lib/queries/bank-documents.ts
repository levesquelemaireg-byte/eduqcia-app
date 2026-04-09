import type { SupabaseClient } from "@supabase/supabase-js";

import { parseTypeIconographique } from "@/lib/documents/type-iconographique";
import { BANK_PAGE_SIZE } from "@/lib/queries/bank-tasks";
import type { Database } from "@/lib/types/database";
import type { DocumentTypeIconoSlug } from "@/lib/ui/ui-copy";

type Client = SupabaseClient<Database>;

export type BankDocumentListRow = {
  id: string;
  titre: string;
  type: "textuel" | "iconographique";
  source_citation: string;
  created_at: string;
  image_url: string | null;
  image_legende: string | null;
  type_iconographique: string | null;
  categorie_textuelle: string | null;
  niveaux_ids: number[];
  disciplines_ids: number[];
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
      source_citation,
      created_at,
      image_url,
      image_legende,
      type_iconographique,
      categorie_textuelle,
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
    q = q.or(`titre.ilike.${pat},source_citation.ilike.${pat}`);
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
  if (
    filters.docType !== "textuel" &&
    filters.iconoCategories &&
    filters.iconoCategories.length > 0
  ) {
    q = q.in("type_iconographique", filters.iconoCategories);
  }
  return q;
}

function mapBankDocumentRows(data: unknown): BankDocumentListRow[] {
  type Raw = {
    id: string;
    titre: string;
    type: string;
    source_citation: string;
    created_at: string;
    image_url: string | null;
    image_legende: string | null;
    type_iconographique: string | null;
    categorie_textuelle: string | null;
    niveaux_ids: number[] | null;
    disciplines_ids: number[] | null;
  };

  return (data as Raw[]).map((row) => ({
    id: row.id,
    titre: row.titre,
    type: row.type === "iconographique" ? "iconographique" : "textuel",
    source_citation: row.source_citation,
    created_at: row.created_at,
    image_url: row.image_url,
    image_legende: row.image_legende,
    type_iconographique: row.type_iconographique ?? null,
    categorie_textuelle: row.categorie_textuelle ?? null,
    niveaux_ids: row.niveaux_ids ?? [],
    disciplines_ids: row.disciplines_ids ?? [],
  }));
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
  const from = p * BANK_PAGE_SIZE;
  const to = from + BANK_PAGE_SIZE - 1;
  const { data, error, count } = await bankDocumentsFilteredQuery(supabase, filters, "exact").range(
    from,
    to,
  );
  if (error || !data) return { rows: [], total: 0 };
  return { rows: mapBankDocumentRows(data), total: count ?? 0 };
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
  return mapBankDocumentRows(data);
}

/** Compteur d’usages TAÉ publiées par document — `docs/FEATURES.md` §5.4. */
export async function countPublishedUsagesByDocumentIds(
  supabase: Client,
  documentIds: string[],
): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (documentIds.length === 0) return map;
  const { data, error } = await supabase
    .from("tae_documents")
    .select("document_id, tae_id, tae!inner(is_published)")
    .in("document_id", documentIds)
    .eq("tae.is_published", true);
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
