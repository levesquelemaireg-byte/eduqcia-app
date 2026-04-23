/**
 * Copy UI — parcours Section B (Schéma de caractérisation).
 *
 * Labels et tooltips textuellement intégrés depuis le glossaire de la spec :
 * Phase 3 — Composants fonctionnels Section B.
 * Aucun acronyme dans les textes (pas de CD1, OI, HEC, etc.).
 */

/* ─── Mise en contexte (préambule) ─────────────────────────────── */

export const SECTION_B_PREAMBULE_LABEL = "Mise en contexte";
export const SECTION_B_PREAMBULE_TOOLTIP =
  "Ce court texte introductif (2-3 phrases) réactive les connaissances antérieures de l'élève en situant la période, le territoire et les acteurs concernés. Il doit fournir suffisamment de repères pour orienter la lecture du dossier documentaire, sans toutefois révéler les éléments de réponse attendus dans les cases du schéma.";
export const SECTION_B_PREAMBULE_PLACEHOLDER = "En [année], [acteur ou événement clé]…";

/* ─── Consigne de caractérisation (chapeau) ───────────────────── */

export const SECTION_B_CONSIGNE_LABEL = "Consigne";
export const SECTION_B_CONSIGNE_TOOLTIP =
  "La commande de description que l'élève lira en caractères gras. Elle est générée automatiquement à partir de l'objet d'étude, de l'intervalle temporel et des deux aspects de société sélectionnés à l'étape précédente, conformément au format prescrit par le programme : Décrivez [objet] [période] sous ses aspects [A] et [B].";

export const SECTION_B_CHAPEAU_OBJET_LABEL = "Objet d'étude";
export const SECTION_B_CHAPEAU_OBJET_PLACEHOLDER = "ex. la société coloniale, le système politique";

export const SECTION_B_CHAPEAU_PERIODE_LABEL = "Période";
export const SECTION_B_CHAPEAU_PERIODE_PLACEHOLDER = "ex. entre 1791 et 1840";

export const SECTION_B_CHAPEAU_APERCU_LABEL = "Aperçu de la consigne";
export const SECTION_B_CHAPEAU_APERCU_PLACEHOLDER_OBJET = "[objet d'étude]";
export const SECTION_B_CHAPEAU_APERCU_PLACEHOLDER_PERIODE = "[période]";
export const SECTION_B_CHAPEAU_APERCU_PLACEHOLDER_ASPECT = "[aspect à choisir]";

/** Gabarit du chapeau — assemble l'aperçu lisible par l'élève. */
export function construireChapeauCaracterisation(
  objet: string,
  periode: string,
  aspectA: string | null,
  aspectB: string | null,
): string {
  const o = objet.trim() || SECTION_B_CHAPEAU_APERCU_PLACEHOLDER_OBJET;
  const p = periode.trim() || SECTION_B_CHAPEAU_APERCU_PLACEHOLDER_PERIODE;
  const a = aspectA ?? SECTION_B_CHAPEAU_APERCU_PLACEHOLDER_ASPECT;
  const b = aspectB ?? SECTION_B_CHAPEAU_APERCU_PLACEHOLDER_ASPECT;
  return `Décrivez ${o} ${p} sous ses aspects ${a.toLowerCase()} et ${b.toLowerCase()}.`;
}

/* ─── Démarche invariable ──────────────────────────────────────── */

export const SECTION_B_DEMARCHE_LABEL = "Instructions à l'élève";
export const SECTION_B_DEMARCHE_TOOLTIP =
  "Bloc méthodologique standardisé qui encadre la démarche d'analyse documentaire de l'élève : consulter le dossier, sélectionner les documents pertinents, puis remplir le schéma. Ce texte est conforme aux prescriptions ministérielles et n'est pas modifiable.";
export const SECTION_B_DEMARCHE_ETAPES: readonly string[] = [
  "Consultez les documents du dossier documentaire fourni.",
  "Sélectionnez les documents pertinents et écartez ceux qui ne correspondent pas à la consigne de caractérisation.",
  "Complétez chacune des cases du schéma à partir des documents retenus.",
] as const;

