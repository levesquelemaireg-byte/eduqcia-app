# Spec de refactoring v2 — Système de fiches (Sommaire, Thumbnail, Lecture)

> **Statut** : Validé par 6 agents, corrigé suite à 14 critiques retenues
> **Date** : 11 avril 2026
> **Principe** : Réordonner une section = déplacer une ligne. Ajouter = une entrée + un composant pur.

---

## 1. Problème actuel

### 1.1 Le monolithe `formStateToTae()`

Fonction de 104 lignes qui cumule : lookup OI, extraction rédaction, mapping aspects,
mapping documents, tri auteurs, normalisation 3 variantes NR, cascade conditionnelle
(9 branches), construction labels, stripping IDs, assembly final.

Conséquences :

- Recalcul total à chaque frappe (pas de granularité)
- Impossible de tester une section en isolation
- Ajouter un champ = toucher la fonction + le type + le composant

### 1.2 Code mort

`SommaireFiche.tsx` + 7 sous-composants `SommaireFiche*.tsx` — ~300 lignes orphelines
(confirmé par audit Claude Code : aucun import trouvé).

### 1.3 Contrats implicites

- `SectionConsigne` appelle `resolveConsigneHtmlForDisplay()` — tout autre consommateur
  verrait des `{{doc_A}}` bruts
- Aspects stockés en labels (transformation lossy)

### 1.4 Pas de support multi-mode

Un seul mode de rendu. Le design system cible demande 3 modes
(thumbnail, sommaire, lecture) avec le même arbre de composants.

---

## 2. Architecture cible

### 2.1 Les 3 couches

```
┌──────────────────────────────────────────────────────────────────┐
│  COUCHE CONFIG                                                   │
│  TAE_FICHE_SECTIONS / DOC_FICHE_SECTIONS                         │
│  Array déclaratif, constante module-level (jamais dans un render)│
│  Réordonner = déplacer un élément dans l'array                   │
│  Typé via defineSection() — lien selector↔component garanti      │
└──────────────────────────┬───────────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────────┐
│  COUCHE SELECTORS                                                │
│  Fonctions pures : (state, refs) → SectionState<T>               │
│  Mémoïsées via createSelector si coûteux                         │
│  Aucun side effect, aucun import React                           │
│  Placeholders résolus ICI, HTML sanitisé ICI                     │
│  Cascade NR isolée + mémoïsée comme selector partagé             │
└──────────────────────────┬───────────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────────┐
│  COUCHE VIEW                                                     │
│  FicheRenderer — générique, aucune connaissance métier           │
│  FicheSection — wrapper highlight + error boundary               │
│  Section* — présentationnels purs (props: data + mode)           │
│  Primitives partagées — Chip, IconBadge, ContentBlock, etc.      │
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. Types TypeScript

### 3.1 Mode de rendu

```typescript
/** Union stricte et fermée. Ajouter un mode = décision explicite. */
type FicheMode = "thumbnail" | "sommaire" | "lecture";
```

### 3.2 Step ID

```typescript
/** Union fermée partagée avec le wizard. Élimine les typos silencieuses. */
type StepId =
  | "auteurs"
  | "parametres"
  | "consigne"
  | "documents"
  | "corrige"
  | "competence"
  | "connaissances";
```

### 3.3 État d'une section (retour des selectors)

```typescript
/**
 * Discriminant explicite — pas de confusion null/undefined.
 *
 * - ready    → données prêtes, la section se rend normalement
 * - skeleton → "pas encore rempli" → affiche un skeleton animé
 * - hidden   → "non applicable dans ce contexte" → la section disparaît
 */
type SectionState<T> = { status: "ready"; data: T } | { status: "skeleton" } | { status: "hidden" };
```

Helpers pour simplifier les selectors :

```typescript
function ready<T>(data: T): SectionState<T> {
  return { status: "ready", data };
}
function skeleton<T>(): SectionState<T> {
  return { status: "skeleton" };
}
function hidden<T>(): SectionState<T> {
  return { status: "hidden" };
}
```

### 3.4 Références externes

```typescript
/** Référentiels passés aux selectors. Stabiliser avec useMemo dans le parent. */
interface SelectorRefs {
  oiList: OiDefinition[];
}
```

**Important** : dans le wizard, `refs` doit être stabilisé :

```typescript
const refs = useMemo<SelectorRefs>(() => ({ oiList }), [oiList]);
```

Sans ça, chaque render recrée l'objet et invalide tous les selectors.

### 3.5 Configuration d'une section

```typescript
interface SectionConfig<TState, TData> {
  /** Identifiant stable — React key + skeleton lookup. Ne change jamais. */
  id: string;

