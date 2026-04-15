# Audit de faisabilité — SPEC-faceted-search-query-builder.md

**Date** : 2026-04-15  
**Statut** : Audit complet contre l'état réel du repo  
**Spec auditée** : `docs/specs/SPEC-faceted.search-query-builder.md` v0.1-draft

---

## 1. ALIGNEMENT REPO — Structure et conventions

### Arbre de fichiers proposé vs réalité

| Spec propose                       | Repo réel                                                                                                                                           | Verdict                                                                                                     |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `app/banque/page.tsx`              | `app/(app)/bank/page.tsx`                                                                                                                           | **Route fausse.** La route est `/bank`, pas `/banque`. Route group `(app)`.                                 |
| `components/banque/`               | `components/bank/` (8 fichiers)                                                                                                                     | **Dossier faux.** C'est `bank/`, pas `banque/`.                                                             |
| `hooks/use-search-params-state.ts` | N'existe pas                                                                                                                                        | **À créer.** Placement correct : `hooks/partagees/use-search-params-state.ts` (hook partagé entre entités). |
| `hooks/use-autocomplete.ts`        | N'existe pas                                                                                                                                        | Convention → `hooks/partagees/use-autocomplete.ts`                                                          |
| `hooks/use-bottom-sheet.ts`        | N'existe pas                                                                                                                                        | Convention → `hooks/partagees/use-bottom-sheet.ts`                                                          |
| `schemas/search-params.ts`         | Pas de dossier `schemas/` racine. Les schemas Zod vivent dans `lib/schemas/`.                                                                       | **Doit être `lib/schemas/search-params.ts`**                                                                |
| `queries/search-taches.ts`         | Les queries vivent dans `lib/queries/`. Fichiers existants : `bank-tasks.ts`, `bank-documents.ts`, `bank-evaluations.ts`, `bank-filter-ref-data.ts` | **Doit être `lib/queries/bank-tasks.ts`** (fichier existant à modifier, pas un nouveau fichier).            |
| `lib/search/facet-registry.ts`     | `lib/search/` n'existe pas                                                                                                                          | **À créer.** Respecte la convention `lib/` pour les helpers purs. OK.                                       |
| `lib/search/slug-map.ts`           | N'existe pas                                                                                                                                        | OK mais questionnable (voir §4, E-05).                                                                      |

### Arbre corrigé

```
app/(app)/bank/
  page.tsx                          ← existe, à modifier

components/bank/
  BankTaskFilters.tsx                ← existe (220 LOC), à refactorer
  BankDocumentsPanel.tsx             ← existe (280 LOC), à refactorer
  BankEvaluationsPanel.tsx           ← existe (100 LOC), à refactorer
  BankOnglets.tsx                    ← existe (39 LOC), à modifier
  facet-panel/                       ← à créer
    facet-panel.tsx
    facet-section.tsx
    facet-single-select.tsx
    facet-multi-select.tsx
    …

hooks/partagees/
  use-search-params-state.ts         ← à créer (convention hooks/partagees/)
  use-autocomplete.ts                ← à créer

lib/schemas/
  search-params.ts                   ← à créer (convention lib/schemas/)

lib/queries/
  bank-tasks.ts                      ← existe, à modifier
  bank-documents.ts                  ← existe, à modifier
  bank-evaluations.ts                ← existe, à modifier
  bank-filter-ref-data.ts            ← existe, à modifier

lib/search/
  facet-registry.ts                  ← à créer
```

### Patterns Server Actions

Le repo utilise `lib/actions/` pour toutes les Server Actions. Chaque fichier commence par `"use server"`. Pattern strict :

- Auth en premier (`requireActiveAppUser()` ou `supabase.auth.getUser()`)
- Validation Zod `safeParse`
- Return type explicite `{ ok: true; data } | { ok: false; code }`

**La spec est alignée** sur ce pattern. Seul écart : la spec propose `createClient` au lieu de `createServerClient` — le repo importe `createClient` depuis `@/lib/supabase/server`, c'est correct.

### Patterns queries

Le repo a un dossier `lib/queries/` bien établi. Les lectures Supabase sont toujours dans des fichiers séparés (jamais inline dans les pages). Le bank a déjà 4 fichiers queries dédiés. **La spec est alignée.**

