/** Copy UI — parcours non rédactionnels (ordre chronologique, ligne du temps, avant/après). Source de vérité : docs/UI-COPY.md. */

/**
 * Wizard TAÉ — parcours ordre chronologique (non rédactionnel).
 * Spec : `docs/wizard-oi-non-redactionnelle.md` (parcours 1).
 */
/** Ancien textarea prérempli — conservé pour spec / brouillons JSON historiques ; le wizard utilise `consigne_theme` + template. */
export const NR_ORDRE_CONSIGNE_PREFILL =
  "Les documents [1, 2, 3 et 4] portent sur [Réalité sociale ou thème]. Classez-les en ordre chronologique. Quelle option (A, B, C ou D) présente la bonne séquence ?";
export const NR_ORDRE_CONSIGNE_LABEL = "Consigne";
export const NR_ORDRE_CONSIGNE_HELP =
  "Le libellé de cette consigne est fixe et conforme à la formulation officielle du ministère. Complétez uniquement la zone soulignée en bleu — la réalité sociale ou le thème couvert par vos documents. Les numéros de documents sont générés automatiquement.";
export const NR_ORDRE_CONSIGNE_MINISTERIAL_BADGE = "Libellé ministériel";
export const NR_ORDRE_TEMPLATE_CARD_FOOTER =
  "Seule la zone soulignée en bleu est modifiable. Les numéros de documents sont générés automatiquement.";
export const NR_ORDRE_TEMPLATE_LEGEND_FIXED = "Texte fixe (ministériel)";
export const NR_ORDRE_TEMPLATE_LEGEND_AUTO = "Généré automatiquement";
export const NR_ORDRE_TEMPLATE_LEGEND_EDITABLE = "Zone éditable";
export const NR_ORDRE_TEMPLATE_LEGEND_GROUP_ARIA = "Légende : nature des zones de la consigne";
export const NR_ORDRE_TEMPLATE_RENUMBER_NOTE =
  "Les numéros de documents s'ajustent automatiquement si cette tâche est intégrée à une épreuve regroupant plusieurs tâches. Vous n'avez pas à les gérer manuellement.";
export const NR_ORDRE_TEMPLATE_PREVIEW_LABEL = "Aperçu";
export const NR_ORDRE_THEME_PLACEHOLDER = "réalité sociale ou thème";
export const NR_ORDRE_THEME_INPUT_ARIA_LABEL =
  "Réalité sociale ou thème couvert par les documents — seule zone modifiable de la consigne ministérielle";
export const NR_ORDRE_THEME_REQUIRED =
  "Indiquez la réalité sociale ou le thème couvert par les documents.";
export const NR_ORDRE_WIZARD_DOC_TOKEN_TITLE =
  "Numérotation générée automatiquement selon les documents de la tâche";
/** Préfixe du jeton wizard (ex. « Doc 1–4 ») — suivi d'espaces et de chiffres ou d'une plage en cadratin. */
export const NR_ORDRE_WIZARD_DOC_TOKEN_PREFIX = "Doc";
/** Fragments de la phrase publiée (`{{doc_*}}` réécrits à l'impression épreuve). */
export const NR_ORDRE_PUBLISHED_INTRO_LES_DOCUMENTS = "Les documents ";
export const NR_ORDRE_PUBLISHED_INTRO_DOC_PLACEHOLDERS =
  "{{doc_1}}, {{doc_2}}, {{doc_3}} et {{doc_4}}";
export const NR_ORDRE_PUBLISHED_INTRO_PORTENT_SUR = " portent sur ";
export const NR_ORDRE_PUBLISHED_INTRO_SUFFIX =
  ". Classez-les en ordre chronologique. Quelle option (A, B, C ou D) présente la bonne séquence ?";
