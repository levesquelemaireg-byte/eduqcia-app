/** Copy UI — wizard TAÉ, stepper, blocs 1-7, brouillons. Source de vérité : docs/UI-COPY.md. */

/** Page « Créer une TAÉ » — Toasts — erreur sauvegarde brouillon (`docs/UI-COPY.md` — Toasts) */
export const TOAST_DRAFT_SAVE_FAILED = "Impossible d'enregistrer le brouillon. Réessayez.";

/** Bannières reprise brouillon — `docs/UI-COPY.md` (Créer une TAÉ) */
/** Brouillon serveur / session — format antérieur sans `bloc1` (toast erreur, pas de reprise). */
export const TOAST_WIZARD_DRAFT_OBSOLETE =
  "Ce brouillon provient d'une version antérieure du formulaire et ne peut pas être repris. Reprenez la création de la tâche.";

export const WIZARD_BANNER_SERVER_TITLE = "Brouillon enregistré";
export const WIZARD_BANNER_SERVER_BODY =
  "Vous avez déjà une tâche en cours enregistrée sur le serveur. Vous pouvez la reprendre ou continuer un nouveau formulaire (le brouillon serveur reste disponible jusqu'à publication ou suppression).";

export const WIZARD_BANNER_LOCAL_TITLE = "Travail non enregistré en ligne";
export const WIZARD_BANNER_LOCAL_BODY =
  "Ce navigateur contient une reprise de formulaire qui n'a pas été enregistrée avec « Sauvegarder le brouillon ». Vous pouvez la reprendre ou l'ignorer.";

export const WIZARD_BANNER_RESUME = "Reprendre";
export const WIZARD_BANNER_DISMISS_SERVER = "Masquer pour cette visite";
export const WIZARD_BANNER_DISMISS_LOCAL = "Ignorer le brouillon local";

/** Wizard — Étape 2 — texte d'aide dans l'infobulle (ⓘ) du titre d'étape (`TacheForm` + `step-meta`). */
export const TACHE_BLUEPRINT_STEP_DESCRIPTION =
  "Définissez les paramètres pédagogiques requis : niveau scolaire, discipline, opération intellectuelle et comportement attendu. Le comportement attendu détermine l'outil d'évaluation, dont la grille de correction ministérielle. L'espace de production (lignes ou formats non rédactionnels) est fixé automatiquement selon le comportement.";

/** Wizard — Étape 2 — `aria-label` du bouton info à côté du titre */
export const TACHE_BLUEPRINT_STEP_INFO_BUTTON_ARIA = "Afficher l'aide sur cette étape";

/** Panneau d'aperçu wizard — navigation sommaire / aperçu imprimé. */
export const PREVIEW_PANEL_SUMMARY_LABEL = "Sommaire détaillé";
export const PREVIEW_PANEL_PRINT_LABEL = "Aperçu de l'imprimé";
export const PREVIEW_PANEL_SUMMARY_SHORT_LABEL = "Sommaire";
export const PREVIEW_PANEL_PRINT_SHORT_LABEL = "Imprimé";
export const PREVIEW_PANEL_PRINT_FORMATIF_LABEL = "Formatif";
export const PREVIEW_PANEL_PRINT_SOMMATIF_STANDARD_LABEL = "Sommatif standard";
export const PREVIEW_PANEL_PRINT_CORRIGE_LABEL = "Corrigé";
export const PREVIEW_PANEL_FEUILLET_DOSSIER_LABEL = "Dossier documentaire";
export const PREVIEW_PANEL_FEUILLET_QUESTIONNAIRE_LABEL = "Questionnaire";
export const PREVIEW_PANEL_MODE_ARIA = "Mode d'aperçu";
export const PREVIEW_PANEL_VARIANT_ARIA = "Variante d'aperçu imprimé";
export const PREVIEW_PANEL_FEUILLET_ARIA = "Feuillet d'aperçu imprimé";
export const PREVIEW_PANEL_OPTIONS_BUTTON_ARIA = "Afficher les options d'aperçu";
export const PREVIEW_PANEL_OPTIONS_CLOSE_ARIA = "Fermer les options d'aperçu";
export const PREVIEW_PANEL_OPTIONS_TITLE = "Options";

/** Wizard TAÉ — étape 3 — Bloc 3 (consigne + guidage) — `step-meta.ts` */
export const BLOC3_TITRE = "Consigne et guidage complémentaire";
export const BLOC3_DESCRIPTION =
  "Rédigez la consigne destinée à l'élève et, si nécessaire, le guidage complémentaire pour l'élève.";

