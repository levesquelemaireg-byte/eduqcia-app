# Impression tâche seule & document seul — Spécification finale

**Version** : 1.0 — post-review 4 agents (DeepSeek, Grok, Gemini, ChatGPT)
**Statut** : Prêt pour implémentation
**Prérequis** : Print engine PDF-1 à PDF-11 terminés
**Dépendance** : `docs/specs/print-engine.md` v2.1 (référentiel pour les types, constantes, et composants existants)

---

## 1. Problème

Le print engine produit des PDF pixel-perfect pour les **épreuves** (multi-tâches, 3 feuillets, en-tête, pagination complexe). On veut étendre ce pipeline aux **tâches seules** et **documents seuls** depuis leurs wizards respectifs, sans polluer le code existant.

## 2. Cas d'usage

### Document seul — UN SEUL MODE

- Une page Letter 8.5×11, le document dessus, c'est tout
- Pas d'en-tête, pas de pagination, pas de mode
- Si le document déborde de la page → erreur bloquante
- Action unique : "Télécharger le PDF"

### Tâche seule — TROIS MODES

**Formatif** : documents (titres visibles) + quadruplet complet (consigne + guidage + espace prod + outil éval). 1-3 pages.

**Sommatif standard** : documents anonymisés + quadruplet sans guidage. 1-2 pages.

**Corrigé** : contenu sommatif + corrigé affiché. 1-3 pages.

### UX dans les wizards

```
Wizard "Créer une tâche"
├── Panneau édition (gauche)
└── Panneau preview (droite)
    ├── [Sommaire]            ← existe (selectors live)
    └── [Aperçu impression]   ← NOUVEAU
        ├── Sélecteur de mode (formatif / sommatif / corrigé)
        └── Bouton "Télécharger le PDF"

Wizard "Créer un document"
├── Panneau édition (gauche)
└── Panneau preview (droite)
    ├── [Sommaire]            ← existe
    └── [Aperçu impression]   ← NOUVEAU
        └── Bouton "Télécharger le PDF"
```

Pas de bouton "Imprimer". Pas de `window.print()`.

---

## 3. Architecture — 3 couches

### Principe

Le système imprime des **compositions de blocs contraints par un contexte d'impression**. Pas des entités. Une tâche seule et une tâche dans une épreuve ne sont PAS le même objet d'impression — elles partagent les mêmes **builders de blocs** mais pas le même pipeline de pagination.

### Couche 1 — Builders de blocs (partagés, purs, réutilisables)

Fonctions pures qui transforment des données métier en blocs imprimables. **Aucune connaissance de la pagination ni du contexte global.** Réutilisées par la tâche seule ET par l'épreuve.

```typescript
// lib/impression/builders/blocs-document.ts (~40 lignes)
export function construireBlocDocument(
  doc: DocumentReference,
  options: { titreVisible: boolean },
): Bloc;

// lib/impression/builders/blocs-quadruplet.ts (~60 lignes)
export function construireBlocQuadruplet(
  tache: Pick<DonneesTache, "consigne" | "guidage" | "espaceProduction" | "outilEvaluation">,
  options: { guidageVisible: boolean },
): Bloc;

// lib/impression/builders/blocs-corrige.ts (~30 lignes)
export function construireBlocCorrige(corrige: string): Bloc;

// lib/impression/builders/blocs-tache.ts (~80 lignes)
// Orchestre les builders ci-dessus selon le mode
export function construireBlocsTache(
  tache: DonneesTache,
  options: { mode: ModeImpression; estCorrige: boolean },
): Bloc[] {
  const regles = reglesVisibilite(options.mode);
  const blocs: Bloc[] = [];

  // Documents de la tâche
  for (const doc of tache.documents) {
    blocs.push(
      construireBlocDocument(doc, {
        titreVisible: regles.titresDocumentsVisibles,
      }),
    );
  }

  // Quadruplet
  blocs.push(
    construireBlocQuadruplet(tache, {
      guidageVisible: regles.guidageVisible,
    }),
  );

  // Corrigé (optionnel)
  if (options.estCorrige && tache.corrige) {
    blocs.push(construireBlocCorrige(tache.corrige));
  }

  return blocs;
}
```

