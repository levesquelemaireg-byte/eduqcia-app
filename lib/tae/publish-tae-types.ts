import type { DocumentSlotId } from "@/lib/tae/blueprint-helpers";

export type PublishTaeFailureCode =
  | "validation"
  | "lookup_niveau"
  | "lookup_discipline"
  | "lookup_cd"
  | "lookup_connaissance"
  | "document_image"
  | "document_insert"
  | "tae_insert"
  | "tae_documents_insert"
  /** Contrainte FK ou référence en base lors de la RPC (souvent données référentielles incomplètes). */
  | "rpc_foreign_key"
  /** Cast enum / type SQL (ex. aspects de société). */
  | "rpc_invalid_enum"
  /** PostgREST PGRST202 : RPC absente du projet Supabase (migration non appliquée). */
  | "rpc_function_missing"
  /** Mise à jour refusée : la TAÉ est liée à une épreuve (`evaluation_tae` / `update_tae_transaction`). */
  | "tae_locked_evaluation";

export type PublishTaeResult =
  | { ok: true; taeId: string; unpublishedDocumentsCreated: boolean }
  | { ok: false; code: PublishTaeFailureCode };

/** Payload JSON pour `publish_tae_transaction` (voir docs/ARCHITECTURE.md). */
export type PublishTaeRpcPayload = {
  auteur_id: string;
  tae: {
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
  };
  documents_new: Array<{
    titre: string;
    type: "textuel" | "iconographique";
    contenu: string | null;
    image_url: string | null;
    source_citation: string;
    niveaux_ids: number[];
    disciplines_ids: number[];
    aspects_societe: string[];
    connaissances_ids: number[];
    /** Présent si `type` = iconographique — facteur 0,5–1 pour la fiche imprimable. */
    print_impression_scale?: number;
    source_type?: "primaire" | "secondaire";
    image_legende?: string | null;
    image_legende_position?: "haut_gauche" | "haut_droite" | "bas_gauche" | "bas_droite" | null;
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
  /** Profils actifs (`profiles.id`), exclus `auteur_id` — requis côté RPC si `tae.conception_mode` = équipe. */
  collaborateurs_user_ids: string[];
};