/** Wizard TAÉ — descriptions contextuelles par étape et comportement (StepHeader). */
export const STEP_DESCRIPTIONS: Record<number, Record<string, string>> = {
  2: {
    "1.1":
      "Complétez le gabarit de consigne. La structure est prédéfinie selon le parcours choisi.",
    "1.2":
      "Complétez le gabarit de consigne. La structure est prédéfinie selon le parcours choisi.",
    "1.3":
      "Complétez le gabarit de consigne. La structure est prédéfinie selon le parcours choisi.",
    default:
      "Rédigez la consigne de la tâche. L'appel documentaire (ex.\u00a0: « Consultez le document A. ») sera ajouté automatiquement au début.",
  },
};

/** Wizard TAÉ — étape 3 — accès refusé tant que le blueprint (étape 2) n'est pas verrouillé */
export const BLOC3_GATE_BLUEPRINT =
  "Complétez d'abord l'étape « Paramètres de la tâche » (étape 2) et passez à l'étape suivante pour définir la consigne et le guidage complémentaire.";

/**
 * Étape 3 — guidage complémentaire — mention discrète sous le champ qui rappelle
 * son comportement formatif/sommatif. Spec : task-creation-wizard.md §3.4 (absence A3.4.1).
 */
export const BLOC3_GUIDAGE_FORMATIF_SOMMATIF_HINT =
  "Ce guidage s'affichera en italique sous la consigne en mode formatif. Il sera masqué automatiquement en mode sommatif.";

/** Wizard TAÉ — étape 4 (documents) — parcours rédactionnel : étapes 2–3 requises */
export const BLOC4_GATE_WIZARD =
  "Complétez d'abord les étapes « Paramètres de la tâche » et « Consigne et guidage complémentaire » (étapes 2 et 3) pour accéder aux documents historiques.";

/** Wizard TAÉ — étape 6 (compétence disciplinaire) — prérequis étapes 2–5 */
export const BLOC5_CD_GATE_WIZARD =
  "Complétez d'abord les étapes « Paramètres de la tâche », « Consigne et guidage complémentaire », « Documents historiques » et « Corrigé et options » pour accéder à la compétence disciplinaire.";

/** Wizard TAÉ — étape 4 — Bloc 4 — documents historiques */
export const BLOC4_TITRE = "Documents historiques";
export const BLOC4_DESCRIPTION = "Associez les documents historiques pertinents.";

/** Wizard TAÉ — étape 5 — Bloc 5 — corrigé / options non rédactionnelles */
export const BLOC5_TITRE = "Corrigé et options";
export const BLOC5_DESCRIPTION = "Définissez le corrigé ou générez les options de réponse.";

/** Wizard TAÉ — étape 6 — Bloc 6 — compétence disciplinaire */
export const BLOC6_CD_TITRE = "Compétence disciplinaire";
export const BLOC6_CD_DESCRIPTION =
  "Sélectionnez la compétence, la composante et le critère dans le référentiel ministériel.";

/** Wizard TAÉ — étape 7 — Bloc 7 — aspects + connaissances */
export const BLOC7_TITRE = "Indexation";
export const BLOC7_DESCRIPTION =
  "Associez des aspects de société et des connaissances relatives à cette tâche.";

/** Bloc 5 — rédactionnel — corrigé (`Bloc5Redactionnel`) */
export const BLOC5_REDACTIONNEL_LABEL = "Production attendue";
export const BLOC5_REDACTIONNEL_HELP = `Décrivez ce que l'élève doit produire pour répondre correctement à la tâche. Cette information apparaît dans le corrigé destiné à l'enseignant, jamais sur la copie de l'élève.`;
export const BLOC5_REDACTIONNEL_PLACEHOLDER = `ex. L'élève doit identifier deux causes de la Rébellion des Patriotes et les mettre en relation avec le contexte politique de 1837.`;

/** Bloc 4 — bannières d'avertissement champs optionnels (titre textuel, source) */
export const BLOC4_WARNING_NO_TITLE =
  "Ce document n'a pas de titre. En mode formatif, le titre sera affiché pour guider l'élève. En mode sommatif, le document apparaîtra sans titre.";
export const BLOC4_WARNING_NO_SOURCE =
  "Ce document n'a pas de source bibliographique. Il apparaîtra sans indication de provenance.";

