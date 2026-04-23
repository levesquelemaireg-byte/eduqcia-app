/** Copy UI — module documents, wizard document, fiche document. Source de vérité : docs/UI-COPY.md. */

/** Module documents / Bloc 4 — `docs/UI-COPY.md` (Module, Étape 4) */
export const DOCUMENT_MODULE_PAGE_TITLE = "Créer un document";
export const DOCUMENT_MODULE_PAGE_TITLE_EDIT = "Modifier le document";
export const DOCUMENT_MODULE_TITRE_LABEL = "Titre du document";

/**
 * Ancrage temporel — libellé visible officiel (anciennement « Repère temporel ».
 * La colonne DB reste `repere_temporel` ; seul le libellé UI change.)
 */
export const ANCRAGE_TEMPOREL_LABEL = "Ancrage temporel";
export const ANCRAGE_TEMPOREL_TOOLTIP_TITLE = "Ancrage temporel";
export const ANCRAGE_TEMPOREL_TOOLTIP_BODY =
  "Situe le document dans le temps. Utilisé par l'application pour automatiser certaines tâches pédagogiques (ordre chronologique, comparaisons). N'apparaît pas sur la copie de l'élève.";
export const ANCRAGE_TEMPOREL_TOOLTIP_EXAMPLES = ["1760", "1760–1867", "Vers 1800"] as const;

/** Repère temporel — libellé interne (champs, aide, modale). */
export const REPERE_TEMPOREL_LABEL = ANCRAGE_TEMPOREL_LABEL;
export const REPERE_TEMPOREL_MODAL_TITLE = ANCRAGE_TEMPOREL_LABEL;
export const REPERE_TEMPOREL_HELP =
  "Indiquez une année, une période ou une date associée au document. Le système utilisera automatiquement l'année (4 chiffres) pour les exercices de classement. Pour les dates antérieures à l'an 1000, saisissez manuellement une année normalisée (négative autorisée). Cette donnée n'apparaît pas sur la copie de l'élève.";
export const REPERE_TEMPOREL_PLACEHOLDER = "ex. 1837, vers 1760, juin 1834, années 1830";
export const REPERE_TEMPOREL_MANUAL_PLACEHOLDER = "Année normalisée (ex. -30000)";
export const REPERE_TEMPOREL_EXTRACTED_PREFIX = "↳ Année extraite :";
export const REPERE_TEMPOREL_MANUAL_HINT =
  "Saisissez une année normalisée (peut être négative) pour les comparaisons automatiques.";
export const ERROR_ANNEE_NORMALISEE_RANGE =
  "L'année normalisée doit être comprise entre -300 000 et l'année en cours.";

/** Après publication d'une tâche avec création de documents en base (`is_published` faux jusqu'à complétion). */
export const TOAST_TACHE_PUBLISH_UNPUBLISHED_DOCS =
  "Des documents créés avec cette tâche ne sont pas encore visibles dans la banque collaborative. Complétez le repère temporel ou l'année normalisée depuis la fiche document pour les rendre visibles.";

/** Tableau de bord — documents non publiés en banque (auteur). */
export const DASHBOARD_INCOMPLETE_DOCUMENTS_TITLE = "Documents à compléter pour la banque";
export const DASHBOARD_INCOMPLETE_DOCUMENTS_EMPTY =
  "Tous vos documents sont visibles dans la banque ou n'ont pas besoin de complément.";
export const DASHBOARD_INCOMPLETE_DOCUMENTS_COUNT = (n: number) =>
  `${n} document${n > 1 ? "s" : ""} à compléter (repère temporel ou année) pour la banque.`;
export const DASHBOARD_INCOMPLETE_DOCUMENTS_HINT =
  "Ouvrez la fiche de chaque document depuis Mes tâches pour renseigner le repère temporel ou l'année normalisée.";

/** Fiche document — complétion banque (auteur, `is_published` faux). */
export const DOCUMENT_FICHE_BANK_SECTION_TITLE = "Visibilité dans la banque collaborative";
export const DOCUMENT_FICHE_BANK_SECTION_BODY =
  "Ce document n'est pas encore visible dans la banque. Renseignez le repère temporel ou l'année normalisée ci-dessous, puis enregistrez lorsque les métadonnées sont complètes.";
export const DOCUMENT_FICHE_BANK_SAVE_CTA = "Enregistrer et rendre visible dans la banque";
export const TOAST_DOCUMENT_BANK_UPDATE_OK =
  "Document mis à jour. Il est maintenant visible dans la banque.";
export const TOAST_DOCUMENT_BANK_UPDATE_INCOMPLETE =
  "Les métadonnées ou le repère temporel sont encore incomplets. Vérifiez les champs obligatoires.";
