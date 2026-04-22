# Banque collaborative — spec d’implémentation

> **Statut :** chantier en cours. Ce document est la **source de vérité** pour les règles d’URL, filtres, recherche, pagination et dérivation métier ; l’UI actuelle (`/bank`) est partielle — voir § Implémentation actuelle.

## Rôle

- **Route :** `/bank` — libellé navigation « Banque collaborative ».
- **Onglets (ordre UI, aligné `BankOnglets`) :** **Tâches** → **Documents historiques** → **Épreuves**.
- **Visibilité banque :** uniquement les ressources avec `is_published = true` **et** `is_archived = false`. Les brouillons **n’apparaissent jamais** dans la banque.

---

## Règles communes aux trois onglets

### Tri

- **Par défaut (`sort=recent` ou absent) :** `updated_at` **descendant** — utilisé comme **proxy de « récence »** (pas de colonne `published_at` à ce jour). **Limitation connue :** toute modification d’une ressource publiée la fait remonter comme « plus récente ».
- **Alternatif (`sort=popular`) :** score « popularité » propre à chaque onglet (voir sections par onglet).

### Navigation dans les résultats

- **« Charger plus »** — pas de pagination classique numérotée, pas d’infinite scroll automatique.
- **Taille de page banque :** **20** résultats par chargement (tâches, documents, épreuves).
- **Picker épreuve (hors liste banque) :** **8** résultats par page — `lib/queries/evaluation-tache-picker.ts` (`EVALUATION_PICKER_PAGE_SIZE`). Deux standards **volontairement distincts** ; les documenter dans les composants concernés.
- Le bouton « Charger plus » est masqué lorsque tous les résultats sont chargés.
- Paramètre URL **`page`** (ou équivalent **offset / curseur** — à trancher à l’implémentation) pour synchroniser l’état avec un lien partageable.

### Filtres

- **Filtrage croisé (ET)** : tous les filtres actifs s’appliquent en **intersection stricte**.
- Les filtres actifs sont reflétés dans les **query params** ; partager l’URL = partager le même état filtré.
- **Réinitialisation :** bouton « Réinitialiser les filtres » visible dès qu’au moins un filtre est actif.

### Recherche texte — tâches (`tae`)

- **Portée :** texte **dérivé** de la consigne, **pas** le HTML brut.
- **Colonne :** `tae.consigne_search_plain` — colonne **générée stockée** (PostgreSQL), alimentée par :
  1. suppression des balises : `regexp_replace(consigne, '<[^>]+>', ' ', 'g')` ;
  2. normalisation des espaces : `regexp_replace(..., '\s+', ' ', 'g')` ;
  3. éventuellement `trim` des bords si nécessaire pour homogénéité.
- **Index :** `CREATE INDEX … USING gin (consigne_search_plain gin_trgm_ops)` — la recherche banque (**trigram / `ilike`**) cible **cette colonne** pour que l’index soit utilisé.
- **Ancien index :** `idx_tae_consigne_trgm` sur `consigne` brut est **retiré** dans la migration — plus d’usage prévu une fois la recherche basculée sur `consigne_search_plain`. Avant merge : **grep** le dépôt pour confirmer qu’aucune requête ne dépend encore du trigram sur `consigne` brut.
- **Limites du strip (à documenter en spec utilisateur / dev) :**
  - entités HTML (`&amp;`, `&nbsp;`, etc.) **non décodées** ;
  - HTML **mal formé** ou cas limites (commentaires, etc.) peuvent laisser du bruit ;
  - pas de parseur HTML complet — choix assumé pour simplicité et perf.

### Recherche texte — documents et épreuves

- **Documents :** titre (et champs déjà indexés côté `documents` selon `schema.sql` — aligner les requêtes sur les index existants).
- **Épreuves :** `evaluations.titre` (champ texte dédié).

### Recherche + filtres

- La recherche texte se **combine** aux filtres structurés par **ET**.

### Sécurité : RLS et requêtes applicatives

- **Double barrière honnête :** les policies **RLS** Supabase **et** les filtres explicites dans les requêtes (`is_published`, `is_archived`, etc.) contribuent à la sécurité et à la cohérence produit. On **ne prétend pas** que « tout est forcé par la RLS seule » sans vérifier les policies réelles sur `tae`, `documents`, `evaluations`.

