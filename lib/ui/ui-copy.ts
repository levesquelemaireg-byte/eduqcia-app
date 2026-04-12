/**
 * Chaînes alignées sur `docs/UI-COPY.md` (registre copy UI) et règles `docs/DECISIONS.md`.
 */

/** Page « Créer une TAÉ » — Toasts — erreur publication */
export const TOAST_PUBLICATION_FAILED = "Impossible de publier la tâche. Réessayez.";

/** Publication — données rejetées après envoi (sanitize / prérequis serveur) */
export const TOAST_PUBLICATION_VALIDATION =
  "La publication a été refusée : données incomplètes ou non reconnues. Vérifiez chaque étape puis réessayez.";

/** Publication — document iconographique sans URL HTTPS publique (`blob:` ou fichier local) */
export const TOAST_PUBLICATION_DOCUMENT_IMAGE =
  "Pour publier, chaque document iconographique doit avoir une adresse HTTPS (téléversement terminé ou URL saisie).";

/** Publication — niveau / discipline introuvable en base */
export const TOAST_PUBLICATION_LOOKUP_NIVEAU =
  "Niveau scolaire introuvable dans la base. Vérifiez la table « niveaux » (codes sec1…sec4) sur Supabase.";

export const TOAST_PUBLICATION_LOOKUP_DISCIPLINE =
  "Discipline introuvable dans la base. Vérifiez la table « disciplines » (codes HEC, GEO, HQC).";

/**
 * Tables `cd` / `connaissances` souvent vides si le schéma SQL seul a été appliqué.
 * Les images Storage peuvent exister sans que la transaction « publier » réussisse.
 */
export const TOAST_PUBLICATION_LOOKUP_CD =
  "Compétence disciplinaire introuvable en base. Importez les référentiels : npm run seed:ref (base vide) ou npm run seed:ref:fill (tâches d’apprentissage et d’évaluation déjà en base), avec la service role dans .env.local.";

export const TOAST_PUBLICATION_LOOKUP_CONNAISSANCE =
  "Connaissances relatives introuvables en base. Importez les référentiels : npm run seed:ref ou npm run seed:ref:fill (voir .env.local).";

/** RPC — violation de clé étrangère ou référence absente */
export const TOAST_PUBLICATION_RPC_FOREIGN_KEY =
  "La base a refusé la publication (référence manquante). Vérifiez opérations intellectuelles, comportements, liaisons documents et jeux de données.";

/** RPC — enum / type invalide (ex. aspects de société) */
export const TOAST_PUBLICATION_RPC_ENUM =
  "La base a refusé une valeur (souvent un aspect de société). Réessayez ou vérifiez les enums PostgreSQL.";

/** RPC `update_tae_transaction` absente sur Supabase — voir `docs/ARCHITECTURE.md` § RPC mise à jour TAÉ */
export const TOAST_PUBLICATION_RPC_FUNCTION_MISSING =
  "Mise à jour impossible : la fonction SQL update_tae_transaction est absente sur Supabase. Exécutez la migration supabase/migrations/20250325180000_update_tae_transaction.sql (SQL Editor ou supabase db push), puis réessayez.";

/** Bouton Publier — infobulle quand les docs sont « complets » mais bloqués (image locale) */
export const PUBLISH_BUTTON_TITLE_DOCUMENT_IMAGE = TOAST_PUBLICATION_DOCUMENT_IMAGE;

/** Module documents / Bloc 4 — `docs/UI-COPY.md` (Module, Étape 4) */
export const DOCUMENT_MODULE_PAGE_TITLE = "Créer un document";
export const DOCUMENT_MODULE_PAGE_TITLE_EDIT = "Modifier le document";
export const DOCUMENT_MODULE_TITRE_LABEL = "Titre du document";

/** Repère temporel — libellé, aide, champs (module documents, Bloc 4 TAÉ). */
export const REPERE_TEMPOREL_LABEL = "Repère temporel";
export const REPERE_TEMPOREL_MODAL_TITLE = "Repère temporel";
export const REPERE_TEMPOREL_HELP =
  "Indiquez une année, une période ou une date associée au document. Le système utilisera automatiquement l’année (4 chiffres) pour les exercices de classement. Pour les dates antérieures à l’an 1000, saisissez manuellement une année normalisée (négative autorisée). Cette donnée n’apparaît pas sur la copie de l'élève.";
export const REPERE_TEMPOREL_PLACEHOLDER = "ex. 1837, vers 1760, juin 1834, années 1830";
export const REPERE_TEMPOREL_MANUAL_PLACEHOLDER = "Année normalisée (ex. -30000)";
export const REPERE_TEMPOREL_EXTRACTED_PREFIX = "↳ Année extraite :";
export const REPERE_TEMPOREL_MANUAL_HINT =
  "Saisissez une année normalisée (peut être négative) pour les comparaisons automatiques.";
export const ERROR_ANNEE_NORMALISEE_RANGE =
  "L’année normalisée doit être comprise entre -300 000 et l’année en cours.";

/** Après publication d’une tâche avec création de documents en base (`is_published` faux jusqu’à complétion). */
export const TOAST_TAE_PUBLISH_UNPUBLISHED_DOCS =
  "Des documents créés avec cette tâche ne sont pas encore visibles dans la banque collaborative. Complétez le repère temporel ou l’année normalisée depuis la fiche document pour les rendre visibles.";

/** Tableau de bord — documents non publiés en banque (auteur). */
export const DASHBOARD_INCOMPLETE_DOCUMENTS_TITLE = "Documents à compléter pour la banque";
export const DASHBOARD_INCOMPLETE_DOCUMENTS_EMPTY =
  "Tous vos documents sont visibles dans la banque ou n’ont pas besoin de complément.";
