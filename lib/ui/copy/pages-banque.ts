/** Copy UI — pages Mes tâches/documents/épreuves, banque collaborative. Source de vérité : docs/UI-COPY.md. */

import { DOCUMENT_MODULE_TYPE_TEXT, DOCUMENT_MODULE_TYPE_IMAGE } from "./document";

/** Page liste `/questions` — titre, CTA, état vide (`docs/UI-COPY.md` — Mes tâches) */
export const PAGE_LISTE_MES_DOCUMENTS_TITLE = "Mes documents";
export const PAGE_LISTE_MES_DOCUMENTS_SUBTITLE =
  "Documents historiques que vous avez créés (brouillons et publiés).";
export const CTA_CREER_UN_DOCUMENT = "Créer un document";
export const LISTE_DOCUMENTS_VIDE = "Aucun document pour le moment.";

export const PAGE_LISTE_MES_TACHES_TITLE = "Mes tâches";
export const PAGE_LISTE_MES_TACHES_SUBTITLE =
  "Tâches que vous avez créées (brouillons et publiées).";
export const CTA_CREER_UNE_TACHE = "Créer une tâche";
export const LISTE_TACHES_VIDE_CATEGORIE = "Aucune tâche dans cette catégorie.";

/** Toasts — après publication réussie (`docs/UI-COPY.md` — Mes tâches / Créer) */
export const TOAST_TACHE_PUBLIEE_SUCCES = "Tâche publiée avec succès";

/** Toast — après enregistrement d'une TAÉ modifiée (`docs/UI-COPY.md` — Toasts) */
export const TOAST_TACHE_MAJ_SUCCES = "Modifications enregistrées avec succès";

/**
 * Toast — mise à jour refusée (TAÉ dans une épreuve) (`docs/UI-COPY.md` — Toasts).
 */
export const TOAST_PUBLICATION_TACHE_LOCKED_EVALUATION =
  "Impossible d'enregistrer les modifications : la tâche figure dans une ou plusieurs épreuves. Retirez-la des épreuves concernées, puis réessayez.";

/** CTA footer wizard — création (`docs/UI-COPY.md` — Boutons wizard) */
export const WIZARD_PUBLISH_CTA = "Publier";

/** CTA footer wizard — édition (`docs/UI-COPY.md` — Boutons wizard) */
export const WIZARD_EDIT_SAVE_CTA = "Enregistrer les modifications";

/**
 * Indicateur permanent de sauvegarde brouillon dans le footer wizard.
 * Adresse l'écart E3.1.2 de l'audit du 8 avril 2026.
 */
export const WIZARD_DRAFT_INDICATOR_SAVING = "Sauvegarde…";
export const WIZARD_DRAFT_INDICATOR_SAVED = (seconds: number): string => {
  if (seconds < 5) return "Brouillon · Sauvegardé à l'instant";
  if (seconds < 60) return `Brouillon · Sauvegardé il y a ${seconds} sec.`;
  const minutes = Math.floor(seconds / 60);
  if (minutes === 1) return "Brouillon · Sauvegardé il y a 1 min";
  return `Brouillon · Sauvegardé il y a ${minutes} min`;
};

/** Page `/questions/new` — sous-titre sous le h1 (`docs/UI-COPY.md`) */
export const PAGE_CREER_UNE_TACHE_SUBTITLE =
  "Complétez les étapes pour créer une tâche complète. L'aperçu se met à jour à chaque modification.";

/** Page `/questions/[id]/edit` (`docs/UI-COPY.md` — Édition guidée) */
export const PAGE_MODIFIER_UNE_TACHE_TITLE = "Modifier une tâche";
export const PAGE_MODIFIER_UNE_TACHE_SUBTITLE =
  "Reprenez les étapes pour mettre à jour votre tâche. L'aperçu se met à jour à chaque modification.";

/** Page « Mes tâches » — modale suppression (`docs/UI-COPY.md`) */
export const MY_QUESTIONS_DELETE_MODAL_TITLE = "Supprimer cette tâche ?";
export const MY_QUESTIONS_DELETE_MODAL_BODY =
  "Cette opération est irréversible. La tâche sera définitivement retirée de votre banque de données.";
