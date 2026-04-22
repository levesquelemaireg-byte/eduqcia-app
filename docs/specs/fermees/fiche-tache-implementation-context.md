# Fiche tâche — Contexte d'implémentation (detail view lecture)

**Statut** : FERMÉ — spec complétée à 100%

> **Date de création** : 11 avril 2026
> **Date de fermeture** : 12 avril 2026

**Dernière mise à jour :** 12 avril 2026 (session 7 — fin Phase 8 + branchement page)
**Spec de référence :** `docs/specs/fiche-tache-lecture.md`
**Convention de nommage :** `CLAUDE.md` § Convention de nommage et structure des fichiers

---

## Tableau de bord de progression

| Phase | Titre                              | Statut       | Notes                                                            |
| ----- | ---------------------------------- | ------------ | ---------------------------------------------------------------- |
| 1     | Tokens et primitives de base       | **Terminée** | Build propre, rétrocompatibilité vérifiée                        |
| 2     | Selectors de la fiche tâche        | **Terminée** | 5 flux + 10 rail, build propre                                   |
| 3     | Configuration et sections          | **Terminée** | 5 sections + FluxLecture, build propre                           |
| 4     | Rail et layout desktop             | **Terminée** | TacheRail + TacheVueDetailleeLayout, build propre                |
| 5     | Barre d'actions (TopNavBar)        | **Terminée** | TacheBarreActions, handlers placeholder, build propre            |
| 6     | Modale de fiche document embarquée | **Terminée** | useFicheModale + FicheModale + TacheVueDetaillee, build propre   |
| 7     | Responsive tablet et mobile        | **Terminée** | 3 breakpoints, accordéon mobile, modale fullscreen, build propre |
| 8     | Accessibilité et polish final      | **Terminée** | a11y, zones tactiles, print, branchement page, build propre      |

---

## Rapport de situation — état actuel du code

### Ce qui existe et correspond à la spec

**Route** — `/questions/[id]` existe (`app/(app)/questions/[id]/page.tsx`). Server component qui fetch `TacheFicheData` via `fetchTacheFicheBundle()` et rend `FicheLecture`.

**Architecture 3 couches** — en place et fonctionnelle dans `lib/fiche/` :

- **Config :** `TACHE_LECTURE_SECTIONS` dans `lib/fiche/configs/tache-lecture-sections.ts` — 9 sections définies via `defineSection()`
- **Selectors :** `lib/fiche/selectors/lecture-selectors.ts` — 9 selectors purs `(TacheFicheData, SelectorRefs) → SectionState<T>`
- **View :** composants section dans `lib/fiche/sections/` — tous suivent le contrat `{ data: T; mode: FicheMode }`

**Primitives** dans `lib/fiche/primitives/` — 7 primitives existantes :

- `MetaChip` — pill inline-flex, `bg-panel-alt`, `text-xs font-bold`, icône accent 0.9em
- `IconBadge` — glyphe OI via `MaterialSymbolOiGlyph`, taille clamp dynamique, pas de box/fond
- `SectionLabel` — label uppercase accent avec icône, `mb-[0.65rem]`, `text-xs font-semibold`
- `ChipBar` — wrapper `flex flex-wrap items-stretch gap-2`
- `ContentBlock` — rendu HTML sanitisé avec `dangerouslySetInnerHTML` et clamp optionnel
- `DocCard` — card document avec lettre (A-D), titre, source, aperçu, skeleton si incomplet
- `MetaRow` — ligne icône+texte avec badge statut optionnel (array items + badge)

**Données** — `TacheFicheData` (`lib/types/fiche.ts`) contient tous les champs nécessaires pour la vue lecture. `fetchTacheFicheBundle` (`lib/tache/server-fiche-map.ts`) construit le bundle complet depuis Supabase (tae + profiles + oi + comportements + niveaux + disciplines + cd + connaissances + documents + votes).

**Composants embarqués (boîtes noires, ne pas toucher) :**

- Arbre CD : `lib/fiche/sections/SectionCD.tsx` — rendu 3 niveaux (compétence → composante → critère)
- Arbre connaissances : `lib/fiche/sections/SectionConnaissances.tsx` — rendu hiérarchique (réalité sociale → section → sous-section → énoncés)
- Grille ministérielle : `components/tache/grilles/GrilleEvalTable.tsx` — wrapper qui délègue à `grille-registry.tsx`

### Divergences entre l'existant et la spec

| Aspect                        | État actuel                                                                              | Spec                                                                                                            | Réconciliation                                                                            |
| ----------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **Layout global**             | Carte mono-colonne dans `<article>` bordé (FicheRenderer)                                | 3 zones : top navbar + flux principal gauche + rail sticky droite                                               | Nouveau composant `TacheVueDetaillee` — ne pas toucher au `FicheRenderer` existant        |
| **Hero**                      | Header (icône OI + pills) et Consigne sont 2 sections séparées                           | Hero unique : IconBadge 52px boxed + overline MetaChip OI + h1 amorce+consigne fusionnés + comportement attendu | Nouveau composant `SectionHero` dans `sections/`                                          |
| **Sections dans le flux**     | 9 sections (dont CD, connaissances, footer)                                              | 4 sections seulement + hero en tête ; CD, connaissances, footer migrent dans le rail                            | Nouveau `FluxLecture` itère les sections du flux sans carte englobante                    |
| **Ordre sections**            | Header → Consigne → Guidage → Documents → Corrigé → Grille → CD → Connaissances → Footer | Hero → Documents → Guidage → Production attendue → Grille                                                       | Nouvel array de config, pas de modification de l'existant                                 |
| **IconBadge**                 | Glyphe nu, taille clamp dynamique, pas de box/fond                                       | Box 52px, `bg-panel-alt`, radius 12px, glyphe accent 26px                                                       | Étendre avec props optionnelles (`boxed`, `size`) — rétrocompatible                       |
| **MetaRow**                   | Array d'items + badge, layout plat flex-wrap                                             | Trois variantes : simple, status, **expandable** (chevron + contenu déplié)                                     | Étendre avec variante `expandable` — rétrocompatible                                      |
| **Corrigé couleur**           | Utilise `text-error`                                                                     | Nouveau token `--color-corrige: #A32D2D` distinct de error                                                      | Ajouter token, nouveau composant `SectionCorrige` dans vue-detaillee                      |
| **SectionLabel "Corrigé"**    | Label dit « Corrigé »                                                                    | Label dit « Production attendue »                                                                               | Nouveau composant, pas de modification de l'existant                                      |
| **DocCard**                   | Card avec lettre (A-D), titre, pas de numéro ni onClick                                  | Numéro (1-4) + pastille numérotée + icône catégorie + titre + source + aperçu + **cliquable** (ouvre modale)    | Étendre avec props optionnelles (`numero`, `categorieGlyph`, `onClick`) — rétrocompatible |
| **Séparation inter-sections** | Hairlines `<hr>` entre sections (FICHE_HAIRLINE_RULE)                                    | Whitespace vertical ~48px, aucun divider                                                                        | Nouveau `FluxLecture` gère le whitespace, `FicheRenderer` garde ses hairlines             |
| **Grille**                    | Rendue directement, visible en sommaire+lecture                                          | Accordéon collapsed par défaut, visible en lecture uniquement                                                   | Nouveau composant `SectionGrille` dans vue-detaillee avec accordéon                       |