export const DASHBOARD_INCOMPLETE_DOCUMENTS_COUNT = (n: number) =>
  `${n} document${n > 1 ? "s" : ""} à compléter (repère temporel ou année) pour la banque.`;
export const DASHBOARD_INCOMPLETE_DOCUMENTS_HINT =
  "Ouvrez la fiche de chaque document depuis Mes tâches pour renseigner le repère temporel ou l’année normalisée.";

/** Fiche document — complétion banque (auteur, `is_published` faux). */
export const DOCUMENT_FICHE_BANK_SECTION_TITLE = "Visibilité dans la banque collaborative";
export const DOCUMENT_FICHE_BANK_SECTION_BODY =
  "Ce document n’est pas encore visible dans la banque. Renseignez le repère temporel ou l’année normalisée ci-dessous, puis enregistrez lorsque les métadonnées sont complètes.";
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
/** Alias pour texte d’aide (SR / tests) — corps identique aux modales « Source primaire / secondaire ». */
export const DOCUMENT_MODULE_SOURCE_PRIMAIRE_TOOLTIP = DOCUMENT_MODULE_MODAL_SOURCE_PRIMAIRE_BODY;
export const DOCUMENT_MODULE_SOURCE_SECONDAIRE_TOOLTIP =
  DOCUMENT_MODULE_MODAL_SOURCE_SECONDAIRE_BODY;
export const DOCUMENT_MODULE_LEGEND_LABEL = "Légende";
export const DOCUMENT_MODULE_LEGEND_HELP_P1 =
  "La légende est un court texte optionnel qui accompagne une image pour en préciser le contenu, le contexte ou la signification historique. Elle aide l'élève à mieux comprendre ce qu'il observe (ex. : lieu, date, personnage, événement). La légende apparaîtra directement sur l'image, dans le coin de votre choix, sous forme de rectangle en surimpression : fond blanc semi-transparent et filet noir à gauche.";
export const DOCUMENT_MODULE_LEGEND_HELP_P2 = "Maximum 50 mots.";
/** Texte regroupé pour l’infobulle (i) du champ Légende — inclut la limite de mots. */
export const DOCUMENT_MODULE_LEGEND_HELP_TOOLTIP = `${DOCUMENT_MODULE_LEGEND_HELP_P1} ${DOCUMENT_MODULE_LEGEND_HELP_P2}`;
/** Corps modale d’aide — position des 4 coins (wizard document / Bloc 4). */
export const DOCUMENT_MODULE_LEGEND_POSITION_HELP_MODAL_BODY =
  "Choisissez le coin où le bandeau de légende s’affichera en surimpression sur l’image à l’impression. Les quatre boutons correspondent aux coins haut gauche, haut droit, bas gauche et bas droit. Pour le coin haut gauche, l’icône Material est le glyphe « coin haut droit » en symétrie horizontale (pas de glyphe « coin haut gauche » dans la police).";
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
  "Complétez les étapes pour créer un document historique structuré. L’aperçu se met à jour à chaque modification.";

// Étape 1 — Structure du document
export const DOCUMENT_WIZARD_STEP_STRUCTURE_LABEL = "Étape 1 — Structure du document";
export const DOCUMENT_WIZARD_STEP_STRUCTURE_DESC =
  "Choisissez la structure qui correspond à l’usage pédagogique du document.";

export const DOC_STRUCTURE_SIMPLE_TITLE = "Document simple";
export const DOC_STRUCTURE_SIMPLE_DESC =
  "Un seul élément, texte ou image. Compatible avec toutes les opérations intellectuelles.";
export const DOC_STRUCTURE_SIMPLE_MODAL_BODY =
  "Un document simple contient un seul élément, textuel ou iconographique. C’est la structure la plus courante dans les épreuves ministérielles : un extrait de texte, une carte, une photographie ou un tableau statistique, présenté seul avec son titre et sa source.\n\nCette structure est compatible avec toutes les opérations intellectuelles du programme. Elle convient chaque fois que la tâche repose sur l’analyse d’une source unique : établir un fait, identifier une cause ou une conséquence, situer un événement dans le temps, etc.\n\nChoisissez cette structure quand votre document se suffit à lui-même pour que l’élève réalise l’opération intellectuelle demandée.";

export const DOC_STRUCTURE_PERSPECTIVES_TITLE = "Document à perspectives";
export const DOC_STRUCTURE_PERSPECTIVES_DESC = "2 ou 3 points de vue côte à côte.";
export const DOC_STRUCTURE_PERSPECTIVES_MODAL_BODY =
  "Un document à perspectives regroupe 2 ou 3 points de vue sur un même sujet, présentés côte à côte dans un seul cadre. Chaque perspective est un élément distinct (texte ou image) avec son propre auteur et sa propre source.\n\nLe terme perspective désigne ici le regard porté par un acteur de l’époque ou par un historien sur une réalité sociale. Deux acteurs peuvent observer le même événement et en tirer des conclusions opposées : c’est précisément ce que l’élève doit analyser.\n\nCette structure est conçue pour l’opération intellectuelle Dégager des différences et des similitudes. Elle permet de travailler les comportements suivants :\n\n- Indiquer le point précis sur lequel des acteurs ou des historiens sont en désaccord (2 perspectives)\n- Indiquer le point précis sur lequel des acteurs ou des historiens sont d’accord (2 perspectives)\n- Montrer des différences et des similitudes par rapport à des points de vue d’acteurs ou à des interprétations d’historiens (3 perspectives)\n\nLes perspectives peuvent être de types différents au sein du même document. Par exemple, une caricature d’époque et un extrait de discours politique peuvent constituer deux perspectives complémentaires sur un même enjeu.";