export const MY_QUESTIONS_DELETE_MODAL_CANCEL = "Annuler";
export const MY_QUESTIONS_DELETE_MODAL_CONFIRM = "Supprimer";

/** Ligne liste — brouillon `tae_wizard_drafts` sans consigne saisie (`docs/UI-COPY.md` — Mes tâches) */
export const MY_QUESTIONS_WIZARD_PREVIEW_FALLBACK = "Création en cours — reprendre le formulaire";

export const MY_QUESTIONS_WIZARD_DELETE_MODAL_TITLE = "Supprimer ce brouillon ?";
export const MY_QUESTIONS_WIZARD_DELETE_MODAL_BODY =
  "Le contenu enregistré du formulaire de création sera effacé. Cette opération est irréversible.";

export const MY_QUESTIONS_DELETE_BLOCKED_IN_EVALUATION =
  "Impossible de supprimer cette tâche : elle figure dans une ou plusieurs épreuves. Retirez-la des épreuves concernées, puis réessayez.";

/** Page `/questions/[id]/edit` — modale confirmation modification majeure (`docs/UI-COPY.md` — Édition guidée) */
export const EDIT_MAJOR_VERSION_MODAL_TITLE = "Modification importante détectée";
export const EDIT_MAJOR_VERSION_MODAL_BODY_P1 =
  "Vous avez modifié des éléments structurants de cette tâche (opération intellectuelle, documents, compétence disciplinaire ou connaissances relatives). Cette modification créera une nouvelle version de la tâche et archivera les votes reçus jusqu'ici.";
export const EDIT_MAJOR_VERSION_MODAL_BODY_P2 =
  "Les enseignants qui utilisent cette tâche dans une épreuve recevront une notification.";
export const EDIT_MAJOR_VERSION_MODAL_CONFIRM = "Enregistrer la nouvelle version";
export const EDIT_MAJOR_VERSION_MODAL_CANCEL = "Annuler";

export const TOAST_MES_QUESTIONS_DELETED = "La tâche a été supprimée.";
export const TOAST_MES_QUESTIONS_DELETE_FAILED = "Impossible de supprimer la tâche. Réessayez.";

export const TOAST_MES_QUESTIONS_WIZARD_DRAFT_DELETED = "Le brouillon a été supprimé.";
export const TOAST_MES_QUESTIONS_WIZARD_DRAFT_DELETE_FAILED =
  "Impossible de supprimer le brouillon. Réessayez.";

/** Page `/documents` — modale suppression (`docs/UI-COPY.md` — Mes documents) */
export const MY_DOCUMENTS_DELETE_MODAL_TITLE = "Supprimer ce document ?";
export const MY_DOCUMENTS_DELETE_MODAL_BODY =
  "Cette opération est irréversible. Le document sera définitivement supprimé.";
export const MY_DOCUMENTS_DELETE_MODAL_CANCEL = "Annuler";
export const MY_DOCUMENTS_DELETE_MODAL_CONFIRM = "Supprimer";
export const MY_DOCUMENTS_DELETE_BLOCKED_IN_TAE =
  "Impossible de supprimer ce document : il est utilisé dans une ou plusieurs tâches. Retirez-le des tâches concernées, puis réessayez.";
export const TOAST_MES_DOCUMENTS_DELETED = "Le document a été supprimé.";
export const TOAST_MES_DOCUMENTS_DELETE_FAILED = "Impossible de supprimer le document. Réessayez.";

/** Page `/evaluations` — modale suppression (`docs/UI-COPY.md` — Mes épreuves) */
export const MY_EVALUATIONS_DELETE_MODAL_TITLE = "Supprimer cette épreuve ?";
export const MY_EVALUATIONS_DELETE_MODAL_BODY =
  "Cette opération est irréversible. L'épreuve et ses associations seront définitivement supprimées.";
