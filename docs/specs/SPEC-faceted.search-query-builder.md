# Spécification technique — Faceted Search Query Builder

## Banque collective de ressources pédagogiques en univers social

**Version** : 0.3 — finale post-review multi-agents
**Statut** : Prêt pour implémentation
**Date** : 2026-04-15
**Historique** :

- v0.1 : Draft initial
- v0.2 : Post-audit repo (Claude Code) — 15 corrections factuelles
- v0.3 : Post-review 6 agents (DeepSeek, ChatGPT, Grok, Kimi, Gemini x2) — 22 corrections, 3 décisions tranchées

---

## 1. Contexte et vision produit

### 1.1 Le problème

La banque collective contient des ressources pédagogiques en univers social (Histoire, Géographie, Éducation à la citoyenneté) créées par des enseignants du secondaire au Québec. Trois types de contenus : **Tâches** (TAÉ), **Documents historiques**, et **Épreuves**.

Chaque type a entre 6 et 12 dimensions filtrables. Les enseignants doivent trouver rapidement la bonne ressource en combinant des filtres taxonomiques, catégoriels, textuels, numériques, et relationnels.

### 1.2 Ce qui existe aujourd'hui

- **Tâches** : 9/12 filtres implémentés
- **Documents** : 5/11 filtres (cat. icono filtrée en JS post-fetch)
- **Épreuves** : 1/6 filtres (recherche titre sans index)

Architecture actuelle : `<form method="get">` natif, full-page reload, queries Supabase PostgREST. **Aucun compteur de facettes.**

### 1.3 Ce qu'on construit

1. Système de filtres à facettes unifié pour les trois entités
2. Facettes communes partagées + facettes spécifiques par entité
3. État dans l'URL — migration du form vers navigation client avec fallback no-JS
4. UX desktop (panneau latéral) et mobile (drawer simple)
5. Compteurs de facettes dynamiques — implémentation progressive en 3 phases

### 1.4 Stack technique

| Couche     | Technologie                               |
| ---------- | ----------------------------------------- |
| Framework  | Next.js (App Router, RSC, Server Actions) |
| Langage    | TypeScript (strict)                       |
| DB         | Supabase (PostgreSQL, RLS, RPC)           |
| Auth       | Supabase Auth                             |
| Styles     | Tailwind CSS (Manrope)                    |
| Validation | Zod                                       |
| Tests      | Vitest + Playwright                       |

Architecture serveur : lectures dans `lib/queries/`, écritures dans `lib/actions/`, Route Handlers (`api/`) pour AbortController.

---

## 2. Modèle de données

### 2.1 Tables et vues

| Entité    | Table         | Vue                             | Notes                             |
| --------- | ------------- | ------------------------------- | --------------------------------- |
| Tâches    | `tae`         | `banque_tae` (security_invoker) | is_published + is_archived filtré |
| Documents | `documents`   | —                               | .eq("is_published", true)         |
| Épreuves  | `evaluations` | —                               | Junction `evaluation_tae`         |

### 2.2 Inventaire des facettes

#### Tâches (table `tae`, vue `banque_tae`) — 12 dimensions

| #   | Facette       | OK  | Colonne                 | Type     | UI           | Notes                |
| --- | ------------- | --- | ----------------------- | -------- | ------------ | -------------------- |
| 1   | Recherche     | Y   | `consigne_search_plain` | TEXT GEN | Texte        | GIN trigram, ILIKE   |
| 2   | OI            | Y   | `oi_id`                 | TEXT     | Select       | "OI1", "OI2"...      |
| 3   | Comportement  | Y   | `comportement_id`       | TEXT     | Cascadé      | Dépend OI            |
| 4   | Niveau        | Y   | `niveau_id`             | INT      | Select       | 1,2,3,4              |
| 5   | Discipline    | Y   | `discipline_id`         | INT      | Select       | 1,2,3                |
| 6   | CD            | Y   | `cd_id`                 | INT      | Hiérarchique | 50+                  |
| 7   | Aspects       | Y   | `aspects_societe`       | ENUM[]   | Multi-check  | GIN, AND             |
| 8   | Connaissances | Y   | `connaissances_ids`     | INT[]    | Multi-select | GIN, OR              |
| 9   | Tri           | Y   | `bank_popularity_score` | —        | Radio        |                      |
| 10  | Auteur        | N   | `auteur_id`             | UUID     | Autocomplete | Route handler existe |
| 11  | École/CSS     | N   | via profiles            | INT      | Cascadé      | Double jointure      |
| 12  | Nb documents  | N   | via comportements       | INT      | Select       |                      |

