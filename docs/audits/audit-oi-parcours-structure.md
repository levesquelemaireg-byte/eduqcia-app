# Audit structurel — Parcours OI (Rédaction / Non-Rédaction)

**Projet :** ÉduQc.IA — plateforme de création de tâches d'évaluation en histoire (Québec, secondaire)  
**Stack :** Next.js 15 App Router, TypeScript strict, Supabase, Tailwind, TipTap  
**Date :** 13 avril 2026  
**Objectif :** cartographier les points de branchement R/NR, identifier la duplication, proposer des pistes de rationalisation.

---

## Contexte métier

Une **tâche d'apprentissage et d'évaluation (TAÉ)** est créée via un wizard 7 étapes. Le parcours varie selon l'**opération intellectuelle (OI)** et le **comportement attendu** choisis à l'étape 2 :

- **Rédactionnel (R)** — l'enseignant rédige consigne, guidage et corrigé en texte libre (TipTap).
- **Non-rédactionnel (NR)** — la consigne, le guidage et le corrigé sont **générés** à partir d'un payload structuré (grille, frise, tableau avant/après).

### Variants NR implémentées (3)

| Slug                  | OI            | Rendu élève                                  |
| --------------------- | ------------- | -------------------------------------------- |
| `ordre-chronologique` | OI1 · 1.1/1.2 | Grille de classement numérotée               |
| `ligne-du-temps`      | OI1 · 1.2     | Frise SVG avec segments                      |
| `avant-apres`         | OI1 · 1.3     | Tableau 2 colonnes (Avant / Après un repère) |

### Variants déclarées mais pas implémentées (3)

`carte-historique`, `manifestations`, `causes-consequences` — présentes dans le type union mais sans UI.

---

## Architecture actuelle — flux de données

```
oi.json (référentiel)
  └─ comportement.variant_slug
       └─ registry.ts (Map<comportementId, slug>)
            └─ wizard-variant.ts (isActive*Variant() guards)
                 │
                 ├─ Wizard UI ──► wizardBlocResolver.tsx (Bloc 3/4)
                 │                Bloc5.tsx (Bloc 5)
                 │                index.tsx (step labels)
                 │
                 ├─ Reducer ───► tae-form-reducer.ts (actions NR_PATCH_*)
                 │                tae-form-state-types.ts (NonRedactionData union)
                 │
                 ├─ Builders ──► ordre-chronologique-payload.ts
                 │                ligne-du-temps-payload.ts
                 │                avant-apres-payload.ts
                 │                (chacun : build*ConsigneHtml, build*GuidageHtml, build*CorrigeHtml)
                 │
                 ├─ Publish ───► publish-tae-payload.ts (cascade ternaire → builders)
                 │                wizard-publish-guards.ts (validation avant publication)
                 │
                 ├─ Selectors ─► selectNRContent.ts (cascade if → builders)
                 │                selectConsigne/Guidage/Corrige.ts (consomment selectNRContent)
                 │
                 ├─ Preview ───► formStateToTae() (cascade ternaire → builders)  [deprecated]
                 │                PrintableFichePreview.tsx (route vers *QuestionnaireCore)
                 │
                 └─ Hydrate ───► non-redaction-edit-hydrate.ts
                                  tae-form-hydrate.ts (parseNonRedactionData)
```

---

## Inventaire des points de branchement

### Couche 1 — Détection de variant

| Fichier                                   | Mécanisme                                             | Commentaire                                                                   |
| ----------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------- |
| `lib/tache/non-redaction/variant-slugs.ts`  | `as const` array + Set guard                          | Source de vérité des slugs                                                    |
| `lib/tache/non-redaction/registry.ts`       | `Map.get(comportementId)` depuis oi.json              | Lookup O(1), auto-construit                                                   |
| `lib/tache/non-redaction/wizard-variant.ts` | 4 fonctions `isActive*Variant()`                      | Chacune appelle `getVariantSlugForComportementId()` puis compare `=== "slug"` |
| `lib/tache/behaviours/comportement-slug.ts` | if-else cascade (3 slugs) → fallback `"redactionnel"` | Les variants futures tombent silencieusement en rédactionnel                  |

### Couche 2 — État (reducer + types)

