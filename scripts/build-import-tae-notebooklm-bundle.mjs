/**
 * Regénère `public/data/import-tae-notebooklm-bundle.json` en embarquant une copie
 * des opérations intellectuelles depuis `public/data/oi.json` (lecture seule).
 *
 * Règle dépôt : les JSON `public/data/` qui fondent l'app sont immuables (voir
 * docs/DECISIONS.md). Enrichir ce bundle (ou ce script, hors recopie OI) pour
 * NotebookLM / garde-fous — ne pas altérer les référentiels sources.
 *
 * Usage : `node scripts/build-import-tae-notebooklm-bundle.mjs`
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const oiPath = join(root, "public", "data", "oi.json");
const outPath = join(root, "public", "data", "import-tae-notebooklm-bundle.json");

const operations_intellectuelles = JSON.parse(readFileSync(oiPath, "utf8"));

/** Gabarit OI1 / 1.3 — 4 documents textuels ; tous niveaux_ids = [tae.niveau_id], disciplines_ids = [tae.discipline_id]. */
const referencePayloadOi13ImportableCapRouge = {
  auteur_id: null,
  connaissances_hors_rpc: [
    {
      realite_sociale: "L'expérience des Autochtones et le projet de colonie",
      section: "Exploration et occupation du territoire par les Français",
      sous_section: "La présence française en Amérique",
      enonce: "Colonie de peuplement sur le cap Rouge (1541-1543)",
    },
  ],
  tae: {
    conception_mode: "seul",
    oi_id: "OI1",
    comportement_id: "1.3",
    cd_id: null,
    connaissances_ids: [],
    consigne:
      "<p>Les documents présentés portent sur les explorations et les tentatives de colonisation européennes. Classez-les par rapport au repère temporel commun.</p>",
    guidage: "<p>Repérez les dates de chaque document par rapport à la période 1541–1543.</p>",
    corrige: "A",
    nb_lignes: 0,
    niveau_id: 3,
    discipline_id: 3,
    aspects_societe: ["Politique", "Territorial"],
    non_redaction_data: {
      schemaVersion: 1,
      theme: "Explorations et colonisation européenne",
      repere: "Colonie de peuplement sur le cap Rouge",
      anneeRepere: 1541,
      anneeRepereFin: 1543,
      overrides: {},
      optionRows: [
        {
          letter: "A",
          avantSlots: ["doc_A", "doc_B"],
          apresSlots: ["doc_C", "doc_D"],
        },
        {
          letter: "B",
          avantSlots: ["doc_A", "doc_C"],
          apresSlots: ["doc_B", "doc_D"],
        },
        {
          letter: "C",
          avantSlots: ["doc_A", "doc_D"],
          apresSlots: ["doc_B", "doc_C"],
        },
        {
          letter: "D",
          avantSlots: ["doc_B", "doc_C"],
          apresSlots: ["doc_A", "doc_D"],
        },
      ],
      correctLetter: "A",
      justification:
        "Réponse A : documents antérieurs à la période : {{doc_A}} et {{doc_B}} ; postérieurs : {{doc_C}} et {{doc_D}}.",
      generated: true,
    },
  },
  documents_new: [
    {
      titre: "Exploration de Jean Cabot près de Terre-Neuve",
      type: "textuel",
      contenu:
        "<p>Jean Cabot et son équipage naviguent près des côtes de Terre-Neuve en <strong>1497</strong>.</p>",
      image_url: null,
      source_citation: "© Source pédagogique (exemple)",
      niveaux_ids: [3],
      disciplines_ids: [3],
      aspects_societe: ["Économique"],
      connaissances_ids: [],
      source_type: "secondaire",
      repere_temporel: "1497",
      annee_normalisee: 1497,
    },
    {
      titre: "Jacques Cartier à Gaspé",
      type: "textuel",
      contenu: "<p>Jacques Cartier élève une croix à Gaspé en <strong>1534</strong>.</p>",
      image_url: null,
      source_citation: "© Source pédagogique (exemple)",
      niveaux_ids: [3],
      disciplines_ids: [3],
      aspects_societe: ["Politique", "Territorial"],
      connaissances_ids: [],
      source_type: "secondaire",
      repere_temporel: "1534",
      annee_normalisee: 1534,
    },
    {
      titre: "Port-Royal en Acadie",
      type: "textuel",
      contenu: "<p>Fondation de l'habitation de Port-Royal en <strong>1605</strong>.</p>",
      image_url: null,
      source_citation: "© Source pédagogique (exemple)",
      niveaux_ids: [3],
      disciplines_ids: [3],
      aspects_societe: ["Politique", "Territorial"],
      connaissances_ids: [],
      source_type: "secondaire",
      repere_temporel: "1605",
      annee_normalisee: 1605,
    },
    {
      titre: "Champlain et les Autochtones",
      type: "textuel",
      contenu: "<p>Samuel de Champlain explore le territoire en <strong>1608</strong>.</p>",
      image_url: null,
      source_citation: "© Source pédagogique (exemple)",
      niveaux_ids: [3],
      disciplines_ids: [3],
      aspects_societe: ["Politique", "Social"],
      connaissances_ids: [],
      source_type: "secondaire",
      repere_temporel: "1608",
      annee_normalisee: 1608,
    },
  ],
  slots: [
    { slot: "doc_A", ordre: 0, mode: "create", newIndex: 0 },
    { slot: "doc_B", ordre: 1, mode: "create", newIndex: 1 },
    { slot: "doc_C", ordre: 2, mode: "create", newIndex: 2 },
    { slot: "doc_D", ordre: 3, mode: "create", newIndex: 3 },
  ],
  collaborateurs_user_ids: [],
};