```typescript
// lib/impression/builders/regles-visibilite.ts (~30 lignes)
export function reglesVisibilite(mode: ModeImpression) {
  return {
    guidageVisible: mode === "formatif",
    titresDocumentsVisibles: mode === "formatif",
  };
}
```

### Couche 2 — Points d'entrée par entité (fonctions pures, chacune < 150 lignes)

Chaque entité a sa propre fonction. Elles appellent les builders de blocs puis paginent (ou non) selon le contexte.

```typescript
// lib/document/impression/document-vers-imprimable.ts (~60 lignes)
export function documentVersImprimable(
  document: DonneesDocument,
  mesureur: Mesureur,
): RenduImprimable {
  const bloc = construireBlocDocument(document, { titreVisible: true });
  const hauteur = mesureur(bloc);

  if (hauteur > MAX_CONTENT_HEIGHT_PX) {
    return {
      ok: false,
      erreur: {
        kind: "DEBORDEMENT_BLOC",
        blocId: document.id,
        blocLibelle: document.titre,
        hauteurPx: hauteur,
        hauteurMaxPx: MAX_CONTENT_HEIGHT_PX,
        suggestion: "Réduisez le contenu du document.",
      },
    };
  }

  return {
    ok: true,
    empreinte: calculerEmpreinte(document),
    contexte: { type: "document" },
    enTete: null,
    pages: [
      {
        numeroPage: 1,
        totalPages: 1,
        blocs: [
          { ...bloc, hauteurPx: hauteur, ratio: hauteur / MAX_CONTENT_HEIGHT_PX, securise: true },
        ],
        hauteurTotalePx: hauteur,
      },
    ],
  };
}
```

```typescript
// lib/tache/impression/tache-vers-imprimable.ts (~120 lignes)
export function tacheVersImprimable(
  tache: DonneesTache,
  options: { mode: ModeImpression; estCorrige: boolean },
  mesureur: Mesureur,
): RenduImprimable {
  // Couche 1 : construire les blocs
  const blocs = construireBlocsTache(tache, options);

  // Couche 2 : paginer via le pager existant
  const resultatPagination = paginer(blocs, mesureur, {
    maxContentHeight: MAX_CONTENT_HEIGHT_PX,
    tolerance: TOLERANCE_PX,
  });

  if (!resultatPagination.ok) {
    return { ok: false, erreur: resultatPagination.erreur };
  }

  return {
    ok: true,
    empreinte: calculerEmpreinte(tache, options),
    contexte: { type: "tache", mode: options.mode, estCorrige: options.estCorrige },
    enTete: null,
    pages: resultatPagination.pages,
  };
}
```

```typescript
// lib/epreuve/transformation/epreuve-vers-imprimable.ts (~150 lignes)
// Refactor de l'existant epreuve-vers-paginee.ts
export function epreuveVersImprimable(
  epreuve: DonneesEpreuve,
  options: { mode: ModeImpression; estCorrige: boolean },
  mesureur: Mesureur,
): RenduImprimable {
  // Couche 1 : construire les blocs pour CHAQUE tâche
  const blocsParTache = epreuve.taches.map((tache) => construireBlocsTache(tache, options));

  // Contexte épreuve : renumérotation globale des documents
  const blocsFusionnes = renumeroterDocuments(blocsParTache);

  // Contexte épreuve : résolution {{doc_N}} (et {{doc_A}} legacy) cross-tâches
  const blocsResolus = resoudreReferences(blocsFusionnes, epreuve);

  // Couche 2 : paginer le tout
  const resultatPagination = paginer(blocsResolus, mesureur, {
    maxContentHeight: MAX_CONTENT_HEIGHT_PX - HEADER_HEIGHT_PX,
    tolerance: TOLERANCE_PX,
  });

  if (!resultatPagination.ok) {
    return { ok: false, erreur: resultatPagination.erreur };
  }

  return {
    ok: true,
    empreinte: calculerEmpreinte(epreuve, options),
    contexte: { type: "epreuve", mode: options.mode, estCorrige: options.estCorrige },
    enTete: epreuve.enTete,
    pages: resultatPagination.pages,
  };
}
```