export const MY_EVALUATIONS_DELETE_MODAL_CANCEL = "Annuler";
export const MY_EVALUATIONS_DELETE_MODAL_CONFIRM = "Supprimer";
export const TOAST_MES_EVALUATIONS_DELETED = "L'épreuve a été supprimée.";
export const TOAST_MES_EVALUATIONS_DELETE_FAILED = "Impossible de supprimer l'épreuve. Réessayez.";

/** Page `/bank` — `docs/UI-COPY.md` — Banque collaborative */
export const PAGE_BANK_TITLE = "Banque collaborative";
export const PAGE_BANK_TAB_TASKS = "Tâches";
export const PAGE_BANK_TAB_DOCUMENTS = "Documents historiques";
export const PAGE_BANK_TAB_EVALUATIONS = "Épreuves";
export const PAGE_BANK_TASKS_SUBTITLE = "Parcourez les tâches publiées par d'autres enseignants.";
export const PAGE_BANK_EVALUATIONS_SUBTITLE =
  "Parcourez les épreuves publiées par d'autres enseignants.";
export const PAGE_BANK_EVALUATIONS_CTA_INTRO =
  "Pour composer une épreuve, utilisez l'entrée dédiée.";
export const PAGE_BANK_EVALUATIONS_CTA_LINK = "Créer une épreuve";
/** Liste banque documents — `docs/UI-COPY.md` — Banque (module) */
export const PAGE_BANK_DOCUMENTS_EMPTY =
  "Aucun document ne correspond aux filtres. Ajustez la recherche ou créez un document.";
export const PAGE_BANK_DOCUMENTS_SEARCH_LABEL = "Recherche par titre ou source";
export const PAGE_BANK_DOCUMENTS_FILTER_DISCIPLINE = "Discipline";
export const PAGE_BANK_DOCUMENTS_FILTER_NIVEAU = "Niveau scolaire";
export const PAGE_BANK_DOCUMENTS_FILTER_TYPE = "Type de document";
export const PAGE_BANK_DOCUMENTS_FILTER_TYPE_ALL = "Tous";
export const PAGE_BANK_DOCUMENTS_FILTER_TYPE_TEXT = DOCUMENT_MODULE_TYPE_TEXT;
export const PAGE_BANK_DOCUMENTS_FILTER_TYPE_IMAGE = DOCUMENT_MODULE_TYPE_IMAGE;
export const PAGE_BANK_DOCUMENTS_FILTER_ICONO_ALL = "Toutes";
export const BANK_DOCUMENT_FILTER_SUBMIT = "Filtrer";
export const BANK_DOCUMENT_FILTER_RESET = "Réinitialiser";
export const BANK_DOCUMENT_LINK_FICHE = "Voir la fiche";

/** Badges structure document (thumbnail banque). */
export const DOCUMENT_STRUCTURE_BADGE_SIMPLE = "Simple";
export const DOCUMENT_STRUCTURE_BADGE_PERSPECTIVES_2 = "2 perspectives";
export const DOCUMENT_STRUCTURE_BADGE_PERSPECTIVES_3 = "3 perspectives";
export const DOCUMENT_STRUCTURE_BADGE_DEUX_TEMPS = "Deux temps";

/** Label structure pour le badge thumbnail. */
export function documentStructureBadgeLabel(
  structure: "simple" | "perspectives" | "deux_temps",
  elementCount: number,
): string {
  if (structure === "simple") return DOCUMENT_STRUCTURE_BADGE_SIMPLE;
  if (structure === "perspectives") {
    return elementCount === 3
      ? DOCUMENT_STRUCTURE_BADGE_PERSPECTIVES_3
      : DOCUMENT_STRUCTURE_BADGE_PERSPECTIVES_2;
  }
  return DOCUMENT_STRUCTURE_BADGE_DEUX_TEMPS;
}
export const BANK_DOCUMENT_PICKER_LOADING = "Chargement des documents…";
export const BANK_DOCUMENT_PICKER_EMPTY =
  "Aucun document publié dans la banque pour le moment. Créez-en un depuis le module dédié.";
