# Lab — grilles ministérielles (Vite + React)

Petit outil **hors** `npm run ci` racine pour comparer les PNG (`maquette/img/`) au rendu **React** identique à l’app (`components/tae/grilles/`).

Le lab importe **`GrilleEvalTable`** via l’alias Vite `@/` → racine du dépôt (`vite.config.ts`) : toute modification dans `components/tae/grilles/` ou `lib/tae/grilles/` (ex. `tieAsciiParentheses`) s’applique ici aussi après sauvegarde / redémarrage du serveur Vite si besoin. Les **word joiners** (U+2060) sont **invisibles** ; à **660px** le texte ne coupe souvent pas — utiliser le **curseur de largeur** sous le bloc React pour forcer la césure et vérifier que les parenthèses ne restent pas seules en bord de ligne.

## Prérequis

- Node 20+
- PNG dans **`maquette/img/`** — noms **exactement** comme `outil_image` dans `public/data/grilles-evaluation.json` (ex. `OI3_SO5.png`).

## Affichage

- **Largeur 660px** pour la colonne PNG et pour le composant React — **jamais inférieure** (même règle que l’app). Page avec `overflow-x: auto` si la fenêtre est plus étroite.
- Les PNG ne passent **pas** par `import.meta.glob` (hors racine Vite) : le serveur Vite les sert sous **`/maquette-img/<fichier>.png`**. Après avoir ajouté des fichiers dans `maquette/img/`, **redémarre** `npm run dev` si besoin.

## Commandes

Depuis la **racine du dépôt** (`eduqcia-app`), **une commande par ligne** (éviter de coller deux `cd` sur la même ligne — erreur PowerShell du type `maquettecd`).

```bash
cd maquette/grilles-etalon-lab
npm install
npm run dev
```

PowerShell (équivalent sur une ligne) : `cd maquette/grilles-etalon-lab; npm install; npm run dev`

Ouvrir l’URL affichée (souvent `http://localhost:5173`). Choisir un `id` : bloc **PNG** puis bloc **React** (empilés, 660px).

Après une mise à jour des composants partagés (`components/tae/grilles/`), **redémarrer** `npm run dev` du lab (Vite ne reprend pas toujours les changements hors `src/` du lab sans restart).

Build statique :

```bash
npm run build && npm run preview
```

(`vite preview` utilise le même middleware pour les PNG que `vite dev`.)

## Recette

Même critères que [docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md) (section **Grilles d’évaluation ministérielles**) : Chrome Windows 100 %, Arial dans les tableaux, critères A/B/C.

**Référence équipe :** les **trois** grilles complexes (**OI3_SO5**, **OI6_SO3**, **OI7_SO1**) sont **validées pixel-perfect** (mars 2026) — PNG dans `maquette/img/`, baselines Playwright, détail dans [ARCHITECTURE.md](../../docs/ARCHITECTURE.md).
