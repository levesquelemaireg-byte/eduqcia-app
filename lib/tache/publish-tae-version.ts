/**
 * Détection client-side d'une modification majeure (DOMAIN §9.1/9.2).
 * Fonction pure — aucune dépendance Supabase, testable isolément.
 * La RPC `update_tae_transaction` effectue la même détection côté SQL
 * (filet de sécurité atomique) ; cette fonction sert à :
 *   1. Informer le résultat (`wasMajorBump`) sans SELECT supplémentaire post-RPC.
 *   2. Permettre au wizard d'afficher l'avertissement AVANT soumission (couche 4).
 */

import type { TaeVersionSnapshot, PublishTaeRpcPayload } from "@/lib/tache/publish-tae-types";
import type { TaeFormState } from "@/lib/tache/tae-form-state-types";

/**
 * Champs mineurs (patch silencieux) — tout autre champ est majeur.
 * Doit rester aligné sur `get_field_version_type` dans `supabase/schema.sql`.
 */
const MINOR_FIELDS = new Set(["consigne", "guidage", "corrige", "nb_lignes"]);
void MINOR_FIELDS; // alignement documentaire uniquement — la logique ci-dessous est explicite

/**
 * Compare le snapshot de la TAÉ avant édition avec le payload entrant.
 * Retourne `'major_bump'` si au moins un champ structurant diffère,
 * `'minor_patch'` sinon.
 */
export function detectVersionTrigger(
  snapshot: TaeVersionSnapshot,
  payload: PublishTaeRpcPayload,
): "minor_patch" | "major_bump" {
  const { tae, slots } = payload;

  if (snapshot.oi_id !== tae.oi_id) return "major_bump";
  if (snapshot.comportement_id !== tae.comportement_id) return "major_bump";
  if (snapshot.cd_id !== tae.cd_id) return "major_bump";
  if (snapshot.niveau_id !== tae.niveau_id) return "major_bump";
  if (snapshot.discipline_id !== tae.discipline_id) return "major_bump";

  // connaissances_ids : comparaison ensembles triés
  const sortedCurrent = [...(snapshot.connaissances_ids ?? [])].sort((a, b) => a - b);
  const sortedNew = [...tae.connaissances_ids].sort((a, b) => a - b);
  if (sortedCurrent.length !== sortedNew.length || sortedCurrent.some((v, i) => v !== sortedNew[i]))
    return "major_bump";

  // documents : nouveau document créé → majeur
  if (slots.some((s) => s.mode === "create")) return "major_bump";

  // documents : remplacement d'un slot existant → ensembles triés
  const reuseIds = slots
    .filter((s): s is typeof s & { mode: "reuse"; document_id: string } => s.mode === "reuse")
    .map((s) => s.document_id)
    .sort();
  const currentIds = [...snapshot.documentIds].sort();
  if (reuseIds.length !== currentIds.length || reuseIds.some((id, i) => id !== currentIds[i]))
    return "major_bump";

  return "minor_patch";
}

/**
 * Détection d'une modification majeure à partir du `TaeFormState` courant (frontend, pré-soumission).
 * Utilise les champs codes/strings du snapshot — pas de lookup DB requis.
 * Retourne `true` si au moins un champ structurant a changé.
 */
export function detectMajorChangeFromFormState(
  snapshot: TaeVersionSnapshot,
  state: TaeFormState,
): boolean {
  if (snapshot.oi_id !== state.bloc2.oiId) return true;
  if (snapshot.comportement_id !== state.bloc2.comportementId) return true;
  if (snapshot.niveauCode !== state.bloc2.niveau) return true;
  if (snapshot.disciplineCode !== state.bloc2.discipline) return true;

  const currentCdCritereId = state.bloc6.cd.selection?.critereId ?? null;
  if (snapshot.cdCritereId !== currentCdCritereId) return true;

  // connaissances : comparer les ensembles triés de rowIds
  const sortedSnap = [...snapshot.connRowIds].sort();
  const sortedCurrent = state.bloc7.connaissances.map((c) => c.rowId).sort();
  if (
    sortedSnap.length !== sortedCurrent.length ||
    sortedSnap.some((id, i) => id !== sortedCurrent[i])
  )
    return true;

  // documents : nouveau document (mode ≠ reuse) OU slot pointant vers un autre document_id
  const snapDocIds = new Set(snapshot.documentIds);
  for (const { slotId } of state.bloc2.documentSlots) {
    const slot = state.bloc4.documents[slotId];
    if (!slot || slot.mode !== "reuse") return true;
    if (!slot.source_document_id || !snapDocIds.has(slot.source_document_id)) return true;
  }

  return false;
}
