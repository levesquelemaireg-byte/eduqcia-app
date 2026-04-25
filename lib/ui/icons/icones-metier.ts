/**
 * Source unique des glyphes Material Symbols Outlined associés aux concepts
 * métier ÉduQc.IA — un seul fichier pour toutes les icônes métier.
 *
 * Référence textuelle : tableau « Icônes Material Symbols — mapping clé »
 * dans `CLAUDE.md`. Quand un concept change d'icône, modifier UNIQUEMENT
 * cette entrée — la propagation est automatique pour tous les consommateurs.
 *
 * Justifications longues (texte d'infobulle) : `lib/tache/icon-justifications.ts`.
 *
 * Concepts non listés ici (composants dédiés, hors mapping string) :
 *   - Documentation légale  → `LegalNoticeIcon` (`components/ui/LegalNoticeIcon.tsx`)
 *   - Période historique    → `PeriodeIcon`    (`components/ui/PeriodeIcon.tsx`)
 */

export const ICONES_METIER = {
  consigne: "short_text",
  guidage: "tooltip_2",
  corrige: "task_alt",
  niveau: "school",
  discipline: "menu_book",
  operationIntellectuelle: "psychology",
  /** Comportement attendu et grille d'évaluation associée (même glyphe). */
  comportement: "table",
  nombreLignes: "format_line_spacing",
  documents: "article",
  competenceDisciplinaire: "license",
  connaissances: "lightbulb",
  /** Valeur auto-générée par l'application (numérotation, calculs, jetons). */
  valeurAutoGeneree: "settings",
  /** Création document — utilisé dans la navbar (« Créer un document »). */
  creationDocument: "add_notes",
  /** Onglet Sommaire — vue détaillée tâche / document / épreuve. */
  sommaire: "topic",
  aspectsSociete: "deployed_code",
  auteur: "person",
  dateCreation: "calendar_today",
  dateMiseAJour: "history",
  /** Lien d'utilisation (compteur d'usages, copier le lien hors-action). */
  utilisation: "link",
  ancrageTemporel: "pin_history",
} as const;

export type IconeMetier = (typeof ICONES_METIER)[keyof typeof ICONES_METIER];
