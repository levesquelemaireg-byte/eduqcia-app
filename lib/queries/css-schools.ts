"use server";

import { createServiceClient } from "@/lib/supabase/admin";

export type CssOption = { id: string; nomOfficiel: string; nomCourt: string };
export type SchoolOption = { id: string; nomOfficiel: string; cssId: string };

/**
 * Toutes les CSS actives, triées par nom officiel.
 * Utilise service_role car la page /register est accessible sans auth.
 */
export async function getAllCss(): Promise<CssOption[]> {
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
}

/**
 * Toutes les écoles actives pour un CSS donné, triées par nom.
 * Utilise service_role car la page /register est accessible sans auth.
 */
export async function getSchoolsByCssId(cssId: string): Promise<SchoolOption[]> {
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
}

/**
 * Toutes les écoles actives (SEC=1), pour pré-charger côté serveur.
 * ~860 lignes, ~50 kB JSON — acceptable pour le MVP.
 */
export async function getAllSchools(): Promise<SchoolOption[]> {
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
}
