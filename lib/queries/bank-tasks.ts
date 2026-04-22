import type { SupabaseClient } from "@supabase/supabase-js";

import {
  aspectKeysToDbValues,
  parseAspectKeysFromParam,
  parseAspectKeysFromSearchParam,
} from "@/lib/bank/bank-aspect-param";
import type { Database } from "@/lib/types/database";

type Client = SupabaseClient<Database>;

/** Taille de page liste banque (tâches / documents / épreuves) — picker épreuve reste à 8. */
export const BANK_PAGE_SIZE = 20;

/** Valeurs `?onglet=` — alignées sur `docs/DECISIONS.md` (Banque collaborative). */
export type BankOnglet = "taches" | "documents" | "evaluations";

export function parseBankOnglet(raw: string | string[] | undefined): BankOnglet {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v === "documents" || v === "evaluations") return v;
  return "taches";
}

/** Paramètre `page` partagé par les onglets liste (0 = première page). */
export function parseBankListPage(sp: Record<string, string | string[] | undefined>): number {
  const v = sp.page;
  const raw = Array.isArray(v) ? v[0] : v;
  const n = raw !== undefined && raw !== "" ? Number(raw) : 0;
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

export type BankTacheSort = "recent" | "popular";

export type BankTacheFilters = {
  q?: string;
  oiId?: string;
  comportementId?: string;
  niveauId?: number;
  disciplineId?: number;
  cdId?: number;
  /** Clés URL `AspectSocieteKey`. */
  aspectKeys?: string;
  /** IDs entiers séparés par virgules. */
  connaissancesIds?: string;
};

export type BankTacheQuery = {
  filters: BankTacheFilters;
  page: number;
  sort: BankTacheSort;
};

/** Ligne liste banque — `consigne` HTML complète pour `plainConsigneForMiniature`. */
export type BankTacheRow = {
  id: string;
  consigne: string | null;
  created_at: string | null;
  updated_at: string | null;
  auteur_nom: string | null;
  oi_titre: string | null;
  oi_id: string | null;
  comportement_id: string | null;
  niveau_label: string | null;
  discipline_label: string | null;
  bank_popularity_score: number | null;
};

function escapeIlikePattern(q: string): string {
  return `%${q.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_")}%`;
}

function parsePositiveInt(raw: string | undefined): number | undefined {
  if (raw === undefined || raw === "") return undefined;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return Math.floor(n);
}

function parseConnaissanceIds(raw: string | undefined): number[] {
  if (!raw?.trim()) return [];
  const out: number[] = [];
  for (const p of raw.split(",")) {
    const n = Number(p.trim());
    if (Number.isFinite(n) && n > 0) out.push(Math.floor(n));
  }
  return out;
}

export function parseBankTacheQueryFromSearchParams(
  sp: Record<string, string | string[] | undefined>,
): {
  filters: BankTacheFilters;
  page: number;
  sort: BankTacheSort;
} {
  const g = (k: string): string | undefined => {
    const v = sp[k];
    if (Array.isArray(v)) return v[0];
    return v;
  };
  const sortRaw = g("sort");
  const sort: BankTacheSort = sortRaw === "popular" ? "popular" : "recent";
  const pageRaw = g("page");
  const p = pageRaw !== undefined ? Number(pageRaw) : 0;
  const page = Number.isFinite(p) && p >= 0 ? Math.floor(p) : 0;

  const aspectKeysArr = parseAspectKeysFromSearchParam(sp.aspects);
  const aspectKeys = aspectKeysArr.length > 0 ? aspectKeysArr.join(",") : undefined;

  return {
    filters: {
      q: g("q")?.trim() || undefined,
      oiId: g("oi")?.trim() || undefined,
      comportementId: g("comportement")?.trim() || undefined,
      niveauId: parsePositiveInt(g("niveau")),
      disciplineId: parsePositiveInt(g("discipline")),
      cdId: parsePositiveInt(g("cd")),
      aspectKeys,
      connaissancesIds: g("connaissances")?.trim() || undefined,
    },
    page,
    sort,
  };
}

/** Lien `/bank` onglet Tâches avec les mêmes filtres (pagination modifiable). */
export function serializeBankTacheQueryForHref(
  query: BankTacheQuery,
  overrides?: { page?: number },
): string {
  const u = new URLSearchParams();
  u.set("onglet", "taches");
  const { filters, sort } = query;
  const page = overrides?.page ?? query.page;
  if (filters.q) u.set("q", filters.q);
  if (filters.oiId) u.set("oi", filters.oiId);
  if (filters.comportementId) u.set("comportement", filters.comportementId);
  if (filters.niveauId != null) u.set("niveau", String(filters.niveauId));
  if (filters.disciplineId != null) u.set("discipline", String(filters.disciplineId));
  if (filters.cdId != null) u.set("cd", String(filters.cdId));
  if (filters.aspectKeys?.trim()) u.set("aspects", filters.aspectKeys.trim());
  if (filters.connaissancesIds?.trim()) u.set("connaissances", filters.connaissancesIds.trim());
  if (sort === "popular") u.set("sort", sort);
  if (page > 0) u.set("page", String(page));
  return `/bank?${u.toString()}`;
}

/** Colonnes présentes dans le `select` sur `banque_tae` — la vue dans `database.ts` peut être incomplète tant que les types ne sont pas régénérés. */
type BanqueTacheJoinRow = Database["public"]["Views"]["banque_tae"]["Row"] & {
  consigne?: string | null;
  consigne_search_plain?: string | null;
  bank_popularity_score?: number | null;
};

function mapBanqueRow(row: BanqueTacheJoinRow): BankTacheRow | null {
  if (!row.id) return null;
  return {
    id: row.id,
    consigne: row.consigne ?? null,
    created_at: row.created_at ?? null,
    updated_at: row.updated_at ?? null,
    auteur_nom: row.auteur_nom ?? null,
    oi_titre: row.oi_titre ?? null,
    oi_id: row.oi_id ?? null,
    comportement_id: row.comportement_id ?? null,
    niveau_label: row.niveau_label ?? null,
    discipline_label: row.discipline_label ?? null,
    bank_popularity_score: row.bank_popularity_score ?? null,
  };
}

/**
 * Liste paginée des TAÉ publiées (vue `banque_tae`) — filtres + tri + recherche sur `consigne_search_plain`.
 */
export async function getBankPublishedTachePage(
  supabase: Client,
  query: BankTacheQuery,
): Promise<{ rows: BankTacheRow[]; total: number }> {
  const { filters, page, sort } = query;
  const from = page * BANK_PAGE_SIZE;
  const to = from + BANK_PAGE_SIZE - 1;

  let q = supabase.from("banque_tae").select(
    `
      id,
      consigne,
      created_at,
      updated_at,
      auteur_nom,
      oi_titre,
      oi_id,
      comportement_id,
      niveau_label,
      discipline_label,
      bank_popularity_score,
      consigne_search_plain
    `,
    { count: "estimated" },
  );

  if (filters.q) {
    q = q.ilike("consigne_search_plain", escapeIlikePattern(filters.q));
  }
  if (filters.oiId) {
    q = q.eq("oi_id", filters.oiId);
  }
  if (filters.comportementId) {
    q = q.eq("comportement_id", filters.comportementId);
  }
  if (filters.niveauId != null) {
    q = q.eq("niveau_id", filters.niveauId);
  }
  if (filters.disciplineId != null) {
    q = q.eq("discipline_id", filters.disciplineId);
  }
  if (filters.cdId != null) {
    q = q.eq("cd_id", filters.cdId);
  }

  const aspectKeys = parseAspectKeysFromParam(filters.aspectKeys);
  if (aspectKeys.length > 0) {
    const dbVals = aspectKeysToDbValues(aspectKeys);
    q = q.contains("aspects_societe", dbVals);
  }

  const connIds = parseConnaissanceIds(filters.connaissancesIds);
  if (connIds.length > 0) {
    q = q.overlaps("connaissances_ids", connIds);
  }

  if (sort === "popular") {
    q = q
      .order("bank_popularity_score", { ascending: false, nullsFirst: false })
      .order("updated_at", { ascending: false });
  } else {
    q = q.order("updated_at", { ascending: false });
  }

  const { data, error, count } = await q.range(from, to);

  if (error || !data) {
    if (error) console.error("[getBankPublishedTachePage]", error.message);
    return { rows: [], total: 0 };
  }

  const rows: BankTacheRow[] = [];
  for (const raw of data as unknown as BanqueTacheJoinRow[]) {
    const m = mapBanqueRow(raw);
    if (m) rows.push(m);
  }

  return { rows, total: count ?? 0 };
}

export function bankTacheQueryHasActiveFilters(filters: BankTacheFilters): boolean {
  return Boolean(
    filters.q ||
    filters.oiId ||
    filters.comportementId ||
    filters.niveauId != null ||
    filters.disciplineId != null ||
    filters.cdId != null ||
    (filters.aspectKeys && filters.aspectKeys.trim()) ||
    (filters.connaissancesIds && filters.connaissancesIds.trim()),
  );
}