export const TOAST_DOCUMENT_BANK_UPDATE_AUTH =
  "Vous devez être connecté pour modifier ce document.";
export const TOAST_DOCUMENT_BANK_UPDATE_FORBIDDEN = "Vous ne pouvez pas modifier ce document.";
/** Libellés alignés Bloc 4 / wizard TAÉ — type `textuel` · `iconographique`. */
export const DOCUMENT_MODULE_TYPE_TEXT = "Textuel";
export const DOCUMENT_MODULE_TYPE_IMAGE = "Iconographique";
export const DOCUMENT_MODULE_CONTENU_LABEL = "Contenu (texte)";
export const DOCUMENT_MODULE_SOURCE_LABEL = "Source";
export const DOCUMENT_MODULE_SOURCE_PLACEHOLDER = "Ex. : Archives nationales du Québec, 1837.";
/** Aide sous le champ Source — éditeur TipTap (wizard document, Bloc 4). */
export const DOCUMENT_MODULE_SOURCE_FORMAT_HINT =
  "Mise en forme disponible : gras, italique, souligné, listes à puces.";
export const DOCUMENT_MODULE_SOURCE_TYPE_LABEL = "Type de source";
export const DOCUMENT_MODULE_SOURCE_PRIMAIRE = "Primaire";
export const DOCUMENT_MODULE_SOURCE_SECONDAIRE = "Secondaire";
export const DOCUMENT_MODULE_MODAL_SOURCE_PRIMAIRE_TITLE = "Source primaire";
export const DOCUMENT_MODULE_MODAL_SOURCE_PRIMAIRE_BODY =
  "Une source primaire est un document produit à l'époque étudiée (ex. journal, lettre, artefact), qui provient directement du contexte historique.";
export const DOCUMENT_MODULE_MODAL_SOURCE_SECONDAIRE_TITLE = "Source secondaire";
export const DOCUMENT_MODULE_MODAL_SOURCE_SECONDAIRE_BODY =
  "Une source secondaire est une analyse ou une interprétation produite après coup par un historien ou un chercheur à partir de sources.";
/** Alias pour texte d'aide (SR / tests) — corps identique aux modales « Source primaire / secondaire ». */
export const DOCUMENT_MODULE_SOURCE_PRIMAIRE_TOOLTIP = DOCUMENT_MODULE_MODAL_SOURCE_PRIMAIRE_BODY;
export const DOCUMENT_MODULE_SOURCE_SECONDAIRE_TOOLTIP =
  DOCUMENT_MODULE_MODAL_SOURCE_SECONDAIRE_BODY;
export const DOCUMENT_MODULE_LEGEND_LABEL = "Légende";
export const DOCUMENT_MODULE_LEGEND_HELP_P1 =
  "La légende est un court texte optionnel qui accompagne une image pour en préciser le contenu, le contexte ou la signification historique. Elle aide l'élève à mieux comprendre ce qu'il observe (ex. : lieu, date, personnage, événement). La légende apparaîtra directement sur l'image, dans le coin de votre choix, sous forme de rectangle en surimpression : fond blanc semi-transparent et filet noir à gauche.";
export const DOCUMENT_MODULE_LEGEND_HELP_P2 = "Maximum 50 mots.";
/** Texte regroupé pour l'infobulle (i) du champ Légende — inclut la limite de mots. */
export const DOCUMENT_MODULE_LEGEND_HELP_TOOLTIP = `${DOCUMENT_MODULE_LEGEND_HELP_P1} ${DOCUMENT_MODULE_LEGEND_HELP_P2}`;
/** Corps modale d'aide — position des 4 coins (wizard document / Bloc 4). */
export const DOCUMENT_MODULE_LEGEND_POSITION_HELP_MODAL_BODY =
  "Choisissez le coin où le bandeau de légende s'affichera en surimpression sur l'image à l'impression. Les quatre boutons correspondent aux coins haut gauche, haut droit, bas gauche et bas droit. Pour le coin haut gauche, l'icône Material est le glyphe « coin haut droit » en symétrie horizontale (pas de glyphe « coin haut gauche » dans la police).";
export const DOCUMENT_MODULE_LEGEND_POSITION_LABEL = "Position de la légende sur l'image";
/** Sous-titre sous « Affichage à l'impression » — grille des 4 coins (icônes Material). */
export const DOCUMENT_MODULE_LEGEND_POSITION_SUBTITLE = "Positionnement de la légende";
export const DOCUMENT_MODULE_LEGEND_WORDS_ERROR = "La légende ne peut pas dépasser 50 mots.";
export const DOCUMENT_MODULE_LEGEND_POSITION_ERROR =
  "Choisissez un coin pour la légende lorsque celle-ci est renseignée.";