/** Feuille élève (ordre chronologique) — zone unique pour la lettre A–D. */
export const NR_ORDRE_STUDENT_SHEET_REPONSE_LABEL = "Réponse :";
export const NR_ORDRE_STUDENT_SHEET_OPTIONS_GROUP_ARIA =
  "Options de réponse : quatre suites de numéros de documents";
/**
 * Guidage **élève** (feuille / sommaire / `tache.guidage` publié) — fixe pour l'OI ordre chronologique, non éditable.
 * Distinct de `NR_ORDRE_OPTIONS_HELP` (texte **enseignant** sur la génération des options A–D).
 */
export const NR_ORDRE_STUDENT_GUIDAGE =
  "Cherchez dans chaque document des indices de temps (dates, événements, mots liés à une époque), puis utilisez vos connaissances pour confirmer leur ordre du plus ancien au plus récent.";
/** Bloc 3 ordre chrono — texte sous le titre Guidage complémentaire (formulaire). */
export const NR_ORDRE_GUIDAGE_FORM_LEAD =
  "Ce guidage est prédéterminé pour ce parcours. Il ne peut pas être modifié et sera affiché aux mêmes endroits que pour les autres tâches (fiche, feuille élève selon les options d'impression).";
/** Modale info — guidage fixe ordre chronologique. */
export const NR_ORDRE_GUIDAGE_INFO_MODAL_BODY =
  "Pour l'ordre chronologique, le guidage élève est identique pour toutes les tâches de ce type. Il apparaît dans la section Guidage de la fiche et sur la feuille élève lorsque le guidage est prévu à l'impression.";
export const NR_ORDRE_OPTIONS_SECTION_TITLE = "Options de réponse";
export const NR_ORDRE_OPTIONS_LABEL = "Options de réponse";
export const NR_ORDRE_OPTIONS_HELP =
  "La bonne séquence est calculée à partir des années normalisées des quatre documents (étape « Documents historiques »). En cas d'égalité d'années entre deux documents, vous saisissez la séquence correcte en cases (étape 1), puis vous générez les options. Une seule option correspond à l'ordre chronologique exact.";
export const NR_ORDRE_OPTION_A_LABEL = "Option A";
export const NR_ORDRE_OPTION_B_LABEL = "Option B";
export const NR_ORDRE_OPTION_C_LABEL = "Option C";
export const NR_ORDRE_OPTION_D_LABEL = "Option D";
export const NR_ORDRE_OPTION_A_PLACEHOLDER = "ex. : 1 - 2 - 3 - 4";
export const NR_ORDRE_OPTION_B_PLACEHOLDER = "ex. : 2 - 4 - 1 - 3";
export const NR_ORDRE_OPTION_C_PLACEHOLDER = "ex. : 3 - 1 - 4 - 2";
export const NR_ORDRE_OPTION_D_PLACEHOLDER = "ex. : 4 - 3 - 2 - 1";
/** Saisie structurée (4 cases) — pas de placeholder texte libre pour les suites. */
export const NR_ORDRE_PIN_HELP =
  "Quatre chiffres de 1 à 4, chacun une seule fois par option. Même présentation pour les options A à D.";
export const NR_ORDRE_PIN_SR_HINT =
  "Chiffres 1 à 4, sans doublon dans la ligne. Utilisez une case par position.";
export function NR_ORDRE_PIN_CELL_ARIA(optionLabel: string, positionOneBased: number): string {
  return `${optionLabel}, position ${positionOneBased} sur 4`;
}

/** Générateur de suites — étape 1 (séquence correcte). */
export const NR_ORDRE_SEQ_STEP1_TITLE = "Étape 1 — Saisir la bonne séquence";
export const NR_ORDRE_SEQ_STEP1_TITLE_AUTO = "Étape 1 — Séquence chronologique retenue";
export const NR_ORDRE_SEQ_STEP1_DESCRIPTION =
  "Entrez l'ordre chronologique correct des 4 documents. Chaque chiffre de 1 à 4 doit être utilisé une seule fois. L'outil génère ensuite trois distracteurs aléatoires, mélange les quatre options et identifie automatiquement la lettre correspondant à la bonne réponse.";
