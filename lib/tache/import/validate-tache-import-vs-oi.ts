import { findComportement, findOi } from "@/lib/tache/blueprint-helpers";
import type { OiEntryJson } from "@/lib/types/oi";

/**
 * Comportements dont `tache.non_redaction_data` est requis (JSON structuré NR).
 * Faire évoluer ce set quand de nouveaux parcours NR partagent ce schéma.
 */
export const COMPORTEMENT_IDS_REQUISANT_NON_REDACTION_STRUCT = new Set<string>(["1.3"]);

export type TacheImportSnapshotForOiValidation = {
  conception_mode: string;
  oi_id: string;
  comportement_id: string;
  nb_lignes: number | null;
  niveau_id: number;
  discipline_id: number;
  /** Présent seulement si la clé existe dans le JSON source */
  non_redaction_data?: unknown;
};

export type DocumentImportSnapshot = {
  niveaux_ids: unknown;
  disciplines_ids: unknown;
};

export type SlotImportSnapshot = {
  mode?: string;
};

export type ValidateTacheImportVsOiResult = { ok: true } | { ok: false; issues: string[] };

function isSingletonNumberArrayMatching(ids: unknown, expected: number): boolean {
  return Array.isArray(ids) && ids.length === 1 && ids[0] === expected;
}

/**
 * Vérifie cohérence brouillon d'import (post-normalisation alias) avec `oi.json`.
 * Ne remplace pas la validation Zod / RPC complète — garde-fous OI + alignement ids + slots import `create`.
 */
export function validateTacheImportVsOi(
  oiList: OiEntryJson[],
  snapshot: {
    tache: TacheImportSnapshotForOiValidation;
    documents_new: readonly DocumentImportSnapshot[];
    slots: readonly SlotImportSnapshot[];
    collaborateurs_user_ids: readonly unknown[];
  },
): ValidateTacheImportVsOiResult {
  const issues: string[] = [];
  const { tache } = snapshot;
  const oi = findOi(oiList, tache.oi_id);
  if (!oi) {
    issues.push(`OI inconnue : ${tache.oi_id}.`);
    return { ok: false, issues };
  }
  const comp = findComportement(oi, tache.comportement_id);
  if (!comp) {
    issues.push(`Comportement ${tache.comportement_id} introuvable pour ${tache.oi_id}.`);
    return { ok: false, issues };
  }

  if (
    typeof comp.nb_documents === "number" &&
    snapshot.documents_new.length !== comp.nb_documents
  ) {
    issues.push(
      `Nombre de documents : attendu ${comp.nb_documents} pour ${tache.oi_id} / ${tache.comportement_id}, reçu ${snapshot.documents_new.length}.`,
    );
  }

  if (comp.nb_lignes !== undefined && tache.nb_lignes !== comp.nb_lignes) {
    issues.push(
      `nb_lignes : attendu ${comp.nb_lignes} pour ${tache.oi_id} / ${tache.comportement_id}, reçu ${String(tache.nb_lignes)}.`,
    );
  }

  const nrRequired = COMPORTEMENT_IDS_REQUISANT_NON_REDACTION_STRUCT.has(tache.comportement_id);
  const hasNr =
    "non_redaction_data" in tache &&
    tache.non_redaction_data !== null &&
    typeof tache.non_redaction_data === "object";

  if (nrRequired && !hasNr) {
    issues.push(
      `non_redaction_data requis pour le comportement ${tache.comportement_id} (${tache.oi_id}).`,
    );
  }
  if (!nrRequired && hasNr) {
    issues.push(
      `non_redaction_data ne doit pas être présent pour ${tache.oi_id} / ${tache.comportement_id}.`,
    );
  }

  snapshot.documents_new.forEach((d, i) => {
    if (!isSingletonNumberArrayMatching(d.niveaux_ids, tache.niveau_id)) {
      issues.push(
        `Document ${i} : niveaux_ids doit être [${tache.niveau_id}] (singleton identique à tache.niveau_id).`,
      );
    }
    if (!isSingletonNumberArrayMatching(d.disciplines_ids, tache.discipline_id)) {
      issues.push(
        `Document ${i} : disciplines_ids doit être [${tache.discipline_id}] (singleton identique à tache.discipline_id).`,
      );
    }
  });

  if (snapshot.slots.length !== snapshot.documents_new.length) {
    issues.push(
      `slots : attendu ${snapshot.documents_new.length} entrées (comme documents_new), reçu ${snapshot.slots.length}.`,
    );
  }

  snapshot.slots.forEach((s, i) => {
    if (s.mode !== "create") {
      issues.push(
        `Slot ${i} : pour un import NotebookLM, mode attendu « create », reçu « ${String(s.mode)} ».`,
      );
    }
  });

  if (tache.conception_mode === "seul" && snapshot.collaborateurs_user_ids.length > 0) {
    issues.push("conception_mode « seul » : collaborateurs_user_ids doit être [].");
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }
  return { ok: true };
}
