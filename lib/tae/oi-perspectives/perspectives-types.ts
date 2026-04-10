/**
 * Types pour le système de perspectives (OI3 · 3.3–3.5) et moments (OI6).
 *
 * Spec : docs/SPEC-TEMPLATES-CONSIGNE.md § Payload unifié
 */

// ---------------------------------------------------------------------------
// Données d'une perspective individuelle
// ---------------------------------------------------------------------------

export type PerspectiveData = {
  /** Nom et identité de l'acteur ou historien (ex. « François de Lévis, général français »). */
  acteur: string;
  /** Contenu / extrait — HTML TipTap. */
  contenu: string;
  /** Source de l'extrait — HTML TipTap. */
  source: string;
  /** Type de document — textuel ou iconographique. */
  type: "textuel" | "iconographique";
  /** Type de source — primaire ou secondaire. `null` = pas encore choisi. */
  sourceType: "primaire" | "secondaire" | null;
};

// ---------------------------------------------------------------------------
// Payload complet du bloc perspectives
// ---------------------------------------------------------------------------

export type PerspectiveTypePerspectives = "acteurs" | "historiens";

export type PerspectivesPayload = {
  /** Groupé (un seul document physique) ou séparé (un document par perspective). */
  mode: "groupe" | "separe";
  /** Titre du document englobant (mode groupé). */
  titre: string;
  /** Type du document englobant (mode groupé). */
  type: "textuel" | "iconographique";
  /** Acteurs historiques ou historiens — pilote les labels générés dans la consigne. */
  typePerspectives: PerspectiveTypePerspectives;
  /** Contexte historique (champ libre, Bloc 3 structuré/pur). */
  contexte: string;
  /** Perspectives — longueur = count (2 ou 3, selon WizardBlocConfig). */
  perspectives: PerspectiveData[];
};

// ---------------------------------------------------------------------------
// Données d'un moment (OI6 · 6.3)
// ---------------------------------------------------------------------------

export type MomentData = {
  /** Titre optionnel — ex. « Structure politique après Utrecht ». */
  titre: string;
  /** Contenu — HTML TipTap (contient les indices temporels). */
  contenu: string;
  /** Source — HTML TipTap. */
  source: string;
  /** Type de source — primaire ou secondaire. `null` = pas encore choisi. */
  sourceType: "primaire" | "secondaire" | null;
};

// ---------------------------------------------------------------------------
// Payload Bloc 5 intrus (3.5 uniquement)
// ---------------------------------------------------------------------------

export type PerspectiveLetter = "A" | "B" | "C";

export type IntrusPayload = {
  /** Lettre de la perspective « intrus » (différente des deux autres). */
  intrusLetter: PerspectiveLetter | "";
  /** Explication de la différence — HTML TipTap. */
  explicationDifference: string;
  /** Point commun des deux autres — HTML TipTap. */
  pointCommun: string;
};