**Pourquoi `epreuveVersImprimable` n'appelle PAS `tacheVersImprimable`** :

- L'épreuve renumérate les documents globalement (Document 1 de tâche 2 = Document 4 global)
- L'épreuve résout les références `{{doc_N}}` (et `{{doc_A}}` legacy, rétrocompat) dans un contexte cross-tâches
- L'épreuve pagine TOUS les blocs ensemble (continuité de pagination)
- Appeler `tacheVersImprimable` forcerait une pagination par tâche puis une fusion — plus complexe, moins contrôlable

Les deux partagent `construireBlocsTache` (couche 1) — c'est le bon niveau de réutilisation.

### Couche 3 — Pipeline unifié (existant, inchangé)

```
documentVersImprimable()  ─┐
tacheVersImprimable()     ─┼→ RenduImprimable → ApercuImpression → Puppeteer → PDF
epreuveVersImprimable()   ─┘
```

Même composant de rendu, même route SSR, même Puppeteer, mêmes APIs. Zéro duplication.

---

## 4. Type de sortie partagé

```typescript
// lib/impression/types.ts (~40 lignes)

export type ContexteImpression =
  | { type: "document" }
  | { type: "tache"; mode: ModeImpression; estCorrige: boolean }
  | { type: "epreuve"; mode: ModeImpression; estCorrige: boolean };

export type RenduImprimable =
  | {
      ok: true;
      empreinte: string;
      contexte: ContexteImpression;
      enTete: EnTeteImpression | null;
      pages: Page[];
    }
  | {
      ok: false;
      erreur: ErreurDebordement;
    };
```

Le `contexte` est un discriminant typé. Le renderer est 100% stateless — il lit `enTete` pour savoir s'il y a un en-tête, `pages` pour le contenu, et `contexte.type` uniquement si l'UI a besoin de s'adapter (ex: le carrousel affiche des onglets par feuillet seulement pour les épreuves).

---

## 5. Modifications aux fichiers existants

### Route SSR

```typescript
// app/(apercu)/apercu/[token]/page.tsx
// Le token-draft stocke un champ `type`
// Dispatch vers le bon pipeline selon le type

const { payload, type, mode, estCorrige } = await lireTokenDraft(token);

let rendu: RenduImprimable;
switch (type) {
  case "document":
    rendu = documentVersImprimable(payload, mesureur);
    break;
  case "tache":
    rendu = tacheVersImprimable(payload, { mode, estCorrige }, mesureur);
    break;
  case "epreuve":
    rendu = epreuveVersImprimable(payload, { mode, estCorrige }, mesureur);
    break;
}
```

### Token-draft

```typescript
// app/api/impression/token-draft/route.ts
// Body enrichi avec champ `type`
const bodySchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("document"),
    payload: donneesDocumentSchema,
  }),
  z.object({
    type: z.literal("tache"),
    payload: donneesTacheSchema,
    mode: modeImpressionSchema,
    estCorrige: z.boolean(),
  }),
  z.object({
    type: z.literal("epreuve"),
    payload: donneesEpreuveSchema,
    mode: modeImpressionSchema,
    estCorrige: z.boolean(),
  }),
]);
```

### ApercuImpression

```typescript
// components/epreuve/impression/index.tsx
// Accepte RenduImprimable au lieu de EpreuvePaginee
// Le composant itère sur pages[], affiche l'en-tête si non-null
// AUCUNE logique conditionnelle par type — le renderer est stupide
```

### Carrousel

```typescript
// components/epreuve/apercu/carrousel.tsx
// Onglets par feuillet SEULEMENT si contexte.type === 'epreuve'
// Sinon : carrousel simple sans onglets
```

### APIs PDF et PNG