### Ce qui n'existe pas et est à créer

**Tokens :**

- `--color-corrige: #A32D2D` dans `globals.css`

**Composants (convention de nommage) :**

```
components/tache/vue-detaillee/index.tsx               → TacheVueDetaillee
components/tache/vue-detaillee/layout.tsx               → TacheVueDetailleeLayout
components/tache/vue-detaillee/rail.tsx                 → TacheRail
components/tache/vue-detaillee/barre-actions.tsx        → TacheBarreActions
components/tache/vue-detaillee/flux-lecture.tsx          → FluxLecture
components/tache/vue-detaillee/sections/hero.tsx        → SectionHero
components/tache/vue-detaillee/sections/documents.tsx   → SectionDocuments
components/tache/vue-detaillee/sections/guidage.tsx     → SectionGuidage
components/tache/vue-detaillee/sections/corrige.tsx     → SectionCorrige
components/tache/vue-detaillee/sections/grille.tsx      → SectionGrille

components/partagees/fiche-modale/index.tsx             → FicheModale
```

**Selectors :**

```
lib/fiche/selectors/tache/hero.ts                      → selectHero
lib/fiche/selectors/tache/documents.ts                 → selectDocuments
lib/fiche/selectors/tache/guidage.ts                   → selectGuidage
lib/fiche/selectors/tache/corrige.ts                   → selectCorrige
lib/fiche/selectors/tache/grille.ts                    → selectGrille
lib/fiche/selectors/tache/rail/niveau.ts               → selectRailNiveau
lib/fiche/selectors/tache/rail/discipline.ts           → selectRailDiscipline
lib/fiche/selectors/tache/rail/aspects.ts              → selectRailAspects
lib/fiche/selectors/tache/rail/chapitre-connaissances.ts → selectRailChapitreConnaissances
lib/fiche/selectors/tache/rail/competence.ts           → selectRailCompetence
lib/fiche/selectors/tache/rail/connaissances.ts        → selectRailConnaissances
lib/fiche/selectors/tache/rail/documents-compte.ts     → selectRailDocumentsCompte
lib/fiche/selectors/tache/rail/auteur.ts               → selectRailAuteur
lib/fiche/selectors/tache/rail/dates.ts                → selectRailDates
lib/fiche/selectors/tache/rail/statut.ts               → selectRailStatut
```

**Hooks :**

```
hooks/tache/use-epingler.ts                            → useEpingler
hooks/tache/use-ajouter-epreuve.ts                     → useAjouterEpreuve
hooks/partagees/use-fiche-modale.ts                    → useFicheModale
```

---

## Réponses aux questions bloquantes

### Q1 — notes_correcteur en BDD

**Décision :** hors scope v1. Le champ n'existe pas en BDD et ne sera pas ajouté. La section « Production attendue » rend uniquement le contenu `corrige`, sans notes au correcteur. Ignorer toutes les mentions de notes au correcteur dans la spec.

### Q2 — guidage_masque_en_sommatif

**Décision :** hors scope v1. Ce flag n'existe pas en BDD. En mode lecture enseignant, le guidage est toujours visible s'il a du contenu (`hasFicheContent(state.guidage)`). Ignorer toute mention de masquage conditionnel dans la spec.

### Q3 — Épingler (pin) — schéma BDD

**Décision :** hors scope v1 côté BDD. Pas de table `pinned_tasks`, pas de migration. Le bouton épingler est visible dans la barre d'actions avec son état visuel toggle, câblé à un handler `console.log("épingler toggle")` + toast « Fonctionnalité à venir ». L'UI est prête, le backend sera branché plus tard.

### Q4 — SectionVotes

**Décision :** conservé. Rendu sous le flux principal gauche, après la section Grille, à l'intérieur de la colonne gauche du layout 2 colonnes. Pas dans le rail. Aucun changement sur ce composant.

### Q5 — Impact sur modes miniature et apercu

**Décision :** ne pas toucher aux composants et configs utilisés par les modes miniature et apercu. Créer un nouveau composant racine `TacheVueDetaillee` pour la route `/questions/[id]`. Les extensions de primitives restent rétrocompatibles via props optionnelles. Si un breaking change est nécessaire sur une primitive, arrêter et signaler.

### Q6 — MetaPill vs MetaChip

**Décision :** garder `MetaChip`. Ne renommer rien dans l'existant. Traduction mentale dans la spec : « MetaPill » = `MetaChip`.

### Q7 — Popover Ajouter à une épreuve

**Décision :** hors scope v1. Bouton visible dans la barre d'actions, câblé à un handler `console.log("ajouter à épreuve")` + toast « Fonctionnalité à venir ».

---

## Décisions architecturales prises

### 1. Convention de nommage