export const DOCUMENT_MODULE_INDEX_DISCIPLINE = "Discipline";
export const DOCUMENT_MODULE_INDEX_NIVEAU = "Niveau";
export const DOCUMENT_MODULE_INDEX_CONNAISSANCES = "Connaissances associées";
export const DOCUMENT_MODULE_ASPECTS_LABEL = "Aspects de société";
/** Titre de section — encadré légal wizard document ; icône : `gavel` (`LegalNoticeIcon`). */
export const DOCUMENT_MODULE_LEGAL_SECTION_HEADING = "Documentation légale";
export const DOCUMENT_MODULE_LEGAL_CHECKBOX =
  "Je confirme respecter les règles d'utilisation des œuvres en milieu scolaire au Québec (ex. Copibec)";
export const DOCUMENT_MODULE_LEGAL_INTRO =
  "En ajoutant ce document, vous confirmez que vous avez le droit de l'utiliser dans un contexte éducatif, conformément à la Loi sur le droit d'auteur et aux ententes applicables (ex. Copibec).";
export const DOCUMENT_MODULE_LEGAL_BODY =
  "Vous vous engagez à respecter les limites de reproduction permises (extraits raisonnables) et à citer adéquatement la source.";
export const DOCUMENT_MODULE_LEGAL_FOOTER =
  "La plateforme ne vérifie pas les droits d'auteur des contenus ajoutés et décline toute responsabilité en cas d'utilisation non conforme.";
export const DOCUMENT_MODULE_SUBMIT = "Publier";

/** Wizard « Créer un document » — `docs/UI-COPY.md` (Module) */
export const DOCUMENT_WIZARD_INTRO =
  "Complétez les étapes pour créer un document historique structuré. L'aperçu se met à jour à chaque modification.";

// Étape 1 — Structure du document
export const DOCUMENT_WIZARD_STEP_STRUCTURE_LABEL = "Étape 1 — Structure du document";
export const DOCUMENT_WIZARD_STEP_STRUCTURE_DESC =
  "Choisissez la structure qui correspond à l'usage pédagogique du document.";

export const DOC_STRUCTURE_SIMPLE_TITLE = "Document simple";
export const DOC_STRUCTURE_SIMPLE_DESC =
  "Un seul élément, texte ou image. Compatible avec toutes les opérations intellectuelles.";
export const DOC_STRUCTURE_SIMPLE_MODAL_BODY =
  "Un document simple contient un seul élément, textuel ou iconographique. C'est la structure la plus courante dans les épreuves ministérielles : un extrait de texte, une carte, une photographie ou un tableau statistique, présenté seul avec son titre et sa source.\n\nCette structure est compatible avec toutes les opérations intellectuelles du programme. Elle convient chaque fois que la tâche repose sur l'analyse d'une source unique : établir un fait, identifier une cause ou une conséquence, situer un événement dans le temps, etc.\n\nChoisissez cette structure quand votre document se suffit à lui-même pour que l'élève réalise l'opération intellectuelle demandée.";

export const DOC_STRUCTURE_PERSPECTIVES_TITLE = "Document à perspectives";
export const DOC_STRUCTURE_PERSPECTIVES_DESC = "2 ou 3 points de vue côte à côte.";
export const DOC_STRUCTURE_PERSPECTIVES_MODAL_BODY =
  "Un document à perspectives regroupe 2 ou 3 points de vue sur un même sujet, présentés côte à côte dans un seul cadre. Chaque perspective est un élément distinct (texte ou image) avec son propre auteur et sa propre source.\n\nLe terme perspective désigne ici le regard porté par un acteur de l'époque ou par un historien sur une réalité sociale. Deux acteurs peuvent observer le même événement et en tirer des conclusions opposées : c'est précisément ce que l'élève doit analyser.\n\nCette structure est conçue pour l'opération intellectuelle Dégager des différences et des similitudes. Elle permet de travailler les comportements suivants :\n\n- Indiquer le point précis sur lequel des acteurs ou des historiens sont en désaccord (2 perspectives)\n- Indiquer le point précis sur lequel des acteurs ou des historiens sont d'accord (2 perspectives)\n- Montrer des différences et des similitudes par rapport à des points de vue d'acteurs ou à des interprétations d'historiens (3 perspectives)\n\nLes perspectives peuvent être de types différents au sein du même document. Par exemple, une caricature d'époque et un extrait de discours politique peuvent constituer deux perspectives complémentaires sur un même enjeu.";

