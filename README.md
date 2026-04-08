# ÉduQc.IA

Application Next.js (App Router) pour la création et la diffusion de tâches d'apprentissement et d'évaluation — univers social (Québec).

## Prérequis

- **Node.js** ≥ 20.9 (voir `package.json` → `engines`)
- Compte **Supabase** et variables d'environnement (copier `.env.example` → `.env.local`)

## Commandes

| Script                 | Usage                                          |
| ---------------------- | ---------------------------------------------- |
| `npm run dev`          | Serveur de développement                       |
| `npm run build`        | Build production                               |
| `npm run start`        | Démarrer le build après `npm run build`        |
| `npm run lint`         | ESLint                                         |
| `npm run format`       | Prettier — formater tout le dépôt              |
| `npm run format:check` | Prettier — vérif sans écrire                   |
| `npm run test`         | Tests unitaires (Vitest)                       |
| `npm run ci`           | Pipeline locale : format + lint + test + build |

En local (`npm run dev`), outils **DEV** (404 en production) : **Fragment Playground** **`/dev/fragments`** ; **maquettes banque** **`/dev/summary-mockup`** (miniature liste + fiche sommaire) ; **maquette OI 3.5 Bloc 3** **`/dev/oi35-bloc3-mockup`** — mocks / logique hors wizard, pas de Supabase.

## Documentation

La documentation est un **livré central** du projet. **Entrée et navigation :** [`docs/README.md`](docs/README.md) (index des sujets : architecture, design system, métier, workflows, backlog, fragmentation, etc.).

Ordre de lecture recommandé : [`docs/DECISIONS.md`](docs/DECISIONS.md) (copy et règles) → [`docs/FEATURES.md`](docs/FEATURES.md) → [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) → [`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md) → [`docs/BACKLOG.md`](docs/BACKLOG.md).

Stratégie de **fragmentation** des rendus fiche / impression / vignette : [`docs/OBJECTIFS-FRAGMENTATION.md`](docs/OBJECTIFS-FRAGMENTATION.md) (avec [`docs/CONVENTIONS-FRAGMENTS.md`](docs/CONVENTIONS-FRAGMENTS.md) et [`docs/FRAGMENT-PLAYGROUND.md`](docs/FRAGMENT-PLAYGROUND.md)).

- CI / déploiement / schéma : **`docs/ARCHITECTURE.md`**
- Avancement produit et backlog : **`docs/BACKLOG.md`**
- Après une livraison : **`docs/BACKLOG.md`** (section Documentation et traçabilité)
- Assistants / agents : obligation explicite dans **`.cursor/rules/eduqcia.mdc`** (section **Obligation — documentation de progression**), en plus de **`AGENTS.md`**.

## Qualité (prod-ready)

- **GitHub Actions** : `.github/workflows/ci.yml` — à chaque push/PR sur `main` ou `master` : `format:check`, `lint`, `test`, `build`.
- **Pre-commit** : Husky + lint-staged — ESLint et Prettier sur les fichiers commités.
- Avant une PR : `npm run ci` localement.

## Déploiement (Vercel)

Configurer les variables d'environnement du projet (mêmes clés que `.env.example`) dans le tableau de bord Vercel — ne jamais committer `.env*`.

Audit périodique (CI, stack, variables, maturité prod) : **`docs/ARCHITECTURE.md`** (déploiement et maturité).
