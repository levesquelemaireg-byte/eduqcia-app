import { createClient } from "@/lib/supabase/server";

export const EVALUATION_PICKER_PAGE_SIZE = 8;

export type EvaluationPickerSource = "bank" | "mine";

export type EvaluationPickerRow = {
  id: string;
  consigne: string | null;
  created_at: string | null;
  updated_at: string | null;
  auteur_nom: string | null;
  oi_titre: string | null;
  niveau_label: string | null;
  discipline_label: string | null;
  is_published: boolean;
  nb_documents: number;
  source: EvaluationPickerSource;
};

function embedOne<T>(x: T | T[] | null | undefined): T | null {
  if (x == null) return null;
  return Array.isArray(x) ? (x[0] ?? null) : x;
}

type JoinRow = {
  id: string;
  consigne: string | null;
  created_at: string;
  updated_at: string;
  is_published: boolean;
  profiles:
    | { first_name: string; last_name: string }
    | { first_name: string; last_name: string }[]
    | null;
  oi: { titre: string } | { titre: string }[] | null;
  niveaux: { label: string } | { label: string }[] | null;
  disciplines: { label: string } | { label: string }[] | null;
  comportements: { nb_documents: number | null } | { nb_documents: number | null }[] | null;
};

function mapJoinRow(row: JoinRow, source: EvaluationPickerSource): EvaluationPickerRow {
  const p = embedOne(row.profiles);
  const o = embedOne(row.oi);
  const n = embedOne(row.niveaux);
  const d = embedOne(row.disciplines);
  const c = embedOne(row.comportements);
  return {
    id: row.id,
    consigne: row.consigne,
    created_at: row.created_at,
    updated_at: row.updated_at,
    auteur_nom: p ? `${p.first_name} ${p.last_name}`.trim() : null,
    oi_titre: o?.titre ?? null,
    niveau_label: n?.label ?? null,
    discipline_label: d?.label ?? null,
    is_published: row.is_published,
    nb_documents: c?.nb_documents ?? 0,
    source,
  };
}

const tacheSelect = `
  id,
  consigne,
  created_at,
  updated_at,
  is_published,
  profiles!tae_auteur_id_fkey ( first_name, last_name ),
  oi!tae_oi_id_fkey ( titre ),
  niveaux!tae_niveau_id_fkey ( label ),
  disciplines!tae_discipline_id_fkey ( label ),
  comportements!tae_comportement_id_fkey ( nb_documents )
`;

export type EvaluationPickerPage = {
  rows: EvaluationPickerRow[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

export async function getEvaluationPickerBankPage(page: number): Promise<EvaluationPickerPage> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { rows: [], total: 0, page, pageSize: EVALUATION_PICKER_PAGE_SIZE, hasMore: false };
  }

  const from = page * EVALUATION_PICKER_PAGE_SIZE;
  const to = from + EVALUATION_PICKER_PAGE_SIZE - 1;

  const { data, error, count } = await supabase
    .from("tae")
    .select(tacheSelect, { count: "exact" })
    .eq("is_published", true)
    .eq("is_archived", false)
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (error) {
    return { rows: [], total: 0, page, pageSize: EVALUATION_PICKER_PAGE_SIZE, hasMore: false };
  }

  const total = count ?? 0;
  const rows = ((data ?? []) as unknown as JoinRow[]).map((r) => mapJoinRow(r, "bank"));
  return {
    rows,
    total,
    page,
    pageSize: EVALUATION_PICKER_PAGE_SIZE,
    hasMore: to + 1 < total,
  };
}

export async function getEvaluationPickerMinePage(page: number): Promise<EvaluationPickerPage> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { rows: [], total: 0, page, pageSize: EVALUATION_PICKER_PAGE_SIZE, hasMore: false };
  }

  const from = page * EVALUATION_PICKER_PAGE_SIZE;
  const to = from + EVALUATION_PICKER_PAGE_SIZE - 1;

  const { data, error, count } = await supabase
    .from("tae")
    .select(tacheSelect, { count: "exact" })
    .eq("auteur_id", user.id)
    .eq("is_archived", false)
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (error) {
    return { rows: [], total: 0, page, pageSize: EVALUATION_PICKER_PAGE_SIZE, hasMore: false };
  }

  const total = count ?? 0;
  const rows = ((data ?? []) as unknown as JoinRow[]).map((r) => mapJoinRow(r, "mine"));
  return {
    rows,
    total,
    page,
    pageSize: EVALUATION_PICKER_PAGE_SIZE,
    hasMore: to + 1 < total,
  };
}
