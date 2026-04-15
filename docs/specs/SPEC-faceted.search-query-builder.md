# Spécification technique — Faceted Search Query Builder

## Banque collective de ressources pédagogiques en univers social

**Version** : 0.1-draft
**Statut** : Pré-RFC — soumis pour revue multi-agents
**Date** : 2026-04-15
**Auteur** : Spec générée collaborativement, à enrichir par revue collective

---

## 0. Protocole de revue multi-agents

Ce document est conçu pour être soumis à **6 agents IA spécialisés** en revue parallèle. Chaque agent doit produire une réponse structurée en trois blocs :

### Instructions aux agents reviewers

```
Vous recevez une spécification technique pour un Faceted Search Query Builder.
Votre rôle est triple :

BLOC 1 — CRITIQUE (obligatoire)
Identifiez les failles, ambiguïtés, contradictions, cas limites non couverts,
et erreurs architecturales. Soyez impitoyable. Chaque faiblesse non détectée
deviendra un bug en production.

BLOC 2 — ENRICHISSEMENT (obligatoire)
Proposez des améliorations concrètes avec du pseudo-code ou des signatures
de type. Ne restez pas dans l'abstrait — montrez le code.

BLOC 3 — QUESTIONS OUVERTES (obligatoire)
Répondez aux questions balisées [QUESTION-AGENT-xx] qui vous sont posées
dans le document. Argumentez votre position.
```

### Questions ciblées pour les agents

Les questions suivantes sont disséminées dans le document aux endroits pertinents. Elles sont aussi indexées ici pour référence :

| ID    | Section | Question                                                                                                                    |
| ----- | ------- | --------------------------------------------------------------------------------------------------------------------------- |
| QA-01 | §2.2    | Faut-il un type discriminé par entité ou un type union générique pour `FacetConfig` ?                                       |
| QA-02 | §3.1    | La sérialisation URL devrait-elle utiliser un format custom compact ou un standard comme SCIM/OData filter syntax ?         |
| QA-03 | §3.3    | Vaut-il mieux une seule RPC Supabase polymorphe ou une RPC par entité ?                                                     |
| QA-04 | §4.1    | Le panneau de facettes devrait-il être un composant contrôlé (état remonté) ou non-contrôlé (état interne + callbacks) ?    |
| QA-05 | §5.1    | Quelle stratégie de cache pour les compteurs de facettes — SWR, React Query, ou cache serveur Next.js ?                     |
| QA-06 | §5.3    | Faut-il pré-calculer les compteurs dans une materialized view ou les calculer à la volée ?                                  |
| QA-07 | §6.1    | Comment gérer le cas où un filtre cascadé (ex: Comportement dépend de OI) produit un état invalide quand le parent change ? |
| QA-08 | §7.1    | Quelle approche pour le responsive — panneau latéral qui devient bottom sheet, ou drawer plein écran ?                      |
| QA-09 | §8.1    | Quel niveau de test est raisonnable — tester le query builder en isolation (unit) ou en intégration avec Supabase ?         |
| QA-10 | §9.1    | Faut-il un système de "saved searches" / filtres favoris dès le MVP, ou le différer ?                                       |

---

## 1. Contexte et vision produit

### 1.1 Le problème

