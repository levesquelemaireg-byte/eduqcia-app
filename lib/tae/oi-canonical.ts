/**
 * Glyphes Material des OI : source de vérité `public/data/oi.json` (alignée sur le wizard).
 * La table `oi` peut diverger après un vieux seed — la fiche lecture utilise le JSON pour l’icône.
 */

import rawOi from "@/public/data/oi.json";

type OiJsonRow = { id?: string; icone?: string };

const byId = new Map<string, string>();
for (const o of rawOi as OiJsonRow[]) {
  if (typeof o?.id === "string" && typeof o.icone === "string" && o.icone.length > 0) {
    byId.set(o.id, o.icone);
  }
}

/** Nom du glyphe Material (`material-symbols-outlined`) pour cet `oi_id`, si présent dans oi.json. */
export function canonicalOiIcone(oiId: string | null | undefined): string | null {
  if (!oiId) return null;
  return byId.get(oiId) ?? null;
}
