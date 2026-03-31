import type { SupabaseClient } from "@supabase/supabase-js";

import { BANK_PAGE_SIZE } from "@/lib/queries/bank-tasks";
import type { Database } from "@/lib/types/database";

type Client = SupabaseClient<Database>;

export type BankEvaluationRow = {
  id: string;
  titre: string;
  updated_at: string;
  auteur_nom: string | null;
  nb_taches: number;
  /** Aligné sur `getEvaluationEditBundle` (auteur seul). */
  canEdit: boolean;
};

export function serializeBankEvaluationsQueryForHref(q: string | undefined, page: number): string {
  const u = new URLSearchParams();
  u.set("onglet", "evaluations");
  const s = q?.trim();
  if (s) u.set("q", s);
  if (page > 0) u.set("page", String(page));
  return `/bank?${u.toString()}`;
}

function escapeIlikePattern(q: string): string {
  return `%${q.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_")}%`;
}

async function countTasksByEvaluationIds(
  supabase: Client,
  evaluationIds: string[],
): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (evaluationIds.length === 0) return map;
  const { data, error } = await supabase
    .from("evaluation_tae")
    .select("evaluation_id")
    .in("evaluation_id", evaluationIds);
  if (error || !data) return map;
  for (const row of data as { evaluation_id: string }[]) {
    const k = row.evaluation_id;
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return map;
}

/**
 * Épreuves publiées en banque — liste paginée ; filtres dérivés (niveau, discipline, connaissances) : PROVISOIRE — à brancher (plan-banque-collaborative.md).
 */
export async function getBankPublishedEvaluationsPage(
  supabase: Client,
  opts: { q?: string; page: number; viewerId: string },
): Promise<{ rows: BankEvaluationRow[]; total: number }> {
  const page = Number.isFinite(opts.page) && opts.page >= 0 ? Math.floor(opts.page) : 0;
  const from = page * BANK_PAGE_SIZE;
  const to = from + BANK_PAGE_SIZE - 1;

  let q = supabase
    .from("evaluations")
    .select(
      `
      id,
      titre,
      updated_at,
      auteur_id,
      profiles!evaluations_auteur_id_fkey ( full_name )
    `,
      { count: "exact" },
    )
    .eq("is_published", true)
    .eq("is_archived", false)
    .order("updated_at", { ascending: false });

  const search = opts.q?.trim();
  if (search) {
    q = q.ilike("titre", escapeIlikePattern(search));
  }

  const { data, error, count } = await q.range(from, to);
  if (error || !data) {
    return { rows: [], total: 0 };
  }

  type Raw = {
    id: string;
    titre: string;
    updated_at: string;
    auteur_id: string;
    profiles: { full_name: string } | { full_name: string }[] | null;
  };

  const rawRows = data as unknown as Raw[];
  const ids = rawRows.map((r) => r.id);
  const taskCounts = await countTasksByEvaluationIds(supabase, ids);

  const rows: BankEvaluationRow[] = rawRows.map((r) => {
    const p = r.profiles;
    const prof = Array.isArray(p) ? p[0] : p;
    return {
      id: r.id,
      titre: r.titre,
      updated_at: r.updated_at,
      auteur_nom: prof?.full_name ?? null,
      nb_taches: taskCounts.get(r.id) ?? 0,
      canEdit: r.auteur_id === opts.viewerId,
    };
  });

  return { rows, total: count ?? 0 };
}
