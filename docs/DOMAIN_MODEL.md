# DOMAIN_MODEL.md

> **Modèle de domaine d'ÉduQc.IA.** Décrit les entités métier, leurs relations, les règles produit et les invariants architecturaux — indépendamment de l'implémentation actuelle. Complémentaire à `ARCHITECTURE.md` (archi technique) : ce document traite du **quoi** et du **pourquoi**, pas du **comment**.
>
> **Usages prévus** :
>
> - Auditer le code existant et identifier les écarts
> - Conditionner toute spec d'implémentation future (voir §9 checklist)
> - Onboarder un nouveau contributeur (humain ou agent LLM)
>
> **Maintenance** : à mettre à jour à chaque évolution du domaine. Si une feature livre quelque chose qui contredit ce document, soit la feature est mauvaise, soit le document est obsolète — il faut trancher, pas coexister.
>
> **Passe 1 intégrée.** Les noms de code et chemins de fichiers proviennent de l'audit passe 1 (`docs/audit/phase1-vocabulaire.md`). Les `[À VÉRIFIER]` ont été remplacés par les noms réels. Les dettes de nommage découvertes sont documentées en §1.4.

---

## 1. Glossaire et contrat de nommage

Ce glossaire est **autoritaire**. Tout code, toute UI, toute doc, toute spec, tout prompt LLM doit respecter ces noms. Les divergences existantes sont listées comme dette à résoudre.

### 1.1 Entités et concepts principaux