/** Gabarit OI7 / 7.1 — 3 documents, rédactionnel, sans non_redaction_data ; COPIE [3],[3] partout comme tae. */
const referencePayloadOi71Importable = {
  auteur_id: null,
  connaissances_hors_rpc: [
    {
      realite_sociale: "La Conquête et le changement d'empire",
      section: "La Province de Québec sous le régime britannique",
      sous_section: "Mouvements migratoires et composition de la population",
      enonce: "Loyalistes",
    },
  ],
  tae: {
    conception_mode: "seul",
    oi_id: "OI7",
    comportement_id: "7.1",
    cd_id: null,
    connaissances_ids: [],
    consigne: "<p>Exemple : expliquez l'enchaînement logique entre des faits (consigne HTML).</p>",
    guidage: "<p>Reliez les documents dans un ordre causal cohérent.</p>",
    corrige: "<p>Corrigé type HTML pour l'enseignant.</p>",
    nb_lignes: 10,
    niveau_id: 3,
    discipline_id: 3,
    aspects_societe: ["Politique", "Social"],
  },
  documents_new: [
    {
      titre: "Document A — textuel (exemple)",
      type: "textuel",
      contenu: "<p>Fait amorcé en <strong>1783</strong>.</p>",
      image_url: null,
      source_citation: "Source (exemple)",
      niveaux_ids: [3],
      disciplines_ids: [3],
      aspects_societe: ["Politique"],
      connaissances_ids: [],
      source_type: "primaire",
      repere_temporel: "1783",
      annee_normalisee: 1783,
    },
    {
      titre: "Document B — iconographique (exemple)",
      type: "iconographique",
      contenu: "<p>Description / légende de l'image à téléverser après import.</p>",
      image_url: null,
      source_citation: "© Exemple",
      niveaux_ids: [3],
      disciplines_ids: [3],
      aspects_societe: ["Social"],
      connaissances_ids: [],
      source_type: "secondaire",
      repere_temporel: "1784",
      annee_normalisee: 1784,
    },
    {
      titre: "Document C — textuel (exemple)",
      type: "textuel",
      contenu: "<p>Effet ou conséquence en <strong>1785</strong>.</p>",
      image_url: null,
      source_citation: "Source (exemple)",
      niveaux_ids: [3],
      disciplines_ids: [3],
      aspects_societe: ["Social"],
      connaissances_ids: [],
      source_type: "secondaire",
      repere_temporel: "1785",
      annee_normalisee: 1785,
    },
  ],
  slots: [
    { slot: "doc_A", ordre: 0, mode: "create", newIndex: 0 },
    { slot: "doc_B", ordre: 1, mode: "create", newIndex: 1 },
    { slot: "doc_C", ordre: 2, mode: "create", newIndex: 2 },
  ],
  collaborateurs_user_ids: [],
};