---

## Onglet Tâches

### Métadonnées d’indexation (filtres)

| Filtre                   | Colonne                 | Type                                         |
| ------------------------ | ----------------------- | -------------------------------------------- |
| Opération intellectuelle | `tae.oi_id`             | Single (texte, ex. `OI3`)                    |
| Comportement attendu     | `tae.comportement_id`   | Single (texte, ex. `3.1`), dépendant de l’OI |
| Niveau                   | `tae.niveau_id`         | Single (int)                                 |
| Discipline               | `tae.discipline_id`     | Single (int)                                 |
| Aspects de société       | `tae.aspects_societe[]` | Multi                                        |
| Compétence disciplinaire | `tae.cd_id`             | Single (Miller)                              |
| Connaissances relatives  | `tae.connaissances_ids` | Multi (int[])                                |

### Tri populaire

- Score combiné à définir en implémentation (ex. agrégats sur `votes` + nombre d’occurrences dans `evaluation_tae` pour les TAÉ publiées).

### Affichage en liste

- Aperçu consigne tronqué — `plainConsigneForMiniature` + `truncateText`, composant **`BankTaskRow`**.
- OI + comportement, niveau + discipline, métadonnées utiles (documents, points si affichés), auteur + date (proxy `updated_at`), votes si affichés.
- CTA **« Voir la tâche »** ; **« Ajouter à une épreuve »** — **déjà livré** via **`BankAddToEvaluationLauncher`** sur `app/(app)/bank/page.tsx` (pas une tâche restant sur `BankTaskRow` seul).

### Query

- **`lib/queries/bank-tasks.ts`** : **`getBankPublishedTachePage`** — filtres, tri, pagination / offset (remplace l’ancienne liste non paginée).
- Ne pas confondre avec la liste **Mes tâches** ni la sentinelle wizard `MY_QUESTIONS_WIZARD_SERVER_DRAFT_ID`.

---

## Onglet Documents historiques

### Métadonnées d’indexation

| Filtre        | Colonne                       | Type                              |
| ------------- | ----------------------------- | --------------------------------- |
| Niveau        | `documents.niveaux_ids`       | Multi                             |
| Discipline    | `documents.disciplines_ids`   | Multi                             |
| Type          | `documents.type`              | `textuel` / `iconographique`      |
| Aspects       | `documents.aspects_societe`   | Multi                             |
| Connaissances | `documents.connaissances_ids` | Multi (JSON / Miller côté client) |

### Tri populaire

- Score : nombre de **tâches publiées** distinctes référençant le document (`tae_documents` + `tae` publiées) — voir `FEATURES.md` §5.4.

### Affichage en liste

- Titre, type (badge), aperçu contenu tronqué, source, niveau + discipline, compteur « Utilisé dans X tâches », auteur + date, CTA « Voir le document ».

---

## Onglet Épreuves

### Contexte schéma

La table **`evaluations`** ne contient **pas** `niveau_id`, `discipline_id` ni `connaissance_id`. Ces dimensions pour **filtre / affichage** sont **dérivées** des TAÉ liées via **`evaluation_tae`** → **`tae`**. **Pas de migration** pour ajouter ces colonnes sur `evaluations` dans ce chantier.

### Règles de dérivation (métier)

- **Niveau affiché / filtrable :** valeur **`niveau_id`** ayant la **majorité** parmi les tâches de l’épreuve (TAÉ publiées liées). En cas de **parité stricte** entre plusieurs niveaux : prendre le **`niveau_id` de la première tâche** selon **`evaluation_tae.ordre`** (ascendant). **Déterministe**, pas d’« afficher les deux » (évite de complexifier les filtres).
- **Discipline affichée / filtrable :** **même logique** que le niveau (majorité, tie-break = première tâche par `evaluation_tae.ordre`).
- **Connaissances (ensemble pour filtre / affichage) :** **union** des `tae.connaissances_ids` de **toutes** les tâches de l’épreuve. Un filtre « connaissance X » matche si **X** est présent dans cette union.

### Filtres prévus (sur données dérivées ou calcul requête)

