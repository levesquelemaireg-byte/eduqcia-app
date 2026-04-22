import type { SupabaseClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";

import { createServiceClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/types/database";

type Client = SupabaseClient<Database>;

export type BankOiOption = { id: string; titre: string };
export type BankComportementOption = { id: string; enonce: string };
export type BankNiveauOption = { id: number; label: string };
export type BankDisciplineOption = { id: number; label: string };

export type BankTacheFilterRefs = {
  niveaux: BankNiveauOption[];
  disciplines: BankDisciplineOption[];
  ois: BankOiOption[];
  comportements: BankComportementOption[];
};

/** Niveaux + disciplines + OI actives — cache 1 h (données quasi-immuables). */
const getStaticFilterRefs = unstable_cache(
  async () => {
    const supabase = createServiceClient();
    const [nivRes, discRes, oiRes] = await Promise.all([
      supabase.from("niveaux").select("id, label").order("ordre", { ascending: true }),
      supabase.from("disciplines").select("id, label").order("id", { ascending: true }),
      supabase
        .from("oi")
        .select("id, titre")
        .eq("status", "active")
        .order("ordre", { ascending: true }),
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

    return { niveaux, disciplines, ois };
  },
  ["bank-static-filter-refs"],
  { revalidate: 3600 },
);

/**
 * Données de référence pour les filtres banque — onglet Tâches.
 * Niveaux, disciplines et OI sont cachés 1 h (quasi-immuables).
 * `comportements` : filtrés par `oiId`, requête légère par appel.
 */
export async function getBankTacheFilterRefs(
  supabase: Client,
  oiId: string | null,
): Promise<BankTacheFilterRefs> {
  const [staticRefs, compRes] = await Promise.all([
    getStaticFilterRefs(),
    oiId
      ? supabase
          .from("comportements")
          .select("id, enonce")
          .eq("oi_id", oiId)
          .order("ordre", { ascending: true })
      : Promise.resolve({ data: [] as { id: string; enonce: string }[], error: null }),
  ]);

  const comportements: BankComportementOption[] = (compRes.data ?? []).map((r) => ({
    id: r.id,
    enonce: r.enonce,
  }));

  return { ...staticRefs, comportements };
}
