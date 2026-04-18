"use server";

import { unstable_cache } from "next/cache";

import { createServiceClient } from "@/lib/supabase/admin";

export type CssOption = { id: string; nomOfficiel: string; nomCourt: string };
export type SchoolOption = { id: string; nomOfficiel: string; cssId: string };

/**
 * Toutes les CSS actives, triées par nom officiel.
 * Utilise service_role car la page /register est accessible sans auth.
 * Cache 1 h — ces données changent très rarement.
 */
export const getAllCss = unstable_cache(
  async (): Promise<CssOption[]> => {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("css")
      .select("id, nom_officiel, nom_court")
      .eq("is_active", true)
      .order("nom_officiel");

    if (error) throw new Error(`[getAllCss] ${error.message}`);
    return (data ?? []).map((r) => ({
      id: r.id,
      nomOfficiel: r.nom_officiel,
      nomCourt: r.nom_court,
    }));
  },
  ["all-css"],
  { revalidate: 3600 },
);

/**
 * Toutes les écoles actives pour un CSS donné, triées par nom.
 * Utilise service_role car la page /register est accessible sans auth.
 * Cache 1 h par CSS — ces données changent très rarement.
 */
export async function getSchoolsByCssId(cssId: string): Promise<SchoolOption[]> {
  return getCachedSchoolsByCssId(cssId);
}

const getCachedSchoolsByCssId = unstable_cache(
  async (cssId: string): Promise<SchoolOption[]> => {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("schools")
      .select("id, nom_officiel, css_id")
      .eq("css_id", cssId)
      .eq("is_active", true)
      .order("nom_officiel");

    if (error) throw new Error(`[getSchoolsByCssId] ${error.message}`);
    return (data ?? []).map((r) => ({
      id: r.id,
      nomOfficiel: r.nom_officiel,
      cssId: r.css_id,
    }));
  },
  ["schools-by-css"],
  { revalidate: 3600 },
);

/**
 * Toutes les écoles actives (SEC=1), pour pré-charger côté serveur.
 * ~860 lignes, ~50 kB JSON — acceptable pour le MVP.
 * Cache 1 h — ces données changent très rarement.
 */
export const getAllSchools = unstable_cache(
  async (): Promise<SchoolOption[]> => {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("schools")
      .select("id, nom_officiel, css_id")
      .eq("is_active", true)
      .order("nom_officiel");

    if (error) throw new Error(`[getAllSchools] ${error.message}`);
    return (data ?? []).map((r) => ({
      id: r.id,
      nomOfficiel: r.nom_officiel,
      cssId: r.css_id,
    }));
  },
  ["all-schools"],
  { revalidate: 3600 },
);