### Schemas Zod existants

7 fichiers dans `lib/schemas/` :

- `profile.ts`, `auth.ts`, `evaluation-composition.ts`, `document.ts`, `document-renderer.ts`, `autonomous-document.ts`, `collaborateur-search.ts`
- Pattern : schemas nommés avec export, `z.infer<>` pour les types, `superRefine()` pour les validations croisées.

**Il n'existe PAS encore de schema pour les searchParams de la banque.** Le parsing est fait manuellement dans `lib/queries/bank-tasks.ts` (`parseBankTaeQueryFromSearchParams`) avec du code impératif — pas de Zod. La spec propose de le remplacer par un schema Zod — c'est un upgrade cohérent.

### Hooks existants

Seulement 2 hooks custom dans tout le projet :

- `hooks/partagees/use-fiche-modale.ts` — gestion modale
- `lib/hooks/useDebouncedValue.ts` — debounce (réutilisable pour la recherche texte)

**Aucun hook lié à la recherche ou aux URL params.** Le filtering actuel est 100 % server-side via `<form method="get">`.

### Composants UI réutilisables

| Composant          | Fichier                              | Usage actuel dans la banque                               |
| ------------------ | ------------------------------------ | --------------------------------------------------------- |
| `ListboxField`     | `components/ui/ListboxField.tsx`     | **Non utilisé** — la banque utilise des `<select>` natifs |
| `ComboboxField`    | `components/ui/ComboboxField.tsx`    | **Non utilisé**                                           |
| `Field`            | `components/ui/Field.tsx`            | Non utilisé dans la banque                                |
| `SimpleModal`      | `components/ui/SimpleModal.tsx`      | Oui (`BankAddToEvaluationLauncher`)                       |
| `CardGridSkeleton` | `components/ui/CardGridSkeleton.tsx` | Oui (loading state)                                       |

**Manquant :** BottomSheet, Drawer, FacetPanel, ActiveFiltersBar, SearchBar avec debounce — tout est à créer.

---

## 2. ÉTAT DE LA DB — Tables, colonnes, index

### Noms réels des tables

| Spec dit    | Nom réel          | Verdict                                                                                                                                                |
| ----------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `taches`    | **`tae`**         | **Faux partout dans la spec.** La table s'appelle `tae`, pas `taches`. La vue banque s'appelle `banque_tae`.                                           |
| `documents` | **`documents`**   | Correct.                                                                                                                                               |
| `epreuves`  | **`evaluations`** | **Faux.** La table s'appelle `evaluations` et la junction table `evaluation_tae`. L'onglet dans l'UI est « Épreuves » mais la table est `evaluations`. |

### Colonnes par facette — vérification

#### Tâches (table `tae`, vue `banque_tae`)

| #   | Facette       | Colonne spec                    | Réalité                                                                     | Verdict                                                                                                                                                           |
| --- | ------------- | ------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Recherche     | `consigne_search_plain` (GIN)   | `consigne_search_plain` TEXT GENERATED, indexé `gin_trgm_ops`               | **Correct mais le type d'index est trigram, pas tsvector.** La spec mentionne `plainto_tsquery('french', ...)` — c'est faux, le repo utilise `ILIKE` sur trigram. |
| 2   | OI            | `oi_id` FK                      | `oi_id TEXT` FK → `oi(id)`                                                  | OK. L'id est TEXT (ex : `"OI1"`), pas UUID.                                                                                                                       |
| 3   | Comportement  | `comportement_id`               | `comportement_id TEXT` FK → `comportements(id)`                             | OK, TEXT pas UUID.                                                                                                                                                |
| 4   | Niveau        | `niveau_id`                     | `niveau_id INT` FK → `niveaux(id)`                                          | OK, **INT pas UUID/TEXT.** La spec propose des slugs `sec1,sec4` dans l'URL mais la DB stocke des INT.                                                            |
| 5   | Discipline    | `discipline_id`                 | `discipline_id INT` FK → `disciplines(id)`                                  | OK, INT. Même remarque slug vs INT.                                                                                                                               |
| 6   | CD            | `cd_id`                         | `cd_id INT`                                                                 | OK.                                                                                                                                                               |
| 7   | Aspects       | `aspects_societe[]` GIN         | `aspects_societe aspect_societe[]` ENUM array, GIN indexed                  | OK. Le `.contains()` est utilisé (sémantique AND), pas `.overlaps()`.                                                                                             |
| 8   | Connaissances | `connaissances_ids[]` GIN       | `connaissances_ids INT[]`, GIN indexed                                      | OK, **INT[] pas TEXT[]**.                                                                                                                                         |
| 9   | Tri           | `bank_popularity_score`         | Calculé dans la vue `banque_tae`, pas une colonne `tae`.                    | Correct via vue.                                                                                                                                                  |
| 10  | Auteur        | `auteur_id`                     | `auteur_id UUID` FK → `profiles(id)`                                        | OK.                                                                                                                                                               |
| 11  | École/CSS     | via `profiles.school_id`        | `profiles.school_id INT` → `schools(id)` → `schools.css_id INT` → `css(id)` | Correct, mais double jointure nécessaire.                                                                                                                         |
| 12  | Nb documents  | via `comportement.nb_documents` | `comportements.nb_documents INT` (1-4 ou NULL)                              | OK, pas une colonne `tae` directe.                                                                                                                                |

