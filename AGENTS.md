<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## ÉduQc.IA — repères

- **Documentation** : `docs/README.md` (navigation). Ordre : `docs/DECISIONS.md`, `docs/UI-COPY.md` (textes visibles), `docs/FEATURES.md`, `docs/ARCHITECTURE.md`, `docs/DESIGN-SYSTEM.md`, `docs/BACKLOG.md` (pilotage, anti-dette, produit abouti).
- **Après toute livraison** qui change produit, routes, données, copy ou déploiement : **obligatoire** — appliquer le tableau `docs/BACKLOG.md` → **Documentation et traçabilité** ; mettre à jour BACKLOG et [BACKLOG-HISTORY.md](./docs/BACKLOG-HISTORY.md) si chronologie, **`docs/UI-COPY.md`** si copy UI, **`docs/DECISIONS.md`** si règle / protocole / icônes, et les autres specs touchées. Règle détaillée : `.cursor/rules/eduqcia.mdc` → **Obligation — documentation de progression**. Ne pas clore sans doc alignée.
- **Classes Tailwind** : tokens du thème ; fusion avec `import { cn } from "@/lib/utils/cn"` (`docs/DESIGN-SYSTEM.md` — section Tailwind).
- **Qualité** : `npm run ci` (format + lint + test + build) ou équivalent ; 0 erreur ESLint / Prettier check. CI GitHub : `.github/workflows/ci.yml`.

---

## Règles absolues d'implémentation

### 1. Rien n'existe dans le vide — tout se branche à l'existant

Quand on crée un nouveau composant, hook, ou module :

- **Identifier la route existante** (`app/**/page.tsx`) qui va l'utiliser.
- **Identifier le composant existant** qu'il remplace ou dans lequel il s'insère.
- **Identifier le fetch de données** existant (server component, loader, RPC Supabase) — ne pas recréer un fetch si un existe déjà.
- **Identifier les imports à modifier** dans les fichiers existants pour brancher le nouveau composant.

Si ces quatre points ne sont pas documentés dans la spec ou le prompt, **demander l'information avant de coder**.

### 2. Réutiliser les primitives existantes — ne jamais recréer du markup

Avant de coder un composant qui affiche des métadonnées, badges, chips, statuts, ou arbres hiérarchiques :

- **Lire le code source** de chaque primitive dans `lib/fiche/primitives/` : `MetaChip`, `ChipBar`, `MetaRowSimple`, `MetaRow`, `IconBadge`, `StatusBadge`, `SectionLabel`, `ContentBlock`.
- **Lire les composants de section** dans `lib/fiche/sections/` : `SectionCD`, `SectionConnaissances`.
- **Lire les composants de rendu spécialisés** : `GrilleEvalTable`, `DocumentElementRenderer`, `DocumentCard`.
- **Importer et utiliser ces composants avec leurs vraies props** au lieu de recréer du HTML/JSX à la main.

Si un composant primitif existe pour le rendu souhaité, l'utiliser. Ne jamais écrire de `<span className="...">` quand un `<MetaChip icon="..." label="..." mode="lecture" />` fait le travail.

### 3. Pas de couleurs hardcodées

- Utiliser les tokens Tailwind mappés sur `app/globals.css` : `text-deep`, `text-steel`, `text-muted`, `text-accent`, `bg-panel`, `bg-panel-alt`, `bg-surface`, `bg-bg`, `border-border`, etc.
- Pas de hex en dur (`#1B2A3D`), pas de HSL en dur (`hsl(220, 40%, 18%)`).
- Si un token manque, le signaler au lieu de hardcoder une valeur.

### 4. Tous les badges et chips sont inline

- `StatusBadge`, `MetaChip`, et tout badge visuel doivent être en `inline-flex` / `width: fit-content`.
- Jamais de badge qui prend 100% de la largeur de son conteneur.
- Si un badge s'étend en pleine largeur, le problème est dans le conteneur parent (ajouter un wrapper `w-fit` ou `inline-flex`).

### 5. Ne pas inventer de features

- Pas de bouton ou fonctionnalité qui n'a pas été explicitement demandée.
- Si une feature semble manquante, **signaler le manque** au lieu de l'inventer.
- Exemples historiques de features inventées à tort : « Dupliquer », « Exporter PDF direct », couleurs par aspect de société.

### 6. Material Symbols Outlined uniquement

- Bibliothèque d'icônes **unique** : Material Symbols Outlined.
- Pattern d'usage : `.icon-text` / `.icon-lead` dans `app/globals.css`.
- Glyphe en `1em`, `gap: var(--icon-gap-em)` (~0.35em).
- Référence des glyphes par concept : `docs/DESIGN-SYSTEM.md` §1.4.

### 7. Langue du code

- **Français** : noms de composants, variables métier, props métier (`estAuteur`, `estEpinglee`, `surModifier`), messages UI, toasts, commentaires.
- **Anglais** : API React standards (`children`, `className`, `onClick`, `ref`, `style`, `disabled`, `aria-*`), types génériques TypeScript (`Props`, `State`, `Ref`), fichiers de configuration.

### 8. Zones tactiles 44px minimum

- Tout bouton ou élément cliquable : `min-h-11` / `h-11` (44px).
- S'applique aux boutons icônes, boutons primaires, liens d'action, éléments de liste cliquables.

### 9. Convention de nommage

- Définie dans `claude.md` section « Convention de nommage et structure des fichiers ».
- Kebab-case pour les fichiers, PascalCase pour les exports.
- Un composant par fichier.
- Le contexte est porté par le dossier, pas par le nom du fichier.

### 10. Selectors existants

- Les selectors dans `lib/fiche/selectors/` sont la source de vérité pour extraire les données d'une tâche.
- Les utiliser au lieu de recalculer les données manuellement.
- Exemples : `selectHero`, `selectDocuments`, `selectGuidage`, `selectCorrige`, `selectGrille`, `selectRailNiveau`, `selectRailDiscipline`, `selectRailAspects`, `selectRailCompetence`, `selectRailConnaissances`.