export const DOC_STRUCTURE_DEUX_TEMPS_TITLE = "Document à deux temps";
export const DOC_STRUCTURE_DEUX_TEMPS_DESC = "Un même objet à deux moments distincts.";
export const DOC_STRUCTURE_DEUX_TEMPS_MODAL_BODY =
  "Un document à deux temps présente un même objet ou une même réalité à deux moments distincts, pour que l'élève puisse observer ce qui a changé ou ce qui s'est maintenu entre les deux périodes. Chaque temps est un élément distinct (texte ou image) avec son propre repère temporel et sa propre source.\n\nLe terme deux temps fait référence à la comparaison diachronique : on place côte à côte deux états d'une même réalité, séparés dans le temps, pour rendre visible le changement ou la continuité.\n\nCette structure est conçue pour l'opération intellectuelle Déterminer des changements et des continuités. Elle permet de travailler le comportement suivant :\n\n- Montrer qu'une réalité historique se transforme ou se maintient\n\nLes deux temps peuvent être de types différents. Par exemple, une carte de la Nouvelle-France en 1713 et une carte de la même région en 1763 pour observer les changements territoriaux après la Conquête, ou une photographie d'époque et un texte contemporain pour observer une évolution sociale.";

export const DOC_STRUCTURE_PERSPECTIVES_2 =
  "Pour un point d'accord ou de désaccord entre deux acteurs ou historiens.";
export const DOC_STRUCTURE_PERSPECTIVES_3 =
  "Pour une comparaison plus large avec identification de différences et similitudes entre trois points de vue.";

// Étape 2 — Ajouter un document (ancienne étape 1)
export const DOCUMENT_WIZARD_STEP_DOCUMENT_LABEL = "Étape 2 — Ajouter un document";
/** Pas de paragraphe descriptif sous le titre d'étape — décision produit (wizard document). */
export const DOCUMENT_WIZARD_STEP_DOCUMENT_DESC = "";
export const DOCUMENT_WIZARD_STEP_CLASSIFICATION_LABEL = "Étape 3 — Indexer le document";
export const DOCUMENT_WIZARD_STEP_CLASSIFICATION_DESC = "";
export const DOCUMENT_WIZARD_STEP_CONFIRMATION_LABEL = "Étape 4 — Confirmation — Droits d'auteur";
export const DOCUMENT_WIZARD_STEP_CONFIRMATION_DESC =
  "Lisez le cadre légal et confirmez avant d'enregistrer le document.";
/** Libellé visible au-dessus des boutons Textuel / Iconographique — astérisque via `RequiredMark` en UI. */
export const DOCUMENT_WIZARD_TYPE_DOC_LABEL = "Type de document";

/**
 * Fallback uniquement — tout usage réel doit fournir un placeholder spécifique
 * via la règle 1 du `docs/DESIGN-SYSTEM.md` (« Sélectionner un/une [label] »).
 * Ne pas l'utiliser directement dans un nouveau composant.
 */
export const LISTBOX_PLACEHOLDER_FALLBACK = "Sélectionner";

/**
 * Placeholders spécifiques — règle 1 du DESIGN-SYSTEM.md (champs de saisie obligatoires).
 * Format : « Sélectionner un/une [label en minuscules] ».
 */
export const SELECT_PLACEHOLDER_NIVEAU_SCOLAIRE = "Sélectionner un niveau scolaire";
export const SELECT_PLACEHOLDER_DISCIPLINE = "Sélectionner une discipline";
export const SELECT_PLACEHOLDER_OI = "Sélectionner une opération intellectuelle";
export const SELECT_PLACEHOLDER_COMPORTEMENT = "Sélectionner un comportement attendu";
export const SELECT_PLACEHOLDER_ECOLE = "Sélectionner une école secondaire";
export const SELECT_PLACEHOLDER_CSS = "Sélectionner un centre de services scolaires";
export const SELECT_PLACEHOLDER_CATEGORIE_TEXTUELLE = "Sélectionner une catégorie textuelle";
export const SELECT_PLACEHOLDER_CATEGORIE_ICONOGRAPHIQUE =
  "Sélectionner une catégorie iconographique";

/**
 * Libellés des options « tous les X » — règle 2 du DESIGN-SYSTEM.md (filtres de liste).
 * Format : « Tous les [label pluriel] » ou « Toutes les [label pluriel] ».
 */
export const FILTER_LABEL_ALL_NIVEAUX = "Tous les niveaux";
export const FILTER_LABEL_ALL_DISCIPLINES = "Toutes les disciplines";
export const FILTER_LABEL_ALL_OIS = "Toutes les opérations intellectuelles";
export const FILTER_LABEL_ALL_COMPORTEMENTS = "Tous les comportements";
export const DOCUMENT_MODULE_CONNAISSANCES_LOOKUP_ERROR =
  "Une ou plusieurs connaissances sélectionnées ne correspondent pas au référentiel. Modifiez la sélection puis réessayez.";