export const DOC_STRUCTURE_DEUX_TEMPS_TITLE = "Document à deux temps";
export const DOC_STRUCTURE_DEUX_TEMPS_DESC = "Un même objet à deux moments distincts.";
export const DOC_STRUCTURE_DEUX_TEMPS_MODAL_BODY =
  "Un document à deux temps présente un même objet ou une même réalité à deux moments distincts, pour que l’élève puisse observer ce qui a changé ou ce qui s’est maintenu entre les deux périodes. Chaque temps est un élément distinct (texte ou image) avec son propre repère temporel et sa propre source.\n\nLe terme deux temps fait référence à la comparaison diachronique : on place côte à côte deux états d’une même réalité, séparés dans le temps, pour rendre visible le changement ou la continuité.\n\nCette structure est conçue pour l’opération intellectuelle Déterminer des changements et des continuités. Elle permet de travailler le comportement suivant :\n\n- Montrer qu’une réalité historique se transforme ou se maintient\n\nLes deux temps peuvent être de types différents. Par exemple, une carte de la Nouvelle-France en 1713 et une carte de la même région en 1763 pour observer les changements territoriaux après la Conquête, ou une photographie d’époque et un texte contemporain pour observer une évolution sociale.";

export const DOC_STRUCTURE_PERSPECTIVES_2 =
  "Pour un point d’accord ou de désaccord entre deux acteurs ou historiens.";
export const DOC_STRUCTURE_PERSPECTIVES_3 =
  "Pour une comparaison plus large avec identification de différences et similitudes entre trois points de vue.";

// Étape 2 — Ajouter un document (ancienne étape 1)
export const DOCUMENT_WIZARD_STEP_DOCUMENT_LABEL = "Étape 2 — Ajouter un document";
/** Pas de paragraphe descriptif sous le titre d’étape — décision produit (wizard document). */
export const DOCUMENT_WIZARD_STEP_DOCUMENT_DESC = "";
export const DOCUMENT_WIZARD_STEP_CLASSIFICATION_LABEL = "Étape 3 — Indexer le document";
export const DOCUMENT_WIZARD_STEP_CLASSIFICATION_DESC = "";
export const DOCUMENT_WIZARD_STEP_CONFIRMATION_LABEL = "Étape 4 — Confirmation — Droits d’auteur";
export const DOCUMENT_WIZARD_STEP_CONFIRMATION_DESC =
  "Lisez le cadre légal et confirmez avant d’enregistrer le document.";
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
  "Ce format de fichier n’est pas accepté. Utilisez JPG, PNG ou WebP.";
export const IMAGE_UPLOAD_ERROR_FILE_TOO_LARGE_AFTER_RESIZE =
  "L’image reste trop volumineuse après optimisation. Choisissez une image plus simple ou plus petite.";
export const IMAGE_UPLOAD_ERROR_UNREADABLE =
  "Le fichier image est illisible ou corrompu. Choisissez une autre image.";
export const DOCUMENT_WIZARD_CONN_HELP = "Optionnel — cochez une ou plusieurs connaissances.";
export const DOCUMENT_WIZARD_CONN_DISABLED = "Sélectionnez d’abord une discipline.";
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
/** `aria-placeholder` éditeur source — pas de texte visible dans l’éditeur vide. */
export const DOCUMENT_WIZARD_STEP1_SOURCE_ARIA_PLACEHOLDER =
  "Laisser vide — l'éditeur riche parle de lui-même";

export const DOCUMENT_WIZARD_STEP1_CONTENU_LABEL = "Contenu du document";

