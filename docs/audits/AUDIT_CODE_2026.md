# Audit Code — ÉduQc.IA — Avril 2026

> **Auditeur :** Analyse automatisée complète du workspace (architecture, code source, SQL, tests, configs, dépendances).
> **Scope :** Intégralité du dépôt — `app/`, `components/`, `lib/`, `supabase/`, `tests/`, configs racine.
> **Date :** 12 avril 2026 — Stack : Next.js 16.2, React 19.2, Supabase, TypeScript strict, Tailwind v4.

---

## Résumé Exécutif

**Score global : 8,2 / 10** — projet de très bonne qualité pour un développeur solo. La rigueur documentaire, la sécurité Supabase (RLS exhaustive, RPC blindées) et la qualité des primitives UI sont remarquables. Les lacunes principales concernent l'infrastructure Next.js moderne (streaming, error boundaries, caching) et la couverture de tests d'intégration.

### Points forts globaux

- **Documentation exceptionnelle** — 7 fichiers `docs/` normatifs, backlog structuré par paliers, conventions de nommage, protocoles de maintenance documentaire.
- **Sécurité Supabase best-in-class** — 21 tables avec RLS, 44 index, RPC `SECURITY DEFINER` avec validation des inputs, aucune injection SQL, `service_role` isolé côté serveur uniquement.
- **UI primitives exemplaires** — 25 composants `components/ui/`, 0 `any`, accessibilité ARIA exhaustive, patterns composables (FieldLayout, MillerColumns), keyboard nav complète.
- **TypeScript strict respecté** — 0 `any` dans le code applicatif, ESLint `@typescript-eslint/no-explicit-any: "error"`, Zod safeParse systématique.
- **Architecture serveur-first appliquée** — `'use client'` limité aux composants interactifs (10/25 primitives UI), Server Actions avec auth guard, RPC transactionnelles.

### Top 3 risques

| #   | Risque                                                                                                                               | Impact                                                                                           |
| --- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| 1   | **Aucun `loading.tsx` ni `error.tsx`** dans l'arbre App Router — pas de streaming/Suspense, pas de récupération d'erreur côté client | UX dégradée (écran blanc en cas d'erreur serveur, pas d'état de chargement natif)                |
| 2   | **Couverture tests d'intégration = 0** — Server Actions non testées, aucun mock Supabase, E2E limité à 3 fichiers                    | Régressions invisibles sur les flux critiques (publication, brouillons, auth)                    |
| 3   | **6 occurrences `select("*")`** dans les queries de production (hors docs)                                                           | Colonnes futures exposées automatiquement, surcharge réseau, violation des conventions du projet |

### Top 3 quick wins

| #   | Action                                                                               | Effort     | Impact                                             |
| --- | ------------------------------------------------------------------------------------ | ---------- | -------------------------------------------------- |
| 1   | Ajouter `loading.tsx` + `error.tsx` sur les 5 route groups principaux                | 1–2 jours  | Streaming natif + récupération d'erreurs gracieuse |
| 2   | Remplacer les 6 `select("*")` par des colonnes explicites                            | 2–3 heures | Sécurité, performance, alignement conventions      |
| 3   | Ajouter `<Suspense>` boundaries sur les pages `dashboard` et `bank` (données lentes) | 1 jour     | Temps de chargement perçu réduit drastiquement     |

---

## 1. Architecture & Structure Globale

**Score : 8,5 / 10**

### Points forts

- **Route groups bien séparés** : `(auth)` / `(app)` / `(print)` avec layouts dédiés et auth guards au bon niveau (`requireActiveAppUser()` dans les layouts `(app)` et `(print)`).
- **Séparation Server/Client disciplinée** : package `server-only` installé, admin Supabase isolé dans `lib/supabase/admin.ts`, middleware propre pour la session.
- **Architecture par feature cohérente** : `components/tache/`, `components/documents/`, `components/evaluations/`, `components/bank/` — chaque entité a son espace avec ses sous-composants.
- **`lib/` bien structurée** : `actions/` (Server Actions), `queries/` (lectures), `schemas/` (Zod), `types/` (TypeScript), `tae/` (helpers métier). Séparation claire des responsabilités.
- **Conventions de nommage documentées et respectées** : kebab-case fichiers, PascalCase composants, noms français pour le domaine métier.
- **Pas de route handlers REST inutiles** : la quasi-totalité des mutations passe par des Server Actions — architecture Next.js 2026 correcte.

### Problèmes

#### 🔥 Critique — Aucun `loading.tsx` ni `error.tsx`

```
app/
  (app)/
    ❌ Pas de loading.tsx
    ❌ Pas de error.tsx
    bank/
    dashboard/
    questions/
    ...
```

**Impact :** Next.js App Router exploite ces fichiers pour le streaming (React Suspense automatique) et la récupération d'erreur côté route. Sans eux :

- L'utilisateur voit un écran blanc pendant le chargement des Server Components.
- Une erreur serveur non capturée crashe la page entière sans fallback.
- Aucun streaming des parties lentes de la page (ex. queries dashboard).

**Recommandation :**

```tsx
// app/(app)/loading.tsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <span className="material-symbols-outlined text-4xl text-muted animate-spin">
        progress_activity
      </span>
    </div>
  );
}
```

```tsx
// app/(app)/error.tsx
"use client";
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <h2 className="text-xl font-semibold">Une erreur est survenue, veuillez réessayer</h2>
      <p className="text-muted">Si le problème persiste, contactez le support.</p>
      {error.digest && <p className="text-xs text-muted/60">Référence : {error.digest}</p>}
      <button onClick={reset} className="btn-accent">
        Réessayer
      </button>
    </div>
  );
}
```

#### ⚠️ Important — Aucune utilisation de `<Suspense>` dans l'arbre applicatif

Le mot-clé `Suspense` n'apparaît dans aucun composant applicatif (seulement dans la doc `CLAUDE.md`). Les pages qui font des queries Supabase (dashboard, bank, questions) chargent tout en bloc.

**Recommandation :** Envelopper les sections de données lentes dans des `<Suspense>` boundaries :

```tsx
// app/(app)/dashboard/page.tsx
import { Suspense } from "react";

export default function DashboardPage() {
  return (
    <>
      <h1>Tableau de bord</h1>
      <Suspense fallback={<DashboardStatsSkeleton />}>
        <DashboardStats />
      </Suspense>
      <Suspense fallback={<RecentTasksSkeleton />}>
        <RecentTasks />
      </Suspense>
    </>
  );
}
```

#### ⚠️ Important — Pas de `not-found.tsx` global pour `(app)`

Un seul `not-found.tsx` existe dans `(app)/` — vérifier qu'il couvre les routes dynamiques (`/questions/[id]` avec un ID invalide devrait montrer un 404 stylisé, pas un crash).

#### 💡 Amélioration — `"use cache"` / PPR non exploité

Next.js 16 offre le Partial Prerendering et les Cache Components (`"use cache"`). Aucune utilisation détectée. Pas bloquant pour un produit de cette taille, mais les pages banque et dashboard sont des candidates idéales pour du cache statique avec revalidation fine.

#### 💡 Amélioration — `next.config.ts` minimal

```ts
experimental: {
  serverActions: {
    bodySizeLimit: "10mb",  // justifié mais élevé
  },
}
```

Manque potentiellement :

- `images.formats: ['image/avif', 'image/webp']` pour l'optimisation images.
- `logging.fetches.fullUrl: true` en dev pour le debug des requêtes serveur.

---

## 2. Performance & Scalabilité

**Score : 7 / 10**

### Points forts

- **Sharp correctement configuré** — redimensionnement serveur boîte max 660×400px, pas d'upscale, proportions conservées.
- **`dynamic import`** utilisé pour les blocs lourds du wizard (`Bloc5`, `wizardBlocResolver`, `behaviours/registry`).
- **Indexes Supabase exhaustifs** — 44 index couvrant les filtres banque, recherche trigramme (`pg_trgm` GIN), array GIN, partiels sur booléens.
- **Pagination cursor-based** déjà en place sur la banque (`getBankPublishedTachePage`, `BankDocumentsPanel`).
- **`bodySizeLimit: 10mb`** — justifié par les payloads HTML grilles + métadonnées documents.

### Problèmes

#### ⚠️ Important — Aucun streaming / Suspense en production