**Décision :** convention stricte en place dans `CLAUDE.md` § « Convention de nommage et structure des fichiers ». Entités métier en français (`tache`, `document`, `epreuve`), fonctions techniques codifiées (`vue-detaillee`, `miniature`, `apercu`, `sections`, `rail`), noms de fichiers en kebab-case, composants en PascalCase, props métier en français, code technique en anglais.

**Justification :** cohérence à long terme, suppression de l'ambiguïté sur les emplacements de fichiers, lisibilité immédiate de l'arborescence.

### 2. FluxLecture créé plutôt que réutilisation de FicheRenderer

**Décision :** créer un composant `FluxLecture` dans `components/tache/vue-detaillee/flux-lecture.tsx` qui itère un array de sections et rend chaque section avec du whitespace vertical (~48px), sans wrapper `<article>` bordé ni hairlines.

**Justification :** le `FicheRenderer` existant enveloppe tout dans un `<article>` avec bordure gauche accent, rounded, shadow et hairlines entre sections. La spec exige du whitespace entre sections, pas de carte englobante. Modifier `FicheRenderer` casserait les modes miniature, apercu et wizard. `FluxLecture` est minimal et spécifique à la vue lecture.

### 3. MetaChip gardé, pas renommé en MetaPill

**Décision :** le code existant utilise `MetaChip`, la spec utilise le terme « MetaPill ». On garde `MetaChip` partout.

**Justification :** ne pas renommer un composant existant sans raison technique. La spec est traduite mentalement.

### 4. Selectors atomiques pour le rail (correction)

**Décision :** créer 10 selectors atomiques en fichiers séparés dans `lib/fiche/selectors/tache/rail/`, un par concept (niveau, discipline, aspects, chapitre-connaissances, competence, connaissances, documents-compte, auteur, dates, statut). Chaque selector suit le pattern `(TacheFicheData, SelectorRefs) → SectionState<T>`.

**Justification :** l'extraction inline dans un composant React casse l'architecture 3 couches, la testabilité, et la réutilisabilité. Un selector pur se teste en 3 lignes. Deux patterns concurrents dans le codebase (selectors purs vs extraction inline) créent de la confusion pour les futurs mainteneurs.

### 5. Features hors scope v1

Les éléments suivants sont volontairement hors scope de cette implémentation :

| Feature                        | Raison                      | UI placeholder                                        |
| ------------------------------ | --------------------------- | ----------------------------------------------------- |
| Notes au correcteur            | Champ absent en BDD         | Aucun — section non rendue                            |
| Masquage guidage (sommatif)    | Flag absent en BDD          | Aucun — guidage toujours visible si contenu           |
| Épingler backend               | Table absente en BDD        | Bouton visible + toast « Fonctionnalité à venir »     |
| Popover Ajouter à une épreuve  | Composant séparé hors scope | Bouton visible + toast « Fonctionnalité à venir »     |
| Exporter en PDF                | Feature séparée             | Item kebab visible + toast « Fonctionnalité à venir » |
| Signaler un problème           | v2 futur                    | Non rendu (marqué v2 dans la spec)                    |
| Supprimer (confirmation modal) | Composant modal séparé      | Item kebab visible + `console.log` placeholder        |

---

## Ajustements au plan de travail

### Phase 1 — Tokens et primitives de base

- Ajouter `--color-corrige: #A32D2D` dans `globals.css`
- Étendre `IconBadge` avec mode boxed (52px, `bg-panel-alt`, radius 12px) via props optionnelles — rétrocompatible
- Étendre `MetaRow` avec variante `expandable` (chevron, contenu déplié, `aria-expanded`) — rétrocompatible
- Étendre `DocCard` avec props optionnelles (`numero`, `categorieGlyph`, `onClick`) — rétrocompatible
- Vérifier conformité `MetaChip` et `SectionLabel` avec les valeurs exactes de la spec
- **Vérification post-phase :** les modes miniature et apercu marchent exactement comme avant

### Phase 2 — Selectors

- Créer `lib/fiche/selectors/tache/hero.ts` — fusion amorce+consigne, résolution placeholders, sanitization
- Créer `lib/fiche/selectors/tache/documents.ts`, `guidage.ts`, `corrige.ts`, `grille.ts` — selectors du flux principal
- Créer les 10 selectors atomiques dans `lib/fiche/selectors/tache/rail/` — un fichier par concept
- Tests unitaires pour chaque selector

### Phase 3 — Configuration et sections

- Créer `FluxLecture` dans `components/tache/vue-detaillee/flux-lecture.tsx`
- Créer les 5 composants section dans `components/tache/vue-detaillee/sections/`
- Intégrer `SectionVotes` existant après `SectionGrille`

### Phase 4 — Rail et layout desktop

- Créer `TacheRail` dans `components/tache/vue-detaillee/rail.tsx`
- Créer `TacheVueDetailleeLayout` dans `components/tache/vue-detaillee/layout.tsx`
- CSS grid 2 colonnes, rail sticky

### Phase 5 — Barre d'actions

- Créer `TacheBarreActions` dans `components/tache/vue-detaillee/barre-actions.tsx`
- Différenciation auteur/non-auteur
- Kebab dropdown
- Handlers placeholder pour épingler, ajouter à épreuve, exporter PDF

### Phase 6 — Modale de fiche document embarquée

- Créer `useFicheModale` dans `hooks/partagees/use-fiche-modale.ts`
- Créer `FicheModale` dans `components/partagees/fiche-modale/index.tsx`
- Intégration dans `SectionDocuments` — click DocCard ouvre modale
- Focus trap, Escape, click backdrop, a11y

### Phase 7 — Responsive tablet et mobile

- Breakpoints 1024px / 768px
- Rail réintégré en haut (tablet) / accordéon (mobile)
- Barre d'actions simplifiée mobile
- Modale plein écran mobile

### Phase 8 — Accessibilité et polish final

- Focus initial sur h1 hero
- Tab order (barre actions → hero → flux → rail)
- ARIA sur MetaRows expandables, bouton épingler, modale
- Zones tactiles 44×44px
- Toasts
- `@media print` (masquer navbar et rail)

---

## Journal de session — 12 avril 2026 (session 2)

### Phase 1 — Tokens et primitives de base (terminée)

**Fichiers modifiés :**

