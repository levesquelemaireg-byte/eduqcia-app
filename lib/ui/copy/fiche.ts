/** Copy UI — fiche tâche (vue détaillée, rail, barre d'actions, modale). Source de vérité : docs/UI-COPY.md. */

/** Titre de section — 0 ou 1 document affiché */
export const FICHE_SECTION_TITLE_DOCUMENT = "Document";

/** Titre de section — 2 documents ou plus */
export const FICHE_SECTION_TITLE_DOCUMENTS = "Documents";

/** Pluriel dynamique : liste vide ou un seul item → singulier. */
export function ficheDocumentsSectionTitle(documentCount: number): string {
  return documentCount <= 1 ? FICHE_SECTION_TITLE_DOCUMENT : FICHE_SECTION_TITLE_DOCUMENTS;
}

/** Titre de section — guidage (vue détaillée tâche) */
export const FICHE_SECTION_TITLE_GUIDAGE = "Guidage";

/** Titre de section — production attendue / corrigé (vue détaillée tâche) */
export const FICHE_SECTION_TITLE_PRODUCTION_ATTENDUE = "Production attendue";

/** Titre de section — outil d'évaluation (vue détaillée tâche) */
export const FICHE_SECTION_TITLE_GRILLE = "Outil d\u2019évaluation";

/* ─── Rail de la vue détaillée tâche ─────────────────────────────── */

/** Préfixe date de création dans le rail. */
export const FICHE_RAIL_DATE_CREATION = "Créée le";
/** Préfixe date de mise à jour dans le rail. */
export const FICHE_RAIL_DATE_MAJ = "Mise à jour le";
/** Badge statut publiée. */
export const FICHE_RAIL_STATUT_PUBLIEE = "Publiée";
/** Badge statut brouillon. */
export const FICHE_RAIL_STATUT_BROUILLON = "Brouillon";

/* ─── Barre d'actions de la vue détaillée tâche ──────────────────── */

/** Bouton retour vers la banque. */
export const FICHE_BARRE_RETOUR = "Banque";
/** Bouton primaire — ajouter à une épreuve. */
export const FICHE_BARRE_AJOUTER_EPREUVE = "Ajouter à une épreuve";
/** Bouton épingler (title / aria-label). */
export const FICHE_BARRE_EPINGLER = "Épingler";
/** Bouton modifier (auteur). */
export const FICHE_BARRE_MODIFIER = "Modifier";
/** Item kebab — partager (copier le lien). */
export const FICHE_BARRE_PARTAGER = "Partager";
/** Item kebab — exporter en PDF. */
export const FICHE_BARRE_EXPORTER_PDF = "Exporter en PDF";
/** Item kebab — supprimer (auteur). */
export const FICHE_BARRE_SUPPRIMER = "Supprimer";
/** Toast générique pour les features hors scope v1. */
export const TOAST_FICHE_FONCTIONNALITE_A_VENIR = "Fonctionnalité à venir";
/** Toast après copie du lien de partage. */
export const TOAST_FICHE_LIEN_COPIE = "Lien copié dans le presse-papiers";

/* ─── Modale fiche document embarquée ────────────────────────── */

/** Titre du header de la modale fiche document (`docs/specs/fiche-tache-lecture.md` §10). */
export const FICHE_MODALE_TITRE_DOCUMENT = "Document référencé";

/** Lien « Ouvrir en plein écran » dans le header de la modale. */
export const FICHE_MODALE_OUVRIR_PLEIN_ECRAN = "Ouvrir en plein écran";

/** État vide si le document n'est plus disponible (`docs/specs/fiche-tache-lecture.md` §12). */
export const FICHE_MODALE_DOCUMENT_INDISPONIBLE = "Ce document n'est plus disponible";

/* ─── Rail responsive ────────────────────────────────────────── */

/** Label de l'accordéon rail mobile (`docs/specs/fiche-tache-lecture.md` §11). */
export const FICHE_RAIL_ACCORDEON_LABEL = "Informations sur la tâche";

/** Bloc 2 — encadré paramètres verrouillés (`docs/UI-COPY.md` — Paramètres verrouillés) */
export const BLOC2_BLUEPRINT_LOCKED_TITLE = "Paramètres verrouillés";

export const BLOC2_BLUEPRINT_LOCKED_LBL_NIVEAU = "Niveau scolaire :";
export const BLOC2_BLUEPRINT_LOCKED_LBL_DISCIPLINE = "Discipline :";
export const BLOC2_BLUEPRINT_LOCKED_LBL_OI = "Opération intellectuelle :";
export const BLOC2_BLUEPRINT_LOCKED_LBL_COMPORTEMENT = "Comportement attendu :";
export const BLOC2_BLUEPRINT_LOCKED_LBL_NB_LIGNES = "Nombre de lignes :";
export const BLOC2_BLUEPRINT_LOCKED_LBL_DOCUMENTS = "Documents prévus :";

export const BLOC2_UNLOCK_CTA = "Modifier les paramètres";
export const BLOC2_UNLOCK_MODAL_TITLE = "Modifier les paramètres";
export const BLOC2_UNLOCK_MODAL_BODY =
  "Modifier le niveau, la discipline ou l'opération intellectuelle peut réinitialiser les étapes suivantes (consigne, documents, etc.). Souhaitez-vous déverrouiller ce bloc ?";
export const BLOC2_UNLOCK_MODAL_CANCEL = "Annuler";
export const BLOC2_UNLOCK_MODAL_CONFIRM = "Confirmer";

/** Modale barème (Bloc 2 + fiche) — titre ; `docs/UI-COPY.md` */
export const MODALE_OUTIL_EVALUATION_TITRE = "Outil d'évaluation";