#### Documents (table `documents`)

| #   | Facette         | Colonne spec                                  | Réalité                                                                                                                                    | Verdict                                                                                                                                    |
| --- | --------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Recherche       | `titre` (ILIKE)                               | `titre` TEXT, GIN trigram indexé                                                                                                           | OK.                                                                                                                                        |
| 2   | Discipline      | `disciplines_ids[]` GIN                       | `disciplines_ids INT[]`, GIN                                                                                                               | OK, **INT[]**.                                                                                                                             |
| 3   | Niveau          | `niveaux_ids[]` GIN                           | `niveaux_ids INT[]`, GIN                                                                                                                   | OK, **INT[]**.                                                                                                                             |
| 4   | Type            | `type`                                        | `type doc_type` ENUM (`textuel`/`iconographique`)                                                                                          | OK.                                                                                                                                        |
| 5   | Cat. icono      | `elements[].categorie_iconographique` (JSONB) | Dans le JSONB `elements`. **Mais aussi** une colonne `type_iconographique TEXT` existe sur `documents` (ajoutée par migration `20260330`). | **Incohérence schema.sql ↔ database.ts** : la colonne existe en DB mais pas dans les types générés. Le filtering actuel est JS post-fetch. |
| 6   | Cat. textuelle  | `elements[].categorie_textuelle` (JSONB)      | Colonne `categorie_textuelle document_categorie_textuelle` ENUM existe sur `documents` (migration `20260409`).                             | **Même problème** : existe en DB, pas dans les types générés. Index conditionnel existant.                                                 |
| 7   | Source type     | `elements[].source_type`                      | Colonne `source_type` existe sur `documents` (migration `20250327`). Aussi dans chaque element JSONB.                                      | Index existant `idx_doc_source_type`.                                                                                                      |
| 8   | Aspects         | `aspects_societe[]` GIN                       | `aspects_societe aspect_societe[]`, GIN indexed                                                                                            | OK. Hérités cumulativement via RPC.                                                                                                        |
| 9   | Connaissances   | `connaissances_ids[]` GIN                     | `connaissances_ids INT[]`, GIN indexed                                                                                                     | OK.                                                                                                                                        |
| 10  | Repère temporel | `repere_temporel`, `annee_normalisee`         | Les deux existent. `repere_temporel TEXT`, `annee_normalisee INT` (peut être négatif).                                                     | OK.                                                                                                                                        |
| 11  | Auteur          | `auteur_id`                                   | `auteur_id UUID`                                                                                                                           | OK.                                                                                                                                        |

#### Épreuves (table `evaluations`)

| #   | Facette                                      | Colonne spec                 | Réalité                                      | Verdict                                                                     |
| --- | -------------------------------------------- | ---------------------------- | -------------------------------------------- | --------------------------------------------------------------------------- |
| 1   | Recherche                                    | `titre` (ILIKE)              | `titre TEXT` — **pas d'index GIN trigram.**  | **Manque l'index.**                                                         |
| 2-5 | Niveau, Discipline, Connaissances, Nb tâches | via `evaluation_tae → tae.*` | Correct, jointure nécessaire.                | **Pas de vue matérialisée ni index existant pour supporter ces jointures.** |
| 6   | Auteur                                       | `auteur_id`                  | `auteur_id UUID`, indexé (`idx_eval_auteur`) | OK.                                                                         |