| Filtre           | Source dérivée                              | Type / notes                                    |
| ---------------- | ------------------------------------------- | ----------------------------------------------- |
| Niveau           | majorité + tie-break `evaluation_tae.ordre` | Single                                          |
| Discipline       | idem                                        | Single                                          |
| Connaissances    | union des `connaissances_ids`               | Multi (contient au moins un id sélectionné)     |
| Points totaux    | grilles / comportements des TAÉ             | Plage (ex. tranches) — calcul détaillé en impl. |
| Nombre de tâches | `COUNT(evaluation_tae)`                     | Plage (ex. 1–2, 3–4, 5+)                        |

### Tri populaire

- Score à définir (ex. usages PDF, **`favoris`** avec `type = 'evaluation'`, etc.) — vérifier les métriques disponibles en base (`tae_usages`, `favoris`, …).

### Affichage en liste

- Titre épreuve, résumé période / connaissances (selon dérivation), niveau + discipline dérivés, nombre de tâches + points totaux, auteur + date, CTA « Voir l’épreuve » / « Télécharger les feuillets » selon produit.

### Query

- Nouvelle query **`lib/queries/bank-evaluations.ts`** : épreuves publiées, jointures `evaluation_tae` → `tae`, agrégations pour dérivation et compteurs.

---

## URL — query params (`onglet`, valeurs base)

Conserver le paramètre **`onglet`** (déjà utilisé : `parseBankOnglet`, liens dans `BankOnglets`). **Ne pas** introduire `tab` sans migration des liens.

**Exemples :**

```
/bank?onglet=taches&oi=OI3&comportement=3.1&niveau=2&discipline=1&aspects=economique,politique&sort=popular&q=nouvelle-france
/bank?onglet=documents&dtype=textuel&niveau=2
/bank?onglet=evaluations&niveau=2&discipline=1&connaissances=12,45
```

| Param           | Valeurs / notes                                                                                                                                                                                                            |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `onglet`        | `taches` (défaut si absent sur `/bank`) \| `documents` \| `evaluations`                                                                                                                                                    |
| `oi`            | Texte tel qu’en base, ex. `OI0`, `OI3`                                                                                                                                                                                     |
| `comportement`  | Texte tel qu’en base, ex. `3.1`, `0.1`                                                                                                                                                                                     |
| `niveau`        | ID numérique (`niveaux.id`)                                                                                                                                                                                                |
| `discipline`    | ID numérique (`disciplines.id`)                                                                                                                                                                                            |
| `aspects`       | Clés stables **`AspectSocieteKey`** (`economique`, `politique`, `social`, …) — **pas** les phrases UI. Mapping serveur vers les littéraux PostgreSQL `aspect_societe` (`'Économique'`, `'Politique'`, … dans `schema.sql`) |
| `cd`            | ID numérique `cd.id`                                                                                                                                                                                                       |
| `connaissances` | Liste d’IDs séparés par virgules                                                                                                                                                                                           |
| `dtype`         | Aligné page actuelle documents : `textuel` \| `iconographique` (ou nom déjà utilisé en query)                                                                                                                              |
| `sort`          | `recent` (défaut) \| `popular`                                                                                                                                                                                             |
| `q`             | Recherche texte                                                                                                                                                                                                            |
| `page`          | Indice ou offset pour « Charger plus » — détail à figer à l’implémentation                                                                                                                                                 |

---

## Migration `consigne_search_plain` (séquence obligatoire)

1. Ajouter script dans **`supabase/migrations/`** **et** mettre à jour **`supabase/schema.sql`** (canon du dépôt).
2. **Appliquer** sur le projet Supabase (local / distant selon flux d’équipe).
3. **`npm run gen:types`** pour régénérer les types si la colonne apparaît dans les selects typés.
4. **`npm run build`** ou **`npm run ci`** — zéro erreur TypeScript / tests.

**Risque :** sur une table **`tae` volumineuse**, `ADD COLUMN … GENERATED … STORED` + `CREATE INDEX` GIN peut **verrouiller** ou prendre du temps (backfill). Prévoir fenêtre ou exécution hors pointe ; documenter pour la prod.

**SQL indicatif (à valider sur la version PostgreSQL du projet) :**

```sql
-- Retrait de l’index sur le HTML brut (après bascule des requêtes)
DROP INDEX IF EXISTS idx_tae_consigne_trgm;

ALTER TABLE tae
  ADD COLUMN consigne_search_plain text
  GENERATED ALWAYS AS (
    trim(
      both ' ' FROM regexp_replace(
        regexp_replace(consigne, '<[^>]+>', ' ', 'g'),
        '\s+',
        ' ',
        'g'
      )
    )
  ) STORED;

CREATE INDEX idx_tae_consigne_search_trgm
  ON tae USING gin (consigne_search_plain gin_trgm_ops);
```

