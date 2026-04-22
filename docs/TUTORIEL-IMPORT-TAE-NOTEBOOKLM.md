# Tutoriel — Importer une TAÉ sans passer par le wizard (NotebookLM / outil LLM)

Ce document s’adresse à l’**enseignant** ou au **contributeur** qui souhaite produire un **JSON d’import** pour ÉduQc.IA à partir de sources pédagogiques (épreuves, dossiers documentaires), **sans** recréer la tâche étape par étape dans le wizard.

> **État produit :** le **fichier bundle** et le **code d’import** (`lib/tache/import/`) sont en place ; le **parcours applicatif** dédié (dépôt de fichier dans l’app, rapport de lacunes, publication en un clic) est décrit au **[BACKLOG.md](./BACKLOG.md)** (entrée « Import JSON TAÉ »). Ce tutoriel décrit la **méthode par cahier NotebookLM** (ou équivalent) **dès maintenant**.

---

## Idée générale : deux piliers

Pour obtenir un JSON **fiable**, il faut la **synergie** entre :

1. **Le logic-bundle** — `public/data/import-tache-notebooklm-bundle.json` : règles techniques, référentiels et protocole de vérification.
2. **Les référentiels ministériels (PDF obligatoires)** — progression / programme (PDA–PFEQ) pour les libellés **verbatim** de `connaissances_hors_rpc`, et **Précisions sur les outils d’évaluation** pour cadrer **OI / comportements** et la cohérence avec l’épreuve.
3. **Les documents de l’épreuve** — questionnaire, corrigé, dossier documentaire : matière brute (consigne, documents, dates).

Sans le bundle, le modèle invente la structure. **Sans les PDF ministériels listés ci-dessous**, le remplissage du PDA et le choix de comportement restent **non fiables**. Sans les PDF d’épreuve, il manque le contenu propre à la tâche.

---

## 1. Le fichier `import-tache-notebooklm-bundle.json` — manuel d’opérations techniques

Ce fichier est la **source de vérité** pour tout outil externe (ex. **NotebookLM**) auquel vous donnez le rôle de **générer un seul objet JSON** prêt pour un import ultérieur dans l’app.

Il contient notamment :

| Élément                                              | Rôle                                                                                                                                                                                                            |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`regles_non_negociables_fr`**                      | Contraintes structurelles, dont l’alignement **`tae.niveau_id` / `tae.discipline_id`** avec **`documents_new[].niveaux_ids` / `disciplines_ids`** (singletons identiques sur chaque document).                  |
| **Référentiels fermés**                              | `niveaux`, `disciplines`, `aspects_societe_valeurs_autorisees`, **`document_types_autorises`** (`textuel`, `iconographique` — **français exact**, pas `textual` / `iconographic`).                              |
| **`operations_intellectuelles`**                     | Copie de `public/data/oi.json` : choix de **`oi_id`**, **`comportement_id`**, **`nb_lignes`**, **`nb_documents`** (ou cohérence avec l’énoncé si `nb_documents` est `null`).                                    |
| **`passe_verification_obligatoire_avant_sortie_fr`** | Checklist **V1 à V13** à appliquer **sur un brouillon complet** avant d’émettre la réponse ; relecture finale des ids (**V13**) et des types document (**V12**).                                                |
| **`strategie_double_ceinture_bretelles_fr`**         | Rappel : le bundle impose le **canon français** ; l’application peut en plus **normaliser** certains alias anglais (`lib/tache/import/normalize-llm-aliases.ts`) — le modèle doit quand même viser le français. |
| **Gabarits**                                         | `reference_payload_oi13_importable_cap_rouge`, `reference_payload_oi7_71_importable`, etc., pour calquer la forme des clés racine.                                                                              |

**Régénération** (alignement sur `oi.json`) :

```bash
node scripts/build-import-tache-notebooklm-bundle.mjs
```

**Version** : le champ **`bundle_version`** en tête du JSON permet de savoir quelle édition des règles vous utilisez dans NotebookLM.

---

## 2. Les documents de contenu (matière pédagogique)

Ce sont les fichiers que vous **ajoutez comme sources** dans NotebookLM (PDF, extraits, etc.). Ils fournissent la **matière** du JSON, pas la structure.

| Type de source             | Usage typique pour le JSON                                                                                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Questionnaire / énoncé** | Consigne, guidage, nombre de lignes attendu, formulation des questions liées aux documents.                                                                  |
| **Corrigé**                | Corrigé enseignant, réponse attendue, parfois répartition des documents (ex. avant / après pour une tâche type **1.3**).                                     |
| **Dossier documentaire**   | Textes des documents : titres, citations de source, extraits HTML, **repères temporels** / années pour la logique « Situer dans le temps » et les autres OI. |

**Important :** numéros de **chapitre**, de **source** ou de **question** dans le PDF **ne sont pas** des `niveau_id` ou `discipline_id` — le bundle le rappelle (`alerte_ancrage_chiffres_manuel_fr`). Ces ids viennent du **référentiel niveau/discipline** dans le bundle, choisis pour **la fiche TAÉ**, puis **recopiés** sur chaque document.

