# Architecture technique

Dernière mise à jour : 2026-04-17

Stack, structure du dépôt Next.js (App Router), données Supabase, routes, déploiement et CI. Les règles métier détaillées sont dans [FEATURES.md](./FEATURES.md). Les **textes visibles** sont dans [UI-COPY.md](./UI-COPY.md) ; les **règles normatives** (protocoles, icônes, mapping) dans [DECISIONS.md](./DECISIONS.md).

## Stack

| Outil                         | Usage                                                                                                                                                                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Next.js (voir `package.json`) | App Router, Server Components, Server Actions                                                                                                                                                                             |
| Supabase                      | Auth, PostgreSQL, Storage (si activé), RLS                                                                                                                                                                                |
| Tailwind CSS                  | Styles — tokens et utilitaires                                                                                                                                                                                            |
| `cn()` (`lib/utils/cn.ts`)    | `clsx` + `tailwind-merge` — fusion de classes                                                                                                                                                                             |
| TypeScript                    | Strict, pas de `any`                                                                                                                                                                                                      |
| TipTap                        | Éditeur riche — **`RichTextEditor`** (`components/ui/`, `simpleRichExtensions`) ; consigne / badges docs — `ConsigneTipTapEditor` + `consigneExtensions` — voir [WORKFLOWS.md](./WORKFLOWS.md#éditeur-de-consigne-tiptap) |
| Prettier / ESLint             | `npm run format:check`, `npm run lint`                                                                                                                                                                                    |

Pour les API Next.js en vigueur dans ce dépôt : `node_modules/next/dist/docs/` (voir `AGENTS.md`).

## Repère temporel, année normalisée et OI1 (non rédactionnel)

Les colonnes **`repere_temporel`** et **`annee_normalisee`** sur **`documents`** (et l’état **`DocumentSlotData`** dans le wizard) servent aux **comparaisons temporelles** et aux **générations automatiques** des parcours **OI1** (_Situer dans le temps_). **Saisie UI :** `RepereTemporelField` ; **priorité / fallback :** `getAnneePourComparaison` — **`lib/tache/document-annee.ts`** (`extractYearFromString`). **Configuration comportement :** `lib/tache/behaviours/types.ts` (`ComportementConfig.bloc4.requiresRepereTemporel`, `completionCriteria.bloc4`) ; enregistrements par slug dans **`lib/tache/behaviours/ordre-chronologique.ts`**, **`ligne-du-temps.ts`**, **`avant-apres.ts`**, etc. **Helpers de génération :** `lib/tache/non-redaction/` (ex. ordre chronologique, à étendre pour les autres parcours). **Spec produit détaillée (archive) :** [archive/wizard-oi-non-redactionnelle.md](./archive/wizard-oi-non-redactionnelle.md) § **Données temporelles — repère et année normalisée**.

## Structure des dossiers (état du dépôt)

```
app/
  (auth)/          # login, register, activate
  (app)/           # shell connecté : dashboard, questions, documents, bank, evaluations, profile, collaborateurs
  (print)/         # routes d'impression sans AppShell (questions, documents)
  (apercu)/        # route SSR /apercu/[token] + route de test /apercu/test/[slug]
  api/             # route handlers HTTP
    collaborateurs/search/
    impression/{token-draft,pdf,apercu-png}/
  auth/callback/   # route handler OAuth / magic link
  dev/wizard-lab/  # labo dev-only (404 en production)
  eval-grid-snapshot/[id]/ # snapshots Playwright
  prototype/       # pages maquette / démonstration hors navigation produit
  layout.tsx, page.tsx, globals.css
components/
  ui/              # primitives (Button, Field, ListboxField, SimpleModal, WarningModal, …)
  layout/          # AppShell, Sidebar, …
  wizard/          # WizardStepper (partagé wizard TAÉ + wizard document autonome)
  preview/         # panneau d'aperçu partagé
  partagees/       # briques transverses des vues détaillées
  tache/, document/, epreuve/ # vues détaillées canoniques
  dev/             # composants de laboratoires internes
  auth/
  dashboard/
  questions/, documents/, evaluations/, bank/, profile/, collaborateurs/
  tae/             # TacheForm, impression tâche, grilles, variantes non rédactionnelles
  prototype/
lib/
  actions/         # Server Actions (auth, tae, documents, evaluations, impression)
  queries/         # lectures Supabase
  auth/            # `require-active-app-user.ts` — garde-fou session + profil actif (layouts `(app)` et `(print)`)
  supabase/        # client navigateur/serveur, admin, helper middleware
  server/          # utilitaires server-only (`rate-limit`)
  utils/           # helpers transverses (`cn`, profile-display, dates, etc.)
  tae/             # helpers métier, publish, hydrate, variantes non rédactionnelles, impression tâche
    # `import/` : normalisation alias LLM (`normalize-llm-aliases.ts`), validation brouillon vs `oi.json` (`validate-tache-import-vs-oi.ts`) — à brancher sur le futur parcours import JSON ; tests `lib/tache/import/*.test.ts`.
    # `non-redaction/` : slugs variantes + registre `comportement_id` → slug (`oi.json` champ `variant_slug`) — voir `docs/archive/wizard-oi-non-redactionnelle.md`.
    # Publication : `publish-tache.ts` (orchestration `publishTacheFromFormState` / `updateTacheFromFormState`) ;
    # `publish-tache-types.ts`, `publish-tache-payload.ts`, `publish-tache-lookups.ts`, `publish-tache-rpc-errors.ts`.
    # Connaissances (WORKFLOWS §7) : barrel `connaissances-helpers.ts` → `connaissances-types|parse|filter|miller-rules|selection`.
  tache/, document/, documents/, epreuve/, evaluations/, bank/
  types/, schemas/
  images/          # Redimensionnement images téléversées (boîte max **660×400** px, proportions, sans upscale — **sharp**) pour `lib/actions/documents.ts` (`uploadTacheDocumentImageAction`)
  impression/      # Architecture impression 3 couches — `types.ts` (RenduImprimable, ContexteImpression, Page, Bloc), `builders/` (couche 1 : blocs-document, blocs-quadruplet, blocs-corrige, blocs-tache, regles-visibilite) ; `lib/tache/impression/tache-vers-imprimable.ts` (couche 2 tâche), `lib/document/impression/document-vers-imprimable.ts` (couche 2 document), `lib/epreuve/transformation/epreuve-vers-paginee.ts` (couche 2 épreuve → alias `epreuveVersImprimable`)
proxy.ts           # garde des routes + redirections auth (App Router)
public/data/       # JSON référentiels (OI, CD, connaissances, CSS/écoles, grilles, …) — **immuables** sauf nécessité absolue — [DECISIONS.md](./DECISIONS.md) § Référentiels `public/data/*.json` ; **`import-tache-notebooklm-bundle.json`** — hors fondation app (NotebookLM, etc.) : OI embarqué + `regles_non_negociables_fr`, gabarits `reference_payload_*`, spec post-import — **non importé** par l’app tant qu’aucune route ne le charge ; régénération : `node scripts/build-import-tache-notebooklm-bundle.mjs`
supabase/schema.sql
supabase/migrations/ # SQL incrémental (ex. RPC manquante sur projet existant)
```

> **Note :** la garde des routes est assurée par `proxy.ts` (et `lib/supabase/middleware.ts` pour le rafraîchissement de session). Le fichier racine `middleware.ts` n’est pas utilisé dans ce dépôt.

## Server Components, Client Components, données

- **`'use client'`** uniquement si interaction locale (state, events, API navigateur) l’exige.
- **Données Supabase** : préférer Server Components, Server Actions ou route handlers. Éviter les appels Supabase directs dans les Client Components.
- **Garde d’accès** : `proxy.ts` protège `/dashboard`, `/questions`, `/documents`, `/bank`, `/evaluations`, `/profile`, `/collaborateurs` et gère les redirections `/login`/`/register` quand l’utilisateur est déjà connecté.
- **Session Supabase** : `lib/supabase/middleware.ts` rafraîchit les cookies et retourne l’utilisateur courant pour `proxy.ts`.
- **Profil actif requis** : `requireActiveAppUser()` est appliqué dans les layouts `(app)` et `(print)`.

## Routes App Router

| Chemin                                                                  | Rôle                                                                                                                                                            |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                                                                     | Redirection selon session : utilisateur connecté vers `/dashboard`, sinon `/login`.                                                                             |
| `/login`, `/register`, `/activate`                                      | Authentification et activation de profil.                                                                                                                       |
| `/dashboard`                                                            | Tableau de bord connecté (dans `(app)`).                                                                                                                        |
| `/questions`                                                            | Liste « Mes tâches » (filtres, cartes miniatures).                                                                                                              |
| `/questions/new`                                                        | Wizard création TAÉ (7 étapes).                                                                                                                                 |
| `/questions/[id]`                                                       | Vue détaillée tâche via `TacheVueDetaillee` (onglets Sommaire / Aperçu de l’imprimé).                                                                           |
| `/questions/[id]/edit`                                                  | Wizard édition TAÉ (`fetchTacheFormStateForEdit`, RPC `update_tae_transaction`).                                                                                |
| `/questions/[id]/print`                                                 | Impression tâche (segment `(print)`, hors AppShell, garde `requireActiveAppUser`).                                                                              |
| `/documents`                                                            | Liste « Mes documents ».                                                                                                                                        |
| `/documents/new`                                                        | Wizard document autonome (3 étapes, split formulaire/sommaire).                                                                                                 |
| `/documents/[id]`                                                       | Vue détaillée document via `DocumentVueDetaillee` (onglets Sommaire / Aperçu de l’imprimé).                                                                     |
| `/documents/[id]/edit`                                                  | Édition document via le même wizard que la création.                                                                                                            |
| `/documents/[id]/print`                                                 | Impression document (segment `(print)`, garde `requireActiveAppUser`).                                                                                          |
| `/bank`                                                                 | Banque collaborative (onglets tâches, documents, épreuves).                                                                                                     |
| `/evaluations`, `/evaluations/new`, `/evaluations/[id]/edit`            | Liste et composition d’épreuves (RPC `save_evaluation_composition`).                                                                                            |
| `/evaluations/[id]`                                                     | Vue détaillée épreuve via `EpreuveVueDetaillee` (onglets Sommaire / Aperçu de l’imprimé).                                                                       |
| `/profile/[id]`                                                         | Profil enseignant (hero, contributions, édition propriétaire, suppression Loi 25). Spec : [specs/fermees/profil-ux-spec.md](./specs/fermees/profil-ux-spec.md). |
| `/collaborateurs`                                                       | Répertoire collaborateurs, recherche locale+serveur, scroll infini.                                                                                             |
| `/apercu/[token]`                                                       | Route SSR du print engine : vérifie le token HMAC, lit le payload draft dans Vercel KV, dispatch `document`/`tache`/`epreuve`, rend `ApercuImpression`.         |
| `/apercu/test/[slug]`                                                   | Route de test dev-only basée sur fixtures golden (`tests/e2e/fixtures/golden-payloads`). 404 en production.                                                     |
| `/api/collaborateurs/search`                                            | Route handler GET : recherche serveur des collaborateurs (avec rate-limit).                                                                                     |
| `/api/impression/token-draft`                                           | Route handler POST : stocke un payload draft (TTL 10 min) dans KV et renvoie un token HMAC signé.                                                               |
| `/api/impression/pdf`                                                   | Route handler POST : génère un PDF via Puppeteer à partir de `/apercu/[token]`.                                                                                 |
| `/api/impression/apercu-png`                                            | Route handler POST : génère les PNG page par page (carrousel d’aperçu) via Puppeteer.                                                                           |
| `/auth/callback`                                                        | Callback Supabase (OAuth/magic link).                                                                                                                           |
| `/dev/wizard-lab`                                                       | Labo d’édition wizard, `dynamic = "force-dynamic"`, bloqué en production.                                                                                       |
| `/eval-grid-snapshot/[id]`                                              | Route de snapshots Playwright pour non-régression visuelle des grilles.                                                                                         |
| `/prototype/fiche-lecture-maquette`, `/prototype/fiche-maquette-finale` | Routes de maquettes visuelles hors navigation produit.                                                                                                          |

## Authentification (Next.js + Supabase)

Implémentation actuelle : pages `(auth)`, Server Actions dans `lib/actions/auth.ts`, callback `app/auth/callback/route.ts`, listes CSS/écoles dans `public/data/css-ecoles.json`. Les sections **WordPress / PHP / REST `eduqc/v1/auth/*`** de l’ancienne spec `AUTH.md` sont **historiques** (cible de migration jamais reprise telle quelle dans ce dépôt) ; ne pas les reproduire comme modèle Next.js.

## Variables d’environnement

| Variable                        | Rôle                                                                   |
| ------------------------------- | ---------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | URL du projet Supabase.                                                |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé anon Supabase (client + serveur).                                  |
| `SUPABASE_SERVICE_ROLE_KEY`     | Clé service role (serveur uniquement).                                 |
| `NEXT_PUBLIC_SITE_URL`          | URL canonique utilisée pour callbacks et URLs d’aperçu/PDF.            |
| `DRAFT_TOKEN_SECRET`            | Secret HMAC des tokens draft impression (minimum 32 caractères).       |
| `KV_REST_API_URL`               | Endpoint REST Vercel KV pour stocker les payloads draft.               |
| `KV_REST_API_TOKEN`             | Token REST Vercel KV.                                                  |
| `CHROMIUM_EXECUTABLE_PATH`      | Optionnel : chemin Chromium explicite hors runtime Vercel.             |
| `NODE_ENV`                      | Active les gardes dev-only (`/dev/wizard-lab`, `/apercu/test/[slug]`). |

Dupliquer **Production** et **Preview** sur l’hôte (ex. Vercel) ; pour Preview, `NEXT_PUBLIC_SITE_URL` doit être l’URL de preview. Local : `.env.local` depuis `.env.example` (non versionné). La CI injecte des placeholders — pas de secrets dans le workflow. Pour tester l’impression localement, ajouter aussi `DRAFT_TOKEN_SECRET`, `KV_REST_API_URL`, `KV_REST_API_TOKEN` (et éventuellement `CHROMIUM_EXECUTABLE_PATH`).

Régénération des types : `npm run gen:types` (`scripts/gen-database-types.cjs`, variables optionnelles dans `.env.example`). Après ajout ou modification de RPC (ex. `save_evaluation_composition`), appliquer la migration sur Supabase puis régénérer pour éviter l’écart avec les entrées manuelles dans `lib/types/database.ts`.

## CI et qualité

- **GitHub Actions** : `.github/workflows/ci.yml` — job **quality** : `format:check` → `lint` (0 erreur) → `test` (Vitest) → `build` ; job **e2e-grilles** (Windows) : `playwright install` → `build` → `npm run test:e2e` (`tests/e2e/eval-grids.spec.ts`, baselines `*-win32.png` — même OS que le runner).
- **Locale** : `npm run ci` recommandé avant merge — chaîne `format:check` + `lint` + `test` + `build` (`package.json`, alignée sur le job quality). Tests E2E grilles : `npm run test:e2e` après `npm run build` (ou laisser Playwright démarrer `next start` via `playwright.config.ts`). Tests unitaires : `lib/tache/*.test.ts`, config `vitest.config.ts`.

## Schéma base de données

**SQL canonique :** `supabase/schema.sql`. Toute évolution passe par ce fichier puis application sur Supabase.

**Migrations incrémentales :** `supabase/migrations/*.sql` — à appliquer sur les projets déjà créés (ex. `supabase db push` ou collage dans l’éditeur SQL). Ex. édition TAÉ : `20250325180000_update_tae_transaction.sql` si **PGRST202** ; collaborateurs en publication : `20250325200000_tae_collaborateurs_rpc.sql`. **Quatrième document TAÉ (`doc_D`) :** `20260328140000_tae_documents_slot_doc_d.sql` — élargit `tae_documents.slot` pour les parcours à 4 documents (non rédactionnel, spec ordre chronologique) ; aligné sur `lib/tache/blueprint-helpers.ts` (`DocumentSlotId`). **Documents — repère temporel / année / banque :** `20260330120000_documents_repere_temporel_bank.sql` — colonnes `repere_temporel`, `annee_normalisee` ; les RPC `publish_tae_transaction` et `update_tae_transaction` insèrent les nouveaux documents avec **`is_published = false`** (création depuis une TAÉ) ; création autonome inchangée côté app (`is_published: true`). **Non rédactionnel 1.3 (avant / après) :** `20260330220000_tae_non_redaction_data.sql` — colonne **`tae.non_redaction_data`** (JSONB) ; **`20260330220300_publish_update_tae_non_redaction_data_rpc.sql`** — `CREATE OR REPLACE` des RPC **`publish_tae_transaction`** / **`update_tae_transaction`** (écriture JSON + `CASE WHEN p_payload->'tae' ? 'non_redaction_data'` à l’UPDATE ; copie alignée sur **`supabase/schema.sql`**) ; `20260330220100_comportement_13_nb_documents.sql` — `comportements.nb_documents` = 4 pour **1.3**. **Catégorie iconographique :** `20260330210000_documents_type_iconographique.sql` — colonne `type_iconographique` (TEXT, optionnel) ; index partiel ; RPC publication / mise à jour alignées sur le payload `documents_new`. **Composition d’épreuve :** `20250328120000_save_evaluation_composition.sql` si la RPC `save_evaluation_composition` manque (**PGRST202** ou erreur applicative explicite) ; puis `20250328130000_save_evaluation_composition_epreuve_message.sql` pour le message « épreuve introuvable ». **Documents (wizard `/documents/new`) :** si PostgREST signale une colonne absente (`image_legende`, `source_type`, etc.) ou « schema cache », appliquer au minimum `20250327140000_documents_source_type_legende_po.sql` (et `20250327180000_publish_update_documents_source_legende_rpc.sql` si les RPC publication le requièrent) ; recharger le schéma côté Supabase si besoin. **`print_impression_scale` supprimée :** `20260416120000_drop_documents_print_impression_scale.sql` — DROP COLUMN + recréation RPCs. L’action `createAutonomousDocumentAction` retente un insert **sans** champs optionnels tant que l’erreur ressemble à un décalage schéma — toast `TOAST_DOCUMENT_CREATE_DEGRADED` dans `lib/ui/ui-copy.ts`.

### Décisions de modélisation

| Sujet                    | Décision                                                                                                                                                                                  |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tae.titre`              | Absent — `consigne` partout ; `banque_tae.apercu` = `left(trim(consigne), 80)`.                                                                                                           |
| `evaluations.titre`      | Présent — titre distinct du contenu.                                                                                                                                                      |
| Email                    | Contrainte `@*.gouv.qc.ca` + trigger liste blanche `email_domains_whitelist` sur `profiles`.                                                                                              |
| OI0                      | Active (comportement 0.1, 1 document).                                                                                                                                                    |
| Aspects                  | 5 valeurs en formulaire (Économique, Politique, Social, Culturel, Territorial) — voir aussi taxonomie élargie en [FEATURES.md](./FEATURES.md).                                            |
| Rôles                    | `enseignant`, `conseiller_pedagogique`, `admin`.                                                                                                                                          |
| Co-conception            | `tae_collaborateurs` — le collaborateur peut modifier, pas supprimer.                                                                                                                     |
| Comportements            | 17 dont 0.1 et OI1 (1.1–1.3) actifs ; **1.3** = 4 documents (`nb_documents` = 4) ; plage 1–4 pour 1.1 (4 extraits) ; 4.3 et 4.4 `coming_soon`.                                            |
| `tae.non_redaction_data` | JSONB nullable — parcours NR structurés (ex. **1.3** `{ type, payload }`) ; 1.1 / 1.2 **NULL** tant que non migrés ; RPC `CASE WHEN p_payload->'tae' ? 'non_redaction_data'` en `UPDATE`. |
| Versioning               | Champs majeurs : `oi_id`, `comportement_id`, `documents`, `cd`, `connaissances` → bump + reset votes ; mineurs : `consigne`, `guidage`, `corrige`, `nb_lignes` → patch silencieux.        |
| Brouillon wizard         | `tae_wizard_drafts` — une ligne par `user_id`, `payload` JSONB.                                                                                                                           |

### RPC `publish_tae_transaction`

- **Rôle :** publier une TAÉ en une transaction : documents nouveaux, ligne `tae`, `tae_documents`, suppression du brouillon `tae_wizard_drafts` pour l’utilisateur courant (si la table existe).
- **Signature :** `publish_tae_transaction(p_payload jsonb) RETURNS uuid`.
- **Appel côté app :** `lib/tache/publish-tache.ts` (`publishTacheFromFormState`) — payload construit dans `publish-tache-payload.ts`, lookups Supabase dans `publish-tache-lookups.ts`, erreurs RPC normalisées dans `publish-tache-rpc-errors.ts` ; types dans `publish-tache-types.ts`.
- **Appel :** `supabase.rpc('publish_tae_transaction', { p_payload: <objet> })` — objet JS, pas une chaîne seule.
- **Sécurité :** `SECURITY DEFINER`, `search_path = public`, validation `auteur_id = auth.uid()`, `set_config('row_security', 'off', true)` pour éviter la récursion RLS.
- **Payload :** `auteur_id`, `tae` (colonnes publiables, dont **`non_redaction_data`** JSONB optionnel pour le parcours **1.3**), `documents_new[]` (entrées avec `elements` JSONB, métadonnées pédagogiques), `slots` (`mode` reuse/create, `document_id`, `newIndex`, etc.), `collaborateurs_user_ids[]` (UUID `profiles.id` actifs, exclus l’auteur — requis si `tae.conception_mode` = `equipe`). Insertion via `apply_tae_collaborateurs_from_payload` dans `supabase/schema.sql`.
- **Définition complète et `GRANT` :** fin de `supabase/schema.sql`.

### RPC `update_tae_transaction`

- **Rôle :** mettre à jour une TAÉ existante (wizard **Modifier**) en une transaction : nouveaux documents éventuels, `UPDATE tae`, remplacement des lignes `tae_documents`. Refus si la TAÉ figure dans `evaluation_tae`.
- **Signature :** `update_tae_transaction(p_tae_id uuid, p_payload jsonb) RETURNS uuid`.
- **`non_redaction_data` :** si la clé est **absente** sous `p_payload->'tae'`, la colonne existante est **conservée** ; si la clé est **présente** (y compris `null`), la valeur est **remplacée** — voir `CASE WHEN … ? 'non_redaction_data'` dans `supabase/schema.sql`.
- **Appel côté app :** `lib/tache/publish-tache.ts` (`updateTacheFromFormState`) — `supabase.rpc('update_tae_transaction', { p_tae_id, p_payload })`.
- **Déploiement :** doit exister sur le projet Supabase utilisé par l’app. Si elle manque, appliquer `supabase/migrations/20250325180000_update_tae_transaction.sql` puis `supabase/migrations/20250325200000_tae_collaborateurs_rpc.sql` (ou l’extrait équivalent dans `schema.sql`).

### RPC `save_evaluation_composition`

- **Rôle :** créer ou mettre à jour une **épreuve** (`evaluations`, titre, ordre des TAÉ dans `evaluation_tae`), en brouillon ou en publiant (`p_publish = true` impose au moins une TAÉ).
- **Signature :** `save_evaluation_composition(p_evaluation_id uuid, p_titre text, p_tae_ids uuid[], p_publish boolean) RETURNS uuid` — `p_evaluation_id` **NULL** = insert `evaluations` + lignes `evaluation_tae`.
- **Appel côté app :** `lib/actions/evaluation-save.ts` (`saveEvaluationCompositionAction`) — `supabase.rpc('save_evaluation_composition', { … })` ; pas d’appel Supabase depuis un Client Component.
- **Sécurité :** `SECURITY DEFINER`, `search_path = public`, compte actif, `auteur_id` vérifié sur mise à jour ; `set_config('row_security', 'off', true)` pour les opérations sur `evaluation_tae`.
- **Définition complète et `GRANT` :** `supabase/schema.sql` (bloc composition d’épreuve, table `evaluations`) ; migrations `20250328120000_save_evaluation_composition.sql`, `20250328130000_save_evaluation_composition_epreuve_message.sql`.

### RPC `delete_account_anonymize`

- **Rôle :** suppression de compte Loi 25 — anonymise le profil (`first_name` = '[Compte', `last_name` = 'supprimé]'`, email nul, school_id nul, status = suspended), vide les tables pivot (`profile_disciplines`, `profile_niveaux`), supprime les brouillons non publiés (`tae`+`documents`+`evaluations`WHERE`is_published = false`).
- **Signature :** `delete_account_anonymize(p_user_id UUID) RETURNS void`.
- **Appel côté app :** `lib/actions/account-delete.ts` (`deleteAccountAction`) — validation Zod confirmation "SUPPRIMER", puis `supabase.rpc('delete_account_anonymize', { p_user_id })`.
- **Sécurité :** `SECURITY DEFINER`, `search_path = public`, vérifie `auth.uid() = p_user_id`.
- **Migration :** `20260414150000_profile_phase1_pivot_tables.sql`.

### Récapitulatif des tables

| Table                                                                  | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `profiles`                                                             | Profils (étend `auth.users`). Colonnes `first_name`, `last_name` (NOT NULL), `school_id` (UUID FK → `schools`), `years_experience` (SMALLINT NULL), `genre` (TEXT NULL, CHECK `homme`/`femme` — conditionne l'accord du label rôle). RPC `delete_account_anonymize` pour suppression compte Loi 25.                                                                                                                                                                                                                                                                                                                                                                                                             |
| `profile_disciplines`, `profile_niveaux`                               | Tables pivot profil ↔ disciplines/niveaux. FK vers `profiles(id)` ON DELETE CASCADE + FK vers `disciplines(code)` / `niveaux(code)`. RLS : lecture authentifiés, modification propriétaire uniquement. Migration `20260414150000`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `css`                                                                  | Centres de services scolaires — référentiel MEQ (72 entrées). Colonnes `gov_id` (UNIQUE), `nom_officiel`, `nom_court`, `type_cs` (enum `Franco`/`Anglo`/`Statut`), `is_active`. Seedé par `npm run seed:schools`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `schools`                                                              | Écoles publiques secondaires — référentiel MEQ (602 entrées, SEC=1). Colonnes `gov_id` (UNIQUE), `css_id` (FK → `css`), `nom_officiel`, `is_active`. Seedé par `npm run seed:schools`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `email_domains_whitelist`                                              | Domaines écoles autorisés.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `niveaux`, `disciplines`, `oi`, `comportements`, `cd`, `connaissances` | Référentiels.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `tae`                                                                  | Tâche — pas de colonne `titre`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `tae_collaborateurs`, `tae_wizard_drafts`, `tae_versions`              | Co-conception, brouillon, archives version majeure.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `documents`, `tae_documents`                                           | Documents historiques, slots `doc_A` / `doc_B` / `doc_C` / `doc_D`. Colonnes **`repere_temporel`**, **`annee_normalisee`** (repère temps enseignant, année pour algorithmes OI1 non rédactionnels). **`type_iconographique`** (TEXT, optionnel) : sous-catégorie didactique si **`type` = iconographique** — filtre banque, affichage fiche / liste ; validation applicative. **`is_published`** sur `documents` : visibilité **banque** — `false` pour les documents **créés lors de la publication d’une TAÉ** jusqu’à complétion (fiche document) ; `true` pour création autonome. Colonnes **`source_type`**, **`image_legende`**, **`image_legende_position`** — voir [FEATURES.md](./FEATURES.md) §5–5.6. |
| `votes`, `votes_archives`, `tae_usages`                                | Votes, archive, usage (déverrouillage vote).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `commentaires`                                                         | Commentaires sur TAÉ publiées.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `evaluations`, `evaluation_tae`                                        | **Épreuve** en copy UI — tables SQL `evaluations` et liaisons `evaluation_tae` (ordre des tâches dans l’épreuve).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `favoris`, `notifications`                                             | Favoris et notifications.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

### Synchronisation après changement SQL

1. Modifier `supabase/schema.sql` et **appliquer** les migrations sur **chaque** projet Supabase cible (éditeur SQL du dashboard, ou CLI `supabase db push` après `supabase link`). Pour la composition d’épreuve : fichiers `supabase/migrations/20250328120000_save_evaluation_composition.sql` et `20250328130000_save_evaluation_composition_epreuve_message.sql`.
2. Mettre à jour la **table des décisions** et ce récapitulatif dans ce fichier si le métier change.
3. `npm run gen:types` → `lib/types/database.ts`. **Ordre :** appliquer la migration **avant** la régénération si vous ajoutez une RPC — sinon le générateur ne l’inclut pas et peut faire disparaître une entrée déjà présente pour cette fonction. En attendant le déploiement SQL, une signature peut rester **fusionnée à la main** dans `database.ts` (commentaire de repère sur `save_evaluation_composition`).
4. `npm run build`.

## Déploiement et maturité

| Zone              | État (doc de référence)                                                                                                                                                                                                     |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Build             | `npm run build` attendu OK sur branche principale.                                                                                                                                                                          |
| CI                | Format, lint 0 erreur, build sur push/PR.                                                                                                                                                                                   |
| Hébergement cible | Vercel (doc produit) — config tableau de bord hôte.                                                                                                                                                                         |
| Application       | Auth, shell, dashboard, wizard TAÉ 7 étapes, édition tâche `/questions/[id]/edit`, fiche, listes partielles ; banque `/bank` ([FEATURES.md](./FEATURES.md) §13.2) ; export PDF épreuve — détail [BACKLOG.md](./BACKLOG.md). |

**Server Actions (taille du corps) :** Next.js applique par défaut une limite d’environ **1 MB** sur le corps des requêtes d’actions serveur. La publication TAÉ et les formulaires riches (grilles en HTML, documents liés) peuvent dépasser ce plafond et renvoyer une erreur côté client du type « Body exceeded 1 MB limit ». Le projet fixe **`experimental.serverActions.bodySizeLimit`** à **10 MB** dans `next.config.ts` — référence : [Next.js — `serverActions.bodySizeLimit`](https://nextjs.org/docs/app/api-reference/config/next-config-js/serverActions#bodysizelimit).

**RPC sur environnements existants :** les projets Supabase provisionnés **avant** l’ajout de `update_tae_transaction` dans `schema.sql` doivent appliquer la migration `supabase/migrations/20250325180000_update_tae_transaction.sql` (SQL Editor ou `supabase db push` après `supabase link`). Sinon l’édition renvoie PGRST202 ; message utilisateur et copy : [DECISIONS.md](./DECISIONS.md) (toasts Créer une TAÉ).

### Checklist RLS (manuelle)

Avant démo ou go-live, exécuter la procédure **[RLS-CHECKLIST.md](./RLS-CHECKLIST.md)** sur **staging ou prod** (ou local + projet Supabase réel) avec **deux comptes** enseignants actifs. La checklist est **par vagues** : **1–2** (brouillons) ; **3–4** (épreuves brouillon + composition) — **OK documenté** sur env local (27 mars 2026, voir fiche de passage dans la checklist) ; rejouer sur **staging/prod** avant go-live si besoin ; **5–7** surtout **après** la **banque collaborative** — voir [BACKLOG.md](./BACKLOG.md) §3 et [RLS-CHECKLIST.md](./RLS-CHECKLIST.md). Politiques dans `supabase/schema.sql` (`tae_select`, `tae_wizard_drafts_*_own`, `eval_*`, `favoris_own`, etc.).

### Écarts produit

Référence : [BACKLOG.md](./BACKLOG.md) (produit abouti + backlog technique). Bloquants typiques : Supabase réel + RLS validées ; bucket Storage si upload iconographique en prod.

## Grilles d’évaluation ministérielles (barème en HTML)

- **Emplacement code :** `components/tache/grilles/` — registre injectif `renderGrilleNode` dans `grille-registry.tsx` (constante **`DEDICATED_GRILLES`** + `Record` exhaustif pour OI3_SO5 / OI6_SO3 / OI7_SO1, sinon `GenericEchelleGrid`), entrée UI `GrilleEvalTable` (prop `viewport` : `default` | `compact` impression | `comfort` modale), attribut `data-tache-print-eval-grid` (repérage DOM), CSS `eval-grid.module.css` (tokens `--eval-grid-*`, tailles de typo **sur `table`** — indépendantes du corps fiche), consommateurs : modale **Outil d’évaluation** (`GrilleCorrectionModal` → `SimpleModal` avec **`fitContentHeight`** pour hauteur selon la grille, sans scroll interne), aperçu impression fiche.
- **Impression fiche TAÉ :** feuille **Letter** — variables **`--tache-print-sheet-*`** sur `:root` (`app/globals.css`) : largeur **8,5 in**, hauteur min. **11 in**, **`--tache-print-sheet-padding` 2 cm** sur **`.paper`** (aperçu écran). **Impression :** **`@page { margin: 2cm; size: letter portrait }`** (`TACHE_PRINT_PAGE_MARGIN`, aligné sur ce padding) via `lib/tache/print-page-css.ts` ; **`#tache-wizard-printable-fiche`** en print **`padding: 0`**, **`width: 100%`**, **`max-width: none`** — marges blanches répétées **à chaque page**. Corps fiche (hors barèmes) : **Arial**, **11pt** / **line-height 1.5** (`globals.css` @media print + `.paper`) ; les grilles gardent **Arial** et leurs tailles sur **`table`** (`eval-grid.module.css`, grilles dédiées). Section **documents** : grille `docsGrid` (`auto-fit` / `minmax`, hybride `:has` + `docsGridHasIcono`) ; **document iconographique** : **`.documentCell`** **`max-content`** + **`justify-self: start`** (hors **`.documentCellFull`**) ; figures avec **`--tache-print-document-figure-max-height`** sur `:root` — plafond **`max-height`** sur **`.documentFigureImg`**, **`.documentFigure`** **`inline-block`** / **`max-width: 100%`** — `PrintableFichePreview.tsx`, `lib/tache/print-document-full-width.ts` — détail JSDoc `print-page-css.ts`.
- **Typo des barèmes :** chaque segment `(…)` est rendu dans un `span` `white-space: nowrap` (`eval-grid.module.css` `.nowrapParenGroup`) via `grilleTextWithLockedParenGroups` (`components/tache/grilles/grille-text-nodes.tsx`, découpe `splitGrilleParenSegments` dans `lib/tache/grilles/split-paren-groups.ts`) pour éviter toute césure _à l’intérieur_ des parenthèses ; hors `(…)`, `tieAsciiParentheses` (U+2060) reste utilisé pour les bords. **OI6_SO3** : `nowrap` sur les libellés de points dans `oi6-so3-grid.module.css` (`.nowrapParen`).
- **Source de vérité textes / métadonnées :** `public/data/grilles-evaluation.json` (22 outils). Grilles à structure spéciale (fusions, doubles filets) : **OI3_SO5**, **OI6_SO3**, **OI7_SO1** — définitions dédiées dans le même dossier ; les autres passent par le rendu générique à partir de `bareme.echelle`. **OI3_SO5** : **4 colonnes** **`84 + 106 + 420 + 50 px`** ; **contour extérieur `1px`** (`.tableOi3So5`) ; **`line-height: 1,14`** ; traits retirés entre libellé et points ; pied **`.oi3FooterTextCell`** en **`colSpan={2}`** (colonnes condition + libellé), **gauche**, césure normale ; typo **9pt** sauf rubrique **12,5px**. **Statut pixel-perfect :** validée (mars 2026) — détail sous la liste **Grilles complexes — statut pixel-perfect** ci-dessous. **LEGACY** **`public/data/grilles-templates.html`** : **`scripts/extract-grilles-templates-from-preview.mjs`**.
- **OI6_SO3** : composant dédié **`OI6SO3Grid.tsx`** (export **default**) + **`oi6-so3-grid.module.css`** — tableau HTML explicite (`table-layout: fixed`, **660px**, **10pt** sur `<table>`, `font-weight: normal`), `<colgroup>` **115 + 110 + 295 + 140 px** (= **660**), bordure extérieure **`1.5px solid #000`** ; fusions verticales : Col2|Col3 (**`.thCond` / `.tdDesc`**) et Col3|Col4 (**`.tdDesc` / `.tdScore`**, `border-right` / `border-left: none`) ; trait vertical interne seulement **Col1|Col2** ; **`.tdDesc`** : **`font-size: 9pt`** (corps tableau **10pt** ailleurs), **`text-align: center`**, wrap ; **`.thCond`** : **`6px 4px`** ; points **`.nowrapParen`** ; sauts de ligne rubrique / sous-critères calés **`maquette/img/OI6_SO3.png`** ; **`rowGroup2`** ; note **9pt** / **`.footnoteMark`**. Réf. LEGACY **`public/data/grilles-templates.html`**. **`GrilleOI6SO3`** enveloppe l’export default pour le registre.
- **OI7_SO1** : **`GrilleOI7SO1.tsx`** + **`.tableOi7`** dans **`eval-grid.module.css`** — **660px**, `<colgroup>` **`94 + 118 + 378 + 70 px`** (élargissement col. 3 en priorité depuis col. 4, puis 2, puis 1) ; contour extérieur **`1px`** ; **graisse normale** partout ; **colonne 3 centrée** sauf **dernière ligne** fusionnée (**`.oi7FooterMergedCell`** → **gauche**) ; **pas de trait vertical** col. 3 ↔ points ; dernière ligne : `colSpan={2}` + **`noBorderRight`** avant **« 0 point »**. **Statut pixel-perfect :** validée (mars 2026) — détail sous **Grilles complexes — statut pixel-perfect**.
- **Recette (réalisme vs PNG)** — critères figés pour l’équipe :
  - **A — Structure :** même graphe de cellules (`rowspan` / `colspan`) que le référentiel / maquettes `maquette/grilles-bem-exemples.html` et `maquette/grilles-preview.html`.
  - **B — Visuel :** indiscernable pour un correcteur à **zoom navigateur 100 %** sur **Chrome récent (dernière version stable) sous Windows 10/11**, police **Arial** (taille de référence **14 px** dans les cellules, sauf exception documentée pour une grille donnée).
  - **C — Non-régression automatisée :** captures Playwright (`toHaveScreenshot`) sur la route publique `/eval-grid-snapshot/[id]` — baselines `*-win32.png` générées sur le **même OS** que le job CI (**windows-latest** + Chromium) ; seuil `maxDiffPixels` ajustable si besoin.
- **Grilles complexes — statut pixel-perfect (A/B/C) :** les **trois** grilles à composant dédié (**`DEDICATED_GRILLES`**) sont **validées** (mars 2026) — objectif référentiel PNG / maquette / non-régression **atteint** pour ce périmètre.
  - **OI3_SO5** : `GrilleOI3SO5.tsx`, PNG `maquette/img/OI3_SO5.png`, baseline **`OI3-SO5-win32.png`**.
  - **OI6_SO3** : `OI6SO3Grid.tsx`, PNG `maquette/img/OI6_SO3.png`, baseline **`OI6-SO3-win32.png`** (historique [BACKLOG.md](./BACKLOG.md) : entrées « OI6_SO3 pixel-perfect »).
  - **OI7_SO1** : `GrilleOI7SO1.tsx`, PNG `maquette/img/OI7_SO1.png`, baseline **`OI7-SO1-win32.png`**.
  - **Snapshots Playwright** (`SNAPSHOT_PILOTS` dans `tests/e2e/eval-grids.spec.ts`) : **OI0_SO1** (pilote **rendu générique**) + **OI3_SO5** / **OI6_SO3** / **OI7_SO1** (complexes). Les **19** autres outils : `GenericEchelleGrid` — pas de baseline screenshot dédiée ; régression couverte par les tests d’affichage sans capture.
- **Produit :** pas de titre visible sur le tableau (pas de `<caption>` affiché) ; `aria-label` technique basé sur l’`id` stable ; traits **#000** ; fond du bloc grille **transparent**. **Largeur du bloc grille : toujours 660px** (`width` / `min-width` / `max-width` = `var(--eval-grid-base-width)` dans `eval-grid.module.css`) — jamais plus étroit ; la hauteur s’ajuste au contenu ; parents (`overflow-x-auto` modale, fiche imprimable, snapshots) si l’écran est plus étroit que 660px. Exception **OI6_SO3** : légende astérisque sous le tableau (donnée `bareme.note` dans le JSON).

## Références croisées

- Formulaires et UI : [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md)
- Parcours wizard détaillé : [WORKFLOWS.md](./WORKFLOWS.md)
- Copy UI : [UI-COPY.md](./UI-COPY.md) ; règles / protocoles : [DECISIONS.md](./DECISIONS.md)