/** Modales d’aide (texte intégral fourni produit — wizard document étape 1). */
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
  "Choisissez un fichier JPG, PNG ou WebP d’au plus 10 Mo.";
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
 * `lib/tae/document-categories-helpers.ts` (D-Coexistence Option A, commit
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
  "Indiquez le type d’image (carte, peinture, etc.) pour faciliter la recherche. Cette information n’apparaît pas sur la copie de l'élève.";

export const DOCUMENT_TYPE_TEXTUEL_CATEGORY_LABEL = "Catégorie textuelle";
export const DOCUMENT_TYPE_TEXTUEL_CATEGORY_HELP =
  "Indiquez le genre de document textuel (loi, écrit personnel, presse, etc.) pour faciliter la recherche. Cette information n’apparaît pas sur la copie de l'élève.";

export const BANK_FILTER_ICONO_CATEGORY_LABEL = "Catégorie iconographique";

export const DOCUMENT_FICHE_TYPE_ICONO_LINE = "Catégorie";
export const TOAST_DOCUMENT_CREATE_SUCCESS = "Document enregistré.";
export const TOAST_DOCUMENT_UPDATE_SUCCESS = "Document mis à jour.";
export const TOAST_DOCUMENT_EDIT_FORBIDDEN = "Vous ne pouvez pas modifier ce document.";
/** Base distante sans colonnes PO documents — insert sans légende / champs optionnels après repli. */
export const TOAST_DOCUMENT_CREATE_DEGRADED =
  "Document enregistré. La base Supabase n’a pas toutes les colonnes du dépôt (ex. légende) : appliquez les migrations `20250327140000_documents_source_type_legende_po.sql` et suivantes, puis rechargez le cache schéma si besoin.";
export const TOAST_DOCUMENT_CREATE_FAILED =
  "Impossible d'enregistrer le document. Vérifiez les champs puis réessayez.";
export const TOAST_DOCUMENT_CREATE_AUTH = "Connectez-vous pour enregistrer un document.";

/** Bloc 4 — import image document (fichier invalide — format ou taille avant envoi) */
export const TOAST_DOCUMENT_IMAGE_INVALID =
  "Choisissez une image JPG, PNG ou WebP d’au plus 10 Mo.";

/** Bloc 4 — échec envoi Supabase Storage */
export const TOAST_DOCUMENT_IMAGE_UPLOAD_FAILED =
  "L’envoi de l’image a échoué. Réessayez ou vérifiez le bucket « tae-document-images » sur Supabase.";

/** Bloc 4 — session requise pour l’upload */
export const TOAST_DOCUMENT_IMAGE_UPLOAD_AUTH =
  "Connectez-vous pour importer une image, puis réessayez.";

/** Page « Créer une TAÉ » — Toasts — erreur sauvegarde brouillon (`docs/UI-COPY.md` — Toasts) */
export const TOAST_DRAFT_SAVE_FAILED = "Impossible d'enregistrer le brouillon. Réessayez.";

/** Bannières reprise brouillon — `docs/UI-COPY.md` (Créer une TAÉ) */
/** Brouillon serveur / session — format antérieur sans `bloc1` (toast erreur, pas de reprise). */
export const TOAST_WIZARD_DRAFT_OBSOLETE =
  "Ce brouillon provient d’une version antérieure du formulaire et ne peut pas être repris. Reprenez la création de la tâche.";

export const WIZARD_BANNER_SERVER_TITLE = "Brouillon enregistré";
export const WIZARD_BANNER_SERVER_BODY =
  "Vous avez déjà une tâche en cours enregistrée sur le serveur. Vous pouvez la reprendre ou continuer un nouveau formulaire (le brouillon serveur reste disponible jusqu’à publication ou suppression).";

export const WIZARD_BANNER_LOCAL_TITLE = "Travail non enregistré en ligne";
export const WIZARD_BANNER_LOCAL_BODY =
  "Ce navigateur contient une reprise de formulaire qui n’a pas été enregistrée avec « Sauvegarder le brouillon ». Vous pouvez la reprendre ou l’ignorer.";

export const WIZARD_BANNER_RESUME = "Reprendre";
export const WIZARD_BANNER_DISMISS_SERVER = "Masquer pour cette visite";
export const WIZARD_BANNER_DISMISS_LOCAL = "Ignorer le brouillon local";

/** Wizard — Étape 2 — texte d’aide dans l’infobulle (ⓘ) du titre d’étape (`TaeForm` + `step-meta`). */
export const TAE_BLUEPRINT_STEP_DESCRIPTION =
  "Définissez les paramètres pédagogiques requis : niveau scolaire, discipline, opération intellectuelle et comportement attendu. Le comportement attendu détermine l'outil d'évaluation, dont la grille de correction ministérielle. L'espace de production (lignes ou formats non rédactionnels) est fixé automatiquement selon le comportement.";

/** Wizard — Étape 2 — `aria-label` du bouton info à côté du titre */
export const TAE_BLUEPRINT_STEP_INFO_BUTTON_ARIA = "Afficher l'aide sur cette étape";

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
      "Rédigez la consigne de la tâche. L’appel documentaire (ex.\u00a0: « Consultez le document A. ») sera ajouté automatiquement au début.",
  },
};

/** Wizard TAÉ — étape 3 — accès refusé tant que le blueprint (étape 2) n’est pas verrouillé */
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

/** Bloc 7 — champs (corps d’étape) */
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

/** Bouton `info` à côté d’un label — `aria-label` (`docs/UI-COPY.md` — Étape 2, bouton info) */
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

/** Titre de section — grille d'évaluation ministérielle (vue détaillée tâche) */
export const FICHE_SECTION_TITLE_GRILLE = "Grille d\u2019évaluation ministérielle";

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

/** Page liste `/questions` — titre, CTA, état vide (`docs/UI-COPY.md` — Mes tâches) */
export const PAGE_LISTE_MES_DOCUMENTS_TITLE = "Mes documents";
export const PAGE_LISTE_MES_DOCUMENTS_SUBTITLE =
  "Documents historiques que vous avez créés (brouillons et publiés).";
export const CTA_CREER_UN_DOCUMENT = "Créer un document";
export const LISTE_DOCUMENTS_VIDE = "Aucun document pour le moment.";

export const PAGE_LISTE_MES_TACHES_TITLE = "Mes tâches";
export const PAGE_LISTE_MES_TACHES_SUBTITLE =
  "Tâches d'apprentissage et d'évaluation que vous avez créées (brouillons et publiées).";
export const CTA_CREER_UNE_TACHE = "Créer une tâche";
export const LISTE_TACHES_VIDE_CATEGORIE = "Aucune tâche dans cette catégorie.";

/** Toasts — après publication réussie (`docs/UI-COPY.md` — Mes tâches / Créer) */
export const TOAST_TACHE_PUBLIEE_SUCCES = "Tâche publiée avec succès";

/** Toast — après enregistrement d’une TAÉ modifiée (`docs/UI-COPY.md` — Toasts) */
export const TOAST_TACHE_MAJ_SUCCES = "Modifications enregistrées avec succès";

/**
 * Toast — mise à jour refusée (TAÉ dans une épreuve) (`docs/UI-COPY.md` — Toasts).
 */
export const TOAST_PUBLICATION_TAE_LOCKED_EVALUATION =
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
  "Complétez les sept (7) étapes pour créer une tâche complète, alignée sur les prescriptions ministérielles.";

/** Page `/questions/[id]/edit` (`docs/UI-COPY.md` — Édition guidée) */
export const PAGE_MODIFIER_UNE_TACHE_TITLE = "Modifier une tâche";
export const PAGE_MODIFIER_UNE_TACHE_SUBTITLE =
  "Reprenez les sept (7) étapes pour mettre à jour votre tâche, alignée sur les prescriptions ministérielles.";

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

/** Page `/bank` — `docs/UI-COPY.md` — Banque collaborative */
export const PAGE_BANK_TITLE = "Banque collaborative";
export const PAGE_BANK_TAB_TASKS = "Tâches";
export const PAGE_BANK_TAB_DOCUMENTS = "Documents historiques";
export const PAGE_BANK_TAB_EVALUATIONS = "Épreuves";
export const PAGE_BANK_TASKS_SUBTITLE =
  "Parcourez les tâches d’apprentissage et d’évaluation publiées par d’autres enseignants.";