Aucune modification. Le token contient tout. Les APIs ne savent pas quel type d'entité elles rasterisent.

---

## 6. Fichiers à créer

```
lib/impression/types.ts                               ~40 lignes  RenduImprimable, ContexteImpression
lib/impression/builders/blocs-document.ts             ~40 lignes  construireBlocDocument
lib/impression/builders/blocs-quadruplet.ts           ~60 lignes  construireBlocQuadruplet
lib/impression/builders/blocs-corrige.ts              ~30 lignes  construireBlocCorrige
lib/impression/builders/blocs-tache.ts                ~80 lignes  construireBlocsTache (orchestre)
lib/impression/builders/regles-visibilite.ts          ~30 lignes  reglesVisibilite
lib/tache/impression/tache-vers-imprimable.ts         ~120 lignes point d'entrée tâche
lib/document/impression/document-vers-imprimable.ts   ~60 lignes  point d'entrée document
tests/unit/impression/blocs-tache.test.ts
tests/unit/tache/tache-vers-imprimable.test.ts
tests/unit/document/document-vers-imprimable.test.ts
```

## 7. Fichiers à modifier

```
lib/epreuve/transformation/epreuve-vers-paginee.ts
  → renommer en epreuve-vers-imprimable.ts
  → retourne RenduImprimable avec contexte
  → appelle construireBlocsTache (couche 1) au lieu de tout faire en interne
  → les helpers existants (renumeroter, resoudreReferences) restent

lib/epreuve/pagination/types.ts
  → EpreuvePaginee supprimé ou aliasé vers RenduImprimable

components/epreuve/impression/index.tsx
  → consomme RenduImprimable au lieu de EpreuvePaginee

components/epreuve/apercu/carrousel.tsx
  → onglets conditionnels selon contexte.type

app/(apercu)/apercu/[token]/page.tsx
  → dispatch par type

app/api/impression/token-draft/route.ts
  → body enrichi avec discriminatedUnion sur type
```

---

## 8. Copy UI

```typescript
// Tâche seule
modalTitle: "Aperçu de la tâche";

// Document seul
modalTitle: "Aperçu du document";

// Erreur débordement document
erreurDebordement: "Le contenu dépasse la page — réduisez la taille du document.";
```

Les autres libellés (skeleton, bannière invalidation, bouton PDF) réutilisent ceux définis en PDF-11.

---

## 9. Évolutivité

Pour ajouter un nouveau type imprimable (cahier de réponses, dossier documentaire, fiche synthèse) :

1. Créer `xVersImprimable()` — fonction pure qui retourne `RenduImprimable`
2. Ajouter le type dans `ContexteImpression`
3. Ajouter un case dans le dispatch SSR (3 lignes)
4. Ajouter le type dans le schema Zod du token-draft

Le renderer, le carrousel, Puppeteer, les APIs PDF/PNG restent **intouchés**. Architecture ouverte/fermée.

---

## 10. Décisions verrouillées

| #   | Décision               | Choix                                                             |
| --- | ---------------------- | ----------------------------------------------------------------- |
| 1   | Réutilisation          | Builders de blocs partagés, PAS d'imbrication de pipelines        |
| 2   | Type de sortie         | `RenduImprimable` unique avec `contexte` discriminé               |
| 3   | Pagination document    | Pas de pager — 1 page, erreur si débordement                      |
| 4   | Route SSR              | Unique `/apercu/[token]` avec dispatch par `type`                 |
| 5   | En-tête tâche/document | `null` — pas d'en-tête                                            |
| 6   | Bouton imprimer        | Aucun — PDF téléchargeable uniquement                             |
| 7   | Routes legacy          | Gardées avec `window.print()` — migration post-MVP                |
| 8   | Renderer               | `ApercuImpression` consomme `RenduImprimable`, agnostique du type |
| 9   | Carrousel              | Onglets par feuillet seulement si épreuve                         |
| 10  | Fichiers               | Tous < 150 lignes, fonctions pures                                |

---

_Fin — Prêt pour implémentation. Consensus 4 agents, 10 décisions verrouillées._