### Index GIN existants vs recommandés par la spec

**Existants :**

| Table       | Index                                                                                          | Type                        |
| ----------- | ---------------------------------------------------------------------------------------------- | --------------------------- |
| `tae`       | `idx_tae_consigne_search_trgm`                                                                 | GIN trigram                 |
| `tae`       | `idx_tae_aspects`                                                                              | GIN                         |
| `tae`       | `idx_tae_connaissances`                                                                        | GIN                         |
| `tae`       | `idx_tae_oi`, `idx_tae_comportement`, `idx_tae_niveau`, `idx_tae_discipline`, `idx_tae_auteur` | B-tree                      |
| `tae`       | `idx_tae_published`                                                                            | B-tree partial              |
| `documents` | `idx_doc_titre_trgm`                                                                           | GIN trigram                 |
| `documents` | `idx_doc_niveaux`, `idx_doc_disciplines`, `idx_doc_aspects`, `idx_doc_connaissances`           | GIN                         |
| `documents` | `idx_doc_type`, `idx_doc_auteur`, `idx_doc_published`, `idx_doc_source_type`                   | B-tree                      |
| `documents` | `idx_doc_type_iconographique`, `idx_doc_categorie_textuelle`                                   | B-tree partial conditionnel |

**Manquants selon spec :**

| Index recommandé                      | Existe ?                                                    | Verdict                                        |
| ------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------- |
| Composite `idx_tae_niveau_discipline` | **Non**                                                     | Nice-to-have, pas critique pour 1K-10K rows    |
| GIN trigram sur `evaluations.titre`   | **Non**                                                     | **Nécessaire** — actuellement ILIKE sans index |
| Index sur `evaluations.is_published`  | **Non** (seul `idx_evaluations_auteur_published` composite) | Utile                                          |

### RPCs existantes liées à la recherche

**Aucune.** Les 6 RPCs existantes sont toutes transactionnelles :

- `publish_tae_transaction`
- `update_tae_transaction`
- `save_evaluation_composition`
- `bump_tae_version`
- `inherit_metadata_to_source_doc`
- `record_tae_usage`

**Aucune RPC de recherche ou de comptage.** Tout le filtering actuel passe par le client Supabase PostgREST.

### RLS policies sur les tables de contenu

| Table         | Policy SELECT                                                                                            | Impact recherche                                                                                                              |
| ------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `tae`         | `tae_select` : `auth_is_active()` AND (`is_published` OR `auteur_id = uid` OR admin/CP ou collaborateur) | La banque ne montre que `is_published = TRUE`. RLS ne bloque pas car tous les utilisateurs actifs voient les tâches publiées. |
| `documents`   | `documents_select` : `auth_is_active()` AND (`is_published` OR `auteur_id = uid` OR admin/CP)            | Idem.                                                                                                                         |
| `evaluations` | Pattern similaire                                                                                        | OK.                                                                                                                           |

**Verdict :** RLS n'est pas un bloquant. La vue `banque_tae` (avec `security_invoker = true`) filtre déjà `is_published = TRUE AND is_archived = FALSE`. Les requêtes directes ajoutent `.eq("is_published", true)`.

---

## 3. CODE EXISTANT DE RECHERCHE

### Architecture actuelle

Le filtering est **entièrement server-side, zéro JavaScript de recherche côté client** :

1. L'utilisateur remplit un `<form method="get" action="/bank">` (HTML natif)
2. Le formulaire soumet, le navigateur navigue vers `/bank?onglet=taches&q=revolution&oi=OI1&...`
3. Le Server Component `app/(app)/bank/page.tsx` parse les `searchParams`
4. Les panel components (`BankTasksPanel`, `BankDocumentsPanel`, `BankEvaluationsPanel`) reçoivent les filtres en props
5. Chaque panel fetch ses données via `lib/queries/bank-*.ts`
6. Le client Supabase PostgREST chain les `.eq()`, `.ilike()`, `.contains()`, `.overlaps()`

