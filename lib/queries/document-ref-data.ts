import { normalizeSqlIntId } from "@/lib/documents/ref-id";
import { createClient } from "@/lib/supabase/server";

export type NiveauOption = { id: number; label: string; code: string };
export type DisciplineOption = { id: number; label: string; code: string };
export type ConnaissanceOption = { id: number; label: string };

/** Options pour formulaires documents (référentiels `niveaux` / `disciplines`). */
export async function getDocumentFormRefOptions(): Promise<{
  niveaux: NiveauOption[];
  disciplines: DisciplineOption[];
}> {
  const supabase = await createClient();
  const [nRes, dRes] = await Promise.all([
    supabase.from("niveaux").select("id, label, code").order("ordre", { ascending: true }),
    supabase.from("disciplines").select("id, label, code").order("label", { ascending: true }),
  ]);
  const niveaux = (nRes.data ?? []).map((r) => ({
    id: normalizeSqlIntId(r.id),
    label: String((r as { label?: unknown }).label ?? ""),
    code: String((r as { code?: unknown }).code ?? ""),
  }));
  const disciplines = (dRes.data ?? []).map((r) => ({
    id: normalizeSqlIntId(r.id),
    label: String((r as { label?: unknown }).label ?? ""),
    code: String((r as { code?: unknown }).code ?? ""),
  }));
  return { niveaux, disciplines };
}

export async function getConnaissanceOptionsForDiscipline(
  disciplineId: number,
): Promise<ConnaissanceOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("connaissances")
    .select("id, enonce")
    .eq("discipline_id", disciplineId)
    .order("section", { ascending: true })
    .order("enonce", { ascending: true })
    .limit(500);
  if (error || !data) return [];
  return data.map((r) => ({
    id: normalizeSqlIntId(r.id),
    label: r.enonce.length > 120 ? `${r.enonce.slice(0, 117)}…` : r.enonce,
  }));
}