| Fichier                           | Mécanisme                              | Commentaire                                                      |
| --------------------------------- | -------------------------------------- | ---------------------------------------------------------------- |
| `lib/tache/tae-form-state-types.ts` | Discriminated union `NonRedactionData` | 4 branches : placeholder, ordre, ligne, avant                    |
| `lib/tache/tae-form-reducer.ts`     | 3 actions `NON_REDACTION_PATCH_*`      | Chacune garde sur `nr?.type !== "slug"`                          |
| `lib/tache/tae-form-reducer.ts`     | `initialNonRedactionForSlug()`         | 3-way if cascade → payload initial par variant                   |
| `lib/tache/tae-form-reducer.ts`     | `UPDATE_DOCUMENT_SLOT`                 | Cas spécial avant-après uniquement (reset options si doc change) |

### Couche 3 — UI wizard (composants)

| Fichier                   | Mécanisme                                              | Variants                                               |
| ------------------------- | ------------------------------------------------------ | ------------------------------------------------------ |
| `wizardBlocResolver.tsx`  | Object registry `TAE_NON_REDACTION_WIZARD_BLOCS[slug]` | 3 paires {Bloc3, Bloc4} enregistrées                   |
| `bloc5/Bloc5.tsx`         | Object registry `BLOC5_DYNAMIC_BY_SLUG[slug]`          | 4 entrées (redactionnel + 3 NR) + cas spécial `intrus` |
| `index.tsx` (step labels) | Ternaire imbriqué 3 niveaux                            | `isActiveOrdre…` → `isActiveLigne…` → `isActiveAvant…` |

### Couche 4 — Builders HTML (consigne, guidage, corrigé)

| Fichier                          | Fonctions exportées                                                                                                                          | Lignes  |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `ordre-chronologique-payload.ts` | `build*ConsigneHtml`, `build*GuidageHtml`, `build*CorrigeHtml`, `parse*ForStudentPrint`, `prepare*ForTeacherDisplay`, `normalize*`, `merge*` | ~17 000 |
| `ligne-du-temps-payload.ts`      | idem pattern                                                                                                                                 | ~14 000 |
| `avant-apres-payload.ts`         | idem pattern + `generateOptionPartitions`, `computeCorrectPair`                                                                              | ~22 000 |

### Couche 5 — Publication + validation

| Fichier                    | Mécanisme                                                          | Commentaire                            |
| -------------------------- | ------------------------------------------------------------------ | -------------------------------------- |
| `publish-tae-payload.ts`   | Cascade ternaire : normalize → isActive* → build*Html              | Duplique la logique de selectNRContent |
| `wizard-publish-guards.ts` | Cascade `isActive*Variant()` + fonctions de validation par variant | 3 branches parallèles                  |

### Couche 6 — Selectors fiche (sommaire / lecture)

| Fichier                                                       | Mécanisme                                                       | Commentaire                        |
| ------------------------------------------------------------- | --------------------------------------------------------------- | ---------------------------------- |
| `selectNRContent.ts`                                          | if cascade : `slug === "X" && type === "X"` → normalize → build | 3 branches identiques en structure |
| `selectConsigne.ts` / `selectGuidage.ts` / `selectCorrige.ts` | Consomment `selectNRContent`                                    | Propres, pas de branchement NR     |

### Couche 7 — Preview / Print

| Fichier                               | Mécanisme                                             | Commentaire                                                       |
| ------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------- |
| `formStateToTae()` (fiche-helpers.ts) | Cascade ternaire identique à publish-tae-payload      | **Marquée deprecated**, encore utilisée par PrintableFichePreview |
| `PrintableFichePreview.tsx`           | `parse*ConsigneForStudentPrint()` → routing composant | 3 parsers + 3 composants `*PrintableQuestionnaireCore`            |

### Couche 8 — Hydratation (édition)

| Fichier                         | Mécanisme                                                  | Commentaire                     |
| ------------------------------- | ---------------------------------------------------------- | ------------------------------- |
| `tae-form-hydrate.ts`           | if cascade sur `type` discriminant + `normalize*Payload()` | 4 branches (placeholder + 3 NR) |
| `non-redaction-edit-hydrate.ts` | Cas spécial avant-après (init si manquant)                 | 21 lignes                       |

---

## Diagnostic : ce qui fonctionne

