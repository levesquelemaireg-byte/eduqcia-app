"use server";

import { createClient } from "@/lib/supabase/server";
import { documentsRepository } from "@/lib/repositories/documents-repository";
import type { DocumentEnrichedRow } from "@/lib/types/document-enriched";

type Result = { ok: true; items: DocumentEnrichedRow[] } | { ok: false; error: "auth" | "server" };

export async function loadMoreProfileDocumentsAction(
  profileId: string,
  offset: number,
  limit = 10,
): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "auth" };

  try {
    const items = await documentsRepository.listForProfile(profileId, {
      offset,
      limit,
      orderBy: "created_at_desc",
    });
    return { ok: true, items };
  } catch (err) {
    console.error("[loadMoreProfileDocumentsAction]", err);
    return { ok: false, error: "server" };
  }
}
