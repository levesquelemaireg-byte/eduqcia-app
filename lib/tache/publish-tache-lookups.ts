import type { SupabaseClient } from "@supabase/supabase-js";
import type { DisciplineCode } from "@/lib/tache/blueprint-helpers";
import { connaissanceRealiteLookupVariants } from "@/lib/tache/connaissances-helpers";
import type { ConnaissanceSelectionWithIds } from "@/lib/tache/connaissances-types";
import type { TacheFormState } from "@/lib/tache/tache-form-state-types";

export async function getNiveauId(supabase: SupabaseClient, code: string): Promise<number | null> {
  const { data, error } = await supabase
    .from("niveaux")
    .select("id")
    .eq("code", code)
    .maybeSingle();
  if (error || !data || typeof (data as { id?: unknown }).id !== "number") return null;
  return (data as { id: number }).id;
}

export async function getDisciplineId(
  supabase: SupabaseClient,
  codeUpper: string,
): Promise<number | null> {
  const { data, error } = await supabase
    .from("disciplines")
    .select("id")
    .eq("code", codeUpper)
    .maybeSingle();
  if (error || !data || typeof (data as { id?: unknown }).id !== "number") return null;
  return (data as { id: number }).id;
}

export async function resolveCdId(
  supabase: SupabaseClient,
  disciplineId: number,
  state: TacheFormState,
): Promise<number | null> {
  const disc = state.bloc2.discipline as DisciplineCode;
  if (disc === "geo") return null;
  const sel = state.bloc6.cd.selection;
  if (!sel) return null;
  const { data, error } = await supabase
    .from("cd")
    .select("id")
    .eq("discipline_id", disciplineId)
    .eq("competence", sel.competence)
    .eq("composante", sel.composante)
    .eq("critere", sel.critere)
    .maybeSingle();
  if (error || !data || typeof (data as { id?: unknown }).id !== "number") return null;
  return (data as { id: number }).id;
}

/**
 * Résout les sélections Miller (étape connaissances) vers `connaissances.id` — même logique que la publication TAÉ.
 */
export async function resolveConnaissanceSelectionsToIds(
  supabase: SupabaseClient,
  disciplineId: number,
  disciplineCode: DisciplineCode,
  selections: ConnaissanceSelectionWithIds[],
): Promise<number[] | null> {
  if (disciplineCode === "geo") return [];

  const ids: number[] = [];
  for (const c of selections) {
    const realiteVariants = connaissanceRealiteLookupVariants(disciplineCode, c.realite_sociale);
    let rowId: number | null = null;
    for (const rs of realiteVariants) {
      let q = supabase
        .from("connaissances")
        .select("id")
        .eq("discipline_id", disciplineId)
        .eq("realite_sociale", rs)
        .eq("section", c.section)
        .eq("enonce", c.enonce);
      if (c.sous_section === null || c.sous_section === undefined) {
        q = q.is("sous_section", null);
      } else {
        q = q.eq("sous_section", c.sous_section);
      }
      const { data, error } = await q.maybeSingle();
      if (error) continue;
      if (data && typeof (data as { id?: unknown }).id === "number") {
        rowId = (data as { id: number }).id;
        break;
      }
    }
    if (rowId === null) return null;
    ids.push(rowId);
  }
  return ids;
}

export async function resolveConnaissanceIds(
  supabase: SupabaseClient,
  disciplineId: number,
  state: TacheFormState,
): Promise<number[] | null> {
  const disc = state.bloc2.discipline as DisciplineCode;
  return resolveConnaissanceSelectionsToIds(
    supabase,
    disciplineId,
    disc,
    state.bloc7.connaissances,
  );
}