/** Bloc 5 — notes au correcteur (spec §3.6, écart E3.6.1 de l'audit du 8 avril 2026) */
export const BLOC5_NOTES_CORRECTEUR_LABEL = "Notes au correcteur";
export const BLOC5_NOTES_CORRECTEUR_HELP =
  "Nuances d'interprétation, cas particuliers à accepter, pièges fréquents à reconnaître. Ce texte n'apparaît pas sur la copie de l'élève.";

/** Bloc 5 — placeholders non rédactionnels */
export const BLOC5_NON_REDACTIONNEL_PLACEHOLDER_TITRE = "Génération des options";
export const BLOC5_NON_REDACTIONNEL_PLACEHOLDER_MESSAGE =
  "La génération automatique des options pour ce type de parcours sera disponible prochainement.";

/** Bloc 5 — états de readiness (parcours non rédactionnels) */
export const BLOC5_ATTENTE_DOCUMENTS = `Les options seront générables une fois que tous les documents auront une année valide.`;
export const BLOC5_PRET_A_GENERER =
  "Tous les documents sont prêts. Vous pouvez générer les options.";

/** Bloc 7 — champs (corps d'étape) */
export const BLOC7_ASPECTS_LABEL = "Aspects de société";
export const BLOC7_ASPECTS_HELP = `Sélectionnez les aspects de société mobilisés par cette tâche.`;
export const BLOC7_CONNAISSANCES_LABEL = "Connaissances relatives";
export const BLOC7_CONNAISSANCES_HELP = `Associez les connaissances du programme liées à cette tâche.`;
export const BLOC7_CONNAISSANCES_EMPTY = "Aucune connaissance sélectionnée.";

/** Wizard TAÉ — étape 7 — prérequis étapes 1–6 */
export const BLOC7_GATE =
  "Complétez d'abord les étapes « Paramètres de la tâche », « Consigne et guidage complémentaire », « Documents historiques », « Corrigé et options » et « Compétence disciplinaire » pour accéder à l'indexation.";

/** Wizard TAÉ — étape 7 — bouton vider les sélections Miller */
export const BLOC7_CONNAISSANCES_RESET = "Réinitialiser";

/** Navigation wizard — libellés boutons (stepper / pied de page) */
export const WIZARD_BTN_SUIVANT = "Suivant";
export const WIZARD_BTN_PRECEDENT = "Précédent";
export const WIZARD_BTN_PUBLIER = "Publier la tâche";
export const WIZARD_BTN_SAUVEGARDER = "Enregistrer le brouillon";
export const WIZARD_CONFIRM_QUITTER = `Vous avez des modifications non sauvegardées. Voulez-vous quitter sans enregistrer ?`;

/** Stepper — états */
export const STEPPER_BLOC_INCOMPLET = "Ce bloc est incomplet.";
export const STEPPER_BLOC_COMPLET = "Ce bloc est complété.";
export const STEPPER_BLOC_VERROUILLE = "Complétez les blocs précédents pour accéder à celui-ci.";

/** Page « Créer une TAÉ » — Bloc 2 — chargement référentiel */
export const BLOC2_LOADING_PARAMETERS = "Chargement des paramètres…";

/** Page « Créer une TAÉ » — Bloc 2 — erreur chargement `oi.json` */
export const BLOC2_ERROR_OI_FETCH =
  "Impossible de charger les opérations intellectuelles. Réessayez.";

/** Bloc 2 — discipline — aide sous champ (sélection manuelle) */
export const BLOC2_DISCIPLINE_HELP = "Choisissez la discipline associée au niveau sélectionné.";

/** Bloc 2 — discipline imposée (Sec 3 / 4) — libellé avec glyphe `settings` dans le JSX */
export const BLOC2_DISCIPLINE_AUTO_ASSIGNED = "Assignée automatiquement";

/** Bloc 2 — discipline — prérequis niveau non choisi */
export const BLOC2_DISCIPLINE_PREREQ_NIVEAU = "(Disponible après la sélection du niveau scolaire.)";

/** Bloc 2 — opération intellectuelle — texte d'aide sous le champ */
export const BLOC2_OI_FIELD_HELP =
  "Sélectionnez l'opération intellectuelle mobilisée dans la tâche.";

/** Bloc 2 — opération intellectuelle — prérequis discipline non choisie */
export const BLOC2_OI_PREREQ_DISCIPLINE = "(Disponible après la sélection de la discipline.)";

/** Bloc 2 — comportement attendu — texte d'aide sous le champ */
export const BLOC2_COMPORTEMENT_FIELD_HELP =
  "Le comportement attendu sélectionné détermine l'outil d'évaluation, c'est-à-dire la grille de correction ministérielle affichée sous la tâche.";