export const PAGE_BANK_EVALUATIONS_SUBTITLE =
  "Parcourez les épreuves publiées par d’autres enseignants.";
export const PAGE_BANK_EVALUATIONS_CTA_INTRO =
  "Pour composer une épreuve, utilisez l’entrée dédiée.";
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
  "Pour créer un document historique structuré, utilisez l’entrée dédiée.";
export const PAGE_BANK_DOCUMENTS_CTA_LINK = "Créer un document";

/** Fiche document — aligné registre « Utilisé dans X tâches » (`docs/UI-COPY.md` — Module) ; compteur = TAÉ publiées uniquement (`docs/FEATURES.md` §5.4). */
export function copyDocumentPublishedTaeUsageCount(count: number): string {
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
  "Disponible après la sélection de l’opération intellectuelle.";
export const BANK_TASK_FILTER_NIVEAU = "Niveau scolaire";
export const BANK_TASK_FILTER_DISCIPLINE = "Discipline";
/** Filtre sur `tae.cd_id` (= clé d’une ligne du référentiel Miller, étape 5 du wizard). */
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
/** Banque — épreuve publiée par un autre enseignant : pas d’édition depuis cet écran. */
export const BANK_EVAL_NO_EDIT_OTHER = "Réservé à l’auteur";

/** Banque — onglet Épreuves ; compteur `evaluation_tae` (forme longue, DECISIONS lexique). */
export function copyBankEvaluationTaskCount(count: number): string {
  if (count === 0) {
    return "Aucune tâche d’apprentissage et d’évaluation dans cette épreuve";
  }
  if (count === 1) return "1 tâche d’apprentissage et d’évaluation";
  return `${count} tâches d’apprentissage et d’évaluation`;
}

export const BANK_TASK_LINK_VOIR = "Voir";
/** Liste banque tâches — pastille d’état publication (`docs/UI-COPY.md` — Banque). */
export const BANK_TASK_LIST_BADGE_PUBLISHED = "Publié";
export const BANK_TASK_PUBLISHED_ON = "Publié le";
export const BANK_TASK_BY = "Par";

/** Banque — ajouter une tâche publiée à une épreuve brouillon */
export const BANK_TASK_ADD_TO_EVALUATION = "Ajouter à une épreuve";
export const EVAL_BANK_MODAL_TITLE = "Choisir une épreuve brouillon";
export const EVAL_BANK_MODAL_EMPTY =
  "Aucune épreuve brouillon. Créez d’abord une épreuve depuis Mes épreuves.";
export const EVAL_BANK_MODAL_CANCEL = "Annuler";
export const EVAL_BANK_MODAL_GO = "Continuer";

/** Composition d’épreuve — `docs/UI-COPY.md` (Page création / édition) */
export const EVAL_COMP_PAGE_TITLE_NEW = "Créer une épreuve";
export const EVAL_COMP_PAGE_TITLE_EDIT = "Modifier l’épreuve";
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
/** Ouvre `/evaluations/[id]/print` (nouvel onglet) après sauvegarde du brouillon — `docs/UI-COPY.md` */
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

/** Étape 1 — Recherche collaborateurs (`docs/UI-COPY.md`) */
export const BLOC1_COLLAB_SEARCH_MIN_CHARS =
  "Saisissez au moins deux caractères pour lancer la recherche.";
export const BLOC1_COLLAB_SEARCH_EMPTY = "Aucun enseignant ne correspond à votre recherche.";
export const BLOC1_COLLAB_SEARCH_LOADING = "Recherche en cours…";
export const BLOC1_COLLAB_SEARCH_PICK_FROM_LIST =
  "Choisissez un collègue dans la liste des résultats.";
export const BLOC1_COLLAB_SEARCH_ALREADY_ADDED =
  "Cette personne figure déjà parmi les collaborateurs.";

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
/** Préfixe du jeton wizard (ex. « Doc 1–4 ») — suivi d’espaces et de chiffres ou d’une plage en cadratin. */
export const NR_ORDRE_WIZARD_DOC_TOKEN_PREFIX = "Doc";
/** Fragments de la phrase publiée (`{{doc_*}}` réécrits à l’impression épreuve). */
export const NR_ORDRE_PUBLISHED_INTRO_LES_DOCUMENTS = "Les documents ";
export const NR_ORDRE_PUBLISHED_INTRO_DOC_PLACEHOLDERS =
  "{{doc_A}}, {{doc_B}}, {{doc_C}} et {{doc_D}}";
export const NR_ORDRE_PUBLISHED_INTRO_PORTENT_SUR = " portent sur ";
export const NR_ORDRE_PUBLISHED_INTRO_SUFFIX =
  ". Classez-les en ordre chronologique. Quelle option (A, B, C ou D) présente la bonne séquence ?";
/** Feuille élève (ordre chronologique) — zone unique pour la lettre A–D. */
export const NR_ORDRE_STUDENT_SHEET_REPONSE_LABEL = "Réponse :";
export const NR_ORDRE_STUDENT_SHEET_OPTIONS_GROUP_ARIA =
  "Options de réponse : quatre suites de numéros de documents";
/**
 * Guidage **élève** (feuille / sommaire / `tae.guidage` publié) — fixe pour l’OI ordre chronologique, non éditable.
 * Distinct de `NR_ORDRE_OPTIONS_HELP` (texte **enseignant** sur la génération des options A–D).
 */
export const NR_ORDRE_STUDENT_GUIDAGE =
  "Cherchez dans chaque document des indices de temps (dates, événements, mots liés à une époque), puis utilisez vos connaissances pour confirmer leur ordre du plus ancien au plus récent.";
/** Bloc 3 ordre chrono — texte sous le titre Guidage complémentaire (formulaire). */
export const NR_ORDRE_GUIDAGE_FORM_LEAD =
  "Ce guidage est prédéterminé pour ce parcours. Il ne peut pas être modifié et sera affiché aux mêmes endroits que pour les autres tâches (fiche, feuille élève selon les options d’impression).";
/** Modale info — guidage fixe ordre chronologique. */
export const NR_ORDRE_GUIDAGE_INFO_MODAL_BODY =
  "Pour l’ordre chronologique, le guidage élève est identique pour toutes les tâches de ce type. Il apparaît dans la section Guidage de la fiche et sur la feuille élève lorsque le guidage est prévu à l’impression.";
export const NR_ORDRE_OPTIONS_SECTION_TITLE = "Options de réponse";
export const NR_ORDRE_OPTIONS_LABEL = "Options de réponse";
export const NR_ORDRE_OPTIONS_HELP =
  "La bonne séquence est calculée à partir des années normalisées des quatre documents (étape « Documents historiques »). En cas d’égalité d’années entre deux documents, vous saisissez la séquence correcte en cases (étape 1), puis vous générez les options. Une seule option correspond à l’ordre chronologique exact.";
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
  "À partir de la bonne séquence (calculée depuis les années des documents, ou saisie manuellement en cas d’égalité d’années), l’outil choisit trois suites incorrectes (sans remise parmi les permutations possibles), mélange les quatre options sous les lettres A à D et indique le corrigé. Utilisez « Régénérer les distracteurs » pour conserver la bonne réponse et tirer de nouveaux distracteurs.";
export const NR_ORDRE_REGENERATE_CTA = "Régénérer les distracteurs";
export const NR_ORDRE_REGENERATE_HELP =
  "La bonne séquence et la justification restent les mêmes ; seuls les trois distracteurs et le mélange des lettres A à D changent.";
export const NR_ORDRE_CORRECT_LABEL = "Corrigé — Lettre exacte";
export const NR_ORDRE_CORRECT_HELP =
  "Après génération des options, la lettre du corrigé est déterminée automatiquement et affichée à l’étape 2.";
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
  "Bon ordre chronologique (documents numérotés 1 à 4 selon l’ordre de saisie) :";
export const NR_ORDRE_BLOC5_YEAR_TIE_WARNING =
  "Deux documents ou plus partagent la même année normalisée. Saisissez ci-dessous la bonne séquence chronologique (une case par position), puis générez les options.";
export const NR_ORDRE_JUSTIFICATION_LABEL = "Justification";
export function NR_ORDRE_BLOC5_YEARS_MISSING_DETAIL(letters: ("A" | "B" | "C" | "D")[]): string {
  if (letters.length === 0) {
    return "Année manquante pour au moins un document.";
  }
  const joined = letters.join(", ");
  return `Année manquante ou invalide pour le ou les documents : ${joined}.`;
}
export const NR_ORDRE_STEP4_TITLE = "Étape 4 · Dossier documentaire";
export const NR_ORDRE_STEP4_DESCRIPTION =
  "Ajoutez quatre documents historiques : pour chacun, le titre, le contenu (texte ou image), la source et le type de source. L’élève repère le temps à partir du document.";

/** Bloc 4 — rappel séquence / correspondance chiffres ↔ documents (`OrdreChronologiqueBloc4SequenceReminder`). */
export const NR_ORDRE_BLOC4_REMINDER_TITLE = "Rappel — séquence chronologique et dossier";
export const NR_ORDRE_BLOC4_REMINDER_LEAD =
  "La bonne suite chronologique retenue est « {{suite}} ». Sur le questionnaire (deuxième feuillet à l’impression), cette suite apparaît sous l’option {{letter}}). Les chiffres 1 à 4 dans les suites correspondent aux documents du dossier (premier feuillet), dans l’ordre de saisie ci-dessous :";
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
 * Guidage **élève** (`tae.guidage`) — fixe pour ce parcours, non éditable par l’enseignant.
 * L’élève relie le **document cible** aux **segments** A, B, C (ou D) de la ligne du temps.
 */
export const NR_LIGNE_TEMPS_STUDENT_GUIDAGE =
  "Repérez dans le document des indices temporels (dates, événements, tournures ou références à une période), puis comparez-les aux segments de la ligne du temps pour choisir la lettre qui correspond à la période où se situent les faits présentés.";
/** Bloc 3 (futur) — texte sous le titre Guidage complémentaire lorsque le parcours ligne du temps sera branché. */
export const NR_LIGNE_TEMPS_GUIDAGE_FORM_LEAD =
  "Ce guidage est prédéterminé pour ce parcours. Il ne peut pas être modifié et sera affiché aux mêmes endroits que pour les autres tâches (fiche, feuille élève selon les options d’impression).";
/** Modale info — guidage fixe ligne du temps. */
export const NR_LIGNE_TEMPS_GUIDAGE_INFO_MODAL_BODY =
  "Pour situer des faits sur une ligne du temps, le guidage élève est identique pour toutes les tâches de ce type. Il apparaît dans la section Guidage de la fiche et sur la feuille élève lorsque le guidage est prévu à l’impression.";

/** Plage de lettres dans la consigne publiée (trois segments). */
export const NR_LIGNE_TEMPS_LETTERS_THREE = "A, B et C";
/** Plage de lettres dans la consigne publiée (quatre segments). */
export const NR_LIGNE_TEMPS_LETTERS_FOUR = "A, B, C et D";
/** Badge — consigne non éditable (texte ministériel). */
export const NR_LIGNE_TEMPS_CONSIGNE_MINISTERIAL_BADGE = "Libellé ministériel fixe";
/** Modale info — consigne fixe (parcours ligne du temps). */
export const NR_LIGNE_TEMPS_CONSIGNE_INFO_MODAL_BODY =
  "Le libellé affiché aux élèves est fixe pour ce comportement. Les numéros de document s’ajustent automatiquement lorsque la tâche est intégrée à une épreuve regroupant plusieurs tâches.";
export const NR_LIGNE_TEMPS_STUDENT_SHEET_TIMELINE_ARIA =
  "Ligne du temps : segments chronologiques et lettres de réponse";
export const NR_LIGNE_TEMPS_BLOC4_INFO =
  "Cette tâche requiert exactement un document cible. L’élève s’en sert pour repérer la période sur la ligne du temps.";
export const NR_LIGNE_TEMPS_GATE_PRE_DOCS =
  "Complétez d’abord les étapes « Paramètres de la tâche » et « Consigne et production attendue » (étapes 2 et 3) pour accéder au dossier documentaire.";
export const NR_LIGNE_TEMPS_GATE_BLOC3 =
  "Complétez et verrouillez l’étape « Paramètres de la tâche » (étape 2) pour configurer la ligne du temps.";
export const NR_LIGNE_TEMPS_STEP4_TITLE = "Étape 4 · Dossier documentaire";
export const NR_LIGNE_TEMPS_STEP4_DESCRIPTION =
  "Ajoutez le document cible : titre, contenu (texte ou image), source et type de source. L’élève identifie la période à partir de ce document.";
export const NR_LIGNE_TEMPS_SEGMENT_COUNT_LABEL = "Nombre de segments";
export const NR_LIGNE_TEMPS_OPTION_3 = "3 segments (A, B, C)";
export const NR_LIGNE_TEMPS_OPTION_4 = "4 segments (A, B, C, D)";
export const NR_LIGNE_TEMPS_DATE_START = "Date de début";
export const NR_LIGNE_TEMPS_DATE_END = "Date de fin";
export const NR_LIGNE_TEMPS_DATE_CHAINED_HINT =
  "La date de fin d’une période est automatiquement la date de début de la suivante.";
export const NR_LIGNE_TEMPS_TIMELINE_PREVIEW_TITLE = "Ligne du temps";
/** Bloc 3 — titre au-dessus de la frise (sans choix du segment). */
export const NR_LIGNE_TEMPS_BLOC3_FRISE_PREVIEW_LEAD = "Aperçu de la frise";
/** Bloc 3 — texte sous le titre (segment corrigé à l’étape 5). */
export const NR_LIGNE_TEMPS_BLOC3_FRISE_PREVIEW_HINT =
  "Le segment correspondant à la période du document cible est choisi à l’étape « Corrigé et options de réponse » (étape 5).";
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
  "Renseignez le segment qui correspond à la période des faits du document cible. Une proposition peut être calculée à partir de l’année normalisée du document (ou de l’année extraite du repère temporel).";
export const NR_LIGNE_TEMPS_BLOC5_GATE =
  "Complétez d’abord la frise à l’étape 3 et le document cible à l’étape 4.";
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
  return `L’année du document (${year}) ne se situe dans aucun segment de la frise. Veuillez vérifier la frise ou choisir un segment manuellement.`;
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
  "Pour chaque option, comparez quels documents se situent avant le repère commun et lesquels s’y situent après, au regard des dates (ou de l’année extraite du repère temporel) par rapport à l’année du repère.";
export const NR_AVANT_APRES_GUIDAGE_FORM_LEAD =
  "Ce guidage est prédéterminé pour ce parcours. Il ne peut pas être modifié et sera affiché aux mêmes endroits que pour les autres tâches (fiche, feuille élève selon les options d’impression).";
export const NR_AVANT_APRES_GUIDAGE_INFO_MODAL_BODY =
  "Pour classer des faits avant ou après un repère, le guidage élève est identique pour toutes les tâches de ce type.";
export const NR_AVANT_APRES_THEME_LABEL = "Thème ou objet d’étude";
export const NR_AVANT_APRES_THEME_HELP =
  "Partie éditable de la consigne : les documents et le repère sont insérés automatiquement à la publication.";
export const NR_AVANT_APRES_THEME_PLACEHOLDER = "objet d’étude ou réalité sociale visée";
export const NR_AVANT_APRES_REPERE_LABEL = "Libellé du repère temporel";
export const NR_AVANT_APRES_REPERE_HELP =
  "Texte affiché comme repère commun au centre du tableau (ex. : une date, un événement).";
export const NR_AVANT_APRES_REPERE_PLACEHOLDER = "ex. : Déclaration de Balfour";
export const NR_AVANT_APRES_ANNEE_LABEL = "Année ou période du repère";
export const NR_AVANT_APRES_ANNEE_HELP =
  "Une année (AAAA) ou une période fermée (AAAA–AAAA, tiret ou tiret cadratin). Comparaison : strictement avant le début → avant le repère ; strictement après la fin → après ; années entre les deux bornes (incluses) → indiquez avant ou après pour chaque document concerné à l’étape suivante.";
export const NR_AVANT_APRES_OVERRIDE_SECTION_TITLE = "Repère sur une année ou une période";
export const NR_AVANT_APRES_OVERRIDE_SECTION_HELP =
  "Si l’année d’un document coïncide avec l’année pivot, ou se situe dans la période début–fin du repère, indiquez s’il doit être traité comme antérieur ou postérieur pour constituer la partition correcte 2 / 2.";
export const NR_AVANT_APRES_OVERRIDE_SLOT_LABEL = "Document {{letter}}";
export const NR_AVANT_APRES_OVERRIDE_AVANT = "Avant le repère";
export const NR_AVANT_APRES_OVERRIDE_APRES = "Après le repère";
export const NR_AVANT_APRES_BLOC5_TITLE = "Corrigé et options de réponse (tableau 4 × 3)";
export const NR_AVANT_APRES_BLOC5_HELP =
  "Générez quatre options (A à D) : une partition correcte et trois distracteurs. Régénérer produit de nouvelles combinaisons.";
export const NR_AVANT_APRES_GENERATE_CTA = "Générer les options A à D";
export const NR_AVANT_APRES_REGENERATE_CTA = "Régénérer les distracteurs";
export const NR_AVANT_APRES_GATE_PRE_DOCS =
  "Complétez d’abord les étapes « Paramètres de la tâche » et « Consigne et production attendue » (étapes 2 et 3).";
export const NR_AVANT_APRES_GATE_BLOC3 = "Renseignez le thème, le repère et l’année du repère.";
export const NR_AVANT_APRES_GATE_BLOC5 =
  "Générez les options de réponse une fois les quatre documents complétés (repère temporel et année comparables).";
export const NR_AVANT_APRES_GEN_ERROR_MISSING_YEAR =
  "Chaque document doit avoir une année comparable (normalisée ou extraite du repère temporel).";
export const NR_AVANT_APRES_GEN_ERROR_TIE =
  "Pour toute année égale à celle du repère, choisissez « Avant » ou « Après » dans la section dédiée.";
export const NR_AVANT_APRES_GEN_ERROR_PARTITION =
  "La partition correcte doit comporter exactement deux documents avant le repère et deux après. Ajustez les documents ou les choix d’égalité.";
export const NR_AVANT_APRES_STUDENT_SHEET_OPTIONS_GROUP_ARIA =
  "Options de réponse : avant, repère, après";
export const NR_AVANT_APRES_STUDENT_SHEET_REPONSE_LABEL = "Réponse :";
/** En-têtes du tableau **feuille élève / impression** uniquement (pivot au centre, sans titre au milieu). */
export const NR_AVANT_APRES_STUDENT_SHEET_TABLE_COL_AVANT = "Avant";
export const NR_AVANT_APRES_STUDENT_SHEET_TABLE_COL_APRES = "Après";
/** Libellé masqué visuellement : colonne centrale du tableau (repère affiché dans les lignes). */
export const NR_AVANT_APRES_STUDENT_SHEET_TABLE_REPERE_TH_SR = "Repère de comparaison";
export const NR_AVANT_APRES_PUBLISHED_INTRO_PREFIX =
  "Les documents {{doc_A}}, {{doc_B}}, {{doc_C}} et {{doc_D}} font référence à ";
export const NR_AVANT_APRES_PUBLISHED_INTRO_MIDDLE =
  "{{theme}}. Les faits qui y sont présentés se déroulent avant ou après {{repere}} ({{annee}}). ";
export const NR_AVANT_APRES_PUBLISHED_INTRO_SUFFIX =
  "Quelle lettre (A, B, C ou D) présente les numéros des documents à l’endroit approprié ?";
/** Wizard Bloc 5 — aperçu enseignant (libellés explicites). */
export const NR_AVANT_APRES_TABLE_COL_AVANT = "Avant le repère";
export const NR_AVANT_APRES_TABLE_COL_REPERE = "Repère";
export const NR_AVANT_APRES_TABLE_COL_APRES = "Après le repère";
export const NR_AVANT_APRES_JUSTIFICATION_AUTO =
  "Réponse {{correctLetter}} : documents antérieurs au repère : {{avantDocs}} ; postérieurs : {{apresDocs}}.";
export const NR_AVANT_APRES_BLOC4_INFO =
  "Quatre documents sont requis, chacun avec un repère temporel permettant d’en extraire ou de renseigner l’année.";
export const NR_AVANT_APRES_BLOC4_REMINDER_TITLE = "Rappel — repère et années";
export const NR_AVANT_APRES_BLOC4_GATE_BLOC3 =
  "Complétez d’abord le thème, le repère et l’année du repère à l’étape précédente.";
export const NR_AVANT_APRES_STEP4_TITLE = "Étape 4 · Dossier documentaire";
export const NR_AVANT_APRES_STEP4_DESCRIPTION =
  "Complétez les quatre documents (titre, source, contenu, repère temporel, année si utile).";
export const NR_AVANT_APRES_CONSIGNE_MINISTERIAL_BADGE = "Consigne structurée";
export const NR_AVANT_APRES_CONSIGNE_INFO_MODAL_BODY =
  "Le thème, le libellé du repère et l’année du repère structurent la consigne publiée ; le tableau des options est généré à l’étape 5.";
export const TOAST_TAE_NR_AVANT_APRES_HYDRATE_INVALID =
  "Les données structurées de cette tâche (avant / après) sont illisibles. Vous pouvez republier depuis le wizard.";

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
export const PERSP_BLOC3_CONTEXTE_HINT = "Décrivez brièvement l’enjeu historique et la période.";
export const PERSP_BLOC4_ACTEUR_LABEL = "Acteur ou historien";
export const PERSP_BLOC4_ACTEUR_PLACEHOLDER = "Ex\u00a0: François de Lévis, général français";
export const PERSP_BLOC4_EXTRAIT_LABEL = "Extrait";
export const PERSP_BLOC4_SOURCE_LABEL = "Source";
/** Bloc 5 — corrigé intrus (3.5). */
export const PERSP_BLOC5_INTRUS_LABEL =
  "Quel est l’acteur ou historien dont le point de vue est différent\u00a0?";
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

/** Grille d’évaluation — `outil_evaluation` sans entrée dans `grilles-evaluation.json` (`docs/UI-COPY.md`). */
export function copyGrilleAbsentePourOutil(outilId: string): string {
  return `Grille non disponible pour l'outil ${outilId}.`;
}