Si `consigne` est **NULL**, l’expression PostgreSQL s’évalue en **NULL** (pas de ligne indexée vide parasite). Valider sur la version PostgreSQL du projet (générées stockées).

---

## Architecture — fichiers à créer ou modifier

| Fichier                                            | Action                                                          |
| -------------------------------------------------- | --------------------------------------------------------------- |
| `lib/queries/bank-tasks.ts`                        | Filtres, tri, pagination, recherche sur `consigne_search_plain` |
| `lib/queries/bank-documents.ts`                    | Filtres, tri, pagination, recherche titre                       |
| `lib/queries/bank-evaluations.ts`                  | **Créer** — épreuves publiées, dérivation, agrégats             |
| `app/(app)/bank/page.tsx`                          | Lire `searchParams` → passer aux queries                        |
| `components/bank/BankFilters.tsx`                  | Filtres partagés / par onglet                                   |
| `components/bank/BankTaskRow.tsx`                  | Existant — enrichissements affichage si besoin                  |
| `components/bank/BankDocumentsPanel.tsx` / rangées | Étendre selon maquettes                                         |
| `components/bank/BankEvaluationRow.tsx`            | **Créer**                                                       |
| `components/bank/LoadMoreButton.tsx`               | **Créer**                                                       |

---

## Règles techniques

- `searchParams` lus côté **Server Component** ; pas de fetch client pour appliquer les filtres « de liste ».
- Filtres et recherche appliqués **côté SQL** (`WHERE`), pas par filtrage JS sur un gros jeu chargé.
- Tailwind + tokens ; TypeScript strict, pas de `any`.
- Réutiliser `BankTaskRow`, `MetaPill`, `plainConsigneForMiniature`, `truncateText`, `BankAddToEvaluationLauncher` sans dupliquer la logique métier.

---

## Visibilité (rappel)

| Ressource                           | Banque                    |
| ----------------------------------- | ------------------------- |
| `is_published` et non `is_archived` | Oui                       |
| Brouillon ou archivé                | Non                       |
| Non publiée, autre auteur           | Non (RLS + règles métier) |

---

## Implémentation actuelle (référence)

- **`/bank`** : onglets **Tâches** / **Documents** / **Épreuves**. **Tâches** : vue **`banque_tae`**, `getBankPublishedTachePage` (`lib/queries/bank-tasks.ts`) — filtres URL (OI, comportement, niveau, discipline, CD, aspects, connaissances, recherche `consigne_search_plain`), tri `recent` / `popular` (`bank_popularity_score`), pagination **20** + **Charger plus** ; UI `BankTasksPanel`, `BankTaskFilters`. **Documents** : `getBankPublishedDocumentsPage`, mêmes filtres qu’avant + pagination **20** + **Charger plus** (`BankDocumentsPanel`). **Épreuves** : `getBankPublishedEvaluationsPage` (`lib/queries/bank-evaluations.ts`), recherche titre, pagination **20** ; **Modifier** → `/evaluations/[id]/edit` **uniquement** si `auteur_id` = utilisateur connecté (`canEdit`) ; sinon copy `BANK_EVAL_NO_EDIT_OTHER` ; filtres dérivés (niveau, discipline, connaissances) — phase 2 (voir § dérivation épreuves).
- **`parseBankOnglet`**, **`parseBankListPage`**, **`parseBankTacheQueryFromSearchParams`**, **`serializeBankTacheQueryForHref`** : `lib/queries/bank-tasks.ts` ; **`BankOnglets`**, **`BankAddToEvaluationLauncher`** : `components/bank/*`.

---

## Documentation à mettre à jour à la livraison des features banque

- `docs/FEATURES.md` §8.2 — filtres / recherche livrés vs cible
- `docs/ARCHITECTURE.md` — routes, queries, index SQL, RLS si pertinent
- `docs/WORKFLOWS.md` — parcours recherche / filtrage banque
- `docs/BACKLOG.md` — historique / items cochés

**Renvoi navigation :** [README.md](./README.md) (table des fichiers).
