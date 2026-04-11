/** Mode d'aperçu pour le PreviewPanel. */
export type PreviewMode = {
  id: string;
  label: string;
  /** Nom d'icône Material Symbols Outlined. */
  icon?: string;
  /** Tooltip ou texte d'aide. */
  description?: string;
  disabled?: boolean;
  /** Sous-modes optionnels (ex. Dossier documentaire / Questionnaire). */
  subModes?: PreviewMode[];
};