**Fichiers clés :**

| Fichier                               | LOC  | Rôle                                                                   |
| ------------------------------------- | ---- | ---------------------------------------------------------------------- |
| `app/(app)/bank/page.tsx`             | 120  | Orchestration Server Component                                         |
| `lib/queries/bank-tasks.ts`           | 350+ | Query builder tâches + parsing + sérialisation                         |
| `lib/queries/bank-documents.ts`       | 280+ | Query builder documents                                                |
| `lib/queries/bank-evaluations.ts`     | 140  | Query builder épreuves                                                 |
| `lib/queries/bank-filter-ref-data.ts` | 70   | Données de référence filtres (OI, niveaux, disciplines, comportements) |
| `lib/bank/bank-aspect-param.ts`       | 60   | Mapping aspects URL ↔ DB                                               |
| `components/bank/BankTaskFilters.tsx` | 220  | UI filtres tâches                                                      |

### Filtres réellement implémentés

#### Tâches — 9/12 ✅ confirmé

| Filtre             | Implémenté | Méthode Supabase                                              |
| ------------------ | ---------- | ------------------------------------------------------------- |
| Recherche consigne | ✅         | `.ilike("consigne_search_plain", pattern)`                    |
| OI                 | ✅         | `.eq("oi_id", oiId)`                                          |
| Comportement       | ✅         | `.eq("comportement_id", comportementId)`                      |
| Niveau             | ✅         | `.eq("niveau_id", niveauId)`                                  |
| Discipline         | ✅         | `.eq("discipline_id", disciplineId)`                          |
| CD                 | ✅         | `.eq("cd_id", cdId)`                                          |
| Aspects            | ✅         | `.contains("aspects_societe", dbVals)` — sémantique **AND**   |
| Connaissances      | ✅         | `.overlaps("connaissances_ids", connIds)` — sémantique **OR** |
| Tri                | ✅         | `bank_popularity_score DESC` ou `updated_at DESC`             |
| Auteur             | ❌         |                                                               |
| École/CSS          | ❌         |                                                               |
| Nb documents       | ❌         |                                                               |

#### Documents — 5/11 ✅ confirmé

| Filtre              | Implémenté | Méthode                                              |
| ------------------- | ---------- | ---------------------------------------------------- |
| Recherche titre     | ✅         | `.ilike("titre", pattern)`                           |
| Discipline          | ✅         | `.contains("disciplines_ids", [id])`                 |
| Niveau              | ✅         | `.contains("niveaux_ids", [id])`                     |
| Type                | ✅         | `.eq("type", docType)`                               |
| Cat. iconographique | ✅         | **Post-fetch JS** (over-fetch 3×, filter en mémoire) |
| Cat. textuelle      | ❌         |                                                      |
| Source type         | ❌         |                                                      |
| Aspects             | ❌         |                                                      |
| Connaissances       | ❌         |                                                      |
| Repère temporel     | ❌         |                                                      |
| Auteur              | ❌         |                                                      |

#### Épreuves — 1/6 ✅ confirmé

| Filtre                                                   | Implémenté            |
| -------------------------------------------------------- | --------------------- |
| Recherche titre                                          | ✅ (ILIKE sans index) |
| Niveau / Discipline / Connaissances / Nb tâches / Auteur | ❌                    |

### Full-text search

**La spec se trompe sur le mécanisme.** Il n'y a **aucun `tsvector`** dans le repo. La recherche utilise :

- **`ILIKE` avec échappement** sur `consigne_search_plain` (tâches) et `titre` (documents, épreuves)
- **Index GIN trigram** (`gin_trgm_ops`) — supporte le `ILIKE` pattern matching, pas le full-text search PostgreSQL classique

Le code d'échappement (`escapeIlikePattern`) gère `%`, `_`, `\` et wrappe le terme avec `%term%`.

La spec §3.2 propose `query.textSearch('consigne_search_plain', filters.q, { type: 'plain', config: 'french' })` — **ceci ne fonctionnerait pas** car la colonne n'a pas d'index tsvector, seulement un index trigram.

### Pagination

