/**
 * Copy UI — carrousel d'aperçu PNG (overlay modal + onglets feuillets).
 * Registre : `docs/UI-COPY.md` (Impression — modale et contenu).
 */

export const CARROUSEL_APERCU_COPY = {
  modalTitle: "Aperçu avant impression",
  boutonFermer: "Fermer",
  skeletonTitre: "Préparation de l'aperçu…",
  skeletonSousTitre: "Mise en page et génération des visuels",
  banniereInvalidation: "L'aperçu ne reflète plus le contenu actuel du formulaire.",
  boutonRegenerer: "Mettre à jour l'aperçu",
  erreurGeneration: "La génération a échoué",
  boutonReessayer: "Réessayer",
  boutonTelechargerPdf: "Télécharger le PDF",
  indicateurPage: (n: number, total: number) => `Page ${n} sur ${total}`,
  altImage: (n: number, total: number, nomFeuillet: string) =>
    nomFeuillet ? `Page ${n} sur ${total} — ${nomFeuillet}` : `Page ${n} sur ${total}`,
} as const;

/** Labels affichés sur les onglets feuillets du carrousel. */
export const FEUILLET_LABELS_COPY = {
  "dossier-documentaire": "Dossier documentaire",
  questionnaire: "Questionnaire",
  "cahier-reponses": "Cahier de réponses",
} as const;