**Impact :** Toutes les pages de données (dashboard widgets, liste tâches, banque collaborative) bloquent le rendu jusqu'à la dernière query. Pour un outil utilisé en classe (connexion parfois instable), c'est un risque d'expérience utilisateur.

**Mesure :** Les pages banque font 3 queries parallèles (tâches, documents, épreuves) — chaque onglet pourrait être un `<Suspense>` boundary indépendant.

#### ⚠️ Important — 6 occurrences de `select("*")`

| Fichier                                     | Ligne           |
| ------------------------------------------- | --------------- |
| `app/(print)/documents/[id]/print/page.tsx` | L22             |
| `app/(app)/documents/[id]/page.tsx`         | L21             |
| `lib/queries/autonomous-document-edit.ts`   | L47             |
| `lib/tache/server-fiche-map.ts`             | L67, L102, L144 |
| `lib/tache/load-tache-for-edit.ts`          | L90             |

**Impact :** Surcharge réseau (colonnes inutiles transmises), future exposition de colonnes sensibles, violation des conventions documentées du projet.

#### 💡 Amélioration — Pas d'Image optimization headers

`next.config.ts` ne spécifie pas `images.formats` — Next.js servira du WebP par défaut mais pas d'AVIF (gain de 20–50% supplémentaire sur les documents iconographiques).

#### 💡 Amélioration — Revalidation ciblée absente après publication

Seuls `tache-delete.ts` et `evaluation-save.ts` appellent `revalidatePath`. La publication d'une TAÉ (`publishTacheAction`) ne revalide aucune route — la banque et la liste « Mes tâches » pourraient afficher des données périmées jusqu'au rechargement complet.

**Recommandation :** Ajouter `revalidatePath("/questions")` et `revalidatePath("/bank")` après publication réussie.

---

## 3. Qualité de Code & Maintenabilité

**Score : 9 / 10**

### Points forts

