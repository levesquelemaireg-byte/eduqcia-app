# SCHEMA-REFACTOR-PLAN.md — Normalisation profiles (nom, école, CSS)

> **Statut :** ✅ FERMÉ — implémenté le 14 avril 2026
> **Date de création :** 2026-04-13
> **Date de fermeture :** 2026-04-14
> **Auteur :** Copilot (sur directives développeur)
>
> **Résultat :** 4 migrations SQL appliquées (`20260414100000` à `20260414140000`), seed CSS/écoles (72 CSS, 602 écoles), ~40 fichiers créés/modifiés. Voir `BACKLOG-HISTORY.md` (entrée 14 avril 2026) pour le détail complet.

---

## Table des matières

0. [Conventions de nommage](#0-conventions-de-nommage)
1. [Script de seed CSS + écoles](#1-script-de-seed-css--écoles)
2. [Migrations SQL (ordre strict)](#2-migrations-sql-ordre-strict)
3. [Refactoring code applicatif](#3-refactoring-code-applicatif)
4. [Refactoring /register](#4-refactoring-register)
5. [Tests à écrire](#5-tests-à-écrire)
6. [Ordre d'exécution et rollback](#6-ordre-dexécution-et-rollback)
7. [Impact sur profil-ux-spec.md](#7-impact-sur-profil-ux-specmd)
8. [Pont vers l'implémentation profil/collaborateurs](#8-pont-vers-limplémentation-profilcollaborateurs)

---

## 0. Conventions de nommage

### 0.1 Règles générales

| Contexte                                              | Convention                      | Exemple                                     |
| ----------------------------------------------------- | ------------------------------- | ------------------------------------------- |
| Identifiants SQL (tables, colonnes, fonctions)        | `snake_case`, **pas d'accents** | `first_name`, `nom_officiel`, `css_id`      |
| Identifiants TypeScript (variables, props, fonctions) | `camelCase`                     | `firstName`, `schoolId`, `getDisplayName()` |
| Types / interfaces TypeScript                         | `PascalCase`                    | `ActiveAppUser`, `CssRow`, `SchoolRow`      |
| Composants React                                      | `PascalCase`                    | `ComboboxField`, `CssSchoolCascade`         |
| Fichiers                                              | `kebab-case`                    | `profile-display.ts`, `css-schools.ts`      |

### 0.2 Distinction « niveau » et « discipline » — deux sens

Les mots **niveau** et **discipline** ont deux sens distincts dans l'app. Cette ambiguïté est une source de confusion permanente. La convention ci-dessous est **normative** pour tout nouveau code.

#### Sens 1 — Propriété d'un contenu pédagogique (indexation)

Le niveau ou la discipline **d'une tâche, d'un document ou d'une épreuve**.

| SQL                     | TypeScript            | UI                                       |
| ----------------------- | --------------------- | ---------------------------------------- |
| `tae.niveau_id`         | `tae.niveauId`        | « Niveau de la tâche », « Niveau cible » |
| `tae.discipline_id`     | `tae.disciplineId`    | « Discipline de la tâche »               |
| `documents.niveaux_ids` | `document.niveauxIds` | « Niveaux du document »                  |

**Statut :** inchangé. On ne touche à rien. C'est la propriété d'un contenu.

#### Sens 2 — Propriété d'un profil enseignant

Les niveaux et disciplines **qu'un enseignant enseigne**.

| SQL                                                   | TypeScript                      | UI                         |
| ----------------------------------------------------- | ------------------------------- | -------------------------- |
| `profile_niveaux_enseignes` (table pivot future)      | `profile.niveauxEnseignes`      | « Niveaux enseignés »      |
| `profile_disciplines_enseignees` (table pivot future) | `profile.disciplinesEnseignees` | « Disciplines enseignées » |

**Statut :** ces tables pivot ne font **PAS** partie de ce refactoring. Elles seront créées dans le refactoring de la spec profil/collaborateurs (phase suivante). La convention est documentée ici pour éviter toute ambiguïté dès maintenant.

**Noms interdits** pour les tables pivot du profil : ~~`profile_niveaux`~~, ~~`profile_disciplines`~~ — trop ambigus, pourraient être confondus avec le niveau/discipline d'un contenu.

### 0.3 Helpers d'affichage du profil

Tous les helpers de composition du nom affiché passent par un fichier unique :

```
lib/utils/profile-display.ts
  ├── getDisplayName(firstName, lastName)  → "Prénom Nom"
  ├── getInitials(firstName, lastName)     → "PL"
  └── getSortKey(firstName, lastName)      → "nom, prénom" (collation fr-CA)
```

Aucun autre fichier ne doit composer un nom d'affichage à partir de `first_name` / `last_name` directement.

---

## 1. Script de seed CSS + écoles

### 1.1 Fichier : `scripts/seed-css-schools.ts`

**Sources CSV (déjà dans `public/data/raw/`) :**

| Fichier                       | Lignes utiles | Filtre       |
| ----------------------------- | ------------- | ------------ |
| `css-quebec.csv`              | 72 CSS        | aucun (tous) |
| `ecoles-publiques-quebec.csv` | 860 / 5 462   | `SEC = 1`    |

**Pas d'écoles privées** — `etablissements-prives-quebec.csv` n'a ni colonne SEC/PRIM ni CD_CS. Exclu du MVP.

### 1.2 Colonnes CSV exploitées

**css-quebec.csv :**

| Colonne CSV | Colonne SQL            | Notes                              |
| ----------- | ---------------------- | ---------------------------------- |
| `CD_ORGNS`  | `gov_id` (TEXT UNIQUE) | Code 6 chiffres, clé naturelle MEQ |
| `NOM_OFFCL` | `nom_officiel`         | Nom complet                        |
| `NOM_COURT` | `nom_court`            | Nom abrégé                         |
| `TYPE_CS`   | `type_cs`              | `'Franco'`, `'Anglo'`, `'Statut'`  |

**ecoles-publiques-quebec.csv :**

| Colonne CSV       | Colonne SQL            | Notes                              |
| ----------------- | ---------------------- | ---------------------------------- |
| `CD_ORGNS`        | `gov_id` (TEXT UNIQUE) | Code 6 chiffres, clé naturelle MEQ |
| `NOM_OFFCL_ORGNS` | `nom_officiel`         | Nom complet de l'école             |
| `CD_CS`           | → lookup `css.gov_id`  | FK vers CSS                        |
| `SEC`             | filtre `= 1`           | Non stocké en colonne              |

### 1.3 Algorithme du script

```
1. Lire .env.local (pattern existant seed-test-user.ts)
2. Créer client Supabase service_role
3. Parser css-quebec.csv (encoding latin1 → UTF-8)
4. Pour chaque CSS :
   a. UPSERT dans `css` ON CONFLICT (gov_id)
   b. Si existant mais données différentes → UPDATE + log
5. Parser ecoles-publiques-quebec.csv (encoding latin1 → UTF-8)
6. Filtrer SEC = 1
7. Pour chaque école SEC=1 :
   a. Lookup css_id via Map<gov_id, uuid> (pré-chargée étape 4)
   b. UPSERT dans `schools` ON CONFLICT (gov_id)
   c. Si CD_CS ne matche aucun CSS → warning + skip
8. Soft-delete :
   a. CSS absents du CSV → UPDATE is_active = false
   b. Écoles absentes du CSV (parmi SEC=1) → UPDATE is_active = false
9. Logger résumé dans console :
   - CSS : X insérés, Y mis à jour, Z désactivés
   - Écoles : X insérées, Y mises à jour, Z désactivées
10. Écrire changelog JSON dans public/data/seed-logs/YYYY-MM-DD_css-schools.json
```

### 1.4 Encodage CSV

Les CSV du MEQ sont en **latin1** (Windows-1252). Le script doit :

```typescript
import { readFileSync } from "node:fs";

// Node.js TextDecoder supporte latin1 nativement
const buf = readFileSync(csvPath);
const text = new TextDecoder("latin1").decode(buf);
```

### 1.5 npm script

```jsonc
// package.json → scripts
"seed:schools": "npx tsx scripts/seed-css-schools.ts"
```

### 1.6 Idempotence

Le script est conçu pour être ré-exécuté sans danger :

- `UPSERT ON CONFLICT (gov_id)` — jamais de doublon
- Soft-delete par `is_active = false` — jamais de DELETE
- Le changelog accumule les logs datés

---

## 2. Migrations SQL (ordre strict)

### Convention de nommage

Format existant : `YYYYMMDDHHMMSS_description.sql`. La dernière migration est `20260413220000`. Les 5 migrations ci-dessous sont numérotées séquentiellement.

### Migration 1 : `20260414100000_create_css_schools_tables.sql`

Crée les tables `css` et `schools` **avant** le seed.

```sql
-- ============================================================
-- Tables de référence : CSS et écoles publiques secondaires
-- Source : données ouvertes MEQ (csv-quebec.csv, ecoles-publiques-quebec.csv)
-- ============================================================

-- Type enum pour les catégories de CSS
CREATE TYPE css_type AS ENUM ('Franco', 'Anglo', 'Statut');

-- Centres de services scolaires
CREATE TABLE css (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gov_id       TEXT NOT NULL UNIQUE,      -- CD_ORGNS du MEQ (6 chiffres)
  nom_officiel TEXT NOT NULL,
  nom_court    TEXT NOT NULL,
  type_cs      css_type NOT NULL,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Écoles publiques secondaires
CREATE TABLE schools (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gov_id       TEXT NOT NULL UNIQUE,      -- CD_ORGNS du MEQ (6 chiffres)
  css_id       UUID NOT NULL REFERENCES css(id) ON DELETE RESTRICT,
  nom_officiel TEXT NOT NULL,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_css_gov_id        ON css (gov_id);
CREATE INDEX idx_css_active        ON css (is_active) WHERE is_active = TRUE;
CREATE INDEX idx_schools_gov_id    ON schools (gov_id);
CREATE INDEX idx_schools_css_id    ON schools (css_id);
CREATE INDEX idx_schools_active    ON schools (is_active) WHERE is_active = TRUE;
CREATE INDEX idx_schools_nom_trgm  ON schools USING GIN (nom_officiel gin_trgm_ops);
CREATE INDEX idx_css_nom_trgm      ON css USING GIN (nom_officiel gin_trgm_ops);

-- RLS
ALTER TABLE css     ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

-- Lecture : tout utilisateur actif (même pattern que niveaux/disciplines)
CREATE POLICY "ref_select" ON css     FOR SELECT USING (auth_is_active());
CREATE POLICY "ref_select" ON schools FOR SELECT USING (auth_is_active());

-- Admin : CRUD complet
CREATE POLICY "ref_admin" ON css     FOR ALL USING (auth_role() = 'admin');
CREATE POLICY "ref_admin" ON schools FOR ALL USING (auth_role() = 'admin');

-- Triggers updated_at
CREATE TRIGGER trg_css_updated_at     BEFORE UPDATE ON css     FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_schools_updated_at BEFORE UPDATE ON schools FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Accès service_role pour le seed (bypass RLS par défaut sur service_role)
-- Pas de politique INSERT publique — seul le seed et l'admin écrivent.
```

### Migration 2 : seed exécuté manuellement

**Pas une migration SQL.** Exécuter `npm run seed:schools` après la migration 1. Le script utilise le client `service_role` (bypass RLS).

### Migration 3 : `20260414120000_profiles_add_name_school_columns.sql`

Ajoute les nouvelles colonnes **sans supprimer** les anciennes (transition douce).

```sql
-- Ajout des colonnes normalisées sur profiles
-- Les anciennes colonnes (full_name, school) restent présentes pour la migration de données

ALTER TABLE profiles
  ADD COLUMN first_name TEXT,
  ADD COLUMN last_name  TEXT,
  ADD COLUMN school_id  UUID REFERENCES schools(id) ON DELETE SET NULL;

-- Index pour les recherches
CREATE INDEX idx_profiles_school_id  ON profiles (school_id);
CREATE INDEX idx_profiles_last_name  ON profiles (last_name);

-- Commentaires
COMMENT ON COLUMN profiles.first_name IS 'Prénom — remplace full_name (migration en cours)';
COMMENT ON COLUMN profiles.last_name  IS 'Nom de famille — remplace full_name (migration en cours)';
COMMENT ON COLUMN profiles.school_id  IS 'FK école secondaire — remplace school TEXT (migration en cours)';
```

### Migration 4 : `20260414130000_profiles_migrate_existing_data.sql`

Migre les données existantes des anciennes colonnes vers les nouvelles.

```sql
-- Migration des données existantes profiles.full_name → first_name + last_name
-- Convention existante : "Prénom Nom" (espace simple)
-- Gestion du cas "Nom, Prénom" (virgule) si présent

-- Cas standard "Prénom Nom" (dernier espace sépare le nom de famille)
UPDATE profiles
SET
  first_name = CASE
    WHEN full_name LIKE '%,%'
      THEN trim(split_part(full_name, ',', 2))
    WHEN full_name LIKE '% %'
      THEN trim(left(full_name, length(full_name) - length(split_part(full_name, ' ', -1)) - 1))
    ELSE full_name
  END,
  last_name = CASE
    WHEN full_name LIKE '%,%'
      THEN trim(split_part(full_name, ',', 1))
    WHEN full_name LIKE '% %'
      THEN trim(split_part(full_name, ' ', -1))
    ELSE ''
  END
WHERE first_name IS NULL AND full_name IS NOT NULL;

-- Migration school TEXT (JSON) → school_id (FK)
-- Le JSON stocké est : {"css":"Nom du CSS","ecole":"Nom école","niveau":"Secondaire N"}
-- On matche par nom d'école + nom de CSS. Le champ "niveau" du JSON est IGNORÉ
-- (les niveaux enseignés seront saisis via le Side Sheet post-inscription).

-- Étape 1 : matcher les profils dont le JSON est parseable
-- Note : cette requête utilise les noms exacts du css-ecoles.json existant
-- Les cas non matchés gardent school_id = NULL (à résoudre manuellement si nécessaire)
UPDATE profiles p
SET school_id = s.id
FROM schools s
JOIN css c ON c.id = s.css_id
WHERE p.school IS NOT NULL
  AND p.school LIKE '{%'  -- JSON uniquement, pas texte libre
  AND p.school_id IS NULL
  AND s.nom_officiel = trim(both '"' FROM (p.school::jsonb->>'ecole'))
  AND c.nom_officiel = trim(both '"' FROM (p.school::jsonb->>'css'));

-- Log des profils non migrés (pour vérification manuelle)
-- DO $$ ... $$ bloc pour afficher dans les logs de migration
DO $$
DECLARE
  v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM profiles
  WHERE school IS NOT NULL
    AND school LIKE '{%'
    AND school_id IS NULL;
  IF v_count > 0 THEN
    RAISE NOTICE '% profil(s) avec school JSON non migré(s) vers school_id — vérification manuelle requise', v_count;
  END IF;

  SELECT COUNT(*) INTO v_count
  FROM profiles
  WHERE first_name IS NULL AND full_name IS NOT NULL;
  IF v_count > 0 THEN
    RAISE NOTICE '% profil(s) avec full_name non migré(s) vers first_name/last_name', v_count;
  END IF;
END;
$$;
```

### Migration 5 : `20260414140000_profiles_drop_old_columns_finalize.sql`

**⚠️ Cette migration NE DOIT PAS être exécutée tant que tout le code applicatif n'a pas été migré.** Elle sera la dernière étape du refactoring.

```sql
-- ============================================================
-- FINALISATION : suppression des anciennes colonnes
-- PRÉREQUIS : tout le code applicatif utilise first_name/last_name/school_id
-- ============================================================

-- 1. Rendre les nouvelles colonnes NOT NULL
ALTER TABLE profiles ALTER COLUMN first_name SET NOT NULL;
ALTER TABLE profiles ALTER COLUMN last_name  SET NOT NULL;

-- 2. Supprimer les anciennes colonnes
ALTER TABLE profiles DROP COLUMN full_name;
ALTER TABLE profiles DROP COLUMN school;

-- 3. Mettre à jour la vue banque_tae
CREATE OR REPLACE VIEW banque_tae
WITH (security_invoker = true)
AS
SELECT
  t.id,
  t.auteur_id,
  p.first_name                      AS auteur_prenom,
  p.last_name                       AS auteur_nom,
  s.nom_officiel                    AS auteur_ecole,
  c_css.nom_officiel                AS auteur_css,
  left(trim(t.consigne), 80)        AS apercu,
  t.consigne,
  t.consigne_search_plain,
  (
    COALESCE(vc.total_votants, 0)
    + COALESCE(
      (SELECT COUNT(*)::int FROM evaluation_tae et WHERE et.tae_id = t.id),
      0
    )
  )::int                            AS bank_popularity_score,
  t.oi_id,
  oi.titre                          AS oi_titre,
  oi.status                         AS oi_status,
  t.comportement_id,
  co.enonce                         AS comportement_enonce,
  co.nb_documents,
  t.niveau_id,
  n.label                           AS niveau_label,
  n.cycle,
  t.discipline_id,
  d.label                           AS discipline_label,
  t.aspects_societe,
  t.cd_id,
  t.connaissances_ids,
  t.version,
  t.version_updated_at,
  t.created_at,
  t.updated_at,
  vc.total_votants,
  vc.rigueur_n1,    vc.rigueur_n2,    vc.rigueur_n3,
  vc.clarte_n1,     vc.clarte_n2,     vc.clarte_n3,
  vc.alignement_n1, vc.alignement_n2, vc.alignement_n3
FROM tae t
JOIN profiles p           ON p.id  = t.auteur_id
LEFT JOIN schools s       ON s.id  = p.school_id
LEFT JOIN css c_css       ON c_css.id = s.css_id
LEFT JOIN oi              ON oi.id = t.oi_id
LEFT JOIN comportements co ON co.id = t.comportement_id
LEFT JOIN niveaux n       ON n.id  = t.niveau_id
LEFT JOIN disciplines d   ON d.id  = t.discipline_id
LEFT JOIN vote_counts vc  ON vc.tae_id = t.id AND vc.tae_version = t.version
WHERE t.is_published = TRUE
  AND t.is_archived  = FALSE;

-- 4. Mettre à jour la politique RLS profiles_update_own
-- (les colonnes role/status restent protégées, plus besoin de garder full_name/school)
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role   = (SELECT role   FROM profiles WHERE id = auth.uid())
    AND status = (SELECT status FROM profiles WHERE id = auth.uid())
  );
```

### Résumé des 5 migrations

| #   | Fichier                              | Dépend de          | Réversible ?                    |
| --- | ------------------------------------ | ------------------ | ------------------------------- |
| 1   | `create_css_schools_tables`          | —                  | DROP tables                     |
| 2   | `npm run seed:schools`               | M1                 | TRUNCATE css, schools           |
| 3   | `profiles_add_name_school_columns`   | M1                 | DROP columns                    |
| 4   | `profiles_migrate_existing_data`     | M3 + seed          | SET NULL les nouvelles colonnes |
| 5   | `profiles_drop_old_columns_finalize` | Tout le code migré | **NON RÉVERSIBLE** sauf backup  |

---

## 3. Refactoring code applicatif

### 3.1 Nouvelles utilités

#### `lib/utils/profile-display.ts` (NOUVEAU)

```typescript
/**
 * Helpers d'affichage pour les profils (first_name + last_name).
 * Source unique de vérité pour la composition du nom affiché.
 */

/** "Prénom Nom" */
export function getDisplayName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

/** "PL" (initiales majuscules) */
export function getInitials(firstName: string, lastName: string): string {
  const f = firstName.trim().charAt(0).toUpperCase();
  const l = lastName.trim().charAt(0).toUpperCase();
  return `${f}${l}`.trim();
}

/** "nom, prénom" pour tri alphabétique — clé de collation fr-CA */
export function getSortKey(firstName: string, lastName: string): string {
  return `${lastName.trim()}, ${firstName.trim()}`.toLowerCase();
}
```

### 3.2 Types à modifier

| Fichier                               | Modification                                                                                                                                      |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lib/types/database.ts`               | Régénéré via `npm run gen:types` après migrations 1-4                                                                                             |
| `lib/auth/require-active-app-user.ts` | `ActiveAppUser` : remplacer `fullName: string` par `firstName: string`, `lastName: string` ; query `.select("id, first_name, last_name, status")` |
| `lib/fiche/types.ts`                  | `AuteurInfo` : `full_name` → `first_name` + `last_name`                                                                                           |
| `lib/tache/tache-form-state-types.ts` | Vérifier si `full_name` apparaît dans les types auteur du wizard                                                                                  |

### 3.3 Queries à modifier (fichier par fichier)

#### `lib/queries/collaborateurs-list.ts`

| Avant                                         | Après                                                                                                  |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `CollaborateurListRow.full_name`              | `.first_name` + `.last_name`                                                                           |
| `CollaborateurListRow.school: string \| null` | `.school_id: string \| null` (ou objet joint)                                                          |
| `.select("id, full_name, email, school")`     | `.select("id, first_name, last_name, email, school_id, schools(nom_officiel, css:css(nom_officiel))")` |
| `.order("full_name", …)`                      | `.order("last_name", …)`                                                                               |

#### `lib/queries/collaborateur-profile-search.ts`

| Avant                                                  | Après                                                                    |
| ------------------------------------------------------ | ------------------------------------------------------------------------ |
| `CollaborateurProfileSearchRow.full_name`              | `.first_name` + `.last_name`                                             |
| `CollaborateurProfileSearchRow.school: string \| null` | `.school_id: string \| null` + joined data                               |
| `.ilike("full_name", pattern)`                         | `.or(\`first_name.ilike.%${term}%,last_name.ilike.%${term}%\`)`          |
| `.ilike("school", pattern)`                            | Recherche par JOIN : requête séparée sur `schools` puis `IN (school_id)` |
| `.sort(… a.full_name …)`                               | `.sort(… getSortKey(a.first_name, a.last_name) …)`                       |

**Note :** la recherche par école sur du JSON `.ilike("school", pattern)` était déjà fragile. Avec la FK, deux stratégies possibles :

1. **Sous-requête** : chercher dans `schools` par `nom_officiel ILIKE`, récupérer les IDs, puis filtrer `profiles.school_id IN (…)`
2. **Vue matérialisée** : si la performance devient un enjeu (peu probable avec 860 écoles)

Recommandation : stratégie 1 (sous-requête) — simple et suffisant.

#### `lib/queries/tache-for-edit.ts`

Remplacer `.select("… profiles!auteur_id(full_name) …")` par `.select("… profiles!auteur_id(first_name, last_name) …")`.

#### `lib/queries/evaluation-tache-picker.ts`

Même pattern que ci-dessus.

#### `lib/queries/bank-evaluations.ts`

Même pattern si `full_name` y est joint.

#### `lib/queries/dashboard.ts`

Véfifier si `school` y est lu directement (probable pour l'affichage dashboard).

### 3.4 Server Actions à modifier

#### `lib/actions/auth-register.ts`

Refactoring complet — voir [Section 4](#4-refactoring-register).

### 3.5 Composants à modifier

| Composant                                       | Changement                                                                                               |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `components/layout/Sidebar.tsx`                 | `displayName` prop → composé via `getDisplayName()` dans le layout parent                                |
| `components/layout/AppShellClient.tsx`          | Même adaptation                                                                                          |
| `components/layout/AppShell.tsx`                | Même adaptation                                                                                          |
| `app/(app)/layout.tsx`                          | `fullName` → `getDisplayName(user.firstName, user.lastName)`                                             |
| `app/(app)/dashboard/page.tsx`                  | `full_name` et `school` → nouvelles colonnes + `getDisplayName()` + `formatSchoolDisplay()` depuis la FK |
| `app/(app)/collaborateurs/page.tsx`             | Adapter au nouveau type `CollaborateurListRow`                                                           |
| `app/(app)/questions/[id]/edit/page.tsx`        | Adapter lecture `full_name`                                                                              |
| `app/(app)/questions/new/page.tsx`              | Adapter lecture `full_name`                                                                              |
| `components/tache/Bloc1AuteursTache.tsx`        | Adapter type auteur                                                                                      |
| `components/tache/CollaborateurSearchField.tsx` | Adapter résultats search                                                                                 |
| `components/tache/FicheSommaireColumn.tsx`      | Adapter affichage auteur                                                                                 |
| `components/tache/FicheFooter.tsx`              | Adapter affichage auteur                                                                                 |
| Composants print `(print)/`                     | Adapter partout où `full_name` est lu                                                                    |

### 3.6 Helpers à modifier / supprimer

| Fichier                            | Action                                                                                                                  |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `lib/tache/auteur-display-sort.ts` | **Simplifier** : `familyNameSortKey()` → `getSortKey()` direct. `sortAuteursByFamilyName()` → tri sur `last_name` natif |
| `lib/profiles/school-json.ts`      | **SUPPRIMER** entièrement — `parseSchoolJson()` et `formatSchoolForDisplay()` n'ont plus de raison d'être               |
| `lib/data/load-css-ecoles.ts`      | **SUPPRIMER** entièrement — remplacé par les tables `css`/`schools`                                                     |
| `public/data/css-ecoles.json`      | **SUPPRIMER** — données maintenant en base                                                                              |

### 3.7 Nouveaux helpers

| Fichier                                | Fonction                                                                |
| -------------------------------------- | ----------------------------------------------------------------------- |
| `lib/utils/profile-display.ts`         | `getDisplayName()`, `getInitials()`, `getSortKey()` (voir §3.1)         |
| `lib/queries/css-schools.ts` (NOUVEAU) | `getAllCss()`, `getSchoolsByCssId()` — queries pour le combobox cascadé |

### 3.8 Fiche lecture (selectors)

Les selectors dans `lib/fiche/selectors/` qui extraient `auteur_nom` depuis `banque_tae` ou les données jointes devront s'adapter aux nouveaux noms de colonnes (`auteur_prenom`, `auteur_nom` au lieu de `auteur_nom` seul).

**Fichiers concernés :**

- `lib/fiche/selectors/lecture-selectors.ts`
- `lib/fiche/fiche-helpers.ts`
- `lib/tache/server-fiche-map.ts`
- `lib/tache/load-tache-for-edit.ts`
- `lib/documents/fetch-doc-fiche-data.ts`

### 3.9 Ordre de modification build-safe

L'objectif est de ne **jamais** casser le build entre deux commits. Voici l'ordre :

```
Phase A — Ajout sans cassure
  1. Créer lib/utils/profile-display.ts (nouveau, aucune dépendance)
  2. Créer lib/queries/css-schools.ts (nouveau, dépend de database.ts régénéré)
  3. npm run gen:types (après migrations 1-4)

Phase B — Transition douce (code lit les DEUX colonnes)
  4. Modifier ActiveAppUser : ajouter firstName/lastName en gardant fullName
  5. Modifier les queries : ajouter first_name/last_name dans les SELECT
  6. Modifier les composants : utiliser getDisplayName() mais fallback fullName

Phase C — Migration complète
  7. Supprimer fullName des types
  8. Supprimer les références à full_name/school dans les queries
  9. Supprimer school-json.ts, load-css-ecoles.ts, css-ecoles.json
  10. Simplifier auteur-display-sort.ts

Phase D — Finalisation SQL
  11. Exécuter Migration 5 (DROP columns)
  12. npm run gen:types (final)
  13. npm run ci
```

---

## 4. Refactoring /register

### 4.1 Changements Zod (`lib/schemas/auth.ts`)

```typescript
// Avant (actuel)
css: z.string(),
school: z.string(),
niveau: z.string(),

// Après
css_id: z.string().uuid("Centre de services invalide"),
school_id: z.string().uuid("École invalide"),
// niveau : SUPPRIMÉ — saisi après inscription via le Side Sheet (PROFILE-UX-SPEC §5.5)

// superRefine : vérifier cohérence css_id ↔ school_id côté serveur
// (l'école appartient bien au CSS sélectionné)
// Supprimer la validation superRefine sur niveau (plus de champ niveau)
```

**Champ `niveau` : SUPPRIMÉ.** La spec profil/collaborateurs (PROFILE-UX-SPEC §5.5) tranche explicitement que les niveaux enseignés sont saisis **après** l'inscription via le Side Sheet d'édition du profil, pas à l'inscription. L'inscription capture uniquement : prénom, nom, email, mot de passe, rôle, CSS, école.

### 4.2 Server Action (`lib/actions/auth-register.ts`)

**Changements majeurs :**

1. **Supprimer** `import { loadCssEcoles, validateCssAndSchool }` — remplacé par une query Supabase
2. **Supprimer** toute logique liée au champ `niveau` (variable `niveau`, validation, stockage)
3. **Validation CSS + école** :

   ```typescript
   // Vérifier que school_id existe et appartient au css_id fourni
   const { data: school } = await admin
     .from("schools")
     .select("id, css_id")
     .eq("id", input.school_id)
     .eq("is_active", true)
     .maybeSingle();

   if (!school || school.css_id !== input.css_id) {
     return { error: { code: "failed", message: "École ou centre de services invalide." } };
   }
   ```

4. **Upsert profiles** :

   ```typescript
   // Avant
   full_name: fullName,
   school: schoolJson,

   // Après
   first_name: firstName,
   last_name: lastName,
   school_id: isEnseignant ? input.school_id : null,
   // PAS de colonne niveau — sera saisi via Side Sheet post-inscription
   ```

5. **Supprimer** `JSON.stringify({ css, ecole: school, niveau })` — plus de JSON en TEXT
6. **auth.signUp `options.data`** : remplacer `full_name: fullName` par `first_name: firstName, last_name: lastName`

### 4.3 Composant `RegisterForm.tsx` — combobox cascadé

#### Choix technique du combobox

Le formulaire d'inscription contient actuellement un `ListboxField` (dropdown simple) pour CSS et école. Avec 72 CSS et potentiellement 860 écoles, un **combobox avec recherche textuelle** est nécessaire.

**3 options évaluées :**

| Option                                 | Pros                                                                         | Cons                                                                                | Recommandation           |
| -------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------ |
| **A. Étendre `ListboxField` existant** | Zéro dépendance, cohérence UI parfaite, maîtrise complète                    | Effort significatif pour le filtrage, scroll virtuel, a11y combobox                 | ⚠️ Possible mais coûteux |
| **B. Headless UI `Combobox`**          | Excellente a11y, patterns React natifs, `@headlessui/react` ~14 kB gzip, MIT | Nouvelle dépendance, styles à mapper sur les tokens existants                       | ✅ **Recommandé**        |
| **C. Radix UI / shadcn `Combobox`**    | Très populaire, composable                                                   | Dépendance plus lourde (Radix primitives), pattern shadcn non établi dans le projet | ❌ Overhead trop grand   |

**Recommandation : Option B — Headless UI Combobox**

Justification :

- a11y ARIA Combobox complète out of the box (`aria-activedescendant`, `role="listbox"`, clavier)
- Pattern `renderless` — on contrôle 100% du rendu avec les tokens Tailwind existants
- Un seul package : `@headlessui/react` (déjà compatible React 19)
- Le `ListboxField` existant reste pour les dropdowns courts (< 15 options)
- Le nouveau `ComboboxField` est réservé aux longues listes (CSS, écoles, et futur profil)

#### Architecture du nouveau combobox

```
components/ui/ComboboxField.tsx        — primitif UI réutilisable (Headless UI)
components/auth/CssSchoolCascade.tsx   — logique cascadée CSS → école (inscription)
```

**`ComboboxField` props :**

```typescript
type ComboboxFieldProps = {
  id: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  loading?: boolean; // spinner pendant le chargement des écoles
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  "aria-required"?: boolean;
};
```

**Filtrage :** côté client sur les `options` passées en prop (72 CSS et ~100 écoles par CSS max — pas besoin de server-side search).

#### Chargement des données

**Page `/register` (Server Component)** :

```typescript
// app/(auth)/register/page.tsx
const cssList = await getAllCss(); // lib/queries/css-schools.ts — service_role
// Passe cssList au client
```

**Client `CssSchoolCascade`** :

```typescript
// Quand l'utilisateur sélectionne un CSS → fetch les écoles de ce CSS
// Via Server Action ou query côté client (service_role non requis — RLS ref_select)
const schools = await getSchoolsByCssId(selectedCssId);
```

**Alternative plus simple :** charger TOUTES les écoles SEC=1 (860 rows, ~50 kB JSON) en une fois côté server et filtrer côté client. Acceptable pour le MVP.

#### Cascade CSS → école

1. Utilisateur tape dans le combobox CSS → filtre les 72 CSS
2. Sélection d'un CSS → `setValue("school_id", "")` + filtre les écoles de ce CSS
3. Utilisateur tape dans le combobox école → filtre les écoles du CSS sélectionné
4. Si l'utilisateur change de CSS → reset école (existant, même pattern qu'aujourd'hui)
5. **Pas de champ niveau** — supprimé du formulaire (PROFILE-UX-SPEC §5.5)

### 4.4 Données à charger pour `/register`

**Attention :** la page `/register` est accessible aux utilisateurs **non authentifiés**. Les tables `css` et `schools` ont une RLS `ref_select` qui exige `auth_is_active()`.

**Solutions :**

1. **Option A :** Utiliser `service_role` dans le Server Component (comme c'est déjà le cas pour la validation dans `auth-register.ts`) ✅
2. **Option B :** Ajouter une politique RLS `anon_select` pour les tables de référence CSS/schools ❌ (exposer les données à tous n'est pas souhaitable)
3. **Option C :** Créer une route API publique qui retourne les CSS/écoles ❌ (over-engineering)

**Recommandation : Option A** — le Server Component de `/register` utilise le `createServiceClient()` pour charger les CSS et écoles, les sérialise en JSON dans les props du `RegisterForm`.

---

## 5. Tests à écrire

### 5.1 Tests unitaires (Vitest)

| Fichier test                            | Ce qu'il teste                                                                                                    |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `lib/utils/profile-display.test.ts`     | `getDisplayName()`, `getInitials()`, `getSortKey()` — cas limites : accents, tirets, noms composés, chaînes vides |
| `lib/tache/auteur-display-sort.test.ts` | **Mettre à jour** les tests existants pour `first_name`/`last_name` au lieu de `full_name`                        |
| `lib/schemas/auth.test.ts` (NOUVEAU)    | Validation Zod : `css_id` UUID valide, `school_id` UUID valide, superRefine cohérence                             |

### 5.2 Tests d'intégration (Vitest)

| Fichier test                                 | Ce qu'il teste                                                               |
| -------------------------------------------- | ---------------------------------------------------------------------------- |
| `scripts/seed-css-schools.test.ts` (NOUVEAU) | Parsing CSV latin1, filtrage SEC=1, upsert idempotent (mock Supabase client) |

### 5.3 Tests E2E (Playwright)

| Fichier test                           | Ce qu'il teste                                                                                |
| -------------------------------------- | --------------------------------------------------------------------------------------------- |
| `tests/e2e/register.spec.ts` (NOUVEAU) | Parcours inscription complet : sélection CSS → école → soumission. Vérifier le cascade reset. |
| `tests/e2e/register.spec.ts`           | Vérifier qu'un CSS invalide ou une école hors CSS est rejetée                                 |

### 5.4 Tests RLS

| Scénario                                 | Vérification                                         |
| ---------------------------------------- | ---------------------------------------------------- |
| Utilisateur non-auth → `css` / `schools` | Requête retourne 0 lignes (pas d'erreur, juste vide) |
| Utilisateur actif → `css` / `schools`    | SELECT retourne toutes les lignes `is_active = true` |
| Utilisateur actif → UPDATE `css`         | Bloqué (pas de politique INSERT/UPDATE publique)     |
| Admin → INSERT/UPDATE `css` / `schools`  | OK                                                   |

### 5.5 Tests seed

Vérifier manuellement après le premier seed :

- `SELECT COUNT(*) FROM css;` → 72
- `SELECT COUNT(*) FROM schools;` → 860
- `SELECT COUNT(*) FROM schools WHERE NOT is_active;` → 0 (premier seed, rien à désactiver)
- Re-run seed → mêmes compteurs, aucun doublon

---

## 6. Ordre d'exécution et rollback

### 6.1 Ordre d'exécution complet

```
┌─────────────────────────────────────────────────────────┐
│  PHASE 1 — Infrastructure SQL                           │
├─────────────────────────────────────────────────────────┤
│  1. Appliquer Migration 1 (tables css + schools)        │
│  2. Exécuter npm run seed:schools                       │
│  3. Vérifier : 72 CSS, 860 écoles                       │
│  4. Appliquer Migration 3 (ADD COLUMN sur profiles)     │
│  5. Appliquer Migration 4 (migrer données existantes)   │
│  6. npm run gen:types                                   │
│  7. Vérifier NOTICE logs de migration 4                 │
├─────────────────────────────────────────────────────────┤
│  PHASE 2 — Code applicatif (build-safe)                 │
├─────────────────────────────────────────────────────────┤
│  8.  Créer lib/utils/profile-display.ts                 │
│  9.  Créer lib/queries/css-schools.ts                   │
│  10. npm install @headlessui/react                      │
│  11. Créer components/ui/ComboboxField.tsx              │
│  12. Modifier lib/auth/require-active-app-user.ts       │
│  13. Modifier lib/schemas/auth.ts                       │
│  14. Modifier lib/actions/auth-register.ts              │
│  15. Modifier RegisterForm.tsx + CssSchoolCascade       │
│  16. Modifier les queries (collaborateurs, search, etc.)│
│  17. Modifier les composants UI (Sidebar, dashboard…)   │
│  18. Modifier les selectors fiche/lecture                │
│  19. Modifier auteur-display-sort.ts                    │
│  20. Supprimer school-json.ts, load-css-ecoles.ts       │
│  21. Supprimer public/data/css-ecoles.json              │
│  22. Modifier seed-test-user.ts et seed-teacher-b.ts    │
│  23. npm run ci (DOIT PASSER)                           │
├─────────────────────────────────────────────────────────┤
│  PHASE 3 — Finalisation SQL                             │
├─────────────────────────────────────────────────────────┤
│  24. Appliquer Migration 5 (DROP old columns, UPDATE    │
│      banque_tae view)                                   │
│  25. npm run gen:types (final)                          │
│  26. npm run ci (DOIT PASSER)                           │
├─────────────────────────────────────────────────────────┤
│  PHASE 4 — Documentation                                │
├─────────────────────────────────────────────────────────┤
│  27. Mettre à jour docs/ARCHITECTURE.md (schéma SQL)    │
│  28. Mettre à jour docs/specs/profil-ux-spec.md         │
│  29. Mettre à jour docs/BACKLOG.md + BACKLOG-HISTORY.md │
│  30. Mettre à jour supabase/schema.sql (source vérité)  │
└─────────────────────────────────────────────────────────┘
```

### 6.2 Stratégie de rollback

| Si ça casse à…     | Rollback                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| Phase 1, étape 1-3 | `DROP TABLE schools; DROP TABLE css; DROP TYPE css_type;`                                         |
| Phase 1, étape 4-5 | `ALTER TABLE profiles DROP COLUMN first_name; DROP COLUMN last_name; DROP COLUMN school_id;`      |
| Phase 2            | Git revert des commits applicatifs. Les anciennes colonnes sont encore présentes.                 |
| Phase 3            | **NON RÉVERSIBLE** sans backup SQL. Prendre un snapshot Supabase avant d'exécuter la migration 5. |

### 6.3 Point de non-retour

La **Migration 5** est le point de non-retour. Avant de l'exécuter :

1. ✅ `npm run ci` passe sans erreur
2. ✅ Aucun fichier ne référence `full_name` ou `school` (grep)
3. ✅ Le formulaire d'inscription fonctionne avec les nouvelles colonnes
4. ✅ La banque affiche correctement les auteurs et écoles
5. ✅ Snapshot Supabase pris

---

## 7. Impact sur profil-ux-spec.md

### Sections à mettre à jour pour la v5.2 de la spec

| Section                           | Changement                                                                                                                                                                                                       |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **§3.1 Schéma profiles**          | Remplacer `full_name TEXT NOT NULL` par `first_name TEXT NOT NULL, last_name TEXT NOT NULL`. Remplacer `school TEXT` par `school_id UUID REFERENCES schools(id)`. Ajouter tables `css` et `schools`.             |
| **§3.2 Types TypeScript**         | `ActiveAppUser` : `fullName` → `firstName` + `lastName`. Ajouter types `CssRow`, `SchoolRow`.                                                                                                                    |
| **§4.x Affichage du nom**         | Tout usage de `full_name` → `getDisplayName(first_name, last_name)`. Mentionner le helper `lib/utils/profile-display.ts`.                                                                                        |
| **§5.x Formulaire profil**        | Les champs nom/prénom sont éditables séparément. L'école est un combobox FK, pas du texte libre.                                                                                                                 |
| **§6.x Recherche collaborateurs** | `.ilike("full_name", …)` → `.or("first_name.ilike…, last_name.ilike…")`. Recherche école par JOIN.                                                                                                               |
| **§7.x Inscription**              | Remplacer toute mention de `css-ecoles.json` par les tables `css`/`schools`. Combobox Headless UI.                                                                                                               |
| **§10.x Banque collaborative**    | Vue `banque_tae` : `auteur_nom` → `auteur_prenom` + `auteur_nom`. `auteur_ecole` → JOIN `schools`.                                                                                                               |
| **§15.x Dashboard**               | Affichage école via FK au lieu de `parseSchoolJson()`.                                                                                                                                                           |
| **§17.5 Suppression de compte**   | Les FK `RESTRICT` sur `tae.auteur_id`, `documents.auteur_id`, `evaluations.auteur_id`, `commentaires.auteur_id` restent. Pattern anonymisation inchangé. `schools.id` est `ON DELETE SET NULL` — pas de blocage. |
| **§20 Schéma SQL**                | Ajouter `css` et `schools` dans la liste des tables.                                                                                                                                                             |
| **§21 Dépendances**               | Ajouter `@headlessui/react` dans les dépendances.                                                                                                                                                                |

### Convention de nommage niveaux/disciplines du profil

**Recommandation normative pour la spec v5.2 :** adopter la convention de nommage `niveaux_enseignes` / `disciplines_enseignees` pour les tables pivot du profil enseignant. Éviter les noms ambigus ~~`profile_niveaux`~~ / ~~`profile_disciplines`~~ qui pourraient être confondus avec le niveau/discipline d'un contenu pédagogique (tâche, document, épreuve). Voir [§0.2 Distinction « niveau » et « discipline »](#02-distinction--niveau--et--discipline----deux-sens).

### Nouvelles sections potentielles

- **§X. Tables de référence géographiques** : documenter la provenance des données MEQ, le script de seed, la politique de mise à jour annuelle.
- **§X. Combobox pattern** : documenter le nouveau composant `ComboboxField` et sa relation avec `ListboxField`.
- **§X. Convention niveau/discipline** : intégrer la distinction sens 1 (contenu) vs sens 2 (profil) dans la spec.

---

## 8. Pont vers l'implémentation profil/collaborateurs

### 8.1 Prérequis de la spec profil satisfaits par ce refactoring

Après exécution complète du présent plan, la spec PROFILE-UX-SPEC.md pourra s'appuyer directement sur :

- [x] `first_name` + `last_name` séparés sur `profiles` — hero, cartes collaborateurs, avatar initiales, tri alphabétique natif
- [x] Table `schools` avec FK `profiles.school_id` — affichage école, filtres banque, cartes collaborateurs
- [x] Table `css` avec FK `schools.css_id` — hiérarchie CSS → école, affichage dans le rail profil
- [x] Vue `banque_tae` mise à jour avec `auteur_prenom`, `auteur_nom`, `auteur_ecole`, `auteur_css`
- [x] Helper `getDisplayName()` / `getInitials()` / `getSortKey()` dans `lib/utils/profile-display.ts` — réutilisable partout (profil, cartes, sidebar, print)
- [x] Composant `ComboboxField` (Headless UI) — réutilisable pour les comboboxes des Side Sheets d'édition profil (école, CSS)
- [x] Pattern seed depuis CSV MEQ établi (`scripts/seed-css-schools.ts`) — extensible si ajout de données MEQ futures
- [x] Convention de nommage `niveaux_enseignes` / `disciplines_enseignees` documentée (§0.2) — prête pour les tables pivot

### 8.2 Prérequis NON satisfaits par ce refactoring

À créer dans le refactoring profil/collaborateurs suivant :

**SQL :**

| Élément                                | Notes                                                   |
| -------------------------------------- | ------------------------------------------------------- |
| Table `profile_niveaux_enseignes`      | Pivot `profiles.id` ↔ `niveaux.id`, convention §0.2     |
| Table `profile_disciplines_enseignees` | Pivot `profiles.id` ↔ `disciplines.id`, convention §0.2 |
| Colonne `profiles.years_experience`    | INT ou enum à trancher (§8.4)                           |
| Colonne `profiles.bio`                 | TEXT, optionnel                                         |

**Composants UI :**

| Composant           | Emplacement                           | Statut                                                                                  |
| ------------------- | ------------------------------------- | --------------------------------------------------------------------------------------- |
| `MetaPill`          | `components/tache/fiche/MetaPill.tsx` | **Existe déjà** — possiblement à étendre avec des variants couleur par catégorie (§8.4) |
| `SideSheet`         | `components/ui/`                      | **À créer** — drawer M3, focus trap, focus initial                                      |
| `AvatarInitials`    | `components/ui/`                      | **À créer** — prop `size: 'sm' \| 'md' \| 'lg'`, initiales via `getInitials()`          |
| `SidebarNotifBadge` | `components/layout/`                  | **À créer** — badge notification sidebar                                                |
| `RoleBadge`         | `components/ui/`                      | **À créer** — enseignant / CP / admin                                                   |
| `ExperienceBadge`   | `components/ui/`                      | **À créer** — icône horloge + label                                                     |
| `CopyButton`        | `components/ui/`                      | **À créer** — copie courriel                                                            |
| `ProfileSkeleton`   | `components/ui/`                      | **À créer** — skeleton loading par type de vue                                          |

**Queries / Actions :**

| Élément                             | Notes                                                                                        |
| ----------------------------------- | -------------------------------------------------------------------------------------------- |
| `fetchProfileOverview`              | Query riche avec JOINs `schools`, `css`, pivots niveaux/disciplines, compteurs TAÉ/documents |
| `fetchCollaborateursList` (refonte) | JOINs enrichis, filtres multi-critères, pagination                                           |
| `updateProfileAction`               | Server Action pour le Side Sheet d'édition                                                   |
| Route `/profile/[id]`               | Nouvelle route Server Component                                                              |
| Route `/collaborateurs` (refonte)   | Cartes enrichies, recherche hybride                                                          |

### 8.3 Ordre recommandé pour attaquer la spec profil/collaborateurs

Une fois le présent refactoring terminé et `npm run ci` au vert :

1. **Mettre à jour PROFILE-UX-SPEC.md en v5.2** avec les modifications listées en §7 de ce plan (schéma, types, composants, queries)
2. **Valider la cohérence de la v5.2** — relecture complète, vérifier que les §§ touchés restent cohérents entre eux
3. **Lancer un nouvel audit** spécifique à la spec profil v5.2 (même pattern que le présent audit : analyse critique en deux phases, faisabilité, questions ouvertes)
4. **Générer un `PROFILE-IMPLEMENTATION-PLAN.md`** — plan d'exécution détaillé pour le refactoring profil/collaborateurs
5. **Exécuter phase par phase** — même discipline que le présent refactoring

### 8.4 Questions ouvertes à trancher avant le refactoring suivant

Ces décisions restent en suspens et devront être tranchées par le développeur avant de lancer l'implémentation profil/collaborateurs :

| #   | Question                                                                                                              | Options                                                                                                                                                | Impact                                          |
| --- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------- |
| Q1  | `profiles.status` enum existant (`pending`/`active`/`suspended`) suffit-il, ou faut-il un `is_active` boolean dédié ? | A. Garder `status` seul (déjà en place, RLS calibré dessus) / B. Ajouter `is_active` boolean redondant                                                 | RLS, queries, affichage collaborateurs inactifs |
| Q2  | Color ramps des `MetaPill` : monochrome cohérent ou ramps par catégorie ?                                             | A. Monochrome (accent teal, comme actuellement) / B. Ramps dédiées (bleu niveau, ambre discipline, vert expérience — tel que décrit dans la spec §3.7) | Tokens CSS à ajouter, cohérence design system   |
| Q3  | Recherche collaborateurs hybride (nom + école + discipline) : Route Handler ou Server Action ?                        | A. Server Action (pattern existant, pas de nouvelle route API) / B. Route Handler avec debounce côté client                                            | Latence, pattern architectural, bundle          |
| Q4  | Adopter `unstable_cache` + `revalidateTag` maintenant ou rester sur le pattern `revalidatePath` actuel ?              | A. Maintenant (meilleur cache, mais API instable Next.js) / B. Plus tard (stable, cohérent avec le repo actuel)                                        | Performance, risque d'API breaking change       |

---

## Annexe A — Fichiers supprimés

| Fichier                       | Raison                                                      |
| ----------------------------- | ----------------------------------------------------------- |
| `lib/profiles/school-json.ts` | `parseSchoolJson()` et `formatSchoolForDisplay()` obsolètes |
| `lib/data/load-css-ecoles.ts` | `loadCssEcoles()` et `validateCssAndSchool()` obsolètes     |
| `public/data/css-ecoles.json` | Données maintenant en base (tables `css` + `schools`)       |

## Annexe B — Fichiers modifiés (liste exhaustive)

### Queries

- `lib/queries/collaborateurs-list.ts`
- `lib/queries/collaborateur-profile-search.ts`
- `lib/queries/tache-for-edit.ts`
- `lib/queries/evaluation-tache-picker.ts`
- `lib/queries/bank-evaluations.ts`
- `lib/queries/dashboard.ts`

### Auth

- `lib/auth/require-active-app-user.ts`
- `lib/actions/auth-register.ts`
- `lib/schemas/auth.ts`

### Composants

- `components/auth/RegisterForm.tsx`
- `components/layout/Sidebar.tsx`
- `components/layout/AppShellClient.tsx`
- `components/layout/AppShell.tsx`
- `app/(app)/layout.tsx`
- `app/(app)/dashboard/page.tsx`
- `app/(app)/collaborateurs/page.tsx`
- `app/(app)/questions/[id]/edit/page.tsx`
- `app/(app)/questions/new/page.tsx`
- `app/(auth)/register/page.tsx`
- `components/tache/Bloc1AuteursTache.tsx`
- `components/tache/CollaborateurSearchField.tsx`
- `components/tache/FicheSommaireColumn.tsx`
- `components/tache/FicheFooter.tsx`

### Helpers / lib

- `lib/tache/auteur-display-sort.ts`
- `lib/tache/server-fiche-map.ts`
- `lib/tache/load-tache-for-edit.ts`
- `lib/documents/fetch-doc-fiche-data.ts`
- `lib/fiche/fiche-helpers.ts`
- `lib/fiche/selectors/lecture-selectors.ts`

### Seeds

- `scripts/seed-test-user.ts`
- `scripts/seed-teacher-b.ts`

### Types (régénérés)

- `lib/types/database.ts`

### SQL (source de vérité)

- `supabase/schema.sql`

## Annexe C — Nouveaux fichiers

| Fichier                                                                     | Rôle                                                |
| --------------------------------------------------------------------------- | --------------------------------------------------- |
| `scripts/seed-css-schools.ts`                                               | Seed CSV → tables css + schools                     |
| `lib/utils/profile-display.ts`                                              | `getDisplayName()`, `getInitials()`, `getSortKey()` |
| `lib/queries/css-schools.ts`                                                | `getAllCss()`, `getSchoolsByCssId()`                |
| `components/ui/ComboboxField.tsx`                                           | Primitif combobox Headless UI                       |
| `components/auth/CssSchoolCascade.tsx`                                      | Cascade CSS → école (inscription)                   |
| `supabase/migrations/20260414100000_create_css_schools_tables.sql`          | M1                                                  |
| `supabase/migrations/20260414120000_profiles_add_name_school_columns.sql`   | M3                                                  |
| `supabase/migrations/20260414130000_profiles_migrate_existing_data.sql`     | M4                                                  |
| `supabase/migrations/20260414140000_profiles_drop_old_columns_finalize.sql` | M5                                                  |
| `public/data/seed-logs/`                                                    | Répertoire des changelogs seed                      |
