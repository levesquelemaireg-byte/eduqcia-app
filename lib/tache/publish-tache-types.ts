import type { DocumentSlotId } from "@/lib/tache/blueprint-helpers";
import type { Json } from "@/lib/types/database";

/**
 * Snapshot des champs majeurs d'une TAÉ avant édition.
 * Utilisé par `detectVersionTrigger` pour identifier une modification majeure (DOMAIN §9.1/9.2).
 */
export type TacheVersionSnapshot = {
  // Champs numériques — comparaison backend (detectVersionTrigger / SQL)
  oi_id: string | null;
  comportement_id: string | null;
  cd_id: number | null;
  connaissances_ids: number[];
  niveau_id: number | null;
  discipline_id: number | null;
  /** UUID des documents actuellement liés (`tae_documents.document_id`). */
  documentIds: string[];
  // Champs codes/strings — comparaison frontend (detectMajorChangeFromFormState)
  niveauCode: string;
  disciplineCode: string;
  /** rowId JSON des connaissances sélectionnées — équivalent set-based de `connaissances_ids`. */
  connRowIds: string[];
  /** `critereId` JSON de la CD sélectionnée (`CdSelectionWithIds.critereId`), ou `null`. */
  cdCritereId: string | null;
};

export type PublishTacheFailureCode =
  | "validation"
  | "lookup_niveau"
  | "lookup_discipline"
  | "lookup_cd"
  | "lookup_connaissance"
  | "document_image"
  | "document_insert"
  | "tache_insert"
  | "tache_documents_insert"
  /** Contrainte FK ou référence en base lors de la RPC (souvent données référentielles incomplètes). */
  | "rpc_foreign_key"
  /** Cast enum / type SQL (ex. aspects de société). */
  | "rpc_invalid_enum"
  /** PostgREST PGRST202 : RPC absente du projet Supabase (migration non appliquée). */
  | "rpc_function_missing"
  /** Mise à jour refusée : la TAÉ est liée à une épreuve (`evaluation_tache` / `update_tache_transaction`). */
  | "tache_locked_evaluation";

export type PublishTacheResult =
  | { ok: true; tacheId: string; unpublishedDocumentsCreated: boolean; wasMajorBump: boolean }
  | { ok: false; code: PublishTacheFailureCode };

/** Payload JSON pour `publish_tache_transaction` (voir docs/ARCHITECTURE.md). */
export type PublishTacheRpcPayload = {
  auteur_id: string;
  tache: {
    conception_mode: "seul" | "equipe";
    oi_id: string;
    comportement_id: string;
    cd_id: number | null;
    connaissances_ids: number[];
    consigne: string;
    guidage: string;
    corrige: string;
    nb_lignes: number | null;
    niveau_id: number;
    discipline_id: number;
    aspects_societe: string[];
    /** Présent pour les parcours NR structurés (ex. 1.3) ; omis pour les autres. */
    non_redaction_data?: Json | null;
  };
  documents_new: Array<{
    titre: string;
    type: "textuel" | "iconographique";
    /** Éléments JSONB — 1 pour simple, 2–3 pour perspectives, 2 pour deux_temps. */
    elements: Record<string, unknown>[];
    niveaux_ids: number[];
    disciplines_ids: number[];
    aspects_societe: string[];
    connaissances_ids: number[];
    repere_temporel?: string | null;
    annee_normalisee?: number | null;
  }>;
  slots: Array<{
    slot: DocumentSlotId;
    ordre: number;
    mode: "reuse" | "create";
    document_id?: string;
    newIndex?: number;
  }>;
  /** Profils actifs (`profiles.id`), exclus `auteur_id` — requis côté RPC si `tache.conception_mode` = équipe. */
  collaborateurs_user_ids: string[];
};
