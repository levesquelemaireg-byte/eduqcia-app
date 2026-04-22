# Audit Phase 2 — Invariants de structure

> **Portée stricte.** Ce document audite uniquement les invariants de structure INV-S1 à INV-S6 définis dans [DOMAIN_MODEL.md §8.1](../DOMAIN_MODEL.md). Il ne propose aucun refactoring, ne modifie aucun code, et ne couvre pas les invariants de rendu (passe 3) ni OI/nommage (passe 4).
>
> **Méthode.** Chaque invariant est vérifié par un test spécifique (grep, lecture de schéma, traçage d'imports). Chaque verdict est étayé par des références fichier:ligne.
>
> **Date.** 2026-04-16.

---

## INV-S1 — Document toujours autonome

**Énoncé.** Un document existe toujours de manière autonome dans la banque. Aucun chemin de création ne produit un document captif.

**Verdict** : ⚠️ Violation partielle (lettre respectée, esprit violé)

**Ce que j'ai vérifié** :

- Traçage du flux de création d'un document « in situ » depuis l'étape 4 du wizard tâche
  (`DocumentSlotPanel` → `DocumentSlotCreateForm` → `FormState.bloc4.documents` → `buildPublishPayload` → RPC `publish_tae_transaction`).
- Lecture de la RPC `publish_tae_transaction` dans le schéma SQL pour identifier le moment de persistance.
- Vérification de la clé étrangère `tae_documents.document_id REFERENCES documents(id) ON DELETE RESTRICT`.
- Recherche de toute table alternative qui pourrait héberger des documents « captifs ».

**Preuves** :

- [supabase/schema.sql:364](../../supabase/schema.sql#L364) — La table `documents` est la seule table de stockage de documents ; pas de table `tae_document_captifs` ni équivalent. Tout document créé est une ligne autonome dans cette table.
- [supabase/schema.sql:412](../../supabase/schema.sql#L412) — `tae_documents.document_id` référence `documents(id)` `ON DELETE RESTRICT` : une fois le document créé, la suppression d'une TAÉ ne le supprime pas.
- [supabase/schema.sql:409-417](../../supabase/schema.sql#L409-L417) — `tae_documents` porte uniquement `tae_id`, `document_id`, `slot`, `ordre` : aucune colonne de contenu qui ferait du document un « captif » de la jointure.
- [supabase/schema.sql:1556-1616](../../supabase/schema.sql#L1556-L1616) — La RPC `publish_tae_transaction` insère les documents `documents_new[]` dans la table `documents` avant d'insérer la TAÉ ; ils obtiennent un `id` propre (`RETURNING id INTO v_doc_id`).

**Violations trouvées** :

- [supabase/schema.sql:1612](../../supabase/schema.sql#L1612) — Les documents créés via l'étape 4 sont insérés avec `is_published = FALSE`. Il faudra passer 3/backlog pour vérifier si cela empêche leur apparition immédiate dans la banque collaborative (`/bank`) ou « Mes documents » (`/documents`). Pour l'invariant pur, ce n'est pas une violation.
- [lib/tache/publish-tae.ts:66-77](../../lib/tache/publish-tae.ts#L66-L77) — **Écart à l'esprit de l'invariant.** La création du document est **couplée à la publication de la TAÉ** via `publish_tae_transaction`. Tant que l'enseignant n'a pas publié la TAÉ, les données de document saisies en Bloc 4 n'existent que dans `FormState.bloc4.documents` (ou dans `tae_wizard_drafts` en JSONB de brouillon). Si l'enseignant abandonne le wizard, aucun document n'est persisté dans `documents`. L'invariant §8.1 dit « aucun chemin de création ne produit un document captif » (respecté : pas de table captive), mais la règle produit §7.2 dit « un document créé in situ est **immédiatement** autonome. Enregistré dans la banque **dès sa création** » — ce volet n'est pas respecté : la création effective est différée jusqu'au `publish_tae_transaction`.
- [lib/tache/publish-tae-payload.ts:181-199](../../lib/tache/publish-tae-payload.ts#L181-L199) — La liste `documents_new` est empaquetée dans le payload TAÉ, confirmant le couplage création document ↔ publication TAÉ.

**Nuance** : l'invariant strict « aucun document captif » est techniquement respecté (aucun document n'est « captif » puisqu'aucun document n'existe avant publication TAÉ ; après publication, il est autonome). Mais la règle produit §7.2 de « création immédiate » ne l'est pas. À confirmer avec le développeur : l'intention de l'invariant se limite-t-elle à la structure post-création, ou couvre-t-elle aussi la temporalité ?

---

## INV-S2 — Une seule implémentation de création de document

**Énoncé.** Une seule implémentation de création de document existe. Les deux points d'entrée (`AutonomousDocumentForm` et `DocumentSlotCreateForm`) utilisent le même composant, paramétré différemment.

**Verdict** : ❌ Violation

**Ce que j'ai vérifié** :

- Lecture intégrale de [`components/tache/wizard/bloc4/DocumentSlotCreateForm.tsx`](../../components/tache/wizard/bloc4/DocumentSlotCreateForm.tsx) (216 lignes).
- Lecture de [`components/documents/AutonomousDocumentForm.tsx`](../../components/documents/AutonomousDocumentForm.tsx) (1 ligne de ré-export).
- Lecture intégrale de [`components/documents/wizard/AutonomousDocumentWizard.tsx`](../../components/documents/wizard/AutonomousDocumentWizard.tsx) (382 lignes).
- Lecture du schéma Zod [`lib/schemas/autonomous-document.ts`](../../lib/schemas/autonomous-document.ts).
- Lecture du type `DocumentSlotData` dans [`lib/tache/document-helpers.ts:30-62`](../../lib/tache/document-helpers.ts#L30-L62).
- Lecture du server action [`lib/actions/create-autonomous-document.ts`](../../lib/actions/create-autonomous-document.ts).
- Vérification que `DocumentSlotCreateForm` n'importe **pas** `AutonomousDocumentForm`, `AutonomousDocumentWizard`, `autonomousDocumentFormSchema`, ni `createAutonomousDocumentAction`.

**Preuves négatives (ce qui confirme la violation)** :

- [components/tache/wizard/bloc4/DocumentSlotCreateForm.tsx:1-28](../../components/tache/wizard/bloc4/DocumentSlotCreateForm.tsx#L1-L28) — aucun import de `AutonomousDocumentForm` / `AutonomousDocumentWizard` / `autonomousDocumentFormSchema` / `createAutonomousDocumentAction`. Les imports sont exclusivement des primitives UI (`SegmentedControl`, `Textarea`, `RichTextEditor`, `InlineWarning`), des sous-composants spécifiques au Bloc 4 (`DocumentSlotImageField`, `DocumentSlotLegendBlock`, `DocumentSlotSourceTypeFieldset`), et des helpers (`DocumentSlotData`, `htmlHasMeaningfulText`).
- [components/documents/wizard/AutonomousDocumentWizard.tsx:22-25](../../components/documents/wizard/AutonomousDocumentWizard.tsx#L22-L25) — les 4 étapes `StepStructure`, `StepDocument`, `StepClassification`, `StepConfirmation` ne sont importées nulle part depuis `components/tache/wizard/bloc4/`.

**Divergences fonctionnelles concrètes** :

| Aspect            | `AutonomousDocumentWizard` (/`AutonomousDocumentForm`)                                                                                                                                                                             | `DocumentSlotCreateForm`                                                                                                                                                                                                     |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Localisation      | [`components/documents/wizard/AutonomousDocumentWizard.tsx:80`](../../components/documents/wizard/AutonomousDocumentWizard.tsx#L80)                                                                                                | [`components/tache/wizard/bloc4/DocumentSlotCreateForm.tsx:43`](../../components/tache/wizard/bloc4/DocumentSlotCreateForm.tsx#L43)                                                                                          |
| UX                | Wizard 4 étapes avec `WizardStepper`, preview `DocumentWizardPreview`, footer de navigation `DocumentWizardNavFooter`                                                                                                              | Formulaire inline plat sans étapes                                                                                                                                                                                           |
| Modèle de données | `AutonomousDocumentFormValues` avec `structure: "simple"\|"perspectives"\|"deux_temps"` + `elements: DocumentElementFormValues[]` ([lib/schemas/autonomous-document.ts:89-111](../../lib/schemas/autonomous-document.ts#L89-L111)) | `DocumentSlotData` plat avec champs mono-élément (`titre`, `contenu`, `source_citation`, `type_iconographique`, `categorie_textuelle`…) ([lib/tache/document-helpers.ts:30-62](../../lib/tache/document-helpers.ts#L30-L62)) |
| Gestion d'état    | `react-hook-form` + `zodResolver(autonomousDocumentFormSchema)` + `FormProvider` ([AutonomousDocumentWizard.tsx:93-97](../../components/documents/wizard/AutonomousDocumentWizard.tsx#L93-L97))                                    | `useTaeForm()` reducer + `patch` via `dispatch({ type: "UPDATE_DOCUMENT_SLOT" })` ([DocumentSlotPanel.tsx:45-50](../../components/tache/wizard/bloc4/DocumentSlotPanel.tsx#L45-L50))                                         |
| Validation        | Schéma Zod exhaustif avec `superRefine` (`lib/schemas/autonomous-document.ts:112-234`)                                                                                                                                             | Validation ad hoc dispersée : bannières `InlineWarning` conditionnées par `touched` + guards `htmlHasMeaningfulText` + guards dans `publish-tae-payload.ts`                                                                  |
| Champs couverts   | Supporte `simple`, `perspectives`, `deux_temps` (1 à 3 éléments, champs `auteur` / `sous_titre` / `repere_temporel` par élément)                                                                                                   | Supporte **uniquement** 1 élément (structure `simple`). Aucun support pour perspectives ou deux_temps.                                                                                                                       |
| Persistance       | Server action `createAutonomousDocumentAction` → `INSERT INTO documents` avec `is_published: true` ([create-autonomous-document.ts:84-104](../../lib/actions/create-autonomous-document.ts#L84-L104))                              | Agrégé dans `documents_new[]` puis RPC `publish_tae_transaction` → `INSERT INTO documents` avec `is_published = FALSE` ([schema.sql:1612](../../supabase/schema.sql#L1612))                                                  |
| Preview           | `DocumentWizardPreview` / `DocumentWizardPrintPreview` via `PreviewPanel`                                                                                                                                                          | Aucun : aperçu délégué au panneau global du wizard tâche                                                                                                                                                                     |
| Indexation        | Saisie complète : `niveau_id`, `discipline_id`, `connaissances_miller`, `aspects`                                                                                                                                                  | **Pas de saisie** : indexation héritée automatiquement de la TAÉ hôte via `buildPublishPayload` ([publish-tae-payload.ts:185-188](../../lib/tache/publish-tae-payload.ts#L185-L188))                                         |

**Violations trouvées** :

- [components/tache/wizard/bloc4/DocumentSlotCreateForm.tsx:43-215](../../components/tache/wizard/bloc4/DocumentSlotCreateForm.tsx#L43-L215) — composant de création de document entièrement distinct de `AutonomousDocumentWizard`. Les champs (type/titre/contenu/source/image/légende/repère temporel) sont re-saisis dans une UI et avec un modèle de données différents de ceux du wizard autonome.
- [lib/tache/document-helpers.ts:30-62](../../lib/tache/document-helpers.ts#L30-L62) vs [lib/schemas/autonomous-document.ts:55-81](../../lib/schemas/autonomous-document.ts#L55-L81) — duplication du modèle de données : `DocumentSlotData` (type TS mono-élément) coexiste avec `DocumentElementFormValues` + `AutonomousDocumentFormValues` (schéma Zod multi-éléments). Les deux décrivent le même concept « élément de document » avec des shapes incompatibles.
- [lib/actions/create-autonomous-document.ts:84-104](../../lib/actions/create-autonomous-document.ts#L84-L104) vs [supabase/schema.sql:1556-1616](../../supabase/schema.sql#L1556-L1616) — duplication de logique d'insertion `documents` : un chemin SQL direct côté Node (`createAutonomousDocumentAction`), un chemin PL/pgSQL côté RPC (`publish_tae_transaction`). Les deux construisent la colonne `elements` jsonb, les arrays `niveaux_ids` / `disciplines_ids` / `connaissances_ids` / `aspects_societe`, etc.
- **Conséquence concrète** : le wizard Bloc 4 ne peut pas créer un document `perspectives` ou `deux_temps` — le support de ces structures est exclusivement dans `AutonomousDocumentWizard`. Tout enseignant voulant utiliser un document à perspectives dans une tâche doit le créer d'abord via la route autonome `/documents/new`, puis revenir dans la tâche et le sélectionner via « Banque » dans le slot.

**Sévérité** : haute. C'est exactement le candidat violation #1 signalé par la passe 1 et confirmé ici. La violation touche simultanément le code client (composants), le code de validation (schémas), le code serveur (action vs RPC) et le modèle de données (types TS).

---

## INV-S3 — Outil d'évaluation et appel documentaire ne sont jamais des entités CRUD

**Énoncé.** Aucune table de stockage ne les représente comme entités de premier niveau.

**Verdict** : ✅ Respecté

**Ce que j'ai vérifié** :

- Recherche de toute table `CREATE TABLE outil*`, `CREATE TABLE grille*`, `CREATE TABLE amorce*`, `CREATE TABLE appel*` dans le schéma SQL.
- Lecture de la table `comportements` pour confirmer que `outil_evaluation` est un attribut.
- Recherche de toute trace de persistance de l'appel documentaire.

**Preuves** :

- [supabase/schema.sql:237-245](../../supabase/schema.sql#L237-L245) — `outil_evaluation` est une colonne `TEXT NOT NULL` de la table `comportements` (valeur : ID de `<template>` HTML, ex. `'OI0_SO1'`). C'est un attribut de référence, jamais une entité de premier niveau.
- Grep `CREATE TABLE (outil|grille|amorce|appel)` dans `supabase/schema.sql` → 0 résultat.
- L'appel documentaire est entièrement dérivé côté code ([lib/tache/consigne-helpers.ts:6-42](../../lib/tache/consigne-helpers.ts#L6)) via `buildAmorceDocumentaire` / `insertAmorceDocumentaire`. Aucune persistance dédiée : le texte généré est ensuite fondu dans `tae.consigne` (colonne TEXT) au moment de la publication.
- [components/tache/grilles/grille-registry.tsx](../../components/tache/grilles/grille-registry.tsx) — le registry des grilles est un **composant code** (templates HTML), pas une table SQL.

**Violations trouvées** : aucune.

---

## INV-S4 — Numérotation dérivée du rang

**Énoncé.** La numérotation des tâches et documents est dérivée du rang. Aucun champ « numéro » n'est stocké.

**Verdict** : ✅ Respecté

**Ce que j'ai vérifié** :

- Recherche `numero|numero_document|numero_tae|numero_tache` dans `supabase/schema.sql` → 0 résultat.
- Recherche `numero` dans l'arborescence complète `supabase/` → 0 fichier.
- Lecture de toutes les colonnes `ordre INT` dans `schema.sql` pour distinguer rang (stocké, autorisé) de numéro (dérivé, interdit au stockage).
- Lecture de `lib/epreuve/transformation/renumerotation.ts` pour confirmer que le numéro global est calculé au runtime.

**Preuves** :

- Schéma : les seules colonnes `ordre INT` sont des colonnes de **rang** (position dans une liste), pas de numéro affiché :
  - [supabase/schema.sql:202](../../supabase/schema.sql#L202) — `niveaux.ordre` (référence)
  - [supabase/schema.sql:233](../../supabase/schema.sql#L233) — `oi.ordre` (référence)
  - [supabase/schema.sql:244](../../supabase/schema.sql#L244) — `comportements.ordre` (référence)
  - [supabase/schema.sql:414](../../supabase/schema.sql#L414) — `tae_documents.ordre` (rang d'un document dans une tâche)
  - [supabase/schema.sql:498](../../supabase/schema.sql#L498) — `evaluation_tae.ordre` (rang d'une tâche dans une épreuve)
- [lib/epreuve/transformation/renumerotation.ts:31-43](../../lib/epreuve/transformation/renumerotation.ts#L31-L43) — `aplatirDocumentsAvecNumeros` calcule `numeroGlobal` par un `compteur++` local ; rien n'est persisté. Le numéro global n'existe qu'au moment du rendu.
- [lib/epreuve/transformation/renumerotation.ts:14-19](../../lib/epreuve/transformation/renumerotation.ts#L14-L19) — `DocumentNumerote = { numeroGlobal: number; document: DocumentReference }` est un type **runtime**, jamais sérialisé vers la DB.

**Violations trouvées** : aucune.

---

## INV-S5 — Repère temporel et année normalisée = attributs du document

**Énoncé.** Le repère temporel et l'année normalisée sont des attributs du document (`documents.repere_temporel`, `documents.annee_normalisee`), pas de la jointure tâche-document.

**Verdict** : ✅ Respecté

**Ce que j'ai vérifié** :

- Lecture de `CREATE TABLE documents` pour confirmer la présence des deux colonnes.
- Lecture de `CREATE TABLE tae_documents` pour confirmer l'**absence** de ces colonnes.
- Recherche `repere_temporel|annee_normalisee` dans `supabase/schema.sql` pour cartographier toutes les occurrences.

**Preuves** :

- [supabase/schema.sql:380-381](../../supabase/schema.sql#L380-L381) — `documents.repere_temporel TEXT` et `documents.annee_normalisee INT` sont bien déclarés sur la table `documents`.
- [supabase/schema.sql:403-406](../../supabase/schema.sql#L403-L406) — commentaires SQL confirment la sémantique : « Repère temporel (texte libre). Saisie par l'enseignant ; non affiché sur la copie de l'élève. » et « Année normalisée (entier, peut être négatif). Comparaisons parcours non rédactionnels OI1. »
- [supabase/schema.sql:409-417](../../supabase/schema.sql#L409-L417) — `tae_documents` porte uniquement `id`, `tae_id`, `document_id`, `slot`, `ordre` + contraintes UNIQUE. Aucune colonne `repere_temporel` ni `annee_normalisee`.
- Toutes les autres occurrences de `repere_temporel` / `annee_normalisee` dans `schema.sql` (lignes 1563-1592 et 1848-1877) sont dans les corps des RPC `publish_tae_transaction` / `update_tae_transaction`, et ciblent toujours la colonne `documents.<colonne>` ou un champ d'élément jsonb. Aucune RPC n'écrit vers `tae_documents.*temporel*` (colonnes inexistantes).

**Violations trouvées** : aucune.

---

## INV-S6 — Un épinglage est une référence, jamais une duplication

**Énoncé.** La table des épinglages (`favoris` / future `ressources_epinglees`) ne contient que des clés étrangères.

**Verdict** : ⚠️ Violation partielle (esprit respecté, formulation stricte non)

**Ce que j'ai vérifié** :

- Lecture intégrale de `CREATE TABLE favoris` et de l'enum `favori_type`.
- Vérification qu'aucune colonne ne duplique le contenu d'une entité épinglée (titre, consigne, corrigé, elements, etc.).
- Vérification que la feature est ébauchée (toast « à venir » mentionné en passe 1).

**Preuves** :

- [supabase/schema.sql:82-86](../../supabase/schema.sql#L82-L86) — `CREATE TYPE favori_type AS ENUM ('tae', 'document', 'evaluation')`. Discriminant polymorphique.
- [supabase/schema.sql:506-514](../../supabase/schema.sql#L506-L514) — colonnes de la table `favoris` :
  - `id UUID PRIMARY KEY` — identifiant de la ligne d'épinglage
  - `user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE` — **FK**
  - `type favori_type NOT NULL` — discriminant enum
  - `item_id UUID NOT NULL` — **pseudo-FK polymorphique** (pointe vers `tae.id` / `documents.id` / `evaluations.id` selon `type`) ; pas de contrainte FK SQL native car polymorphe
  - `notes TEXT` — **annotation personnelle de l'utilisateur, colonne non-FK**
  - `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()` — métadonnée de création
  - `UNIQUE(user_id, type, item_id)` — unicité
- Aucun champ ne duplique le contenu de l'entité épinglée (pas de `titre`, pas de `consigne`, pas de `corrige`, pas de `elements`, pas de `is_published` copié, etc.). L'intention produit (DOMAIN_MODEL §6.4 : « un épinglage est une référence, pas une duplication. Aucun épinglage ne produit de copie. ») est donc respectée.

**Violations trouvées** :

- [supabase/schema.sql:511](../../supabase/schema.sql#L511) — la colonne `notes TEXT` est **techniquement** une colonne non-FK non-métadonnée-de-structure. La formulation stricte de l'invariant (« ne contient que des clés étrangères ») serait donc non satisfaite.
- **Nuance** : `notes` stocke une annotation **de l'utilisateur épingleur** sur son propre épinglage (ex. « pour cours du 12 mai »), pas une **copie du contenu de l'item épinglé**. C'est de la donnée nouvelle, pas dupliquée. L'esprit de l'invariant (« référence, pas duplication ») est respecté ; seule la lettre (« que des FK ») est violée.
- [supabase/schema.sql:510](../../supabase/schema.sql#L510) — `item_id` n'est **pas** contraint par FK SQL vers les tables cibles (contrainte impossible avec FK polymorphique standard). Si les tables `tae` / `documents` / `evaluations` sont purgées sans passer par un trigger de nettoyage, des `favoris` peuvent référencer des `item_id` orphelins. Ce n'est pas une violation de l'invariant en tant que telle (la colonne reste une « référence »), mais c'est une dette d'intégrité référentielle à documenter.

**À confirmer avec le développeur** : l'invariant doit-il être interprété strictement (refuser `notes`) ou fonctionnellement (autoriser les annotations utilisateur qui ne sont pas une copie de l'item épinglé) ? Recommandation de reformulation en passe future : « la table ne duplique aucun contenu de l'entité épinglée ; seules des références et des annotations personnelles sont permises. »

---

## Synthèse

| Invariant | Verdict | Sévérité si violé                                | Résumé                                                                                                                                                                                                                                                                                                                       |
| --------- | ------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| INV-S1    | ⚠️      | Modérée (couplage temporel à la publication TAÉ) | Pas de document captif structurellement, mais la création n'est pas « immédiate » — elle est différée jusqu'à `publish_tae_transaction`.                                                                                                                                                                                     |
| INV-S2    | ❌      | **Haute**                                        | `DocumentSlotCreateForm` et `AutonomousDocumentWizard` sont deux implémentations entièrement distinctes : composants, modèles de données (`DocumentSlotData` vs `AutonomousDocumentFormValues`), validation, chemins de persistance (action SQL directe vs RPC) et couverture fonctionnelle (slot ne supporte que `simple`). |
| INV-S3    | ✅      | —                                                | `outil_evaluation` = colonne de `comportements` ; appel documentaire = helpers runtime non persistés. Aucune table CRUD.                                                                                                                                                                                                     |
| INV-S4    | ✅      | —                                                | Aucune colonne `numero`. Les `ordre INT` stockent le rang, pas le numéro affiché. `aplatirDocumentsAvecNumeros` calcule les numéros au runtime.                                                                                                                                                                              |
| INV-S5    | ✅      | —                                                | `documents.repere_temporel` et `documents.annee_normalisee` sont bien sur `documents`. `tae_documents` ne porte aucune colonne temporelle.                                                                                                                                                                                   |
| INV-S6    | ⚠️      | Faible (lettre violée, esprit respecté)          | `favoris.notes` (TEXT) est une annotation utilisateur, pas une duplication de l'item épinglé. À arbitrer : garder la colonne + reformuler l'invariant, ou la supprimer.                                                                                                                                                      |

**Verdict global** : 1 ❌ (INV-S2), 2 ⚠️ (INV-S1, INV-S6), 3 ✅ (INV-S3, INV-S4, INV-S5).

---

## Questions ouvertes

1. **INV-S1 — sémantique de « création »** : l'invariant couvre-t-il uniquement la structure post-création (pas de document captif dans la DB), ou couvre-t-il aussi la temporalité (création effective au moment où l'enseignant remplit le slot, pas au publish TAÉ) ? La règle produit §7.2 penche pour le second ; l'invariant §8.1 est ambigu. Nécessite arbitrage.
2. **INV-S1 — visibilité bank des documents `is_published=FALSE`** : le document créé via Bloc 4 est inséré avec `is_published = FALSE` ([schema.sql:1612](../../supabase/schema.sql#L1612)). Est-il censé apparaître dans « Mes documents » ? Dans la banque collaborative ? À tracer en passe 3 (listes filtrées sur `is_published`) ou par relecture des queries `lib/queries/documents*`.
3. **INV-S2 — cohabitation actuelle voulue ou accidentelle ?** : le fait que `DocumentSlotCreateForm` ne supporte que `structure: simple` est-il une contrainte produit délibérée (un document lié à un slot doit toujours être simple), ou une dette de portage ? Si c'est délibéré, l'invariant INV-S2 doit être reformulé pour autoriser un wrapper paramétrique. Si c'est une dette, le fix demande de remplacer `DocumentSlotCreateForm` par un appel à `AutonomousDocumentWizard` en mode allégé/embedded.
4. **INV-S6 — `item_id` polymorphique sans FK** : faut-il introduire un trigger de nettoyage pour purger les `favoris` quand la cible est supprimée, ou accepter les orphelins tant que la feature est ébauchée ? Indépendant de l'invariant mais lié à la même table.
5. **INV-S6 — `notes` à garder ou supprimer ?** : cette colonne est déclarée mais je n'ai pas vérifié si le code UI la lit/écrit. Elle peut être du code mort à supprimer, ou un emplacement réservé pour une feature future. Passe 3 à préciser.

---

_Fin de passe 2._