1. **Discriminated union `NonRedactionData`** — pattern TypeScript solide, exhaustivité vérifiable.
2. **Registry `oi.json` → Map** — ajout de slug automatique, pas de code à toucher.
3. **Object registries pour les composants** (`wizardBlocResolver`, `BLOC5_DYNAMIC_BY_SLUG`) — lookup déclaratif, facile à étendre.
4. **Séparation payload/builder** — chaque variant a son propre fichier, pas de mélange.
5. **Tests payload** — ~17 000 lignes de tests couvrent les 3 variants.

---

## Diagnostic : ce qui pose problème

### P1 — Cascade dupliquée (le problème principal)

La même logique `normalize → isActive* → build*Html` est copiée dans **4 fichiers** :

```
selectNRContent.ts        — selectors fiche
publish-tae-payload.ts    — publication
fiche-helpers.ts          — preview (deprecated)
wizard-publish-guards.ts  — validation (partiel)
```

Chaque fichier ré-implémente :

1. Normaliser le payload de chaque variant
2. Vérifier quel variant est actif
3. Appeler le bon builder

Si on ajoute un 4e variant, il faut toucher ces 4 fichiers de la même façon.

### P2 — Fonctions `isActive*Variant()` individuelles

4 fonctions distinctes (`isActiveNonRedactionVariant`, `isActiveOrdreChronologiqueVariant`, `isActiveLigneDuTempsVariant`, `isActiveAvantApresVariant`) qui font chacune le même appel `getVariantSlugForComportementId()`. Les consommateurs chaînent des ternaires au lieu de brancher sur une valeur unique.

### P3 — Step labels par ternaire imbriqué

```typescript
const step =
  isActiveOrdreChronologiqueVariant(state) && state.currentStep === TAE_DOCUMENTS_STEP_INDEX
    ? { ...stepBase, label: NR_ORDRE_STEP4_TITLE, description: NR_ORDRE_STEP4_DESCRIPTION }
    : isActiveLigneDuTempsVariant(state) && state.currentStep === TAE_DOCUMENTS_STEP_INDEX
      ? { ...stepBase, label: NR_LIGNE_TEMPS_STEP4_TITLE, ... }
      : isActiveAvantApresVariant(state) && state.currentStep === TAE_DOCUMENTS_STEP_INDEX
        ? { ...stepBase, label: NR_AVANT_APRES_STEP4_TITLE, ... }
        : stepBase;
```

Un 4e variant ajouterait un 4e niveau de ternaire.

### P4 — Anchors HTML couplés

3 constantes d'ancre distinctes (`ORDRE_CHRONO_STUDENT_SHEET_GUIDAGE_ANCHOR`, `LIGNE_TEMPS_*`, `AVANT_APRES_*`) avec 3 parsers distincts (`parse*ConsigneForStudentPrint`) qui font la même chose (split au marqueur).

### P5 — Fallback silencieux des variants futures

`resolveComportementSlug()` retourne `"redactionnel"` pour les slugs déclarés mais non implémentés (`carte-historique`, etc.) — pas de log, pas d'erreur.

---

## Coût d'ajout d'un nouveau variant (état actuel)

| Action                                 | Fichiers à toucher                                      |
| -------------------------------------- | ------------------------------------------------------- |
| Déclarer le slug                       | 1 (`variant-slugs.ts`) — le registry se met à jour seul |
| Ajouter `isActive*()`                  | 1 (`wizard-variant.ts`)                                 |
| Ajouter au `comportement-slug.ts`      | 1                                                       |
| Type `NonRedactionData`                | 1 (`tae-form-state-types.ts`)                           |
| Action reducer                         | 1 (`tae-form-reducer.ts`)                               |
| `initialNonRedactionForSlug()`         | 1 (dans le reducer)                                     |
| Payload + builders                     | 1 nouveau fichier (~2000+ lignes)                       |
| Composants Bloc 3, 4, 5                | 3 nouveaux fichiers                                     |
| Enregistrer dans wizardBlocResolver    | 1                                                       |
| Enregistrer dans BLOC5_DYNAMIC_BY_SLUG | 1                                                       |
| **Cascade publish**                    | 1 (`publish-tae-payload.ts`)                            |
| **Cascade selectors**                  | 1 (`selectNRContent.ts`)                                |
| **Cascade formStateToTae**             | 1 (`fiche-helpers.ts`)                                  |
| **Cascade guards**                     | 1 (`wizard-publish-guards.ts`)                          |
| Composant print questionnaire          | 1 nouveau fichier                                       |
| Hydratation                            | 1 (`tae-form-hydrate.ts`)                               |
| Step labels                            | 1 (`index.tsx`)                                         |
| Tests                                  | ~3-6 fichiers                                           |
| **Total**                              | **~16 fichiers coordonnés, dont 4 cascades identiques** |