  /** Étape du wizard associée. null = hors wizard (header, footer). */
  stepId: StepId | null;

  /** Fonction pure : state → SectionState<TData> */
  selector: (state: TState, refs: SelectorRefs) => SectionState<TData>;

  /** Composant présentationnel pur */
  component: React.ComponentType<{ data: TData; mode: FicheMode }>;

  /** Modes dans lesquels cette section est visible. Défaut = tous.
   *  Les sections filtrées par visibleIn ne déclenchent PAS leur selector. */
  visibleIn?: FicheMode[];

  /** Skeleton custom pour cette section. Si absent → GenericSkeleton. */
  skeleton?: React.ComponentType;
}
```

### 3.6 Factory typée

```typescript
/**
 * Lie le type de retour du selector au type attendu par le component.
 * TypeScript infère TData automatiquement — impossible de mismatch.
 */
function defineSection<TState, TData>(
  config: SectionConfig<TState, TData>,
): SectionConfig<TState, TData> {
  return config;
}
```

Usage :

```typescript
// TS infère TData = ConsigneData.
// Si selectConsigne retourne SectionState<ConsigneData>
// mais SectionConsigne attend { data: CorrigeData }, TS refuse à la compilation.
const consigneSection = defineSection<TaeFormState, ConsigneData>({
  id: "consigne",
  stepId: "consigne",
  selector: selectConsigne,
  component: SectionConsigne,
});
```

---

## 4. La config TAÉ

```typescript
/**
 * RÉORDONNER = déplacer un élément.
 * AJOUTER    = defineSection() + un selector + un composant pur.
 * RETIRER    = supprimer la ligne.
 *
 * Note : consigne et guidage partagent le même stepId 'consigne'.
 * C'est voulu — les deux se highlight ensemble quand l'enseignant
 * travaille à l'étape 3 du wizard.
 */
export const TAE_FICHE_SECTIONS = [
  defineSection<TaeFormState, HeaderMetaData>({
    id: "header",
    stepId: null,
    selector: selectHeaderMeta,
    component: FicheHeader,
  }),
  defineSection<TaeFormState, ConsigneData>({
    id: "consigne",
    stepId: "consigne",
    selector: selectConsigne,
    component: SectionConsigne,
  }),
  defineSection<TaeFormState, GuidageData>({
    id: "guidage",
    stepId: "consigne", // même step que consigne — voulu
    selector: selectGuidage,
    component: SectionGuidage,
  }),
  defineSection<TaeFormState, DocumentsSectionData>({
    id: "documents",
    stepId: "documents",
    selector: selectDocuments,
    component: SectionDocuments,
  }),
  defineSection<TaeFormState, CorrigeData>({
    id: "corrige",
    stepId: "corrige",
    selector: selectCorrige,
    component: SectionCorrige,
  }),
  defineSection<TaeFormState, GrilleData>({
    id: "grille",
    stepId: "parametres",
    selector: selectGrille,
    component: SectionGrille,
    visibleIn: ["sommaire", "lecture"],
  }),
  defineSection<TaeFormState, CDData>({
    id: "cd",
    stepId: "competence",
    selector: selectCD,
    component: SectionCD,
    visibleIn: ["sommaire", "lecture"],
  }),
  defineSection<TaeFormState, ConnaissancesData>({
    id: "connaissances",
    stepId: "connaissances",
    selector: selectConnaissances,
    component: SectionConnaissances,
    visibleIn: ["sommaire", "lecture"],
  }),
  defineSection<TaeFormState, FooterData>({
    id: "footer",
    stepId: null,
    selector: selectFooter,
    component: FicheFooter,
    visibleIn: ["sommaire", "lecture"],
  }),
];
```

---

## 5. Le renderer générique

```typescript
interface FicheRendererProps {
  sections: SectionConfig<any, any>[];
  state: any;
  refs: SelectorRefs;
  mode: FicheMode;
  activeStepId: StepId | null;
}