- **TypeScript strict sans faille** — `strict: true` dans `tsconfig.json`, 0 `any` dans le code applicatif (seul match dans un fichier `docs/specs/`), ESLint enforce `@typescript-eslint/no-explicit-any: "error"`.
- **Zod systématique** — Validation client + serveur, `safeParse` dans toutes les Server Actions avec input, schémas dans `lib/schemas/`.
- **Error handling cohérent** — Pattern `Result<T>` (discriminated union `{ ok: true; data } | { ok: false; code }`) dans toutes les actions, pas de `throw` non capturé.
- **ESLint + Prettier intégrés** — `no-console: warn` (sauf `warn/error`), `lint-staged` + `husky` pour les pre-commit hooks, CI pipeline `format:check → lint → test → build`.
- **0 `console.log`** dans `app/`, `components/`, `lib/` (uniquement dans `scripts/` où c'est autorisé).
- **Primitives UI sans duplication** — `FieldLayout` réutilisé par `Field`, `PasswordField`, `RepereTemporelField` ; `formSelectClasses.ts` centralise les classes des listbox.
- **PROVISOIRE bien tracé** — 5 occurrences, toutes avec un contexte et une référence spec. Pas de dette silencieuse.

### Problèmes

#### ⚠️ Important — Duplication `:root` / `@theme inline` dans `globals.css`

Les tokens couleur sont déclarés **deux fois** : une dans `:root` (CSS natif, lignes 88–125) et une dans `@theme inline` (Tailwind v4, lignes 205–245). Risque de désynchronisation à la prochaine modification.

**Recommandation :** Centraliser dans `@theme inline` (source de vérité Tailwind v4) et référencer les tokens via `var()` dans `:root` uniquement pour les valeurs qui ne passent pas par Tailwind.

#### 💡 Amélioration — `server-fiche-map.ts` accumule les responsabilités

Ce fichier fait 3 `select("*")` et orchestre le mapping complet d'une TAÉ (fetch tae + documents + slots + collaborateurs). C'est un candidat au découpage en fonctions spécialisées dans `lib/queries/`.

#### 💡 Amélioration — TipTap `immediatelyRender: false` correctement appliqué

Les 2 éditeurs TipTap (`RichTextEditor`, `ConsigneTipTapEditor`) ont bien `immediatelyRender: false` — évite le hydration mismatch. Bonne pratique déjà en place.

---

## 4. UX/UI Technique

**Score : 8 / 10**

### Points forts

- **Design tokens complets et cohérents** — Palette HSL structurée (`--color-deep` à `--color-muted`), spacing scale (4px à 96px), radius, shadows, leading (interlignes resserrés pour 18px racine).
- **Tailwind v4 avec `@theme inline`** — Tokens injectés proprement, `tailwind.config.ts` comme fallback pour l'outillage.
- **Typography Manrope exploitée** — Font-weight 400–800, racine 112.5% (18px), interlignes calibrés.
- **Print layout soigné** — Variables `--tache-print-*`, Letter portrait, marges 2cm, switch Arial pour l'impression, gestion `@page` via injection dynamique (`print-page-css.ts`).
- **Toasts via `sonner`** — Position top-right, richColors, closeButton. Pattern toast unifié.
- **Wizard split-screen** — Canvas gris moyen (`--wizard-preview-canvas`), shadow marquée pour l'effet feuille flottante.

### Problèmes

#### 🔥 Critique — Aucun état de chargement perçu

Sans `loading.tsx` ni `<Suspense>`, les navigations entre pages n'affichent aucun feedback visuel. Un enseignant cliquant sur « Banque collaborative » depuis le dashboard voit son navigateur « figer » le temps que les 3 queries banque se résolvent.

**Recommandation :** Minimum viable — `loading.tsx` avec spinner Material Symbols `progress_activity` + `animate-spin` dans chaque route group.

#### ⚠️ Important — Aucun skeleton screen

Les pages de listes (tâches, documents, épreuves) n'ont pas de composants skeleton. Les `<Suspense>` boundaries ne seront utiles qu'avec des fallbacks visuels qui préfigurent le layout final.

#### 💡 Amélioration — `prefers-reduced-motion` déclaré dans la doc mais non implémenté

Le `CLAUDE.md` mentionne une media query `prefers-reduced-motion` mais elle n'apparaît pas dans `globals.css`. Les animations existantes (spinner, transitions hover) devraient être désactivées pour les utilisateurs qui le demandent.

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 5. Accessibilité (a11y) & Inclusivité

**Score : 9 / 10**

### Points forts

- **ARIA exhaustif dans les primitives UI** — `aria-label`, `aria-labelledby`, `aria-required`, `aria-invalid`, `aria-describedby`, `aria-pressed`, `aria-selected`, `aria-haspopup`, `aria-expanded`, `aria-controls`, `aria-live`, `aria-hidden`, `role="alert"`, `role="toolbar"`, `role="dialog"`, `aria-modal`.
- **Sémantique HTML** — `<button>` (pas de `<div onClick>`), `<fieldset>` + `<legend>`, `<label htmlFor>` systématique, `<nav>`, `<main>`.
- **Focus management exemplaire** — Focus ring global (`outline: 2px solid var(--color-accent)`), roving focus dans `RadioCardGroup`, focus trap + Escape dans les modales (`SimpleModal`, `WarningModal`), focus programmatique (`requestAnimationFrame`).
- **Keyboard navigation complète** — Arrow keys dans radiogroup, Escape pour fermer, click-outside pour dismissal.
- **Contraste** — Tokens calibrés WCAG AA, `--color-deep` sur `--color-bg` (ratio > 7:1), `--color-muted` sur blanc (ratio ~4.5:1 limite AA).
- **`RequiredMark`** avec `aria-hidden="true"` — l'astérisque est décorative, le champ requis est signalé via `aria-required`.
- **Curseurs cohérents** — `cursor: pointer` sur les boutons actifs, `cursor: not-allowed` + `aria-disabled` sur les éléments désactivés.

### Problèmes

#### ⚠️ Important — `dangerouslySetInnerHTML` utilisé 20+ fois sans sanitisation systématique visible

`isomorphic-dompurify` est installé et la doc mentionne une migration vers la sanitisation serveur. Cependant, plusieurs composants utilisent `dangerouslySetInnerHTML` directement :

- `DocumentElementRenderer.tsx` (L58, L73)
- `DocumentFicheRead.tsx` (L157, L228)
- `PrintableFichePreview.tsx` (L66)
- `DevBankSummaryMockupCard.tsx` (L138, L212)

**Recommandation :** Vérifier que CHAQUE `dangerouslySetInnerHTML` reçoit du HTML déjà passé par `sanitize()` (via le selector ou la fonction appelante). Si le HTML vient de TipTap (contenu enseignant), le risque est bas mais pas nul (copy-paste de HTML externe).

#### 💡 Amélioration — `lang` correct sur `<html>` (`"fr"`) — bon

La langue est correctement déclarée pour les lecteurs d'écran francophones.

#### 💡 Amélioration — Pas de skip-to-content link

Aucun lien « Passer au contenu » détecté dans le layout principal. Pour un outil utilisé au clavier (professeurs avec handicap moteur), c'est un ajout WCAG AA recommandé.

---

## 6. Testing (Vitest + Playwright)

**Score : 6,5 / 10**

### Points forts

- **47 fichiers de test** — 44 unitaires Vitest + 3 E2E Playwright.
- **Couverture logique métier excellente** — `tache-form-reducer`, `publish-tache-payload` (30+ cas), `connaissances-helpers` (parse, filter, selection, Miller), tous les payloads non-rédactionnels, selectors fiche.
- **Vitest config propre** — Environment `node`, alias `@/`, exclusions correctes.
- **E2E grilles pixel-perfect** — 22 grilles testées visuellement (snapshot `maxDiffPixels: 900`), CI GitHub Windows.
- **Pattern de test clean** — Fixtures typées, `structuredClone` pour isolation d'état, assertions custom (`assertPayload`).

### Problèmes

#### 🔥 Critique — 0 test d'intégration sur les Server Actions

| Action non testée                    | Risque                             |
| ------------------------------------ | ---------------------------------- |
| `publishTacheAction()`               | Publication TAÉ = flux critique #1 |
| `saveWizardDraftAction()`            | Perte de brouillons                |
| `createAutonomousDocumentAction()`   | Création de documents              |
| `saveEvaluationCompositionAction()`  | Composition d'épreuves             |
| `loginAction()` / `registerAction()` | Auth                               |
| `uploadTacheDocumentImageAction()`   | Upload images                      |

**Impact :** Toute régression sur la validation Zod, l'auth guard, ou le mapping payload → RPC est invisible. Le seul filet est le build TypeScript (compile) + les tests unitaires sur les fonctions pures appelées par ces actions.

**Recommandation :** Implémenter des tests d'intégration avec un mock Supabase ou un schéma de test dédié :

```ts
// lib/actions/__tests__/tache-publish.integration.test.ts
import { vi } from "vitest";
vi.mock("@/lib/supabase/server", () => ({
  createClient: () => mockSupabaseClient,
}));
// Tester que le payload est correctement construit et passé à la RPC
```

#### ⚠️ Important — E2E minimal (3 fichiers, dont 1 substantiel)

- `eval-grids.spec.ts` — 22 grilles (snapshot visuel) ✅
- `evaluation-composition.spec.ts` — 2 tests (redirect auth seulement) ❌ Insuffisant
- **Aucun E2E** sur : wizard publication 7 étapes, document upload, draft save/restore, banque filtres.

**Recommandation :** Prioriser un E2E happy-path de publication TAÉ complète (wizard 7 étapes → fiche lecture → apparition en banque). C'est le parcours critique #1.

#### ⚠️ Important — Pas de mocking Supabase

Aucun `vi.mock()` ni MSW (Mock Service Worker) détecté. Les Server Actions ne peuvent pas être testées sans connexion Supabase réelle.

#### 💡 Amélioration — Pas de rapport de couverture

`@vitest/coverage-v8` est installé mais aucun script `test:coverage` n'est dans `package.json`. Le seuil de couverture n'est pas configuré.

---

## 7. Sécurité Générale

**Score : 9 / 10**

### Points forts

- **RLS exhaustive** — 21/21 tables avec `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`. Policies granulaires (SELECT/INSERT/UPDATE/DELETE) par rôle (auteur, collaborateur, CP, admin).
- **Anti-escalade de privilèges** — La policy `profiles_update_own` copie `role` et `status` depuis la ligne existante, empêchant un utilisateur de changer son propre rôle.
- **RPC hardened** — `SECURITY DEFINER` + `search_path = public`, validation `auteur_id = auth.uid()`, parsing regex de `annee_normalisee` avant cast `::int`, pas de SQL dynamique.
- **Auth guard centralisé** — `requireActiveAppUser()` vérifie session + profil actif ; utilisé dans les layouts `(app)` et `(print)`.
- **Middleware session** — Rafraîchissement cookies Supabase, redirect `/login` pour les routes protégées, redirect `/dashboard` si déjà connecté sur `/login`.
- **`service_role` isolé** — `lib/supabase/admin.ts` avec guard `if (!key) throw`, pas d'import `SUPABASE_SERVICE_ROLE_KEY` côté client.
- **Sanitisation HTML** — `isomorphic-dompurify` installé, migration serveur + client documentée et livrée.
- **Contrainte email `@*.gouv.qc.ca`** + trigger liste blanche en base.
- **0 `eval()`, 0 `new Function()`** dans le codebase.

### Problèmes

#### ⚠️ Important — `requireActiveAppUser()` utilise le `service_role` client

```ts
// lib/auth/require-active-app-user.ts
const admin = createServiceClient(); // ← service role pour lire profiles
const { data: profile } = await admin
  .from("profiles")
  .select("id, full_name, status")
  .eq("id", user.id)
  .maybeSingle();
```

**Risque :** Le `service_role` contourne la RLS. Ce pattern est correct ici (lecture du profil de l'utilisateur authentifié pour vérifier son statut), mais toute extension future qui ajouterait des queries dans cette fonction risque d'exposer des données.

**Recommandation :** Ajouter un commentaire d'avertissement explicite sur le périmètre du service role dans cette fonction. Envisager de migrer vers un client `supabase` standard avec une policy `profiles_select_self`.

#### ⚠️ Important — Index fantôme dans le schéma

L'index `idx_doc_contenu_trgm` référence une colonne `contenu` qui n'existe plus sur `documents` (migrée vers `elements` JSONB). Un déploiement sur une instance fraîche échouerait.

**Recommandation :** Supprimer l'index fantôme de `supabase/schema.sql` ou le réécrire pour la colonne `elements`.

#### 💡 Amélioration — Pas de rate limiting sur les Server Actions

Aucun mécanisme de rate limiting détecté. Pour un outil éducatif avec une audience limitée (professeurs), le risque est bas, mais la publication et l'upload d'images pourraient être ciblés.

#### 💡 Amélioration — `bodySizeLimit: "10mb"` élevé

Justifié par les payloads grilles HTML, mais un payload malicieux de 10 MB bloquerait le worker Node.js. Valider que les Server Actions vérifient la taille en amont.

---

## 8. Dependencies & Meilleures Pratiques Stack 2026

**Score : 8,5 / 10**

### Points forts

- **Dependencies lean** — 18 dépendances de production (pas de kit UI externe, pas de state manager lourd, pas d'abstraction inutile). Stack ciblée et cohérente.
- **Versions à jour** — Next.js 16.2.1, React 19.2.4, Zod 4.3.6, React Hook Form 7.72, TipTap 3.20, Supabase SSR 0.9. Tout est en version majeure courante.
- **DevDependencies propres** — Tailwind v4, Vitest 3.2, Playwright 1.58, Husky 9 + lint-staged.
- **`engines.node >= 20.9.0`** — Requis explicite pour les API Node modernes.
- **CI complète** — Pipeline `format:check → lint → test → build` en local (`npm run ci`) et GitHub Actions, job E2E séparé sur Windows.

### Problèmes

#### ⚠️ Important — Pas de lock sur les versions patch

`package.json` utilise `^` (caret) pour toutes les dépendances. Avec `package-lock.json` versionné, c'est acceptable, mais un `npm ci` strict est préférable à `npm install` en CI.

**Vérification :** Le workflow GitHub Actions devrait utiliser `npm ci` (pas `npm install`).

#### 💡 Amélioration — `@vitest/browser` installé mais non utilisé

`@vitest/browser` est dans les devDependencies mais la config Vitest utilise `environment: "node"`. Si des tests de composants React sont prévus, c'est prêt ; sinon c'est une dépendance morte.

#### 💡 Amélioration — Tailwind v4 + `tailwind.config.ts` = double source

Tailwind v4 lit les tokens depuis `@theme inline` dans `globals.css`. Le fichier `tailwind.config.ts` sert de fallback pour l'outillage mais crée une double source potentielle. La doc le mentionne — acceptable tant que le fichier TS reste synchrone.

#### 💡 Amélioration — Pas de `@next/bundle-analyzer`

Mentionné dans `CLAUDE.md` comme optionnel. Pour un projet avec TipTap + Material Symbols font, analyser le bundle avant chaque ajout de dépendance est recommandé.

---

## Plan d'Action Priorisé

### Quick Wins (1–2 semaines)

| #       | Action                                                                                   | Fichiers                       | Impact                           |
| ------- | ---------------------------------------------------------------------------------------- | ------------------------------ | -------------------------------- |
| **QW1** | Ajouter `loading.tsx` dans `app/(app)/`, `app/(auth)/`, `app/(print)/`                   | 3 fichiers                     | Streaming natif, UX navigation   |
| **QW2** | Ajouter `error.tsx` dans `app/(app)/` et `app/` (global)                                 | 2 fichiers                     | Récupération gracieuse d'erreurs |
| **QW3** | Remplacer les 6 `select("*")` par des colonnes explicites                                | 4 fichiers                     | Sécurité + perf + conventions    |
| **QW4** | Ajouter `revalidatePath("/questions")` + `revalidatePath("/bank")` après publication TAÉ | `lib/actions/tache-publish.ts` | Cache cohérent                   |
| **QW5** | Ajouter la media query `prefers-reduced-motion` dans `globals.css`                       | 1 fichier                      | A11y WCAG AA                     |
| **QW6** | Supprimer l'index fantôme `idx_doc_contenu_trgm` dans `schema.sql`                       | 1 fichier                      | Déploiement propre               |
| **QW7** | Ajouter un script `"test:coverage": "vitest run --coverage"` dans `package.json`         | 1 fichier                      | Visibilité couverture            |

### Améliorations Importantes (1 mois)

| #       | Action                                                                               | Effort    | Impact                            |
| ------- | ------------------------------------------------------------------------------------ | --------- | --------------------------------- |
| **AI1** | Ajouter des `<Suspense>` boundaries sur dashboard, bank, questions (3 pages)         | 3–5 jours | Streaming percep­tible, UX classe |
| **AI2** | Créer des skeleton screens pour les listes (tâches, documents, épreuves)             | 3 jours   | Chargement perçu                  |
| **AI3** | Tests d'intégration Server Actions (mock Supabase, 5 actions critiques)              | 5 jours   | Filet sécurité mutations          |
| **AI4** | E2E Playwright — happy path publication TAÉ (wizard 7 étapes)                        | 3 jours   | Régression critique couverte      |
| **AI5** | Auditer systématiquement la sanitisation HTML avant chaque `dangerouslySetInnerHTML` | 2 jours   | Sécurité XSS                      |
| **AI6** | Ajouter un skip-to-content link dans `AppShell`                                      | 0,5 jour  | A11y WCAG AA                      |
| **AI7** | Consolider `:root` / `@theme inline` — une seule source pour les tokens couleur      | 1 jour    | Maintenabilité                    |

### Refactoring Majeurs (2–3 mois)

| #       | Action                                                                                                     | Effort     | Impact                          |
| ------- | ---------------------------------------------------------------------------------------------------------- | ---------- | ------------------------------- |
| **RM1** | Refactorer `server-fiche-map.ts` — découper en queries spécialisées, éliminer `select("*")`                | 1 semaine  | Maintenabilité + perf           |
| **RM2** | Suite E2E complète (RLS deux comptes, document upload, épreuves, brouillons)                               | 3 semaines | Couverture E2E production-grade |
| **RM3** | Rate limiting sur les Server Actions (publication, upload) — in-memory puis Upstash Redis                  | 1 semaine  | Sécurité défensive              |
| **RM4** | Migrer `requireActiveAppUser()` vers client standard (pas service_role) avec policy `profiles_select_self` | 2 jours    | Réduire la surface service_role |
| **RM5** | Bundle analysis + tree-shaking audit (Material Symbols font subset, TipTap lazy)                           | 1 semaine  | Taille bundle optimisée         |
| **RM6** | `"use cache"` / PPR expérimental — à reconsidérer quand API stable + métriques justificatives              | 2 semaines | Performance avancée (v2)        |

---

## Annexe — Scores par Section

| Section                          | Score      | Poids    | Commentaire                                |
| -------------------------------- | ---------- | -------- | ------------------------------------------ |
| 1. Architecture & Structure      | 8,5/10     | 20%      | Excellente séparation, manque streaming    |
| 2. Performance & Scalabilité     | 7/10       | 15%      | Indexes top, streaming absent              |
| 3. Qualité Code & Maintenabilité | 9/10       | 20%      | TypeScript strict, 0 any, patterns solides |
| 4. UX/UI Technique               | 8/10       | 10%      | Tokens soignés, pas de loading states      |
| 5. Accessibilité                 | 9/10       | 10%      | ARIA exemplaire, 1–2 points manquants      |
| 6. Testing                       | 6,5/10     | 10%      | Unit solide, intégration absente           |
| 7. Sécurité                      | 9/10       | 10%      | RLS best-in-class, quelques points         |
| 8. Dependencies & Stack          | 8,5/10     | 5%       | Lean et à jour                             |
| **Pondéré**                      | **8,2/10** | **100%** |                                            |

---

## Feuille de route vers le 10/10 — Excellence EdTech 2026

> Ce qui suit détaille **chaque point à atteindre** pour porter chaque section à 10/10.
> L'ordre suit une logique d'impact décroissant : d'abord ce qui touche l'utilisateur final (l'enseignant en classe), puis les fondations techniques invisibles.

---

### Axe 1 — Streaming & Loading States (Architecture 8,5 → 10, UX 8 → 10, Perf 7 → 10)

**Pourquoi c'est le #1 :** un enseignant qui prépare sa classe à 22 h avec une connexion résidentielle ne devrait jamais voir un écran blanc. Le streaming est **la** feature Next.js qui sépare un bon projet d'un projet exemplaire.

#### 1.1 — `loading.tsx` dans chaque route group

Créer 5 fichiers `loading.tsx` :

```
app/(app)/loading.tsx              → Spinner centré dans le shell
app/(app)/dashboard/loading.tsx    → Skeleton dashboard (3 cartes stats + liste)
app/(app)/questions/loading.tsx    → Grille de cartes skeleton
app/(app)/bank/loading.tsx         → Skeleton 3 onglets + grille
app/(auth)/loading.tsx             → Spinner minimal
```

**Pattern recommandé :**

```tsx
// app/(app)/dashboard/loading.tsx
export default function DashboardLoading() {
  return (
    <div className="space-y-6 p-6">
      <div className="h-8 w-48 animate-pulse rounded-md bg-surface" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-md bg-surface" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-md bg-surface" />
    </div>
  );
}
```

#### 1.2 — `error.tsx` avec récupération gracieuse

```
app/error.tsx                       → Catch-all global (erreur non capturée)
app/(app)/error.tsx                 → Erreur dans le shell (retry + lien dashboard)
app/(app)/questions/[id]/error.tsx  → Fiche introuvable ou crash query
```

**Pattern recommandé :**

```tsx
// app/(app)/error.tsx
"use client";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
      <span className="material-symbols-outlined text-5xl text-error">error</span>
      <div>
        <h2 className="text-xl font-bold">Une erreur est survenue, veuillez réessayer</h2>
        <p className="mt-2 text-muted max-w-md">Si le problème persiste, contactez le support.</p>
        {error.digest && (
          <p className="mt-1 text-xs text-muted/60">Référence support : {error.digest}</p>
        )}
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white"
        >
          Réessayer
        </button>
        <a href="/dashboard" className="rounded-md border border-border px-4 py-2 text-sm">
          Retour au tableau de bord
        </a>
      </div>
    </div>
  );
}
```

#### 1.3 — `<Suspense>` boundaries stratégiques

Envelopper les sections de données lentes dans des composants serveur asynchrones :

```tsx
// app/(app)/dashboard/page.tsx
import { Suspense } from "react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">Tableau de bord</h1>
      <Suspense fallback={<StatsGridSkeleton />}>
        <DashboardStatsGrid />
      </Suspense>
      <Suspense fallback={<RecentTasksSkeleton />}>
        <RecentTasksList />
      </Suspense>
      <Suspense fallback={<VotesSkeleton />}>
        <VotesSection />
      </Suspense>
    </div>
  );
}
```

**Pages prioritaires :** `/dashboard` (6 queries), `/bank` (3 queries parallèles), `/questions` (thumbnails + batch lookups).

#### 1.4 — Skeleton components réutilisables

Créer `components/ui/Skeleton.tsx` — primitive composable :

```tsx
import { cn } from "@/lib/utils/cn";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-surface", className)} {...props} />;
}
```

Puis des skeletons métier : `DashboardStatsSkeleton`, `TaskCardSkeleton`, `BankGridSkeleton`.

---

### Axe 2 — Testing (6,5 → 10)

**Le bond le plus significatif en score.** La logique pure est bien testée — ce qui manque, c'est le filet de sécurité sur les coutures (Server Actions ↔ Supabase, E2E parcours).

#### 2.1 — Tests d'intégration Server Actions (5 critiques)

Installer un pattern de mock Supabase réutilisable :

```ts
// tests/helpers/mock-supabase.ts
import { vi } from "vitest";

export function createMockSupabaseClient(overrides?: Partial<MockClient>) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "user-1", email: "prof@css.gouv.qc.ca" } },
        error: null,
      }),
    },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    rpc: vi.fn().mockResolvedValue({ data: "new-uuid", error: null }),
    ...overrides,
  };
}
```

**Actions à tester en priorité :**

| Action                            | Ce qu'on teste                                                                               |
| --------------------------------- | -------------------------------------------------------------------------------------------- |
| `publishTacheAction`              | Payload correct passé à `rpc('publish_tae_transaction')`, erreurs Zod rejetées, auth vérifié |
| `saveWizardDraftAction`           | Sérialisation FormState → payload JSON, écrasement du brouillon existant                     |
| `createAutonomousDocumentAction`  | Validation schéma, insertion correcte, fallback dégradé si colonne manquante                 |
| `saveEvaluationCompositionAction` | Validation titre + TAÉ ids, mapping vers la RPC, erreurs métier (TAÉ non publiée)            |
| `uploadTacheDocumentImageAction`  | Validation type MIME, taille max, appel Sharp, URL retournée                                 |

#### 2.2 — E2E happy path publication TAÉ

```ts
// tests/e2e/publish-tache-happy-path.spec.ts
import { test, expect } from "@playwright/test";

// Auth réutilisée via storageState (voir bonnes pratiques ci-dessous)
test.use({ storageState: "playwright/.auth/user.json" });

test("Enseignant publie une TAÉ OI3.1 complète", async ({ page }) => {
  // Wizard étape 1 — Auteur
  await page.goto("/questions/new");
  await page.getByRole("button", { name: /Seul/i }).click();
  await page.getByRole("button", { name: /Suivant/i }).click();

  // Étape 2 — Paramètres
  // ... sélection niveau, discipline, OI, comportement via getByRole('combobox')

  // Étape 3 — Consigne
  // ... saisie TipTap via getByRole('textbox', { name: /Consigne/i })

  // ... étapes 4-7

  // Publication
  await page.getByRole("button", { name: /Publier/i }).click();
  await expect(page.getByRole("status")).toContainText("publiée");

  // Vérification fiche
  await expect(page).toHaveURL(/\/questions\/[\w-]+/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
```

**Bonnes pratiques Playwright :**

1. **Locators sémantiques** — utiliser `getByRole('button', { name: /Publier/i })`, `getByRole('textbox', { name: /Consigne/i })`, `getByText(...)`, `getByTestId(...)` plutôt que des sélecteurs CSS (`page.click('.btn-publier')`). Les locators sémantiques sont plus stables (résistent aux refactorings CSS), plus accessibles (forcent à avoir des rôles ARIA corrects), et plus lisibles. L'exemple ci-dessus les utilise systématiquement.

2. **Fixture d'auth réutilisable** — créer un fichier `tests/e2e/auth.setup.ts` qui se logue une fois et sauvegarde le `storageState.json`. Tous les tests subséquents utilisent ce state via `test.use({ storageState: 'playwright/.auth/user.json' })` au lieu de re-logger à chaque test. Pattern Playwright officiel (cf. [Playwright Auth docs](https://playwright.dev/docs/auth)) pour éviter la lenteur et la fragilité des suites E2E.

3. **Tester en mode production avant merge** — développer les tests contre `npm run dev` pour la rapidité, mais valider contre `npm run build && npm run start` au moins une fois avant chaque merge sur `main`. Le comportement Next.js dev vs production diffère sur le streaming, le caching, les Server Components et certaines optimisations. Un test qui passe en dev mais casse en prod est un piège classique.

#### 2.3 — E2E sécurité RLS (deux comptes)

```ts
test("Enseignant B ne peut pas voir le brouillon de A", async ({ browser }) => {
  const contextA = await browser.newContext();
  const contextB = await browser.newContext();
  // Login A → créer brouillon → copier l'URL
  // Login B → naviguer vers l'URL → 404 ou accès refusé
});
```

#### 2.4 — Coverage thresholds

```ts
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["lib/**/*.ts"],
      exclude: ["lib/types/**", "**/*.test.ts"],
      thresholds: {
        statements: 60,
        branches: 55,
        functions: 60,
        lines: 60,
      },
    },
  },
});
```

> **Seuils progressifs :** 60/55 est le plancher de départ réaliste pour le code actuel. À chaque itération de tests ajoutés, remonter de 5 points. Objectif à 3 mois : 70/65.

Ajouter `"test:coverage": "vitest run --coverage"` dans `package.json`.

---

### Axe 3 — Sécurité défensive (9 → 10)

#### 3.1 — Content Security Policy

Ajouter des headers de sécurité via `next.config.ts` :

```ts
const nextConfig: NextConfig = {
  // ... existing config
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js HMR + inline scripts
              "style-src 'self' 'unsafe-inline'", // Tailwind + Material Symbols
              "font-src 'self' data:", // Manrope + Material Symbols
              "img-src 'self' https://*.supabase.co data: blob:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
              "frame-ancestors 'none'",
            ].join("; "),
          },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};
```

> **Note :** `'unsafe-inline'` et `'unsafe-eval'` sont conservés pour le MVP, y compris en production. Next.js App Router utilise des scripts inline pour l'hydration — les retirer sans un système de nonces complet casserait l'app. La migration vers des nonces (via middleware dédié + `experimental.contentSecurityPolicy`) est une **dette technique v2** qui demande un effort dédié et des tests de non-régression sur toutes les pages.

#### 3.2 — Sanitisation systématique `dangerouslySetInnerHTML`

Créer un helper unique avec une **configuration restrictive** adaptée au contenu TipTap (seul producteur de HTML dans l'app) :

```ts
// lib/utils/safe-html.ts
import DOMPurify from "isomorphic-dompurify";

// Sécurisation automatique des liens target="_blank"
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A" && node.getAttribute("target") === "_blank") {
    node.setAttribute("rel", "noopener noreferrer");
  }
});

const ALLOWED_TAGS = [
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "strong",
  "em",
  "u",
  "s",
  "blockquote",
  "ul",
  "ol",
  "li",
  "a",
  "br",
  "img",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
];

const ALLOWED_ATTR = ["href", "target", "rel", "src", "alt", "width", "height", "class"];

/**
 * Retourne un objet prêt pour dangerouslySetInnerHTML — HTML sanitisé
 * avec une allowlist restrictive adaptée au contenu TipTap uniquement.
 * Usage : <div {...safeHtml(rawHtml)} />
 */
export function safeHtml(dirty: string | null | undefined): {
  dangerouslySetInnerHTML: { __html: string };
} {
  if (!dirty) return { dangerouslySetInnerHTML: { __html: "" } };
  return {
    dangerouslySetInnerHTML: {
      __html: DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS,
        ALLOWED_ATTR,
        FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus", "onblur"],
        ALLOW_DATA_ATTR: false,
      }),
    },
  };
}
```

**Choix de sécurité :**

- Pas de `style` dans `ALLOWED_ATTR` — évite les injections CSS (`background: url(...)`, `expression()`).
- `rel="noopener noreferrer"` automatique sur les liens `target="_blank"`.
- `ALLOW_DATA_ATTR: false` — bloque les `data-*` non nécessaires pour TipTap.
- Null-safe — `null` et `undefined` retournent une chaîne vide.
- **Convention de traçabilité pour la migration** — adopter un commentaire double sur chaque `dangerouslySetInnerHTML` :
  - `// SAFE: sanitized via safeHtml()` — quand le composant utilise directement le helper
  - `// SAFE: sanitized by selector` — quand le HTML reçu vient déjà sanitisé d'un selector en amont (qui a appelé `safeHtml` lui-même)

  Cette convention permet de `grep` le codebase pour vérifier qu'aucun `dangerouslySetInnerHTML` n'est laissé sans protection. Toute occurrence sans commentaire `// SAFE: ...` est suspecte et doit être auditée.

> **⚠️ Ne pas ajouter `USE_PROFILES: { html: true }` à la configuration.** Les profils DOMPurify (`USE_PROFILES`) sont des allowlists pré-configurées larges qui interfèrent avec les `ALLOWED_TAGS` / `ALLOWED_ATTR` manuels. Activer le profil HTML annulerait l'effet de l'allowlist restrictive ci-dessus en autorisant un set de tags beaucoup plus large que nécessaire. Ce projet utilise volontairement la configuration manuelle restrictive — c'est plus strict que les profils prédéfinis et c'est ce qu'on veut pour du contenu TipTap uniquement. Ne jamais combiner les deux approches.
>
> **⚠️ Ne pas retirer `width` et `height` de ALLOWED_ATTR pour les images.** TipTap ajoute automatiquement ces attributs lors de l'insertion d'images dans les documents. Les retirer causerait du Cumulative Layout Shift (CLS) au chargement des documents iconographiques, dégradant la performance perçue et le score Web Vitals. Les conserver est la bonne décision.
>
> **⚠️ Ne pas ajouter `RETURN_DOM: false` explicitement.** C'est déjà la valeur par défaut de DOMPurify. L'ajouter serait redondant et créerait une fausse impression de configuration de sécurité supplémentaire alors qu'aucun effet réel n'est obtenu.

Migrer les 20+ occurrences de `dangerouslySetInnerHTML={{ __html: ... }}` vers `{...safeHtml(html)}`. Commenter chaque occurrence avec la convention ci-dessus.

#### 3.3 — Rate limiting Server Actions

> **⚠️ Limitation architecturale :** l'implémentation ci-dessous utilise un `Map` in-memory. Elle fonctionne correctement en **single-instance** (déploiement serverless par défaut sur Vercel). Si l'app scale au-delà d'une instance (multi-worker, multi-région), migrer vers **Upstash Redis** (`@upstash/ratelimit`) ou équivalent. Ceci est une dette technique acceptée pour le MVP.

```ts
// lib/utils/rate-limit.ts
// ⚠️ SINGLE-INSTANCE ONLY — Map in-memory, non partagée entre workers.
// Migration Upstash Redis requise si l'app scale au-delà d'une instance.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(userId: string, action: string, maxPerMinute: number = 10): boolean {
  const key = `${userId}:${action}`;
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= maxPerMinute) return false;
  entry.count++;
  return true;
}
```

Appliquer sur `publishTacheAction` (5/min), `uploadTacheDocumentImageAction` (20/min), `saveEvaluationCompositionAction` (10/min).

#### 3.4 — Migrer `requireActiveAppUser()` vers client standard

```ts
export async function requireActiveAppUser(): Promise<ActiveAppUser> {
  const supabase = await createClient(); // ← client standard, pas service_role
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // La policy RLS `profiles_select_active` autorise déjà la lecture
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, status")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.status !== "active") redirect("/activate");

  return {
    userId: user.id,
    email: user.email ?? "",
    profileId: profile.id,
    fullName: profile.full_name,
  };
}
```

> **Prérequis :** vérifier que la policy `profiles_select` du schéma autorise un utilisateur actif à lire son propre profil sans service_role.

---

### Axe 4 — Performance Next.js 2026 (7 → 10)

#### 4.1 — `React.cache()` pour les données de référence

```ts
// lib/data/oi.ts
import { cache } from "react";
import oiData from "@/public/data/oi.json";

/** Données OI — déduplication par requête (React server cache). */
export const getOiList = cache(() => oiData);

/** OI par id — lookup O(1) depuis le cache. */
export const getOiById = cache((id: number) => oiData.find((oi) => oi.id === id) ?? null);
```

Même pattern pour `getNiveauList()`, `getDisciplineList()`, `getCdList()`, `getConnaissancesList()`. Plusieurs composants serveur qui appellent la même fonction dans un même render ne feront qu'un seul appel.

#### 4.2 — Revalidation complète après mutations

```ts
// lib/actions/tache-publish.ts — après publication réussie
revalidatePath("/questions");
revalidatePath("/bank");
revalidatePath(`/questions/${tacheId}`);

// lib/actions/create-autonomous-document.ts — après création
revalidatePath("/documents");
revalidatePath("/bank");

// lib/actions/update-autonomous-document.ts — après mise à jour
revalidatePath(`/documents/${documentId}`);
revalidatePath("/bank");
```

#### 4.3 — Suspense boundaries classiques (sans PPR)

Les `<Suspense>` boundaries classiques suffisent pour le MVP et offrent le streaming sans risque de breaking change :

```tsx
// app/(app)/bank/page.tsx
import { Suspense } from "react";

export default function BankPage({ searchParams }: Props) {
  return (
    <>
      <BankPageHeader />
      <BankFiltersBar />
      <Suspense fallback={<BankGridSkeleton />}>
        <BankDynamicContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}
```

> **PPR / `"use cache"` :** reporté en v2. PPR est encore expérimental dans Next.js 16 et présente un risque de breaking change lors de mises à jour du framework. À reconsidérer quand l'API sera stable et avec des données de performance concrètes (Lighthouse, Web Vitals) justifiant le besoin.

#### 4.4 — Image optimization AVIF

```ts
// next.config.ts
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      /* ... existing ... */
    ],
    formats: ["image/avif", "image/webp"],
  },
};
```

Gain de 20–50 % sur les documents iconographiques par rapport au WebP seul.

#### 4.5 — Éliminer les 6 `select("*")`

| Fichier                             | Remplacement                                                                                                                                                                                                                              |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `server-fiche-map.ts` L67           | `.select("id, auteur_id, consigne, guidage, corrige, oi_id, comportement_id, niveau_id, discipline_id, aspects_societe, cd_id, connaissances_ids, nb_lignes, is_published, conception_mode, non_redaction_data, created_at, updated_at")` |
| `server-fiche-map.ts` L102          | `.select("id, tae_id, slot, document_id, tae_version")`                                                                                                                                                                                   |
| `server-fiche-map.ts` L144          | `.select("id, titre, type, type_iconographique, auteur_id, elements, annee_normalisee, repere_temporel, source_type, image_legende, print_impression_scale")`                                                                             |
| `load-tache-for-edit.ts` L90        | Idem que L67 ci-dessus                                                                                                                                                                                                                    |
| `documents/[id]/page.tsx` L21       | `.select("id, titre, type, type_iconographique, auteur_id, elements, niveaux_ids, disciplines_ids, connaissances_ids, aspects_societe, structure, source_type, image_legende, is_published, created_at, updated_at")`                     |
| `documents/[id]/print/page.tsx` L22 | Idem                                                                                                                                                                                                                                      |

---

### Axe 5 — Accessibilité parfaite (9 → 10)

#### 5.1 — Skip-to-content link

```tsx
// components/layout/AppShellClient.tsx — en tête du return
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-white focus:text-sm focus:font-semibold"
>
  Passer au contenu principal
</a>
// ...
<main id="main-content" className="...">
```

#### 5.2 — `prefers-reduced-motion`

```css
/* globals.css — en fin de fichier */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

#### 5.3 — `aria-busy` sur les zones de chargement

```tsx
// Tout composant qui affiche un skeleton ou un spinner
<div aria-busy="true" aria-live="polite">
  <Skeleton className="h-28 w-full" />
</div>
```

#### 5.4 — Audit automatisé a11y en CI

Ajouter `@axe-core/playwright` au pipeline E2E :

```ts
// tests/e2e/a11y-audit.spec.ts
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("Dashboard a11y", async ({ page }) => {
  await page.goto("/dashboard");
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(results.violations).toEqual([]);
});
```

Couvrir : `/dashboard`, `/questions`, `/bank`, `/questions/new` (wizard), `/login`.

---

### Axe 6 — Qualité Code (9 → 10)

#### 6.1 — Consolider les tokens CSS

Supprimer la double déclaration `:root` / `@theme inline`. Un seul endroit :

```css
/* globals.css — @theme inline EST la source de vérité */
@theme inline {
  --color-deep: hsl(220 40% 18%);
  /* ... tous les tokens ... */
}

/* :root conserve uniquement les variables NON-Tailwind (animations, print, wizard) */
:root {
  --wizard-preview-canvas: hsl(0 0% 50%);
  --tache-print-sheet-width: 8.5in;
  /* etc. */
}
```

#### 6.2 — Supprimer `@vitest/browser` si non utilisé

```bash
npm uninstall @vitest/browser
```

Ou configurer un projet Vitest browser pour tester les composants React (ex. `RichTextEditor`, `ListboxField`) — c'est la direction 10/10.

#### 6.3 — Refactorer `server-fiche-map.ts`

Découper en 3 fonctions spécialisées dans `lib/queries/` :

```
lib/queries/tache-fiche-read.ts     → fetchTacheForFiche(id) — colonnes explicites
lib/queries/tache-documents-read.ts → fetchTacheDocuments(tacheId) — colonnes explicites
lib/queries/tache-slots-read.ts     → fetchTacheSlots(tacheId) — colonnes explicites
```

L'orchestration reste dans `server-fiche-map.ts` mais délègue le I/O.

---

### Axe 7 — Observabilité & Monitoring (0 → 8+)

> Les outils ci-dessous sont **reportés post-MVP**. Ils collectent des données utilisateur et nécessitent une revue de conformité **Loi 25 (Québec)** avant activation. Pour le MVP, les logs serveur de la plateforme d'hébergement (Vercel dashboard, logs runtime) et les audits Lighthouse manuels suffisent.

#### 7.1 — Vercel Analytics & SpeedInsights `[v2]`

```bash
npm install @vercel/analytics @vercel/speed-insights
```

Gratuit sur Vercel Pro, donne LCP / INP / CLS par page. **À activer post-MVP** après validation de la conformité Loi 25 et mise en place d'une politique de confidentialité couvrant la collecte de métriques de performance.

#### 7.2 — Sentry pour le tracking d'erreurs `[v2]`

Service tiers qui collecte des données utilisateur (stacktraces avec contexte, user ID, route, breadcrumbs). **Nécessite :**

- Revue de conformité Loi 25 (Québec) — consentement, stockage hors-Canada, sous-traitant
- Politique de confidentialité mise à jour
- Évaluation des facteurs relatifs à la vie privée (EFVP) si les données sont sensibles

Pour le MVP, les `console.error` dans les Server Actions + les logs Vercel runtime couvrent les besoins de diagnostic.

#### 7.3 — `robots.txt` (auth-only app) `[MVP v1]`

```ts
// app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", disallow: "/" },
  };
}
```

Empêche l'indexation de l'app authentifiée. Un fichier, zéro risque.

---

### Axe 8 — Stack & Dependencies (8,5 → 10)

#### 8.1 — Bundle analyzer

```bash
npm install -D @next/bundle-analyzer
```

```ts
// next.config.ts
import withBundleAnalyzer from "@next/bundle-analyzer";

const config = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})(nextConfig);

export default config;
```

```json
// package.json — scripts
"analyze": "ANALYZE=true next build"
```

#### 8.2 — `npm audit` en CI

```yaml
# .github/workflows/ci.yml — ajouter après npm ci
- name: Security audit
  run: npm audit --audit-level=high
  continue-on-error: true # ne bloque pas le build, mais rend visible
```

#### 8.3 — Material Symbols — subset

Le font complet de Material Symbols pèse ~1,5 MB. Pour un projet qui utilise ~30 glyphes, envisager :

```bash
npm install -D @nicolo-ribaudo/material-symbols-subset
```

Ou utiliser les SVG individuels via `@material-symbols/svg-400` pour éliminer le font entier du bundle.

---

### Tableau récapitulatif — Chemin vers 10/10

| Section           | Score actuel | Cible 10/10 | Actions clés                                                      | Priorité      | Effort total     |
| ----------------- | ------------ | ----------- | ----------------------------------------------------------------- | ------------- | ---------------- |
| **Architecture**  | 8,5          | 10          | `loading.tsx` × 5, `error.tsx` × 3, Suspense × 3 pages            | MVP v1        | 3–4 jours        |
| **Performance**   | 7            | 10          | `React.cache()`, revalidation, AVIF, éliminer `select("*")`       | MVP v1 + v1.1 | 5–7 jours        |
| **Qualité Code**  | 9            | 10          | Consolider tokens, refactorer `server-fiche-map`, cleanup deps    | v1.1 + v2     | 2–3 jours        |
| **UX/UI**         | 8            | 10          | Skeletons, `loading.tsx`, `prefers-reduced-motion`                | MVP v1        | 3–4 jours        |
| **Accessibilité** | 9            | 10          | Skip-to-content, `reduced-motion`, `aria-busy`, axe-core CI       | MVP v1 + v1.1 | 2 jours          |
| **Testing**       | 6,5          | 10          | 5 tests intégration, E2E happy path, coverage thresholds, a11y CI | v1.1          | 10–12 jours      |
| **Sécurité**      | 9            | 10          | CSP headers, `safeHtml()`, rate limiting, migrer service_role     | MVP v1 + v1.1 | 3–4 jours        |
| **Dependencies**  | 8,5          | 10          | Bundle analyzer, `npm audit` CI, Material Symbols subset          | v1.1 + v2     | 1–2 jours        |
| **Total estimé**  | **8,2**      | **10**      |                                                                   |               | **~30–35 jours** |

> **⚠️ Note réaliste :** les estimations ci-dessus sont en **jours de travail effectif**. Pour un développeur solo à temps partiel :
>
> - **2 jours par semaine** : ~4–6 semaines pour le MVP v1, ~3–4 mois pour l'ensemble
> - **1 jour par semaine** : ~10–12 semaines pour le MVP v1, ~6–8 mois pour l'ensemble
>
> Choisir la fourchette correspondant au rythme réel pour planifier de façon honnête. Sous-estimer le délai mène à des frustrations et à des raccourcis qui dégradent la qualité.

---

### Ordre d'exécution recommandé (sprints de 1 semaine)

**Sprint 1 — Fondations UX [MVP v1]** (impact utilisateur maximal)

- `loading.tsx` × 5 + `error.tsx` × 3
- `Skeleton` primitive + 3 skeletons métier (dont `/questions/[id]`)
- `prefers-reduced-motion` + skip-to-content
- Remplacer les 6 `select("*")`
- Supprimer l'index fantôme `idx_doc_contenu_trgm`

**Sprint 2 — Sécurité & Cache [MVP v1]**

- CSP headers + `X-Frame-Options` + `X-Content-Type-Options`
- `safeHtml()` helper (config restrictive TipTap) + migration des 20 `dangerouslySetInnerHTML`
- `revalidatePath` après toutes les mutations critiques
- AVIF dans `next.config.ts`
- `robots.ts`

**Sprint 3 — Tests intégration [Post-MVP v1.1]**

- Mock Supabase helper
- 5 tests d'intégration Server Actions
- Coverage thresholds (60/55 initial) dans vitest.config.ts
- `React.cache()` pour les données de référence
- `npm audit` en CI

**Sprint 4 — Tests E2E [Post-MVP v1.1]**

- E2E happy path publication TAÉ
- E2E RLS deux comptes
- `@axe-core/playwright` audit a11y (couvrant `/questions/[id]`)
- Bundle analyzer
- Rate limiting Server Actions (in-memory MVP)

**Sprint 5 — Polish [v2]**

- Consolider tokens CSS (`:root` vs `@theme inline`)
- Refactorer `server-fiche-map.ts`
- Cleanup `@vitest/browser`
- Suspense boundaries sur dashboard + bank + questions
- Material Symbols subset (si le bundle le justifie)
- Migrer `requireActiveAppUser()` vers client standard
- Vercel Analytics + SpeedInsights (après revue Loi 25)
- Sentry (après revue Loi 25 + EFVP)
- PPR expérimental (quand API stable + métriques justificatives)

---

### Coordination avec le chantier fiche tâche en cours

L'audit enrichi touche plusieurs points qui intersectent directement les phases 4–8 de l'implémentation de la fiche tâche detail view. **Ignorer ces intersections créerait du rework.**

#### Intersections identifiées

| Point de l'audit                             | Phase fiche tâche concernée                                          | Contrainte de séquençage                                                                                                                                                                                                                                                                            |
| -------------------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`safeHtml()` helper**                      | Phase 2 — Selectors (`selectHero`, `selectGuidage`, `selectCorrige`) | **Créer `safeHtml()` AVANT la fin de Phase 2.** Les selectors qui retournent du HTML TipTap doivent l'utiliser directement pour que chaque composant `<SectionHero>`, `<SectionGuidage>`, `<SectionCorrige>` reçoive du HTML déjà sanitisé. Ne pas laisser la sanitisation aux composants de rendu. |
| **Skeleton `/questions/[id]`**               | Phase 4 — Route + page serveur                                       | Le `loading.tsx` de la route `questions/[id]` doit être créé en même temps que la page serveur, avec un skeleton qui reflète le layout 2 colonnes (contenu + rail).                                                                                                                                 |
| **Suspense boundaries**                      | Phase 4 — Page serveur async                                         | La page `/questions/[id]/page.tsx` doit envelopper le contenu principal et le rail dans des `<Suspense>` boundaries séparées — le rail (métadonnées légères) s'affiche vite, le contenu (HTML lourd + documents) peut streamer.                                                                     |
| **`revalidatePath` publication**             | Flux complet wizard → fiche                                          | Après `publishTacheAction`, revalider `/questions/[id]` en plus de `/questions` et `/bank`. La fiche tâche publiée est le point d'aboutissement du workflow — son cache doit être frais.                                                                                                            |
| **Audit axe-core CI**                        | Phase 7+ — Tests                                                     | Le test `@axe-core/playwright` doit couvrir `/questions/[id]` (fiche tâche) car c'est la page la plus riche en HTML dynamique (TipTap, documents, grille).                                                                                                                                          |
| **`select("*")` dans `server-fiche-map.ts`** | Phase 1 — Data layer                                                 | Les queries de `server-fiche-map.ts` alimentent directement la fiche tâche. Remplacer `select("*")` par des colonnes explicites AVANT de brancher les nouveaux selectors pour éviter des bugs de colonnes manquantes.                                                                               |

#### Ordre d'implémentation recommandé (intégré au chantier fiche tâche)

1. **Avant Phase 2 :** Créer `lib/utils/safe-html.ts` (config restrictive TipTap) + remplacer les 6 `select("*")`
2. **Pendant Phase 2 :** Les selectors utilisent `safeHtml()` pour tout champ HTML
3. **Pendant Phase 4 :** Créer `app/(app)/questions/[id]/loading.tsx` (skeleton 2 colonnes) + `<Suspense>` boundaries dans la page serveur
4. **Après Phase 4 :** Ajouter `revalidatePath(`/questions/${tacheId}`)` dans `publishTacheAction`
5. **Sprint dédié post-fiche :** `error.tsx`, CSP headers, `prefers-reduced-motion`, skip-to-content, `robots.ts`
6. **Post-MVP :** Tests intégration, E2E, axe-core CI couvrant `/questions/[id]`

---

### Priorisation MVP v1 — Chemin critique

> L'objectif actuel n'est pas 10/10, mais un **MVP v1 utilisable en classe par 10–20 enseignants pilotes**. Ce qui suit isole le sous-ensemble strictement nécessaire au lancement bêta fermée.

#### Légende des étiquettes

| Étiquette             | Signification                              | Délai                |
| --------------------- | ------------------------------------------ | -------------------- |
| **`[MVP v1]`**        | Bloquant pour le lancement bêta fermée     | Avant lancement      |
| **`[Post-MVP v1.1]`** | À faire dans les 3 mois après lancement    | 0–3 mois post-launch |
| **`[v2]`**            | Amélioration future, peut attendre 6+ mois | 6+ mois              |

#### Classification complète

| Point de l'audit                                     | Priorité          | Justification                                                 |
| ---------------------------------------------------- | ----------------- | ------------------------------------------------------------- |
| `loading.tsx` × 5                                    | **MVP v1**        | UX critique — écrans blancs inacceptables pour les pilotes    |
| `error.tsx` × 3                                      | **MVP v1**        | Crash silencieux = perte de confiance des enseignants pilotes |
| Primitive `Skeleton` + 3 skeletons métier            | **MVP v1**        | Indispensable pour que `loading.tsx` soit utile               |
| `prefers-reduced-motion` dans `globals.css`          | **MVP v1**        | 3 lignes CSS, a11y WCAG AA, zéro risque                       |
| Skip-to-content link                                 | **MVP v1**        | 5 lignes JSX, a11y WCAG AA, zéro risque                       |
| Remplacer les 6 `select("*")`                        | **MVP v1**        | Sécurité + alignement conventions, effort < 3h                |
| `revalidatePath` après mutations critiques           | **MVP v1**        | Données périmées en banque = bug visible                      |
| CSP headers (avec `unsafe-inline`)                   | **MVP v1**        | Sécurité défensive baseline, 1 fichier                        |
| `safeHtml()` helper (config restrictive TipTap)      | **MVP v1**        | Prérequis fiche tâche Phase 2                                 |
| Suppression index fantôme `idx_doc_contenu_trgm`     | **MVP v1**        | Déploiement propre, 1 ligne SQL                               |
| AVIF dans `next.config.ts`                           | **MVP v1**        | 1 ligne de config, gain perf gratuit                          |
| `robots.ts`                                          | **MVP v1**        | Empêcher l'indexation, 1 fichier                              |
| `React.cache()` données de référence                 | **Post-MVP v1.1** | Optimisation, pas bloquant                                    |
| Tests d'intégration Server Actions (5)               | **Post-MVP v1.1** | Filet de sécurité important mais pas bloquant pour la bêta    |
| E2E happy path publication TAÉ                       | **Post-MVP v1.1** | Idem                                                          |
| E2E sécurité RLS deux comptes                        | **Post-MVP v1.1** | Idem                                                          |
| Coverage thresholds (60/55)                          | **Post-MVP v1.1** | Infrastructure testing                                        |
| `npm audit` en CI                                    | **Post-MVP v1.1** | Visibilité vulnérabilités                                     |
| `@axe-core/playwright` audit a11y                    | **Post-MVP v1.1** | Audit automatisé post-launch                                  |
| `aria-busy` sur les skeletons                        | **Post-MVP v1.1** | Raffinement a11y                                              |
| Bundle analyzer                                      | **Post-MVP v1.1** | Diagnostic, pas correctif                                     |
| Rate limiting Server Actions                         | **Post-MVP v1.1** | Risque bas avec 10–20 utilisateurs                            |
| Consolider tokens CSS                                | **v2**            | Maintenabilité, pas de bug visible                            |
| Refactorer `server-fiche-map.ts`                     | **v2**            | Maintenabilité, pas de bug visible                            |
| Cleanup `@vitest/browser`                            | **v2**            | Nettoyage                                                     |
| Suspense boundaries dashboard/bank/questions         | **v2**            | Optimisation UX avancée                                       |
| Material Symbols subset                              | **v2**            | Optimisation bundle                                           |
| Migrer `requireActiveAppUser()` vers client standard | **v2**            | Réduction surface service_role                                |
| Vercel Analytics + SpeedInsights                     | **v2**            | Revue Loi 25 requise                                          |
| Sentry                                               | **v2**            | Revue Loi 25 + EFVP requises                                  |
| PPR expérimental                                     | **v2**            | API instable, pas de données justificatives                   |

#### Chemin critique MVP v1 — ordre d'exécution

```
1. safeHtml() helper                    ← prérequis fiche tâche Phase 2
2. Remplacer les 6 select("*")         ← prérequis fiche tâche Phase 1
3. Suppression idx_doc_contenu_trgm    ← 1 ligne SQL
4. loading.tsx × 5 + error.tsx × 3     ← UX critique
5. Primitive Skeleton + 3 skeletons    ← complète loading.tsx
6. prefers-reduced-motion              ← 3 lignes CSS
7. Skip-to-content link               ← 5 lignes JSX
8. CSP headers                         ← 1 fichier next.config.ts
9. revalidatePath après mutations      ← 3 lignes par action
10. AVIF + robots.ts                   ← 2 fichiers, config uniquement
```

**Effort MVP v1 estimé : ~10–12 jours de travail effectif** (soit ~30–40% du travail total de l'audit enrichi).

---

_Fin de l'audit enrichi. Le chemin critique MVP v1 est isolé et coordonné avec le chantier fiche tâche en cours. Le reste (testing, observabilité, polish) suivra en v1.1 et v2, piloté par les retours des enseignants pilotes._
