"use server";

import { getBankPublishedDocuments } from "@/lib/queries/bank-documents";
import { createClient } from "@/lib/supabase/server";

export type BankDocumentPickerRow = {
  id: string;
  titre: string;
  source_citation: string;
  type: "textuel" | "iconographique";
};

/**
 * Liste légère pour la modale Bloc 4 « Parcourir la banque » (pas d’appel Supabase côté client).
 */
export async function listBankDocumentsPickerAction(): Promise<BankDocumentPickerRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const rows = await getBankPublishedDocuments(supabase, {}, 60);
  return rows.map((r) => ({
    id: r.id,
    titre: r.titre,
    source_citation: r.source_citation,
    type: r.type,
  }));
}
