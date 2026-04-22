# Review d'implémentabilité — Plan d'unification des renderers documentaires

> **Date** : 2026-04-16
> **Reviewé par** : Claude Code (accès au code réel)
> **Plan reviewé** : `docs/plans/PLAN_EXECUTION_REFACTORING_RENDERERS.md` (v2)
> **Verdict global** : **NON EXÉCUTABLE TEL QUEL** — 3 blockers, ~12 hypothèses fausses, plan faisable après corrections

---

## 1. Faisabilité technique — vérification fichier par fichier

### Fichiers qui EXISTENT au chemin exact indiqué

| #   | Fichier                                                     | Existe  | Conforme au plan                           |
| --- | ----------------------------------------------------------- | ------- | ------------------------------------------ |
| 1   | `components/documents/DocumentElementRenderer.tsx`          | **OUI** | OUI                                        |
| 2   | `lib/types/document-renderer.ts`                            | **OUI** | OUI                                        |
| 3   | `lib/tache/contrats/donnees.ts`                             | **OUI** | OUI                                        |
| 4   | `lib/tache/contrats/etat-wizard-vers-tache.ts`              | **OUI** | OUI — `construireDocuments` lignes 186-197 |
| 5   | `components/epreuve/impression/sections/document.tsx`       | **OUI** | OUI                                        |
| 6   | `lib/impression/builders/blocs-document.ts`                 | **OUI** | OUI                                        |
| 7   | `lib/epreuve/transformation/epreuve-vers-paginee.ts`        | **OUI** | OUI                                        |
| 8   | `lib/fiche/primitives/DocCard.tsx`                          | **OUI** | OUI                                        |
| 9   | `components/tache/fiche/DocumentCardCompact.tsx`            | **OUI** | OUI                                        |
| 10  | `components/tache/fiche/SectionDocuments.tsx`               | **OUI** | **ATTENTION** — voir section 3             |
| 11  | `components/tache/wizard/preview/PrintableFichePreview.tsx` | **OUI** | OUI                                        |
| 12  | `components/evaluations/EvaluationPrintableBody.tsx`        | **OUI** | OUI                                        |
| 13  | `components/evaluations/EvaluationFichePrintView.tsx`       | **OUI** | OUI                                        |
| 14  | `app/(print)/evaluations/[id]/print/page.tsx`               | **OUI** | OUI                                        |
| 15  | `components/documents/DocumentFicheRead.tsx`                | **OUI** | OUI (dead code confirmé — 0 imports)       |
| 16  | `components/tache/vue-detaillee/sections/documents.tsx`     | **OUI** | **ATTENTION** — voir section 3             |
| 17  | `components/documents/DocumentCardPrint.tsx`                | **OUI** | OUI                                        |
| 18  | `components/documents/DocumentCard.tsx`                     | **OUI** | OUI                                        |
| 19  | `components/documents/DocumentCardThumbnail.tsx`            | **OUI** | OUI (0 imports — déjà dead code ?)         |

**Tous les fichiers existent.** Aucune erreur de chemin dans le plan.

---

## 2. Types et contrats — hypothèses fausses identifiées

### 2a. `RendererDocument` — type EXACT actuel

Fichier : `lib/types/document-renderer.ts:66-74`

```typescript
export interface RendererDocument {
  id: string; // ← obligatoire
  titre: string;
  structure: DocumentStructure; // "simple" | "perspectives" | "deux_temps"
  elements: DocumentElement[];
  repereTemporelDocument?: string;
}
```

**Verdict :** le plan dit « `RendererDocument` n'a pas `.kind` directement — c'est sur `.elements[0].kind` ». **FAUX** — le discriminant est `.elements[0].type`, pas `.kind`. Le champ s'appelle `type` (« textuel » | « iconographique »), pas `kind`. `kind` est le vocabulaire de `DocumentReference`, pas de `DocumentElement`.

### 2b. `DocumentElement` — type EXACT