Offset-based classique : `BANK_PAGE_SIZE = 20`, `.range(from, from + 19)` avec `{ count: 'exact' }`. Pages indexées à partir de **0** (pas 1). Le paramètre URL est `page=0`.

---

## 4. CONTRADICTIONS ET ÉCARTS

| #        | Ce que la spec dit                                                        | Ce que le repo fait                                                                                                                | Impact                                                                                                                                                                                                            |
| -------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **E-01** | Table `taches`                                                            | Table `tae`, vue `banque_tae`                                                                                                      | **Refonte section.** Tous les noms de table, les RPCs proposées, le query builder doivent utiliser `tae`.                                                                                                         |
| **E-02** | Table `epreuves`                                                          | Table `evaluations`                                                                                                                | **Refonte section.**                                                                                                                                                                                              |
| **E-03** | Route `/banque`                                                           | Route `/bank`                                                                                                                      | **Correction mineure** dans les paths et URLs.                                                                                                                                                                    |
| **E-04** | `plainto_tsquery('french', q)` / tsvector                                 | `ILIKE` + trigram GIN (`gin_trgm_ops`)                                                                                             | **Refonte §3.2 et §5.** Le mécanisme de recherche texte est fondamentalement différent. Pas de config `french`, pas de stemming, pas de ranking. Les RPCs SQL proposées utilisent `@@` qui ne fonctionnerait pas. |
| **E-05** | Slugs dans l'URL (`niveau=sec3`, `discipline=hec`, `oi=etablir-faits`)    | IDs numériques/texte dans l'URL (`niveau=3`, `discipline=1`, `oi=OI1`)                                                             | **Refonte §3.1 et §B.** Le système de slugs n'existe pas. Soit on l'ajoute (mapping slug ↔ ID), soit on garde les IDs existants. L'URL actuelle est `/bank?oi=OI1&niveau=1`.                                      |
| **E-06** | `schemas/search-params.ts` (racine)                                       | Devrait être `lib/schemas/search-params.ts`                                                                                        | **Correction mineure.**                                                                                                                                                                                           |
| **E-07** | `components/banque/`                                                      | `components/bank/`                                                                                                                 | **Correction mineure.**                                                                                                                                                                                           |
| **E-08** | Tab param `tab=taches`                                                    | Tab param `onglet=taches` (pour tâches), `onglet=documents`, `onglet=evaluations`                                                  | **Correction mineure** mais impacte tout le schema Zod.                                                                                                                                                           |
| **E-09** | `page` commence à 1                                                       | `page` commence à 0                                                                                                                | **Correction mineure** dans le schema et la pagination.                                                                                                                                                           |
| **E-10** | Aspects : `.overlaps()` (sémantique OR)                                   | Tâches : `.contains()` (sémantique **AND** — la tâche couvre TOUS les aspects cochés)                                              | **Correction §3.2.** La spec recommande OR, le repo fait AND. Choix métier à confirmer.                                                                                                                           |
| **E-11** | `consigne_search_plain` GIN = full-text                                   | C'est un `TEXT GENERATED` avec HTML stripping, indexé en trigram, filtré par `ILIKE`                                               | **Refonte.** Le nom de la colonne est trompeur — ce n'est pas du « plain text search » au sens PostgreSQL FTS.                                                                                                    |
| **E-12** | Colonnes `type_iconographique`, `categorie_textuelle` dans elements JSONB | Ces colonnes **existent aussi** au niveau table `documents` (migrations appliquées) — mais absentes de `database.ts`               | **Bug existant** à résoudre : regénérer les types OU vérifier que les migrations ont bien été appliquées. Si les colonnes existent en DB, le filtrage peut être SQL direct au lieu de JS post-fetch.              |
| **E-13** | `RPC search_taches(...)` proposée avec `SECURITY DEFINER`                 | Les requêtes passent par la vue `banque_tae` avec `security_invoker = true` (RLS du requérant). Aucune RPC de recherche existante. | **Choix architectural majeur.** La vue + client PostgREST fonctionne bien pour les tâches. L'Option C (hybride) est la plus réaliste.                                                                             |
| **E-14** | Compteurs de facettes dynamiques avec « facet exclusion »                 | **Aucun compteur n'existe.** Zero. Pas un seul.                                                                                    | **Fonctionnalité entièrement nouvelle.** C'est le plus gros chantier.                                                                                                                                             |
| **E-15** | `FacetPanel` client avec état remonté                                     | Les filtres actuels sont un `<form method="get">` HTML natif (Server Component). Zero état client.                                 | **Refactoring majeur** de `BankTaskFilters` et des panels documents/épreuves.                                                                                                                                     |