export const DOCUMENT_WIZARD_IMAGE_FILE_LABEL = "Fichier du document";
export const DOCUMENT_WIZARD_IMAGE_DROP_HINT = "Glisser un fichier ici ou choisir";
/** Texte permanent sous la zone de dépôt — JPG / PNG / WebP, 10 Mo, redimensionnement 660×400. */
export const IMAGE_UPLOAD_FORMATS_INFO =
  "Formats acceptés : JPG, PNG, WebP — taille maximale 10 Mo. Si votre image dépasse 660 × 400 px, elle sera redimensionnée automatiquement pour optimiser l'impression. La qualité visuelle est préservée.";
export const DOCUMENT_WIZARD_IMAGE_FORMATS_HINT = IMAGE_UPLOAD_FORMATS_INFO;
export const IMAGE_UPLOAD_ACCEPT_ATTR = "image/jpeg,image/png,image/webp";
export const IMAGE_UPLOAD_FINAL_DIMS_LABEL = "Dimensions finales :";
export const IMAGE_UPLOAD_FINAL_SIZE_LABEL = "Poids du fichier final :";
export const IMAGE_UPLOAD_BADGE_AUTO_RESIZED = "Redimensionnée automatiquement";
export const TOAST_DOCUMENT_IMAGE_TOO_LARGE_CLIENT =
  "Le fichier dépasse 10 Mo. Choisissez une image plus légère.";
export const IMAGE_UPLOAD_ERROR_FORMAT_NOT_ACCEPTED =
  "Ce format de fichier n'est pas accepté. Utilisez JPG, PNG ou WebP.";
export const IMAGE_UPLOAD_ERROR_FILE_TOO_LARGE_AFTER_RESIZE =
  "L'image reste trop volumineuse après optimisation. Choisissez une image plus simple ou plus petite.";
export const IMAGE_UPLOAD_ERROR_UNREADABLE =
  "Le fichier image est illisible ou corrompu. Choisissez une autre image.";
export const DOCUMENT_WIZARD_CONN_HELP = "Optionnel — cochez une ou plusieurs connaissances.";
export const DOCUMENT_WIZARD_CONN_DISABLED = "Sélectionnez d'abord une discipline.";
export const DOCUMENT_WIZARD_PREVIEW_HEADING = "Aperçu du document";
export const TOAST_DOCUMENT_WIZARD_DRAFT_SAVED =
  "Brouillon du document enregistré dans ce navigateur.";
export const DOCUMENT_WIZARD_PDF_LEGACY_PREVIEW =
  "Les fichiers PDF ne sont plus acceptés pour les documents iconographiques. Téléversez une image JPG, PNG ou WebP.";

/** Wizard `/documents/new` — étape 1 : placeholders champs (refonte UI). */
export const DOCUMENT_WIZARD_STEP1_PLACEHOLDER_TITRE = "Ex. : Carte de la Nouvelle-France, 1703";
export const DOCUMENT_WIZARD_STEP1_PLACEHOLDER_REPERE = "Ex. : 1837 · vers 1760 · juin 1834";
export const DOCUMENT_WIZARD_STEP1_PLACEHOLDER_LEGENDE =
  "Décrivez brièvement le contexte de l'image…";
export const DOCUMENT_WIZARD_STEP1_PLACEHOLDER_CONTENU =
  "Saisissez ou collez le texte du document…";
/** `aria-placeholder` éditeur source — pas de texte visible dans l'éditeur vide. */
export const DOCUMENT_WIZARD_STEP1_SOURCE_ARIA_PLACEHOLDER =
  "Laisser vide — l'éditeur riche parle de lui-même";

export const DOCUMENT_WIZARD_STEP1_CONTENU_LABEL = "Contenu du document";

/** Modales d'aide (texte intégral fourni produit — wizard document étape 1). */
export const DOCUMENT_WIZARD_STEP1_HELP_FILE_TITLE = "Fichier du document";
export const DOCUMENT_WIZARD_STEP1_HELP_FILE_BODY =
  "Le fichier sera hébergé sur nos serveurs et associé à ce document. Les formats acceptés sont JPG, PNG et WebP, avec une taille maximale de 10 Mo. Si votre image dépasse 660 × 400 px, elle sera redimensionnée automatiquement pour l'impression et l'affichage sur la copie de l'élève, sans que vous ayez à la préparer à l'avance. Pour une bonne lisibilité en classe, privilégiez une image avec un bon contraste ; les documents numérisés en noir et blanc conviennent à condition que le texte ou les détails historiques (dates, lieux, personnages) restent visibles à petite taille.";

