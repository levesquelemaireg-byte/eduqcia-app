import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/types/database";

type Client = SupabaseClient<Database>;

export type BankOiOption = { id: string; titre: string };
export type BankComportementOption = { id: string; enonce: string };
export type BankNiveauOption = { id: number; label: string };
export type BankDisciplineOption = { id: number; label: string };

export type BankTaeFilterRefs = {
  niveaux: BankNiveauOption[];
  disciplines: BankDisciplineOption[];
  ois: BankOiOption[];
  comportements: BankComportementOption[];
};

/**
 * Données de référence pour les filtres banque — onglet Tâches.
 * `comportements` : liste filtrée par `oiId` si fourni.
 */
export async function getBankTaeFilterRefs(
  supabase: Client,
  oiId: string | null,
): Promise<BankTaeFilterRefs> {
  const [nivRes, discRes, oiRes, compRes] = await Promise.all([
    supabase.from("niveaux").select("id, label").order("ordre", { ascending: true }),
    supabase.from("disciplines").select("id, label").order("id", { ascending: true }),
    supabase
      .from("oi")
      .select("id, titre")
      .eq("status", "active")
      .order("ordre", { ascending: true }),
    oiId
      ? supabase
          .from("comportements")
          .select("id, enonce")
          .eq("oi_id", oiId)
          .order("ordre", { ascending: true })
      : Promise.resolve({ data: [] as { id: string; enonce: string }[], error: null }),
  ]);

  const niveaux: BankNiveauOption[] = (nivRes.data ?? []).map((r) => ({
    id: r.id,
    label: r.label,
  }));
  const disciplines: BankDisciplineOption[] = (discRes.data ?? []).map((r) => ({
    id: r.id,
    label: r.label,
  }));
  const ois: BankOiOption[] = (oiRes.data ?? []).map((r) => ({
    id: r.id,
    titre: r.titre,
  }));
  const comportements: BankComportementOption[] = (compRes.data ?? []).map((r) => ({
    id: r.id,
    enonce: r.enonce,
  }));

  return { niveaux, disciplines, ois, comportements };
}