```typescript
// BaseElement (lignes 28-40)
interface BaseElement {
  id: string;
  auteur?: string;
  repereTemporel?: string;
  sousTitre?: string;
  source: string;
  sourceType: "primaire" | "secondaire";
}

// TextuelElement (lignes 42-47)
export interface TextuelElement extends BaseElement {
  type: "textuel";
  contenu: string;
  categorieTextuelle: CategorieTextuelleValue;
}

// IconographiqueElement (lignes 49-58)
export interface IconographiqueElement extends BaseElement {
  type: "iconographique";
  imageUrl: string;
  legende?: string;
  legendePosition?: DocumentLegendPosition;
  categorieIconographique: DocumentCategorieIconographiqueId;
}
```

**Champs ABSENTS que le plan suppose :** `imagePixelWidth`, `imagePixelHeight` — le plan sait qu'ils sont absents (étape 1a : « ajouter si pas déjà présents »). **Correct.**

**Champs ABSENTS que le plan NE mentionne PAS :**

- `BaseElement` n'a PAS de `sourceCitation` — il a `source` (string). Le fallback de l'étape 3 écrit `sourceCitation: slot.sourceCitation` mais `BaseElement` a `source`, pas `sourceCitation`. **HYPOTHÈSE FAUSSE.**
- `BaseElement` a `sourceType: "primaire" | "secondaire"` — obligatoire. Le fallback doit le fournir.
- `TextuelElement` exige `categorieTextuelle: CategorieTextuelleValue` — obligatoire. Le fallback NE LE FOURNIT PAS.
- `IconographiqueElement` exige `categorieIconographique: DocumentCategorieIconographiqueId` — obligatoire. Le fallback NE LE FOURNIT PAS.

**Impact :** le code de fallback proposé en étape 3 ne compile PAS. Il manque des champs obligatoires.

### 2c. `slot.rendererDocument` dans le wizard

**HYPOTHÈSE FAUSSE CRITIQUE.**

Le plan (étape 3) suppose que `slot.rendererDocument` existe sur les slots du Bloc 4. Vérification :

`DocumentSlotData` (`lib/tache/document-helpers.ts:30-62`) :

```typescript
export type DocumentSlotData = {
  mode: DocumentSlotMode;
  type: DocumentType;
  titre: string;
  contenu: string;
  source_citation: string;
  imageUrl: string | null;
  // ... autres champs
  imagePixelWidth: number | null;
  imagePixelHeight: number | null;
  // ... etc.
};
```

**Il n'y a PAS de champ `rendererDocument` sur `DocumentSlotData`.** Ce champ existe uniquement sur `DocumentFiche` (`lib/types/fiche.ts:29`), qui est le type utilisé pour les tâches PUBLIÉES, pas pour l'état du wizard.

Le `rendererDocument` est hydraté côté serveur par `server-fiche-map.ts:198`, UNIQUEMENT pour les documents multi-éléments déjà publiés. Pendant l'édition dans le wizard, les slots n'ont pas ce champ.

**Conséquence :** l'étape 3 propose `if (slot.rendererDocument) { return slot.rendererDocument; }` — ce code ne trouvera JAMAIS de `rendererDocument` car le type n'a pas ce champ. Le « fallback défensif » serait en fait le chemin UNIQUE.

### 2d. `DonneesTache.documents` — fichiers impactés

Le type `DonneesTache` (et son champ `documents: DocumentReference[]`) est importé par **26 fichiers**. Le plan en liste 7 à modifier (étapes 2-6). Voici les **19 fichiers non listés dans le plan** qui importent `DocumentReference` ou `DonneesTache` et seraient cassés :

**Fichiers de production (11) :**

| Fichier                                               | Usage                              |
| ----------------------------------------------------- | ---------------------------------- |
| `app/api/impression/apercu-png/route.ts`              | Import `DonneesTache`              |
| `app/(apercu)/apercu/[token]/page.tsx`                | Import `DocumentReference`         |
| `app/(apercu)/apercu/test/[slug]/page.tsx`            | Import `DocumentReference`         |
| `lib/impression/builders/blocs-tache.ts`              | Import `DocumentReference`         |
| `lib/impression/builders/blocs-corrige.ts`            | Import `DonneesTache`              |
| `lib/impression/builders/blocs-quadruplet.ts`         | Import `DonneesTache`              |
| `lib/impression/types.ts`                             | Import indirect                    |
| `lib/epreuve/transformation/renumerotation.ts`        | Fonction typée `DocumentReference` |
| `lib/document/impression/document-vers-imprimable.ts` | Paramètre `DocumentReference`      |
| `lib/tache/impression/tache-vers-imprimable.ts`       | Import `DocumentReference`         |
| `components/epreuve/impression/entete.tsx`            | Import `DonneesTache`              |