/* ─── Cases du schéma ──────────────────────────────────────────── */

export const SECTION_B_CASE_OBJET_LABEL = "Objet de la description";
export const SECTION_B_CASE_OBJET_TOOLTIP =
  "L'élève doit identifier la réalité sociale à l'étude en formulant une réponse complète incluant le sujet, le territoire et la période. Rédigez l'énoncé de guidage sous forme de consigne directive (Nommez, Indiquez, Identifiez) utilisant une périphrase qui décrit la nature de l'organisation ou de l'événement, sans nommer directement la réponse attendue. Cela oblige l'élève à effectuer une synthèse avant de répondre.";

export const SECTION_B_CASE_PIVOT_LABEL = "Élément central";
export const SECTION_B_CASE_PIVOT_TOOLTIP =
  "Concept structurant de l'aspect de société étudié : une institution, un document fondateur, un titre officiel, un mode d'organisation, un traité. C'est le pivot autour duquel s'articulent les éléments de précision. L'énoncé de guidage doit être formulé comme une consigne directive (Nommez, Indiquez) amenant l'élève à identifier ce concept à partir du dossier documentaire.";

export const SECTION_B_CASE_PRECISION_LABEL = "Élément de précision";
export const SECTION_B_CASE_PRECISION_TOOLTIP =
  "Fait observable qui caractérise l'élément central en répondant aux questions Comment ?, Qui ? ou Quoi ?. La réponse attendue doit être courte, factuelle et directement repérable dans au moins un document du dossier. L'énoncé de guidage prend la forme d'une consigne directive (Indiquez, Précisez, Nommez) orientant l'élève vers un détail concret. Chaque élément central est accompagné de deux éléments de précision.";

/* ─── Champs de case (guidage / réponse) ──────────────────────── */

export const SECTION_B_CHAMP_GUIDAGE_LABEL = "Énoncé de guidage";
export const SECTION_B_CHAMP_GUIDAGE_HINT =
  "Consigne directive lue par l'élève dans la case du schéma.";
export const SECTION_B_CHAMP_GUIDAGE_TOOLTIP =
  "Consigne directive que l'élève lira dans la case du schéma, formulée avec un verbe d'action à l'impératif (Nommez, Indiquez, Identifiez, Précisez). Privilégiez une périphrase qui décrit ce que l'élève doit trouver plutôt que de nommer directement la réponse. Cette technique, prescrite par les guides de correction ministériels, force l'élève à mobiliser ses compétences d'analyse plutôt que de simplement repérer un mot-clé dans les documents.";

export const SECTION_B_CHAMP_REPONSE_LABEL = "Réponse attendue";
export const SECTION_B_CHAMP_REPONSE_HINT = "Visible uniquement dans le corrigé enseignant.";
export const SECTION_B_CHAMP_REPONSE_TOOLTIP =
  "Réponse que l'élève devrait formuler pour obtenir le pointage maximal. Cet élément apparaît exclusivement dans le corrigé destiné à l'enseignant correcteur et n'est jamais visible sur la copie de l'élève. Vous pouvez inclure des variantes acceptables dans les notes au correcteur.";

/* ─── Pertinence documents ────────────────────────────────────── */

export const SECTION_B_DOC_LEURRE_LABEL = "Document non pertinent";
export const SECTION_B_DOC_LEURRE_TOOLTIP =
  "Document historiquement authentique mais dont le contenu ne se rapporte pas aux aspects de société ciblés par la consigne de caractérisation. Sa présence dans le dossier évalue la capacité de l'élève à exercer son jugement critique en distinguant les sources pertinentes de celles qui dépassent le cadre temporel ou thématique de la tâche.";
export const SECTION_B_DOC_LEURRE_BADGE = "Non pertinent";
export const SECTION_B_DOC_LEURRE_CONFIRMATION_TITRE = "Marquer ce document comme non pertinent ?";
export const SECTION_B_DOC_LEURRE_CONFIRMATION_CORPS =
  "Ce document est actuellement associé à des cases du schéma. Continuer supprimera ces associations.";