- `app/globals.css` — ajout `--color-corrige: #a32d2d` dans `:root` et `@theme inline`
- `tailwind.config.ts` — ajout `corrige: "#a32d2d"` dans `colors`
- `lib/fiche/primitives/IconBadge.tsx` — ajout props optionnelles `boxed` et `size` ; mode boxed : boîte carrée bg-panel-alt, radius-lg, glyphe accent centré à size/2 px. Rétrocompatible (sans boxed = comportement existant inchangé).
- `lib/fiche/primitives/MetaRow.tsx` — ajout de 3 exports : `MetaRowExpandable` (ligne déroulante avec chevron, `aria-expanded`, `aria-controls`), `MetaRowSimple` (ligne icône+texte pour le rail), `StatusBadge` (exporté en standalone). L'export `MetaRow` original reste intact pour les footers existants.
- `lib/fiche/primitives/DocCard.tsx` — ajout props optionnelles `numero`, `categorieGlyph`, `onClick`. Quand `numero` est fourni, rend le style vue détaillée (pastille numérotée + icône catégorie + contenu cliquable). Import `cn` ajouté. Ajout composant interne `DocMetaLine` (ligne source compacte). Rétrocompatible (sans numero = comportement existant inchangé).

**Vérification conformité MetaChip / SectionLabel :**

- MetaChip : conforme à la spec sauf `rounded-lg` = 12px (spec mentionne 8px mais écrit `rounded-lg` entre parenthèses → gardé tel quel).
- SectionLabel : écarts mineurs (`font-semibold` vs spec `font-medium`, `gap-2` vs spec `gap-1.5`, `mb-[0.65rem]` vs spec 14px). Non modifié pour rétrocompatibilité miniature/apercu. Ajustements possibles en Phase 3 via className dans les composants vue-detaillee.

**Build :** propre, rétrocompatibilité confirmée.

### Phase 2 — Selectors (terminée)

**Fichiers créés :**

Flux principal (`lib/fiche/selectors/tache/`) :

- `hero.ts` — `selectHero(TacheFicheData) → HeroData` : oiGlyph, oiLabel, enonce (HTML sanitisé, placeholders résolus), comportementAttendu
- `documents.ts` — `selectDocuments(TacheFicheData) → DocumentsSectionData | null` : sectionLabel singulier/pluriel + array DocCardData (numero, docId, categorieGlyph, doc). Retourne null si 0 documents.
- `guidage.ts` — `selectGuidage(TacheFicheData) → GuidageData | null` : HTML sanitisé ou null si vide
- `corrige.ts` — `selectCorrige(TacheFicheData) → CorrigeData | null` : HTML sanitisé ou null si vide
- `grille.ts` — `selectGrille(TacheFicheData) → GrilleData | null` : outilEvaluationId ou null si absent

Rail (`lib/fiche/selectors/tache/rail/`) :

- `niveau.ts` — `selectRailNiveau → { label }`
- `discipline.ts` — `selectRailDiscipline → { label }`
- `aspects.ts` — `selectRailAspects → { labels: string[] } | null`
- `chapitre-connaissances.ts` — `selectRailChapitreConnaissances → { racine } | null`
- `competence.ts` — `selectRailCompetence → { racine, cd } | null`
- `connaissances.ts` — `selectRailConnaissances → { terminal, connaissances } | null`
- `documents-compte.ts` — `selectRailDocumentsCompte → { texte } | null` (singulier/pluriel, null si 0)
- `auteur.ts` — `selectRailAuteur → { nom }`
- `dates.ts` — `selectRailDates → { creation, miseAJour }`
- `statut.ts` — `selectRailStatut → { statut: "brouillon" | "publiee" }`

**Build :** propre.

### Décisions prises cette session

**D6 — Singulier/pluriel dans les selectors :** le label de section "Documents"/"Document" et le texte du rail "N documents"/"1 document" sont calculés dans les selectors (`selectDocuments.sectionLabel`, `selectRailDocumentsCompte.texte`), pas dans les composants. Si 0 documents, les deux retournent `null` et les sections ne sont pas rendues.

**D7 — getCategoryIcon non utilisable :** `DocumentFiche.categorieLabel` est un label d'affichage, pas un ID de catégorie. Le selector documents utilise `getDocumentTypeIcon(doc.type)` comme source fiable pour le glyphe de catégorie.

**D8 — Selectors simplifiés sans SelectorRefs :** les selectors de la vue détaillée prennent uniquement `TacheFicheData` (pas de `SelectorRefs`). Les données sont déjà pré-résolues côté serveur par `fetchTacheFicheBundle`. Seul `selectGrille` de l'ancien système avait besoin de `refs.grilles` — le nouveau selector retourne juste l'ID et le composant grille résoudra l'entrée lui-même.

## Journal de session — 12 avril 2026 (session 3)

### Phase 3 — Configuration et sections (terminée)

**Fichiers créés :**

Sections vue détaillée (`components/tache/vue-detaillee/sections/`) :

- `hero.tsx` — `SectionHero` : IconBadge 52px boxed + overline MetaChip OI + h1 énoncé HTML (amorce+consigne fusionnées) + comportement attendu. Pas de SectionLabel (le hero est la tête de la fiche).
- `documents.tsx` — `SectionDocuments` : SectionLabel dynamique (singulier/pluriel via selector) + liste verticale de DocCards numérotées. Prop `surClicDocument` pour le futur branchement modale (Phase 6).
- `guidage.tsx` — `SectionGuidage` : SectionLabel + ContentBlock en italique couleur steel.
- `corrige.tsx` — `SectionCorrige` : SectionLabel « Production attendue » + ContentBlock en couleur `text-corrige`. Notes au correcteur hors scope v1.
- `grille.tsx` — `SectionGrille` : SectionLabel + accordéon collapsed par défaut. Résout l'entrée GrilleEntry via `useGrilles()` + `useMemo`. GrilleEvalTable en viewport `comfort`.

Flux principal (`components/tache/vue-detaillee/`) :