const bundle = {
  bundle_version: "2.3.0",
  bundle_meta: {
    app: "ÉduQc.IA",
    principe_fichier_autonome_fr:
      "Toutes les instructions utiles à la génération d'un JSON d'import sont DANS ce fichier. Ne pas compter sur un prompt externe : le modèle doit suivre strategie_double_ceinture_bretelles_fr, protocole_sortie_notebooklm_fr, regles_non_negociables_fr, passe_verification_obligatoire_avant_sortie_fr, checklist_json_importable_fr et les gabarits reference_payload_*.",
    description:
      "Bundle pour outils externes (NotebookLM, etc.) : référentiels OI + règles + gabarits de payload `publish_tae_transaction`. Une seule TAÉ par JSON ; pas une épreuve.",
    scope: "PublishTaeRpcPayload — `lib/tae/publish-tae-types.ts`",
    auteur_id_a_limport:
      "`auteur_id` peut être `null` dans le JSON généré ; l'application injecte l'UUID de l'enseignant connecté avant la RPC.",
    oi_json_source: "public/data/oi.json",
    public_data_referentiels_policy:
      "Référentiels public/data/ immuables sauf nécessité absolue — docs/DECISIONS.md. Régénération : node scripts/build-import-tae-notebooklm-bundle.mjs",
    instructions_lecture_fr: [
      "1) Lire strategie_double_ceinture_bretelles_fr, protocole_sortie_notebooklm_fr et alerte_ancrage_chiffres_manuel_fr (obligatoires).",
      "2) Lire regles_non_negociables_fr, constantes_a_propager_fr et erreurs_frequentes_notebooklm_fr.",
      "3) Consulter niveaux, disciplines, document_types_autorises et document_types_interdits_llm_fr.",
      "4) Choisir oi_id / comportement_id dans operations_intellectuelles ; noter nb_documents (peut être null), nb_lignes.",
      "5) Rédiger un brouillon JSON en tête ; exécuter passe_verification_obligatoire_avant_sortie_fr ; corriger jusqu'à ce que TOUS les points soient OK.",
      "6) Si comportement 1.3 : non_redaction_avant_apres + reference_payload_oi13_importable_cap_rouge.",
      "7) Si rédactionnel (ex. 7.1, 5.2) : reference_payload_oi7_71_importable comme structure — pas de tae.non_redaction_data.",
      "8) Émettre UNE SEULE réponse : l'objet JSON final (après passe OK) — voir instruction_sortie_modele_fr.",
    ],
  },

  /** Approche bundle (discipline LLM) + approche app (normalisation déterministe) — les deux actives. */
  strategie_double_ceinture_bretelles_fr: {
    resume:
      "Deux lignes de défense : (1) Ce bundle impose les valeurs canoniques françaises et une vérification stricte avant sortie — réduit les erreurs à la source. (2) L'application applique en plus une normalisation déterministe des alias LLM courants (anglais) sur documents_new[].type avant validation / RPC — voir normalisation_cote_app_fr. Le modèle doit quand même viser le français exact : la normalisation n'est pas une excuse pour produire du JSON anglais.",
    approche_3_bundle_fr:
      "Garde-fou documentaire : passes V1–V13, erreurs fréquentes, enums listées — forcer la correspondance caractère par caractère avec document_types_autorises (pas textual / iconographic).",
    approche_2_app_fr:
      "Tolérance à la frontière : parseur serveur `lib/tae/import/normalize-llm-aliases.ts` mappe textual→textuel, iconographic→iconographique (liste fermée). Les données en base restent strictement en français.",
  },

  normalisation_cote_app_fr: {
    reference_code: "lib/tae/import/normalize-llm-aliases.ts",
    description:
      "Après parsing JSON, l'importateur peut appeler normalizeDocumentsNewTypesFromLlm sur documents_new pour corriger les alias anglais les plus fréquents avant validateTaeImportVsOi et la RPC. Cela complète le bundle ; ce n'est pas documenté comme valeur alternative officielle dans ce fichier — les gabarits restent 100 % français.",
  },

  protocole_sortie_notebooklm_fr: {
    obligation_fr:
      "Interdiction d'émettre le moindre caractère de la réponse utilisateur tant que la passe_verification_obligatoire_avant_sortie_fr n'a pas été exécutée sur le brouillon COMPLET et que chaque point n'est pas validé. La réponse visible ne contient que le JSON importable (pas de section « vérification », pas de markdown). La vérification est INTERNE (brouillon mental ou brouillon non montré), puis correction du brouillon si échec, puis une seule sortie JSON.",
    phases_fr: [
      "Phase A — Construire un brouillon complet de l'objet racine (toutes les clés, tous les documents, tous les slots). Fixer en premier tae.niveau_id et tae.discipline_id ; noter CONST_N = tae.niveau_id et CONST_D = tae.discipline_id (voir constantes_a_propager_fr).",
      "Phase B — OBLIGATOIRE : parcourir passe_verification_obligatoire_avant_sortie_fr dans l'ordre, point par point. Si un point échoue : corriger le brouillon, recommencer Phase B depuis le début. Répéter jusqu'à succès intégral.",
      "Phase C — Copier le brouillon validé vers la réponse finale : un seul objet JSON, UTF-8, guillemets doubles, sans texte avant ni après.",
    ],
    rappel_fr:
      "Ne pas inférer niveau_id ou discipline_id depuis le contenu du manuel (chapitre, « niveau » du livre, thème). Ces champs sont des identifiants techniques de la fiche TAÉ : ils se recopient mécaniquement sur chaque document.",
  },

  constantes_a_propager_fr: [
    "Après avoir choisi tae.niveau_id et tae.discipline_id, traiter CONST_N = tae.niveau_id et CONST_D = tae.discipline_id comme des constantes immuables pour CE payload.",
    "Pour chaque index i de documents_new : forcer niveaux_ids à [CONST_N] et disciplines_ids à [CONST_D] — même si le PDF parle de « Secondaire 1 », « Chapitre 1 », « Source 5 », etc.",
    "Ne jamais remplacer CONST_N ou CONST_D par un chiffre tiré du titre du chapitre, du numéro de source ou d'une supposition pédagogique.",
  ],

  alerte_ancrage_chiffres_manuel_fr: [
    "« Chapitre 1 », « Partie 2 », « Document 18 » : ce sont des repères éditoriaux du manuel — PAS des valeurs pour niveau_id ni discipline_id.",
    "« Source 5 » ou numéro de question : ne pas mapper ce chiffre vers niveaux_ids ou disciplines_ids.",
    "Si le texte dit « Secondaire 1 » au sens programme mais la tâche est en Sec 3 HQC : niveau_id reste celui de la tâche (ex. 3), pas 1 — sauf si l'enseignant a explicitement choisi Sec 1 dans tae (alors tous les documents en [1]).",
  ],

  regles_non_negociables_fr: [
    "RÈGLE 1 (la plus violée par les LLM) : Pour CHAQUE entrée de documents_new, niveaux_ids doit être EXACTEMENT le tableau [tae.niveau_id] et disciplines_ids EXACTEMENT [tae.discipline_id]. Interdit : tae en 3/3 et un document en [1]/[1] ou tout autre mélange.",
    "RÈGLE 2 : Choisir d'abord tae.niveau_id et tae.discipline_id (ids valides dans les tableaux niveaux et disciplines de ce bundle). Ensuite RECOPIER ces deux nombres dans chaque document — pas l'inverse.",
    "RÈGLE 3 : oi_id et comportement_id existent ensemble dans operations_intellectuelles ; nb_lignes aligné sur l'entrée ; si nb_documents est un nombre, documents_new.length doit égaler ce nombre ; si nb_documents est null, la taille de documents_new doit correspondre à l'énoncé (ex. « quatre faits » → 4) et slots doit avoir autant d'entrées.",
    "RÈGLE 4 : Un slot doc_X par document, mode create, newIndex = index dans documents_new (0 à n-1), ordre recommandé 0 à n-1.",
    "RÈGLE 5 : Chaque document a repere_temporel et/ou annee_normalisee (entier) — obligatoire pour toute logique de dates ; le HTML seul ne suffit pas.",
    "RÈGLE 6 : type iconographique avec image_url null = l'enseignant téléversera l'image après import ; l'app détecte type + null pour afficher les zones d'upload.",
    "RÈGLE 7 : Si tae.connaissances_ids est [] alors connaissances_hors_rpc doit contenir au moins un objet aux libellés verbatim du programme (pas d'id inventé).",
    "RÈGLE 8 : Racine JSON = auteur_id, connaissances_hors_rpc (si connaissances_ids vide), tae, documents_new, slots, collaborateurs_user_ids — pas d'enveloppe publish_payload ; pas de clé import_notes_fr (retirée du contrat bundle).",
    "RÈGLE 9 : documents_new[i].type doit être exactement la chaîne française « textuel » ou « iconographique » (enum Postgres / app). INTERDIT : textual, iconographic, iconographical, image, etc. — glissement anglais fréquent des LLM malgré document_types_autorises.",
  ],

  erreurs_frequentes_notebooklm_fr: [
    "Mélanger niveau/discipline : mettre tae.niveau_id 3 (Sec 3 HQC) mais documents_new[..].niveaux_ids [1] — FAUX. Toujours [tae.niveau_id] sur chaque document.",
    "Confondre Chapitre 1 / Source 5 avec niveau_id 1 — voir alerte_ancrage_chiffres_manuel_fr.",
    "Utiliser « textual » ou « iconographic » (anglais) au lieu de « textuel » / « iconographique » — les tokens sont proches mais la RPC exige le français exact ; voir RÈGLE 9 et V12. L'app peut corriger en import, mais le modèle doit viser le canon français.",
    "Oublier non_redaction_data pour 1.3 ou l'inventer pour un comportement rédactionnel — voir taches_nr_vs_redactionnel_fr.",
    "Inventer des ids 5, 6 pour niveaux ou disciplines — seuls les ids du bundle existent.",
    "Nombre de documents ou slots incohérent avec nb_documents ou avec l'énoncé du comportement lorsque nb_documents est null.",
  ],

  /** Passe bloquante : ordre fixe ; tout point doit être OK avant Phase C (sortie). */
  passe_verification_obligatoire_avant_sortie_fr: [
    "V1 — J'ai lu alerte_ancrage_chiffres_manuel_fr : aucun niveau_id/discipline_id des documents ne provient d'un numéro de chapitre ou de source du PDF.",
    "V2 — CONST_N et CONST_D : je confirme que pour tout i, documents_new[i].niveaux_ids est exactement [CONST_N] avec CONST_N === tae.niveau_id, et documents_new[i].disciplines_ids est exactement [CONST_D] avec CONST_D === tae.discipline_id (tableaux d'un seul élément, même ordre [x] pas x).",
    "V3 — Comptage : slots.length === documents_new.length ; chaque slot a mode create ; newIndex est 0..n-1 et chaque index 0..n-1 apparaît une fois.",
    "V4 — OI : le couple (tae.oi_id, tae.comportement_id) existe dans operations_intellectuelles ; tae.nb_lignes égale nb_lignes de cette entrée.",
    "V5 — Documents : si nb_documents est un nombre dans cette entrée, documents_new.length === nb_documents. Si nb_documents est null, documents_new.length est cohérent avec l'énoncé (ex. quatre faits → 4) et avec le nombre de slots.",
    "V6 — Chaque document a repere_temporel non vide et/ou annee_normalisee (nombre) renseigné pour les besoins de dates.",
    "V7 — Si comportement_id est 1.3 : tae.non_redaction_data est présent avec generated true, 4 optionRows, schéma conforme à non_redaction_avant_apres. Sinon : tae.non_redaction_data absent.",
    "V8 — Si tae.connaissances_ids est [] : connaissances_hors_rpc a au moins un objet aux quatre champs PDA (verbatim).",
    "V9 — aspects_societe (tae et documents) : uniquement des chaînes présentes dans aspects_societe_valeurs_autorisees (accents inclus).",
    "V10 — auteur_id est null ou une chaîne UUID ; conception_mode est seul ou equipe ; collaborateurs_user_ids est [] si seul.",
    "V11 — Racine : pas de clé publish_payload ni import_notes_fr (hors contrat) ; JSON syntaxiquement valide (pas de commentaire //, pas de trailing comma).",
    "V12 — Enum type document (français strict) : pour chaque i, documents_new[i].type est exactement « textuel » ou « iconographique » (orthographe exacte, voir document_types_autorises). Comparaison caractère par caractère — pas textual, iconographic, ni majuscules anglaises (Textual). Si doute, recopier la chaîne depuis les gabarits reference_payload_*.",
    "V13 — Relecture finale : je re-parcours V2 uniquement (alignement CONST_N/CONST_D) sur chaque document — c'est l'échec le plus fréquent des LLM.",
  ],

  verification_finale_obligatoire_fr: [
    "Alias de contrôle : même contenu que passe_verification_obligatoire_avant_sortie_fr — utiliser la passe numérotée V1..V13 comme checklist officielle avant toute sortie.",
  ],

  synthese_cles_racine_payload: {
    auteur_id: "null ou UUID string",
    connaissances_hors_rpc:
      "objet[] — PDA verbatim si connaissances_ids est [] ; retiré avant RPC après résolution",
    tae: "objet tâche (consigne, guidage, corrige, niveau_id, discipline_id, …)",
    documents_new: "tableau des documents à créer",
    slots: "liaison doc_A… → create + newIndex",
    collaborateurs_user_ids: "UUID[] ; [] si conception_mode seul",
  },

  flux_televersement_images_fr: {
    resume:
      "image_url null sur un document type iconographique signifie : pas encore de fichier en stockage. L'importateur affichera une synthèse du type « N document(s) iconographique(s) sans image (ex. A, C) — téléversez ici ». Après upload, l'app enregistre une URL https publique Supabase (c'est le résultat normal du téléversement, pas une URL externe collée à la main). Ne pas ajouter de clé import_notes_fr pour cela.",
  },

  taches_nr_vs_redactionnel_fr: {
    non_redaction_data:
      "Présent UNIQUEMENT pour les comportements non rédactionnels structurés (ex. OI1 — 1.3 avant/après). Voir non_redaction_avant_apres et reference_payload_oi13_importable_cap_rouge.",
    redactionnel:
      "Pour OI7 — 7.1, OI5 — 5.2, OI0 — 0.1, etc. : pas de clé tae.non_redaction_data. consigne / guidage / corrige en HTML (ou texte) comme dans reference_payload_oi7_71_importable (structure rédactionnelle, sans bloc NR).",
  },

  checklist_json_importable_fr: [
    "Avant tout : protocole_sortie_notebooklm_fr (Phase B = passe_verification_obligatoire_avant_sortie_fr) entièrement OK.",
    "Ne pas inclure import_notes_fr (retiré du bundle ; évite les notes erronées type « règle vérifiée »).",
    "COPIER tae.niveau_id et tae.discipline_id dans CHAQUE documents_new[..].niveaux_ids et .disciplines_ids (tableaux singletons) — jamais déduit du « Chapitre 1 » ou du numéro de source.",
    "Un seul objet racine ; pas d'enveloppe publish_payload.",
    "auteur_id : null ou UUID string (jamais nombre).",
    "tae.conception_mode : seul ou equipe ; collaborateurs_user_ids = [] si seul.",
    "tae.oi_id + comportement_id dans operations_intellectuelles ; nb_lignes aligné ; documents + slots cohérents avec nb_documents ou énoncé si nb_documents null.",
    "Aspects : uniquement aspects_societe_valeurs_autorisees (accents exacts).",
    "documents_new[..].type : uniquement textuel ou iconographique (français exact) — V12 ; pas textual / iconographic (l'app peut corriger, le modèle doit viser le canon).",
    "JSON UTF-8 valide, guillemets doubles, pas de commentaires //.",
  ],

  anti_pièges_rpc: [
    "Voir regles_non_negociables_fr — elles priment.",
    "Ne pas ajouter import_notes_fr : ce champ n'existe plus dans le contrat bundle ; l'app n'en a pas besoin pour la RPC.",
    "Type document : jamais textual / iconographic (anglais) — seulement textuel / iconographique. Voir document_types_interdits_llm_fr et normalisation_cote_app_fr.",
    "conception_mode : seul | equipe uniquement.",
    "Iconographique : image_url null acceptable dans le JSON d'import ; publication complète après téléversement.",
    "1.3 : anneeRepere nombre ou chaîne AAAA–AAAA ; période inclusive — voir non_redaction_avant_apres.",
  ],

  document_types_interdits_llm_fr: [
    "textual — utiliser textuel",
    "iconographic — utiliser iconographique",
    "iconographical — utiliser iconographique",
    "Toute autre valeur (image, text, etc.) — non reconnue par l'enum applicative",
  ],

  cles_a_retirer_avant_appel_rpc: ["connaissances_hors_rpc"],

  post_import_comportement_cible_app: {
    resume:
      "Parser → normaliser alias LLM sur documents_new[].type (normalize-llm-aliases) → retirer connaissances_hors_rpc après résolution → connaissances_ids → validateTaeImportVsOi → injecter auteur_id → synthèse lacunes (images, etc.) → complétion → RPC.",
    reference_backlog: "docs/BACKLOG.md — Import JSON TAÉ (NotebookLM)",
  },

  instruction_sortie_modele_fr:
    "OBLIGATION : exécuter protocole_sortie_notebooklm_fr (Phases A→B→C). Phase B = passe_verification_obligatoire_avant_sortie_fr (V1..V13) au complet ; en cas d'échec d'un point Vi, corriger le brouillon et recommencer Phase B depuis V1. Réponse utilisateur : UN SEUL objet JSON (résultat de Phase C), sans markdown, sans ligne « V1 OK », sans bloc de vérification — uniquement le payload importable. Toute la norme est dans ce fichier ; viser le français canon (types textuel / iconographique) même si l'app normalise certains alias.",

  aspects_societe_valeurs_autorisees: [
    "Économique",
    "Politique",
    "Social",
    "Culturel",
    "Territorial",
  ],
  document_types_autorises: ["textuel", "iconographique"],
  slots_documents_autorises: ["doc_A", "doc_B", "doc_C", "doc_D"],
  conception_mode_autorise: ["seul", "equipe"],

  niveaux: [
    { id: 1, code: "sec1", label: "Secondaire 1" },
    { id: 2, code: "sec2", label: "Secondaire 2" },
    { id: 3, code: "sec3", label: "Secondaire 3" },
    { id: 4, code: "sec4", label: "Secondaire 4" },
  ],
  disciplines: [
    { id: 1, code: "HEC", label: "Histoire et éducation à la citoyenneté" },
    { id: 2, code: "GEO", label: "Géographie et éducation à la citoyenneté" },
    { id: 3, code: "HQC", label: "Histoire du Québec et du Canada" },
  ],
  avertissement_ids:
    "Ids niveaux/disciplines = seed supabase/schema.sql ; vérifier sur l'instance réelle si besoin.",

  non_redaction_avant_apres: {
    pour_comportement_id: "1.3",
    reference_code: "lib/tae/non-redaction/avant-apres-payload.ts",
    champs_attendus: [
      "schemaVersion (1)",
      "theme",
      "repere",
      "anneeRepere (nombre OU chaîne « AAAA–AAAA »)",
      "anneeRepereFin (optionnel)",
      "overrides (si années dans la période ou sur une borne)",
      "optionRows (4 lignes, partitions complémentaires 2+2)",
      "correctLetter",
      "justification",
      "generated: true",
    ],
    regle_periode:
      "Avant période : année < début ; après : année > fin ; entre les bornes (inclus) : overrides par document.",
    note: "Pas de schéma JSON inventé (ex. chronologie_pivot).",
  },

  connaissances_hors_rpc: {
    cle_json: "connaissances_hors_rpc",
    description:
      "Tableau d'objets { realite_sociale, section, sous_section, enonce } — libellés verbatim du programme. Obligatoire si connaissances_ids est [].",
    schema_element: {
      realite_sociale: "string — verbatim",
      section: "string — verbatim",
      sous_section: "string | null",
      enonce: "string — verbatim",
    },
    exemple_cap_rouge_oi13: referencePayloadOi13ImportableCapRouge.connaissances_hors_rpc,
  },

  reference_payload_oi13_importable_cap_rouge: referencePayloadOi13ImportableCapRouge,
  reference_payload_oi7_71_importable: referencePayloadOi71Importable,

  publish_payload_example: {
    auteur_id: null,
    connaissances_hors_rpc: [],
    tae: {
      conception_mode: "seul",
      oi_id: "OI7",
      comportement_id: "7.1",
      cd_id: null,
      connaissances_ids: [],
      consigne: "<p></p>",
      guidage: "",
      corrige: "",
      nb_lignes: 10,
      niveau_id: 4,
      discipline_id: 3,
      aspects_societe: ["Politique"],
    },
    documents_new: [
      {
        titre: "",
        type: "textuel",
        contenu: "<p></p>",
        image_url: null,
        source_citation: "",
        niveaux_ids: [4],
        disciplines_ids: [3],
        aspects_societe: ["Politique"],
        connaissances_ids: [],
        source_type: "secondaire",
        repere_temporel: "",
        annee_normalisee: null,
      },
    ],
    slots: [{ slot: "doc_A", ordre: 0, mode: "create", newIndex: 0 }],
    collaborateurs_user_ids: [],
  },

  operations_intellectuelles,
};

writeFileSync(outPath, `${JSON.stringify(bundle, null, 2)}\n`, "utf8");
console.log("Wrote", outPath);