function FicheRenderer({
  sections, state, refs, mode, activeStepId,
}: FicheRendererProps) {

  // 1. Filtrer AVANT d'appeler les selectors (pas de calcul inutile)
  const visibleSections = sections.filter(
    (s) => !s.visibleIn || s.visibleIn.includes(mode)
  );

  return (
    <>
      {visibleSections.map((section) => {
        const { id, stepId, selector, component: Component, skeleton: Skeleton } = section;
        const result = selector(state, refs);

        // hidden → ne pas rendre du tout
        if (result.status === 'hidden') return null;

        const isActive = activeStepId != null && activeStepId === stepId;

        return (
          <FicheSection key={id} isActive={isActive} sectionId={id}>
            {result.status === 'skeleton'
              ? (Skeleton ? <Skeleton /> : <GenericSkeleton sectionId={id} />)
              : <Component data={result.data} mode={mode} />
            }
          </FicheSection>
        );
      })}
    </>
  );
}
```

### 5.1 FicheSection — wrapper avec error boundary

```typescript
/**
 * Gère :
 * - Le highlight du bloc actif (classe CSS)
 * - L'error boundary (si un composant plante, la section affiche un fallback)
 * - Le data-attribute pour scroll-to et debug
 */
function FicheSection({ isActive, sectionId, children }: {
  isActive: boolean;
  sectionId: string;
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary fallback={<SectionErrorFallback sectionId={sectionId} />}>
      <div
        data-section={sectionId}
        className={cn('fiche-section', isActive && 'fiche-section--active')}
      >
        {children}
      </div>
    </ErrorBoundary>
  );
}
```

### 5.2 GenericSkeleton — fallback si pas de skeleton custom

```typescript
/**
 * Skeleton générique avec lignes shimmer.
 * Utilisé quand la section ne définit pas de skeleton custom.
 * Animation CSS synchronisée (même @keyframes globale pour éviter le chaos visuel).
 */
function GenericSkeleton({ sectionId }: { sectionId: string }) {
  return (
    <div className="fiche-skeleton" data-section={sectionId}>
      <div className="fiche-skeleton__line fiche-skeleton__line--long" />
      <div className="fiche-skeleton__line fiche-skeleton__line--medium" />
      <div className="fiche-skeleton__line fiche-skeleton__line--short" />
    </div>
  );
}
```

Animation CSS synchronisée :

```css
/* Animation globale unique — tous les skeletons shimmer à l'unisson */
@keyframes fiche-shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.fiche-skeleton__line {
  height: 14px;
  margin-bottom: 8px;
  border-radius: 6px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  background-size: 200% 100%;
  animation: fiche-shimmer 1.8s infinite;
  /* Pas de animation-delay individuel → tous synchronisés */
}
```

---

## 6. Selectors — conventions et exemples

### 6.1 Conventions

- **Un fichier par selector** : `selectors/selectConsigne.ts`
- **Fonction pure** : `(state, refs) → SectionState<T>`
- **Aucun import React** — ce sont des fonctions métier, pas des hooks
- **Placeholders résolus dans le selector** — composants reçoivent du texte prêt
- **HTML sanitisé dans le selector** (via DOMPurify ou équivalent) avant passage au composant
- **Mémoïsables** via `createSelector` si le calcul est coûteux
- **Cascade NR** : isolée dans `selectNRContent`, mémoïsée, consommée par les selectors
  consigne/guidage/corrigé (exécutée une seule fois par render, pas 3)

### 6.2 Le selector NR partagé

```typescript
// selectors/selectNRContent.ts

interface NRContent {
  consigne: string;
  guidage: string;
  corrige: string;
}

/**
 * Selector mémoïsé qui résout la cascade NR une seule fois.
 * Consommé par selectConsigne, selectGuidage, selectCorrige.
 *
 * avant/après > ordre chronologique > ligne du temps > null (rédactionnel)
 */