export const DOCUMENT_WIZARD_STEP1_HELP_LEGENDE_TITLE = "Légende";
export const DOCUMENT_WIZARD_STEP1_HELP_LEGENDE_BODY =
  "La légende apparaît sur la copie de l'élève, en superposition sur l'image, dans le coin de votre choix. Elle remplit deux fonctions pédagogiques : contextualiser le document en donnant des repères (époque, auteur, lieu, événement) et étayer la compréhension de l'élève en fournissant un guidage complémentaire – une précision sur un détail, une question d'orientation, une courte mise en garde contre une interprétation erronée. La légende n'est pas un titre, mais une courte phrase qui ancre l'image dans son époque ou son sujet. Sa longueur est limitée à 50 mots. Elle est optionnelle, mais fortement recommandée pour tout document dont le sens n'est pas immédiat ou pour lequel un étayage est souhaitable.";

export const DOCUMENT_WIZARD_STEP1_HELP_TYPE_ICONO_TITLE = "Catégorie iconographique";
export const DOCUMENT_WIZARD_STEP1_HELP_TYPE_ICONO_BODY =
  "Cette information sert au filtrage dans la banque collaborative, plus précisément dans l'onglet Documents. Elle n'apparaît pas sur la copie de l'élève et permet aux enseignants de trouver rapidement des types spécifiques de sources visuelles – une aide précieuse pour préparer des séquences sur la caricature politique, la cartographie historique ou la photographie d'archive. Choisissez la catégorie qui correspond le mieux à la nature visuelle du document. Si aucune catégorie ne convient, sélectionnez « Autre » ; la liste évoluera en fonction des usages observés.";

export const DOCUMENT_WIZARD_STEP1_HELP_SOURCE_TITLE = "Source";
export const DOCUMENT_WIZARD_STEP1_HELP_SOURCE_BODY =
  "La source indique l'origine du document et apparaît sur la copie de l'élève, sous le contenu. En didactique de l'histoire, la mention de la source est essentielle pour former les élèves au travail de l'historien : elle leur apprend à situer un document dans son contexte de production et à en évaluer la fiabilité. Aucun format n'est imposé, mais nous recommandons de suivre la convention en usage dans votre établissement. Vous pouvez utiliser la mise en forme (gras, italique, listes) pour distinguer l'institution, le fonds d'archives ou les références bibliographiques.";

export const DOCUMENT_WIZARD_STEP1_HELP_SOURCE_TYPE_TITLE = "Type de source";
export const DOCUMENT_WIZARD_STEP1_HELP_SOURCE_TYPE_BODY =
  "Cette distinction est fondamentale en histoire et en sciences humaines, car elle aide l'élève à comprendre la nature du document et à développer son sens critique. Une source primaire est un document produit à l'époque des événements étudiés, par un acteur ou un témoin direct. Une source secondaire est un document produit après les événements, par quelqu'un qui les analyse ou les synthétise. Savoir identifier la nature de la source permet à l'élève de mieux comprendre le point de vue qui s'exprime et d'en apprécier la portée. Certains documents peuvent être difficiles à classer ; dans le doute, choisissez la classification la plus utile pour vos élèves.";

export const DOCUMENT_WIZARD_STEP1_HELP_REPERE_BODY =
  "Le repère temporel n'est pas affiché sur la copie de l'élève. Il sert à l'application pour générer automatiquement des exercices de classement temporel, comme l'ordre chronologique des documents, leur positionnement sur une ligne du temps, ou la classification avant/après un repère. Vous pouvez entrer une date précise, une année seule, une période ou une expression floue. Si votre texte contient plusieurs années, c'est la première année détectée qui sera utilisée ; vous pourrez ajuster cette valeur si nécessaire. Si le document n'est pas daté, laissez ce champ vide : l'automatisation pour les exercices temporels ne pourra pas s'appliquer.";

export const DOCUMENT_WIZARD_STEP1_HELP_CONTENU_TITLE = "Contenu du document";
export const DOCUMENT_WIZARD_STEP1_HELP_CONTENU_BODY =
  "Ici vous saisissez le texte intégral du document – ou un extrait, si l'original est trop long. En didactique, un extrait bien choisi permet de focaliser l'attention des élèves sur un passage clé, d'éviter la surcharge d'information et de favoriser une analyse plus précise. La mise en forme (gras, italique, listes) est conservée et affichée sur la copie de l'élève ; utilisez‑la pour mettre en évidence des passages clés. Si vous travaillez à partir d'un document numérisé, vous pouvez coller le texte depuis un logiciel de reconnaissance optique (OCR) ; vérifiez simplement les erreurs de lecture avant de sauvegarder. Il n'y a pas de limite de longueur, mais gardez en tête que les élèves lisent ce texte sur écran ou en impression. Un extrait bien choisi est souvent plus efficace qu'un document complet.";