---

## 3. Référentiels ministériels — **obligatoires** dans le cahier

Ces PDF doivent être **ajoutés comme sources** dans NotebookLM (ou équivalent) **en même temps que** le bundle et l’épreuve. Ils ne sont pas optionnels : ils fondent le **dictionnaire sémantique** (PDA) et le **cadre d’évaluation** (OI / barèmes).

### 3.1 Progression des apprentissages et programmes (PDA / PFEQ)

Servent à extraire les libellés **verbatim** pour **`connaissances_hors_rpc`** (réalité sociale, section, sous-section, énoncé) lorsque **`tae.connaissances_ids`** est vide — **sans paraphrase**, pour le rapprochement avec la base à l’import.

| Document                                                        | Nom de fichier PDF (référence)                                                  |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Progression des apprentissages (PDA)                            | `PFEQ-progression-apprentissages-histoire-education-citoyennete-secondaire.pdf` |
| Programme de formation (PFEQ — général)                         | `PFEQ-histoire-education-citoyennete-secondaire.pdf`                            |
| Programme de formation (PFEQ — Histoire du Québec et du Canada) | `histoireQuebecCanada (1).pdf`                                                  |

Si votre copie locale du MÉQ porte un autre nom, renommez-la pour correspondre à la source que vous téléversez ou gardez **une seule** version clairement identifiée comme « HQC secondaire » dans le cahier.

### 3.2 Cadre d’évaluation et précisions techniques

Essentiel pour **valider le couple OI / comportement** (ex. **1.3** Avant/Après) et l’adéquation avec la structure documentaire de l’épreuve.

| Document                               | Nom de fichier PDF (référence)         |
| -------------------------------------- | -------------------------------------- |
| Précisions sur les outils d’évaluation | `HQC_Precisions_outils_evaluation.pdf` |

Le bundle décrit le schéma sous **`connaissances_hors_rpc`** et rappelle que ces champs sont **retirés** après résolution, avant l’appel RPC (voir **`cles_a_retirer_avant_appel_rpc`**).

---

## 4. Déroulement recommandé dans NotebookLM

1. **Créer un cahier** et y ajouter **en premier** le fichier **`import-tache-notebooklm-bundle.json`** à jour (téléchargé depuis le dépôt ou régénéré avec `node scripts/build-import-tache-notebooklm-bundle.mjs`).
2. **Ajouter les quatre PDF ministériels obligatoires** (section 3) : les trois documents PDA/PFEQ et **`HQC_Precisions_outils_evaluation.pdf`**. Sans eux, le moteur de conversion ne dispose pas du référentiel verbatim ni du cadre OI officiel.
3. **Ajouter les PDF de l’épreuve** visée : questionnaire (ou énoncé), corrigé, dossier documentaire (ou équivalent selon votre matériel).
4. Demander au modèle de produire **un seul objet JSON** conforme au bundle (racine : `auteur_id`, `connaissances_hors_rpc`, `tae`, `documents_new`, `slots`, `collaborateurs_user_ids` — **sans** `import_notes_fr`).
5. Exiger le **protocole de sortie** du bundle et la **passe V1–V13** sur brouillon complet (vérification interne), puis **réponse = JSON seul**, sans markdown ni texte autour.

---

## 5. Côté application (après coup)

Quand le parcours import sera branché, le flux prévu côté code est du type :

1. Parse JSON UTF-8.
2. **`normalizeDocumentsNewTypesFromLlm`** sur `documents_new` (alias anglais → français).
3. **`validateTacheImportVsOi`** avec `oi.json` (comptages, ids, présence / absence de `non_redaction_data` selon le comportement).
4. Résolution **`connaissances_hors_rpc`** → **`connaissances_ids`**, injection **`auteur_id`**, puis RPC **`publish_tae_transaction`**.

Détail des modules : **[ARCHITECTURE.md](./ARCHITECTURE.md)** (`lib/tache/import/`).

---

## 6. Rappels utiles

- **Une TAÉ par JSON** ; ce n’est pas une épreuve complète multi-tâches dans un seul fichier.
- **`auteur_id`** peut être `null` dans le JSON généré : l’app injecte l’enseignant connecté.
- Documents **iconographiques** sans fichier : **`image_url`: `null`** est attendu ; téléversement après import (voir bundle, `flux_televersement_images_fr`).
- En cas de doute sur la structure, **copier les gabarits** `reference_payload_*` du même bundle.

---

## Voir aussi

- [ARCHITECTURE.md](./ARCHITECTURE.md) — `public/data/import-tache-notebooklm-bundle.json`, `lib/tache/import/`
- [BACKLOG.md](./BACKLOG.md) — import JSON TAÉ (NotebookLM)
- [WORKFLOWS.md](./WORKFLOWS.md) — wizard et parcours TAÉ dans l’app
- [wizard-oi-non-redactionnelle.md](./wizard-oi-non-redactionnelle.md) — parcours non rédactionnels (dont **1.3**)