export const selectNRContent = createSelector(
  [(state: TaeFormState) => state.bloc5.nonRedaction, (state: TaeFormState) => state.documents],
  (nonRedaction, documents): NRContent | null => {
    const avantPayload = normalizeAvantApresPayload(nonRedaction, documents);
    if (avantPayload)
      return {
        consigne: buildAvantApresConsigneHtml(avantPayload),
        guidage: buildAvantApresGuidageHtml(avantPayload),
        corrige: buildAvantApresCorrigeHtml(avantPayload),
      };

    const ordrePayload = normalizeOrdrePayload(nonRedaction, documents);
    if (ordrePayload)
      return {
        consigne: buildOrdreConsigneHtml(ordrePayload),
        guidage: buildOrdreGuidageHtml(ordrePayload),
        corrige: buildOrdreCorrigeHtml(ordrePayload),
      };

    const lignePayload = normalizeLignePayload(nonRedaction, documents);
    if (lignePayload)
      return {
        consigne: buildLigneConsigneHtml(lignePayload),
        guidage: buildLigneGuidageHtml(lignePayload),
        corrige: buildLigneCorrigeHtml(lignePayload),
      };

    return null;
  },
);
```

### 6.3 Exemple : selectConsigne

```typescript
export interface ConsigneData {
  /** HTML prêt à l'affichage — placeholders résolus, sanitisé */
  html: string;
  /** Amorce documentaire séparée (pour styling distinct) */
  amorce: string | null;
}

export function selectConsigne(
  state: TaeFormState,
  refs: SelectorRefs,
): SectionState<ConsigneData> {
  if (!state.bloc2.oiId) return hidden();

  const nrContent = selectNRContent(state);
  const rawHtml = nrContent?.consigne ?? state.bloc3.consigne;

  if (!rawHtml || rawHtml === "<p></p>") return skeleton();

  const amorce = buildAmorceDocumentaire(state);
  const html = sanitize(resolveDocPlaceholders(rawHtml, state.documents));

  return ready({ html, amorce });
}
```

### 6.4 Exemple : selectCorrige

```typescript
export interface CorrigeData {
  reponseHtml: string;
  notesCorrecteur: string | null;
}

export function selectCorrige(state: TaeFormState, refs: SelectorRefs): SectionState<CorrigeData> {
  const nrContent = selectNRContent(state);
  const rawHtml = nrContent?.corrige ?? state.bloc5.corrige;

  if (!rawHtml || rawHtml === "<p></p>") return skeleton();

  return ready({
    reponseHtml: sanitize(rawHtml),
    notesCorrecteur: state.bloc5.notesCorrecteur || null,
  });
}
```

### 6.5 resolveDocPlaceholders — comportement quand doc manquant

```typescript
/**
 * Remplace {{doc_A}} → "document A", {{doc_B}} → "document B", etc.
 *
 * Si un document référencé n'existe pas encore dans le state,
 * le placeholder est remplacé par le texte générique "document X"
 * (jamais laissé brut — le composant ne doit jamais voir {{...}}).
 */