/** Bloc 2 — comportement — prérequis OI non choisie */
export const BLOC2_COMPORTEMENT_PREREQ_OI =
  "(Disponible après la sélection de l'opération intellectuelle.)";

/** Bloc 2 — CTA grille de correction */
export const BLOC2_VOIR_GRILLE_CTA = "Voir la grille de correction";

/** Bloc 2 — section espace de production (lecture seule) */
export const BLOC2_ESPACE_PRODUCTION_SECTION_LABEL = "Espace de production";

/** Bloc 2 — espace de production — rédactionnel — avant le nombre (gras dans le JSX) */
export const BLOC2_ESPACE_PRODUCTION_REDACTION_BEFORE =
  "Pour ce comportement, l'espace de production est constitué de ";

/** Bloc 2 — espace de production — rédactionnel — après le nombre */
export const BLOC2_ESPACE_PRODUCTION_REDACTION_AFTER = " lignes pour la réponse écrite.";

/** Bloc 2 — espace de production — non rédactionnel */
export const BLOC2_ESPACE_PRODUCTION_COPY_NON_REDACTION =
  "Pour ce comportement, l'espace de production est constitué de cases à remplir, de lettres (A, B, C ou D) ou d'un champ « Réponse : ».";

/** Bouton `info` à côté d'un label — `aria-label` (`docs/UI-COPY.md` — Étape 2, bouton info) */
export const ARIA_OPEN_FIELD_HELP = "Ouvrir l'aide sur ce champ";

/** Liste OI — entrée `coming_soon` (`docs/UI-COPY.md` — Étape 2, OI à venir) */
export const BLOC2_OI_COMING_SOON = "Bientôt disponible";

/** Modale aide — Opération intellectuelle — intro (liste dynamique des titres dans `oi.json` en complément) */
export const BLOC2_MODAL_OI_INTRO =
  "L'opération intellectuelle précise le type d'action cognitive demandée à l'élève. Les libellés ci-dessous reprennent les catégories du référentiel ministériel ; la liste déroulante reprend les entrées disponibles.";

/** Modale aide — Comportement attendu */
export const BLOC2_MODAL_COMPORTEMENT_INTRO =
  "Le comportement attendu décrit une compétence observable, évaluée à l'aide de la grille de correction ministérielle associée à l'opération intellectuelle. Il détermine le nombre de documents historiques et l'outil d'évaluation.";

/** Modale aide — Comportement attendu — invite si aucune sélection */
export const BLOC2_MODAL_COMPORTEMENT_PICK_FIRST =
  "Choisissez d'abord un comportement dans la liste pour voir un exemple d'énoncé.";

/** Modale aide — Espace de production (valeur lue dans `oi.json`, plus de saisie manuelle) */
export const BLOC2_MODAL_NB_LIGNES_BODY =
  "L'espace de production (nombre de lignes ou formats non rédactionnels) est défini automatiquement à partir du comportement attendu sélectionné, conformément aux données ministérielles.";

/** Blocs 5 / 6 / sommaire — discipline sans fichier JSON (ex. géographie) */
export const WIZARD_REFERENTIEL_CD_INDISPO =
  "Référentiel compétence disciplinaire non disponible pour cette discipline dans les données actuelles.";

export const WIZARD_REFERENTIEL_CONN_INDISPO =
  "Référentiel connaissances relatives non disponible pour cette discipline dans les données actuelles.";

/** Blocs 5 / 6 — erreur réseau ou fichier */
export const WIZARD_REFERENTIEL_LOAD_FAILED = "Chargement du référentiel impossible.";

/** Bloc 6 — aucune ligne après filtrage niveau */
export const WIZARD_CONNAISSANCES_EMPTY_FILTER =
  "Aucune entrée ne correspond au niveau et à la discipline sélectionnés.";

/** Étape 1 — Recherche collaborateurs (`docs/UI-COPY.md`) */
export const BLOC1_COLLAB_SEARCH_MIN_CHARS =
  "Saisissez au moins deux caractères pour lancer la recherche.";
export const BLOC1_COLLAB_SEARCH_EMPTY = "Aucun enseignant ne correspond à votre recherche.";
export const BLOC1_COLLAB_SEARCH_LOADING = "Recherche en cours…";
export const BLOC1_COLLAB_SEARCH_PICK_FROM_LIST =
  "Choisissez un collègue dans la liste des résultats.";
export const BLOC1_COLLAB_SEARCH_ALREADY_ADDED =
  "Cette personne figure déjà parmi les collaborateurs.";