export const NR_ORDRE_SEQ_STEP1_DESCRIPTION_AUTO =
  "Ordre calculé automatiquement à partir des années normalisées des documents (1 à 4 = ordre de saisie dans le dossier). Vous pouvez générer les quatre options dès que les années sont distinctes.";
export const NR_ORDRE_SEQ_STEP1_HINT =
  "Exemple : si le document 3 vient en premier, suivi du 1, du 4 puis du 2, entrez 3 – 1 – 4 – 2.";
export const NR_ORDRE_SEQ_VALIDATION_ERROR =
  "Séquence invalide. Chaque chiffre de 1 à 4 doit apparaître exactement une fois.";
export function NR_ORDRE_SEQ_PIN_CELL_ARIA(positionOneBased: number): string {
  return `Séquence correcte, position ${positionOneBased} sur 4`;
}

/** Générateur de suites — étape 2 (résultats). */
export const NR_ORDRE_SEQ_STEP2_TITLE = "Étape 2 — Options générées";
export const NR_ORDRE_SEQ_STEP2_DESCRIPTION =
  "Les quatre options ci-dessous ont été mélangées aléatoirement. Consultez-les ci-dessous.";
export const NR_ORDRE_SEQ_CORRECT_BADGE = "Réponse correcte";
export const NR_ORDRE_SEQ_CORRIGE_SUMMARY_LABEL = "Corrigé — lettre exacte";
export function NR_ORDRE_SEQ_CORRIGE_VALUE(
  letter: "A" | "B" | "C" | "D",
  d1: number,
  d2: number,
  d3: number,
  d4: number,
): string {
  return `Option ${letter} · Séquence : ${d1} – ${d2} – ${d3} – ${d4}`;
}
export const NR_ORDRE_SEQ_RESET = "Saisir une nouvelle séquence";

export const NR_ORDRE_GENERATE_CTA = "Générer les options A B C D";
export const NR_ORDRE_GENERATE_HELP =
  "À partir de la bonne séquence (calculée depuis les années des documents, ou saisie manuellement en cas d'égalité d'années), l'outil choisit trois suites incorrectes (sans remise parmi les permutations possibles), mélange les quatre options sous les lettres A à D et indique le corrigé. Utilisez « Régénérer les distracteurs » pour conserver la bonne réponse et tirer de nouveaux distracteurs.";
export const NR_ORDRE_REGENERATE_CTA = "Régénérer les distracteurs";
export const NR_ORDRE_REGENERATE_HELP =
  "La bonne séquence et la justification restent les mêmes ; seuls les trois distracteurs et le mélange des lettres A à D changent.";
export const NR_ORDRE_CORRECT_LABEL = "Corrigé — Lettre exacte";
export const NR_ORDRE_CORRECT_HELP =
  "Après génération des options, la lettre du corrigé est déterminée automatiquement et affichée à l'étape 2.";
export const NR_ORDRE_CORRECT_ERROR =
  "Veuillez indiquer la lettre correspondant à la bonne réponse.";
export const NR_ORDRE_BLOC4_INFO =
  "Cette tâche requiert exactement 4 documents. Les documents sont numérotés automatiquement selon leur ordre de saisie.";
export const NR_ORDRE_GATE_PRE_DOCS =
  "Complétez d'abord les étapes « Paramètres de la tâche » et « Consigne et production attendue » (étapes 2 et 3) pour accéder au dossier documentaire.";
export const NR_ORDRE_GATE_BLOC3 =
  "Complétez et verrouillez l'étape « Paramètres de la tâche » (étape 2) pour rédiger la consigne (étape 3).";