| Concept                                                   | Nom UI (enseignant)                                                         | Nom code                                                                                                        | Nom DB                                              | Fichier principal                                     |
| --------------------------------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ----------------------------------------------------- |
| Document autonome                                         | **Document**                                                                | `Document` / `RendererDocument`                                                                                 | `documents`                                         | `lib/types/document-renderer.ts`                      |
| Tâche d'apprentissage et d'évaluation                     | **Tâche** (ou forme longue **TAÉ** quand le contexte éditorial l'exige)     | `DonneesTache` / `Tache` (**jamais `Tae`, jamais `Task`**)                                                      | `tae` (**dette — devrait être `taches`**)           | `lib/tache/contrats/donnees.ts`                       |
| Regroupement de tâches                                    | **Épreuve**                                                                 | `DonneesEpreuve` / `Epreuve`                                                                                    | `evaluations` (**dette — devrait être `epreuves`**) | `lib/epreuve/contrats/donnees.ts`                     |
| Opération intellectuelle                                  | **Opération intellectuelle** (forme longue toujours, **jamais `OI` en UI**) | `oi` toléré en code                                                                                             | référentiel `public/data/oi.json`                   | `public/data/oi.json`                                 |
| Outil d'évaluation (familièrement : grille de correction) | **Outil d'évaluation**                                                      | `OutilEvaluation`                                                                                               | colonne `comportements.outil_evaluation`            | `lib/tache/contrats/donnees.ts:41`                    |
| Espace de production                                      | **Espace de production**                                                    | `EspaceProduction` (union discriminée : `lignes` / `cases` / `libre`)                                           | valeurs stockées sur la tâche                       | `lib/tache/contrats/donnees.ts:47`                    |
| Appel documentaire                                        | **Appel documentaire**                                                      | `buildAmorceDocumentaire` / `insertAmorceDocumentaire` (**dette D3 — code dit `amorce`, devrait dire `appel`**) | - (dérivé, généré)                                  | `lib/tae/consigne-helpers.ts`                         |
| Consigne                                                  | **Consigne**                                                                | `FormState.redaction.consigne`                                                                                  | `tae.consigne`                                      | `lib/tae/tae-form-state-types.ts`                     |
| Guidage complémentaire                                    | **Guidage complémentaire**                                                  | `Guidage` / `FormState.redaction.guidage`                                                                       | `tae.guidage`                                       | `lib/tache/contrats/donnees.ts:16`                    |
| Production attendue                                       | **Production attendue** (UI) / `corrige` (code/DB) — **divergence assumée** | `FormState.bloc5.corrige` / `selectCorrige`                                                                     | `tae.corrige`                                       | `lib/fiche/selectors/selectCorrige.ts`                |
| Notes au correcteur                                       | **Notes au correcteur**                                                     | `FormState.bloc5.notesCorrecteur`                                                                               | **colonne SQL à créer** — `tae.notes_correcteur`    | `lib/tae/tae-form-state-types.ts`                     |
| Comportement attendu                                      | **Comportement attendu**                                                    | `ComportementPicker`                                                                                            | table `comportements`                               | `components/tae/TaeForm/bloc2/ComportementPicker.tsx` |
| Repère temporel                                           | **Repère temporel**                                                         | `RepereTemporelField`                                                                                           | `documents.repere_temporel`                         | `components/ui/RepereTemporelField.tsx`               |
| Année normalisée                                          | **Année normalisée**                                                        | `extract-year.ts` / `document-annee.ts`                                                                         | `documents.annee_normalisee`                        | `lib/utils/extract-year.ts`                           |
| Espace personnel                                          | **Mes documents** / **Mes tâches** / **Mes épreuves**                       | routes `/documents`, `/questions` (**dette**), `/evaluations` (**dette**)                                       | -                                                   | `components/layout/Sidebar.tsx`                       |
| Espace partagé                                            | **Banque collaborative** (3 onglets)                                        | `bank` / `BankDocumentsPanel`, `BankTasksPanel`, `BankEvaluationsPanel`                                         | -                                                   | `components/bank/`                                    |
| Copie de l'élève                                          | **Copie de l'élève**                                                        | rendu via `ApercuImpression`                                                                                    | - (rendu, pas entité)                               | `components/epreuve/impression/index.tsx`             |
| Interface guidée de création/édition                      | **Assistant de création** (en UI/doc publique)                              | `Wizard` / `wizard` (conservé en code)                                                                          | -                                                   | -                                                     |

### 1.2 Modes de rendu (canoniques)

| Mode                                        | Nom UI             | Valeur code (`FicheMode`)            | Description                                           |
| ------------------------------------------- | ------------------ | ------------------------------------ | ----------------------------------------------------- |
| Validation complétude dans le wizard        | **Sommaire**       | `"sommaire"`                         | Affichage structuré par sections                      |
| Consultation d'une ressource (full page)    | **Vue détaillée**  | `"lecture"`                          | Affichage complet pour observer, analyser, comprendre |
| Rendu pixel-perfect 8,5×11                  | **Aperçu imprimé** | pipeline séparé (`ApercuImpression`) | Rendu fidèle, avec variantes de composition           |
| Affichage compact pour listes et sélecteurs | **Miniature**      | `"thumbnail"`                        | Rendu minimal pour identification                     |

**Note** : `FicheMode` (dans `lib/fiche/types.ts:16`) contient 3 valeurs : `"sommaire"`, `"lecture"`, `"thumbnail"`. L'aperçu imprimé est un **pipeline séparé** (`ApercuImpression` dans `components/epreuve/impression/index.tsx`), pas une valeur de `FicheMode`.

### 1.3 Variantes d'aperçu imprimé (épreuve principalement)

| Variante UI                      | Valeur code (`ModeImpression`)                                   | Feuillets                                                              |
| -------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Formatif                         | `"formatif"`                                                     | 1 feuillet continu                                                     |
| Sommatif standard                | `"sommatif-standard"`                                            | 2 feuillets                                                            |
| Sommatif "Épreuve ministérielle" | `"epreuve-ministerielle"`                                        | 3 feuillets : Dossier documentaire / Questionnaire / Cahier de réponse |
| Corrigé                          | `estCorrige: boolean` (flag orthogonal sur `ContexteImpression`) | Combinable avec les 3 variantes ci-dessus                              |

Types de feuillets : `TypeFeuillet = "dossier-documentaire" | "questionnaire" | "cahier-reponses"` (`lib/epreuve/pagination/types.ts`).

### 1.4 Dettes de nommage connues

| #   | Terme DOMAIN                     | Forme code actuelle                                                     | Qualification                                                                              | Plan                                                                                           |
| --- | -------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| D1  | Tâche                            | `tae` (SQL), `Tae*` (composants), `/questions` (route)                  | Migration partielle vers `Tache` en cours                                                  | Renommer SQL, composants, route                                                                |
| D2  | Épreuve                          | `evaluations` (SQL), `Evaluation*` (composants), `/evaluations` (route) | Migration partielle vers `Epreuve` en cours                                                | Renommer SQL, composants, route                                                                |
| D3  | Appel documentaire               | `amorce*` / `amorceDocumentaire`                                        | Terme code diverge du terme didactique                                                     | Renommer en `appel*` / `appelDocumentaire`                                                     |
| D4  | Production attendue              | `corrige` (code + SQL)                                                  | **Divergence assumée** — UI dit "Production attendue", code garde `corrige`                | Pas de renommage. Documenter la correspondance                                                 |
| D5  | Banque collaborative             | `bank` (route + composants)                                             | Anglicisme technique accepté                                                               | Pas de renommage                                                                               |
| D6  | Miniature                        | `thumbnail` (FicheMode + composants)                                    | Anglicisme technique accepté                                                               | Pas de renommage                                                                               |
| D7  | Éditeur de composition d'épreuve | `EvaluationCompositionEditor`                                           | Ni "wizard" ni "épreuve" dans le nom                                                       | Renommer composant en cohérence                                                                |
| D8  | Ressources épinglées             | `favoris` (SQL) / `favori_type` (enum)                                  | Feature ébauchée, table à renommer, colonne `notes` à supprimer, trigger cascade à ajouter | Renommer `favoris` → `ressources_epinglees`, supprimer `notes TEXT`, ajouter ON DELETE cascade |
| D9  | Vue détaillée                    | `"lecture"` dans FicheMode                                              | Nom code non évident                                                                       | Acceptable — documenter la correspondance                                                      |
| D10 | Notes au correcteur              | `notesCorrecteur` en FormState, **aucune colonne SQL**                  | Colonne manquante                                                                          | Créer `tae.notes_correcteur` en DB                                                             |
| D11 | Wizard tâche : ids d'étapes      | `cd` au lieu de `competence-disciplinaire`                              | Nommage abrégé                                                                             | Dette mineure                                                                                  |

---

## 2. Entités stockées

Trois entités stockées, toutes autonomes, toutes stockables dans un espace personnel ou partagé, toutes avec leur propre indexation et leur propre cycle de vie.

### 2.1 Document

**Nature** : entité autonome de premier niveau. Existe indépendamment de toute tâche.

**Création** : par l'**assistant de création de document** (en code : `AutonomousDocumentWizard` / `AutonomousDocumentForm`), invoqué depuis deux points d'entrée distincts :

1. Directement depuis l'assistant de création de document (accès depuis le dashboard, "Mes documents", ou tout lien dédié)
2. Depuis l'étape 4 de l'assistant de création de tâche (en code : `DocumentSlotCreateForm`), quand l'enseignant a besoin d'un document qui n'existe pas encore

**Dans les deux cas, le composant de création doit être le même — c'est uniquement le contexte d'invocation qui change** (champs visibles, defaults d'indexation). La passe 1 a identifié deux composants distincts (`AutonomousDocumentForm` et `DocumentSlotCreateForm`) : **candidat violation INV-S2, à confirmer en passe 2**.

**Composants de rendu** :

- Composant canonique : `DocumentCard` (`components/documents/DocumentCard.tsx`)
- Renderer d'élément : `DocumentElementRenderer` (`components/documents/DocumentElementRenderer.tsx`)
- Variantes par mode : `DocumentCardPrint`, `DocumentCardSommaire`, `DocumentCardReader`, `DocumentCardThumbnail`
- Structures internes : `DocumentStructure = "simple" | "perspectives" | "deux_temps"`

**Attributs principaux** :

- Type : textuel ou iconographique
- Titre
- Contenu (texte ou image)
- Source
- Légende (pour iconographique) + position de la légende sur l'image
- **Repère temporel** (`documents.repere_temporel`) : texte libre, attribut **du document lui-même**. Jamais affiché sur l'aperçu imprimé. Visible en vue détaillée.
- **Année normalisée** (`documents.annee_normalisee`) : entier dérivé automatiquement si le repère contient une année sur 4 chiffres, modifiable à la main.
- Indexation (voir §2.4)

**Rendus** : voir §4

- Sommaire (dans le wizard uniquement)
- Vue détaillée (consultation full page)
- Aperçu imprimé (document en haut d'une feuille 8,5×11 — **une seule variante, pas de formatif/sommatif**)
- Miniature (pour "Mes documents", banque collaborative, sélecteurs)

### 2.2 Tâche

**Nature** : entité composite. Référence des documents, mais ne les contient pas — elle pointe vers eux. Les documents référencés restent des entités autonomes.

**Type domaine** : `DonneesTache` (`lib/tache/contrats/donnees.ts:63`).
**État wizard** : `FormState` à 7 blocs (`lib/tae/tae-form-state-types.ts`).

**Attributs principaux** :

- Consigne (`tae.consigne`)
- Appel documentaire (dérivé, voir §3.3)
- Guidage complémentaire (optionnel, `tae.guidage`)
- Références ordonnées à des documents (0 à N, fixé par le comportement attendu, table `tae_documents`)
- Opération intellectuelle choisie
- Comportement attendu choisi
- Paramètres d'espace de production par opération intellectuelle (voir §3.2)
- Production attendue / clé de correction (`tae.corrige`)
- Notes au correcteur (`FormState.bloc5.notesCorrecteur` — persistance SQL à ajouter, D10)
- Indexation pédagogique (voir §2.4)

**Création** : par l'**assistant de création de tâche** en 7 étapes (voir §5). L'assistant peut invoquer l'assistant de création de document à l'étape 4. **Tout document créé in situ est immédiatement enregistré dans la banque comme document autonome** — il n'existe pas de "document captif d'une tâche".

**Composants** :

- Wizard : `components/tae/TaeForm/` (stepper, blocs 1-7)
- Vue détaillée (nouveau) : `components/tache/vue-detaillee/`
- Vue détaillée (legacy) : `FicheLecture` (`components/tae/FicheLecture.tsx`)
- Miniature : `FicheThumbnail` (`components/tae/FicheThumbnail.tsx`)

**Rendus** : voir §4

- Sommaire
- Vue détaillée
- Aperçu imprimé (**variantes possibles mais accessoires pour une tâche isolée**, voir §4.3)
- Miniature

### 2.3 Épreuve

**Nature** : entité composite de plus haut niveau. Sélectionne et ordonne des tâches.

**Type domaine** : `DonneesEpreuve` (`lib/epreuve/contrats/donnees.ts:18`).

**Attributs principaux** :

- Titre
- En-tête (`EnTeteEpreuve`)
- Pied de page
- Indexation propre
- Sélection ordonnée de tâches (table pivot `evaluation_tae`)

**Numérotation** : la numérotation des tâches et des documents affichés est **dérivée du rang dans l'épreuve**, jamais stockée sur les entités. Les identifiants A/B/C dans une consigne sont des **tokens encodés** qui résolvent au runtime selon le contexte.

**Création** : par l'**éditeur de composition d'épreuve** (en code : `EvaluationCompositionEditor`). **Ce n'est pas un wizard en étapes** mais un éditeur de composition directe, avec 3 zones :

- **Panneau droit** (toute la hauteur) : pile de tâches sélectionnées, réordonnables en drag & drop
- **Panneau haut** : champs de l'épreuve (titre, en-tête, pied de page, indexation)
- **Panneau bas** : sélecteur de tâches avec 3 onglets (Mes tâches / Tâches épinglées / Banque collaborative)

**Composants** :

- Éditeur : `EvaluationCompositionEditor` (`components/evaluations/`)
- Vue détaillée print : `EvaluationFichePrintView`
- Renderer impression : `ApercuImpression` (`components/epreuve/impression/index.tsx`)
- Pagination : `lib/epreuve/pagination/`

**Rendus** : voir §4

- Sommaire
- Vue détaillée
- Aperçu imprimé (**les 4 variantes sont centrales ici**, voir §4.3)
- Miniature

### 2.4 Indexation pédagogique

L'indexation est structurée en plusieurs dimensions :

- Niveau scolaire
- Discipline
- Opération intellectuelle
- Comportement attendu
- Compétence disciplinaire (compétence → composante → critère d'évaluation)
- Aspects de la réalité sociale visés
- Connaissances du programme

**Règles d'indexation selon le point de création** :

- **Document créé depuis l'accès direct** : indexation complète saisie par l'enseignant dans l'assistant de création de document.
- **Document créé in situ depuis l'assistant de création de tâche (étape 4)** : indexation **allégée** — le document hérite des dimensions pertinentes de la tâche hôte. Une fois créé, le document est autonome : son indexation peut évoluer indépendamment de la tâche.
- **Tâche** : indexation propre, saisie dans l'assistant de création de tâche (étapes 2, 6, 7).
- **Épreuve** : indexation propre, saisie dans l'éditeur de composition d'épreuve.

---

## 3. Entités dérivées

Ces entités n'ont pas de cycle de vie propre. Elles sont **calculées** depuis les attributs d'une entité stockée (tâche principalement). Elles n'ont pas de wizard de création — toute idée de "wizard d'outil d'évaluation" ou "wizard d'appel documentaire" serait une violation de cette section.

### 3.1 Outil d'évaluation

**Nom UI** : **outil d'évaluation**. "Grille de correction" est le terme familier/oral, pas le nom canonique.

**Nom code** : `OutilEvaluation` (`lib/tache/contrats/donnees.ts:41`). Registry des grilles : `grille-registry.tsx`.

**Nature** : invariable, fixe, conforme aux standards ministériels. Non modifiable par l'enseignant.

**Résolution** : `(opération intellectuelle, comportement attendu) → outil d'évaluation`. Pur lookup dans la table `comportements` (colonne `outil_evaluation`).

**Stockage** : aucun stockage par tâche. Propagé vers la tâche via `DonneesTache.outilEvaluation`.

**Section imprimée** : `SectionOutilEvaluation` (`components/epreuve/impression/sections/outil-evaluation.tsx`).

**Apparition dans les rendus** :

- Sommaire de tâche : visible
- Vue détaillée de tâche : visible
- Aperçu imprimé de tâche : visible selon la variante (voir §4.3)
- Miniature : invisible

### 3.2 Espace de production

**Nom code** : `EspaceProduction` = `{ type: "lignes" } | { type: "cases" } | { type: "libre" }` (`lib/tache/contrats/donnees.ts:47`).

**Nature** : hybride — schéma dérivé + valeurs paramétrables.

**Résolution en trois temps** :

1. **Type** depuis l'opération intellectuelle et le comportement attendu
   - Rédactionnel → type `"lignes"` (nombre de lignes déduit des données ministérielles, pas de saisie manuelle)
   - Non rédactionnel → types variés (`"cases"`, `"libre"`, etc.) [À COMPLÉTER : liste exhaustive]
2. **Schéma de paramètres** depuis le type : chaque type définit ses paramètres et leurs defaults
3. **Valeurs** saisies par l'enseignant dans l'assistant de création de tâche (pour les types non rédactionnels paramétrables), **stockées sur la tâche**

**Composants** :

- Lecture seule wizard (Bloc 2) : `Bloc2EspaceProductionReadonly`
- Section imprimée : `SectionEspaceProduction` (`components/epreuve/impression/sections/espace-production.tsx`)

**Apparition dans les rendus** :

- Sommaire : affiche les paramètres (ex : "15 lignes attendues")
- Vue détaillée : affiche les paramètres
- Aperçu imprimé : affiche l'espace réel. En variante "corrigé", la production attendue y est affichée à la place.
- Miniature : indicateur de présence seulement

### 3.3 Appel documentaire

**Nom UI** : **appel documentaire**. **Nom code actuel** : `amorceDocumentaire` / `buildAmorceDocumentaire` — **dette D3, à renommer en `appelDocumentaire`**.

**Fichiers** : `lib/tae/consigne-helpers.ts`, `components/tae/TaeForm/tiptap/insertAmorce.ts`.

**Nature** : fragment **pré-inséré automatiquement** au début de la consigne, indiquant à l'élève le ou les documents à consulter. Librement modifiable ou supprimable par l'enseignant.

**Pré-insertion** : `(nombre de documents de la tâche) → formulation par défaut`

- 1 document → « Consultez le document A. »
- 2 documents → « Consultez les documents A et B. »
- etc.

**Pastilles de référence** : l'éditeur de consigne (TipTap) propose des boutons dédiés pour insérer des **pastilles** référençant les documents (en code : `docRefSpan`). Ces pastilles sont des **tokens encodés** qui apparaissent visuellement distincts pendant la rédaction, et se transforment en texte normal sur la copie de l'élève. Elles permettent la **renumérotation automatique** selon le contexte.

**Helpers** : `buildAmorceDocumentaire`, `buildAmorceDocumentaireHtml`, `stripAmorceDocumentaireForMiniature`, `insertAmorceDocumentaire`.

**Comportement produit** :

- Pré-inséré automatiquement en début de consigne par l'assistant de création de tâche
- L'enseignant peut le modifier ou le retirer librement
- Dans les miniatures et listes de banque : la partie pré-insérée est **retirée automatiquement** (`stripAmorceDocumentaireForMiniature`)
- Sur la copie de l'élève : affiché intégralement

### 3.4 Numérotation

**Fichiers** : `lib/epreuve/transformation/renumerotation.ts`, `lib/epreuve/transformation/epreuve-vers-paginee.ts`.

**Nature** : entièrement dérivée du rang dans l'épreuve.

**Fonctions** : `aplatirDocumentsAvecNumeros`, `resoudreReferencesDocuments`, appelées par `epreuveVersImprimable`.

**Règle** : un document n'a pas de numéro stocké. Les numéros affichés sont calculés par le renderer au moment du rendu, depuis la position dans l'épreuve courante.

---

## 4. Modes de rendu

### 4.1 Les 4 modes

| Mode               | Nom UI         | Valeur code                          | Usage                                         | Surfaces                                         |
| ------------------ | -------------- | ------------------------------------ | --------------------------------------------- | ------------------------------------------------ |
| **Sommaire**       | Sommaire       | `"sommaire"` (`FicheMode`)           | Valider la complétude dans le wizard          | Panneau d'aperçu du wizard                       |
| **Vue détaillée**  | Vue détaillée  | `"lecture"` (`FicheMode`)            | Consulter, analyser, comprendre une ressource | Full page après clic sur une ressource           |
| **Aperçu imprimé** | Aperçu imprimé | Pipeline séparé (`ApercuImpression`) | Rendu fidèle 8,5×11 pour impression/PDF       | Panneau aperçu wizard, vue détaillée, export PDF |
| **Miniature**      | Miniature      | `"thumbnail"` (`FicheMode`)          | Identification visuelle compacte              | "Mes X", banque, sélecteurs                      |

### 4.2 Composants canoniques de rendu

**Document** :

- Composant canonique : `DocumentCard` avec variantes par mode (`DocumentCardSommaire`, `DocumentCardReader`, `DocumentCardPrint`, `DocumentCardThumbnail`)
- Renderer d'élément : `DocumentElementRenderer`
- Tout rendu de contenu de document, **dans n'importe quelle surface, pour n'importe quel mode**, passe par ces composants. Aucune réimplémentation n'est autorisée.

**Tâche** :

- Pipeline `FicheRenderer` (`lib/fiche/FicheRenderer.tsx`) avec mode `FicheMode`
- Selectors par section (`selectGuidage`, `selectCorrige`, etc.)
- Vue détaillée : `components/tache/vue-detaillee/`

**Épreuve / Impression** :

- Pipeline unifié : `ApercuImpression` (`components/epreuve/impression/index.tsx`)
- Type de sortie : `RenduImprimable` (`lib/impression/types.ts`)
- Contexte : `ContexteImpression = { type: "document" } | { type: "tache", mode, estCorrige } | { type: "epreuve", mode, estCorrige }`
- Transformation : `epreuveVersImprimable` (`lib/epreuve/transformation/epreuve-vers-paginee.ts`)
- Sections : `SectionPage`, `SectionDocument`, `SectionQuadruplet`, `SectionCorrige`, `SectionOutilEvaluation`, `SectionEspaceProduction`

### 4.3 Aperçu imprimé : variantes

L'aperçu imprimé a **3 variantes** (`ModeImpression`) + **1 flag orthogonal** (`estCorrige`) :

1. **Formatif** (`"formatif"`) : documents + tâche enchaînés, guidage visible. 1 feuillet continu.
2. **Sommatif standard** (`"sommatif-standard"`) : documents sur feuille 1, tâche sur feuille 2. Guidage masqué.
3. **Sommatif "Épreuve ministérielle"** (`"epreuve-ministerielle"`) : 3 feuillets — `"dossier-documentaire"` / `"questionnaire"` / `"cahier-reponses"`.
4. **Corrigé** (`estCorrige: boolean`) : flag **orthogonal** combinable avec les 3 variantes ci-dessus. Affiche la production attendue dans l'espace de production.

**Règles de visibilité** par mode : `lib/impression/builders/regles-visibilite.ts`.
**Composition par mode** : `lib/epreuve/transformation/epreuve-vers-paginee.ts:195-223`.

**Règles d'application** :

- **Document seul** : aucune variante. Un seul format d'aperçu imprimé.
- **Tâche seule** : variantes techniquement disponibles mais **accessoires**. À reconsidérer si elles doivent être exposées dans l'UI pour une tâche isolée.
- **Épreuve** : les variantes sont **centrales**, c'est le cas d'usage principal.

### 4.4 Délégation hiérarchique

Les renderers de niveau supérieur **délèguent**, ils ne re-rendent jamais le contenu d'un niveau inférieur :

```
ApercuImpression(contexte: ContexteImpression)
  ├─ rend ses propres champs (titre, en-tête, pied de page, numérotation)
  ├─ applique la règle de composition selon ModeImpression (1/2/3 feuillets)
  └─ pour chaque tâche → sections de tâche (consigne, guidage, outil, espace)
       └─ pour chaque document référencé → SectionDocument (rendu canonique)
```

**Le mode de rendu se propage intact** le long de la chaîne. La **variante** est une règle de composition du niveau épreuve — elle n'altère pas le rendu intrinsèque des éléments enfants.

### 4.5 Axe formatif/sommatif

Le paramètre formatif/sommatif n'est **pas** un mode de rendu au sens des 4 modes. C'est un **paramètre d'une variante d'aperçu imprimé**. Il affecte principalement la visibilité du guidage complémentaire (visible en formatif, masqué en sommatif).

### 4.6 Cohérence entre wizard et vue détaillée

Le panneau d'aperçu du wizard doit proposer :

- **Sommaire** (vue structurée pour validation de complétude)
- **Aperçu imprimé** (une seule variante par défaut, pour validation visuelle)

Les variantes (formatif/sommatif/ministériel/corrigé) ne sont **pas** sélectionnables dans le wizard. Elles appartiennent à la vue détaillée de l'entité, une fois celle-ci créée.

---

## 5. Assistants de création et éditeurs

### 5.1 Assistant de création de document (wizard document)

**En code** : `AutonomousDocumentWizard` / `AutonomousDocumentForm`.

Unique composant de création/édition d'un document, invoqué depuis :

- Accès direct depuis le dashboard ou "Mes documents" (création standalone, indexation complète)
- Étape 4 de l'assistant de création de tâche (création in situ, indexation allégée héritée)

**Note passe 1** : le Bloc 4 du wizard tâche utilise `DocumentSlotCreateForm` — à vérifier si ce composant réutilise `AutonomousDocumentForm` ou duplique la logique (candidat INV-S2).

Champs saisis : type, titre, contenu, source, légende, repère temporel, indexation.

### 5.2 Assistant de création de tâche (7 étapes) — wizard tâche en code

**En code** : `components/tae/TaeForm/`, stepper dans `Stepper.tsx`, méta-étapes dans `step-meta.ts` (`TAE_FORM_STEPS`).

1. **Auteurs** (`auteurs`) : enseignant unique ou collaborateurs
2. **Paramètres pédagogiques** (`parametres`) : niveau, discipline, opération intellectuelle, comportement attendu — **verrouillables**. Le déverrouillage réinitialise les étapes dépendantes.
3. **Consigne et guidage** (`consigne`) : éditeur TipTap, insertion de pastilles, appel documentaire pré-inséré, guidage optionnel
4. **Documents** (`documents`) : remplissage des emplacements, création in situ ou sélection depuis la banque, réordonnancement drag & drop
5. **Corrigé et notes au correcteur** (`corrige`) : production attendue, notes au correcteur, rappel outil d'évaluation en lecture seule
6. **Compétence disciplinaire** (`cd`) : navigation par colonnes cascadées
7. **Aspects de société et connaissances** (`connaissances`) : sélection dans le référentiel structuré

**Parcours différenciés selon l'opération intellectuelle** : les OI non rédactionnelles ont des sous-parcours spécifiques aux étapes 3-5. [À COMPLÉTER : recensement exhaustif]

### 5.3 Éditeur de composition d'épreuve

**En code** : `EvaluationCompositionEditor` (`components/evaluations/`).

**Ce n'est pas un wizard en étapes.** C'est un éditeur de composition directe avec 3 zones :

- **Panneau droit** (toute la hauteur) : pile de tâches sélectionnées, réordonnables en drag & drop
- **Panneau haut** : champs de l'épreuve (titre, en-tête, pied de page, indexation)
- **Panneau bas** : sélecteur de tâches avec 3 onglets (Mes tâches / Tâches épinglées / Banque collaborative)

Renumérotation automatique des tâches et documents au rang.

---

## 6. Espaces utilisateur

### 6.1 Dashboard

Point d'entrée personnel de l'enseignant (route `/dashboard`). Affiche les **ressources épinglées** (voir §6.4) et les accès rapides.

### 6.2 Espaces personnels

| Espace            | Route                         | Libellé UI    |
| ----------------- | ----------------------------- | ------------- |
| **Mes documents** | `/documents`                  | Mes documents |
| **Mes tâches**    | `/questions` (**dette D1**)   | Mes tâches    |
| **Mes épreuves**  | `/evaluations` (**dette D2**) | Mes épreuves  |

### 6.3 Banque collaborative

Route `/bank`. Espace partagé avec **3 onglets** : `BankDocumentsPanel`, `BankTasksPanel`, `BankEvaluationsPanel`.

### 6.4 Ressources épinglées

**Statut** : feature **en cours de construction** (table `favoris` existe, UI ébauchée avec toast "à venir").

**Table SQL actuelle** : `favoris` avec enum `favori_type = ('tae','document','evaluation')`. **Dette D8** : renommer `favoris` → `ressources_epinglees`, et aligner les valeurs de l'enum avec les noms canoniques.

**Point architectural** : un épinglage est une **référence**, pas une duplication. Aucun épinglage ne produit de copie. Pour une copie personnelle, l'enseignant doit **dupliquer** explicitement. Un épinglage est un **lien pur** — aucune annotation, aucune métadonnée utilisateur au-delà du lien lui-même. La suppression d'une ressource source entraîne la suppression automatique de tous ses épinglages.

### 6.5 Règles de partage et versionnage

[À COMPLÉTER]

### 6.6 Modification d'un document partagé

Quand un document est modifié alors qu'il est utilisé par N tâches, la plateforme avertit l'enseignant. Deux options :

- **Modifier** : la modification se propage à toutes les tâches référençant le document et à tous les épinglages
- **Dupliquer** : crée une variante personnelle modifiable sans affecter l'original

---

## 7. Règles produit explicites

Ces règles sont des décisions produit, pas des contraintes techniques.

1. **Pas de rupture de contexte pour créer un document depuis une tâche.** L'enseignant qui réalise dans l'assistant de création de tâche qu'il lui manque un document doit pouvoir le créer in situ, sans quitter l'assistant en cours.

2. **Un document créé in situ est autonome dès la publication de la tâche.** La création du document est couplée à la publication de la tâche via `publish_tae_transaction` pour éviter les documents orphelins. Tant que la tâche n'est pas publiée, les données du document ne vivent que dans le brouillon du wizard.

3. **L'indexation héritée n'est qu'un default.** Le document hérite de l'indexation de la tâche hôte à la création, mais son indexation peut évoluer indépendamment ensuite.

4. **L'outil d'évaluation n'est jamais édité par l'enseignant.** Modifier la correspondance `(OI, comportement) → outil` est une opération admin/système.

5. **L'espace de production est cadré par le type.** Paramètres définis par le schéma du type, déterminé par l'OI et le comportement.

6. **La numérotation est contextuelle, jamais identitaire.** Dérivée de la position dans la tâche/épreuve.

7. **Le repère temporel et l'année normalisée sont des attributs du document.** Pas de la jointure tâche-document. Visibles en vue détaillée, jamais sur la copie de l'élève.

8. **Pas d'abréviations pour les utilisateurs finaux.** "Opération intellectuelle" en toutes lettres, jamais "OI" en UI.

9. **Un composant, une responsabilité, une implémentation.** Toute duplication est une dette.

### Règles à reconsidérer

- **Verrouillage du bloc 2** de l'assistant de création de tâche : réinitialisation des étapes dépendantes. Potentiellement frustrant.
- **Variantes d'aperçu imprimé pour une tâche isolée** : techniquement présentes, peu utiles. Envisager de ne les exposer que pour l'épreuve.
- **Complexité de l'appel documentaire** (tokens encodés, résolution contextuelle) : coût d'implémentation élevé.

### Fonctionnalités à améliorer (backlog produit)

- **Validation automatique de la cohérence année-frise** : aucun message ne signale un écart actuellement.
- **Gestion des dates anciennes et avant notre ère** : détection automatique limitée aux années à 4 chiffres.

---

## 8. Invariants

Ces invariants doivent être vérifiables dans le code. Chacun a une formulation testable.

### 8.1 Invariants de structure

**INV-S1** — Un document existe toujours de manière autonome dans la banque. Aucun chemin de création ne produit un document captif. Un document créé in situ (étape 4 du wizard tâche) devient autonome dès la publication de la tâche — la création est couplée à la publication pour éviter les documents orphelins.

> **Test** : vérifier qu'après publication d'une tâche contenant un document créé in situ, ce document existe dans la table `documents` avec son propre `id` et est accessible indépendamment de la tâche.

**INV-S2** — Une seule implémentation de création de document existe. Les deux points d'entrée (`AutonomousDocumentWizard` et le Bloc 4 du wizard tâche) doivent utiliser le même composant, paramétré différemment.

> **Test** : vérifier si `DocumentSlotCreateForm` importe et réutilise `AutonomousDocumentWizard`/`AutonomousDocumentForm`, ou duplique sa logique.
> **Statut passe 2 : ❌ VIOLATION CONFIRMÉE.** `DocumentSlotCreateForm` est une implémentation entièrement distincte — composants, modèle de données (`DocumentSlotData` vs `AutonomousDocumentFormValues`), validation (ad hoc vs Zod), persistance (RPC vs server action), et couverture fonctionnelle (structure `simple` uniquement vs `simple`/`perspectives`/`deux_temps`). **Refactoring prioritaire #1.**

**INV-S3** — Outil d'évaluation et appel documentaire ne sont jamais des entités CRUD. Aucune table de stockage ne les représente comme entités de premier niveau.

**INV-S4** — La numérotation des tâches et documents est dérivée du rang. Aucun champ "numéro" n'est stocké.

**INV-S5** — Le repère temporel et l'année normalisée sont des attributs du document (`documents.repere_temporel`, `documents.annee_normalisee`), pas de la jointure tâche-document.

**INV-S6** — Un épinglage est un lien pur vers une ressource, jamais une duplication. La table des épinglages (`favoris` / future `ressources_epinglees`) ne contient que des références (user_id, type, item_id) et des métadonnées de structure (id, created_at). Aucune annotation, aucune copie de contenu.

> **Test** : vérifier que la table ne contient aucune colonne de contenu ni d'annotation.
> **Statut passe 2 : colonne `notes TEXT` à supprimer** (code mort généré par LLM, jamais voulu ni utilisé). Ajouter un trigger ou une contrainte pour supprimer les épinglages quand la ressource source est supprimée (pas de lignes orphelines).

### 8.2 Invariants de rendu

**INV-R1** — Tout rendu de contenu de document passe par `DocumentCard` / `DocumentElementRenderer`. Aucune réimplémentation n'existe ailleurs.

> **C'est l'invariant que viole le bug PDF actuel.**

**INV-R2** — Les renderers d'épreuve et de tâche délèguent le rendu de leurs sous-entités. Ils ne re-rendent jamais le contenu d'un document.

**INV-R3** — Le mode de rendu (sommaire / vue détaillée / aperçu imprimé / miniature) se propage intact le long de la hiérarchie. Aucun renderer intermédiaire ne convertit le mode.

**INV-R4** — Le panneau d'aperçu du wizard et la vue détaillée d'une entité depuis la banque produisent des sorties identiques pour les mêmes données.

**INV-R5** — Un même document rendu dans différentes surfaces (wizard preview, épreuve écran, export PDF) apparaît avec le même contenu et la même structure visuelle.

> **C'est l'invariant que viole le bug PDF actuel.**

**INV-R6** — Les variantes d'aperçu imprimé (`ModeImpression` + `estCorrige`) sont des règles de **composition**. Elles n'altèrent jamais le rendu intrinsèque des documents ou sous-éléments.

### 8.3 Invariants de cohérence opération intellectuelle

**INV-OI1** — Toute opération intellectuelle utilisée dans le code est définie dans `oi.json`.

**INV-OI2** — Tout type d'espace de production est complètement défini : schéma de paramètres, rendu en sommaire, vue détaillée, aperçu imprimé, et indicateur en miniature. Définition partielle interdite.

**INV-OI3** — L'ajout d'un type d'OI doit propager simultanément : (a) `oi.json`, (b) schéma d'espace de production, (c) parcours wizard tâche si non rédactionnel, (d) rendus.

### 8.4 Invariants de nommage

**INV-N1** — "TAÉ" n'apparaît jamais dans les noms de composants, types, fonctions, fichiers. Nom canonique code : `Tache` / `tache`.

**INV-N2** — "OI" n'apparaît jamais dans une UI visible par l'utilisateur final. Forme longue toujours.

**INV-N3** — Le terme "épreuve" est utilisé partout dans l'UI et le code. Les occurrences de `evaluation` / `evaluations` sont de la dette D2.

**INV-N4** — Le terme code pour l'appel documentaire est `appelDocumentaire` / `appel`. Les occurrences de `amorce` / `amorceDocumentaire` sont de la dette D3.

---

## 9. Checklist pour les specs

À coller en haut de toute demande de spec d'implémentation :

- [ ] **Entités touchées** : quelles entités stockées cette feature crée, lit, modifie, ou supprime?
- [ ] **Entités dérivées impactées** : outil d'évaluation, espace de production, appel documentaire, numérotation?
- [ ] **Modes de rendu impactés** : sommaire, vue détaillée, aperçu imprimé, miniature?
- [ ] **Variantes d'aperçu imprimé impactées** : formatif, sommatif, ministériel, corrigé?
- [ ] **Composants canoniques utilisés** : renderers canoniques et wizards? **Justifier toute introduction d'un nouveau composant.**
- [ ] **Invariants potentiellement affectés** : lister ceux de §8 que la feature pourrait enfreindre.
- [ ] **Indexation** : respecte-t-elle les règles d'héritage (règle produit 3)?
- [ ] **Numérotation** : respecte-t-elle INV-S4?
- [ ] **Nommage** : respecte-t-il le glossaire §1 et INV-N1/N2/N3/N4?
- [ ] **Réutilisation vérifiée** : ai-je vérifié qu'aucun composant existant ne peut être réutilisé?

---

## 10. Comment auditer le code existant

### Passe 1 — Mapping vocabulaire ✅

Complétée le 2026-04-16. Résultats dans `docs/audit/phase1-vocabulaire.md`. 26/26 termes traités, 11 dettes identifiées, 7 questions ouvertes.

### Passe 2 — Invariants de structure (INV-S1 à INV-S6)

> Pour chacun des invariants INV-S1 à INV-S6, vérifie le code et identifie les violations. Sois particulièrement attentif à INV-S2 (`DocumentSlotCreateForm` vs `AutonomousDocumentForm` — candidat violation identifié en passe 1), INV-S5 (repère temporel sur le document), et INV-S6 (épinglages). Pour chaque violation : fichier, lignes, raison. Ne propose pas de fix.

### Passe 3 — Invariants de rendu (INV-R1 à INV-R6)

> Pour chacun des invariants INV-R1 à INV-R6, vérifie le code. Sois particulièrement attentif à INV-R1 (un seul renderer de document — `DocumentCard` / `DocumentElementRenderer`) et INV-R5 (cohérence wizard preview et épreuve PDF — bug connu). Pour chaque violation : fichier, lignes, raison.

### Passe 4 — Invariants OI et nommage (INV-OI1-3, INV-N1-4)

> Vérifie INV-OI1 à INV-OI3 et INV-N1 à INV-N4. Identifie : les OI sans rendus complets, les occurrences `Tae` dans le code, les occurrences `OI` dans les UI, les `evaluation/evaluations` à renommer, les `amorce` à renommer en `appel`.

### Passe 5 — Synthèse et priorisation

> Synthétise les écarts des passes 2-4. Classe par sévérité, effort, risque de régression.

---

## 11. À compléter

- **Liste exhaustive des types d'espace de production non rédactionnels** et schémas de paramètres
- **Parcours différenciés dans le wizard tâche** selon l'opération intellectuelle
- **Règles de publication / partage / versionnage** dans la banque collaborative
- **Cycle de vie des entités** : brouillons, publication, archivage, suppression, restauration
- **Règles multi-utilisateurs** : propriété, co-édition, collaboration
- **Règles de validation** : champs obligatoires, contraintes par entité
- **Notes au correcteur** : valider la persistance SQL

---

_Dernière mise à jour : 2026-04-16_
_Passe 1 intégrée : 2026-04-16_