- `flux-lecture.tsx` — `FluxLecture` : appelle les 5 selectors Phase 2 via `useMemo`, rend les sections conditionnellement (null = section masquée), whitespace ~48px entre sections (`gap-12`). Intègre `SectionVotes` en fin de flux. Pas de carte englobante, pas de hairlines.

**Fichiers modifiés :**

- `lib/ui/ui-copy.ts` — ajout de 3 constantes : `FICHE_SECTION_TITLE_GUIDAGE`, `FICHE_SECTION_TITLE_PRODUCTION_ATTENDUE`, `FICHE_SECTION_TITLE_GRILLE` (labels de section vue détaillée conformes à la spec).

**Build :** propre, aucune erreur TS, Prettier appliqué.

### Décisions prises cette session

**D9 — Copy UI centralisée pour les labels de section :** conformément à CLAUDE.md (« Tout texte visible vient exclusivement de `docs/UI-COPY.md` et `lib/ui/ui-copy.ts` »), les labels de section de la vue détaillée ont été ajoutés comme constantes dans `ui-copy.ts`. Note : `docs/UI-COPY.md` n'a pas été mis à jour (règle « Ne jamais modifier un fichier docs/ de sa propre initiative ») — à synchroniser par le développeur.

**D10 — Résolution grille dans le composant :** `SectionGrille` résout l'entrée `GrilleEntry` via `useGrilles()` (hook existant qui fetch `/data/grilles-evaluation.json`) + `useMemo` sur `outilEvaluationId`. Ce pattern est cohérent avec `FicheLecture` existant qui fait la même résolution via `refs.grilles`.

**D11 — FluxLecture ne réutilise pas FicheRenderer :** comme décidé en D2 (session 2), le flux principal itère directement les sections via JSX conditionnel plutôt que de passer par `FicheRenderer` (qui ajoute article bordé + hairlines + FicheSection wrapper). Les sections de `FluxLecture` sont des composants indépendants, pas des entrées de config `defineSection`.

**D12 — SectionVotes intégrée dans FluxLecture :** le composant existant `SectionVotes` est rendu en fin de flux principal (après SectionGrille), à l'intérieur du `gap-12`. Les props `votes` et `peutVoter` sont passées à FluxLecture qui les transmet.

---

## Instructions pour reprendre (prochaine session)

1. Lire `docs/specs/fiche-tache-lecture.md` en entier (spec de référence)
2. Lire `CLAUDE.md` § Convention de nommage et structure des fichiers
3. Lire ce fichier (`docs/specs/fiche-tache-implementation-context.md`)
4. Vérifier l'état de progression dans le tableau de bord ci-dessus
5. Attaquer la phase suivante non terminée (Phase 4 — Rail et layout desktop)
6. En fin de session, mettre à jour ce fichier :
   - Avancement dans le tableau de bord
   - Nouvelles décisions architecturales prises
   - Questions bloquantes découvertes
   - Fichiers créés ou modifiés (liste)

---

## Intersections avec l'audit code (AUDIT_CODE_2026.md)

Référence : `AUDIT_CODE_2026.md` — sections « Coordination avec le chantier fiche tâche en cours » et « Axe 3.2 / 4.5 ».

| Point de l'audit                         | Phase concernée        | Contrainte                                             |
| ---------------------------------------- | ---------------------- | ------------------------------------------------------ |
| `safeHtml()` helper                      | Phase 2 — Selectors    | Selectors doivent sanitiser le HTML via `safeHtml()`   |
| Skeleton `/questions/[id]`               | Phase 4 — Route + page | `loading.tsx` skeleton 2 colonnes à créer avec la page |
| Suspense boundaries                      | Phase 4 — Page serveur | Contenu et rail dans des `<Suspense>` séparées         |
| `revalidatePath` publication             | Flux wizard → fiche    | Revalider `/questions/[id]` après `publishTacheAction` |
| Audit axe-core CI                        | Phase 7+ — Tests       | `/questions/[id]` dans la liste des pages auditées     |
| `select("*")` dans `server-fiche-map.ts` | Phase 1 — Data layer   | Colonnes explicites avant de brancher les selectors    |

**Action obligatoire avant fin Phase 1 :** remplacer les 3 `select("*")` de `server-fiche-map.ts` (L67, L102, L144) par les colonnes explicites listées dans l'audit Axe 4.5.

**Action obligatoire avant fin Phase 2 :** créer `lib/utils/safe-html.ts` avec la config restrictive TipTap de l'audit Axe 3.2.

---

## Journal de session — 12 avril 2026 (session 4)

### Phase 4 — Rail et layout desktop (terminée)

**Fichiers créés :**

- `components/tache/vue-detaillee/rail.tsx` — `TacheRail` : `<aside role="complementary">` sticky à droite (280px, top 60px, bg-panel, border 0.5px, radius 12px, padding 16px). Contient dans l'ordre : ChipBar de 4 pills (niveau, discipline, aspects, chapitre connaissances) → gap 18px → MetaRowExpandable CD → MetaRowExpandable connaissances → MetaRowSimple documents/auteur/dates → StatusBadge footer. Consomme les 10 selectors atomiques du rail. SectionCD et SectionConnaissances passées en children des MetaRowExpandable comme boîtes noires.
- `components/tache/vue-detaillee/layout.tsx` — `TacheVueDetailleeLayout` : CSS grid 2 colonnes (`grid-cols-[minmax(0,1fr)_280px]`, gap 40px, max-width 1080px centré). Accepte `children` (FluxLecture) et `rail` (TacheRail) comme props. Colonne gauche dans `<main>`, rail en slot droit.

**Fichiers modifiés :**

- `lib/ui/ui-copy.ts` — ajout de 4 constantes : `FICHE_RAIL_DATE_CREATION`, `FICHE_RAIL_DATE_MAJ`, `FICHE_RAIL_STATUT_PUBLIEE`, `FICHE_RAIL_STATUT_BROUILLON`.

**Build :** propre, aucune erreur TS, ESLint propre, Prettier appliqué.

### Décisions prises cette session