export function resolveDocPlaceholders(
  html: string,
  documents: Record<string, DocumentSlot>,
): string {
  return html.replace(/\{\{(doc_[A-D])\}\}/g, (match, slot) => {
    const letter = slot.replace("doc_", "");
    return `document ${letter}`;
  });
}
```

---

## 7. Composants section — conventions

### 7.1 Règles

- **Props** : `{ data: T; mode: FicheMode }` — rien d'autre
- **Aucun import de state**, aucun import de helpers métier, aucun `useContext`
- **Le mode contrôle la densité** selon ces conventions :

### 7.2 Conventions de densité par mode

| Aspect                | `thumbnail`                 | `sommaire`                        | `lecture`                          |
| --------------------- | --------------------------- | --------------------------------- | ---------------------------------- |
| Texte contenu         | 3 lignes max (line-clamp)   | Complet ou tronqué selon section  | Complet                            |
| Chips métadonnées     | 2-3 max                     | Tous                              | Tous + détails                     |
| Documents embedded    | Nombre seulement ("2 docs") | Compact (titre + source + aperçu) | Complet + cliquable (modale)       |
| Corrigé               | Caché ou 2 lignes           | Visible, texte rouge              | Complet + notes correcteur         |
| Guidage               | Caché                       | Visible                           | Visible                            |
| Grille évaluation     | Cachée (via visibleIn)      | Visible                           | Visible                            |
| Actions (boutons)     | Overflow menu seul          | Aucune (read-only preview)        | Complètes (Modifier, Dupliquer...) |
| Footer (auteur, date) | Caché (via visibleIn)       | Visible                           | Visible                            |

Si un composant devient trop lourd avec 3 modes → extraire des sous-composants internes,
mais le contrat externe reste `{ data, mode }`.

### 7.3 Exemple : SectionCorrige

```typescript
export function SectionCorrige({ data, mode }: { data: CorrigeData; mode: FicheMode }) {
  return (
    <div className="section-corrige">
      <SectionLabel>Corrigé</SectionLabel>
      <ContentBlock
        html={data.reponseHtml}
        className="text-corrige"
        clamp={mode === 'thumbnail' ? 2 : undefined}
      />
      {data.notesCorrecteur && mode === 'lecture' && (
        <p className="section-corrige__notes">{data.notesCorrecteur}</p>
      )}
    </div>
  );
}
```

---

## 8. Primitives partagées

Composants réutilisés par les sections TAÉ ET Document :

| Primitive      | Usage                                                    |
| -------------- | -------------------------------------------------------- |
| `IconBadge`    | Icône OI ou catégorie doc dans container teal arrondi    |
| `MetaChip`     | Chip de métadonnée (niveau, discipline, année...)        |
| `ChipBar`      | Container flex-wrap pour les chips                       |
| `SectionLabel` | Label uppercase (CONSIGNE, DOCUMENTS, etc.)              |
| `ContentBlock` | Bloc HTML sanitisé avec line-clamp optionnel             |
| `DocEmbed`     | Card document compacte (lettre + icône + titre + aperçu) |

`ContentBlock` utilise `dangerouslySetInnerHTML` — le HTML doit être
sanitisé EN AMONT (dans le selector) via DOMPurify ou équivalent.
Le composant ne sanitise pas lui-même.

---

## 9. Intégration dans le wizard

```typescript
function TaeWizardPage() {
  const [state, dispatch] = useTaeFormReducer();
  const { activeStepId } = useWizardNavigation();
  const oiList = useOiList();

  // Stabiliser refs pour ne pas invalider tous les selectors à chaque render
  const refs = useMemo<SelectorRefs>(() => ({ oiList }), [oiList]);

  return (
    <div className="wizard-layout">
      <div className="wizard-form">
        <WizardStepRenderer step={activeStepId} state={state} dispatch={dispatch} />
      </div>
      <div className="wizard-preview">
        <FicheRenderer
          sections={TAE_FICHE_SECTIONS}
          state={state}
          refs={refs}
          mode="sommaire"
          activeStepId={activeStepId}
        />
      </div>
    </div>
  );
}
```

Autres contextes :

```typescript
// Banque — thumbnail
<FicheRenderer sections={TAE_FICHE_SECTIONS} state={tae} refs={refs}
  mode="thumbnail" activeStepId={null} />

// Page standalone — lecture
<FicheRenderer sections={TAE_FICHE_SECTIONS} state={tae} refs={refs}
  mode="lecture" activeStepId={null} />