**Composants epreuve impression (3) :**

| Fichier                                                        | Usage                 |
| -------------------------------------------------------------- | --------------------- |
| `components/epreuve/impression/section-page.tsx`               | Import `DonneesTache` |
| `components/epreuve/impression/sections/outil-evaluation.tsx`  | Import `DonneesTache` |
| `components/epreuve/impression/sections/espace-production.tsx` | Import `DonneesTache` |

**Fichiers de test (6) :**

| Fichier                                                    | Usage                        |
| ---------------------------------------------------------- | ---------------------------- |
| `lib/tache/contrats/etat-wizard-vers-tache.test.ts`        | Fixtures `DocumentReference` |
| `lib/impression/builders/blocs-tache.test.ts`              | Fixtures `DocumentReference` |
| `lib/epreuve/transformation/epreuve-vers-paginee.test.ts`  | Fixtures `DocumentReference` |
| `lib/epreuve/transformation/renumerotation.test.ts`        | Fixtures `DocumentReference` |
| `lib/document/impression/document-vers-imprimable.test.ts` | Fixtures `DocumentReference` |
| `lib/tache/impression/tache-vers-imprimable.test.ts`       | Fixtures `DocumentReference` |

**Le plan sous-estime massivement l'étendue du changement de type.** Le récapitulatif final liste 15 fichiers touchés. En réalité, c'est **~35 fichiers minimum** (15 listés + 11 prod non listés + 3 epreuve non listés + 6 tests).

---

## 3. Dépendances cachées

### 3a. `SectionDocument` — importé uniquement par `components/epreuve/impression/index.tsx`

Confirmé : un seul consommateur. Le plan est correct.

### 3b. `DocCard` — importé par 2 fichiers non listés dans le plan

| Fichier                                                 | Usage               |
| ------------------------------------------------------- | ------------------- |
| `components/tache/vue-detaillee/sections/documents.tsx` | Listé (étape 6a) ✅ |
| `lib/fiche/sections/SectionDocuments.tsx`               | **NON LISTÉ** ❌    |

Le plan liste `components/tache/fiche/SectionDocuments.tsx` (étape 6b) mais le VRAI `SectionDocuments` qui utilise `DocCard` est à `lib/fiche/sections/SectionDocuments.tsx`. Ce sont **deux fichiers différents** :

- `components/tache/fiche/SectionDocuments.tsx` — utilise `DocumentCardCompact` (listé en 6b) ✅
- `lib/fiche/sections/SectionDocuments.tsx` — utilise `DocCard` **NON LISTÉ** ❌

**Hypothèse fausse du plan :** le plan dit que `DocCard` n'est utilisé que dans « vue détaillée tâche ». En réalité, `DocCard` est aussi importé par `lib/fiche/sections/SectionDocuments.tsx` (qui est le renderer fiche lecture).

### 3c. `DocumentCardCompact` — importé par 1 fichier

`components/tache/fiche/SectionDocuments.tsx` (via `PlaygroundFicheRenderer.tsx`). Le plan est correct.

### 3d. `PrintableDocumentCell` — importé par 3 fichiers

| Fichier                                                     | Listé dans le plan |
| ----------------------------------------------------------- | ------------------ |
| `components/tache/wizard/preview/PrintableFichePreview.tsx` | OUI (étape 6c)     |
| `components/evaluations/EvaluationPrintableBody.tsx`        | OUI (étape 7)      |
| `components/playground/PlaygroundPrintRenderer.tsx`         | **NON** ❌         |

### 3e. `EvaluationPrintableBody` / `EvaluationFichePrintView`

- `EvaluationPrintableBody` → importé par `EvaluationFichePrintView.tsx` (listé)
- `EvaluationFichePrintView` → importé par `app/(print)/evaluations/[id]/print/page.tsx` (listé)

Le plan est correct pour la chaîne de dépendance directe.

### 3f. Tests existants qui importent des composants à supprimer