/** Étape 5 ordre chronologique — prérequis étape 3 (thème consigne). */
export const NR_ORDRE_GATE_BLOC5_PRE_CONSIGNE =
  "Complétez d'abord l'étape « Consigne et guidage complémentaire » (thème de la consigne obligatoire).";
/** Étape 5 ordre chronologique — prérequis étape 4 (dossier documentaire rempli). */
export const NR_ORDRE_GATE_BLOC5_OPTIONS =
  "Complétez l'étape « Documents historiques » : tous les champs obligatoires pour chaque document avant de générer les options A–D.";
/** Étape 5 — année normalisée manquante sur au moins un document. */
export const NR_ORDRE_GATE_BLOC5_ANNEES =
  "Pour chaque document, renseignez une année valide (année normalisée ou repère temporel permettant de la déduire) à l'étape « Documents historiques ». Le corrigé est calculé à partir de ces années.";
export const NR_ORDRE_BLOC5_YEARS_READY_BADGE = "Prêt — années distinctes";
export const NR_ORDRE_BLOC5_AUTO_SEQUENCE_LEAD =
  "Bon ordre chronologique (documents numérotés 1 à 4 selon l'ordre de saisie) :";
export const NR_ORDRE_BLOC5_YEAR_TIE_WARNING =
  "Deux documents ou plus partagent la même année normalisée. Saisissez ci-dessous la bonne séquence chronologique (une case par position), puis générez les options.";
export const NR_ORDRE_JUSTIFICATION_LABEL = "Justification";
export function NR_ORDRE_BLOC5_YEARS_MISSING_DETAIL(letters: string[]): string {
  if (letters.length === 0) {
    return "Année manquante pour au moins un document.";
  }
  const joined = letters.join(", ");
  return `Année manquante ou invalide pour le ou les documents : ${joined}.`;
}
export const NR_ORDRE_STEP4_TITLE = "Étape 4 · Dossier documentaire";
export const NR_ORDRE_STEP4_DESCRIPTION =
  "Ajoutez quatre documents historiques : pour chacun, le titre, le contenu (texte ou image), la source et le type de source. L'élève repère le temps à partir du document.";

/** Bloc 4 — rappel séquence / correspondance chiffres ↔ documents (`OrdreChronologiqueBloc4SequenceReminder`). */
export const NR_ORDRE_BLOC4_REMINDER_TITLE = "Rappel — séquence chronologique et dossier";
export const NR_ORDRE_BLOC4_REMINDER_LEAD =
  "La bonne suite chronologique retenue est « {{suite}} ». Sur le questionnaire (deuxième feuillet à l'impression), cette suite apparaît sous l'option {{letter}}). Les chiffres 1 à 4 dans les suites correspondent aux documents du dossier (premier feuillet), dans l'ordre de saisie ci-dessous :";
/** Placeholders : {{d}} = chiffre 1–4, {{L}} = lettre A–D. */
export const NR_ORDRE_BLOC4_REMINDER_DIGIT_DOC = "Chiffre {{d}} — document {{L}}";

export function formatNrOrdreBloc4ReminderLead(
  suiteDisplay: string,
  optionLetter: "A" | "B" | "C" | "D",
): string {
  return NR_ORDRE_BLOC4_REMINDER_LEAD.replace("{{suite}}", suiteDisplay).replace(
    "{{letter}}",
    optionLetter,
  );
}

export function formatNrOrdreBloc4ReminderDigitDocLine(digit: number, slotLetter: string): string {
  return NR_ORDRE_BLOC4_REMINDER_DIGIT_DOC.replace("{{d}}", String(digit)).replace(
    "{{L}}",
    slotLetter,
  );
}

/**
 * Wizard TAÉ — parcours ligne du temps (non rédactionnel, OI1 · comportement 1.2).
 * Spec : `docs/wizard-oi-non-redactionnelle.md` (parcours 2). Branchement wizard à venir.
 */