#### Documents — 11 dimensions

| #   | Facette        | OK  | Colonne               | Type   | UI           | Notes                  |
| --- | -------------- | --- | --------------------- | ------ | ------------ | ---------------------- |
| 1   | Recherche      | Y   | `titre`               | TEXT   | Texte        | GIN trigram            |
| 2   | Discipline     | Y   | `disciplines_ids`     | INT[]  | Select       | Array, .contains()     |
| 3   | Niveau         | Y   | `niveaux_ids`         | INT[]  | Select       | Array, .contains()     |
| 4   | Type           | Y   | `type`                | ENUM   | Select       | textuel/iconographique |
| 5   | Cat. icono     | JS  | `type_iconographique` | TEXT   | Multi-check  | Migrer JS->SQL         |
| 6   | Cat. textuelle | N   | `categorie_textuelle` | ENUM   | Multi-check  | Quick win              |
| 7   | Type source    | N   | `source_type`         | TEXT   | Select       | Quick win              |
| 8   | Aspects        | N   | `aspects_societe`     | ENUM[] | Multi-check  | GIN, AND               |
| 9   | Connaissances  | N   | `connaissances_ids`   | INT[]  | Multi-select | GIN                    |
| 10  | Année          | N   | `annee_normalisee`    | INT    | Plage        | Peut être négatif      |
| 11  | Auteur         | N   | `auteur_id`           | UUID   | Autocomplete |                        |

#### Épreuves — 6 dimensions

| #   | Facette       | OK  | Colonne           | Type  | UI           | Notes                 |
| --- | ------------- | --- | ----------------- | ----- | ------------ | --------------------- |
| 1   | Recherche     | Y   | `titre`           | TEXT  | Texte        | **Index GIN à créer** |
| 2   | Niveau        | N   | via eval_tae->tae | INT   | Select       | RPC nécessaire        |
| 3   | Discipline    | N   | via eval_tae->tae | INT   | Select       | RPC nécessaire        |
| 4   | Nb tâches     | N   | COUNT(eval_tae)   | —     | Plage        |                       |
| 5   | Connaissances | N   | via eval_tae->tae | INT[] | Multi-select |                       |
| 6   | Auteur        | N   | `auteur_id`       | UUID  | Autocomplete | Index existe          |

### 2.3 Types de configuration — Discriminés par entité

```typescript
type BaseFacetConfig = {
  key: string;
  label: string;
  type: FacetType;
  visibleWhen?: (filters: SearchParams) => boolean;
};

type ScalarFacet = BaseFacetConfig & { dbType: "scalar"; column: string; operator: "eq" | "in" };
type ArrayFacet = BaseFacetConfig & {
  dbType: "array";
  column: string;
  operator: "contains" | "overlaps";
};
type JoinedFacet = BaseFacetConfig & { dbType: "joined"; joinTable: string; joinColumn: string };
type CascadedFacet = BaseFacetConfig & { dbType: "scalar"; column: string; dependsOn: string };

type TacheFacetConfig = ScalarFacet | ArrayFacet | CascadedFacet;
type DocumentFacetConfig = ScalarFacet | ArrayFacet;
type EvaluationFacetConfig = ScalarFacet | ArrayFacet | JoinedFacet;
```

### 2.4 Sémantique des opérateurs

| Facette           | Opérateur         | Sémantique                               | Raison                        |
| ----------------- | ----------------- | ---------------------------------------- | ----------------------------- |
| Aspects           | `.contains()` AND | Ressource couvre TOUS les aspects cochés | Décision produit              |
| Connaissances     | `.overlaps()` OR  | Au moins UNE connaissance                | Découvrabilité (100+ options) |
| Discipline (docs) | `.contains()` AND | Couvre TOUTES les disciplines            | Multi-discipline rare         |
| Cat. icono/text   | `.in()` OR        | Au moins une catégorie                   | Découvrabilité                |

### 2.5 Matrice et règles de changement d'onglet

Facettes communes (préservées au switch) : Recherche, Niveau, Discipline, Connaissances, Auteur, Aspects, Tri.

Facettes spécifiques (effacées au switch) : OI, Comportement, CD, École, Type, Catégories, Année, Nb tâches, etc.

---

## 3. Architecture technique

### 3.1 Sérialisation URL

```
/bank?onglet=taches&q=revolution&niveau=3&discipline=1&oi=OI1&aspects=economique,politique&tri=recent&page=0
```

