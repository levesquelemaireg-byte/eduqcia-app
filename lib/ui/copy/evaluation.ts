/** Copy UI — composition d'épreuves, pages erreur. Source de vérité : docs/UI-COPY.md. */

/** Composition d'épreuve — `docs/UI-COPY.md` (Page création / édition) */
export const EVAL_COMP_PAGE_TITLE_NEW = "Créer une épreuve";
export const EVAL_COMP_PAGE_TITLE_EDIT = "Modifier l'épreuve";
export const EVAL_LIST_LINK_EDIT = "Modifier";
export const EVAL_COMP_TITLE_LABEL = "Titre de l'épreuve";
export const EVAL_COMP_PICKER_TAB_BANK = "Banque";
export const EVAL_COMP_PICKER_TAB_MINE = "Mes tâches";
export const EVAL_COMP_CART_TITLE = "Composition de l'épreuve";
export function evalCompCartCount(n: number): string {
  if (n === 0) return "Aucune tâche";
  if (n === 1) return "1 tâche";
  return `${n} tâches`;
}
export const EVAL_COMP_CART_EMPTY =
  "Aucune tâche ajoutée. Parcourez la banque et cliquez sur « Ajouter » pour composer votre épreuve.";
export const EVAL_COMP_SAVE_DRAFT = "Enregistrer le brouillon";
/** Ouvre `/apercu/[token]` (nouvel onglet) après sauvegarde du brouillon — `docs/UI-COPY.md` */
export const EVAL_COMP_PREVIEW = "Aperçu";
export const EVAL_COMP_PUBLISH = "Publier";
export const EVAL_COMP_ADD = "Ajouter";
export const EVAL_COMP_ALREADY_ADDED = "Déjà ajoutée";
export const EVAL_COMP_LOAD_MORE = "Charger plus";
export const EVAL_COMP_BADGE_BANK = "Banque";
export const EVAL_COMP_BADGE_MINE = "Ma tâche";
export const EVAL_COMP_QUESTION_PREFIX = "Question";
export const EVAL_COMP_DOCS_PREFIX = "Documents";
export const EVAL_COMP_MOVE_UP_LABEL = "Monter";
export const EVAL_COMP_MOVE_DOWN_LABEL = "Descendre";
export const EVAL_COMP_REMOVE_LABEL = "Retirer";

export const TOAST_EVAL_SAVE_DRAFT_OK = "Brouillon enregistré.";
export const TOAST_EVAL_PUBLISH_OK = "Épreuve publiée.";
export const TOAST_EVAL_AUTH = "Connectez-vous pour enregistrer.";
export const TOAST_EVAL_TITRE_REQUIS = "Indiquez un titre d'épreuve.";
export const TOAST_EVAL_PUBLISH_EMPTY = "Ajoutez au moins une tâche avant de publier.";
export const TOAST_EVAL_TAE_INELIGIBLE = "Une ou plusieurs tâches ne peuvent pas être ajoutées.";
export const TOAST_EVAL_NOT_FOUND = "Épreuve introuvable.";
export const TOAST_EVAL_RPC_MISSING =
  "Enregistrement impossible : la fonction SQL save_evaluation_composition est absente sur Supabase. Appliquez la migration puis réessayez.";
export const TOAST_EVAL_GENERIC = "Enregistrement impossible. Réessayez.";

/** Page impression épreuve — lien vers composition (`docs/UI-COPY.md`) */
export const EVAL_PRINT_BACK_TO_EDIT = "Retour à l'édition";

/** Coquille connectée — `not-found` sous `(app)` (`docs/UI-COPY.md`) */
export const PAGE_APP_NOT_FOUND_TITLE = "Page introuvable";
export const PAGE_APP_NOT_FOUND_DESCRIPTION = "Cette page n'existe pas ou vous n'y avez pas accès.";
export const PAGE_APP_NOT_FOUND_CTA_DASHBOARD = "Tableau de bord";
export const PAGE_APP_NOT_FOUND_CTA_EVALUATIONS = "Mes épreuves";

/** Coquille connectée — `error` sous `(app)` (`docs/UI-COPY.md`) */
export const PAGE_APP_ERROR_TITLE = "Une erreur est survenue";
export const PAGE_APP_ERROR_DESCRIPTION =
  "Quelque chose ne s'est pas déroulé comme prévu. Réessayez ou revenez au tableau de bord.";
export const PAGE_APP_ERROR_CTA_RETRY = "Réessayer";
export const PAGE_APP_ERROR_CTA_DASHBOARD = "Tableau de bord";