Aucun test n'importe directement `DocCard`, `DocumentCardCompact`, `PrintableDocumentCell`, `EvaluationPrintableBody`, `EvaluationFichePrintView`, ou `DocumentFicheRead`. Les tests impactés touchent uniquement le type `DocumentReference` (6 fichiers de test listés en section 2d).

### 3g. Fichiers Playground non listés

**3 composants playground** seraient cassés par le plan :

| Fichier                                             | Dépendance                                            |
| --------------------------------------------------- | ----------------------------------------------------- |
| `components/playground/PlaygroundPrintRenderer.tsx` | Importe `PrintableDocumentCell`                       |
| `components/playground/PlaygroundFicheRenderer.tsx` | Importe `components/tache/fiche/SectionDocuments.tsx` |
| `components/playground/PlaygroundContextCanvas.tsx` | Importe `PrintableFichePreview`                       |

Le plan ne mentionne AUCUN de ces fichiers.

---

## 4. Risques identifiés (non mentionnés dans le plan)

### Risque 1 — CRITIQUE : `RendererDocument` est beaucoup plus riche que `DocumentReference`

`DocumentReference` a 5 champs (id, kind, titre, contenu, echelle).
`RendererDocument` a 5 champs aussi (id, titre, structure, elements[], repereTemporelDocument) mais `elements` contient des objets avec ~8 champs obligatoires chacun (id, source, sourceType, type, + 2-3 champs spécifiques par type).

Tous les endroits qui construisent des `DocumentReference` de test (6 fichiers de test avec `creerDoc()`) devront être réécrits pour produire des `RendererDocument` valides. C'est un travail significatif car il faut fournir tous les champs obligatoires de `BaseElement` + les champs spécifiques par type.

### Risque 2 — CRITIQUE : `construireDocuments` dans l'état actuel

Le code actuel (`etat-wizard-vers-tache.ts:186-197`) :

```typescript
function construireDocuments(state: TacheFormState): DocumentReference[] {
  return state.bloc2.documentSlots.map(({ slotId }) => {
    const slot = getSlotData(state.bloc4.documents, slotId);
    return {
      id: slotId,
      kind: slot.type,
      titre: slot.titre,
      contenu: slot.contenu,
      ...(slot.type === "iconographique" ? { echelle: slot.printImpressionScale } : {}),
    };
  });
}
```

Le plan propose de retourner `slot.rendererDocument` s'il existe, mais **ce champ n'existe pas sur `DocumentSlotData`**. Il faut donc construire un `RendererDocument` complet à partir des champs de `DocumentSlotData`. C'est faisable mais le code de construction doit inclure tous les champs obligatoires de `DocumentElement` (`id`, `source`, `sourceType`, `categorieTextuelle`/`categorieIconographique`, etc.).

### Risque 3 — `SectionDocument` utilise `doc.kind` et `doc.echelle`

Le plan propose de remplacer `SectionDocument` par une délégation à `DocumentCardPrint`. Mais le plan ne vérifie pas que `DocumentCardPrint` reçoit un `RendererDocument` — il le reçoit déjà (vérifié). **OK, pas de risque ici.**

### Risque 4 — Le pipeline d'impression entire passe `DocumentReference` via `ContenuBlocDocument`

La chaîne complète :

```
DonneesTache.documents (DocumentReference[])
  → construireBlocDocument() → Bloc { content: { document: DocumentReference } }
    → SectionDocument({ contenu: ContenuDocument })
```

Changer `DocumentReference` → `RendererDocument` dans `DonneesTache` propage le changement à travers TOUTE la chaîne d'impression : `blocs-document.ts`, `blocs-tache.ts`, `blocs-corrige.ts`, `blocs-quadruplet.ts`, `tache-vers-imprimable.ts`, `document-vers-imprimable.ts`, `epreuve-vers-paginee.ts`, `renumerotation.ts`, et les types `Bloc` dans `lib/epreuve/pagination/types.ts`.

### Risque 5 — `echelle` vs dimensions pixel

Le plan supprime `echelle` (utilisé dans `SectionDocument` pour `transform: scale()`). Le renderer canonique (`DocumentElementRenderer`) utilise des dimensions fixes (`width={660} height={400}`). Le plan propose d'ajouter `imagePixelWidth/Height` mais :

