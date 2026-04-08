import { createClient } from "@/lib/supabase/server";

export type EvaluationCartItem = {
  id: string;
  consigne: string | null;
  nbDocuments: number;
};

export type EvaluationEditBundle = {
  evaluationId: string;
  titre: string;
  isPublished: boolean;
  cart: EvaluationCartItem[];
};

/**
 * Charge une épreuve (`evaluations`) pour l’édition de composition (auteur uniquement, non archivée).
 */
export async function getEvaluationEditBundle(
  evaluationId: string,
): Promise<EvaluationEditBundle | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: ev, error: evErr } = await supabase
    .from("evaluations")
    .select("id, titre, is_published, is_archived")
    .eq("id", evaluationId)
    .eq("auteur_id", user.id)
    .maybeSingle();

  if (evErr || !ev || ev.is_archived) return null;

  const { data: links, error: linkErr } = await supabase
    .from("evaluation_tae")
    .select("ordre, tae_id")
    .eq("evaluation_id", evaluationId)
    .order("ordre", { ascending: true });

  if (linkErr) return null;

  const ids = (links ?? []).map((l) => l.tae_id as string);
  if (ids.length === 0) {
    return {
      evaluationId: ev.id,
      titre: ev.titre,
      isPublished: ev.is_published,
      cart: [],
    };
  }

  const { data: taes, error: tErr } = await supabase
    .from("tae")
    .select(
      `
      id,
      consigne,
      comportements!tae_comportement_id_fkey ( nb_documents )
    `,
    )
    .in("id", ids);

  if (tErr || !taes) return null;

  type TRow = {
    id: string;
    consigne: string | null;
    comportements: { nb_documents: number | null } | { nb_documents: number | null }[] | null;
  };

  const byId = new Map<string, TRow>();
  for (const row of taes as unknown as TRow[]) {
    byId.set(row.id, row);
  }

  const cart: EvaluationCartItem[] = [];
  for (const lid of ids) {
    const row = byId.get(lid);
    if (!row) continue;
    const c = row.comportements;
    const comp = Array.isArray(c) ? c[0] : c;
    cart.push({
      id: row.id,
      consigne: row.consigne,
      nbDocuments: comp?.nb_documents ?? 0,
    });
  }

  return {
    evaluationId: ev.id,
    titre: ev.titre,
    isPublished: ev.is_published,
    cart,
  };
}

export type TaeCartMeta = {
  id: string;
  consigne: string | null;
  nbDocuments: number;
};

/** Métadonnées d’une TAÉ pour préremplir le panier (ex. `?addTae=`). */
export async function getTaeMetaForEvaluationCart(taeId: string): Promise<TaeCartMeta | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("tae")
    .select(
      `
      id,
      consigne,
      is_archived,
      is_published,
      auteur_id,
      comportements!tae_comportement_id_fkey ( nb_documents )
    `,
    )
    .eq("id", taeId)
    .maybeSingle();

  if (error || !data) return null;

  type R = {
    id: string;
    consigne: string | null;
    is_archived: boolean;
    is_published: boolean;
    auteur_id: string;
    comportements: { nb_documents: number | null } | { nb_documents: number | null }[] | null;
  };

  const row = data as unknown as R;
  if (row.is_archived) return null;

  let collaborator = false;
  if (!row.is_published && row.auteur_id !== user.id) {
    const { data: collab } = await supabase
      .from("tae_collaborateurs")
      .select("tae_id")
      .eq("tae_id", taeId)
      .eq("user_id", user.id)
      .maybeSingle();
    collaborator = !!collab;
  }

  const eligible = row.is_published || row.auteur_id === user.id || collaborator;
  if (!eligible) return null;

  const c = row.comportements;
  const comp = Array.isArray(c) ? c[0] : c;

  return {
    id: row.id,
    consigne: row.consigne,
    nbDocuments: comp?.nb_documents ?? 0,
  };
}