**D13 — SectionCD/SectionConnaissances comme boîtes noires dans le rail :** les composants existants sont passés tels quels en children des MetaRowExpandable. Leur padding interne (px-5 pt-4 pb-4) et leur SectionLabel créent un peu de redondance visuelle avec le label du MetaRowExpandable, mais cela respecte la directive "boîtes noires, ne pas toucher". Un ajustement CSS (override de padding via className sur le wrapper) pourra être fait en Phase 8 (polish) si le développeur le souhaite.

**D14 — Formatage des dates du rail :** utilise `formatDateFrCaMedium()` existant (`lib/utils/format-date-fr-ca.ts`) qui rend au format "12 avr. 2026" via `Intl.DateTimeFormat('fr-CA', { dateStyle: 'medium' })` avec fuseau fixe America/Toronto. Pas de nouveau formatter créé.

**D15 — Layout comme Server Component :** `TacheVueDetailleeLayout` n'a pas besoin de `"use client"` — c'est un wrapper pur sans état ni interactivité. Il reste un Server Component pour minimiser le bundle client.

**D16 — noBorderTop dynamique sur les MetaRows :** la première MetaRow après la ChipBar n'a pas de border-top (séparée par le gap 18px). Si la compétence est absente, c'est la ligne connaissances qui prend `noBorderTop`. Si les deux sont absentes, c'est la ligne documents. Cette logique cascade est implémentée via des conditions sur les props `noBorderTop`.

---

### Phase 5 — Barre d'actions (terminée)

**Fichiers créés :**

- `components/tache/vue-detaillee/barre-actions.tsx` — `TacheBarreActions` : `<header>` sticky top-0 z-10, fond panel, border-bottom 0.5px. À gauche : lien "Banque" avec `arrow_back` vers `/questions`. À droite : bouton primaire "Ajouter à une épreuve" (`snippet_folder`, bg-accent), bouton icône toggle épingler (`file_save`, `aria-pressed`, `fontVariationSettings FILL` quand actif), bouton outline "Modifier" (auteur seulement, `edit_document`), kebab menu (`more_vert`) avec Partager (copie URL clipboard), Exporter en PDF, Supprimer (auteur, couleur error, divider). Handlers placeholder conformes aux décisions Q3/Q7/D5 : `console.log` + toast "Fonctionnalité à venir" pour épingler, ajouter à épreuve, exporter PDF. Partager fonctionne réellement (clipboard API + toast). Supprimer est un `console.log` placeholder.

**Fichiers modifiés :**

- `lib/ui/ui-copy.ts` — ajout de 11 constantes : `FICHE_BARRE_RETOUR`, `FICHE_BARRE_AJOUTER_EPREUVE`, `FICHE_BARRE_EPINGLER`, `FICHE_BARRE_MODIFIER`, `FICHE_BARRE_PARTAGER`, `FICHE_BARRE_EXPORTER_PDF`, `FICHE_BARRE_SUPPRIMER`, `TOAST_FICHE_FONCTIONNALITE_A_VENIR`, `TOAST_FICHE_LIEN_COPIE`.

**Build :** propre. 4 warnings ESLint `no-console` attendus (placeholders hors scope v1).

### Décisions prises — Phase 5

**D17 — Positionnement kebab simplifié :** le kebab utilise un positionnement `absolute` relatif au bouton trigger (pas le `fixed` avec `computeMenuCoords` de `TacheCardMenu`). La barre d'actions est sticky et son contexte de positionnement est prévisible — pas besoin du pattern complexe avec scroll/resize listeners.

**D18 — Partager fonctionne réellement :** contrairement aux autres actions hors scope v1, "Partager" (copier le lien) est trivial à implémenter via `navigator.clipboard.writeText`. Livré fonctionnel avec toast de confirmation.

**D19 — Signaler un problème non rendu :** marqué v2 dans la spec, pas d'item dans le kebab. Sera ajouté quand la feature v2 sera scoped.

**D20 — Props métier en français :** conformément à CLAUDE.md, les props métier sont en français (`estAuteur`, `surAjouterEpreuve`, `surEpingler`, `surPartager`). Les handlers internes et les callbacks du composant suivent cette convention.

---

## Journal de session — 12 avril 2026 (session 5)

### Phase 6 — Modale de fiche document embarquée (terminée)

**Fichiers créés :**

- `hooks/partagees/use-fiche-modale.ts` — `useFicheModale` : hook d'état global pour la modale fiche (un seul modal actif à la fois). Expose `ouvrirFicheModale({ kind, id })`, `fermerFicheModale()`, `modaleOuverte`, `cibleModale`. Gère la restauration du focus sur l'élément déclencheur à la fermeture via `requestAnimationFrame`.
- `components/partagees/fiche-modale/index.tsx` — `FicheModale` : overlay fixed (rgba(28,37,54,0.55)), panneau centré (min(1080px,90vw) × min(90vh,900px), bg-bg, radius 16px, shadow). Header avec titre "Document référencé" + lien "Ouvrir en plein écran" (Link vers `/documents/[id]`) + bouton fermeture `close`. Corps scrollable qui rend `DocumentFicheLecture` (FicheRenderer + DOC_FICHE_SECTIONS) strictement identique à la route dédiée. Focus trap manuel (Tab/Shift+Tab), Escape ferme, click backdrop ferme, `aria-modal="true"`, `role="dialog"`, `aria-labelledby`, focus initial sur le bouton fermeture. Skeleton 2 colonnes pendant le chargement. État erreur "Ce document n'est plus disponible".
- `lib/actions/fetch-doc-fiche-data.ts` — `fetchDocFicheDataAction` : Server Action qui construit un `DocFicheData` complet depuis un document ID. Réplique la logique de `app/(app)/documents/[id]/page.tsx` (hydrate renderer document, fetch niveaux/disciplines/connaissances/profil/usages en parallèle). Retourne `{ ok: true, data }` ou `{ ok: false, error: "auth" | "not_found" }`.
- `components/tache/vue-detaillee/index.tsx` — `TacheVueDetaillee` : orchestrateur client qui compose barre d'actions + layout 2 colonnes (FluxLecture + TacheRail) + FicheModale. Connecte `surClicDocument` (DocCards) → `ouvrirFicheModale`. Prêt à être utilisé par la page `/questions/[id]` quand elle sera mise à jour.