/**
 * Guidage **élève** (`tache.guidage`) — fixe pour ce parcours, non éditable par l'enseignant.
 * L'élève relie le **document cible** aux **segments** A, B, C (ou D) de la ligne du temps.
 */
export const NR_LIGNE_TEMPS_STUDENT_GUIDAGE =
  "Repérez dans le document des indices temporels (dates, événements, tournures ou références à une période), puis comparez-les aux segments de la ligne du temps pour choisir la lettre qui correspond à la période où se situent les faits présentés.";
/** Bloc 3 (futur) — texte sous le titre Guidage complémentaire lorsque le parcours ligne du temps sera branché. */
export const NR_LIGNE_TEMPS_GUIDAGE_FORM_LEAD =
  "Ce guidage est prédéterminé pour ce parcours. Il ne peut pas être modifié et sera affiché aux mêmes endroits que pour les autres tâches (fiche, feuille élève selon les options d'impression).";
/** Modale info — guidage fixe ligne du temps. */
export const NR_LIGNE_TEMPS_GUIDAGE_INFO_MODAL_BODY =
  "Pour situer des faits sur une ligne du temps, le guidage élève est identique pour toutes les tâches de ce type. Il apparaît dans la section Guidage de la fiche et sur la feuille élève lorsque le guidage est prévu à l'impression.";

/** Plage de lettres dans la consigne publiée (trois segments). */
export const NR_LIGNE_TEMPS_LETTERS_THREE = "A, B et C";
/** Plage de lettres dans la consigne publiée (quatre segments). */
export const NR_LIGNE_TEMPS_LETTERS_FOUR = "A, B, C et D";
/** Badge — consigne non éditable (texte ministériel). */
export const NR_LIGNE_TEMPS_CONSIGNE_MINISTERIAL_BADGE = "Libellé ministériel fixe";
/** Modale info — consigne fixe (parcours ligne du temps). */
export const NR_LIGNE_TEMPS_CONSIGNE_INFO_MODAL_BODY =
  "Le libellé affiché aux élèves est fixe pour ce comportement. Les numéros de document s'ajustent automatiquement lorsque la tâche est intégrée à une épreuve regroupant plusieurs tâches.";
export const NR_LIGNE_TEMPS_STUDENT_SHEET_TIMELINE_ARIA =
  "Ligne du temps : segments chronologiques et lettres de réponse";
export const NR_LIGNE_TEMPS_BLOC4_INFO =
  "Cette tâche requiert exactement un document cible. L'élève s'en sert pour repérer la période sur la ligne du temps.";
export const NR_LIGNE_TEMPS_GATE_PRE_DOCS =
  "Complétez d'abord les étapes « Paramètres de la tâche » et « Consigne et production attendue » (étapes 2 et 3) pour accéder au dossier documentaire.";
export const NR_LIGNE_TEMPS_GATE_BLOC3 =
  "Complétez et verrouillez l'étape « Paramètres de la tâche » (étape 2) pour configurer la ligne du temps.";
export const NR_LIGNE_TEMPS_STEP4_TITLE = "Étape 4 · Dossier documentaire";
export const NR_LIGNE_TEMPS_STEP4_DESCRIPTION =
  "Ajoutez le document cible : titre, contenu (texte ou image), source et type de source. L'élève identifie la période à partir de ce document.";
export const NR_LIGNE_TEMPS_SEGMENT_COUNT_LABEL = "Nombre de segments";
export const NR_LIGNE_TEMPS_OPTION_3 = "3 segments (A, B, C)";
export const NR_LIGNE_TEMPS_OPTION_4 = "4 segments (A, B, C, D)";
export const NR_LIGNE_TEMPS_DATE_START = "Date de début";
export const NR_LIGNE_TEMPS_DATE_END = "Date de fin";
export const NR_LIGNE_TEMPS_DATE_CHAINED_HINT =
  "La date de fin d'une période est automatiquement la date de début de la suivante.";
