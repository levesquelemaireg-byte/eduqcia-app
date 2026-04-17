# PASSE 1 — Cartographie vocabulaire

> **Portée stricte.** Ce document ne fait que mapper les termes du glossaire de [DOMAIN_MODEL.md](../DOMAIN_MODEL.md) (§1.1, §1.2, §1.3) vers les fichiers/symboles/tables réellement présents dans le code. Aucun refactor, aucune correction d'invariant, aucune modification de code.
>
> **Règle de preuve.** Chaque mapping cite au moins un chemin de fichier. Lorsque plusieurs candidats existent, ils sont tous listés. Les divergences de nommage entre DOMAIN_MODEL et code sont notées `[dette de nommage connue]` ou `[divergence de nommage]`.
>
> **Date.** 2026-04-16.

---

## 1. Entités stockées (DOMAIN §1.1)

### 1.1 Document

| Aspect                       | Code                                                                                       | Preuve                                                                                                     |
| ---------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| Table SQL                    | `documents`                                                                                | [supabase/schema.sql:364](../../supabase/schema.sql#L364)                                                  |
| Type TS (runtime renderer)   | `RendererDocument`                                                                         | [lib/types/document-renderer.ts:66](../../lib/types/document-renderer.ts#L66)                              |
| Composant canonique          | `DocumentCard`                                                                             | [components/documents/DocumentCard.tsx](../../components/documents/DocumentCard.tsx)                       |
| Renderer élément             | `DocumentElementRenderer`                                                                  | [components/documents/DocumentElementRenderer.tsx](../../components/documents/DocumentElementRenderer.tsx) |
| Variantes                    | `DocumentCardPrint`, `DocumentCardSommaire`, `DocumentCardReader`, `DocumentCardThumbnail` | [components/documents/](../../components/documents/)                                                       |
| Structures internes          | `DocumentStructure = "simple" \| "perspectives" \| "deux_temps"`                           | [lib/types/document-renderer.ts](../../lib/types/document-renderer.ts)                                     |
| Éléments (union discriminée) | `DocumentElement`                                                                          | [lib/types/document-renderer.ts](../../lib/types/document-renderer.ts)                                     |

**Mapping direct, sans dette.** Le mot « document » est uniforme du SQL à l'UI.

### 1.2 Tâche (TAÉ)

| Aspect                      | Code                                                                       | Preuve                                                                                     |
| --------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Table SQL                   | `tae`                                                                      | [supabase/schema.sql:275](../../supabase/schema.sql#L275)                                  |
| Tables reliées              | `tae_collaborateurs`, `tae_wizard_drafts`, `tae_versions`, `tae_documents` | [supabase/schema.sql:324,334,345,409](../../supabase/schema.sql)                           |
| Type domaine                | `DonneesTache`                                                             | [lib/tache/contrats/donnees.ts:63](../../lib/tache/contrats/donnees.ts#L63)                |
| État wizard                 | `FormState` (7 blocs)                                                      | [lib/tae/tae-form-state-types.ts](../../lib/tae/tae-form-state-types.ts)                   |
| Vue détaillée (nouveau nom) | `components/tache/vue-detaillee/`                                          | [components/tache/vue-detaillee/index.tsx](../../components/tache/vue-detaillee/index.tsx) |
| Vue détaillée (ancien nom)  | `FicheLecture`                                                             | [components/tae/FicheLecture.tsx](../../components/tae/FicheLecture.tsx)                   |
| Miniature                   | `FicheThumbnail`                                                           | [components/tae/FicheThumbnail.tsx](../../components/tae/FicheThumbnail.tsx)               |
| Wizard (dossier)            | `components/tae/TaeForm/`                                                  | [components/tae/TaeForm/Stepper.tsx](../../components/tae/TaeForm/Stepper.tsx)             |
| Route UI                    | `/questions` (libellé « Mes tâches »)                                      | [components/layout/Sidebar.tsx](../../components/layout/Sidebar.tsx)                       |

**`[dette de nommage connue]`** — Le code oscille entre trois appellations :

- SQL + code legacy : `tae` / `Tae` / `TaeForm` / `tae_for_edit` / `TAE_FORM_STEPS`.
- Nouveau domaine (partiellement migré) : `Tache` / `DonneesTache` / `components/tache/vue-detaillee/`.
- Route URL : `/questions` (héritage Next.js encore plus ancien).

La terminologie UI visible au développeur et à l'enseignant (« Tâche », « Mes tâches ») est conforme au DOMAIN ; la dette est entièrement interne (schéma SQL, dossiers `tae/`, route `/questions`).

### 1.3 Épreuve

| Aspect              | Code                                      | Preuve                                                                                                                 |
| ------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Table SQL           | `evaluations`                             | [supabase/schema.sql:482](../../supabase/schema.sql#L482)                                                              |
| Table pivot         | `evaluation_tae`                          | [supabase/schema.sql:494](../../supabase/schema.sql#L494)                                                              |
| Type domaine        | `DonneesEpreuve`                          | [lib/epreuve/contrats/donnees.ts:18](../../lib/epreuve/contrats/donnees.ts#L18)                                        |
| En-tête             | `EnTeteEpreuve`                           | [lib/epreuve/contrats/donnees.ts:8](../../lib/epreuve/contrats/donnees.ts#L8)                                          |
| Wizard composition  | `EvaluationCompositionEditor`             | [components/evaluations/EvaluationCompositionEditor.tsx](../../components/evaluations/EvaluationCompositionEditor.tsx) |
| Vue détaillée print | `EvaluationFichePrintView`                | [components/evaluations/EvaluationFichePrintView.tsx](../../components/evaluations/EvaluationFichePrintView.tsx)       |
| Renderer impression | `ApercuImpression`                        | [components/epreuve/impression/index.tsx](../../components/epreuve/impression/index.tsx)                               |
| Pagination          | `lib/epreuve/pagination/`                 | [lib/epreuve/pagination/types.ts](../../lib/epreuve/pagination/types.ts)                                               |
| Route UI            | `/evaluations` (libellé « Mes épreuves ») | [components/layout/Sidebar.tsx](../../components/layout/Sidebar.tsx)                                                   |

**`[dette de nommage connue]`** — Même schéma que Tâche :

- SQL + `components/evaluations/` : `evaluations` / `Evaluation*`.
- Nouveau domaine (partiellement migré) : `Epreuve` / `DonneesEpreuve` / `components/epreuve/impression/` / `lib/epreuve/`.
- Route URL : `/evaluations`.

Terminologie UI conforme, dette interne.

---

## 2. Entités dérivées / attributs (DOMAIN §1.1 suite)

### 2.1 Outil d'évaluation

| Aspect           | Code                                          | Preuve                                                                                                                           |
| ---------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Type             | `OutilEvaluation`                             | [lib/tache/contrats/donnees.ts:41](../../lib/tache/contrats/donnees.ts#L41)                                                      |
| Colonne source   | `comportements.outil_evaluation`              | [supabase/schema.sql:237](../../supabase/schema.sql#L237) (table `comportements`)                                                |
| Section imprimée | `SectionOutilEvaluation`                      | [components/epreuve/impression/sections/outil-evaluation.tsx](../../components/epreuve/impression/sections/outil-evaluation.tsx) |
| Registry grilles | `grille-registry` (OI3_SO5, OI6_SO3, OI7_SO1) | [components/tae/grilles/grille-registry.tsx](../../components/tae/grilles/grille-registry.tsx)                                   |

Mapping direct. Attribut dérivé du comportement attendu, propagé vers la tâche via `DonneesTache.outilEvaluation`.

### 2.2 Espace de production

| Aspect                        | Code                                                                              | Preuve                                                                                                                                 |
| ----------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Type (union discriminée)      | `EspaceProduction = { type: "lignes" } \| { type: "cases" } \| { type: "libre" }` | [lib/tache/contrats/donnees.ts:47](../../lib/tache/contrats/donnees.ts#L47)                                                            |
| Section imprimée              | `SectionEspaceProduction`                                                         | [components/epreuve/impression/sections/espace-production.tsx](../../components/epreuve/impression/sections/espace-production.tsx)     |
| Lecture seule wizard (Bloc 2) | `Bloc2EspaceProductionReadonly`                                                   | [components/tae/TaeForm/bloc2/Bloc2EspaceProductionReadonly.tsx](../../components/tae/TaeForm/bloc2/Bloc2EspaceProductionReadonly.tsx) |

Mapping direct. Attribut également dérivé du comportement attendu (lecture seule dans le wizard tâche).

### 2.3 Appel documentaire

| Aspect                  | Code                                                                                            | Preuve                                                                                                      |
| ----------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Helpers de construction | `buildAmorceDocumentaire`, `buildAmorceDocumentaireHtml`, `stripAmorceDocumentaireForMiniature` | [lib/tae/consigne-helpers.ts:6,25,42](../../lib/tae/consigne-helpers.ts#L6)                                 |
| Insertion éditeur       | `insertAmorceDocumentaire`                                                                      | [components/tae/TaeForm/tiptap/insertAmorce.ts:59](../../components/tae/TaeForm/tiptap/insertAmorce.ts#L59) |
| Pastilles document      | `docRefSpan`                                                                                    | [lib/tae/consigne-helpers.ts:17](../../lib/tae/consigne-helpers.ts#L17)                                     |

**`[divergence de nommage]`** — Le DOMAIN_MODEL dit « appel documentaire » ; le code dit systématiquement « amorce documentaire ». Aucun symbole `appel*` n'existe côté code. Divergence vocabulaire source ↔ code à lever en passe ultérieure.

### 2.4 Numérotation

| Aspect                 | Code                                                         | Preuve                                                                                                                    |
| ---------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Renumérotation globale | `aplatirDocumentsAvecNumeros`, `resoudreReferencesDocuments` | [lib/epreuve/transformation/renumerotation.ts](../../lib/epreuve/transformation/renumerotation.ts)                        |
| Appel depuis transfo   | `epreuveVersImprimable`                                      | [lib/epreuve/transformation/epreuve-vers-paginee.ts:27,113](../../lib/epreuve/transformation/epreuve-vers-paginee.ts#L27) |

Mapping direct, concentré dans le module `lib/epreuve/transformation/`.

### 2.5 Consigne

| Aspect         | Code                                   | Preuve                                                                                                                 |
| -------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Colonne SQL    | `tae.consigne`                         | [supabase/schema.sql:275](../../supabase/schema.sql#L275)                                                              |
| État wizard    | `FormState.redaction.consigne` (Bloc3) | [lib/tae/tae-form-state-types.ts](../../lib/tae/tae-form-state-types.ts)                                               |
| Éditeur TipTap | `ConsigneTipTapEditor`                 | [components/tae/TaeForm/tiptap/ConsigneTipTapEditor.tsx](../../components/tae/TaeForm/tiptap/ConsigneTipTapEditor.tsx) |

Mapping direct.

### 2.6 Guidage

| Aspect            | Code            | Preuve                                                                      |
| ----------------- | --------------- | --------------------------------------------------------------------------- |
| Colonne SQL       | `tae.guidage`   | [supabase/schema.sql](../../supabase/schema.sql#L275)                       |
| Type              | `Guidage`       | [lib/tache/contrats/donnees.ts:16](../../lib/tache/contrats/donnees.ts#L16) |
| Selector sommaire | `selectGuidage` | [lib/fiche/selectors/](../../lib/fiche/selectors/)                          |

Mapping direct.

### 2.7 Production attendue

| Aspect            | Code                                               | Preuve                                                                                                         |
| ----------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Colonne SQL       | `tae.corrige`                                      | [supabase/schema.sql:289](../../supabase/schema.sql#L289)                                                      |
| État wizard       | `FormState.bloc5.corrige`                          | [lib/tae/tae-form-state-types.ts](../../lib/tae/tae-form-state-types.ts)                                       |
| Libellé UI        | `BLOC5_REDACTIONNEL_LABEL = "Production attendue"` | [lib/ui/ui-copy.ts:436](../../lib/ui/ui-copy.ts#L436)                                                          |
| Selector sommaire | `selectCorrige`                                    | [lib/fiche/selectors/selectCorrige.ts](../../lib/fiche/selectors/selectCorrige.ts)                             |
| Section imprimée  | `SectionCorrige`                                   | [components/epreuve/impression/sections/corrige.tsx](../../components/epreuve/impression/sections/corrige.tsx) |

**`[divergence de nommage]`** — L'UI dit « Production attendue » (conforme DOMAIN) mais le champ code et SQL reste `corrige`. Divergence documentée visible partout : types, colonnes, selectors, composants.

### 2.8 Notes au correcteur

| Aspect      | Code                                                                           | Preuve                                                                                                         |
| ----------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| État wizard | `FormState.bloc5.notesCorrecteur`                                              | [lib/tae/tae-form-state-types.ts](../../lib/tae/tae-form-state-types.ts)                                       |
| Lecture     | `loadTaeForEdit → notesCorrecteur`                                             | [lib/queries/tae-for-edit.ts:389](../../lib/queries/tae-for-edit.ts#L389)                                      |
| Selector    | lit `state.bloc5.notesCorrecteur`                                              | [lib/fiche/selectors/selectCorrige.ts:16,20](../../lib/fiche/selectors/selectCorrige.ts)                       |
| Colonne SQL | `[INTROUVABLE]` — aucune colonne `notes_correcteur` dans `supabase/schema.sql` | recherche grep sur `notes_correcteur\|notes_au_correcteur` → 0 hit en dehors de `favoris.notes` (sans rapport) |

**`[incertain]` — persistance.** Le champ existe en FormState et est lu depuis une requête d'édition, mais aucune colonne dédiée n'existe dans le schéma SQL. Hypothèse : sérialisé dans un JSONB (probablement `tae.non_redaction_data` ou équivalent), à confirmer en passe 2.

### 2.9 Comportement attendu

| Aspect           | Code                  | Preuve                                                                                                           |
| ---------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Table SQL        | `comportements`       | [supabase/schema.sql:237](../../supabase/schema.sql#L237)                                                        |
| Picker wizard    | `ComportementPicker`  | [components/tae/TaeForm/bloc2/ComportementPicker.tsx](../../components/tae/TaeForm/bloc2/ComportementPicker.tsx) |
| Référentiel JSON | `public/data/oi.json` | [public/data/](../../public/data/)                                                                               |

Mapping direct.

### 2.10 Repère temporel

| Aspect      | Code                        | Preuve                                                                               |
| ----------- | --------------------------- | ------------------------------------------------------------------------------------ |
| Colonne SQL | `documents.repere_temporel` | [supabase/schema.sql:380](../../supabase/schema.sql#L380)                            |
| Champ UI    | `RepereTemporelField`       | [components/ui/RepereTemporelField.tsx](../../components/ui/RepereTemporelField.tsx) |

Mapping direct.

### 2.11 Année normalisée

| Aspect      | Code                         | Preuve                                                       |
| ----------- | ---------------------------- | ------------------------------------------------------------ |
| Colonne SQL | `documents.annee_normalisee` | [supabase/schema.sql:381](../../supabase/schema.sql#L381)    |
| Extraction  | `document-annee.ts`          | [lib/tae/document-annee.ts](../../lib/tae/document-annee.ts) |
| Helper      | `extract-year.ts`            | [lib/utils/extract-year.ts](../../lib/utils/extract-year.ts) |

Mapping direct.

---

## 3. Espaces (DOMAIN §1.1 fin)

### 3.1 Espace personnel

| Sous-espace DOMAIN | Route          | Libellé UI      | Preuve                                                               |
| ------------------ | -------------- | --------------- | -------------------------------------------------------------------- |
| « Mes documents »  | `/documents`   | Mes documents   | [components/layout/Sidebar.tsx](../../components/layout/Sidebar.tsx) |
| « Mes tâches »     | `/questions`   | Mes tâches      | [components/layout/Sidebar.tsx](../../components/layout/Sidebar.tsx) |
| « Mes épreuves »   | `/evaluations` | Mes épreuves    | [components/layout/Sidebar.tsx](../../components/layout/Sidebar.tsx) |
| Tableau de bord    | `/dashboard`   | Tableau de bord | [components/layout/Sidebar.tsx](../../components/layout/Sidebar.tsx) |

**`[dette de nommage connue]` sur routes.** `/questions` pour tâches et `/evaluations` pour épreuves sont legacy ; les libellés visibles sont alignés DOMAIN.

### 3.2 Banque collaborative

| Aspect          | Code                                                           | Preuve                                                               |
| --------------- | -------------------------------------------------------------- | -------------------------------------------------------------------- |
| Route           | `/bank`                                                        | [components/layout/Sidebar.tsx](../../components/layout/Sidebar.tsx) |
| Dossier         | `components/bank/`                                             | [components/bank/](../../components/bank/)                           |
| Panneaux        | `BankTasksPanel`, `BankDocumentsPanel`, `BankEvaluationsPanel` | [components/bank/](../../components/bank/)                           |
| Onglets         | `BankOnglets`                                                  | [components/bank/](../../components/bank/)                           |
| Carte miniature | `BankThumbnailCard`                                            | [components/bank/](../../components/bank/)                           |

**`[anglicisme]` / `[dette de nommage connue]`** — Le DOMAIN dit « Banque collaborative » ; le code dit `bank` (route + dossier + composants). Libellé UI « Banque collaborative » conforme.

### 3.3 Ressources épinglées

| Aspect                  | Code                                                  | Preuve                                                                                                     |
| ----------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Table SQL               | `favoris`                                             | [supabase/schema.sql:506](../../supabase/schema.sql#L506)                                                  |
| Enum discriminant       | `favori_type = ('tae','document','evaluation')`       | [supabase/schema.sql:82](../../supabase/schema.sql#L82)                                                    |
| État UI barre d'actions | `epinglee` (stub) + `surEpingler` (toast « à venir ») | [components/tache/vue-detaillee/barre-actions.tsx](../../components/tache/vue-detaillee/barre-actions.tsx) |
| Widget dashboard        | « Mes favoris » (stub, pas de lecture `favoris`)      | [components/](../../components/)                                                                           |

**`[divergence de nommage]` + état fonctionnel incomplet.** Le DOMAIN parle d'« épingler » ; la table SQL s'appelle `favoris` (et l'enum `favori_type`). Côté UI, la fonctionnalité est seulement ébauchée : callback avec toast « à venir », aucun flux d'écriture branché sur `favoris`. À confirmer en passe 2 que rien d'autre n'écrit dans cette table.

---

## 4. Wizards (DOMAIN implicite §1.1 + §2)

### 4.1 Wizard document

| Aspect                         | Code                       | Preuve                                                                                                                     |
| ------------------------------ | -------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Wizard autonome (route dédiée) | `AutonomousDocumentWizard` | [components/documents/wizard/AutonomousDocumentWizard.tsx](../../components/documents/wizard/AutonomousDocumentWizard.tsx) |
| Formulaire partagé             | `AutonomousDocumentForm`   | [components/documents/AutonomousDocumentForm.tsx](../../components/documents/AutonomousDocumentForm.tsx)                   |
| Wizard in-situ (Bloc 4 tâche)  | `DocumentSlotCreateForm`   | [components/tae/TaeForm/bloc4/DocumentSlotCreateForm.tsx](../../components/tae/TaeForm/bloc4/DocumentSlotCreateForm.tsx)   |

**`[divergence suspecte — à auditer en passe 2]`** — Deux entrées de création document coexistent : `AutonomousDocumentWizard` (flux autonome) et `DocumentSlotCreateForm` (flux in-situ Bloc 4). Le formulaire partagé `AutonomousDocumentForm` est importé par le premier mais il reste à vérifier si le second le réutilise ou duplique sa logique (candidat INV-S2).

### 4.2 Wizard tâche

| Aspect      | Code                                                                                                 | Preuve                                                                           |
| ----------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Dossier     | `components/tae/TaeForm/`                                                                            | [components/tae/TaeForm/](../../components/tae/TaeForm/)                         |
| Stepper     | `Stepper.tsx`                                                                                        | [components/tae/TaeForm/Stepper.tsx](../../components/tae/TaeForm/Stepper.tsx)   |
| Méta étapes | `TAE_FORM_STEPS` (7 éléments : auteurs, parametres, consigne, documents, corrige, cd, connaissances) | [components/tae/TaeForm/step-meta.ts](../../components/tae/TaeForm/step-meta.ts) |
| État        | `FormState` (7 Blocs)                                                                                | [lib/tae/tae-form-state-types.ts](../../lib/tae/tae-form-state-types.ts)         |

Mapping conforme DOMAIN (7 étapes). Les identifiants internes mélangent français et anglais (`parametres`, `consigne` vs `cd`), dette mineure.

### 4.3 Wizard épreuve

| Aspect    | Code                          | Preuve                                                                                                                 |
| --------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Composant | `EvaluationCompositionEditor` | [components/evaluations/EvaluationCompositionEditor.tsx](../../components/evaluations/EvaluationCompositionEditor.tsx) |

**`[divergence de nommage]`** — Ni le fichier ni le composant ne contiennent le mot « Wizard ». Le DOMAIN parle de « wizard épreuve » ; le code a choisi « CompositionEditor ». À clarifier avec le développeur : choix délibéré ou dette ?

---

## 5. Modes de rendu (DOMAIN §1.2)

| Mode DOMAIN    | Valeur code                                       | Preuve                                                                                                                                                                                                                       | Divergence                            |
| -------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Sommaire       | `"sommaire"` de `FicheMode`                       | [lib/fiche/types.ts:16](../../lib/fiche/types.ts#L16)                                                                                                                                                                        | —                                     |
| Aperçu imprimé | (pas une valeur de `FicheMode`) — pipeline séparé | [components/epreuve/impression/index.tsx](../../components/epreuve/impression/index.tsx), [lib/impression/types.ts](../../lib/impression/types.ts), [lib/epreuve/pagination/types.ts](../../lib/epreuve/pagination/types.ts) | **Architecture divergente** (voir §7) |
| Miniature      | `"thumbnail"` de `FicheMode`                      | [lib/fiche/types.ts:16](../../lib/fiche/types.ts#L16)                                                                                                                                                                        | **`[anglicisme]`**                    |

### 5.1 Sommaire

- Type : `FicheMode = "thumbnail" \| "sommaire" \| "lecture"` dans [lib/fiche/types.ts:16](../../lib/fiche/types.ts#L16).
- Composant wizard : `FicheSommaireColumn` (colonne droite du wizard).
- Renderer canonique : `FicheRenderer` [lib/fiche/FicheRenderer.tsx](../../lib/fiche/FicheRenderer.tsx), consomme sections + state + refs + mode.

**`[information complémentaire]`** — `FicheMode` comporte **trois** valeurs : `thumbnail`, `sommaire`, `lecture`. La valeur `"lecture"` n'est pas dans DOMAIN §1.2 (qui n'en liste que trois : sommaire / aperçu imprimé / miniature). Côté code, « lecture » est le mode de la **vue détaillée** (`FicheLecture` / `components/tache/vue-detaillee/`). À confirmer en passe 2 : « lecture » est-il à assimiler à « sommaire » (même pipeline), ou est-ce un quatrième mode implicite ?

### 5.2 Aperçu imprimé

Pas une valeur de `FicheMode`. Pipeline dédié :

| Étape              | Code                                                                                                                        | Preuve                                                                                                                  |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Type sortie unifié | `RenduImprimable`                                                                                                           | [lib/impression/types.ts](../../lib/impression/types.ts)                                                                |
| Contexte           | `ContexteImpression = { type: "document" } \| { type: "tache", mode, estCorrige } \| { type: "epreuve", mode, estCorrige }` | [lib/impression/types.ts:20](../../lib/impression/types.ts)                                                             |
| Transformation     | `epreuveVersImprimable`                                                                                                     | [lib/epreuve/transformation/epreuve-vers-paginee.ts:265](../../lib/epreuve/transformation/epreuve-vers-paginee.ts#L265) |
| Pagination         | `paginer`, `mesurerBloc`, `verifierDebordement`                                                                             | [lib/epreuve/pagination/pager.ts](../../lib/epreuve/pagination/pager.ts)                                                |
| Renderer unique    | `ApercuImpression` (invariant §0.5 commentaire du fichier)                                                                  | [components/epreuve/impression/index.tsx:8](../../components/epreuve/impression/index.tsx#L8)                           |
| Sections           | `SectionPage`, `SectionDocument`, `SectionQuadruplet`, `SectionCorrige`                                                     | [components/epreuve/impression/sections/](../../components/epreuve/impression/sections/)                                |

### 5.3 Miniature

- Valeur : `"thumbnail"` de `FicheMode`.
- Composants : `DocumentCardThumbnail`, `FicheThumbnail`, `BankThumbnailCard`.

**`[anglicisme]`** — Le DOMAIN dit « miniature » ; le code dit `thumbnail` partout (valeur enum + noms de composants). Libellé UI visible non vérifié à ce stade (attendu : « miniature »).

---

## 6. Variantes d'aperçu imprimé (DOMAIN §1.3)

| Variante DOMAIN           | Valeur code                                    | Preuve                                                                          |
| ------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------- |
| Formatif                  | `"formatif"` de `ModeImpression`               | [lib/epreuve/pagination/types.ts:11](../../lib/epreuve/pagination/types.ts#L11) |
| Sommatif standard         | `"sommatif-standard"` de `ModeImpression`      | [lib/epreuve/pagination/types.ts:11](../../lib/epreuve/pagination/types.ts#L11) |
| Épreuve ministérielle     | `"epreuve-ministerielle"` de `ModeImpression`  | [lib/epreuve/pagination/types.ts:11](../../lib/epreuve/pagination/types.ts#L11) |
| Corrigé (flag orthogonal) | `estCorrige: boolean` sur `ContexteImpression` | [lib/impression/types.ts:20](../../lib/impression/types.ts)                     |

- Type exhaustif : `ModeImpression = "formatif" \| "sommatif-standard" \| "epreuve-ministerielle"`.
- Feuillets générés par mode : `TypeFeuillet = "dossier-documentaire" \| "questionnaire" \| "cahier-reponses"` [lib/epreuve/pagination/types.ts:12](../../lib/epreuve/pagination/types.ts#L12). Composition par mode : [lib/epreuve/transformation/epreuve-vers-paginee.ts:195-223](../../lib/epreuve/transformation/epreuve-vers-paginee.ts#L195).
- Règles de visibilité (guidage / titres docs) par mode : [lib/impression/builders/regles-visibilite.ts](../../lib/impression/builders/regles-visibilite.ts).
- Toggle feuillet dans wizard : `TaePrintFeuilletId = "dossier" \| "questionnaire"` [components/tae/TaeForm/preview/TaePrintFeuilletToggle.tsx](../../components/tae/TaeForm/preview/TaePrintFeuilletToggle.tsx).

**Mapping exhaustif direct.** Le champ `estCorrige` est bien un flag booléen orthogonal aux 3 modes (conforme DOMAIN §1.3).

---

## 7. Zones où le vocabulaire diverge

Synthèse des dettes repérées pendant cette passe. Aucune correction : seulement repérage pour passes ultérieures.

| #   | Terme DOMAIN                                       | Forme code                                                               | Emplacements                                                               | Qualification                                                                                        |
| --- | -------------------------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| D1  | Tâche                                              | `Tae` / `tae` / `/questions` / `TaeForm`                                 | schema.sql, lib/tae/, components/tae/, app/questions                       | `[dette de nommage connue]` — migration partielle vers `Tache` en cours                              |
| D2  | Épreuve                                            | `Evaluation` / `evaluations` / `/evaluations`                            | schema.sql, components/evaluations/                                        | `[dette de nommage connue]` — migration partielle vers `Epreuve` en cours                            |
| D3  | Appel documentaire                                 | `amorce documentaire` / `amorceDocumentaire`                             | lib/tae/consigne-helpers.ts, components/tae/TaeForm/tiptap/insertAmorce.ts | `[divergence de nommage]` — terme de substitution, pas de trace d'« appel »                          |
| D4  | Production attendue                                | `corrige`                                                                | schema.sql:289, FormState.bloc5.corrige, selectCorrige, SectionCorrige     | `[divergence de nommage]` — libellé UI aligné, champ/colonne legacy                                  |
| D5  | Banque collaborative                               | `bank`                                                                   | /bank, components/bank/                                                    | `[anglicisme]` — libellé UI aligné                                                                   |
| D6  | Miniature                                          | `thumbnail`                                                              | FicheMode value, DocumentCardThumbnail, BankThumbnailCard                  | `[anglicisme]`                                                                                       |
| D7  | Wizard épreuve                                     | `EvaluationCompositionEditor`                                            | components/evaluations/EvaluationCompositionEditor.tsx                     | `[divergence de nommage]` — pas de fichier « Wizard épreuve » ; à trancher : choix ou dette ?        |
| D8  | Épingler                                           | `favoris` (SQL) / `favori_type` (enum) + `epinglee` / `surEpingler` (UI) | schema.sql:82,506, components/tache/vue-detaillee/barre-actions.tsx        | `[divergence de nommage]` + état fonctionnel seulement ébauché (toast « à venir »)                   |
| D9  | `FicheMode`                                        | inclut `"lecture"` en plus des 3 modes DOMAIN                            | lib/fiche/types.ts:16                                                      | `[écart au DOMAIN]` — 4 valeurs côté code vs 3 côté DOMAIN                                           |
| D10 | Notes au correcteur                                | `notesCorrecteur` en FormState, **aucune colonne SQL**                   | tae-form-state-types.ts, tae-for-edit.ts:389 ; absent de schema.sql        | `[incertain]` — persistance probablement en JSONB (`tae.non_redaction_data`?) à confirmer en passe 2 |
| D11 | Wizard tâche : ids d'étapes mi-français mi-anglais | `cd` au lieu de `competence-disciplinaire`                               | components/tae/TaeForm/step-meta.ts                                        | `[dette mineure]`                                                                                    |

---

## 8. Questions que je me suis posées

Questions laissées ouvertes pour le développeur et pour les passes ultérieures (pas d'invention de réponse).

1. **`FicheMode.lecture`** — Est-ce un mode à part entière (« vue détaillée en lecture »), ou bien une spécialisation du mode « sommaire » destinée à la route de vue détaillée ? Impact : DOMAIN_MODEL §1.2 ne le recense pas.
2. **Notes au correcteur** — Persistance réelle : JSONB `tae.non_redaction_data`, colonne manquante à ajouter, ou champ temporaire non persisté ? (cf. D10)
3. **Wizard document en Bloc 4** — `DocumentSlotCreateForm` réutilise-t-il `AutonomousDocumentForm`, ou duplique-t-il la logique ? Candidat INV-S2 à qualifier en passe 2.
4. **`EvaluationCompositionEditor`** — Le choix de ne pas nommer ce composant « Wizard » est-il délibéré (l'épreuve n'est pas un wizard mais un éditeur de composition) ? Si oui, DOMAIN_MODEL §1.1 devrait le refléter.
5. **Ressources épinglées** — Le renommage `favoris → ressources_epinglees` est-il planifié, ou bien « favori » reste-t-il le terme technique et « épingler » seulement l'action UI ? (cf. D8)
6. **`tae_wizard_drafts`** — Le tableau des brouillons de wizard porte le nom `tae_wizard_drafts` (cohérent avec dette D1). À renommer en même temps que `tae → tache` ?
7. **`favori_type` enum** — Les valeurs `('tae','document','evaluation')` devront suivre le renommage entités. Point de bascule à planifier.

---

## 9. Couverture

Termes du glossaire DOMAIN_MODEL §1.1, §1.2, §1.3 traités dans cette passe : **26/26**.

- §1.1 Entités stockées : Document, Tâche, Épreuve → §1 — 3/3.
- §1.1 Entités dérivées / attributs : Outil d'évaluation, Espace de production, Appel documentaire, Numérotation, Consigne, Guidage, Production attendue, Notes au correcteur, Comportement attendu, Repère temporel, Année normalisée → §2 — 11/11.
- §1.1 Espaces : Espace personnel, Banque collaborative, Ressources épinglées → §3 — 3/3.
- §1.1 Wizards : document, tâche, épreuve → §4 — 3/3.
- §1.2 Modes de rendu : Sommaire, Aperçu imprimé, Miniature → §5 — 3/3.
- §1.3 Variantes aperçu imprimé : Formatif, Sommatif standard, Épreuve ministérielle, Corrigé → §6 — 4/4 (dont Corrigé = flag orthogonal, non-mode).

**Aucun `[À VÉRIFIER]` restant. Aucun `[INTROUVABLE]` pour les entités ; un `[INTROUVABLE]` partiel sur la colonne SQL « notes au correcteur » (documenté D10).**

— Fin de passe 1.
