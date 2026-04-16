/**
 * Copy UI — registre : `docs/UI-COPY.md` (Impression — modale et contenu).
 */
export const WIZARD_PRINT_PREVIEW_COPY = {
  toolbarPrint: "Aperçu impression",
  modalTitle: "Aperçu avant impression",
  /** Page dédiée `/questions/[id]/print` — lien vers fiche lecture */
  backToFiche: "Retour à la fiche",
  print: "Imprimer",
  downloadPdf: "Télécharger le PDF",
  /** PROVISOIRE — jusqu’à export PDF natif ; voir docs/UI-COPY.md */
  downloadPdfHint:
    "Pour obtenir un PDF, utilisez Imprimer puis la destination Enregistrer au format PDF du navigateur.",
  close: "Fermer",
  /** Chrome / Edge : bandeaux navigateur — non pilotables par CSS ; voir `docs/DECISIONS.md` § Modale aperçu. */
  printHeadersFootersHint:
    "Les bandeaux (date, URL, pagination, titre) sont ajoutés par le navigateur, pas par l’application. Dans la fenêtre d’impression, ouvrez « Plus de paramètres » et décochez « En-têtes et pieds de page » (Chrome / Edge).",
  /** Aperçu écran : bascule entre feuillets ; à l’impression, les deux feuillets sont imprimés l’un après l’autre. */
  feuilletToolbarAriaLabel:
    "Choisir le feuillet affiché à l’écran — dossier documentaire ou questionnaire. Les deux feuillets sont inclus à l’impression.",
} as const;

/** Titres et libellés — contenu imprimé (ordre strict) : `docs/UI-COPY.md` + `docs/DECISIONS.md` (règles impression). */
export const PRINTABLE_FICHE_SECTION_COPY = {
  documents: "Documents",
  /** Deuxième feuillet — consigne, guidage (si champ séparé), réponse, grille. */
  questionnaireFeuillet: "Questionnaire",
  consigne: "Consigne",
  guidage: "Guidage complémentaire",
  answerSpace: "Espace de réponse de l’élève",
  /** Accessibilité : nombre de lignes non affiché visuellement */
  answerSectionAria: (n: number) =>
    `Espace de réponse de l’élève, ${n} ligne${n > 1 ? "s" : ""} vierges`,
  grille: "Grille de correction",
  sourcePrefix: "Source : ",
  emptySlot: "—",
  noGrilleTool: "Aucun outil d’évaluation associé.",
} as const;

/** Carrousel PNG — aperçu PDF rasterisé (print-engine D5). `docs/UI-COPY.md` (Impression — modale et contenu). */
export const CARROUSEL_APERCU_COPY = {
  skeletonTitre: "Préparation de l'aperçu\u2026",
  skeletonSousTitre: "Mise en page et génération des visuels",
  banniereInvalidation: "Le contenu a été modifié depuis la dernière génération",
  boutonRegenerer: "Mettre à jour l'aperçu",
  erreurGeneration: "La génération a échoué",
  boutonReessayer: "Réessayer",
  indicateurPage: (n: number, total: number) => `Page ${n} sur ${total}`,
  altImage: (n: number, total: number, nomFeuillet: string) =>
    `Page ${n} sur ${total} — ${nomFeuillet}`,
} as const;

/** Impression / aperçu épreuve multi-TAÉ — `docs/UI-COPY.md` (épreuve, impression). */
export const EVAL_PRINT_SECTION_COPY = {
  dossierDocumentaire: "Dossier documentaire",
  questionnaire: "Questionnaire",
  questionHeading: (n: number) => `Question ${n}`,
  noDocuments: "Aucun document dans cette épreuve.",
  noQuestions: "Aucune tâche d’apprentissage et d’évaluation dans cette épreuve.",
} as const;
