"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import type { z } from "zod";
import type { documentElementFormSchema } from "@/lib/schemas/autonomous-document";

type Client = SupabaseClient<Database>;
type ElementFormValue = z.infer<typeof documentElementFormSchema>;

type ElementInsert = Database["public"]["Tables"]["document_elements"]["Insert"];

/**
 * Persiste les éléments d'un document dans `document_elements`.
 *
 * - Supprime les éléments existants pour ce document (idempotent).
 * - Insère les nouveaux éléments avec leur position.
 *
 * Pour les documents `simple`, cette fonction n'est pas appelée —
 * le premier élément est stocké en colonnes flat dans `documents`.
 */
export async function persistDocumentElements(
  supabase: Client,
  documentId: string,
  elements: ElementFormValue[],
): Promise<{ ok: true } | { ok: false; message: string }> {
  // Supprimer les éléments existants
  const { error: delErr } = await supabase
    .from("document_elements")
    .delete()
    .eq("document_id", documentId);

  if (delErr) {
    return { ok: false, message: `Suppression éléments : ${delErr.message}` };
  }

  // Insérer les nouveaux éléments
  const rows: ElementInsert[] = elements.map((el, i) => {
    const legendTrim = el.image_legende?.trim() ?? "";
    const legendPos =
      el.type === "iconographique" && legendTrim.length > 0
        ? (el.image_legende_position ?? null)
        : null;

    return {
      document_id: documentId,
      position: i,
      type: el.type,
      contenu: el.type === "textuel" ? (el.contenu ?? "").trim() : null,
      image_url: el.type === "iconographique" ? (el.image_url ?? "").trim() : null,
      source_citation: el.source_citation.trim(),
      source_type: el.source_type,
      legende: legendTrim.length > 0 ? legendTrim : null,
      legende_position: legendPos,
      categorie_textuelle:
        el.type === "textuel" && el.categorie_textuelle != null ? el.categorie_textuelle : null,
      categorie_iconographique:
        el.type === "iconographique" && el.type_iconographique != null
          ? el.type_iconographique
          : null,
      auteur: el.auteur?.trim() || null,
      repere_temporel: el.repere_temporel?.trim() || null,
      sous_titre: el.sous_titre?.trim() || null,
    };
  });

  const { error: insErr } = await supabase.from("document_elements").insert(rows);

  if (insErr) {
    return { ok: false, message: `Insertion éléments : ${insErr.message}` };
  }

  return { ok: true };
}