---

## 5. QUICK WINS

Les 5 éléments les plus faciles à shipper, en ordre de facilité :

### 1. Schema Zod `searchParamsSchema`

Remplacer le parsing impératif de `parseBankTaeQueryFromSearchParams()` dans `lib/queries/bank-tasks.ts` par un schema Zod discriminé. Zero dépendance externe, testable unitairement. Placer dans `lib/schemas/search-params.ts`.

### 2. Filtre `categorie_textuelle` pour les documents

La colonne existe en DB (migration `20260409`), l'index conditionnel `idx_doc_categorie_textuelle` existe. C'est symétrique au filtre `categorie_iconographique` déjà implémenté. Ajouter un `.eq("categorie_textuelle", value)` dans `lib/queries/bank-documents.ts` + UI dans `components/bank/BankDocumentsPanel.tsx`.

### 3. Filtre `source_type` pour les documents

La colonne `source_type` existe (migration `20250327`), l'index `idx_doc_source_type` existe. Un simple `.eq("source_type", value)` + un `<select>`.

### 4. Filtre `auteur` pour les tâches

`auteur_id` est dans la vue `banque_tae`, l'index `idx_tae_auteur` existe. La route handler `/api/collaborateurs/search/` existe déjà pour l'autocomplete. Il suffit d'ajouter `.eq("auteur_id", auteurId)` et de brancher le `ComboboxField` existant.

### 5. Remplacer les `<select>` natifs par `ListboxField`

Le composant `ListboxField` existe dans `components/ui/`, est accessible (ARIA complet, keyboard nav), mais n'est pas utilisé dans la banque. Migration cosmétique mais amélioration UX significative.

---

## 6. RISQUES TECHNIQUES

### Risques élevés

#### 1. Compteurs de facettes avec « facet exclusion »

C'est la fonctionnalité la plus complexe de la spec et elle n'a aucune base existante. Pour N facettes actives, il faut N+1 requêtes ou une RPC SQL complexe. Sur un dataset de 1K-10K rows c'est faisable en < 200ms, mais le code SQL est non trivial et difficile à maintenir.

**Recommandation : commencer sans compteurs, les ajouter en phase ultérieure.**

#### 2. Migration `<form method="get">` → état client URL

Le système actuel est un full-page reload à chaque changement de filtre. Passer à un hook `useSearchParamsState` avec `router.push` + `useTransition` change fondamentalement le modèle mental. Tous les panels (tâches, documents, épreuves) doivent être refactorés de Server Components purs à un pattern hybride (Server Component data-fetching + Client Component state).

#### 3. Bottom sheet mobile

Complexité d'implémentation élevée (scroll interne vs externe, gestes, iOS Safari). Aucune dépendance existante dans le projet.

**Recommandation : commencer par un drawer plein écran simple (pattern `SimpleModal` existant).**

#### 4. Filtres épreuves via jointure

Les facettes Niveau, Discipline, Connaissances sur les épreuves nécessitent `evaluation_tae JOIN tae`. Le client Supabase PostgREST ne supporte pas les agrégats JOIN pour le filtrage.

**Nécessite soit une RPC, soit une vue matérialisée, soit une dénormalisation.**

### Risques modérés

#### 5. Incohérence `database.ts` vs DB réelle

Les colonnes `type_iconographique`, `categorie_textuelle`, `source_type` existent en DB (migrations appliquées) mais sont absentes des types générés. Un `npm run gen:types` devrait résoudre — à vérifier.

#### 6. Sémantique aspects AND vs OR

Le repo fait `.contains()` (AND), la spec propose `.overlaps()` (OR). Les deux sont défendables métier. À trancher explicitement.

### Risques faibles

#### 7. Mapping slug ↔ ID

La spec propose des slugs lisibles dans l'URL. Le repo utilise des IDs. Si on garde les IDs (recommandé pour le MVP), ce risque disparaît.

### Dépendances manquantes