```

---

## 10. Plan de migration

### Phase 1 — Nettoyage (risque minimal)

1. Supprimer `SommaireFiche.tsx` + 7 `SommaireFiche*.tsx` orphelins
   (confirmé orphelins par audit Claude Code)
2. Supprimer les imports morts résultants

### Phase 2 — Fondations (nouveau code, pas de casse)

3. Créer les types (`FicheMode`, `StepId`, `SectionState`, `SectionConfig`, `defineSection`)
4. Créer `selectNRContent` — cascade NR isolée et mémoïsée
5. Créer `resolveDocPlaceholders` avec gestion des docs manquants
6. Créer les selectors un par un, avec helpers `ready()`, `skeleton()`, `hidden()`
7. Créer les primitives partagées (`IconBadge`, `MetaChip`, etc.)

### Phase 3 — Assemblage (remplacement)

8. Créer `FicheRenderer`, `FicheSection` (avec error boundary), `GenericSkeleton`
9. Refactorer les `Section*` existants → props `{ data, mode }`
10. Créer `TAE_FICHE_SECTIONS` config avec `defineSection()`
11. Brancher dans le wizard à la place de `FicheSommaireColumn`
12. **Validation visuelle** : rendu côte à côte ancien/nouveau sur 3-4 cas représentatifs
    (rédactionnel, NR ordre chrono, NR avant/après, avec/sans documents icono)

### Phase 4 — Extension (nouveau design)

13. Sections manquantes (grille évaluation, notes correcteur)
14. Enrichir données documents (catégorie, repère temporel, année, source type)
15. Implémenter les 3 modes dans chaque section (sommaire d'abord → lecture → thumbnail)
16. Créer `DOC_FICHE_SECTIONS`
17. Intégrer thumbnail (banque) et lecture (page standalone)

---

## 11. Structure de fichiers

```
lib/fiche/
├── types.ts                          # FicheMode, StepId, SectionState, SectionConfig
├── defineSection.ts                  # Factory typée
├── helpers.ts                        # ready(), skeleton(), hidden(), sanitize()
├── FicheRenderer.tsx                 # Renderer générique
├── FicheSection.tsx                  # Wrapper highlight + error boundary
├── GenericSkeleton.tsx               # Skeleton fallback
│
├── selectors/
│   ├── selectNRContent.ts            # Cascade NR mémoïsée (partagée)
│   ├── selectHeaderMeta.ts
│   ├── selectConsigne.ts
│   ├── selectGuidage.ts
│   ├── selectDocuments.ts
│   ├── selectCorrige.ts
│   ├── selectGrille.ts
│   ├── selectCD.ts
│   ├── selectConnaissances.ts
│   ├── selectFooter.ts
│   └── resolveDocPlaceholders.ts
│
├── sections/
│   ├── FicheHeader.tsx
│   ├── SectionConsigne.tsx
│   ├── SectionGuidage.tsx
│   ├── SectionDocuments.tsx
│   ├── SectionCorrige.tsx
│   ├── SectionGrille.tsx
│   ├── SectionCD.tsx
│   ├── SectionConnaissances.tsx
│   └── FicheFooter.tsx
│
├── primitives/
│   ├── IconBadge.tsx
│   ├── MetaChip.tsx
│   ├── ChipBar.tsx
│   ├── SectionLabel.tsx
│   ├── ContentBlock.tsx              # Sanitise PAS — reçoit du HTML déjà propre
│   └── DocEmbed.tsx
│
├── configs/
│   ├── tae-fiche-sections.ts
│   └── doc-fiche-sections.ts
│
└── __tests__/
    ├── config-integrity.test.ts      # Vérifie : ids uniques, stepIds valides
    ├── selectors/                    # Un test par selector
    └── sections/                     # Un test par section × mode
```

---

## 12. Règles d'or

1. **La config est la source de vérité pour la structure** — pas de JSX conditionnel dans le renderer
2. **Les selectors sont purs** — aucun side effect, aucun import React
3. **Les composants sont présentationnels** — `{ data, mode }` et rien d'autre
4. **Les placeholders sont résolus dans les selectors** — composants reçoivent du texte prêt
5. **Le HTML est sanitisé dans les selectors** — `ContentBlock` ne sanitise pas
6. **La cascade NR est un selector partagé mémoïsé** — exécutée une fois, pas 3
7. **La config est module-level** — jamais dans le corps d'un composant
8. **Les IDs sont stables** — constantes littérales, ne changent jamais
9. **`ready` = rendu, `skeleton` = en attente, `hidden` = invisible** — contrat inviolable
10. **Pas de logique métier dans la config** — config = structure + mapping uniquement
11. **Le mode est une union fermée** — ajouter = décision explicite
12. **`defineSection()` garantit le lien selector↔component** — pas de `any` qui fuit
13. **`refs` est stabilisé avec `useMemo`** — sinon tous les selectors recalculent
14. **Plusieurs sections peuvent partager un `stepId`** — elles se highlight ensemble (voulu et documenté)