export const NR_LIGNE_TEMPS_TIMELINE_PREVIEW_TITLE = "Ligne du temps";
/** Bloc 3 — titre au-dessus de la frise (sans choix du segment). */
export const NR_LIGNE_TEMPS_BLOC3_FRISE_PREVIEW_LEAD = "Aperçu de la frise";
/** Bloc 3 — texte sous le titre (segment corrigé à l'étape 5). */
export const NR_LIGNE_TEMPS_BLOC3_FRISE_PREVIEW_HINT =
  "Le segment correspondant à la période du document cible est choisi à l'étape « Corrigé et options de réponse » (étape 5).";
export const NR_LIGNE_TEMPS_SELECT_CORRECT_TITLE = "Bonne réponse sur la frise";
export const NR_LIGNE_TEMPS_SELECT_CORRECT_HELP =
  "Cliquez sur le segment correspondant à la période des faits du document cible. La lettre du corrigé est enregistrée automatiquement.";
export const NR_LIGNE_TEMPS_SELECT_CORRECT_MISSING =
  "Sélectionnez le segment correct sur la frise.";
export const NR_LIGNE_TEMPS_CORRECT_PREFIX = "Lettre correcte : ";
export const NR_LIGNE_TEMPS_PERIOD_PREFIX = "Période ";

/** Bloc 5 — ligne du temps : corrigé et segment. */
export const NR_LIGNE_TEMPS_BLOC5_TITLE = "Corrigé et segment sur la frise";
export const NR_LIGNE_TEMPS_BLOC5_FRISE_RECAP_TITLE = "Récapitulatif de la frise";
export const NR_LIGNE_TEMPS_BLOC5_INTRO =
  "Renseignez le segment qui correspond à la période des faits du document cible. Une proposition peut être calculée à partir de l'année normalisée du document (ou de l'année extraite du repère temporel).";
export const NR_LIGNE_TEMPS_BLOC5_GATE =
  "Complétez d'abord la frise à l'étape 3 et le document cible à l'étape 4.";
export const NR_LIGNE_TEMPS_BLOC5_SEGMENTS_LABEL = "Segment correct (réponse)";
export const NR_LIGNE_TEMPS_BLOC5_SEGMENT_SUMMARY_PREFIX = "Période ";
export const NR_LIGNE_TEMPS_BLOC5_NO_YEAR =
  "Aucune année renseignée – veuillez choisir le segment correct manuellement.";

export function NR_LIGNE_TEMPS_BLOC5_SEGMENT_AUTO(
  letter: string,
  startYear: number,
  endYear: number,
): string {
  return `Segment proposé automatiquement : ${letter} (${startYear}–${endYear})`;
}

export function NR_LIGNE_TEMPS_BLOC5_YEAR_OUTSIDE(year: number): string {
  return `L'année du document (${year}) ne se situe dans aucun segment de la frise. Veuillez vérifier la frise ou choisir un segment manuellement.`;
}

export function NR_LIGNE_TEMPS_BLOC5_SEGMENT_RADIO_ARIA(
  letter: string,
  startYear: number,
  endYear: number,
): string {
  return `Segment ${letter}, années ${startYear} à ${endYear}`;
}

/** Frise SVG (wizard) — dates incomplètes ou non strictement croissantes. */
export const NR_LIGNE_TEMPS_TIMELINE_EMPTY =
  "Complétez les dates ci-dessus pour voir apparaître la ligne du temps.";

/** Frise — aperçu partiel : au moins deux dates valides, pas encore toutes les périodes. */
export const NR_LIGNE_TEMPS_TIMELINE_PARTIAL_HINT =
  "La frise se complète au fil de la saisie. Renseignez toutes les dates pour verrouiller les segments A à D et publier.";

/** Accessibilité — segment cliquable sur la frise (plage d'années). */
export function NR_LIGNE_TEMPS_TIMELINE_SEGMENT_ARIA(
  letter: string,
  startYear: number,
  endYear: number,
): string {
  return `Sélectionner le segment ${letter} (${startYear}–${endYear}) comme bonne réponse`;
}