**Aucune dépendance npm manquante.** Tout le stack nécessaire est déjà installé (Zod, Supabase client, Next.js App Router, Tailwind). Le seul ajout potentiel serait une lib de bottom sheet (ex : `vaul` de Emil Kowalski), mais ce n'est pas nécessaire pour un MVP drawer.

### Migrations DB nécessaires

1. **Index GIN trigram sur `evaluations.titre`** — pour le search épreuves
2. **Vue matérialisée ou RPC pour les filtres épreuves** — si on implémente niveau/discipline sur les épreuves
3. **Compteurs de facettes** (si RPC) — nouvelles fonctions SQL

---

## 7. RECOMMANDATIONS POUR LA SPEC V0.2

### Corrections factuelles obligatoires

| Section  | Correction                                                                                                                    |
| -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Partout  | Remplacer `taches` → `tae` (table), `banque_tae` (vue)                                                                        |
| Partout  | Remplacer `epreuves` → `evaluations` (table)                                                                                  |
| §3.1     | URL : `tab` → `onglet`, `page` base-0 (pas base-1), IDs numériques (pas slugs)                                                |
| §3.1     | URL actuelle : `/bank?onglet=taches&q=...&oi=OI1&niveau=1&discipline=1`                                                       |
| §3.2     | Remplacer `textSearch(..., { type: 'plain', config: 'french' })` par `.ilike("consigne_search_plain", escapeIlikePattern(q))` |
| §3.2     | `from('taches')` → `from('banque_tae')` pour les tâches                                                                       |
| §3.2     | Aspects : documenter le choix AND (`.contains`) vs OR (`.overlaps`)                                                           |
| §3.3     | Les RPCs SQL avec `@@ plainto_tsquery` ne fonctionnent pas — trigram + ILIKE                                                  |
| §7.2     | Les index partiels `WHERE statut = 'publie'` → `WHERE is_published = TRUE` (pas de colonne `statut`)                          |
| Annexe B | Supprimer le mapping slug — les IDs existent déjà (`OI1`, `1`, `2`, etc.)                                                     |
| Annexe C | Corriger l'arbre de fichiers (voir §1 ci-dessus)                                                                              |

### Sections à réécrire

#### §3.2 Query Builder

Repartir du code existant dans `lib/queries/bank-tasks.ts`. Le pattern de chaining `.eq()/.ilike()/.contains()/.overlaps()` fonctionne. Le rendre plus modulaire (appliers) est un bon objectif, mais partir du code réel.

#### §3.3 RPCs

Recommander l'**Option C (hybride)** :

- **Tâches** : garder la vue `banque_tae` + PostgREST (fonctionne très bien)
- **Documents** : garder PostgREST direct (fonctionne)
- **Épreuves** : **une RPC** `search_evaluations(filters)` car les jointures via `evaluation_tae` sont nécessaires
- **Compteurs** : si implémentés, une RPC dédiée par entité `count_facets_tae(filters)` appelée en parallèle

#### §5 Compteurs

Proposer une implémentation progressive :

- **Phase 1** : zéro compteur (focus UX filtrage)
- **Phase 2** : compteurs totaux par onglet (simple `COUNT` avec filtres communs)
- **Phase 3** : compteurs dynamiques par facette (RPC avec facet exclusion)

#### §4.4 Layout responsive

Recommander un drawer modal (`SimpleModal` étendu ou pattern similaire) plutôt qu'un bottom sheet pour le MVP mobile. Le bottom sheet est une v2.

### Ajouts recommandés

- **Section « Code existant »** : documenter les 4 fichiers query existants, les types existants (`BankTaeQuery`, `BankTaeFilters`, `BankDocumentFilters`), le pattern `serializeBankTaeQueryForHref()`.
- **Section « Migration incrémentale »** : la spec suppose un greenfield. En réalité, il faut transformer progressivement le code existant. Proposer un plan de migration en 3 étapes :
  1. Zod schema + refactor parsing
  2. Client-side URL management + facet panel UI
  3. Compteurs et facettes avancées
- **`database.ts` sync** : ajouter comme pré-requis un `npm run gen:types` pour inclure les colonnes manquantes (`type_iconographique`, `categorie_textuelle`, `source_type`).