- IDs réels de la DB (pas de slugs)
- Multi-valeurs CSV, **triées et dédupliquées** (canonicalisation)
- Page **base-0** (UI affiche page+1)

```typescript
// lib/search/normalize.ts
export function normalizeArray(values: (string | number)[]): (string | number)[] {
  return [...new Set(values)].sort((a, b) => String(a).localeCompare(String(b), "fr"));
}
```

#### Schéma Zod (CSV strict, refine exclusion mutuelle)

```typescript
// lib/schemas/search-params.ts
const csvInt = z.string().transform((s, ctx) => {
  const parts = s.split(",").filter(Boolean);
  const numbers: number[] = [];
  for (const part of parts) {
    const num = Number(part);
    if (isNaN(num) || !Number.isInteger(num)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Valeur invalide: ${part}` });
      return z.NEVER;
    }
    numbers.push(num);
  }
  return numbers;
});

const baseSearchParamsSchema = z.object({
  onglet: z.enum(["taches", "documents", "evaluations"]).default("taches"),
  q: z.string().trim().optional(),
  niveau: csvInt.optional(),
  discipline: csvInt.optional(),
  connaissances: csvInt.optional(),
  auteur: z.string().uuid().optional(),
  tri: z.enum(["recent", "populaire"]).default("recent"),
  page: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(10).max(50).default(20),
});

// Extensions par entité avec discriminatedUnion sur `onglet`
// Documents : .refine() pour exclusion mutuelle type/catégorie
```

#### Hook URL (avec useOptimistic + invalidation cascadée)

```typescript
// hooks/partagees/use-search-params-state.ts

const DEPENDENCY_MAP: Record<string, string[]> = {
  oi: ["comportement"],
  type: ["cat_icono", "cat_text"],
};

const COMMON_KEYS = ["q", "niveau", "discipline", "connaissances", "auteur", "tri", "aspects"];
```

Le hook expose : `filters` (optimiste), `isPending`, `setFilters` (avec cascade atomique), `clearAll`, `switchTab`.

#### Migration form : approche hybride

Form `method="get"` conservé comme fallback no-JS. Avec JS : `onSubmit` intercepté + `router.push`.

### 3.2 Query Builder (appliers modulaires)

```typescript
// lib/search/escape-pattern.ts
export function escapeIlikePattern(input: string): string {
  return "%" + input.replace(/[%_\\]/g, (char) => "\\" + char) + "%";
}
```

Pipelines par entité avec appliers composables + **sort applier séparé** :

```typescript
const tachesSortApplier = createSortApplier<TachesSearchParams>({
  popularityColumn: "bank_popularity_score",
  defaultColumn: "updated_at",
});
```

### 3.3 Exécution serveur — Hybride encapsulé

**Décision finale** : PostgREST par défaut, RPC par exception, derrière une façade `SearchClient`.

```typescript
// lib/search/search-client.ts
type SearchResult<T> = { results: T[]; total: number };

interface SearchClient<TParams, TResult> {
  search(params: TParams): Promise<SearchResult<TResult>>;
}

export const searchClients = {
  taches: new PostgRESTSearchClient("banque_tae", tachesPipeline, tachesSortApplier),
  documents: new PostgRESTSearchClient("documents", documentsPipeline, documentsSortApplier),
  evaluations: new RpcSearchClient("search_evaluations", mapEvalParams),
};

export async function fetchBankResults(filters: SearchParams) {
  return searchClients[filters.onglet].search(filters);
}
```

**Règle** : RPC uniquement si jointures complexes, compteurs facet exclusion, ou FTS avancé futur.

#### RPC épreuves (filtres AVANT agrégation)

```sql
WITH
filtered_tae AS (
  SELECT et.evaluation_id, t.niveau_id, t.discipline_id, t.connaissances_ids
  FROM evaluation_tae et
  JOIN tae t ON t.id = et.tae_id AND t.is_published = TRUE
  WHERE (p_niveaux IS NULL OR t.niveau_id = ANY(p_niveaux))
    AND (p_disciplines IS NULL OR t.discipline_id = ANY(p_disciplines))
    AND (p_connaissances IS NULL OR t.connaissances_ids && p_connaissances)
),
eval_agg AS (
  SELECT ft.evaluation_id, COUNT(*) AS nb_taches, ...
  FROM filtered_tae ft GROUP BY ft.evaluation_id
),
filtered AS (
  SELECT e.*, ea.nb_taches FROM evaluations e
  JOIN eval_agg ea ON ea.evaluation_id = e.id
  WHERE e.is_published = TRUE AND ...
)
```

### 3.4 Server Component

```typescript
// app/(app)/bank/page.tsx
const [results, tabCounts] = await Promise.all([
  fetchBankResults(filters),
  fetchTabCounts(filters),  // COUNT par entité avec filtres communs
]);
return <BankShell filters={filters} results={results} tabCounts={tabCounts} />;
```

---

## 4. Composants UI

### 4.1 Arbre

```
BankPage (Server) -> BankShell (Client)
  -> SearchBar (debounce useDebouncedValue)
  -> BankOnglets (modifier pour compteurs)
  -> ActiveFiltersBar (pills + "Tout effacer")
  -> FacetPanel (panneau latéral / drawer)
     -> FacetSection x N (collapsible)
        -> FacetSingleSelect / MultiSelect / CascadedSelect / etc.
  -> ResultsList + ResultCard
  -> Pagination (affiche page+1, URL base-0)