/** Onglet Documents — renvoi module ; copy registre : [UI-COPY.md](../../docs/UI-COPY.md) */
export const PAGE_BANK_DOCUMENTS_CTA_INTRO =
  "Pour créer un document historique structuré, utilisez l'entrée dédiée.";
export const PAGE_BANK_DOCUMENTS_CTA_LINK = "Créer un document";

/** Fiche document — aligné registre « Utilisé dans X tâches » (`docs/UI-COPY.md` — Module) ; compteur = TAÉ publiées uniquement (`docs/FEATURES.md` §5.4). */
export function copyDocumentPublishedTacheUsageCount(count: number): string {
  if (count === 0) return "Utilisé dans : aucune tâche publiée";
  if (count === 1) return "Utilisé dans : 1 tâche";
  return `Utilisé dans : ${count} tâches`;
}
export const PAGE_BANK_EVALUATIONS_EMPTY =
  "Aucune épreuve ne correspond aux critères. Ajustez la recherche.";
export const PAGE_BANK_EMPTY = "Aucun résultat";
export const BANK_TASK_FILTER_OI = "Opération intellectuelle";
export const BANK_TASK_FILTER_COMPORTEMENT = "Comportement attendu";
export const BANK_TASK_FILTER_COMPORTEMENT_HINT =
  "Disponible après la sélection de l'opération intellectuelle.";
export const BANK_TASK_FILTER_NIVEAU = "Niveau scolaire";
export const BANK_TASK_FILTER_DISCIPLINE = "Discipline";
/** Filtre sur `tache.cd_id` (= clé d'une ligne du référentiel Miller, étape 5 du wizard). */
export const BANK_TASK_FILTER_CD = "Compétence disciplinaire";
export const BANK_TASK_FILTER_CD_HINT =
  "Optionnel. Numéro technique du critère dans le référentiel (celui enregistré sur la tâche). Laissez vide si vous ne le connaissez pas — utilisez plutôt le niveau scolaire et la discipline.";
export const BANK_TASK_FILTER_CONNAISSANCES =
  "Connaissances relatives (identifiants entiers du référentiel, séparés par des virgules)";
export const BANK_TASK_FILTER_SEARCH = "Recherche dans la consigne (texte sans mise en forme)";
export const BANK_TASK_FILTER_SORT = "Tri";
export const BANK_TASK_SORT_RECENT = "Plus récentes";
export const BANK_TASK_SORT_POPULAR = "Plus populaires";
export const BANK_TASK_FILTER_SUBMIT = "Filtrer";
export const BANK_TASK_FILTER_RESET = "Réinitialiser";
export const BANK_TASK_LOAD_MORE = "Charger plus";
export const BANK_EVAL_SEARCH_LABEL = "Recherche par titre";
/** Banque — épreuve publiée par un autre enseignant : pas d'édition depuis cet écran. */
export const BANK_EVAL_NO_EDIT_OTHER = "Réservé à l'auteur";

/** Banque — onglet Épreuves ; compteur `evaluation_tache`. */
export function copyBankEvaluationTaskCount(count: number): string {
  if (count === 0) {
    return "Aucune tâche dans cette épreuve";
  }
  if (count === 1) return "1 tâche";
  return `${count} tâches`;
}

export const BANK_TASK_LINK_VOIR = "Voir";
/** Liste banque tâches — pastille d'état publication (`docs/UI-COPY.md` — Banque). */
export const BANK_TASK_LIST_BADGE_PUBLISHED = "Publié";
export const BANK_TASK_PUBLISHED_ON = "Publié le";
export const BANK_TASK_BY = "Par";

/** Banque — ajouter une tâche publiée à une épreuve brouillon */
export const BANK_TASK_ADD_TO_EVALUATION = "Ajouter à une épreuve";
export const EVAL_BANK_MODAL_TITLE = "Choisir une épreuve brouillon";
export const EVAL_BANK_MODAL_EMPTY =
  "Aucune épreuve brouillon. Créez d'abord une épreuve depuis Mes épreuves.";
export const EVAL_BANK_MODAL_CANCEL = "Annuler";
export const EVAL_BANK_MODAL_GO = "Continuer";