La banque collective contient des ressources pédagogiques en univers social (Histoire, Géographie, Éducation à la citoyenneté) créées par des enseignants du secondaire au Québec. Trois types de contenus coexistent : les **Tâches** (TAÉ — Tâches d'Apprentissage et d'Évaluation), les **Documents historiques**, et les **Épreuves** (compositions d'évaluation).

Chaque type a entre 6 et 12 dimensions filtrables. Les enseignants doivent pouvoir trouver rapidement la bonne ressource parmi des centaines, en combinant des filtres de nature variée : taxonomiques (hiérarchiques à 3-4 niveaux), catégoriels (enum), textuels (recherche plein texte), numériques (plages), et relationnels (dérivés via jointures).

### 1.2 Ce qui existe aujourd'hui

- **Tâches** : 9/12 filtres implémentés (le plus avancé)
- **Documents** : 5/11 filtres implémentés
- **Épreuves** : 1/6 filtres implémentés
- L'infrastructure DB (colonnes, index GIN) existe déjà pour la plupart des filtres manquants
- Le travail est principalement UI + construction de requêtes

### 1.3 Ce qu'on construit

Un **Faceted Search Query Builder** unifié qui :

1. Expose un système de filtres à facettes avec compteurs dynamiques pour les trois types d'entités
2. Partage une base commune de facettes (Niveau, Discipline, Recherche texte, Auteur, Connaissances) tout en supportant des facettes spécifiques par entité
3. Synchronise l'état des filtres dans l'URL (shareable, bookmarkable)
4. Offre une UX fluide desktop et mobile avec un panneau latéral togglable (desktop) et un bottom sheet (mobile)
5. Affiche des compteurs de facettes dynamiques (recalculés selon les filtres actifs) avec le total absolu entre parenthèses

### 1.4 Stack technique

| Couche          | Technologie                                             |
| --------------- | ------------------------------------------------------- |
| Framework       | Next.js (App Router, Server Components, Server Actions) |
| Langage         | TypeScript (strict)                                     |
| Base de données | Supabase (PostgreSQL, RLS, RPC)                         |
| Auth            | Supabase Auth                                           |
| Styles          | Tailwind CSS (tokens custom, police Manrope)            |
| Validation      | Zod                                                     |
| Icônes          | Material Symbols (Outlined)                             |
| Tests           | Vitest (unitaires), Playwright (E2E)                    |

**Architecture serveur** : Pas de backend séparé. Les lectures passent par des Server Components (requêtes Supabase directes dans des fichiers `queries/`), les écritures par des Server Actions (`"use server"` dans `actions/`). Les Route Handlers (`api/`) sont réservés aux cas nécessitant un `AbortController` (ex: autocomplete avec annulation).

---

## 2. Modèle de données — Facettes

### 2.1 Inventaire complet des facettes par entité

#### Tâches (TAÉ) — 12 dimensions

| #   | Facette                  | Statut | Colonne DB                             | Type UI             | Cardinalité        | Notes                                                |
| --- | ------------------------ | ------ | -------------------------------------- | ------------------- | ------------------ | ---------------------------------------------------- |
| 1   | Recherche (consigne)     | ✅     | `consigne_search_plain` (GIN)          | Texte libre         | —                  | Full-text search                                     |
| 2   | Opération intellectuelle | ✅     | `oi_id`                                | Select              | 8 (6 actives)      | FK → `operations_intellectuelles`                    |
| 3   | Comportement attendu     | ✅     | `comportement_id`                      | Select cascadé      | ≤5 par OI          | **Dépend de OI**                                     |
| 4   | Niveau                   | ✅     | `niveau_id`                            | Select              | 4 (sec1–sec4)      | Facette commune                                      |
| 5   | Discipline               | ✅     | `discipline_id`                        | Select              | 3 (HEC, GEO, HQC)  | Facette commune                                      |
| 6   | Compétence disciplinaire | ✅     | `cd_id`                                | Select hiérarchique | 50+ (3 niveaux)    | Arbre taxonomique                                    |
| 7   | Aspects de société       | ✅     | `aspects_societe[]` (GIN)              | Multi-checkbox      | 5                  | Économique, Politique, Social, Culturel, Territorial |
| 8   | Connaissances            | ✅     | `connaissances_ids[]` (GIN)            | Multi-select        | 100+ (3-4 niveaux) | Facette commune, hiérarchique                        |
| 9   | Tri                      | ✅     | `bank_popularity_score` / `updated_at` | Radio               | 2                  | Récent / Populaire                                   |
| 10  | Auteur                   | ❌     | `auteur_id`                            | Autocomplete        | N (profils actifs) | Facette commune                                      |
| 11  | École / CSS              | ❌     | via `profiles.school_id`               | Select cascadé      | ~3000              | Jointure via profil                                  |
| 12  | Nombre de documents      | ❌     | via `comportement.nb_documents`        | Select              | 4 (1,2,3,4)        | Dérivé                                               |

#### Documents historiques — 11 dimensions

| #   | Facette                  | Statut | Colonne DB                            | Type UI        | Cardinalité | Notes                          |
| --- | ------------------------ | ------ | ------------------------------------- | -------------- | ----------- | ------------------------------ |
| 1   | Recherche (titre)        | ✅     | `titre` (ILIKE)                       | Texte libre    | —           | Pourrait migrer vers GIN       |
| 2   | Discipline               | ✅     | `disciplines_ids[]` (GIN)             | Select         | 3           | Array, facette commune         |
| 3   | Niveau                   | ✅     | `niveaux_ids[]` (GIN)                 | Select         | 4           | Array, facette commune         |
| 4   | Type                     | ✅     | `type`                                | Select         | 2           | Textuel / Iconographique       |
| 5   | Catégorie iconographique | ✅     | `elements[].categorie_iconographique` | Multi-checkbox | 8           | Conditionnel (si type=Icono)   |
| 6   | Catégorie textuelle      | ❌     | `elements[].categorie_textuelle`      | Multi-checkbox | 8           | Conditionnel (si type=Textuel) |
| 7   | Type de source           | ❌     | `elements[].source_type`              | Select         | 2           | Primaire / Secondaire          |
| 8   | Aspects de société       | ❌     | `aspects_societe[]` (GIN)             | Multi-checkbox | 5           | Hérités de la TAÉ              |
| 9   | Connaissances            | ❌     | `connaissances_ids[]` (GIN)           | Multi-select   | 100+        | Facette commune                |
| 10  | Repère temporel / Année  | ❌     | `repere_temporel`, `annee_normalisee` | Plage / texte  | —           | Range filter                   |
| 11  | Auteur                   | ❌     | `auteur_id`                           | Autocomplete   | N           | Facette commune                |

#### Épreuves — 6 dimensions

| #   | Facette           | Statut | Colonne DB                                     | Type UI      | Cardinalité | Notes                             |
| --- | ----------------- | ------ | ---------------------------------------------- | ------------ | ----------- | --------------------------------- |
| 1   | Recherche (titre) | ✅     | `titre` (ILIKE)                                | Texte libre  | —           |                                   |
| 2   | Niveau            | ❌     | via `evaluation_tae → tae.niveau_id`           | Select       | 4           | Jointure, facette commune         |
| 3   | Discipline        | ❌     | via `evaluation_tae → tae.discipline_id`       | Select       | 3           | Jointure, facette commune         |
| 4   | Nombre de tâches  | ❌     | `COUNT(evaluation_tae)`                        | Plage        | —           | Agrégat                           |
| 5   | Connaissances     | ❌     | via `evaluation_tae → tae.connaissances_ids[]` | Multi-select | 100+        | Jointure + array, facette commune |
| 6   | Auteur            | ❌     | `auteur_id`                                    | Autocomplete | N           | Facette commune                   |

### 2.2 Taxonomie des types de facettes

Chaque facette dans le système appartient à l'un de ces types fondamentaux :

```typescript
/**
 * Les 7 types de facettes du système.
 * Chaque type détermine : le widget UI, la sérialisation URL,
 * la clause SQL générée, et le calcul des compteurs.
 */
type FacetType =
  | "text_search" // Recherche plein texte (GIN tsvector ou ILIKE)
  | "single_select" // Un seul choix parmi N (ex: Discipline)
  | "multi_select" // Plusieurs choix parmi N (ex: Aspects de société)
  | "cascaded_select" // Select dont les options dépendent d'un parent (ex: Comportement → OI)
  | "hierarchical_select" // Arbre à N niveaux avec sélection à tout niveau (ex: Connaissances)
  | "range" // Plage numérique min/max (ex: Année, Nombre de tâches)
  | "sort"; // Tri (pas un vrai filtre, mais participe au query builder)
```

> **[QUESTION-AGENT-01]** : Faut-il modéliser `FacetConfig` comme un type discriminé par entité (un type `TaskFacetConfig`, `DocumentFacetConfig`, `EpreuveFacetConfig` distincts) ou comme un type union générique `FacetConfig<TEntity>` ? Le type discriminé offre plus de sécurité statique mais duplique de la structure. Le générique est DRY mais peut masquer des divergences métier. Argumentez avec des exemples de code.

### 2.3 Matrice entité × facettes (facettes communes vs spécifiques)

```
                        Tâches    Documents    Épreuves
                        ──────    ─────────    ────────
COMMUNES
  Recherche texte         ✓           ✓           ✓
  Niveau                  ✓           ✓           ✓ (dérivé)
  Discipline              ✓           ✓           ✓ (dérivé)
  Connaissances           ✓           ✓           ✓ (dérivé)
  Auteur                  ✓           ✓           ✓
  Tri                     ✓           ✓           ✓

SPÉCIFIQUES
  Opération intell.       ✓
  Comportement attendu    ✓
  Compétence discip.      ✓
  Aspects de société      ✓           ✓
  École / CSS             ✓
  Nb documents            ✓
  Type (Text/Icono)                   ✓
  Catég. iconographique               ✓
  Catég. textuelle                    ✓
  Type de source                      ✓
  Repère temporel                     ✓
  Nb tâches                                       ✓
```

**Règle clé** : Quand l'utilisateur change d'onglet (Tâches → Documents → Épreuves), les valeurs des facettes communes sont **préservées**, et les facettes spécifiques sont **réinitialisées** (ou masquées, pas détruites — voir §4.3 pour la stratégie UX).

---

## 3. Architecture technique

### 3.1 Couche 1 — Sérialisation URL (State ↔ URL)

L'état des filtres vit dans les `searchParams` de l'URL. C'est la source de vérité. Avantages : partageabilité, bouton retour du navigateur, deep linking, SSR au premier rendu.

#### Format de sérialisation

```
/banque?tab=taches&q=revolution&niveau=sec3,sec4&discipline=hec&oi=2&aspects=eco,pol&tri=recent&page=1
```

**Conventions** :

| Règle                                             | Exemple                                 |
| ------------------------------------------------- | --------------------------------------- |
| Multi-valeurs séparées par virgule                | `niveau=sec3,sec4`                      |
| Clés courtes, stables, lisibles                   | `q`, `oi`, `cd`, `asp`, `conn`          |
| Valeurs = slugs (pas d'IDs numériques dans l'URL) | `discipline=hec` (pas `discipline=3`)   |
| Absence = pas de filtre actif                     | Pas de `niveau=` → pas de filtre niveau |
| Tab = type d'entité active                        | `tab=taches\|documents\|epreuves`       |
| Range = tiret                                     | `annee=1850-1920`                       |
| Hierarchique = dot notation                       | `conn=theme1.sous-theme2`               |

> **[QUESTION-AGENT-02]** : Cette sérialisation custom est lisible et compacte, mais ne suit aucun standard. Faut-il adopter un format existant (subset d'OData `$filter`, SCIM filter, Lucene query syntax) pour la compatibilité future (API publique, intégrations) ? Ou le gain de lisibilité/compacité justifie-t-il le format custom ? Considérez aussi l'impact sur le parsing (Zod schema) et l'évolution du système.

#### Schéma Zod de validation

```typescript
// schemas/search-params.ts
import { z } from "zod";

const csvString = z.string().transform((s) => s.split(",").filter(Boolean));
const optionalCsv = csvString.optional();

/**
 * Schéma commun à toutes les entités.
 * Les facettes spécifiques sont ajoutées par extension (.merge / .extend).
 */
const baseSearchParamsSchema = z.object({
  tab: z.enum(["taches", "documents", "epreuves"]).default("taches"),
  q: z.string().optional(),
  niveau: optionalCsv,
  discipline: optionalCsv,
  connaissances: optionalCsv,
  auteur: z.string().optional(),
  tri: z.enum(["recent", "populaire"]).default("recent"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(10).max(50).default(20),
});

const tachesSearchParamsSchema = baseSearchParamsSchema.extend({
  tab: z.literal("taches"),
  oi: z.string().optional(), // Opération intellectuelle (slug)
  comportement: z.string().optional(), // Comportement attendu
  cd: z.string().optional(), // Compétence disciplinaire
  aspects: optionalCsv, // Aspects de société
  ecole: z.string().optional(), // École / CSS
  nb_docs: z.coerce.number().int().optional(), // Nombre de documents
});

const documentsSearchParamsSchema = baseSearchParamsSchema.extend({
  tab: z.literal("documents"),
  type: z.enum(["textuel", "iconographique"]).optional(),
  cat_icono: optionalCsv,
  cat_text: optionalCsv,
  source_type: z.enum(["primaire", "secondaire"]).optional(),
  aspects: optionalCsv,
  annee_min: z.coerce.number().int().optional(),
  annee_max: z.coerce.number().int().optional(),
});

const epreuvesSearchParamsSchema = baseSearchParamsSchema.extend({
  tab: z.literal("epreuves"),
  nb_taches_min: z.coerce.number().int().optional(),
  nb_taches_max: z.coerce.number().int().optional(),
});

/**
 * Schema discriminé — le parsing sélectionne automatiquement
 * le bon schema selon la valeur de `tab`.
 */
export const searchParamsSchema = z.discriminatedUnion("tab", [
  tachesSearchParamsSchema,
  documentsSearchParamsSchema,
  epreuvesSearchParamsSchema,
]);

export type SearchParams = z.infer<typeof searchParamsSchema>;
export type TachesSearchParams = z.infer<typeof tachesSearchParamsSchema>;
export type DocumentsSearchParams = z.infer<typeof documentsSearchParamsSchema>;
export type EpreuvesSearchParams = z.infer<typeof epreuvesSearchParamsSchema>;
```

#### Hook de synchronisation URL ↔ State

```typescript
// hooks/use-search-params-state.ts
"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo, useTransition } from "react";
import { searchParamsSchema, type SearchParams } from "@/schemas/search-params";

/**
 * Hook central — source de vérité pour l'état des filtres.
 *
 * Design decisions :
 * - L'URL est la source de vérité (pas un useState)
 * - useTransition pour ne pas bloquer l'UI pendant la navigation
 * - Le parsing Zod valide + fournit les defaults à chaque lecture
 * - Les updates sont mergées (pas de remplacement total)
 */
export function useSearchParamsState() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // Parse les params actuels avec validation + defaults
  const currentFilters = useMemo(() => {
    const raw = Object.fromEntries(searchParams.entries());
    const result = searchParamsSchema.safeParse(raw);
    if (result.success) return result.data;
    // Fallback : params par défaut si l'URL est corrompue
    return searchParamsSchema.parse({ tab: "taches" });
  }, [searchParams]);

  // Met à jour un ou plusieurs filtres
  const setFilters = useCallback(
    (updates: Partial<SearchParams>) => {
      startTransition(() => {
        const next = new URLSearchParams(searchParams.toString());

        for (const [key, value] of Object.entries(updates)) {
          if (value === undefined || value === null || value === "") {
            next.delete(key);
          } else if (Array.isArray(value)) {
            if (value.length === 0) next.delete(key);
            else next.set(key, value.join(","));
          } else {
            next.set(key, String(value));
          }
        }

        // Reset pagination quand un filtre change (sauf si c'est juste la page)
        if (!("page" in updates)) {
          next.delete("page");
        }

        router.push(`${pathname}?${next.toString()}`, { scroll: false });
      });
    },
    [searchParams, router, pathname],
  );

  // Réinitialise tout (sauf le tab)
  const clearAll = useCallback(() => {
    startTransition(() => {
      const tab = searchParams.get("tab") || "taches";
      router.push(`${pathname}?tab=${tab}`, { scroll: false });
    });
  }, [searchParams, router, pathname]);

  // Change de tab en préservant les facettes communes
  const switchTab = useCallback(
    (newTab: SearchParams["tab"]) => {
      startTransition(() => {
        const next = new URLSearchParams();
        next.set("tab", newTab);
        // Préserver les facettes communes
        const commonKeys = ["q", "niveau", "discipline", "connaissances", "auteur", "tri"];
        for (const key of commonKeys) {
          const val = searchParams.get(key);
          if (val) next.set(key, val);
        }
        // Les facettes spécifiques de l'ancien tab disparaissent naturellement
        router.push(`${pathname}?${next.toString()}`, { scroll: false });
      });
    },
    [searchParams, router, pathname],
  );

  return {
    filters: currentFilters,
    isPending,
    setFilters,
    clearAll,
    switchTab,
    // Helpers
    hasActiveFilters: searchParams.toString() !== `tab=${currentFilters.tab}`,
    activeFilterCount: countActiveFilters(currentFilters),
  };
}

function countActiveFilters(filters: SearchParams): number {
  let count = 0;
  for (const [key, value] of Object.entries(filters)) {
    if (["tab", "tri", "page", "limit"].includes(key)) continue;
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value) && value.length === 0) continue;
    count++;
  }
  return count;
}
```

### 3.2 Couche 2 — Query Builder (Filtres → SQL)

Le query builder traduit un objet `SearchParams` validé en une requête Supabase. C'est le cœur du système.

#### Principes d'architecture

1. **Composable** : chaque facette contribue indépendamment une clause WHERE. Les clauses sont combinées par AND.
2. **Type-safe** : le builder est paramétré par le type d'entité, empêchant l'application d'un filtre de tâche sur une requête de document.
3. **Testable** : chaque "applier" de facette est une fonction pure, testable en isolation.
4. **Extensible** : ajouter une nouvelle facette = ajouter un applier + un schéma URL + un composant UI.

```typescript
// lib/search/query-builder.ts

import { SupabaseClient } from "@supabase/supabase-js";
import type { SearchParams, TachesSearchParams } from "@/schemas/search-params";

/**
 * Un FacetApplier prend une query Supabase et un jeu de filtres,
 * et retourne la query avec la clause WHERE ajoutée.
 *
 * Convention : si la valeur du filtre est absente/vide, le applier
 * retourne la query inchangée (no-op).
 */
type FacetApplier<TParams extends SearchParams> = (
  query: any, // PostgrestFilterBuilder — le type exact dépend de la table
  filters: TParams,
) => any;

// ─── Appliers communs ────────────────────────────────────────────

const applyTextSearch: FacetApplier<SearchParams> = (query, filters) => {
  if (!filters.q) return query;
  // Décision : utiliser plainto_tsquery pour la tolérance aux erreurs
  // plutôt que to_tsquery qui exige une syntaxe stricte
  return query.textSearch("consigne_search_plain", filters.q, {
    type: "plain",
    config: "french",
  });
};

const applyNiveau: FacetApplier<SearchParams> = (query, filters) => {
  if (!filters.niveau?.length) return query;
  // Tâches : colonne scalaire niveau_id
  // Documents : colonne array niveaux_ids[]
  // → L'applier est surchargé par entité si nécessaire
  return query.in("niveau_id", filters.niveau);
};

const applyDiscipline: FacetApplier<SearchParams> = (query, filters) => {
  if (!filters.discipline?.length) return query;
  return query.in("discipline_id", filters.discipline);
};

const applyConnaissances: FacetApplier<SearchParams> = (query, filters) => {
  if (!filters.connaissances?.length) return query;
  // GIN index sur array — utiliser l'opérateur overlap (&&)
  return query.overlaps("connaissances_ids", filters.connaissances);
};

// ─── Appliers spécifiques Tâches ────────────────────────────────

const applyOI: FacetApplier<TachesSearchParams> = (query, filters) => {
  if (!filters.oi) return query;
  return query.eq("oi_id", filters.oi);
};

const applyComportement: FacetApplier<TachesSearchParams> = (query, filters) => {
  if (!filters.comportement) return query;
  return query.eq("comportement_id", filters.comportement);
};

const applyAspects: FacetApplier<TachesSearchParams> = (query, filters) => {
  if (!filters.aspects?.length) return query;
  // Sémantique : AND (la tâche couvre TOUS les aspects sélectionnés)
  // ou OR (la tâche couvre AU MOINS UN aspect) ?
  // → Choix : OR (overlap) pour la découvrabilité, AND (contains) pour la précision
  // → Recommandation : OR par défaut, avec toggle AND en UX avancée
  return query.overlaps("aspects_societe", filters.aspects);
};

// ─── Registry par entité ────────────────────────────────────────

/**
 * Pipeline ordonné d'appliers pour chaque entité.
 * L'ordre n'affecte pas le résultat SQL (AND commutatif)
 * mais affecte la lisibilité du query plan dans les logs.
 */
const TACHES_PIPELINE: FacetApplier<TachesSearchParams>[] = [
  applyTextSearch,
  applyNiveau,
  applyDiscipline,
  applyOI,
  applyComportement,
  applyConnaissances,
  applyAspects,
  // ... autres appliers
];

/**
 * Exécute le pipeline complet sur une query de base.
 */
export function buildTachesQuery(supabase: SupabaseClient, filters: TachesSearchParams) {
  let query = supabase
    .from("taches")
    .select("*, profiles!inner(display_name, avatar_url)", { count: "exact" });

  for (const apply of TACHES_PIPELINE) {
    query = apply(query, filters);
  }

  // Tri
  if (filters.tri === "populaire") {
    query = query.order("bank_popularity_score", { ascending: false });
  } else {
    query = query.order("updated_at", { ascending: false });
  }

  // Pagination
  const from = (filters.page - 1) * filters.limit;
  query = query.range(from, from + filters.limit - 1);

  return query;
}
```

#### Gestion des colonnes scalaires vs arrays

**Problème critique** : la même facette (ex: Niveau) utilise une colonne scalaire pour les Tâches (`niveau_id`) mais un array pour les Documents (`niveaux_ids[]`). L'applier doit être polymorphe.

```typescript
/**
 * Factory pour créer un applier qui s'adapte au type de colonne.
 */
function createFilterApplier<T extends SearchParams>(config: {
  paramKey: keyof T;
  column: string;
  isArray: boolean; // true = colonne de type array (GIN)
}): FacetApplier<T> {
  return (query, filters) => {
    const values = filters[config.paramKey] as string[] | undefined;
    if (!values?.length) return query;

    if (config.isArray) {
      // Colonne array : overlap (au moins une valeur en commun)
      return query.overlaps(config.column, values);
    } else {
      // Colonne scalaire : IN
      return query.in(config.column, values);
    }
  };
}

// Usage
const applyNiveauTaches = createFilterApplier<TachesSearchParams>({
  paramKey: "niveau",
  column: "niveau_id",
  isArray: false,
});

const applyNiveauDocuments = createFilterApplier<DocumentsSearchParams>({
  paramKey: "niveau",
  column: "niveaux_ids",
  isArray: true,
});
```

### 3.3 Couche 3 — Exécution serveur (RPC vs Query directe)

**Recommandation architecturale** : utiliser une **RPC Supabase par entité** plutôt qu'une query directe construite côté client. Raisons :

1. **Sécurité** : la logique de filtrage reste côté serveur, derrière RLS
2. **Performance** : la RPC peut utiliser des `LATERAL JOIN` et des CTEs impossibles via le client Supabase
3. **Compteurs** : la RPC peut retourner résultats + compteurs en une seule requête (voir §5)
4. **Épreuves** : les filtres dérivés (via `evaluation_tae`) nécessitent des jointures complexes que le client Supabase gère mal

> **[QUESTION-AGENT-03]** : Trois options se présentent :
>
> - **Option A** : Une seule RPC polymorphe `search_bank(entity_type, filters_json)` — DRY mais complexe, le retour est un `json` non typé
> - **Option B** : Une RPC par entité (`search_taches(filters)`, `search_documents(filters)`, `search_epreuves(filters)`) — typé, simple, mais trois fonctions à maintenir
> - **Option C** : Hybride — query directe Supabase pour les cas simples (Tâches, Documents), RPC pour les cas complexes (Épreuves avec jointures)
>
> Quelle option recommandez-vous et pourquoi ? Considérez : la maintenabilité, la performance, le typage, la testabilité, et l'expérience développeur.

#### Structure de la RPC recommandée (Option B)

```sql
-- supabase/migrations/xxx_search_taches.sql

CREATE OR REPLACE FUNCTION search_taches(
  p_query        TEXT     DEFAULT NULL,
  p_niveaux      TEXT[]   DEFAULT NULL,
  p_disciplines  TEXT[]   DEFAULT NULL,
  p_oi           TEXT     DEFAULT NULL,
  p_comportement TEXT     DEFAULT NULL,
  p_aspects      TEXT[]   DEFAULT NULL,
  p_connaissances TEXT[]  DEFAULT NULL,
  p_sort         TEXT     DEFAULT 'recent',
  p_page         INT      DEFAULT 1,
  p_limit        INT      DEFAULT 20
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_offset     INT := (p_page - 1) * p_limit;
  v_results    JSON;
  v_facets     JSON;
  v_total      BIGINT;
BEGIN
  -- CTE de base : appliquer tous les filtres
  WITH filtered AS (
    SELECT t.*
    FROM taches t
    WHERE t.statut = 'publie'
      AND (p_query IS NULL OR t.consigne_search_plain @@ plainto_tsquery('french', p_query))
      AND (p_niveaux IS NULL OR t.niveau_id = ANY(p_niveaux))
      AND (p_disciplines IS NULL OR t.discipline_id = ANY(p_disciplines))
      AND (p_oi IS NULL OR t.oi_id = p_oi)
      AND (p_comportement IS NULL OR t.comportement_id = p_comportement)
      AND (p_aspects IS NULL OR t.aspects_societe && p_aspects)
      AND (p_connaissances IS NULL OR t.connaissances_ids && p_connaissances)
  ),

  -- Compteurs dynamiques pour chaque facette
  -- Technique : pour chaque facette, on applique TOUS les filtres SAUF celui de cette facette
  -- → permet de voir combien de résultats on aurait avec un autre choix
  facet_niveau AS (
    SELECT niveau_id AS value, COUNT(*) AS count
    FROM filtered -- Note: ici on utilise filtered SANS le filtre niveau
    -- En réalité, il faut re-bâtir la query sans le filtre niveau
    -- Voir §5.2 pour la stratégie complète
    GROUP BY niveau_id
  )

  SELECT
    json_build_object(
      'results', (SELECT json_agg(row_to_json(f)) FROM (
        SELECT * FROM filtered
        ORDER BY
          CASE WHEN p_sort = 'populaire' THEN bank_popularity_score END DESC NULLS LAST,
          CASE WHEN p_sort = 'recent' THEN updated_at END DESC
        LIMIT p_limit OFFSET v_offset
      ) f),
      'total', (SELECT COUNT(*) FROM filtered),
      'facets', json_build_object(
        'niveau', (SELECT json_agg(json_build_object('value', value, 'count', count)) FROM facet_niveau)
        -- ... autres facettes
      )
    ) INTO v_results;

  RETURN v_results;
END;
$$;
```

#### Appel depuis un Server Component

```typescript
// queries/search-taches.ts
import { createClient } from "@/lib/supabase/server";
import type { TachesSearchParams } from "@/schemas/search-params";

export async function searchTaches(filters: TachesSearchParams) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("search_taches", {
    p_query: filters.q || null,
    p_niveaux: filters.niveau?.length ? filters.niveau : null,
    p_disciplines: filters.discipline?.length ? filters.discipline : null,
    p_oi: filters.oi || null,
    p_comportement: filters.comportement || null,
    p_aspects: filters.aspects?.length ? filters.aspects : null,
    p_connaissances: filters.connaissances?.length ? filters.connaissances : null,
    p_sort: filters.tri,
    p_page: filters.page,
    p_limit: filters.limit,
  });

  if (error) throw new SearchError("search_taches failed", { cause: error });

  return data as SearchResult<Tache>;
}
```

### 3.4 Couche 4 — Server Component (orchestration)

```typescript
// app/banque/page.tsx
import { searchParamsSchema } from '@/schemas/search-params';
import { searchTaches } from '@/queries/search-taches';
import { searchDocuments } from '@/queries/search-documents';
import { searchEpreuves } from '@/queries/search-epreuves';
import { BanqueShell } from '@/components/banque/banque-shell';

type Props = {
  searchParams: Promise<Record<string, string>>;
};

export default async function BanquePage({ searchParams }: Props) {
  const rawParams = await searchParams;
  const filters = searchParamsSchema.parse(rawParams);

  // Fetch parallèle : résultats de l'onglet actif + compteurs des onglets inactifs
  const [activeResults, tabCounts] = await Promise.all([
    fetchActiveTab(filters),
    fetchTabCounts(filters),
  ]);

  return (
    <BanqueShell
      filters={filters}
      results={activeResults}
      tabCounts={tabCounts}
    />
  );
}

async function fetchActiveTab(filters: SearchParams) {
  switch (filters.tab) {
    case 'taches': return searchTaches(filters);
    case 'documents': return searchDocuments(filters);
    case 'epreuves': return searchEpreuves(filters);
  }
}

/**
 * Les compteurs des onglets (ex: "Tâches 234") doivent refléter
 * les filtres communs actuels, même pour les onglets inactifs.
 * On exécute un COUNT pour chaque entité en parallèle.
 */
async function fetchTabCounts(filters: SearchParams) {
  // Seuls les filtres communs s'appliquent aux onglets inactifs
  const commonFilters = {
    q: filters.q,
    niveau: filters.niveau,
    discipline: filters.discipline,
    connaissances: filters.connaissances,
    auteur: filters.auteur,
  };

  const [taches, documents, epreuves] = await Promise.all([
    countTaches(commonFilters),
    countDocuments(commonFilters),
    countEpreuves(commonFilters),
  ]);

  return { taches, documents, epreuves };
}
```

---

## 4. Architecture des composants UI

### 4.1 Arbre de composants

```
BanquePage (Server Component — données)
└── BanqueShell (Client — layout orchestrator)
    ├── SearchBar (texte libre + bouton filtres mobile)
    ├── TabBar (Tâches | Documents | Épreuves + compteurs)
    ├── ActiveFiltersBar (pills des filtres actifs + "Tout effacer")
    ├── FacetPanel (panneau latéral / bottom sheet)
    │   ├── FacetSection (collapsible, un par facette)
    │   │   ├── FacetSingleSelect
    │   │   ├── FacetMultiSelect
    │   │   ├── FacetCascadedSelect
    │   │   ├── FacetHierarchicalSelect
    │   │   ├── FacetRange
    │   │   └── FacetAutocomplete
    │   └── FacetResetButton
    ├── ResultsHeader (compteur "X documents trouvés" + tri)
    ├── ResultsList (grille/liste de résultats)
    │   └── ResultCard (une carte par résultat)
    └── Pagination
```

> **[QUESTION-AGENT-04]** : Le `FacetPanel` devrait-il être un composant **contrôlé** (l'état vit dans `BanqueShell` via le hook `useSearchParamsState`, passé en props aux `FacetSection`) ou **non-contrôlé** (chaque `FacetSection` gère son propre état local et notifie le parent via callback) ?
>
> Considérations :
>
> - Contrôlé : un seul endroit pour l'état, facile à debugger, mais prop drilling profond
> - Non-contrôlé : composants isolés, mais l'état est fragmenté, le "Tout effacer" devient complexe
> - Hybride : Context React dédié pour les filtres ?
>
> Recommandez une approche avec justification.

### 4.2 Widget par type de facette

| Type                  | Widget                                | Comportement du compteur         | Interaction                                               |
| --------------------- | ------------------------------------- | -------------------------------- | --------------------------------------------------------- |
| `text_search`         | Input avec debounce 300ms             | Pas de compteur                  | Frappe → debounce → update URL                            |
| `single_select`       | Liste de radio buttons avec compteurs | `N (T)` — N=dynamique, T=total   | Click → sélection exclusive                               |
| `multi_select`        | Liste de checkboxes avec compteurs    | `N (T)`                          | Click → toggle, multi-sélection                           |
| `cascaded_select`     | Select parent + select enfant         | Compteurs sur l'enfant seulement | Parent change → enfant reset + reload options             |
| `hierarchical_select` | Arbre expandable avec checkboxes      | Compteurs à chaque niveau        | Expand → charge les enfants, check parent → check enfants |
| `range`               | Double slider + inputs numériques     | Pas de compteur (ou histogramme) | Drag → debounce → update URL                              |
| `sort`                | Radio group (Récent / Populaire)      | Pas de compteur                  | Click → update URL                                        |
| `autocomplete`        | Input avec dropdown async             | Pas de compteur dans la liste    | Frappe → search API → select                              |

### 4.3 Comportement au changement d'onglet

```
Scénario : L'utilisateur a filtré Tâches par Niveau=Sec4, Discipline=HEC, OI=Établir des faits.
Il clique sur l'onglet "Documents".

État attendu :
  ✓ Niveau=Sec4 est préservé (facette commune)
  ✓ Discipline=HEC est préservé (facette commune)
  ✗ OI disparaît (facette spécifique aux Tâches)
  ✓ Les facettes spécifiques Documents apparaissent (Type, Catégorie, etc.)
  ✓ Les compteurs se recalculent pour les Documents avec Niveau=Sec4 + Discipline=HEC
  ✓ L'URL reflète : ?tab=documents&niveau=sec4&discipline=hec
```

### 4.4 Layout responsive

**Desktop (≥1024px)** : Panneau de facettes à droite, toujours visible, collapsible par section. Les sections les plus utilisées sont ouvertes par défaut (Discipline, Niveau, Tri). Les moins utilisées sont fermées (Connaissances, École).

**Tablette (768-1023px)** : Panneau latéral togglable via un bouton "Filtres (N)" en haut. Overlay avec backdrop semi-transparent. Le panneau pousse le contenu ou se superpose.

**Mobile (<768px)** : Bottom sheet (à la Google Maps / Airbnb). Glissable vers le haut. Trois positions : fermé (seul le bouton "Filtres (N)" visible), mi-hauteur (facettes principales), plein écran (toutes les facettes).

> **[QUESTION-AGENT-08]** : Le bottom sheet mobile est séduisant mais complexe à implémenter correctement (gestion du scroll interne vs scroll du sheet, gestes, accessibilité, performances sur iOS Safari). Alternatives :
>
> - Drawer plein écran classique (plus simple, moins fluide)
> - Panneau inline au-dessus des résultats (pas d'overlay, mais prend de la place)
> - Garder le bottom sheet mais avec une librairie éprouvée (laquelle ?)
>
> Quelle approche minimise le risque tout en offrant la meilleure UX mobile ?

---

## 5. Compteurs de facettes

### 5.1 Comportement attendu

Les compteurs affichent deux valeurs : le **compte dynamique** (résultats avec les filtres actifs) et le **total absolu** entre parenthèses.

```
Exemple avec filtres actifs : Niveau=Sec4, Discipline=HEC

MATIÈRE
  ☑ Mathématiques    8 (12)    ← 8 résultats avec Sec4+HEC, 12 au total
  ☐ Français        14 (34)    ← 14 résultats avec Sec4+HEC, 34 au total
  ☐ Sciences         0 (21)    ← 0 résultats (grisé), 21 au total
  ☐ Histoire         3 (18)    ← 3 résultats

NIVEAU
  ☐ Sec 3            5 (9)
  ☑ Sec 4           25 (25)    ← Sélectionné, dynamique = total car ce filtre est "exclu du calcul pour sa propre facette"
  ☐ Sec 5            0 (7)
```

**Règle clé du calcul** : pour calculer les compteurs d'une facette F, on applique **tous les filtres SAUF le filtre F lui-même**. C'est ce qu'on appelle le "facet exclusion" ou "disjunctive facet counting". Sans cette règle, sélectionner "Sec4" ferait disparaître les compteurs de Sec3 et Sec5 (ils seraient à 0), rendant impossible la multi-sélection incrémentale.

> **[QUESTION-AGENT-05]** : Trois stratégies de cache pour les compteurs :
>
> - **SWR/React Query** côté client : les compteurs sont fetchés séparément et mis en cache. Avantage = UX optimiste. Risque = désynchronisation avec les résultats.
> - **Cache Next.js** (`unstable_cache` / `revalidateTag`) : cache serveur invalidé par tag. Avantage = cohérence. Risque = complexité d'invalidation.
> - **Pas de cache** : les compteurs sont toujours retournés avec les résultats (dans la même RPC). Avantage = simplicité, cohérence garantie. Risque = latence.
>
> Recommandation ?

### 5.2 Stratégie SQL pour les compteurs dynamiques

Le calcul des compteurs avec facet exclusion est le point chaud de performance. Deux approches :

#### Option A : N+1 queries (une par facette)

```sql
-- Compteurs pour la facette "niveau", en excluant le filtre niveau
SELECT niveau_id, COUNT(*)
FROM taches
WHERE statut = 'publie'
  -- Tous les filtres SAUF niveau
  AND (p_disciplines IS NULL OR discipline_id = ANY(p_disciplines))
  AND (p_oi IS NULL OR oi_id = p_oi)
  -- ... etc, mais PAS le filtre niveau
GROUP BY niveau_id;
```

Problème : N facettes = N requêtes supplémentaires. Pour 10 facettes, ça fait 11 requêtes par changement de filtre.

#### Option B : Requête unique avec GROUPING SETS (recommandée)

```sql
-- Tout en une seule requête
WITH base AS (
  SELECT t.*
  FROM taches t
  WHERE t.statut = 'publie'
    AND (p_query IS NULL OR t.consigne_search_plain @@ plainto_tsquery('french', p_query))
),
-- Pour chaque facette, recalculer les compteurs en excluant son propre filtre
facet_niveau AS (
  SELECT 'niveau' AS facet, niveau_id AS value, COUNT(*) AS count
  FROM base
  WHERE (p_disciplines IS NULL OR discipline_id = ANY(p_disciplines))
    AND (p_oi IS NULL OR oi_id = p_oi)
    -- Pas de filtre niveau ici
  GROUP BY niveau_id
),
facet_discipline AS (
  SELECT 'discipline' AS facet, discipline_id AS value, COUNT(*) AS count
  FROM base
  WHERE (p_niveaux IS NULL OR niveau_id = ANY(p_niveaux))
    AND (p_oi IS NULL OR oi_id = p_oi)
    -- Pas de filtre discipline ici
  GROUP BY discipline_id
)
SELECT * FROM facet_niveau
UNION ALL
SELECT * FROM facet_discipline
-- UNION ALL pour chaque facette
```

> **[QUESTION-AGENT-06]** : La solution avec CTEs multiples est lisible mais peut être coûteuse si le CTE `base` n'est pas matérialisé. PostgreSQL 12+ peut inline les CTEs, ce qui re-exécute les filtres pour chaque facette.
>
> Alternatives à évaluer :
>
> - **Materialized view** pré-calculée avec refresh incrémental
> - **CTE matérialisé** explicite (`WITH base AS MATERIALIZED (...)`)
> - **Table de compteurs dénormalisée** mise à jour par trigger
> - **Calcul asynchrone** : retourner les résultats immédiatement, streamer les compteurs après
>
> Quelle stratégie pour un dataset de 1K-10K ressources (pas du Big Data, mais les requêtes doivent rester < 200ms) ?

### 5.3 Compteurs totaux (absolus)

Les totaux absolus ne changent que lorsque le contenu est créé/supprimé/publié. Ils peuvent être :

1. **Cachés côté serveur** avec invalidation par tag Supabase Realtime
2. **Calculés une fois** au chargement de la page et passés en props statiques
3. **Stockés dans une table de compteurs** maintenue par trigger

Recommandation : option 2, avec `unstable_cache` de Next.js taggé par entité. Le refresh se fait lors de la prochaine revalidation.

---

## 6. Cas limites et comportements spéciaux

### 6.1 Filtres cascadés : invalidation du parent

Le filtre "Comportement attendu" dépend de "Opération intellectuelle". Si l'utilisateur sélectionne OI="Établir des faits" puis Comportement="Relever des différences", puis change OI pour "Déterminer des causes", l'ancien comportement n'existe plus dans le nouveau contexte.

**Comportement attendu** :

```
1. Utilisateur sélectionne OI = "Établir des faits"
2. Liste des comportements se charge : [Relever, Comparer, ...]
3. Utilisateur sélectionne Comportement = "Relever des différences"
4. URL: ?oi=etablir-faits&comportement=relever-differences

5. Utilisateur change OI = "Déterminer des causes"
6. → Le comportement "Relever des différences" n'existe pas pour cette OI
7. → Comportement est AUTOMATIQUEMENT effacé
8. → URL: ?oi=determiner-causes (sans comportement)
9. → La liste des comportements se recharge avec les options de la nouvelle OI
```

> **[QUESTION-AGENT-07]** : Comment implémenter cette invalidation proprement ?
>
> - **Option A** : Le `setFilters` détecte les dépendances et efface les enfants automatiquement (logique dans le hook)
> - **Option B** : Le composant `FacetCascadedSelect` observe son parent et se reset via `useEffect`
> - **Option C** : Un middleware dans le schéma Zod qui valide les dépendances au parsing et efface les valeurs invalides
>
> Avantages et inconvénients de chaque approche ? Y a-t-il une Option D meilleure ?

### 6.2 Facettes conditionnelles

Le filtre "Catégorie iconographique" n'apparaît que si Type="Iconographique" est sélectionné. Le filtre "Catégorie textuelle" n'apparaît que si Type="Textuel".

```typescript
// Logique de visibilité des facettes conditionnelles
function getVisibleFacets(entityType: string, filters: SearchParams): FacetConfig[] {
  const facets = FACET_REGISTRY[entityType];

  return facets.filter((facet) => {
    if (!facet.visibleWhen) return true;
    return facet.visibleWhen(filters);
  });
}

// Configuration
const DOCUMENT_FACETS: FacetConfig[] = [
  // ...
  {
    key: "cat_icono",
    type: "multi_select",
    visibleWhen: (filters) => filters.type === "iconographique",
  },
  {
    key: "cat_text",
    type: "multi_select",
    visibleWhen: (filters) => filters.type === "textuel",
  },
];
```

### 6.3 Compteurs à zéro

Quand un compteur de facette est à 0, la valeur est **affichée mais grisée** (pas masquée). Raisons :

1. L'utilisateur voit que la catégorie existe mais n'a pas de résultats avec les filtres actuels
2. Masquer ferait "sauter" le layout à chaque changement de filtre
3. L'utilisateur peut quand même cliquer pour modifier ses filtres

Exception : les valeurs qui n'ont JAMAIS de contenu (total absolu = 0) peuvent être masquées.

### 6.4 Recherche texte + filtres : ordre d'application

La recherche texte s'applique AVANT les facettes dans le pipeline. La raison : les compteurs de facettes doivent refléter les résultats de la recherche texte.

```
Utilisateur tape "Révolution tranquille" puis filtre Niveau=Sec4

Pipeline :
1. Full-text search sur "Révolution tranquille" → 45 résultats
2. Filtre Niveau=Sec4 → 12 résultats
3. Compteurs calculés sur l'intersection (texte + niveau exclu pour les compteurs de niveau)
```

### 6.5 Debounce et annulation

La recherche texte utilise un debounce de 300ms. Si l'utilisateur tape rapidement, les requêtes intermédiaires sont annulées.

Pour les Route Handlers (autocomplete Auteur), utiliser `AbortController` :

```typescript
// hooks/use-autocomplete.ts
export function useAutocomplete(endpoint: string) {
  const controllerRef = useRef<AbortController | null>(null);

  const search = useCallback(
    async (term: string) => {
      // Annuler la requête précédente
      controllerRef.current?.abort();
      controllerRef.current = new AbortController();

      const res = await fetch(`${endpoint}?q=${encodeURIComponent(term)}`, {
        signal: controllerRef.current.signal,
      });

      if (!res.ok) throw new Error("Autocomplete failed");
      return res.json();
    },
    [endpoint],
  );

  return { search };
}
```

---

## 7. Performance

### 7.1 Budget de performance

| Métrique                                         | Budget                | Mesure                       |
| ------------------------------------------------ | --------------------- | ---------------------------- |
| Temps de réponse serveur (résultats + compteurs) | < 200ms (P95)         | Supabase RPC                 |
| Time to first result (navigation client)         | < 100ms perçu         | `useTransition` + skeleton   |
| Recherche texte (debounce inclus)                | < 500ms end-to-end    | Debounce 300ms + query 200ms |
| Autocomplete (Auteur)                            | < 150ms par keystroke | Route Handler + abort        |
| Changement d'onglet                              | < 300ms perçu         | Prefetch des compteurs       |

### 7.2 Stratégies d'optimisation

**Index requis** (vérifier qu'ils existent) :

```sql
-- Tâches
CREATE INDEX IF NOT EXISTS idx_taches_consigne_search ON taches USING GIN(consigne_search_plain);
CREATE INDEX IF NOT EXISTS idx_taches_niveau ON taches(niveau_id) WHERE statut = 'publie';
CREATE INDEX IF NOT EXISTS idx_taches_discipline ON taches(discipline_id) WHERE statut = 'publie';
CREATE INDEX IF NOT EXISTS idx_taches_oi ON taches(oi_id) WHERE statut = 'publie';
CREATE INDEX IF NOT EXISTS idx_taches_aspects ON taches USING GIN(aspects_societe) WHERE statut = 'publie';
CREATE INDEX IF NOT EXISTS idx_taches_connaissances ON taches USING GIN(connaissances_ids) WHERE statut = 'publie';

-- Documents
CREATE INDEX IF NOT EXISTS idx_documents_niveaux ON documents USING GIN(niveaux_ids) WHERE statut = 'publie';
CREATE INDEX IF NOT EXISTS idx_documents_disciplines ON documents USING GIN(disciplines_ids) WHERE statut = 'publie';

-- Composite pour les cas fréquents
CREATE INDEX IF NOT EXISTS idx_taches_niveau_discipline ON taches(niveau_id, discipline_id) WHERE statut = 'publie';
```

**Optimistic UI** : quand l'utilisateur clique un filtre, on met à jour immédiatement la pill dans `ActiveFiltersBar` et on montre un skeleton pour les résultats, pendant que le serveur recalcule.

**Prefetch** : au hover sur un onglet inactif, prefetch les compteurs de cet onglet.

---

## 8. Tests

### 8.1 Stratégie de test

> **[QUESTION-AGENT-09]** : Quel niveau de test est le plus rentable pour le query builder ?
>
> - **Unit pur** : tester chaque `FacetApplier` en isolation avec un mock Supabase. Rapide mais ne teste pas le SQL réel.
> - **Intégration Supabase** : tester le query builder contre une vraie instance Supabase (local via Docker). Lent mais fiable.
> - **Snapshot SQL** : capturer la query SQL générée et la comparer à un snapshot. Rapide, détecte les régressions, mais fragile aux changements de format.
> - **E2E Playwright** : tester les scénarios utilisateur complets. Lent, mais teste tout le stack.
>
> Recommandez un mix avec des ratios.

#### Tests unitaires recommandés (Vitest)

```typescript
// __tests__/search/query-builder.test.ts
import { describe, it, expect } from "vitest";
import { searchParamsSchema } from "@/schemas/search-params";

describe("searchParamsSchema", () => {
  it("parse des params avec valeurs CSV", () => {
    const result = searchParamsSchema.parse({
      tab: "taches",
      niveau: "sec3,sec4",
      discipline: "hec",
    });
    expect(result.niveau).toEqual(["sec3", "sec4"]);
    expect(result.discipline).toEqual(["hec"]);
    expect(result.page).toBe(1); // default
  });

  it("rejette un tab invalide", () => {
    expect(() => searchParamsSchema.parse({ tab: "invalid" })).toThrow();
  });

  it("applique les defaults quand les params sont vides", () => {
    const result = searchParamsSchema.parse({ tab: "taches" });
    expect(result.tri).toBe("recent");
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
  });

  it("ne permet pas les facettes de tâches sur un tab documents", () => {
    const result = searchParamsSchema.parse({
      tab: "documents",
      oi: "should-be-ignored", // facette spécifique tâches
    });
    // Le discriminatedUnion sélectionne documentsSearchParamsSchema
    // qui ne connaît pas 'oi' → le champ est stripped
    expect(result).not.toHaveProperty("oi");
  });
});

describe("switchTab preserves common filters", () => {
  it("garde niveau et discipline en changeant de tab", () => {
    // Simuler les searchParams
    const current = new URLSearchParams("tab=taches&niveau=sec4&discipline=hec&oi=etablir-faits");

    // Logique de switchTab
    const next = new URLSearchParams();
    next.set("tab", "documents");
    const commonKeys = ["q", "niveau", "discipline", "connaissances", "auteur", "tri"];
    for (const key of commonKeys) {
      const val = current.get(key);
      if (val) next.set(key, val);
    }

    expect(next.get("tab")).toBe("documents");
    expect(next.get("niveau")).toBe("sec4");
    expect(next.get("discipline")).toBe("hec");
    expect(next.has("oi")).toBe(false); // Facette spécifique supprimée
  });
});
```

#### Tests E2E recommandés (Playwright)

```typescript
// e2e/banque-search.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Banque — Faceted Search", () => {
  test("filtrer par niveau met à jour les résultats et les compteurs", async ({ page }) => {
    await page.goto("/banque?tab=taches");

    // Cliquer sur Sec 4 dans le panneau de facettes
    await page.getByRole("checkbox", { name: /sec 4/i }).check();

    // Vérifier que l'URL est mise à jour
    await expect(page).toHaveURL(/niveau=sec4/);

    // Vérifier que les résultats se mettent à jour (skeleton puis contenu)
    await expect(page.getByTestId("results-count")).not.toContainText("0 documents");

    // Vérifier que le filtre actif apparaît dans la barre
    await expect(page.getByTestId("active-filters")).toContainText("Sec 4");
  });

  test("changer d'onglet préserve les filtres communs", async ({ page }) => {
    await page.goto("/banque?tab=taches&niveau=sec4&discipline=hec");

    // Cliquer sur l'onglet Documents
    await page.getByRole("tab", { name: /documents/i }).click();

    // Vérifier que les filtres communs sont préservés
    await expect(page).toHaveURL(/tab=documents/);
    await expect(page).toHaveURL(/niveau=sec4/);
    await expect(page).toHaveURL(/discipline=hec/);
  });

  test('"Tout effacer" réinitialise les filtres sauf le tab', async ({ page }) => {
    await page.goto("/banque?tab=taches&niveau=sec4&discipline=hec&oi=etablir-faits");

    await page.getByRole("button", { name: /tout effacer/i }).click();

    await expect(page).toHaveURL(/tab=taches$/);
  });
});
```

---

## 9. Évolutions futures

### 9.1 Saved Searches / Filtres favoris

> **[QUESTION-AGENT-10]** : Faut-il inclure les "saved searches" (permettre aux enseignants de sauvegarder une combinaison de filtres sous un nom, ex: "Mes tâches HEC Sec4") dans le MVP ou le différer ?
>
> Arguments pour le MVP :
>
> - L'URL est déjà la représentation sérialisée — sauvegarder = persister une URL
> - Les enseignants reviennent souvent avec les mêmes filtres
> - Implémentation légère (table `saved_searches` avec `user_id`, `name`, `url_params`)
>
> Arguments pour différer :
>
> - Complexité UX (où afficher, comment nommer, partager ?)
> - Les bookmarks du navigateur font le même job
> - Focus MVP = la recherche elle-même doit être parfaite d'abord
>
> Votre position ?

### 9.2 Facettes dynamiques (configurables en DB)

À terme, les facettes pourraient être configurées en DB plutôt que hardcodées dans le code. Cela permettrait aux administrateurs d'ajouter/retirer des facettes sans déploiement. Architecture esquissée :

```typescript
// Table: facet_configs
// Colonnes: id, entity_type, facet_key, facet_type, label_fr, column_name,
//           is_array, depends_on, display_order, is_active, options_query

// Le FacetPanel lirait sa config depuis la DB au lieu d'un registre statique
```

Ceci est hors scope du MVP mais l'architecture doit le permettre (d'où le pattern de registre extensible dans §3.2).

### 9.3 Recherche sémantique

Remplacement futur du full-text search par une recherche vectorielle (pgvector) pour trouver des tâches similaires par sens plutôt que par mots-clés. Nécessite un pipeline d'embedding.

---

## 10. Récapitulatif des décisions architecturales

| #    | Décision                        | Choix                                                            | Justification                                                     |
| ---- | ------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------- |
| D-01 | Source de vérité de l'état      | URL searchParams                                                 | Shareable, bookmarkable, SSR, bouton retour                       |
| D-02 | Exécution des requêtes          | RPC Supabase par entité                                          | Sécurité (RLS), performance (SQL optimisé), compteurs intégrés    |
| D-03 | Calcul des compteurs dynamiques | Facet exclusion (tous les filtres sauf le filtre courant)        | Standard industriel, UX de multi-sélection incrémentale           |
| D-04 | Compteurs affichés              | Dynamique + total absolu entre parenthèses                       | Contexte immédiat + sens de l'échelle                             |
| D-05 | Facettes au changement d'onglet | Communes préservées, spécifiques effacées                        | Continuité de l'exploration cross-entité                          |
| D-06 | Compteurs à zéro                | Affichés grisés (pas masqués)                                    | Stabilité du layout, transparence                                 |
| D-07 | Validation des params           | Zod discriminatedUnion                                           | Type-safety, defaults automatiques, stripping des champs inconnus |
| D-08 | Layout responsive               | Panneau latéral desktop, bottom sheet mobile                     | UX optimale par plateforme                                        |
| D-09 | Debounce recherche texte        | 300ms                                                            | Équilibre réactivité / charge serveur                             |
| D-10 | Annulation requêtes             | AbortController (Route Handlers), useTransition (Server Actions) | Pas de résultats obsolètes                                        |

---

## 11. Checklist d'implémentation

### Phase 1 — Fondations (semaine 1-2)

- [ ] Schéma Zod `searchParamsSchema` avec les trois entités
- [ ] Hook `useSearchParamsState` (URL ↔ state)
- [ ] Layout `BanqueShell` avec responsive (panneau latéral / bottom sheet)
- [ ] Composant `TabBar` avec compteurs
- [ ] Composant `ActiveFiltersBar` avec pills
- [ ] Composant `SearchBar` avec debounce

### Phase 2 — Query Builder (semaine 2-3)

- [ ] RPC `search_taches` avec compteurs dynamiques
- [ ] RPC `search_documents` avec compteurs dynamiques
- [ ] RPC `search_epreuves` avec compteurs dynamiques
- [ ] Server Components pour l'orchestration (`BanquePage`)
- [ ] Vérification des index GIN existants, création des manquants

### Phase 3 — Widgets de facettes (semaine 3-4)

- [ ] `FacetSingleSelect` (avec compteurs dynamique + total)
- [ ] `FacetMultiSelect`
- [ ] `FacetCascadedSelect` (OI → Comportement)
- [ ] `FacetHierarchicalSelect` (Connaissances, Compétences disciplinaires)
- [ ] `FacetRange` (Année, Nombre de tâches)
- [ ] `FacetAutocomplete` (Auteur, École/CSS)

### Phase 4 — Résultats (semaine 4)

- [ ] `ResultCard` par entité (Tâche, Document, Épreuve)
- [ ] `Pagination`
- [ ] Skeleton loading states
- [ ] Empty states

### Phase 5 — Polish et tests (semaine 5)

- [ ] Tests unitaires Vitest (schéma, query builder)
- [ ] Tests E2E Playwright (scénarios utilisateur)
- [ ] Audit accessibilité (navigation clavier, lecteur d'écran)
- [ ] Audit performance (budget < 200ms)
- [ ] Mobile QA (iOS Safari, Android Chrome)

---

## 12. Annexes

### A. Glossaire

| Terme               | Définition                                                                             |
| ------------------- | -------------------------------------------------------------------------------------- |
| **TAÉ**             | Tâche d'Apprentissage et d'Évaluation — l'unité pédagogique principale                 |
| **OI**              | Opération Intellectuelle — catégorisation cognitive de la tâche                        |
| **CD**              | Compétence Disciplinaire — hiérarchie de compétences par discipline                    |
| **HEC**             | Histoire et Éducation à la Citoyenneté                                                 |
| **GEO**             | Géographie                                                                             |
| **HQC**             | Histoire du Québec et du Canada                                                        |
| **CSS**             | Centre de Services Scolaire (anciennement Commission scolaire)                         |
| **GIN**             | Generalized Inverted Index — index PostgreSQL pour arrays et full-text                 |
| **RLS**             | Row Level Security — politique de sécurité Supabase                                    |
| **Facet exclusion** | Technique de calcul où les compteurs d'une facette excluent le filtre de cette facette |

### B. Mapping slug ↔ ID

Les URLs utilisent des slugs lisibles, mais la DB utilise des IDs. Le mapping est fait dans les RPCs ou via une table de lookup.

```typescript
const NIVEAU_SLUG_MAP: Record<string, string> = {
  sec1: "uuid-sec1",
  sec2: "uuid-sec2",
  sec3: "uuid-sec3",
  sec4: "uuid-sec4",
};
```

### C. Arbre de fichiers cible

```
app/
  banque/
    page.tsx                    ← Server Component (orchestration)
    loading.tsx                 ← Skeleton layout complet

components/
  banque/
    banque-shell.tsx            ← Client Component (layout + state)
    search-bar.tsx
    tab-bar.tsx
    active-filters-bar.tsx
    results-header.tsx
    results-list.tsx
    result-card/
      tache-card.tsx
      document-card.tsx
      epreuve-card.tsx
    pagination.tsx
    facet-panel/
      facet-panel.tsx           ← Panneau latéral / bottom sheet
      facet-section.tsx         ← Wrapper collapsible
      facet-single-select.tsx
      facet-multi-select.tsx
      facet-cascaded-select.tsx
      facet-hierarchical-select.tsx
      facet-range.tsx
      facet-autocomplete.tsx

hooks/
  use-search-params-state.ts    ← Source de vérité URL ↔ state
  use-autocomplete.ts           ← Debounce + abort pour autocomplete
  use-bottom-sheet.ts           ← Gestion du bottom sheet mobile

schemas/
  search-params.ts              ← Zod schemas pour les searchParams

queries/
  search-taches.ts              ← Appel RPC search_taches
  search-documents.ts           ← Appel RPC search_documents
  search-epreuves.ts            ← Appel RPC search_epreuves

lib/
  search/
    facet-registry.ts           ← Configuration des facettes par entité
    query-builder.ts            ← Pipeline d'appliers (si on n'utilise pas les RPCs)
    slug-map.ts                 ← Mapping slug ↔ UUID

supabase/
  migrations/
    xxx_search_taches.sql
    xxx_search_documents.sql
    xxx_search_epreuves.sql
    xxx_search_indexes.sql
```

---

_Fin de la spécification — Version 0.1-draft_
_Soumise pour revue multi-agents. Chaque reviewer doit produire les 3 blocs : Critique, Enrichissement, Questions ouvertes._
