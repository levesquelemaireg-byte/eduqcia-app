/** Copy UI — perspectives OI3/OI6/OI7, moments, impression. Source de vérité : docs/UI-COPY.md. */

// ---------------------------------------------------------------------------
// Perspectives OI3 — docs/UI-COPY.md § Parcours perspectives
// ---------------------------------------------------------------------------

/** Bloc 3 — bouton barre TipTap (modèle souple 3.1, 3.2). */
export const PERSP_BLOC3_TEMPLATE_BUTTON = "Utiliser un modèle de consigne";
/** Bloc 3 — label radio type de perspectives (structuré 3.3/3.4, pur 3.5). */
export const PERSP_BLOC3_TYPE_LABEL = "Type de perspectives";
export const PERSP_BLOC3_TYPE_ACTEURS = "Acteurs de l'époque";
export const PERSP_BLOC3_TYPE_HISTORIENS = "Historiens et historiennes";
export const PERSP_BLOC3_CONTEXTE_LABEL = "Contexte";
export const PERSP_BLOC3_CONTEXTE_PLACEHOLDER = "Ex\u00a0: sur la lutte du Parti patriote en 1834";
export const PERSP_BLOC3_CONTEXTE_PLACEHOLDER_COMPARE = "Ex\u00a0: en 1775";
export const PERSP_BLOC3_CONTEXTE_HINT = "Décrivez brièvement l'enjeu historique et la période.";
export const PERSP_BLOC4_ACTEUR_LABEL = "Acteur ou historien";
export const PERSP_BLOC4_ACTEUR_PLACEHOLDER = "Ex\u00a0: François de Lévis, général français";
export const PERSP_BLOC4_EXTRAIT_LABEL = "Extrait";
export const PERSP_BLOC4_SOURCE_LABEL = "Source";
/** Bloc 5 — corrigé intrus (3.5). */
export const PERSP_BLOC5_INTRUS_LABEL =
  "Quel est l'acteur ou historien dont le point de vue est différent\u00a0?";
export const PERSP_BLOC5_DIFFERENCE_LABEL = "Explication de la différence";
export const PERSP_BLOC5_COMMUN_LABEL = "Point commun des deux autres";
/** Bloc 3 — choix structure groupé/séparé (v2, 3.3/3.4/3.5). */
export const PERSP_BLOC3_STRUCTURE_LABEL = "Structure documentaire";
export const PERSP_BLOC3_STRUCTURE_GROUPE = "Un seul document (perspectives groupées)";
export const PERSP_BLOC3_STRUCTURE_SEPARE = "Documents distincts";
/** Modale migration groupé ↔ séparé. */
export const PERSP_BLOC3_MIGRATION_TITLE = "Modifier la structure du document";
export const PERSP_BLOC3_MIGRATION_BODY =
  "Les contenus saisis (extraits, sources, acteurs) seront transférés dans la nouvelle structure.";
export const PERSP_BLOC3_MIGRATION_SUBTITLE_GROUPE =
  "Un seul document physique divisé en perspectives côte à côte.";
export const PERSP_BLOC3_MIGRATION_SUBTITLE_SEPARE =
  "Documents indépendants, réutilisables dans la banque.";
export const PERSP_BLOC3_MIGRATION_CONFIRM = "Confirmer";
export const PERSP_BLOC3_MIGRATION_CANCEL = "Annuler";
/** Bloc 4 — statuts accordéon perspectives. */
export const PERSP_BLOC4_STATUS_LOCKED = "Complétez la perspective précédente";
export const PERSP_BLOC4_STATUS_AVAILABLE = "À compléter";
export const PERSP_BLOC4_STATUS_OPEN = "En cours";
export const PERSP_BLOC4_STATUS_COMPLETE = "Complété";
/** Bloc 3 — modales info consigne par comportement perspectives. */
export const BLOC3_MODAL_CONSIGNE_33_TITLE = "Consigne — désaccord";
export const BLOC3_MODAL_CONSIGNE_33_BODY =
  "La consigne est générée automatiquement selon le gabarit ministériel. Elle présente le document, identifie le type de sources et pose la question de divergence entre les deux points de vue.\n\nIndiquez d'abord si les deux perspectives proviennent du même document physique ou de deux documents distincts — ce choix détermine la formulation de la consigne générée.\n\nLe contexte est obligatoire\u00a0: saisissez une courte description qui complète naturellement « deux points de vue d'acteurs… » (ex\u00a0: « en 1775 », « extraits de pétitions adressées aux autorités britanniques »). Il s'insère automatiquement dans la consigne générée.";
export const BLOC3_MODAL_CONSIGNE_34_TITLE = "Consigne — accord";
export const BLOC3_MODAL_CONSIGNE_34_BODY =
  "La consigne est générée automatiquement selon le gabarit ministériel. Elle présente le document, identifie le type de sources et pose la question de convergence entre les deux points de vue.\n\nIndiquez d'abord si les deux perspectives proviennent du même document physique ou de deux documents distincts — ce choix détermine la formulation de la consigne générée.\n\nLe contexte est obligatoire\u00a0: saisissez une courte description qui complète naturellement « deux points de vue d'acteurs… » (ex\u00a0: « en 1775 », « extraits de pétitions adressées aux autorités britanniques »). Il s'insère automatiquement dans la consigne générée.";