```

### 4.2 État : hook partagé

Chaque widget appelle `useSearchParamsState()` directement. Pas de Context, pas de prop drilling. Invalidation cascadée atomique dans `setFilters`.

### 4.3 Responsive

- Desktop : panneau latéral permanent
- Tablette : panneau togglable
- Mobile : **drawer simple** (SimpleModal), pas de bottom sheet

### 4.4 Longueur URL

Avec 100+ connaissances, l'URL peut dépasser 2000 chars. Monitoring requis. Compression future si nécessaire.

---

## 5. Compteurs — Progressive

### Phase 1 : Zéro compteur (focus UX filtrage)

### Phase 2 : Compteurs par onglet (COUNT parallèle)

### Phase 3 : Compteurs dynamiques par facette (CTE + facet exclusion)

Contrat unifié :

```typescript
type SearchResultWithFacets<T> = {
  results: T[];
  total: number;
  facetCounts?: Record<string, Record<string, number>>;
};
```

Seuil : si > 200ms P95 pendant 7 jours, envisager materialized view.

---

## 6. Performance

| Métrique             | Budget        |
| -------------------- | ------------- |
| Réponse serveur      | < 200ms P95   |
| Time to first result | < 100ms perçu |
| Recherche (debounce) | < 500ms       |

Index à créer :

```sql
CREATE INDEX idx_evaluations_titre_trgm ON evaluations USING GIN(titre gin_trgm_ops);
CREATE INDEX idx_evaluations_published ON evaluations(is_published) WHERE is_published = TRUE;
```

Pré-requis : `npm run gen:types` pour colonnes manquantes.

---

## 7. Tests — 60/25/15

- **60% unit** : Zod, escapeIlikePattern, normalizeArray, appliers, countActiveFilters
- **25% intégration** : pipelines + RPCs
- **15% E2E** : 7 scénarios (recherche, facette, switch tab, clear, back, URL share, mobile drawer)

---

## 8. Décisions finales

| #    | Décision        | Choix                                   |
| ---- | --------------- | --------------------------------------- |
| D-01 | Source vérité   | URL searchParams                        |
| D-02 | Exécution       | Hybride encapsulé (SearchClient facade) |
| D-03 | Compteurs       | Progressive 3 phases                    |
| D-04 | Validation      | Zod discriminatedUnion strict + refine  |
| D-05 | Recherche texte | ILIKE + GIN trigram                     |
| D-06 | IDs URL         | IDs réels DB                            |
| D-07 | Pagination      | Base-0, UI affiche +1                   |
| D-08 | Aspects         | AND (.contains())                       |
| D-09 | Cascade         | Atomique via DEPENDENCY_MAP             |
| D-10 | Optimistic      | useOptimistic                           |
| D-11 | URL canon       | Arrays triés + dédupliqués              |
| D-12 | FacetConfig     | Types discriminés par entité            |
| D-13 | Contrat retour  | SearchResult<T> unifié                  |
| D-14 | Mobile          | Drawer simple (SimpleModal)             |
| D-15 | Migration form  | Hybride (fallback no-JS)                |
| D-16 | Saved searches  | Différé post-MVP                        |
| D-17 | RPC épreuves    | Filtres AVANT agrégation                |
| D-18 | Tri             | Sort applier séparé                     |
| D-19 | Switch tab      | aspects dans COMMON_KEYS                |
| D-20 | Sémantique      | Documentée par facette (§2.4)           |

---

## 9. Checklist

### Phase 1 — Fondations (sem 1-2)

- [ ] `npm run gen:types`
- [ ] Zod schema `lib/schemas/search-params.ts`
- [ ] `escapeIlikePattern`, `normalizeArray`
- [ ] Hook `use-search-params-state` (useOptimistic, DEPENDENCY_MAP)
- [ ] `BankShell`, `ActiveFiltersBar`, `SearchBar`
- [ ] Modifier `BankOnglets` pour compteurs

### Phase 2 — Query builder + filtres (sem 2-3)

- [ ] Types discriminés `lib/search/facet-types.ts`
- [ ] Pipelines `lib/search/appliers.ts`
- [ ] Facade `lib/search/search-client.ts`
- [ ] Refactorer bank-tasks.ts, bank-documents.ts
- [ ] Index GIN evaluations.titre + RPC search_evaluations
- [ ] Quick wins : categorie_textuelle, source_type, auteur
- [ ] Migration cat_icono JS -> SQL

### Phase 3 — Widgets facettes (sem 3-4)

- [ ] Registre, SingleSelect, MultiSelect, CascadedSelect, HierarchicalSelect, Range, Autocomplete

### Phase 4 — Compteurs (sem 4-5)

- [ ] Compteurs par onglet
- [ ] RPCs count_facets (CTE facet exclusion)

### Phase 5 — Polish (sem 5-6)

- [ ] Tests Vitest + Playwright
- [ ] Accessibilité, performance, mobile QA

---

## 10. Arbre de fichiers cible

```
app/(app)/bank/page.tsx                    <- modifier
components/bank/bank-shell.tsx             <- créer
components/bank/active-filters-bar.tsx     <- créer
components/bank/mobile-facet-drawer.tsx    <- créer
components/bank/facet-panel/*.tsx           <- créer (7 fichiers)
hooks/partagees/use-search-params-state.ts <- créer
lib/schemas/search-params.ts               <- créer
lib/search/facet-types.ts                  <- créer
lib/search/appliers.ts                     <- créer
lib/search/search-client.ts                <- créer
lib/search/escape-pattern.ts               <- créer
lib/search/normalize.ts                    <- créer
lib/search/facet-registry.ts               <- créer
lib/queries/tab-counts.ts                  <- créer
supabase/migrations/xxx_search_evaluations.sql <- créer
supabase/migrations/xxx_evaluations_indexes.sql <- créer
```

Fichiers existants à refactorer : `bank-tasks.ts` (350 LOC), `bank-documents.ts` (280 LOC), `bank-evaluations.ts` (140 LOC), `BankTaskFilters.tsx` (220 LOC -> remplacer), `BankOnglets.tsx` (39 LOC -> modifier).

---

## 11. Corrections intégrées (v0.2 -> v0.3)

| #   | Correction                             | Source               |
| --- | -------------------------------------- | -------------------- |
| 1   | Race condition -> useOptimistic        | DeepSeek             |
| 2   | escapeIlikePattern documenté           | DeepSeek             |
| 3   | Sort applier séparé                    | DeepSeek             |
| 4   | RPC filtres AVANT agrégation           | DeepSeek+Gemini+Kimi |
| 5   | CSV parsing strict                     | DeepSeek             |
| 6   | Canonicalisation URLs                  | ChatGPT              |
| 7   | setFilters tab-aware                   | ChatGPT              |
| 8   | Cascade atomique DEPENDENCY_MAP        | Consensus            |
| 9   | SearchResult<T> unifié                 | ChatGPT+Grok         |
| 10  | Exclusion mutuelle .refine()           | Kimi                 |
| 11  | Longueur URL monitoring                | Kimi                 |
| 12  | aspects dans COMMON_KEYS               | DeepSeek             |
| 13  | Normalisation accents (futur)          | Gemini               |
| 14  | Page base-0 confirmé                   | Consensus            |
| 15  | AND pour aspects                       | Décision humaine     |
| 16  | Hybride encapsulé SearchClient         | Consensus            |
| 17  | Types discriminés par entité           | Consensus            |
| 18  | Drawer simple                          | Consensus            |
| 19  | Migration form hybride                 | Consensus            |
| 20  | Sémantique documentée par facette      | Gemini v2            |
| 21  | int4range pour périodes (futur)        | Gemini v1            |
| 22  | Compteurs onglets avec filtres communs | DeepSeek             |

_Fin — SPEC v0.3 finale. 20 décisions, 22 corrections. Prêt pour Claude Code._