- Ces dimensions viennent de `DocumentSlotData` (disponibles dans le wizard)
- Elles ne sont PAS encore sur `DocumentElement`/`RendererDocument`
- L'ajout est prévu en étape 1a mais le plan n'explique pas comment les propager depuis le wizard vers le `RendererDocument` final

### Risque 6 — Playground

3 composants playground importent des composants à supprimer/modifier. Le plan ne les mentionne pas. Ils casseraient le build.

---

## 5. Étape 0 — Audit pré-refactoring (exécuté)

### 5a. grep `.kind` sur les documents

**Résultats pertinents :**

| Fichier                                               | Ligne  | Usage                                                     |
| ----------------------------------------------------- | ------ | --------------------------------------------------------- |
| `components/epreuve/impression/sections/document.tsx` | 60, 67 | `doc.kind === "textuel"`, `doc.kind === "iconographique"` |

C'est le seul usage de `.kind` sur un document. Il sera éliminé par la réécriture de `SectionDocument` (étape 4). **Pas de getter/champ dérivé nécessaire.**

Note : d'autres fichiers utilisent `.kind` mais sur des types différents (bloc.kind = "document"/"quadruplet"/etc. dans le pagination layer, cibleModale.kind dans la vue détaillée). Ces usages ne sont PAS liés à `DocumentReference.kind`.

### 5b. grep `echelle`

| Fichier                                               | Ligne | Usage                                                                |
| ----------------------------------------------------- | ----- | -------------------------------------------------------------------- |
| `lib/tache/contrats/donnees.ts`                       | 24    | Champ `echelle?: number` dans `DocumentReference`                    |
| `lib/tache/contrats/etat-wizard-vers-tache.ts`        | 194   | `echelle: slot.printImpressionScale`                                 |
| `components/epreuve/impression/sections/document.tsx` | 5, 76 | Commentaire + `transform: scale(${doc.echelle})`                     |
| `components/tache/grilles/grille-registry.tsx`        | 8, 25 | `bareme.echelle` — SANS RAPPORT (échelle d'évaluation, pas document) |
| `components/tache/grilles/GenericEchelleGrid.tsx`     | 20    | `entry.bareme.echelle` — SANS RAPPORT (grilles)                      |

Le champ `echelle` lié aux documents n'est utilisé que dans 3 fichiers (donnees.ts, etat-wizard-vers-tache.ts, document.tsx). Tous sont modifiés ou supprimés par le plan. **OK.**

Les usages dans les grilles (bareme.echelle) sont un concept différent et ne sont pas impactés.

### 5c. Ordre extractFootnotes vs sanitize

Dans `DocumentElementRenderer.tsx` :

- **Ligne 59 :** `sanitize(element.contenu)` — sanitize est appelé pour le `dangerouslySetInnerHTML`
- **Ligne 85 :** `extractFootnotes(html)` dans le composant `FootnoteDefinitions` — reçoit le HTML BRUT (`element.contenu`), PAS le HTML sanitizé

**Verdict :** il n'y a PAS de problème d'ordre. `extractFootnotes` opère sur le HTML original (`element.contenu` passé via `html` prop), tandis que `sanitize` est appliqué séparément pour l'affichage inline. Les deux opèrent sur la même source mais indépendamment. **Le plan signale un faux problème ici.**

### 5d. Classes CSS : SectionDocument vs DocumentCardPrint

**SectionDocument** (`components/epreuve/impression/sections/document.tsx`) :

- Inline styles uniquement (fontFamily, fontSize, fontWeight, lineHeight, marginBottom)
- **PAS de `break-inside: avoid`**
- **PAS de marges compatibles avec le print-engine**
- Image scaling via `transform: scale(${doc.echelle})`

**DocumentCardPrint** (`components/documents/DocumentCardPrint.tsx` + CSS module `printable-fiche-preview.module.css`) :

- `.documentWrapper` : `break-inside: avoid; page-break-inside: avoid;`
- `.documentCell` : `border: 1.5pt solid #333; padding: 0.4rem 0.5rem;`
- `.documentFigure` : `margin: 0 0 0.3rem; border: 1px solid #000;`
- `.documentSource` : `font-size: 9pt;`
- `@media print` : `.documentWrapper { break-inside: avoid; }`, `.documentFigure { break-inside: avoid; }`

**Verdict :** `DocumentCardPrint` est SUPÉRIEUR à `SectionDocument` pour l'impression (gestion de la fragmentation, marges structurées, CSS module au lieu d'inline styles). La délégation proposée en étape 4 est une amélioration. **Aucune classe manquante bloquante.**

