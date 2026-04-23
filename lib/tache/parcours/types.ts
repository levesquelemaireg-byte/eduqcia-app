import type { AspectSocieteKey } from "@/lib/tache/redaction-helpers";

export type { AspectSocieteKey };

/** Types forts pour les configurations de blocs — pas de strings libres. */
export type Bloc3Type = "modele_souple" | "structure" | "pur" | "schema_cd1" | "interpretation_cd2";
export type Bloc4Type = "standard" | "perspectives" | "moments" | "dossier_cd1" | "dossier_cd2";
export type Bloc5Type = "standard" | "intrus" | "redactionnel" | "corrige_cd1" | "corrige_cd2";

export type ParcoursId = "section-a" | "section-b-schema-cd1" | "section-c-interpretation-cd2";

export type ParcoursTache = {
  id: ParcoursId;
  /** Label court affiché dans le sélecteur. */
  label: string;
  /** Nom officiel du critère ministériel. */
  critereOfficiel: string;
  /** Description pédagogique courte. */
  description: string;
  /** Le parcours est-il activé dans l'UI ? false = carte grisée « Bientôt disponible ». */
  actif: boolean;
  oiAutoAssignee: boolean;
  comportementAutoAssigne: boolean;
  oiIdFixe?: string;
  comportementIdFixe?: string;
  grilleFixe?: string;
  documentsMin: number;
  documentsMax: number;
  aspectsRequis: boolean;
  bloc3Type?: Bloc3Type;
  bloc4Type?: Bloc4Type;
  bloc5Type?: Bloc5Type;
};