/**
 * Wizard TAÉ — parcours avant / après (non rédactionnel, OI1 · comportement 1.3).
 * Spec : `docs/wizard-oi-non-redactionnelle.md`.
 */
export const NR_AVANT_APRES_STUDENT_GUIDAGE =
  "Pour chaque option, comparez quels documents se situent avant le repère commun et lesquels s'y situent après, au regard des dates (ou de l'année extraite du repère temporel) par rapport à l'année du repère.";
export const NR_AVANT_APRES_GUIDAGE_FORM_LEAD =
  "Ce guidage est prédéterminé pour ce parcours. Il ne peut pas être modifié et sera affiché aux mêmes endroits que pour les autres tâches (fiche, feuille élève selon les options d'impression).";
export const NR_AVANT_APRES_GUIDAGE_INFO_MODAL_BODY =
  "Pour classer des faits avant ou après un repère, le guidage élève est identique pour toutes les tâches de ce type.";
export const NR_AVANT_APRES_THEME_LABEL = "Thème ou objet d'étude";
export const NR_AVANT_APRES_THEME_HELP =
  "Partie éditable de la consigne : les documents et le repère sont insérés automatiquement à la publication.";
export const NR_AVANT_APRES_THEME_PLACEHOLDER = "objet d'étude ou réalité sociale visée";
export const NR_AVANT_APRES_REPERE_LABEL = "Libellé du repère temporel";
export const NR_AVANT_APRES_REPERE_HELP =
  "Texte affiché comme repère commun au centre du tableau (ex. : une date, un événement).";
export const NR_AVANT_APRES_REPERE_PLACEHOLDER = "ex. : Déclaration de Balfour";
export const NR_AVANT_APRES_ANNEE_LABEL = "Année ou période du repère";
export const NR_AVANT_APRES_ANNEE_HELP =
  "Une année (AAAA) ou une période fermée (AAAA–AAAA, tiret ou tiret cadratin). Comparaison : strictement avant le début → avant le repère ; strictement après la fin → après ; années entre les deux bornes (incluses) → indiquez avant ou après pour chaque document concerné à l'étape suivante.";
export const NR_AVANT_APRES_OVERRIDE_SECTION_TITLE = "Repère sur une année ou une période";
export const NR_AVANT_APRES_OVERRIDE_SECTION_HELP =
  "Si l'année d'un document coïncide avec l'année pivot, ou se situe dans la période début–fin du repère, indiquez s'il doit être traité comme antérieur ou postérieur pour constituer la partition correcte 2 / 2.";
export const NR_AVANT_APRES_OVERRIDE_SLOT_LABEL = "Document {{letter}}";
export const NR_AVANT_APRES_OVERRIDE_AVANT = "Avant le repère";
export const NR_AVANT_APRES_OVERRIDE_APRES = "Après le repère";
export const NR_AVANT_APRES_BLOC5_TITLE = "Corrigé et options de réponse (tableau 4 × 3)";
export const NR_AVANT_APRES_BLOC5_HELP =
  "Générez quatre options (A à D) : une partition correcte et trois distracteurs. Régénérer produit de nouvelles combinaisons.";
export const NR_AVANT_APRES_GENERATE_CTA = "Générer les options A à D";
export const NR_AVANT_APRES_REGENERATE_CTA = "Régénérer les distracteurs";
export const NR_AVANT_APRES_GATE_PRE_DOCS =
  "Complétez d'abord les étapes « Paramètres de la tâche » et « Consigne et production attendue » (étapes 2 et 3).";
export const NR_AVANT_APRES_GATE_BLOC3 = "Renseignez le thème, le repère et l'année du repère.";
export const NR_AVANT_APRES_GATE_BLOC5 =
  "Générez les options de réponse une fois les quatre documents complétés (repère temporel et année comparables).";
