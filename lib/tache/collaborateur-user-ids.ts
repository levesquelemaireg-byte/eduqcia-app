/**
 * Identifiants profil (UUID) pour le payload RPC `collaborateurs_user_ids`.
 * Les ids factices `local-*` du prototype sont exclus.
 */

import type { TacheFormState } from "@/lib/tache/tache-form-state-types";

/** UUID (forme Postgres / auth), insensible à la casse — aligné sur les garde-fous `tache.id`. */
const PROFILE_UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isProfileCollaborateurId(id: string): boolean {
  return PROFILE_UUID_RE.test(id.trim());
}

/**
 * UUIDs à envoyer à `publish_tache_transaction` / `update_tache_transaction`.
 * Mode équipe : au moins un id valide, distinct de l’auteur, sans doublon.
 */
export function buildCollaborateursUserIdsForPayload(
  state: TacheFormState,
  auteurId: string,
): { ok: true; ids: string[] } | { ok: false } {
  if (state.bloc1.modeConception !== "equipe") {
    return { ok: true, ids: [] };
  }
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const c of state.bloc1.collaborateurs) {
    const id = c.id.trim();
    if (!isProfileCollaborateurId(id)) continue;
    if (id === auteurId) continue;
    if (seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
  }
  if (ids.length === 0) return { ok: false };
  return { ok: true, ids };
}