**Fichiers modifiés :**

- `lib/ui/ui-copy.ts` — ajout de 3 constantes : `FICHE_MODALE_TITRE_DOCUMENT`, `FICHE_MODALE_OUVRIR_PLEIN_ECRAN`, `FICHE_MODALE_DOCUMENT_INDISPONIBLE`.

**Build :** propre, aucune erreur TS, ESLint propre (0 erreur sur les fichiers Phase 6), Prettier appliqué.

### Décisions prises — Phase 6

**D21 — Server Action pour fetch document :** la modale est un composant client qui a besoin des données document. Plutôt qu'un route handler, une Server Action `fetchDocFicheDataAction` est créée — cohérent avec le pattern du projet (auth vérifiée, Result type). La logique duplique celle de la page `/documents/[id]` car cette page est un Server Component qui ne peut pas être appelée comme une fonction. Si cette duplication pose problème à terme, extraire la logique commune dans un helper `lib/queries/`.

**D22 — FicheModale pas basée sur SimpleModal :** `SimpleModal` existant a un layout header+body+footer avec `max-w-lg` et `max-h-[min(90vh,720px)]` — trop contraint pour la fiche document qui a besoin de 1080px de large et d'un header différent (lien "Ouvrir en plein écran"). `FicheModale` est un composant dédié qui reprend les patterns d'accessibilité de `SimpleModal` (Escape, click backdrop, aria, body overflow lock) mais avec un layout propre conforme à la spec §10.

**D23 — Focus trap manuel vs librairie :** implémentation manuelle du focus trap (Tab/Shift+Tab cyclique) plutôt qu'une dépendance supplémentaire (`focus-trap-react`, `@headlessui/dialog`). Le pattern est suffisamment simple pour ce cas (un seul modal, pas d'emboîtement) et évite l'ajout d'une dépendance npm.

**D24 — TacheVueDetaillee comme orchestrateur :** plutôt que de modifier la page `/questions/[id]/page.tsx` (hors scope), un composant orchestrateur `TacheVueDetaillee` est créé. Il compose les 4 sous-composants (barre, layout, flux, rail) et gère l'état modal. La page sera mise à jour pour l'utiliser dans une phase ultérieure.

**D25 — Page non modifiée :** conformément à l'instruction "Ne PAS modifier la page `app/(app)/questions/[id]/page.tsx`", la page actuelle continue d'utiliser l'ancien `FicheLecture`. Le branchement de `TacheVueDetaillee` dans la page sera fait séparément.

---

## Journal de session — 12 avril 2026 (session 6)

### Phase 7 — Responsive tablet et mobile (terminée)

**Fichiers modifiés :**

- `components/tache/vue-detaillee/layout.tsx` — `TacheVueDetailleeLayout` : grid 2 colonnes uniquement en `lg:` (≥1024px). En dessous, 1 colonne avec rail au-dessus du flux via `lg:order-*`. Padding réduit sur mobile (`px-4` → `md:px-6`).
- `components/tache/vue-detaillee/rail.tsx` — `TacheRail` : 3 rendus conditionnels via classes Tailwind responsive. Mobile (`md:hidden`) : accordéon replié par défaut avec label "Informations sur la tâche", chevron animé, `role="button"`, `aria-expanded`, keyboard support (Enter/Space). Tablet (`md:block lg:hidden`) : pleine largeur, non sticky, padding 16px. Desktop (`lg:block`) : sticky 280px (inchangé). Le contenu est partagé via une variable `contenuRail` pour éviter la duplication.
- `components/tache/vue-detaillee/barre-actions.tsx` — `TacheBarreActions` : bouton "Ajouter à une épreuve" icon-only sur mobile (`<span className="hidden md:inline">`), texte visible sur tablet+. Boutons épingler et Modifier masqués sur mobile (`hidden md:flex` / `hidden md:inline-flex`) et ajoutés en tête du kebab menu avec `md:hidden`. Divider mobile-only entre les items déplacés et les items globaux.
- `components/tache/vue-detaillee/sections/hero.tsx` — `SectionHero` : IconBadge 40px sur mobile, 52px sur `md:`. h1 consigne 19px mobile, 21px `md:`. Gap réduit à `gap-3` mobile, `md:gap-4`.
- `components/partagees/fiche-modale/index.tsx` — `FicheModale` : mobile plein écran (`h-full w-full`, pas de rounded ni shadow), header avec bouton retour chevron gauche au lieu de croix. Tablet : `w-[calc(100vw-48px)]`, `h-[95vh]`, rounded+shadow. Desktop : `min(1080px,90vw)` × `min(90vh,900px)` (inchangé). Backdrop masqué sur mobile. Focus initial dynamique sur le premier bouton visible (`offsetParent !== null`). Lien "Ouvrir en plein écran" : texte masqué sur mobile, icône seule.
- `lib/ui/ui-copy.ts` — ajout constante `FICHE_RAIL_ACCORDEON_LABEL`.

**Build :** propre, aucune erreur TS, ESLint propre (0 nouvelles erreurs), Prettier appliqué.

### Décisions prises — Phase 7

**D26 — Trois rendus conditionnels pour le rail :** plutôt qu'un seul `<aside>` avec des classes responsive complexes (qui ne peuvent pas changer `sticky` vs non-sticky de manière fiable), trois blocs `<aside>` sont rendus avec `md:hidden` / `md:block lg:hidden` / `lg:block`. Seul un est visible à la fois. Le contenu est factorisé dans une variable `contenuRail` pour zéro duplication. Pas de hook `useMediaQuery` — tout est CSS.

**D27 — Accordéon mobile avec `role="button"` :** conformément �� CLAUDE.md (« Header = `<div role="button">` jamais `<button>` ��� le contenu peut contenir des éléments interactifs »), le header de l'accordéon mobile utilise `role="button"` + `tabIndex={0}` + keyboard handlers. Le contenu déplié contient des `MetaRowExpandable` qui sont eux-mêmes interactifs.

