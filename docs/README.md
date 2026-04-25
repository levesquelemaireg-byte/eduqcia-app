# Documentation ÉduQc.IA

ÉduQc.IA est une application Next.js (App Router) pour la création et la diffusion de **tâches** alignées sur les programmes québécois (univers social). La documentation ci-dessous est la **seule carte** : chaque sujet a **un** fichier source (plus **[RLS-CHECKLIST.md](./RLS-CHECKLIST.md)** pour l’exécution manuelle F3 / A3).

## Fichiers et rôle

| Fichier                                                                  | Rôle                                                                                                                                                                                                                                                                                               |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [README.md](./README.md)                                                 | Ce fichier : navigation et ordre de lecture                                                                                                                                                                                                                                                        |
| [ARCHITECTURE.md](./ARCHITECTURE.md)                                     | Stack, dossiers, Server/Client, Supabase, routes, schéma (décisions + lien SQL), déploiement, CI                                                                                                                                                                                                   |
| [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md)                                   | Tokens, composants, icônes, Tailwind, **formulaires** (contrat complet), modales                                                                                                                                                                                                                   |
| [FEATURES.md](./FEATURES.md)                                             | Métier, domaine, fiche, dashboard, banque, **module documents historiques** §13.1, wizard TAÉ (vue par domaine)                                                                                                                                                                                    |
| [WORKFLOWS.md](./WORKFLOWS.md)                                           | Parcours détaillés : wizard 7 étapes, stepper, consigne TipTap, documents, CD, import                                                                                                                                                                                                              |
| [BACKLOG.md](./BACKLOG.md)                                               | Produit abouti, backlog, dette technique, checklists de livraison                                                                                                                                                                                                                                  |
| [BACKLOG-HISTORY.md](./BACKLOG-HISTORY.md)                               | Chronologie détaillée des mises à jour (tableau daté, complément de BACKLOG)                                                                                                                                                                                                                       |
| [RLS-CHECKLIST.md](./RLS-CHECKLIST.md)                                   | Exécution manuelle F3 / A3 — RLS, deux comptes, fiche de passage                                                                                                                                                                                                                                   |
| [DECISIONS.md](./DECISIONS.md)                                           | Règles normatives, protocoles, justifications d’icônes, mapping données, checklists                                                                                                                                                                                                                |
| [UI-COPY.md](./UI-COPY.md)                                               | **Registre copy UI** — textes visibles par page / composant                                                                                                                                                                                                                                        |
| [FAQ.md](./FAQ.md)                                                       | **Texte public officiel** — définitions tâche, opération intellectuelle, processus de création (sept étapes), épreuve ; **FAQ enseignants** — repère temporel / année normalisée (« Situer dans le temps ») — [ancre `#faq-repere-temporel-enseignants`](./FAQ.md#faq-repere-temporel-enseignants) |
| [wizard-oi-non-redactionnelle.md](./wizard-oi-non-redactionnelle.md)     | Spec copy et parcours des **tâches non rédactionnelles** ; **repère temporel / année normalisée (OI1)** ; téléversements **JPG/PNG** uniquement                                                                                                                                                    |
| [plan-banque-collaborative.md](./plan-banque-collaborative.md)           | **Chantier banque** — filtres, recherche, URL `onglet`, pagination, dérivation métier épreuves, migration `consigne_search_plain`                                                                                                                                                                  |
| [FRAGMENT-PLAYGROUND.md](./FRAGMENT-PLAYGROUND.md)                       | **DEV** — Fragment Playground (`/dev/fragments`) : comportement × contexte, mocks `TacheFicheData`, règles d’import                                                                                                                                                                                |
| [archive/CONVENTIONS-FRAGMENTS.md](./archive/CONVENTIONS-FRAGMENTS.md)   | **⚠️ Déprécié** — Nomenclature fragments (`Fragment` / `App` / `Print`), jamais appliquée en production. Référentiel actuel : `docs/specs/print-engine.md` (section 5)                                                                                                                             |
| [OBJECTIFS-FRAGMENTATION.md](./OBJECTIFS-FRAGMENTATION.md)               | **Stratégie** — pourquoi fragmenter (`FicheTache`, print, thumbnail) ; priorités d’extraction ; workflow playground et debug ; règle d’or — à lire avec CONVENTIONS-FRAGMENTS et FRAGMENT-PLAYGROUND                                                                                               |
| [TUTORIEL-IMPORT-TAE-NOTEBOOKLM.md](./TUTORIEL-IMPORT-TAE-NOTEBOOKLM.md) | **Enseignant / contributeur** — importer une TAÉ **sans wizard** : rôle du bundle `import-tache-notebooklm-bundle.json`, sources pédagogiques, PDA verbatim, NotebookLM ; lien `lib/tache/import/` et backlog parcours app                                                                         |

## Ordre de lecture imposé (avant de coder)

1. [DECISIONS.md](./DECISIONS.md) — règles absolues, terminologie, protocoles ; [UI-COPY.md](./UI-COPY.md) — tout libellé / message visible (pas d’invention de texte) ; [FAQ.md](./FAQ.md) — formulations publiques validées (tâche, opération intellectuelle, processus de création, épreuve)
2. [FEATURES.md](./FEATURES.md) — métier et terminologie produit
3. [ARCHITECTURE.md](./ARCHITECTURE.md) — structure Next.js et données
4. [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md) — formulaires (obligatoire pour tout formulaire), tokens, icônes
5. [BACKLOG.md](./BACKLOG.md) — anti-dette et qualité avant refactors
6. Puis [WORKFLOWS.md](./WORKFLOWS.md) et zones de [FEATURES.md](./FEATURES.md) selon la tâche

## Documentation après livraison

Toute livraison qui change le comportement utilisateur, les routes ou l’exploitation doit mettre à jour les documents concernés. Détail : [BACKLOG.md](./BACKLOG.md#documentation-et-traçabilité).

## Références hors `docs/`

| Chemin                     | Rôle                                                                                                                                                                                                                    |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `supabase/schema.sql`      | Schéma SQL canonique (aligné [ARCHITECTURE.md](./ARCHITECTURE.md#schéma-base-de-données))                                                                                                                               |
| `supabase/migrations/`     | Scripts incrémentaux (ex. `20250325180000_update_tae_transaction.sql`, `20250325200000_tae_collaborateurs_rpc.sql`) — [ARCHITECTURE.md](./ARCHITECTURE.md#schéma-base-de-données)                                       |
| `README.md` (racine)       | Installation, scripts npm                                                                                                                                                                                               |
| `app/dev/fragments/`       | **DEV** — Fragment Playground (mocks, pas de Supabase) ; 404 en production — [ARCHITECTURE.md](./ARCHITECTURE.md#routes-app-router) ; [archive/CONVENTIONS-FRAGMENTS.md](./archive/CONVENTIONS-FRAGMENTS.md) (déprécié) |
| `app/dev/summary-mockup/`  | **DEV** — maquettes banque : miniature liste + fiche sommaire (`TacheFicheData` mocks) ; 404 en production — [ARCHITECTURE.md](./ARCHITECTURE.md#routes-app-router)                                                     |
| `AGENTS.md`                | Rappels agents / Next.js                                                                                                                                                                                                |
| `.github/workflows/ci.yml` | Pipeline CI                                                                                                                                                                                                             |

## Next.js

Lire `node_modules/next/dist/docs/` pour les API Next.js en vigueur dans ce dépôt (voir `AGENTS.md`).