---

## 6. Estimation réaliste

### 6a. Faisable en un seul commit ?

**Non.** Le plan liste 15 fichiers. En réalité, ~35 fichiers sont impactés. Un seul commit de ~35 fichiers avec un changement de type qui traverse 4 couches (données, builders, composants, tests) est risqué et difficile à reviewer/débugger.

### 6b. Estimation

Après correction des hypothèses fausses, le refactoring prendra environ **2-3 sessions de travail** :

- Session 1 : Enrichir `DocumentElement`, réécrire `construireDocuments`, propager le type `RendererDocument` dans toute la chaîne d'impression (donnees.ts → builders → transformations → tests)
- Session 2 : Remplacer les renderers parallèles dans les consommateurs (vue détaillée, sommaire, wizard preview, playground), supprimer les dead code
- Session 3 : Consolider la route d'impression évaluations, tests manuels, tests Playwright

### 6c. Découpage recommandé

Le plan dit « un seul commit » mais devrait être découpé en **3 commits séquentiels** :

1. **Commit 1 — Types et builders** : enrichir `DocumentElement`, changer `DonneesTache.documents` de `DocumentReference[]` à `RendererDocument[]`, adapter tous les builders et transformations, adapter tous les tests
2. **Commit 2 — Renderers** : remplacer les renderers parallèles, supprimer les dead code, adapter les playground
3. **Commit 3 — Route évaluation** : supprimer ou rediriger `/evaluations/[id]/print`, supprimer `EvaluationPrintableBody`/`EvaluationFichePrintView`

Chaque commit doit compiler (`tsc --noEmit`) individuellement.

---

## 7. Blockers

### BLOCKER 1 — `slot.rendererDocument` n'existe pas

**Gravité : CRITIQUE**

L'étape 3 repose sur `slot.rendererDocument` pour éviter la destruction de données. Ce champ N'EXISTE PAS sur `DocumentSlotData`. Le plan doit être réécrit pour construire un `RendererDocument` complet à partir des champs de `DocumentSlotData` (type, titre, contenu, source_citation, imageUrl, imageLegende, etc.).

**Correction :** réécrire `construireDocuments` pour mapper manuellement tous les champs de `DocumentSlotData` vers un `RendererDocument` valide. Cela implique de mapper :

| DocumentSlotData                  | RendererDocument / DocumentElement         |
| --------------------------------- | ------------------------------------------ |
| `slotId`                          | `id`                                       |
| `titre`                           | `titre`                                    |
| `"simple"` (toujours pour wizard) | `structure`                                |
| `type`                            | `elements[0].type`                         |
| `contenu`                         | `elements[0].contenu` (si textuel)         |
| `source_citation`                 | `elements[0].source`                       |
| `source_type`                     | `elements[0].sourceType`                   |
| `imageUrl`                        | `elements[0].imageUrl` (si iconographique) |
| `image_legende`                   | `elements[0].legende`                      |
| `image_legende_position`          | `elements[0].legendePosition`              |
| `categorie_textuelle`             | `elements[0].categorieTextuelle`           |
| `type_iconographique`             | `elements[0].categorieIconographique`      |
| `repere_temporel`                 | `repereTemporelDocument`                   |

### BLOCKER 2 — Le code de fallback (étape 3) ne compile pas

Les champs `sourceCitation`, `categorieTextuelle`, `categorieIconographique`, `sourceType` manquent dans le code proposé. Le type `DocumentElement` a des champs obligatoires que le fallback ne fournit pas.

**Correction :** le fallback doit devenir le chemin principal (voir Blocker 1) et doit fournir TOUS les champs obligatoires de `DocumentElement`.

### BLOCKER 3 — 19 fichiers non listés seraient cassés

Le plan liste 15 fichiers touchés. Il en manque au minimum :