**D28 — Actions dans le kebab sur mobile :** épingler et Modifier (auteur) sont dupliqués : visibles comme boutons séparés en `md:` et comme items du kebab en mobile. Les items kebab mobile utilisent `md:hidden` pour dispara��tre quand les boutons séparés redeviennent visibles. Un divider `md:hidden` sépare les items déplacés des items globaux.

**D29 — Focus initial dynamique dans la modale :** le `fermerBtnRef` est supprimé. Le focus initial parcourt les éléments focusables du panneau et s'arrête sur le premier visible (`offsetParent !== null`). Sur mobile c'est le bouton retour, sur desktop c'est le lien "Ouvrir en plein écran" (premier élément focusable visible du header).

**D30 — IconBadge responsive via double rendu :** deux instances d'`IconBadge` (40px et 52px) sont rendues avec `md:hidden` / `hidden md:block` plutôt qu'un prop responsive. `IconBadge` ne supporte pas de classes responsive sur sa prop `size` (c'est un nombre, pas une classe). Le double rendu est le pattern le plus simple.

---

## Journal de session — 12 avril 2026 (session 7)

### Phase 8 — Accessibilité et polish final (terminée)

**Fichiers modifiés :**

- `components/tache/vue-detaillee/sections/hero.tsx` — ajout `heroRef` prop + `tabIndex={-1}` + `outline-none` sur le h1 pour focus initial programmatique par les lecteurs d'écran.
- `components/tache/vue-detaillee/flux-lecture.tsx` — ajout prop `heroRef` passée à `SectionHero`.
- `components/tache/vue-detaillee/index.tsx` — ajout `useRef<HTMLHeadingElement>` + `useEffect` qui focus le h1 du hero au premier rendu. Ref passée via `FluxLecture`.
- `components/tache/vue-detaillee/barre-actions.tsx` — zones tactiles : `h-9 w-9` → `min-h-11 min-w-11` sur les boutons icône, `min-h-9` → `min-h-11` sur le bouton primaire et le lien Modifier, `min-h-11` ajouté aux items du kebab menu. Ajout `print:hidden` sur le `<header>`.
- `components/tache/vue-detaillee/rail.tsx` — ajout `useId()` + `aria-controls` sur l'accordéon mobile + `id` sur le contenu. Ajout `print:hidden` sur les 3 `<aside>`.
- `components/tache/vue-detaillee/layout.tsx` — ajout `print:block print:max-w-none print:px-0 print:py-0` pour que le flux prenne toute la largeur en impression.
- `components/partagees/fiche-modale/index.tsx` — zones tactiles : bouton mobile retour `min-h-11`, bouton fermeture croix `min-h-11 min-w-11`.
- `app/(app)/questions/[id]/page.tsx` — **branchement complet** : remplacé l'ancien `FicheLecture` + `FicheRetourLink` + `SectionVotes` wrapper par `TacheVueDetaillee`. Props `estAuteur` et `peutVoter` calculées dans le Server Component et passées à l'orchestrateur client.

### Vérification ARIA — état des lieux

| Composant             | Attribut                                         | Statut                         |
| --------------------- | ------------------------------------------------ | ------------------------------ |
| MetaRowExpandable     | `aria-expanded`, `aria-controls`                 | Déjà en place (Ph. 1)          |
| Bouton épingler       | `aria-pressed`, `aria-label`                     | Déjà en place (Ph. 5)          |
| FicheModale           | `role="dialog"`, `aria-modal`, `aria-labelledby` | Déjà en place (Ph. 6)          |
| Kebab                 | `aria-haspopup="menu"`, `aria-expanded`          | Déjà en place (Ph. 5)          |
| Accordéon mobile rail | `aria-expanded`, `aria-controls`                 | `aria-controls` ajouté (Ph. 8) |
| h1 hero               | `tabIndex={-1}` + focus programmatique           | Ajouté (Ph. 8)                 |

### Décisions prises — Phase 8

**D31 — Focus initial via ref dans l'orchestrateur :** plutôt qu'un `useEffect` dans `SectionHero` (qui ne sait pas s'il est utilisé en lecture ou en apercu), le focus est géré dans `TacheVueDetaillee` via un `ref` passé à travers `FluxLecture` → `SectionHero`. Seule la vue détaillée focus le h1 au montage.

**D32 — Zones tactiles 44px via min-h-11 / min-w-11 :** utilisation de `min-h-11` (`44px`) et `min-w-11` (`44px`) plutôt que des tailles fixes `h-11 w-11` pour ne pas casser le layout des boutons qui ont du contenu textuel. Le `min-` garantit la zone tactile minimum sans forcer une taille si le contenu naturel est plus grand.

**D33 — Print via classes Tailwind :** utilisation de `print:hidden` et `print:block` plutôt que des règles `@media print` dans `globals.css`. Conforme à CLAUDE.md § Co-localisation des styles (styles de composant → Tailwind dans le JSX).

**D34 — Branchement page /questions/[id] :** la page remplacée calculait `canVote` et passait `userId` à `FicheLecture`. La nouvelle version calcule `estAuteur` et `peutVoter` dans le Server Component et passe ces booléens à `TacheVueDetaillee`. Les anciens composants (`FicheLecture`, `FicheRetourLink`) ne sont pas supprimés — ils restent disponibles pour d'autres usages éventuels.

---

## Implémentation complète — toutes les phases terminées

La vue détaillée tâche est entièrement implémentée et branchée sur la route `/questions/[id]`. Les 8 phases du plan de travail sont terminées.

### Résumé des livrables

- **7 composants** dans `components/tache/vue-detaillee/` : orchestrateur, layout, barre d'actions, flux, rail, 5 sections
- **1 composant partagé** dans `components/partagees/fiche-modale/`
- **15 selectors** dans `lib/fiche/selectors/tache/` (5 flux + 10 rail)
- **1 hook** dans `hooks/partagees/use-fiche-modale.ts`
- **1 Server Action** dans `lib/actions/fetch-doc-fiche-data.ts`
- **Extensions rétrocompatibles** sur 3 primitives (`IconBadge`, `MetaRow`, `DocCard`)
- **1 token** `--color-corrige` ajouté
- **Page branchée** — `/questions/[id]` utilise `TacheVueDetaillee`
