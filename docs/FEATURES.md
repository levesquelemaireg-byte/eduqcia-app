# Domaine métier et produit

Règles métier des **tâches**, banque, votes, **épreuves** (composition, table `evaluations`), export. Normatif pour validation serveur, fiche, banque et PDF. Compléments : [WORKFLOWS.md](./WORKFLOWS.md) (wizard, stepper, blocs), [ARCHITECTURE.md](./ARCHITECTURE.md) (schéma, RPC), [DECISIONS.md](./DECISIONS.md) (copy), [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md) (UI).

**Données statiques (Next.js) :** `public/data/` — `oi.json`, `hec-cd.json`, `hqc-cd.json`, `hec-sec1-2.json`, `hqc-sec3-4.json`, `css-ecoles.json`, grilles HTML JSON référencées par les comportements.

**Écrans complémentaires (résumés) :** banque et dashboard — tables ci-dessous ; **création autonome de documents historiques** (`/documents/new`, fiche `/documents/[id]`) — §13.1 ; auth Next.js — [ARCHITECTURE.md](./ARCHITECTURE.md#authentification-nextjs--supabase) ; fiche lecture — [WORKFLOWS.md](./WORKFLOWS.md#fiche-lecture) et composants `FicheTache`.

---

## 1. Concept fondamental — La TAÉ

Une **tâche** est une consigne rédactionnelle structurée destinée aux élèves du secondaire en univers social (sec. 1–4). Elle est alignée sur les programmes ministériels québécois (PFEQ).

Une tâche est composée de :

- Une **opération intellectuelle (OI)** — l'action cognitive demandée à l'élève
- Un **comportement attendu** — la forme précise de la réponse
- Une **consigne principale** — l'instruction rédigée par l'enseignant
- Des **documents historiques** — les sources sur lesquelles l'élève s'appuie
- Un **corrigé** — la production attendue (usage enseignant uniquement)
- Des **métadonnées d'indexation** — niveau, discipline, aspects, CD, connaissances

**Principe fondamental :** l'OI et le comportement attendu déterminent ensemble la forme de la consigne, le nombre de documents requis et la grille de correction applicable.

### 1.1 Produit final — élève en classe

Au-delà des écrans enseignant (création, fiche, banque), le **livrable pédagogique** visé par le produit est le **support remis à l'élève** en situation de classe : typiquement **documents imprimés** produits à partir de l'**export PDF** d'une épreuve (voir §10.3), ou une **passation numérique** équivalente lorsque ce mode est utilisé à la place du papier.

Les parcours applicatifs servent à **composer**, **valider** et **diffuser** ce contenu ; la **fiche** (vue `/questions/[id]`) en est la représentation structurée à l'écran. Prioriser l'export imprimable / la qualité de passation, c'est prioriser l'usage réel en milieu scolaire.

---

## 2. Opérations intellectuelles (OI)

Source de vérité : `public/data/oi.json`

Il existe 8 OI, chacune avec un identifiant, un titre, une icône Material Symbols et une liste de comportements attendus.

**Décision produit (alignement données) :** **OI0 — Établir des faits** est **active** dans le périmètre MVP, avec le seul comportement **0.1** (1 document, réponse rédigée). **OI1 — Situer dans le temps** est **active** avec les comportements **1.1** (4 documents, parcours non rédactionnel **ordre chronologique**), **1.2** (1 document cible, parcours non rédactionnel **ligne du temps** — `variant_slug` dans `oi.json`) et **1.3** (4 documents, parcours non rédactionnel **avant / après** — slug `avant-apres`, `nb_documents` = 4 dans `public/data/oi.json` et référentiel `comportements`). L’ancienne spec « OI0 = coming_soon (format non rédactionnel) » est **abrogée** pour l’app.

### 2.1 OI actives (MVP — wizard de création)

Ces OI sont disponibles dans le formulaire de création. **Sauf** pour les **comportements non rédactionnels de l’OI1** (1.1, 1.2, 1.3), elles s’appuient sur une **réponse rédigée** de l’élève (phrases complètes), avec le nombre de documents imposé par le comportement.

| ID  | Titre                                         | Comportements actifs                          |
| --- | --------------------------------------------- | --------------------------------------------- |
| OI0 | Établir des faits                             | 0.1                                           |
| OI1 | Situer dans le temps                          | 1.1, 1.2, 1.3 (non rédactionnel — 3 parcours) |
| OI3 | Dégager des différences et des similitudes    | 3.1, 3.2, 3.3, 3.4, 3.5                       |
| OI4 | Déterminer des causes et des conséquences     | 4.1, 4.2 seulement                            |
| OI6 | Déterminer des changements et des continuités | 6.1, 6.2, 6.3                                 |
| OI7 | Établir des liens de causalité                | 7.1                                           |

### 2.2 OI coming_soon (formulaire distinct à développer)

Les **OI1 — Situer dans le temps** comportements **1.1**, **1.2** et **1.3** sont **disponibles** avec leurs parcours non rédactionnels — détail [wizard-oi-non-redactionnelle.md](./wizard-oi-non-redactionnelle.md). Le tableau ci-dessous recense les **autres** opérations intellectuelles ou comportements qui exigent encore un format de réponse différent (numéros de documents, carte, association, etc.) et un **formulaire distinct** (ou des comportements additionnels).

**Données :** les comportements concernés portent un champ `variant_slug` dans `public/data/oi.json` (registre `lib/tache/non-redaction/`). L’UI spécifique par parcours se branche dans le wizard via `components/tache/wizard/wizardBlocResolver.tsx` (étapes 3 et 4) lorsque la paire de composants pour ce slug est enregistrée dans `TACHE_NON_REDACTION_WIZARD_BLOCS` ; sinon le flux rédactionnel existant s’applique.

**Repère temporel et année normalisée (OI1) :** chaque document peut porter **`repere_temporel`** (texte) et **`annee_normalisee`** (entier) — saisie **`RepereTemporelField`**, comparaison **`getAnneePourComparaison`** (`lib/tache/document-annee.ts`). Pour l’**OI1**, ces champs alimentent les **algorithmes** des parcours non rédactionnels (ordre chronologique, ligne du temps, avant/après, etc.). **Cadre commun** (obligations Bloc 4 / Bloc 5, comportements 1.1 / 1.2 / 1.3) : [wizard-oi-non-redactionnelle.md](./wizard-oi-non-redactionnelle.md) § **Données temporelles — repère et année normalisée** ; configuration par slug : `lib/tache/behaviours/*.ts` (`requiresRepereTemporel`, `completionCriteria`). **FAQ enseignants (rôle du repère, comportements, limites produit) :** [FAQ.md](./FAQ.md#faq-repere-temporel-enseignants).

**Feuille élève (sommaire + aperçu impression) :** tant qu’un `variant_slug` est actif pour la paire OI / comportement, le pied de fiche et l’aperçu imprimable **n’affichent** ni le compteur de lignes ni les **traits horizontaux** de réponse rédigée (`TacheFicheData.showStudentAnswerLines === false`). Au **Bloc 2**, la section **Espace de production** reste visible en **lecture seule** : pour ces comportements, `nb_lignes` vaut **0** dans `public/data/oi.json`, ce qui affiche le message **non rédactionnel** (pas de curseur ni de saisie manuelle). La zone de réponse sur la feuille élève suit le modèle du parcours (ex. ordre chronologique : consigne, options A–D en grille avec cases chiffres, libellé **Réponse :** et une case pour la lettre ; ligne du temps : consigne avec frise et **Réponse :** dans le HTML publié, une case lettre ; **avant / après** : intro publiée (thème, repère, année), tableau **Avant** / **Après** par option A–D, **Réponse :** et case lettre).

| ID    | Titre                        | Raison                         |
| ----- | ---------------------------- | ------------------------------ |
| OI2   | Situer dans l'espace         | Carte géographique             |
| OI4.3 | Deux facteurs explicatifs    | Réponse = numéros de documents |
| OI4.4 | Facteur et conséquence       | Réponse = numéros de documents |
| OI5   | Mettre en relation des faits | Association de faits           |

**Comportement 1.2 (ligne du temps)** — **livré** dans le wizard : **étape 3** = consigne, segments (3 ou 4), **N+1** dates sur la frise, corrigé lettre ; **étape 4** = **document cible** seul (`nb_documents` 1). Fichiers : `Bloc3LigneDuTemps` / `Bloc4LigneDuTemps`, `ligne-du-temps-payload.ts`, action `NON_REDACTION_PATCH_LIGNE_TEMPS`, entrée `ligne-du-temps` dans `TACHE_NON_REDACTION_WIZARD_BLOCS`. Détail copy et UX : [wizard-oi-non-redactionnelle.md](./wizard-oi-non-redactionnelle.md) § Parcours 2.

**Comportement 1.3 (avant / après)** — **livré** dans le wizard : slug **`avant-apres`** ; **étape 3** = thème (objet d’étude), libellé et année du **repère**, guidage fixe pour l’élève ; **étape 5** = tableau 4×3, **Générer les options A à D** / **Régénérer les distracteurs**, corrigé lettre dérivé de la génération ; **4 documents** ; persistance **`tache.non_redaction_data`** (JSONB). Fichiers : `Bloc3AvantApres` / `Bloc4AvantApres` / `Bloc5AvantApres`, `avant-apres-payload.ts`, entrée `avant-apres` dans `TACHE_NON_REDACTION_WIZARD_BLOCS`. Détail : [wizard-oi-non-redactionnelle.md](./wizard-oi-non-redactionnelle.md) § Parcours 3.

**Règle d'affichage :** le formulaire ne doit afficher que les OI dont `status === "active"`. Pour OI4 (cas mixte), filtrer aussi au niveau des comportements (`c.status ?? "active"`).

---

## 3. Comportements attendus et nombre de documents

Le **comportement attendu** est l'unité de base de la TAÉ. Il définit :

- La forme précise de la réponse élève
- Le nombre de documents requis (`nb_documents`) — **immuable** une fois choisi
- La grille de correction officielle applicable (`outil_evaluation`)
- Le **nombre de lignes** d’espace de production rédactionnel (`nb_lignes`) — valeur **lue** dans `public/data/oi.json` pour le comportement sélectionné (`nbLignesFromComportementJson`), appliquée au blueprint lors du **`SET_COMPORTEMENT`** et publiée en colonne `tache.nb_lignes` ; **pas** de réglage manuel au Bloc 2 (voir [WORKFLOWS.md](./WORKFLOWS.md#bloc-2--paramètres-de-la-tâche-étape-2))

### 3.1 Table complète des comportements actifs

| ID  | Énoncé                                                                                                                     | nb_documents | Grille  |
| --- | -------------------------------------------------------------------------------------------------------------------------- | ------------ | ------- |
| 0.1 | Établir un fait à partir d'un document historique                                                                          | 1            | OI0_SO1 |
| 3.1 | Indiquer ce qui est différent par rapport à un ou plusieurs objets de comparaison                                          | 1            | OI3_SO1 |
| 3.2 | Indiquer ce qui est semblable par rapport à un ou plusieurs objets de comparaison                                          | 1            | OI3_SO2 |
| 3.3 | Indiquer le point précis sur lequel des acteurs ou des historiens sont en désaccord (divergence)                           | 2            | OI3_SO3 |
| 3.4 | Indiquer le point précis sur lequel des acteurs ou des historiens sont d'accord (convergence)                              | 2            | OI3_SO4 |
| 3.5 | Montrer des différences et des similitudes par rapport à des points de vue d'acteurs ou à des interprétations d'historiens | 3            | OI3_SO5 |
| 4.1 | Indiquer un facteur explicatif, c.-à-d. un fait qui explique une réalité historique (réponse écrite)                       | 1            | OI4_SO1 |
| 4.2 | Indiquer un fait qui découle d'une réalité historique (réponse écrite)                                                     | 1            | OI4_SO2 |
| 6.1 | Indiquer un fait qui montre qu'une réalité historique se transforme                                                        | 2            | OI6_SO1 |
| 6.2 | Indiquer un fait qui montre qu'une réalité historique se maintient                                                         | 2            | OI6_SO2 |
| 6.3 | Montrer qu'une réalité historique se transforme ou se maintient                                                            | 3            | OI6_SO3 |
| 7.1 | Exprimer un enchaînement logique qui existe entre des faits                                                                | 3            | OI7_SO1 |

### 3.2 Règle d'immuabilité

Une fois le comportement attendu sélectionné et le Bloc 1 validé, `nb_documents` est **figé** pour cette TAÉ. Pour changer le nombre de documents, l'enseignant doit retourner au Bloc 1 et recommencer — ce qui réinitialise les documents déjà saisis.

---

## 4. Consigne principale

### 4.1 Structure

La consigne est rédigée par l'enseignant. Elle doit :

- Commencer par un verbe d'action clair (Indiquez, Présentez, Expliquez, Montrez)
- Référencer les documents via les placeholders `{{doc_1}}`, `{{doc_2}}`, `{{doc_3}}`, … (format numérique depuis Phase 1, 22 avril 2026)
- Être cohérente avec l'OI et le comportement attendu choisis

### 4.2 Système de placeholders

Les documents sont référencés dans la consigne par des identifiants **numériques** (`doc_1`, `doc_2`, `doc_3`, …), indexés à partir de 1 selon l'ordre des slots dans le Bloc 4. Ces identifiants sont internes — ils sont remplacés par des numéros **globaux** dans une épreuve à l'export PDF (voir §10.3). L'**affichage éditeur** du wizard (nœud TipTap `docRef`) conserve la **lettre** (A, B, C, …) via l'attribut `data-doc-ref` pour la lisibilité ; seul le HTML sérialisé utilise le format numérique.

```
Consigne stockée :   "Consultez {{doc_1}} et {{doc_2}}. Indiquez ce qui est différent..."
Affichage preview :  "Consultez le Document A et le Document B. Indiquez ce qui est différent..."
Export PDF :         "Consultez le Document 3 et le Document 4. Indiquez ce qui est différent..."
```

Les badges `[Doc A]`, `[Doc B]` sont affichés au **Bloc 3** (éditeur de consigne) comme raccourcis cliquables pour insérer les placeholders dans la consigne.

**Rétrocompatibilité :** le HTML legacy stocké avec `{{doc_A}}`…`{{doc_D}}` a été migré en base (22 avril 2026, migration `20260422200000_slots_documents_alpha_to_numeric.sql`) ; les résolveurs côté application acceptent quand même les deux formats en lecture pour tolérer d'éventuels brouillons antérieurs.

### 4.3 Guidage (optionnel)

Le guidage est un étayage méthodologique bref (scaffolding). Il doit être retiré pour une évaluation sommative. Il n'apparaît pas dans le questionnaire élève si l'enseignant le désactive à l'export.

**Parcours ordre chronologique (non rédactionnel) :** le guidage **publié** est un texte **élève** fixe (`NR_ORDRE_STUDENT_GUIDAGE` dans `lib/ui/ui-copy.ts`), stocké en **`tache.guidage`**, distinct de l’aide **enseignant** sur les options A–D. Au **Bloc 3** du wizard : section **Guidage complémentaire** en lecture seule, synchronisation **`SET_GUIDAGE`** avec ce HTML fixe, **Aspects de société** pour l’indexation, glyphes de section alignés sur le Bloc 3 rédactionnel (`bloc3-stepper-icons.ts`). La **`consigne`** publiée inclut une **ancre** HTML entre l’intro et la grille ; l’impression compose intro → guidage → options. Sur les feuilles élève (aperçu impression TAÉ, impression épreuve), le rendu du guidage respecte `TacheFicheData.showGuidageOnStudentSheet` : `false` masque le bloc (prévu pour la sommative) ; la **fiche lecture** enseignant (`/questions/[id]`) et le **sommaire** affichent la consigne via `prepareOrdreChronologiqueConsigneForTeacherDisplay` (sans ancre ni bloc **Réponse :** réservé à la feuille imprimée) et **SectionGuidage** avec le HTML stocké. **Changement de comportement** au Bloc 2 (`SET_COMPORTEMENT`) : **`redaction.guidage`** est remis à vide pour ne pas réutiliser ce texte fixe dans un parcours rédactionnel (même principe pour la ligne du temps) — `tache-form-reducer.ts`.

### 4.4 Aperçu texte (liste « Mes tâches », carte `TacheCard`)

L’amorce documentaire (« Consultez le document A. », et les variantes à deux, trois, ou davantage de documents selon `nb_documents` — formulation générée dynamiquement par `buildAmorceDocumentaire`) fait partie intégrante du HTML TipTap de la consigne — elle est insérée par le wizard dans l’éditeur et stockée en base avec le reste de la consigne. Les selectors fiche (`selectConsigne`, `selectLectureConsigne`) n’injectent aucun texte : ils prennent le HTML brut, résolvent les placeholders `{{doc_N}}` (et `{{doc_A}}` legacy) → numéros, sanitisent, et retournent. L’amorce s’affiche donc naturellement sur la **fiche lecture** et dans le **sommaire**.

Pour les **miniatures** — ligne de la liste **Mes tâches** (`/questions`), aperçu du brouillon wizard côté serveur dans cette liste, et extrait sur la carte **`TacheCard`** — l’amorce documentaire est **retirée** du texte d’aperçu lorsqu’elle correspond **exactement** au modèle (début de chaîne, après résolution des références document en lettres et suppression du HTML). Objectif : mettre en avant la consigne rédigée par l’enseignant. Si l’enseignant a modifié l’amorce, elle n’est pas retirée.

Implémentation : `plainConsigneForMiniature` et `stripAutoIntroPhraseForMiniature` dans `lib/tache/consigne-helpers.ts`. Les placeholders `{{doc_1}}`…`{{doc_N}}` (et `{{doc_A}}`…`{{doc_D}}` legacy — rétrocompat) sont résolus en **numéros 1…N** pour l’affichage tâche seule via `resolveDocPlaceholdersForSingleTask` / `resolveConsigneHtmlForDisplay` (fiche, sommaire, aperçu impression) ; l’**impression épreuve** conserve la réécriture globale existante (`evaluation-print-doc-map`). Règle icônes OI fiche / vignette : [DECISIONS.md](./DECISIONS.md#fiche-lecture-et-vignette-liste-taecard).

---

## 5. Documents historiques

### 5.1 Types de documents

| Type             | Description                                        |
| ---------------- | -------------------------------------------------- |
| `textuel`        | Extrait de texte (source primaire ou secondaire)   |
| `iconographique` | Image (carte, illustration, photographie, tableau) |

Chaque document contient obligatoirement : un titre, un contenu (texte ou image), une source.

**Repère temporel et année normalisée :** colonnes SQL **`documents.repere_temporel`** (texte libre) et **`documents.annee_normalisee`** (entier nullable, négatif autorisé). Saisie au **Bloc 4** (création de document dans la TAÉ) et au **wizard autonome** `/documents/new` ; non affiché sur la copie de l'élève. L’extraction d’une année à quatre chiffres dans le texte est proposée en UI ; sinon saisie manuelle de l’année normalisée. Ces champs alimentent les algorithmes des parcours non rédactionnels **OI1** (ordre chronologique, ligne du temps, avant / après) — helper **`getAnneePourComparaison`** (`lib/tache/document-annee.ts`).

**Visibilité banque (`is_published` sur `documents`) :** création **autonome** → `true` dès l’enregistrement (métadonnées complètes au formulaire). Création **lors de la publication d’une TAÉ** (RPC `publish_tache_transaction` / `update_tache_transaction`) → `false` jusqu’à complétion (repère ou année + indexation déjà présente sur la ligne) ; l’auteur peut finaliser depuis la **fiche document** (`/documents/[id]`). Les lignes existantes avant migration **ne sont pas modifiées**.

**Parcours ordre chronologique (OI1 · 1.1) :** le classement pédagogique repère encore le temps **dans** le matériel documentaire pour l’élève ; le **repère enseignant** ci-dessus sert l’automatisation (génération d’options, cohérence des années) et la banque. **Aperçu impression** (toute TAÉ) : deux **feuillets** — dossier documentaire puis questionnaire — avec bascule à l’écran ; le guidage élève est composé entre intro et options à partir de **`tache.guidage`** et de l’ancre dans **`tache.consigne`** (voir DECISIONS — impression).

**Mise en page à l’impression (fiche TAÉ)** : feuille **Letter** avec marges intérieures **2 cm** (variables **`--tache-print-sheet-*`** dans `app/globals.css`, alignées écran / print — voir [WORKFLOWS.md](./WORKFLOWS.md)). L’aperçu impression du wizard et la route `/questions/[id]/print` affichent les documents dans une grille responsive (colonnes selon la largeur utile, largeur minimale de colonne plus élevée dès qu’au moins un document est iconographique, pour la lisibilité des cartes et légendes). La **hauteur** d’affichage des images iconographiques est bornée par **`--tache-print-document-figure-max-height`** (`app/globals.css`) sur le **`max-height`** de l’`<img>` (`.documentFigureImg`), pour limiter la pagination excessive sans dupliquer des constantes dans le module ; la **carte document** iconographique (**`.documentCell`**, hors pleine largeur) épouse la **largeur du contenu** (`max-content`, `justify-self: start` dans la grille) ; le **cadre** (`.documentFigure`) épouse le bitmap (**`inline-block`**, **`max-width: 100%`**, bordure fine, pas de ratio 16:9 ni fond entre l’image et la bordure). Un document textuel très long ou structuré (tableau, listes longues) peut s’étendre sur toute la largeur de la grille selon une heuristique côté client — remplaçable par un réglage métier futur ; détail technique : [WORKFLOWS.md](./WORKFLOWS.md) (impression fiche), [BACKLOG.md](./BACKLOG.md) (backlog `print_full_width`).

### 5.2 Nombre de documents

Piloté exclusivement par `nb_documents` du comportement attendu. Voir table §3.1.
Les slots de documents sont initialisés au Bloc 1 et ne peuvent pas être modifiés sans retourner au Bloc 1.

### 5.3 Modèle source / instance

La banque collaborative de documents fonctionne selon un modèle de découplage :

**Document Source (master)**

- Créé par un enseignant et stocké dans la banque globale
- Identifié par un UUID en base (modèle Supabase)
- Versionné — l'auteur peut publier des mises à jour majeures

**Document Instance (copie locale)**

- Créé quand un enseignant réutilise un document source dans sa TAÉ
- Copie complète et indépendante — modifications locales sans impact sur le master
- Conserve `source_document_id` et `source_version` pour le suivi des mises à jour

**Flux de mise à jour optionnel**
Quand l'auteur d'un document source publie une mise à jour majeure, les enseignants ayant instancié ce document reçoivent une notification dans leur tableau de bord. Ils peuvent accepter ou ignorer la mise à jour — leur instance locale n'est jamais modifiée automatiquement.

```
Structure d'un document instance :
{
    id:                 'doc_1',           // Identifiant local dans la TAÉ (format numérique depuis Phase 1)
    titre:              '',
    type:               'textuel' | 'iconographique',
    contenu:            '',
    source:             '',
    attachment_id:      null,              // Référence média si stockage externe
    source_document_id: null,              // null si document original
    source_version:     null,              // Version du master à l'instanciation
    is_modified:        false              // true si modifié localement
}
```

### 5.4 Compteur « Utilisé dans X tâches »

**Décision PO (mars 2026) :** le nombre affiché correspond au nombre de **tâches d’apprentissage et d’évaluation distinctes** qui référencent le document via `tache_documents`, en comptant **une seule fois par tâche** (`COUNT(DISTINCT tae_id)`), et **uniquement pour les TAÉ publiées** (`tache.is_published = true`). Les brouillons de TAÉ ne sont pas inclus.

### 5.5 Visibilité banque — pas de brouillon au niveau document

**Décision PO (mars 2026) :** il n’existe pas de **statut brouillon** pour l’entité document dans le parcours **Créer un document** (hors wizard TAÉ) : la saisie vise un enregistrement **immédiat** ; le document est **automatiquement publié** pour la banque (`documents.is_published = true`) et **visible** dans l’espace collaboratif selon les règles d’accès enseignants (RLS). Le **brouillon du wizard TAÉ** (`tache_wizard_drafts`) concerne la **tâche**, pas un document « en attente » séparé dans la banque documents.

**Note (mars 2026) :** le wizard **`/documents/new`** propose une **sauvegarde brouillon locale** (`sessionStorage`) — confort de saisie **sans** ligne `documents` ni statut brouillon en base jusqu’au clic **Enregistrer le document**.

Les documents créés **uniquement** lors de la **publication** d’une TAÉ suivent le flux transactionnel existant (RPC) ; une fois insérés, ils sont traités comme aujourd’hui pour l’indexation banque (voir §8.8).

### 5.6 Légende (document iconographique)

**Décision PO (mars 2026) :** champ **optionnel** **Légende**, présent dans le **wizard — Bloc 4** et dans le **module Créer un document**.

- **Limite** : **50 mots** maximum (validation côté application ; règle de découpage des mots définie dans le code, ex. séquences alphanumériques séparées par des espaces).
- **Aide au champ (tooltip / texte d’aide)** : copy **normative** dans [UI-COPY.md](./UI-COPY.md#étape-4--documents-historiques) (Légende, document iconographique).
- **Sélecteur de coin** : **`position_top_right`** (haut droit) ; **haut gauche** = même glyphe **`position_top_right`** en **miroir horizontal** (pas de `position_top_left` dans la police) ; **`position_bottom_left`** ; **`position_bottom_right`** — [DECISIONS.md](./DECISIONS.md#justifications--position-de-la-légende).
- **Rendu sur l’image** : texte en **superposition** (overlay) dans un **coin au choix** de l’utilisateur parmi : haut gauche, haut droit, bas gauche, bas droit.
- **Style du bandeau** : fond **gris semi-transparent** ; **typographie 10 pt** ; **bordure gauche uniquement**, **noire** (les autres côtés sans bordure).
- **Persistance** : `documents.image_legende` et `documents.image_legende_position` — voir [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## 6. Métadonnées d'indexation

Les métadonnées servent à l'indexation et à la recherche dans la banque collaborative. Elles n'apparaissent pas dans le questionnaire élève.

### 6.1 Niveau scolaire et discipline

| Cycle     | Niveaux                    | Discipline                                   |
| --------- | -------------------------- | -------------------------------------------- |
| 1er cycle | Secondaire 1, Secondaire 2 | Histoire et éducation à la citoyenneté (HEC) |
| 1er cycle | Secondaire 1, Secondaire 2 | Géographie et éducation à la citoyenneté     |
| 2e cycle  | Secondaire 3, Secondaire 4 | Histoire du Québec et du Canada (HQC)        |

La discipline sélectionnée détermine les fichiers JSON utilisés pour CD et Connaissances :

- HEC → `hec-cd.json` + `hec-sec1-2.json`
- HQC → `hqc-cd.json` + `hqc-sec3-4.json`

### 6.2 Aspects de société

Multi-sélection parmi : Économique, Politique, Social, Culturel, Territorial.

### 6.3 Compétences disciplinaires (CD)

Sélection hiérarchique via Miller Columns (3 niveaux) :

```
Compétence disciplinaire (CD)
└── Composante
    └── Critère
```

Source : `hec-cd.json` ou `hqc-cd.json` selon la discipline.

### 6.4 Connaissances relatives

Sélection hiérarchique via Miller Columns (multi-select, 3 ou 4 niveaux) :

**HEC (`hec-sec1-2.json`) — 3 ou 4 niveaux :**

```
Réalité sociale
└── Section
    └── Sous-section (parfois null → 3 niveaux)
        └── Énoncé
```

**HQC (`hqc-sec3-4.json`) — toujours 3 niveaux :**

```
Réalité sociale + Période
└── Section
    └── Énoncé  (sous_section TOUJOURS null pour HQC)
```

**Règle critique :** ne jamais supposer que `sous_section` existe pour HQC. Toujours vérifier `sous_section !== null` avant d'afficher le 4e niveau.

---

## 7. Grilles d'évaluation

### 7.1 Nature

Les grilles d'évaluation sont des documents normatifs du ministère. Elles sont en lecture seule — le formulaire ne les crée pas et ne les modifie pas.

Chaque comportement attendu est associé à une grille via `outil_evaluation` (ID de template HTML).

### 7.2 Accès dans l'interface

- **Bloc 1** : bouton `table_eye` activé dès qu'un comportement attendu est sélectionné
- **Preview fiche** : icône `table_eye` dans la barre OI pour consultation rapide
- **Modale** : lecture seule, `role="dialog"`, focus trap, ESC pour fermer

### 7.3 Source technique

Fichier : `public/data/grilles-templates.html` (ou équivalent versionné dans le dépôt)
Format : `<template id="OIx_SOy">` contenant une table HTML pixel-perfect.
Chargement JS : `fetch` → `DOMParser` → `cloneNode(template.content)`.

---

## 8. Banque collaborative

### 8.1 Publication

Une TAÉ publiée est immédiatement visible dans la banque publique. Il n'y a pas de modération préalable. Un brouillon n'est visible que par son auteur.

### 8.2 Recherche et filtres

La banque est filtrable par : opération intellectuelle, comportement attendu, niveau scolaire, discipline, aspects de société, compétence disciplinaire (`cd_id`), connaissances relatives. Les filtres s’appuient sur les métadonnées indexées en base (mêmes dimensions ; noms de colonnes et paramètres URL : voir [plan-banque-collaborative.md](./plan-banque-collaborative.md)).

**Copy interface :** [DECISIONS.md](./DECISIONS.md#terminologie-ui--pas-dacronymes-interdits) et [UI-COPY.md](./UI-COPY.md#page--banque-collaborative) — pas d’acronymes **OI**, **CD** ou **TAÉ** à l’écran.

**Spec d’implémentation (chantier banque : URL, pagination, recherche `consigne_search_plain`, dérivation épreuves, migration index) :** [plan-banque-collaborative.md](./plan-banque-collaborative.md).

### 8.3 Système de votes par les pairs

**Conditions pour voter :**

- Avoir "utilisé" la TAÉ (téléchargement PDF ou ajout à une épreuve personnelle)
- Ne pas être l'auteur de la TAÉ
- Un seul vote par utilisateur par TAÉ (lié au `user_id`)
- Vote modifiable si la version de la TAÉ n'a pas changé

**Matrice d'évaluation (3 axes × 3 niveaux) :**

| Axe                    | Niveau 1  | Niveau 2             | Niveau 3           |
| ---------------------- | --------- | -------------------- | ------------------ |
| Rigueur historique     | Rigoureux | À travailler         | Absence de rigueur |
| Clarté de la consigne  | Claire    | À travailler         | Absence de clarté  |
| Alignement ministériel | Aligné    | Partiellement aligné | Non aligné         |

**Affichage :** nombre brut de votes par niveau pour chaque axe + nombre total d'utilisateurs ayant voté. Pas de moyenne calculée.

### 8.4 Commentaires collaboratifs

Les enseignants peuvent déposer des commentaires sur une TAÉ publiée pour suggérer des améliorations. Les commentaires sont publics et visibles par tous. L'auteur reçoit une notification à chaque nouveau commentaire.

### 8.5 Notifications de modification

Quand une TAÉ est modifiée (patch ou version majeure), les enseignants qui l'ont dans une épreuve reçoivent une notification dans leur tableau de bord :

> "La tâche _[titre]_ a été modifiée par son auteur."

### 8.6 Favoris

Un enseignant peut mettre en favoris des TAÉ, des documents historiques ou des épreuves.

- Stocké en table `favoris` (Supabase) — types `tache`, `document`, `evaluation`
- Accessible depuis le tableau de bord (section « Mes favoris »)
- Mettre une TAÉ en favoris compte comme « usage » et déverrouille le droit de vote (avec téléchargement PDF)

### 8.7 Banque unifiée — point d'entrée unique

Route unique `/bank` avec onglets (paramètre `?onglet=` — voir [plan-banque-collaborative.md](./plan-banque-collaborative.md)) :

```
Banque collaborative
┌─────────────────────────────────────────────┐
│  [Tâches]  [Documents historiques]  [Épreuves] │
└─────────────────────────────────────────────┘
```

Chaque choix charge une interface de recherche avec ses propres filtres :

**Tâches :** opération intellectuelle, comportement attendu, niveau scolaire, discipline, aspects de société, compétence disciplinaire, connaissances relatives, auteur, école (périmètre livré vs cible : plan + [UI-COPY.md](./UI-COPY.md#page--banque-collaborative))
**Documents historiques :** type (textuel/iconographique), niveau scolaire, discipline, aspects de société, connaissances relatives, mots-clés (titre, contenu, source)
**Épreuves :** niveau scolaire, discipline, auteur, école (dérivation / filtres avancés — phase 2 plan banque)

Actions disponibles :

- Tâches → voir la fiche, mettre en favoris, ajouter à une épreuve
- Documents → voir, mettre en favoris, instancier dans une tâche en cours de création
- Épreuves → voir, mettre en favoris, copier

**Documents — compteur et visibilité (PO mars 2026) :** voir §5.4 (compteur d’usages) et §5.5 (publication immédiate, pas de brouillon document sur le parcours autonome).

### 8.8 Métadonnées héritées — documents historiques

À la publication d'une TAÉ, ses documents historiques héritent automatiquement des métadonnées de la TAÉ parente pour être indexés dans la banque :

- Niveau scolaire, discipline, aspects de société, connaissances relatives

**Héritage cumulatif :** si un document est instancié dans une 2e TAÉ (niveau/discipline différents), les nouvelles métadonnées s'ajoutent aux existantes sans écraser les précédentes. Un document sur la Révolution américaine créé en sec. 3 apparaîtra aussi dans les recherches sec. 2 si un enseignant de sec. 2 l'utilise dans sa TAÉ.

Cet héritage s'applique uniquement au **document source (master)** — pas aux instances locales.

---

## 9. Versioning des TAÉ

### 9.1 Modification mineure (patch)

Champs concernés : faute d'orthographe, majuscule, mise en forme.
Comportement : mise à jour silencieuse, date "Dernière modification" mise à jour, votes conservés.

### 9.2 Modification majeure (version)

Champs concernés : `oi_id`, `comportement_id`, `documents`, `cd`, `connaissances`.

Comportement :

1. Avertissement à l'auteur avant sauvegarde
2. Incrément du numéro de version (`v1` → `v2`)
3. Archive des votes actifs (conservés pour statistiques, retirés de l'affichage public)
4. Réinitialisation de l'Indice de Confiance Collective
5. Notification aux utilisateurs concernés

**Affichage sur la fiche :**

- Publiée le : [date initiale]
- Dernière mise à jour majeure : [date] (v2)
- Indice de Confiance basé sur [N] votes de la version actuelle

### 9.3 Édition d’une tâche existante (wizard)

L’enseignant auteur peut rouvrir une TAÉ déjà persistée (`tache` + `tache_documents`) dans le même wizard que la création, avec **réhydratation** des sept étapes (y compris CD et connaissances alignés sur les JSON référentiels). L’enregistrement appelle la RPC **`update_tache_transaction`** (transaction : documents nouveaux éventuels, `UPDATE tache`, remplacement des lignes `tache_documents`). La RPC **refuse** la mise à jour si la TAÉ est référencée dans **`evaluation_tache`**.

**Écart produit (à suivre dans [BACKLOG.md](./BACKLOG.md), palier B1) :** les règles §9.1 / §9.2 (patch vs version majeure, avertissement, incrément `v2`, archive des votes, notifications) ne sont pas encore entièrement appliquées au flux d’édition décrit ci-dessus ; la spec §9 reste la cible métier.

---

## 10. Épreuves (composition)

**Libellé public et copy UI :** **épreuve** — [FAQ.md](./FAQ.md), [DECISIONS.md](./DECISIONS.md) (section « Épreuve (composition enseignant) — terminologie publique »). **Persistance :** tables `evaluations`, `evaluation_tache` ([ARCHITECTURE.md](./ARCHITECTURE.md)).

### 10.1 Concept

Une **épreuve** est un regroupement de TAÉ créé par un enseignant pour ses élèves. Elle peut contenir des TAÉ de l'enseignant lui-même ou des TAÉ d'autres enseignants (instanciées depuis la banque).

### 10.2 Règles

- Pas de limite de TAÉ par épreuve
- L'ordre des TAÉ est défini par l'enseignant (vision produit : glisser-déposer ; implémentation actuelle : boutons **Monter** / **Descendre** dans le panier de composition — voir [WORKFLOWS.md](./WORKFLOWS.md#création--édition-dépreuve-composition))
- Une épreuve peut être partagée dans la banque collaborative ou rester privée
- La modification d'une TAÉ après publication de l'épreuve déclenche une notification

### 10.2.1 Composition — création, édition et persistance

**Parcours livré :** création depuis **Mes épreuves** (`/evaluations/new`) ou édition depuis la liste (**Modifier** → `/evaluations/[id]/edit`). La banque collaborative (onglet **Tâches**) propose en outre **Ajouter à une épreuve** sur une TAÉ publiée : choix d'un brouillon existant puis redirection vers l'éditeur avec la TAÉ pré-sélectionnée (`?addTache=`).

- **Titre :** obligatoire pour toute sauvegarde (brouillon ou publication), validé côté serveur (RPC).
- **Brouillon :** autorisé **sans** TAÉ dans la composition (liste vide) ; l'enseignant peut enregistrer titre + composition partielle.
- **Publication :** au moins **une** TAÉ dans l'ordre défini ; pas de doublon de `tae_id` dans la même épreuve.
- **Après publication :** la composition reste **modifiable** (réordonnancement, ajouts, retraits) via le même écran d'édition ; le statut publié est conservé selon la logique RPC (mise à jour `evaluations` / `evaluation_tache`).
- **Éligibilité des TAÉ :** publiées (banque ou propres) ou brouillon **dont l'enseignant est auteur ou co-concepteur** — aligné sur les contrôles SQL de `save_evaluation_composition`.
- **Numérotation affichée dans l'UI** (préfixe question, indice documents par TAÉ) : cohérente avec la logique globale décrite au **§10.3** (documents `doc_1` / `doc_2` / … renumérotés en suite continue selon l'ordre des TAÉ) ; détail d'implémentation : [WORKFLOWS.md](./WORKFLOWS.md).
- **Aperçu / impression navigateur :** depuis l'éditeur de composition (**Aperçu**), enregistrement brouillon puis ouverture de `/evaluations/[id]/print` dans un nouvel onglet — feuille unique (dossier documentaire + questionnaire) pour contrôle ou impression locale par l'enseignant. Ce parcours ne remplace pas l'**export PDF** du **§10.3** (deux fichiers générés côté serveur, matériel élève).

### 10.3 Export PDF

C'est le mécanisme principal pour produire le **matériel élève** (imprimable ou base d'une passation numérique) à partir d'une épreuve : les deux fichiers ci-dessous constituent le **cœur du livrable** en contexte de classe (voir §1.1).

Deux fichiers générés séparément :

**Dossier documentaire**

- Tous les documents de toutes les TAÉ, numérotés globalement (Document 1, 2, 3...)
- Ordre : documents de la TAÉ 1, puis TAÉ 2, etc.

**Questionnaire**

- Toutes les consignes avec références aux numéros globaux du dossier documentaire
- Les placeholders `{{doc_N}}` (et `{{doc_A}}` legacy, rétrocompat) sont remplacés par les numéros globaux correspondants
- Le guidage peut être inclus ou exclu selon le contexte (formatif vs sommatif)
- Les grilles de correction sont incluses en annexe (usage enseignant)

**Algorithme de renumérotation** (`lib/epreuve/transformation/renumerotation.ts`) :

```
Pour chaque TAÉ dans l'épreuve (dans l'ordre) :
    Pour chaque document de la TAÉ (doc_1, doc_2, ...) :
        Assigner le prochain numéro global disponible
        Stocker le mapping : { tae_id, doc_id: 'doc_1', global_num: 3 }

À l'impression des consignes :
    Pour chaque consigne :
        Remplacer {{doc_N}} par le numéro global correspondant dans le mapping
        (et tolérer {{doc_A}} legacy pour le HTML non encore migré)
```

### 10.4 Copie d'épreuve

« Copier une épreuve » est un raccourci de création — pas un lien parent/enfant.

```
Copier épreuve → créer nouvelle épreuve
                    avec tae_ids[] copié comme valeur initiale
                    auteur = enseignant courant
                    aucun lien avec l'original
```

L'enseignant peut ensuite modifier l'ordre, ajouter ou retirer des TAÉ librement. Dès qu'il modifie quoi que ce soit, c'est une nouvelle épreuve indépendante. Les TAÉ référencées restent les mêmes objets — si une TAÉ est modifiée en version majeure, toutes les épreuves qui la référencent (originales ou copiées) reçoivent la notification.

### 10.5 Modes d'impression (aperçu — à implémenter)

**Statut :** piste produit / technique — non livré. **Implémentation cible :** panoplie d'options dans la fenêtre **Aperçu avant impression** (wizard) et équivalent sur la route impression ; **libellés définitifs et copy UI** à inscrire dans [UI-COPY.md](./UI-COPY.md) après validation par le développeur.

| Mode (intitulé de travail) | Comportement visé                                                                                                                                                                                                                 |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Formatif**               | **Guidage** affiché par défaut dans le rendu imprimable.                                                                                                                                                                          |
| **Sommatif**               | **Guidage** masqué par défaut (aligné sur l'idée « questionnaire sommatif » du §4.3 / §10.3).                                                                                                                                     |
| **Corrigé**                | Texte du **corrigé** (production attendue) rendu **comme écrit sur les lignes** de l'espace réponse ; les **lignes horizontales restent** visibles ; **léger décalage / espacement** pour éviter le chevauchement texte / traits. |
| **Épreuve**                | Découpage type **trois cahiers** : (1) **dossier documentaire** seul ; (2) **cahier de réponse** = **numéro de question** + **lignes** uniquement ; (3) **questionnaire** = **consignes numérotées** + **grille**.                |

**Décisions déjà tranchées (mars 2026) :**

1. **Persistance :** le mode est un **choix à l'impression seulement** (état local dans l'UI d'aperçu) — **pas** de stockage obligatoire sur la TAÉ ou l'épreuve pour ce réglage.
2. **Numérotation des questions :** pertinente surtout dans le contexte **épreuve** (plusieurs TAÉ, ordre défini — voir §10.3) ; **pas** une exigence métier pour une **TAÉ unique** imprimée seule (`/questions/[id]/print`).
3. **Mode corrigé :** contrainte de mise en page comme ci-dessus (lignes conservées + anti-chevauchement).
4. **Livrable « trois cahiers » :** format de sortie (une impression / un PDF / plusieurs fichiers, sauts de page) — **à trancher** (maquette ou retour terrain).

**Liens :** [WORKFLOWS.md](./WORKFLOWS.md) (impression fiche), [BACKLOG.md](./BACKLOG.md) (item backlog).

## 11. Compte, rôles et propriété

### 11.1 Inscription

- Email institutionnel obligatoire : domaine `@*.gouv.qc.ca` ou liste blanche d'écoles
- Validation par lien envoyé par email
- Activation du compte uniquement après validation

### 11.2 Rôles

| Rôle                     | Permissions                                                   |
| ------------------------ | ------------------------------------------------------------- |
| Enseignant (subscriber+) | Créer, modifier ses TAÉ, voter, commenter, créer des épreuves |
| Administrateur           | Tout + modération, gestion des utilisateurs, accès aux stats  |

### 11.3 Propriété des contenus

- Un enseignant ne peut modifier que ses propres TAÉ et épreuves
- Un enseignant peut instancier les documents et TAÉ d'autres enseignants
- Les instances sont des copies indépendantes — l'auteur original n'y a pas accès

## 12. Tableau de bord et profil (Next.js)

| Vue             | Route           | Contenu                                                                                                                        |
| --------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Tableau de bord | `/dashboard`    | Widgets : TAÉ publiées, épreuves, notifications non lues, favoris, indice de confiance (agrégation `lib/queries/dashboard.ts`) |
| Profil public   | `/profile/[id]` | TAÉ publiées de l’enseignant ; copy placeholder tant que non validée ([DECISIONS.md](./DECISIONS.md))                          |

**Notifications (types métier)** : `tae_modified`, `tae_commented`, `doc_updated`, etc. — table `notifications` ([ARCHITECTURE.md](./ARCHITECTURE.md)). Listes détaillées cliquables et temps réel : souvent encore à enrichir ([BACKLOG.md](./BACKLOG.md)).

**Indice de confiance** : agrégation des votes sur les TAÉ de l’auteur ; règles d’affichage détaillées historiquement dans l’ancienne spec dashboard — à réconcilier avec l’UI actuelle si l’écart est visible.

## 13. Banque collaborative (vue produit)

### 13.1 Module création de documents historiques (parcours autonome)

**Statut : livré (mars 2026).** Parcours **hors wizard TAÉ** pour publier un document dans la banque : route **`/documents/new`** (wizard en **3** étapes, split + aperçu comme la création de tâche), entrée sidebar **Créer un document** ([UI-COPY.md](./UI-COPY.md#composants-transversaux) — Sidebar, [DECISIONS.md](./DECISIONS.md#navigation--création-documents-historiques)), enregistrement via Server Action (`createAutonomousDocumentAction`), confort **brouillon local** `sessionStorage` jusqu’au clic **Enregistrer** (pas de ligne `documents` brouillon en base — §5.5), fiche lecture **`/documents/[id]`** avec compteur d’usages, **édition auteur** **`/documents/[id]/edit`** (`updateAutonomousDocumentAction`).

**Documents iconographiques (métadonnée enseignant) :** colonne **`documents.type_iconographique`** (texte, optionnel) — catégorie didactique (carte, photographie, etc.) pour la recherche en banque et l’affichage fiche / liste ; **non** repris sur la feuille élève. Saisie : wizard autonome, Bloc 4 TAÉ (création de document dans le slot), édition autonome ; publication TAÉ via RPC (`publish_tache_transaction` / `update_tache_transaction` — payload `documents_new[].type_iconographique`).

**Implémentation (repères) :** `app/(app)/documents/new/`, `components/documents/` (dont `wizard/AutonomousDocumentWizard.tsx`), `lib/actions/create-autonomous-document.ts`, `lib/documents/document-wizard-draft.ts`. Parcours détaillé : [WORKFLOWS.md](./WORKFLOWS.md) § Wizard « Créer un document » ; routes : [ARCHITECTURE.md](./ARCHITECTURE.md) ; copy : [UI-COPY.md](./UI-COPY.md#module-documents-historiques) ; règles / mapping : [DECISIONS.md](./DECISIONS.md#module-documents-historiques--périmètre-données-intégration) ; document de travail : [module-dcuments-historiques.md](./module-dcuments-historiques.md).

**Limites alignées [BACKLOG.md](./BACKLOG.md) :** stockage Supabase **F4** si l’upload iconographique doit être garanti en prod.

### 13.2 Page Banque `/bank`

**Route Next.js :** `/bank`. **Intention produit :** point d’entrée **unique** dans la navigation, libellé au **singulier** « Banque collaborative » ([UI-COPY.md](./UI-COPY.md#composants-transversaux) — Sidebar) — onglets **Tâches** / **Documents historiques** / **Épreuves**. **Livré :** onglet **Tâches** — liste paginée (vue **`banque_tache`**), filtres §8.2 (libellés UI : opération intellectuelle, comportement attendu, niveau scolaire, discipline, aspects de société, compétence disciplinaire (filtre technique sur le numéro du critère Miller — voir `BANK_TASK_FILTER_CD_HINT` dans [UI-COPY.md](./UI-COPY.md#page--banque-collaborative)), connaissances relatives), recherche consigne (`consigne_search_plain`), tri récent / popularité, **Charger plus** ; onglet **Documents historiques** — liste paginée, filtres de base (**niveau scolaire**, type de document, **catégorie iconographique** en multichoix si type ≠ textuel, param `icat`), **Charger plus**, **`/documents/new`**, fiche **`/documents/[id]`** ; onglet **Épreuves** — liste paginée des épreuves publiées, recherche par titre, lien **Modifier** si l’utilisateur est l’auteur ; filtres épreuves dérivés — phase 2 ([plan-banque-collaborative.md](./plan-banque-collaborative.md)). Favoris / cartes riches — [BACKLOG.md](./BACKLOG.md). **Copy écran :** [UI-COPY.md](./UI-COPY.md#page--banque-collaborative), [DECISIONS.md](./DECISIONS.md#terminologie-ui--pas-dacronymes-interdits).