export const DOCUMENT_WIZARD_UPLOAD_INVALID =
  "Choisissez un fichier JPG, PNG ou WebP d'au plus 10 Mo.";
export const DOCUMENT_FICHE_PDF_OPEN_NEW_TAB = "Ouvrir le fichier dans un nouvel onglet";
export const DOCUMENT_FICHE_NIVEAU = "Niveau";
export const DOCUMENT_FICHE_DISCIPLINE = "Discipline";
export const DOCUMENT_FICHE_ASPECTS = "Aspects de société";
export const DOCUMENT_FICHE_CONNAISSANCES = "Connaissances";
export const DOCUMENT_FICHE_AUTEUR = "Auteur";
export const DOCUMENT_FICHE_DATE = "Date de création";
export const DOCUMENT_FICHE_SOURCE = "Source";
export const DOCUMENT_FICHE_SOURCE_TYPE = "Type de source";
/** Fiche / pastilles — libellé explicite du choix Textuel ou Iconographique. */
export const DOCUMENT_FICHE_TYPE_DOCUMENT = "Type de document";
/** Fiche lecture `/documents/[id]` — surtitre cartouche (aligné fiche tâche). */
export const DOCUMENT_FICHE_EYEBROW = "Document historique";
/** Lien retour banque — même libellé que fiche tâche (`FicheRetourLink`). */
export const DOCUMENT_FICHE_RETOUR = "Retour";
export const DOCUMENT_FICHE_EDIT = "Modifier";
/** Colonne méta — titre de section (grille large). */
export const DOCUMENT_FICHE_SECTION_INDEXATION = "Références et indexation";

/**
 * Catégorie iconographique — labels et helpers déplacés dans
 * `lib/tache/document-categories-helpers.ts` (D-Coexistence Option A, commit
 * Chantier 3). Le type `DocumentCategorieIconographiqueId` vit dans
 * `lib/types/document-categories.ts`. Source de vérité unique :
 * `public/data/document-categories.json`.
 *
 * Anciennes constantes supprimées :
 *   - DOCUMENT_TYPE_ICONO_SLUGS, DOCUMENT_TYPE_ICONO_LABEL,
 *     DOCUMENT_TYPE_ICONO_BADGE_SHORT, DocumentTypeIconoSlug,
 *     documentTypeIconoLabel
 *
 * Seules les constantes de copy UI (titres, helps de section) restent ici.
 */
export const DOCUMENT_TYPE_ICONO_CATEGORY_LABEL = "Catégorie iconographique";
export const DOCUMENT_TYPE_ICONO_CATEGORY_HELP =
  "Indiquez le type d'image (carte, peinture, etc.) pour faciliter la recherche. Cette information n'apparaît pas sur la copie de l'élève.";

export const DOCUMENT_TYPE_TEXTUEL_CATEGORY_LABEL = "Catégorie textuelle";
export const DOCUMENT_TYPE_TEXTUEL_CATEGORY_HELP =
  "Indiquez le genre de document textuel (loi, écrit personnel, presse, etc.) pour faciliter la recherche. Cette information n'apparaît pas sur la copie de l'élève.";

export const BANK_FILTER_ICONO_CATEGORY_LABEL = "Catégorie iconographique";

export const DOCUMENT_FICHE_TYPE_ICONO_LINE = "Catégorie";
export const TOAST_DOCUMENT_CREATE_SUCCESS = "Document enregistré.";
export const TOAST_DOCUMENT_UPDATE_SUCCESS = "Document mis à jour.";
export const TOAST_DOCUMENT_EDIT_FORBIDDEN = "Vous ne pouvez pas modifier ce document.";
/** Base distante sans colonnes PO documents — insert sans légende / champs optionnels après repli. */
export const TOAST_DOCUMENT_CREATE_DEGRADED =
  "Document enregistré. La base Supabase n'a pas toutes les colonnes du dépôt (ex. légende) : appliquez les migrations `20250327140000_documents_source_type_legende_po.sql` et suivantes, puis rechargez le cache schéma si besoin.";
export const TOAST_DOCUMENT_CREATE_FAILED =
  "Impossible d'enregistrer le document. Vérifiez les champs puis réessayez.";
export const TOAST_DOCUMENT_CREATE_AUTH = "Connectez-vous pour enregistrer un document.";

/** Bloc 4 — import image document (fichier invalide — format ou taille avant envoi) */
export const TOAST_DOCUMENT_IMAGE_INVALID =
  "Choisissez une image JPG, PNG ou WebP d'au plus 10 Mo.";

