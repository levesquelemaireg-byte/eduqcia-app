# Fiche tâche — Contexte d'implémentation (detail view lecture)

**Dernière mise à jour :** 12 avril 2026 (session 4 — fin Phase 4)
**Spec de référence :** `docs/specs/fiche-tache-lecture.md`
**Convention de nommage :** `CLAUDE.md` § Convention de nommage et structure des fichiers

---

## Tableau de bord de progression

| Phase | Titre                              | Statut        | Notes                                             |
| ----- | ---------------------------------- | ------------- | ------------------------------------------------- |
| 1     | Tokens et primitives de base       | **Terminée**  | Build propre, rétrocompatibilité vérifiée         |
| 2     | Selectors de la fiche tâche        | **Terminée**  | 5 flux + 10 rail, build propre                    |
| 3     | Configuration et sections          | **Terminée**  | 5 sections + FluxLecture, build propre            |
| 4     | Rail et layout desktop             | **Terminée**  | TacheRail + TacheVueDetailleeLayout, build propre |
| 5     | Barre d'actions (TopNavBar)        | Non commencée | Prochaine phase                                   |
| 6     | Modale de fiche document embarquée | Non commencée |                                                   |
| 7     | Responsive tablet et mobile        | Non commencée |                                                   |
| 8     | Accessibilité et polish final      | Non commencée |                                                   |

---

## Rapport de situation — état actuel du code

### Ce qui existe et correspond à la spec

**Route** — `/questions/[id]` existe (`app/(app)/questions/[id]/page.tsx`). Server component qui fetch `TaeFicheData` via `fetchTaeFicheBundle()` et rend `FicheLecture`.

**Architecture 3 couches** — en place et fonctionnelle dans `lib/fiche/` :

- **Config :** `TAE_LECTURE_SECTIONS` dans `lib/fiche/configs/tae-lecture-sections.ts` — 9 sections définies via `defineSection()`
- **Selectors :** `lib/fiche/selectors/lecture-selectors.ts` — 9 selectors purs `(TaeFicheData, SelectorRefs) → SectionState<T>`
- **View :** composants section dans `lib/fiche/sections/` — tous suivent le contrat `{ data: T; mode: FicheMode }`

**Primitives** dans `lib/fiche/primitives/` — 7 primitives existantes :

- `MetaChip` — pill inline-flex, `bg-panel-alt`, `text-xs font-bold`, icône accent 0.9em
- `IconBadge` — glyphe OI via `MaterialSymbolOiGlyph`, taille clamp dynamique, pas de box/fond
- `SectionLabel` — label uppercase accent avec icône, `mb-[0.65rem]`, `text-xs font-semibold`
- `ChipBar` — wrapper `flex flex-wrap items-stretch gap-2`
- `ContentBlock` — rendu HTML sanitisé avec `dangerouslySetInnerHTML` et clamp optionnel
- `DocCard` — card document avec lettre (A-D), titre, source, aperçu, skeleton si incomplet
- `MetaRow` — ligne icône+texte avec badge statut optionnel (array items + badge)

**Données** — `TaeFicheData` (`lib/types/fiche.ts`) contient tous les champs nécessaires pour la vue lecture. `fetchTaeFicheBundle` (`lib/tae/server-fiche-map.ts`) construit le bundle complet depuis Supabase (tae + profiles + oi + comportements + niveaux + disciplines + cd + connaissances + documents + votes).

**Composants embarqués (boîtes noires, ne pas toucher) :**

- Arbre CD : `lib/fiche/sections/SectionCD.tsx` — rendu 3 niveaux (compétence → composante → critère)
- Arbre connaissances : `lib/fiche/sections/SectionConnaissances.tsx` — rendu hiérarchique (réalité sociale → section → sous-section → énoncés)
- Grille ministérielle : `components/tae/grilles/GrilleEvalTable.tsx` — wrapper qui délègue à `grille-registry.tsx`

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

**Décision :** créer 10 selectors atomiques en fichiers séparés dans `lib/fiche/selectors/tache/rail/`, un par concept (niveau, discipline, aspects, chapitre-connaissances, competence, connaissances, documents-compte, auteur, dates, statut). Chaque selector suit le pattern `(TaeFicheData, SelectorRefs) → SectionState<T>`.

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

- `hero.ts` — `selectHero(TaeFicheData) → HeroData` : oiGlyph, oiLabel, enonce (HTML sanitisé, placeholders résolus), comportementAttendu
- `documents.ts` — `selectDocuments(TaeFicheData) → DocumentsSectionData | null` : sectionLabel singulier/pluriel + array DocCardData (numero, docId, categorieGlyph, doc). Retourne null si 0 documents.
- `guidage.ts` — `selectGuidage(TaeFicheData) → GuidageData | null` : HTML sanitisé ou null si vide
- `corrige.ts` — `selectCorrige(TaeFicheData) → CorrigeData | null` : HTML sanitisé ou null si vide
- `grille.ts` — `selectGrille(TaeFicheData) → GrilleData | null` : outilEvaluationId ou null si absent

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

**D8 — Selectors simplifiés sans SelectorRefs :** les selectors de la vue détaillée prennent uniquement `TaeFicheData` (pas de `SelectorRefs`). Les données sont déjà pré-résolues côté serveur par `fetchTaeFicheBundle`. Seul `selectGrille` de l'ancien système avait besoin de `refs.grilles` — le nouveau selector retourne juste l'ID et le composant grille résoudra l'entrée lui-même.

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
| `revalidatePath` publication             | Flux wizard → fiche    | Revalider `/questions/[id]` après `publishTaeAction`   |
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

## Instructions pour reprendre (prochaine session)

1. Lire `docs/specs/fiche-tache-lecture.md` en entier (spec de référence)
2. Lire `CLAUDE.md` § Convention de nommage et structure des fichiers
3. Lire ce fichier (`docs/specs/fiche-tache-implementation-context.md`)
4. Vérifier l'état de progression dans le tableau de bord ci-dessus
5. Attaquer la phase suivante non terminée (Phase 5 — Barre d'actions)
6. En fin de session, mettre à jour ce fichier :
   - Avancement dans le tableau de bord
   - Nouvelles décisions architecturales prises
   - Questions bloquantes découvertes
   - Fichiers créés ou modifiés (liste)