---

## Pistes de rationalisation (à discuter)

### Option A — Factory centralisée `resolveNRContent()`

Extraire la logique dupliquée dans une seule fonction :

```typescript
// lib/tache/non-redaction/resolve-nr-content.ts
export function resolveNRContent(
  comportementId: string,
  nonRedaction: NonRedactionData | null,
): { consigne: string; guidage: string; corrige: string } | null {
  const slug = getVariantSlugForComportementId(comportementId);
  if (!slug || !nonRedaction || nonRedaction.type === "placeholder") return null;

  const builder = NR_BUILDERS[slug]; // registry
  if (!builder || nonRedaction.type !== slug) return null;

  const normalized = builder.normalize(nonRedaction.payload);
  if (!normalized) return null;

  return {
    consigne: builder.buildConsigne(normalized),
    guidage: builder.buildGuidage(normalized),
    corrige: builder.buildCorrige(normalized),
  };
}
```

Les 4 fichiers consommateurs appellent `resolveNRContent()` au lieu de dupliquer.

**Impact :** élimine P1 et P2. Ajout d'un variant = 1 entrée dans `NR_BUILDERS`.

### Option B — Config déclarative par variant

Regrouper toute la configuration d'un variant dans un objet unique :

```typescript
// lib/tache/non-redaction/variants/ordre-chronologique.ts
export const ordreChronologiqueVariant: NRVariantConfig = {
  slug: "ordre-chronologique",
  initialPayload: () => initialOrdreChronologiquePayload(),
  normalize: normalizeOrdreChronologiquePayload,
  buildConsigne: buildOrdreChronologiqueConsigneHtml,
  buildGuidage: buildOrdreChronologiqueGuidageHtml,
  buildCorrige: buildOrdreChronologiqueCorrigeHtml,
  parseForStudentPrint: parseOrdreChronologiqueConsigneForStudentPrint,
  prepareForTeacherDisplay: prepareOrdreChronologiqueConsigneForTeacherDisplay,
  bloc3Component: () => import("./Bloc3OrdreChronologique"),
  bloc4Component: () => import("./Bloc4OrdreChronologique"),
  bloc5Component: () => import("./Bloc5OrdreChronologique"),
  printComponent: () => import("./OrdreChronologiquePrintableQuestionnaireCore"),
  stepLabels: { step4Title: NR_ORDRE_STEP4_TITLE, step4Description: NR_ORDRE_STEP4_DESCRIPTION },
  anchor: "<!--eduqcia:ordre-chrono-student-sheet-guidage-anchor-->",
};
```

**Impact :** élimine P1, P2, P3, P4. Ajout d'un variant = 1 fichier config + les composants UI.

### Option C — Statu quo amélioré

Garder l'architecture actuelle mais :

- Extraire `resolveNRContent()` (Option A minimale) pour éliminer la duplication P1
- Remplacer les ternaires step labels par un lookup `NR_STEP_OVERRIDES[slug]`
- Ajouter un `console.warn` dans `resolveComportementSlug` pour P5
- Ne pas toucher aux builders ni aux composants

**Impact :** réduit la friction d'ajout sans refactoring majeur.

---

## Question pour les agents reviewers

> Étant donné le contexte (projet solo, 3 variants implémentées, 3 futures, wizard 7 étapes avec logique métier dense), **quelle option de rationalisation recommandez-vous** et comment structureriez-vous le code pour minimiser le coût d'ajout d'un nouveau variant NR tout en gardant la lisibilité ?

Points à considérer :

- Les builders (`build*Html`) font 14 000–22 000 lignes chacun — ce ne sont pas des fonctions triviales
- Le reducer utilise des discriminated unions (pattern solide à préserver)
- `formStateToTae()` est deprecated mais encore consommée par le preview
- Les tests existants (~17 000 lignes) sont concentrés sur les payloads, pas sur le routing

---

_Document généré pour distribution multi-agents. Ne pas modifier sans mettre à jour la date._