/** Bloc 4 — échec envoi Supabase Storage */
export const TOAST_DOCUMENT_IMAGE_UPLOAD_FAILED =
  "L'envoi de l'image a échoué. Réessayez ou vérifiez le bucket « tae-document-images » sur Supabase.";

/** Bloc 4 — session requise pour l'upload */
export const TOAST_DOCUMENT_IMAGE_UPLOAD_AUTH =
  "Connectez-vous pour importer une image, puis réessayez.";

/** Miniature document unifiée — `docs/specs/SPEC-SOMMAIRE-DOCUMENT.md` §3. */
export const DOC_MINIATURE_STATUT_PUBLIE = "Publié";
export const DOC_MINIATURE_STATUT_BROUILLON = "Brouillon";
export const DOC_MINIATURE_AUTEUR_PREFIX = "Par";
export const DOC_MINIATURE_UTILISATION_SINGULIER = "1 utilisation";
export const DOC_MINIATURE_UTILISATION_PLURIEL = (n: number) => `${n} utilisations`;
export const DOC_MINIATURE_UTILISATION_AUCUNE = "Aucune utilisation";
export const DOC_MINIATURE_UPDATED_PREFIX = "Mis à jour le";
export const DOC_MINIATURE_CREATED_PREFIX = "Créé le";
/** Libellé actions kebab — miniature. */
export const DOC_MINIATURE_ACTION_OUVRIR = "Vue détaillée";
export const DOC_MINIATURE_ACTION_MODIFIER = "Modifier";
export const DOC_MINIATURE_ACTION_SUPPRIMER = "Supprimer";
export const DOC_MINIATURE_ACTION_REUTILISER = "Réutiliser dans une tâche";
export const DOC_MINIATURE_ACTIONS_ARIA = "Actions du document";

/** Deep-link banque → wizard tâche — modale de confirmation brouillon en cours. */
export const INJECT_DOC_MODAL_TITLE = "Un brouillon de tâche est déjà en cours";
export const INJECT_DOC_MODAL_INTRO =
  "Vous avez une tâche non publiée en cours de rédaction. Que souhaitez-vous faire de ce document ?";
export const INJECT_DOC_MODAL_DRAFT_LABEL = "Brouillon en cours";
export const INJECT_DOC_MODAL_DRAFT_UNTITLED = "Tâche sans consigne";
export const INJECT_DOC_MODAL_SLOTS_FILLED = (n: number, total: number) =>
  `${n} document${n > 1 ? "s" : ""} renseigné${n > 1 ? "s" : ""} sur ${total}`;
export const INJECT_DOC_MODAL_SLOTS_EMPTY = "Aucun document renseigné";
export const INJECT_DOC_MODAL_ACTION_REPLACE_A = "Remplacer le document A par celui-ci";
export const INJECT_DOC_MODAL_ACTION_REPLACE_A_HINT =
  "Écrase le contenu actuel du slot A par le document choisi.";
export const INJECT_DOC_MODAL_ACTION_FIRST_EMPTY = "Injecter dans le premier slot libre";
export const INJECT_DOC_MODAL_ACTION_FIRST_EMPTY_HINT =
  "Ajoute le document dans le premier slot encore vide sans toucher aux autres.";
export const INJECT_DOC_MODAL_ACTION_FIRST_EMPTY_NONE =
  "Tous les slots sont déjà remplis — choisissez une autre option.";
export const INJECT_DOC_MODAL_ACTION_RESET = "Repartir de zéro avec ce document";
export const INJECT_DOC_MODAL_ACTION_RESET_HINT =
  "Supprime le brouillon en cours et démarre une nouvelle tâche avec ce document en slot A.";
export const INJECT_DOC_MODAL_CANCEL = "Annuler";

/** Deep-link — toasts d'injection. */
export const TOAST_INJECT_DOC_REPLACED = "Document injecté dans le document 1.";
export const TOAST_INJECT_DOC_FIRST_EMPTY = (numero: number) =>
  `Document injecté dans le document ${numero}.`;
export const TOAST_INJECT_DOC_RESET = "Nouveau brouillon démarré avec ce document en position 1.";
export const TOAST_INJECT_DOC_NOT_FOUND = "Document introuvable ou inaccessible.";

/** Bloc 2 — alerte douce si nb_documents passe en-dessous du nombre de slots remplis. */
export const BLOC2_SOFT_WARNING_NB_DOCUMENTS = (remplis: number, nb: number) =>
  `Ce comportement n'accepte que ${nb} document${nb > 1 ? "s" : ""}, mais ${remplis} slot${
    remplis > 1 ? "s" : ""
  } sont déjà remplis. Videz les slots excédentaires au Bloc 4 avant de changer de comportement.`;