export const NR_AVANT_APRES_GEN_ERROR_MISSING_YEAR =
  "Chaque document doit avoir une année comparable (normalisée ou extraite du repère temporel).";
export const NR_AVANT_APRES_GEN_ERROR_TIE =
  "Pour toute année égale à celle du repère, choisissez « Avant » ou « Après » dans la section dédiée.";
export const NR_AVANT_APRES_GEN_ERROR_PARTITION =
  "La partition correcte doit comporter exactement deux documents avant le repère et deux après. Ajustez les documents ou les choix d'égalité.";
export const NR_AVANT_APRES_STUDENT_SHEET_OPTIONS_GROUP_ARIA =
  "Options de réponse : avant, repère, après";
export const NR_AVANT_APRES_STUDENT_SHEET_REPONSE_LABEL = "Réponse :";
/** En-têtes du tableau **feuille élève / impression** uniquement (pivot au centre, sans titre au milieu). */
export const NR_AVANT_APRES_STUDENT_SHEET_TABLE_COL_AVANT = "Avant";
export const NR_AVANT_APRES_STUDENT_SHEET_TABLE_COL_APRES = "Après";
/** Libellé masqué visuellement : colonne centrale du tableau (repère affiché dans les lignes). */
export const NR_AVANT_APRES_STUDENT_SHEET_TABLE_REPERE_TH_SR = "Repère de comparaison";
export const NR_AVANT_APRES_PUBLISHED_INTRO_PREFIX =
  "Les documents {{doc_1}}, {{doc_2}}, {{doc_3}} et {{doc_4}} font référence à ";
export const NR_AVANT_APRES_PUBLISHED_INTRO_MIDDLE =
  "{{theme}}. Les faits qui y sont présentés se déroulent avant ou après {{repere}} ({{annee}}). ";
export const NR_AVANT_APRES_PUBLISHED_INTRO_SUFFIX =
  "Quelle lettre (A, B, C ou D) présente les numéros des documents à l'endroit approprié ?";
/** Wizard Bloc 5 — aperçu enseignant (libellés explicites). */
export const NR_AVANT_APRES_TABLE_COL_AVANT = "Avant le repère";
export const NR_AVANT_APRES_TABLE_COL_REPERE = "Repère";
export const NR_AVANT_APRES_TABLE_COL_APRES = "Après le repère";
export const NR_AVANT_APRES_JUSTIFICATION_AUTO =
  "Réponse {{correctLetter}} : documents antérieurs au repère : {{avantDocs}} ; postérieurs : {{apresDocs}}.";
export const NR_AVANT_APRES_BLOC4_INFO =
  "Quatre documents sont requis, chacun avec un repère temporel permettant d'en extraire ou de renseigner l'année.";
export const NR_AVANT_APRES_BLOC4_REMINDER_TITLE = "Rappel — repère et années";
export const NR_AVANT_APRES_BLOC4_GATE_BLOC3 =
  "Complétez d'abord le thème, le repère et l'année du repère à l'étape précédente.";
export const NR_AVANT_APRES_STEP4_TITLE = "Étape 4 · Dossier documentaire";
export const NR_AVANT_APRES_STEP4_DESCRIPTION =
  "Complétez les quatre documents (titre, source, contenu, repère temporel, année si utile).";
export const NR_AVANT_APRES_CONSIGNE_MINISTERIAL_BADGE = "Consigne structurée";
export const NR_AVANT_APRES_CONSIGNE_INFO_MODAL_BODY =
  "Le thème, le libellé du repère et l'année du repère structurent la consigne publiée ; le tableau des options est généré à l'étape 5.";
export const TOAST_TACHE_NR_AVANT_APRES_HYDRATE_INVALID =
  "Les données structurées de cette tâche (avant / après) sont illisibles. Vous pouvez republier depuis le wizard.";