export const BLOC3_MODAL_CONSIGNE_35_TITLE = "Consigne — trois points de vue";
export const BLOC3_MODAL_CONSIGNE_35_BODY =
  "La consigne est entièrement définie par le ministère pour ce comportement — elle ne peut pas être modifiée. Ce gabarit standardisé demande à l'élève d'identifier lequel des trois points de vue se distingue des deux autres, puis de justifier sa réponse par comparaison.\n\nVotre seule saisie ici est le contexte\u00a0: décrivez l'enjeu historique et la période concernée (ex\u00a0: « concernant la crise agricole au Bas-Canada au 19e siècle »). Ce contexte s'insère automatiquement dans la formule pour ancrer la question dans votre situation d'apprentissage.\n\nÀ l'étape suivante, vous saisirez les trois perspectives — regroupées dans un seul document ou réparties en documents distincts selon votre choix — chacune associée à son acteur ou historien, son extrait et sa source.";
/** Bloc 3 — OI6·6.3 template pur (enjeu). */
export const BLOC3_OI6_ENJEU_LABEL = "Réalité historique";
export const BLOC3_OI6_ENJEU_PLACEHOLDER = "Ex\u00a0: le mode de vie des Premières Nations";
export const BLOC3_OI6_ENJEU_HINT =
  "Décrivez la réalité historique dont l'élève devra évaluer le changement ou la continuité.";
export const BLOC3_MODAL_CONSIGNE_63_TITLE = "Consigne — changement ou continuité";
export const BLOC3_MODAL_CONSIGNE_63_BODY =
  "La consigne est entièrement définie par le ministère pour ce comportement — elle ne peut pas être modifiée. Ce gabarit demande à l'élève de déterminer si la réalité historique présentée constitue un changement ou une continuité, de justifier sa réponse avec des faits précis et d'indiquer un repère de temps.\n\nVotre seule saisie ici est la réalité historique concernée (ex\u00a0: « le mode de vie des Premières Nations »). Elle s'insère automatiquement dans la formule ministérielle.\n\nÀ l'étape suivante, vous saisirez les deux états de cette réalité — avant et après — pour que l'élève puisse les comparer.";
/** Bloc 3 — OI7·7.1 template pur (causalité). */
export const BLOC3_OI7_ENJEU_GLOBAL_LABEL = "Réalité historique";
export const BLOC3_OI7_ENJEU_GLOBAL_PLACEHOLDER =
  "La réalité historique que l'élève devra expliquer";
export const BLOC3_OI7_ENJEU_GLOBAL_HINT =
  "Formulez une réalité qui suit naturellement « Expliquez comment ».";
export const BLOC3_OI7_ELEMENT_LABEL = "Élément";
export const BLOC3_OI7_ELEMENT_PLACEHOLDER_1 = "Premier élément à préciser et à lier";
export const BLOC3_OI7_ELEMENT_PLACEHOLDER_2 = "Deuxième élément à préciser et à lier";
export const BLOC3_OI7_ELEMENT_PLACEHOLDER_3 = "Troisième élément à préciser et à lier";
export const BLOC3_MODAL_CONSIGNE_71_TITLE = "Consigne — liens de causalité";
export const BLOC3_MODAL_CONSIGNE_71_BODY =
  "La consigne est entièrement définie par le ministère pour ce comportement — elle ne peut pas être modifiée. Ce gabarit demande à l'élève d'expliquer comment trois éléments historiques s'enchaînent et se causent mutuellement.\n\nSaisissez la réalité historique et les trois éléments à lier causalement. Ils s'insèrent automatiquement dans la formule ministérielle.\n\nChacun des trois documents saisis à l'étape suivante doit fournir la matière nécessaire pour l'un des trois éléments.";
/** Bloc 3 — gabarit / consigne libre (OI7). */
export const BLOC3_GABARIT_LABEL = "Gabarit de consigne";
export const BLOC3_CONSIGNE_LIBRE_LABEL = "Consigne libre";
export const BLOC3_REDIGER_LIBREMENT = "Rédiger librement";
export const BLOC3_REVENIR_GABARIT = "Revenir au gabarit";
export const BLOC3_COMPOSANTES_LABEL = "Composantes de la consigne";
export const BLOC3_COMPOSANTES_DISABLED = "Composantes de la consigne — désactivées";
export const BLOC3_BADGE_GABARIT = "Gabarit recommandé";
export const BLOC4_MOMENTS_STRUCTURE_GROUPE = "Un seul document (objets comparés groupés)";
export const BLOC4_MOMENTS_STRUCTURE_SEPARE = "Documents distincts";
/** Bloc 4 — Moments (OI6). */
export const BLOC4_MOMENTS_TITRE_LABEL = "Titre";
export const BLOC4_MOMENTS_TITRE_PLACEHOLDER = "Ex\u00a0: Structure politique après Utrecht";
export const BLOC4_MOMENTS_TITRE_HINT =
  "Donnez un titre pour orienter l'élève — avec ou sans repère temporel.";
export const BLOC4_MOMENTS_ETAT_A = "État A";
export const BLOC4_MOMENTS_ETAT_B = "État B";
export const PERSP_BLOC4_TITRE_LABEL = "Titre";
export const PERSP_BLOC4_TITRE_PLACEHOLDER = "Ex\u00a0: La capitulation de Montréal, 1760";

/** Impression tâche seule — titre modale aperçu (`docs/UI-COPY.md`). */
export const IMPRESSION_TACHE_SEULE_MODAL_TITLE = "Aperçu de la tâche";

/** Impression document seul — titre modale aperçu (`docs/UI-COPY.md`). */
export const IMPRESSION_DOCUMENT_SEUL_MODAL_TITLE = "Aperçu du document";

/** Impression document seul — erreur débordement page (`docs/UI-COPY.md`). */
export const IMPRESSION_DOCUMENT_DEBORDEMENT =
  "Le contenu dépasse la page — réduisez la taille du document.";

/** Grille d'évaluation — `outil_evaluation` sans entrée dans `grilles-evaluation.json` (`docs/UI-COPY.md`). */
export function copyGrilleAbsentePourOutil(outilId: string): string {
  return `Grille non disponible pour l'outil ${outilId}.`;
}