- `lib/fiche/sections/SectionDocuments.tsx` (importe `DocCard`)
- `components/playground/PlaygroundPrintRenderer.tsx` (importe `PrintableDocumentCell`)
- `components/playground/PlaygroundFicheRenderer.tsx` (importe `SectionDocuments`)
- `components/playground/PlaygroundContextCanvas.tsx` (importe `PrintableFichePreview`)
- `lib/impression/builders/blocs-tache.ts`
- `lib/impression/builders/blocs-corrige.ts`
- `lib/impression/builders/blocs-quadruplet.ts`
- `lib/tache/impression/tache-vers-imprimable.ts`
- `lib/document/impression/document-vers-imprimable.ts`
- `lib/epreuve/transformation/renumerotation.ts`
- `app/api/impression/apercu-png/route.ts`
- `app/(apercu)/apercu/[token]/page.tsx`
- `app/(apercu)/apercu/test/[slug]/page.tsx`
- `components/epreuve/impression/section-page.tsx`
- `components/epreuve/impression/entete.tsx`
- `components/epreuve/impression/sections/outil-evaluation.tsx`
- `components/epreuve/impression/sections/espace-production.tsx`
- 6 fichiers de test

**Correction :** le récapitulatif des fichiers touchés doit être complété. Chaque fichier qui importe `DocumentReference` ou un composant supprimé doit être listé.

### Obstacle non-bloquant mais significatif

Le champ `documents` dans `DonneesTache` passe de `DocumentReference[]` (5 champs plats) à `RendererDocument[]` (structure imbriquée avec elements[]). Tous les builders d'impression qui accèdent à `doc.kind`, `doc.contenu`, `doc.titre`, `doc.echelle` devront être réécrits pour naviguer `doc.elements[0].type`, `doc.elements[0].contenu`, etc. Ce n'est pas un simple rename de type — c'est une réécriture de la logique d'accès aux données dans ~10 fichiers.

---

## Résumé des hypothèses fausses

| #   | Hypothèse du plan                                                               | Réalité                                                                                                               |
| --- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 1   | `slot.rendererDocument` existe sur les slots wizard                             | **FAUX** — ce champ n'existe pas sur `DocumentSlotData`                                                               |
| 2   | Le discriminant de type est `.kind`                                             | **FAUX** — c'est `.type` sur `DocumentElement`                                                                        |
| 3   | Le fallback compile                                                             | **FAUX** — champs obligatoires manquants                                                                              |
| 4   | 15 fichiers touchés                                                             | **FAUX** — ~35 fichiers minimum                                                                                       |
| 5   | `extractFootnotes` pourrait être appelé après `sanitize`                        | **FAUX problème** — ils opèrent sur la source indépendamment                                                          |
| 6   | Plan exécutable en un seul commit                                               | **Déconseillé** — trop d'amplitude                                                                                    |
| 7   | Le changement de type est « principalement des ajustements de types » (étape 5) | **FAUX** — c'est une réécriture de la logique d'accès aux données                                                     |
| 8   | `DocumentCardThumbnail` est une exception documentée utilisée                   | **DOUTEUX** — 0 imports trouvés, possiblement dead code                                                               |
| 9   | Le plan « ne crée rien de nouveau »                                             | **CORRECT** techniquement, mais le mapper `DocumentSlotData → RendererDocument` est du code substantiellement nouveau |
| 10  | `DocCard` n'est utilisé que dans la vue détaillée tâche                         | **FAUX** — aussi dans `lib/fiche/sections/SectionDocuments.tsx`                                                       |
| 11  | Les fichiers playground ne sont pas impactés                                    | **FAUX** — 3 fichiers playground cassés                                                                               |
| 12  | Le pipeline de renumerotation n'est pas impacté                                 | **FAUX** — `renumerotation.ts` type `DocumentReference` directement                                                   |

---

## Verdict

Le plan est **architecturalement sain** — l'objectif d'unifier sur `RendererDocument` + `DocumentElementRenderer` est le bon. Mais l'exécution telle que décrite est **impossible** à cause de 3 blockers (slot.rendererDocument inexistant, fallback non compilable, 19 fichiers manquants).

Après correction des blockers, le refactoring reste ambitieux mais faisable en 2-3 sessions avec un découpage en 3 commits.