export const SECTION_B_DOC_LEURRE_CONFIRMATION_CONFIRMER = "Marquer non pertinent";
export const SECTION_B_DOC_LEURRE_CONFIRMATION_ANNULER = "Annuler";

export const SECTION_B_DOC_PERTINENT_LABEL = "Document pertinent";
export const SECTION_B_DOC_PERTINENT_TOOLTIP =
  "Document dont le contenu fournit une information directement nécessaire au remplissage d'une ou plusieurs cases du schéma. Chaque document pertinent doit être associé aux cases qu'il alimente, afin de générer automatiquement les références documentaires dans le corrigé.";

export const SECTION_B_DOC_ASSOCIATIONS_LABEL = "Cases alimentées par ce document";
export const SECTION_B_DOC_ASSOCIATIONS_VIDE = "Aucune case associée";

/* ─── Aspect de société ───────────────────────────────────────── */

export const SECTION_B_ASPECT_LABEL = "Aspect de société";
export const SECTION_B_ASPECT_TOOLTIP =
  "Dimension de la réalité sociale sous laquelle l'élève doit effectuer sa caractérisation (politique, social, économique, culturel ou territorial). Chaque aspect sélectionné correspond à un bloc du schéma comprenant un élément central et deux éléments de précision. Les deux aspects choisis déterminent la structure et le contenu attendu de l'ensemble du schéma. Ces mêmes aspects sont automatiquement assignés à l'indexation de la tâche dans la banque collaborative et apparaissent comme pré-sélectionnés et non modifiables à l'étape d'indexation, puisqu'ils sont structurellement liés à la consigne de caractérisation. L'enseignant peut cocher des aspects supplémentaires s'il le souhaite, mais ne peut pas décocher ceux imposés par la consigne.";

/* ─── Étape 3 — sous-blocs ─────────────────────────────────────── */

export const SECTION_B_ETAPE3_SOUS_BLOC_PREPARER = "Préparer";
export const SECTION_B_ETAPE3_SOUS_BLOC_CONSIGNE = "Rédiger la consigne";
export const SECTION_B_ETAPE3_SOUS_BLOC_SCHEMA = "Compléter le schéma";

/* ─── Schéma interactif ───────────────────────────────────────── */

export const SECTION_B_SCHEMA_COMPTEUR = (completes: number): string =>
  `${completes}/7 cases complètes`;

export const SECTION_B_SCHEMA_CASE_VIDE_PLACEHOLDER = "Cliquez pour rédiger l'énoncé de guidage.";

export const SECTION_B_POPOVER_ICONE_VISIBLE_ELEVE = "Visible par l'élève";
export const SECTION_B_POPOVER_ICONE_PRIVE_ENSEIGNANT = "Privé enseignant";

/* ─── Corrigé tabulaire ───────────────────────────────────────── */

export const SECTION_B_CORRIGE_COL_CASE = "Case";
export const SECTION_B_CORRIGE_COL_GUIDAGE = "Énoncé de guidage";
export const SECTION_B_CORRIGE_COL_REPONSE = "Réponse attendue";
export const SECTION_B_CORRIGE_COL_POINTS = "Points";
export const SECTION_B_CORRIGE_COL_DOCUMENTS = "Documents";
export const SECTION_B_CORRIGE_TOTAL_LABEL = "Total";
export const SECTION_B_CORRIGE_LEURRES_TITRE = "Documents non pertinents";
export const SECTION_B_CORRIGE_LEURRES_CORPS = (lettres: string): string =>
  lettres.length > 0
    ? `Les documents ${lettres} sont des documents non pertinents pour cette tâche.`
    : "Aucun document n'a été marqué comme non pertinent.";

/* ─── Checklist de publication ─────────────────────────────────── */

export const SECTION_B_CHECKLIST_TITRE = "Complétude avant publication";
export const SECTION_B_CHECKLIST_DESCRIPTION =
  "Tous les éléments ci-dessous doivent être renseignés pour publier la tâche.";
