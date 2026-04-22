# SPEC-TOPNAV-PREVIEW-WIZARD.md

**Statut :** **FERMÉE** — lot livré le 18 avril 2026.
**Archivage :** déplacée de `docs/specs/` vers `docs/specs/fermees/` le 18 avril 2026.

> **Spécification de design — Barre de navigation unifiée du panneau d'aperçu (wizard tâche et wizard document)**
>
> Refonte cosmétique UI/UX uniquement. La base architecturale (pipeline de rendu, modes d'impression, state management, types) est déjà implémentée et ne doit pas être modifiée. Cette spec décrit uniquement la présentation visuelle et l'agencement de la barre.

---

## 1. Périmètre et principe directeur

### 1.1 Scope

Cette spec s'applique **uniquement** au panneau d'aperçu dans les deux écrans suivants :

- **Wizard tâche** (colonne aperçu) — route du wizard de création/édition de tâche
- **Wizard document** (colonne aperçu) — route du wizard de création/édition de document

**Hors scope** : vues détaillées (`/documents/[id]`, `/questions/[id]`, `/evaluations/[id]`), téléchargement PDF, visionneuse plein écran, toute logique métier liée aux modes d'impression.

### 1.2 Problème à résoudre

La barre actuelle affiche **trois barres empilées verticalement** (Sommaire/Aperçu → Formatif/Sommatif/Corrigé → Dossier/Questionnaire). Cette cascade prend beaucoup de hauteur, crée une hiérarchie confuse et n'utilise pas l'espace horizontal.

### 1.3 Principe de la refonte

Une **seule barre horizontale** avec un pattern de boutons unifié (style incident.io) qui affiche conditionnellement les contrôles selon l'état courant. Les onglets principaux restent toujours à gauche après un titre iconique. Les options d'impression apparaissent à droite uniquement quand elles sont pertinentes.

### 1.4 Règle absolue — rien n'existe dans le vide

Cette refonte est **cosmétique**. La logique métier existe déjà :

- Les types d'état (mode d'impression, feuillet actif) existent
- Le state management des wizards gère déjà ces valeurs
- Le pipeline de rendu reçoit déjà ces valeurs et produit l'aperçu correspondant
- Les libellés existent peut-être déjà dans `docs/UI-COPY.md` et `lib/ui/ui-copy.ts`

**L'agent ne doit pas recréer ces mécanismes**. Il doit identifier les composants UI existants de la barre et refactorer leur présentation en conservant les props et handlers existants. Si un libellé n'existe pas (notamment « Sommaire détaillé »), l'agent a la permission de l'ajouter dans `lib/ui/ui-copy.ts` et `docs/UI-COPY.md`.

---

## 2. Structure de la barre — ordre gauche → droite

### 2.1 Anatomie complète

La barre se compose de 5 sections horizontales :

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  [preview]  │  [topic] Sommaire détaillé   [print] Aperçu de l'imprimé   │   [exercise] Formatif  [two_pager]   │
│   titre     │              onglets primaires                              │       modes d'impression              │
│             │                                                              │                                       │
│             ─ divider principal                          ─ divider           ─ divider si groupe 3 visible         │
│                                                                                                                   │
│  Sommatif standard  [task_alt] Corrigé  │  [edit_square] Questionnaire  [article] Dossier documentaire            │
│                                          │                   feuillets                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Les 5 sections

1. **Titre iconique** (toujours visible) : icône Material `preview` seule, sans texte
2. **Divider principal** (toujours visible, un peu plus marqué que les autres)
3. **Onglets primaires** (toujours visibles) : Sommaire détaillé · Aperçu de l'imprimé
4. **Divider** + **Modes d'impression** (visibles si onglet Aperçu actif, wizard tâche seulement) : Formatif · Sommatif standard · Corrigé
5. **Divider** + **Feuillets** (visibles si mode Sommatif standard, wizard tâche seulement) : Questionnaire · Dossier documentaire

---

## 3. Libellés et icônes

Toutes les icônes sont **Material Symbols Outlined**, bibliothèque unique du design system.

| Élément                 | Libellé              | Icône Material |
| ----------------------- | -------------------- | -------------- |
| Titre de la barre       | — (icône seule)      | `preview`      |
| Onglet 1                | Sommaire détaillé    | `topic`        |
| Onglet 2                | Aperçu de l'imprimé  | `print`        |
| Mode 1                  | Formatif             | `exercise`     |
| Mode 2                  | Sommatif standard    | `two_pager`    |
| Mode 3                  | Corrigé              | `task_alt`     |
| Feuillet 1              | Questionnaire        | `edit_square`  |
| Feuillet 2              | Dossier documentaire | `article`      |
| Bouton Options (mobile) | — (icône seule)      | `tune`         |

### 3.1 Permission de création de copy

Si ces libellés n'existent pas encore dans `lib/ui/ui-copy.ts` et `docs/UI-COPY.md`, **l'agent a permission de les créer**. Nom de la section suggéré : `WIZARD_PREVIEW_TOPNAV_*`. Si des libellés similaires existent déjà (`CARROUSEL_APERCU_COPY`, `EVAL_PRINT_SECTION_COPY`), les réutiliser et les renommer si nécessaire — pas de doublons.

---

## 4. Wizard tâche — les 4 états

### 4.1 État 1 — Sommaire détaillé actif

```
[preview] │ [topic] Sommaire détaillé  [print] Aperçu de l'imprimé
           ───────────────────────────
```

Barre minimale : titre + onglets primaires. Aucune option d'impression.

### 4.2 État 2 — Aperçu + Formatif

```
[preview] │ [topic] Sommaire détaillé  [print] Aperçu de l'imprimé │ [exercise] Formatif  [two_pager] Sommatif standard  [task_alt] Corrigé
                                        ──────────────────────────    ──────────────────
```

Les modes apparaissent. Formatif actif, aucun sous-bouton.

### 4.3 État 3 — Aperçu + Sommatif standard

```
[preview] │ [topic] Sommaire détaillé  [print] Aperçu de l'imprimé │ [exercise] Formatif  [two_pager] Sommatif standard  [task_alt] Corrigé │ [edit_square] Questionnaire  [article] Dossier documentaire
                                        ──────────────────────────                          ────────────────────────────                      ─────────────────────────────
```

Le 3ᵉ groupe apparaît. Questionnaire actif par défaut.

### 4.4 État 4 — Aperçu + Corrigé

```
[preview] │ [topic] Sommaire détaillé  [print] Aperçu de l'imprimé │ [exercise] Formatif  [two_pager] Sommatif standard  [task_alt] Corrigé
                                        ──────────────────────────                                                        ───────────────
```

Le 3ᵉ groupe disparaît. Identique à l'état Formatif en structure.

---

## 5. Wizard document — les 2 états

Pas de modes d'impression ni de feuillets.

### 5.1 État A — Sommaire détaillé actif

```
[preview] │ [topic] Sommaire détaillé  [print] Aperçu de l'imprimé
           ───────────────────────────
```

### 5.2 État B — Aperçu de l'imprimé actif

```
[preview] │ [topic] Sommaire détaillé  [print] Aperçu de l'imprimé
                                        ──────────────────────────
```

Structure identique — seul le contenu sous la barre change.

### 5.3 API suggérée du composant

```tsx
<TopNavApercu
  ongletActif={...}
  surChangerOnglet={...}
  // Optionnels — absents dans le wizard document
  modeActif={...}
  surChangerMode={...}
  feuilletActif={...}
  surChangerFeuillet={...}
/>
```

Règles de rendu :

- Si `modeActif` et `surChangerMode` ne sont pas fournis → groupe 2 non rendu
- Si `feuilletActif` et `surChangerFeuillet` ne sont pas fournis, **ou** si `modeActif !== 'sommatif-standard'` → groupe 3 non rendu

---

## 6. Défauts et persistance

### 6.1 Valeurs par défaut

| Contexte                             | Valeur par défaut            |
| ------------------------------------ | ---------------------------- |
| Ouverture initiale du wizard         | Onglet **Sommaire détaillé** |
| 1ʳᵉ bascule vers Aperçu de l'imprimé | Mode **Formatif**            |
| 1ʳᵉ bascule vers Sommatif standard   | Feuillet **Questionnaire**   |

### 6.2 Persistance entre allers-retours

L'utilisateur doit pouvoir naviguer entre Sommaire détaillé et Aperçu sans perdre son état secondaire.

**Scénario type** :

1. Utilisateur sur Aperçu + Sommatif + Dossier documentaire
2. Clic sur Sommaire détaillé
3. Clic sur Aperçu de l'imprimé
4. → Retrouve Sommatif + Dossier documentaire (pas reset à Formatif/Questionnaire)

L'état est reflété dans les **query params de l'URL** pour permettre partage et reload sans perte.

### 6.3 Format URL suggéré

```
/questions/new?vue=apercu&mode=sommatif-standard&feuillet=dossier
/questions/new?vue=sommaire
/documents/new?vue=apercu
```

Noms des params à harmoniser avec ceux déjà utilisés par le wizard (à vérifier dans le code existant). Si des noms existent déjà, les conserver.

---

## 7. Design visuel — style incident.io

### 7.1 Philosophie

**Un seul pattern de bouton partout**. Tous les contrôles (titre, onglets primaires, modes, feuillets) partagent la même grammaire visuelle. Seules la taille et l'emphase varient pour créer la hiérarchie.

- Pas de segmented control iOS (pas de pill blanc sur fond gris)
- Pas d'underline tabs (pas de trait accent en dessous)
- **Pills ghost** : fond transparent en repos, fond subtil au hover, fond un peu plus marqué en actif

### 7.2 Typographie

- Famille : **Manrope** (du design system)
- Letter-spacing légèrement négatif sur les tailles courantes : `-0.005em`
- Poids 500 pour les boutons inactifs, **600** pour les actifs (pas 400 → trop mou, pas 700 → trop lourd)

### 7.3 Palette

| Usage                                                       | Valeur                             |
| ----------------------------------------------------------- | ---------------------------------- |
| Fond de la barre                                            | `#FFFFFF` (blanc pur)              |
| Texte en repos                                              | `hsl(220, 12%, 55%)` (ink-3)       |
| Texte au hover                                              | `hsl(220, 40%, 14%)` (ink)         |
| Texte en actif                                              | `hsl(220, 40%, 14%)` (ink)         |
| Fond au hover                                               | `hsl(220, 20%, 96%)` (hover)       |
| Fond en actif                                               | `hsl(220, 25%, 94%)` (active)      |
| Bordure (box-shadow de la barre)                            | `hsl(220, 15%, 92%)` (line)        |
| Divider vertical                                            | `hsl(220, 15%, 92%)` (line)        |
| Accent (mobile : icône Options active, check dans le sheet) | `hsl(195, 75%, 42%)` (accent)      |
| Accent soft (fond de l'icône Options active)                | `hsl(195, 70%, 96%)` (accent-soft) |

**Règle** : une seule couleur d'accent (teal). La hiérarchie principale se fait par les teintes de gris et les poids de texte. L'accent est réservé au mobile (bouton Options actif, checkmarks dans le bottom sheet).

### 7.4 Dimensions

#### Barre

| Élément                             | Valeur                         |
| ----------------------------------- | ------------------------------ |
| Hauteur effective                   | ~52px                          |
| Padding interne                     | `10px 14px`                    |
| Gap entre éléments                  | `4px`                          |
| Border (implémenté en box-shadow)   | `0 0 0 1px hsl(220, 15%, 92%)` |
| Radius (coins supérieurs seulement) | `10px 10px 0 0`                |

#### Titre iconique (`preview`)

| Élément           | Valeur                                |
| ----------------- | ------------------------------------- |
| Largeur × hauteur | `32px × 32px`                         |
| Taille de l'icône | `20px`                                |
| Couleur           | `var(--ink-2)` = `hsl(220, 20%, 36%)` |

#### Boutons primaires (Sommaire détaillé, Aperçu de l'imprimé)

| Élément               | Valeur      |
| --------------------- | ----------- |
| Taille de texte       | `13.5px`    |
| Poids inactif / actif | `500 / 600` |
| Padding               | `8px 13px`  |
| Gap icône/texte       | `6px`       |
| Taille icône          | `18px`      |
| Radius                | `6px`       |

#### Boutons secondaires (modes, feuillets)

| Élément               | Valeur      |
| --------------------- | ----------- |
| Taille de texte       | `12.5px`    |
| Poids inactif / actif | `500 / 600` |
| Padding               | `6px 11px`  |
| Gap icône/texte       | `6px`       |
| Taille icône          | `16px`      |
| Radius                | `6px`       |

#### Dividers verticaux

| Élément                            | Valeur                             |
| ---------------------------------- | ---------------------------------- |
| Divider principal (après le titre) | `1px × 22px`, margin `0 6px 0 4px` |
| Divider entre groupes              | `1px × 18px`, margin `0 8px`       |
| Couleur                            | `var(--line)`                      |

### 7.5 États d'un bouton

**Inactif** (repos) :

- Texte : `color: var(--ink-3)`, `font-weight: 500`
- Icône : `opacity: 0.8`
- Fond : transparent

**Hover** :

- Texte : `color: var(--ink)`
- Icône : `opacity: 1`
- Fond : `background: var(--hover)` (`hsl(220, 20%, 96%)`)

**Actif** :

- Texte : `color: var(--ink)`, `font-weight: 600`
- Icône : `opacity: 1`
- Fond : `background: var(--active)` (`hsl(220, 25%, 94%)`)

**Focus visible** :

- `outline: 2px solid var(--accent)` avec `outline-offset: 2px`

### 7.6 Variation de l'icône

Les icônes Material Symbols utilisent :

```css
font-variation-settings:
  "FILL" 0,
  "wght" 400,
  "GRAD" 0,
  "opsz" 20;
```

Contour fin, non rempli. Cohérent avec le reste du design system.

### 7.7 Transitions

Toutes les transitions utilisent des courbes d'easing uniformes :

| Propriété                            | Durée   | Easing                          |
| ------------------------------------ | ------- | ------------------------------- |
| Changement de couleur (texte, icône) | `140ms` | `cubic-bezier(0.4, 0, 0.2, 1)`  |
| Changement de fond (hover / actif)   | `140ms` | `cubic-bezier(0.4, 0, 0.2, 1)`  |
| Apparition des groupes conditionnels | `220ms` | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Opacité des icônes                   | `140ms` | `cubic-bezier(0.4, 0, 0.2, 1)`  |

### 7.8 Apparition des groupes conditionnels

Quand un groupe devient visible (par exemple le groupe feuillets quand on passe en Sommatif standard) :

```css
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-6px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

Appliqué avec `animation: slideIn 220ms cubic-bezier(0.16, 1, 0.3, 1)` sur le conteneur du groupe.

**Ne pas utiliser** `display: none` ↔ `display: flex` directement (saut brutal). Utiliser l'animation d'opacité + translateX, ou monter/démonter le composant avec un wrapper qui gère la transition (équivalent de React Transition Group ou Framer Motion si déjà présent dans le projet).

### 7.9 Pas d'ombres portées, pas de bordures explicites

- La bordure de la barre est implémentée en `box-shadow: 0 0 0 1px var(--line)` (pas `border: 1px solid`) pour ne pas affecter le box model
- Aucune ombre portée sur les boutons (pas de fake relief)
- Aucun dégradé nulle part
- Aucun border coloré

### 7.10 Aspect « SaaS pro 2026 »

- **Espacements généreux** — la densité est raisonnée, pas tassée
- **Grille de 2px sur les radius** (6px, 8px, 10px, 12px, 14px)
- **Grille de 4px sur les paddings**
- **Alignement pixel-perfect** des baselines de texte entre les 3 groupes
- **Zones de clic généreuses** (au moins 32px de hauteur effective pour les contrôles secondaires, 36px pour les primaires)
- **Pas de décoration gratuite** — chaque pixel a une raison

---

## 8. Responsive

### 8.1 Desktop (≥ 1024px)

Affichage complet tel que décrit en sections 2 à 7.

### 8.2 Tablette (768px — 1023px)

Les 3 groupes restent sur une seule ligne. Réduire légèrement les paddings :

- Padding onglets primaires : `7px 11px` (au lieu de 8px 13px)
- Padding contrôles secondaires : `5px 9px` (au lieu de 6px 11px)
- Gap entre groupes : `12px` (au lieu de 16px effectifs)

Les icônes conservent leurs tailles originales.

### 8.3 Mobile (< 768px)

**Pattern** : les onglets primaires restent visibles à gauche, les options d'impression passent dans un bouton « Options » avec icône `tune` à droite, qui ouvre un **bottom sheet** draggable.

**Structure mobile — onglet Aperçu actif, sheet fermé** :

```
┌────────────────────────────────────────────────────────┐
│  [preview]  │  [topic] Sommaire   [print] Aperçu   [tune]  │
└────────────────────────────────────────────────────────┘
```

**Bouton Options** :

- Icône `tune`, taille 18px
- Conteneur 32×32px, radius 7px
- État actif (sheet ouvert) : fond `var(--accent-soft)`, couleur `var(--accent)` — seul élément coloré accent de la barre

**Bottom sheet ouvert** :

```
┌────────────────────────────────────────┐
│              ───                       │  ← handle 36×4px
│                                        │
│  MODE                                  │
│  [exercise] Formatif                   │
│  [two_pager] Sommatif standard   ✓    │
│  [task_alt] Corrigé                    │
│                                        │
│  ────────────────────────────────      │
│                                        │
│  FEUILLET                              │
│  [edit_square] Questionnaire     ✓    │
│  [article] Dossier documentaire        │
│                                        │
└────────────────────────────────────────┘
```

**Spécifications du sheet** :

- Fond : `#FFFFFF`
- Bordure : `box-shadow: 0 0 0 1px var(--line), 0 8px 24px rgba(15, 23, 42, 0.06)`
- Radius : `12px`
- Handle draggable : `36px × 4px`, `var(--ink-4)` à 50% d'opacité, centré
- Labels de section : `10.5px`, poids 600, uppercase, letter-spacing `0.06em`, couleur `var(--ink-3)`
- Options : `13.5px`, poids 500, padding `11px 12px`, radius `7px`
- Icône de l'option : `18px`, alignée à gauche avec gap `10px`
- Option active : texte `var(--accent)`, icône `var(--accent)`, checkmark `check` à droite en `var(--accent)` taille `17px`
- Hover sur option : fond `var(--hover)`
- Divider entre sections : `1px`, `var(--line-soft)`, margin `6px 12px`

**Si l'onglet Sommaire détaillé est actif** :

- Le bouton Options disparaît (rien à paramétrer)

**Si mode = Formatif ou Corrigé** :

- Le bouton Options reste visible mais le sheet ne contient que la section MODE (pas de section FEUILLET)

### 8.4 Very small (< 480px)

- Les libellés des onglets primaires peuvent être raccourcis en « Sommaire » / « Aperçu » (jamais icône seule — les icônes restent accompagnées de texte)
- Le sheet devient plus large (quasi pleine largeur) avec padding latéral réduit

---

## 9. Accessibilité

### 9.1 Structure sémantique

- Barre complète : `<nav aria-label="Navigation de l'aperçu">`
- Onglets primaires : `<button role="tab" aria-selected="true|false" aria-controls="panel-sommaire|panel-apercu">`
- Groupe modes : `<div role="tablist" aria-label="Mode d'impression">` + `<button role="tab">`
- Groupe feuillets : `<div role="tablist" aria-label="Feuillet">` + `<button role="tab">`
- Panneaux de contenu : `<div role="tabpanel" id="..." aria-labelledby="...">`

### 9.2 Navigation clavier

- `Tab` → focus sur le premier onglet actif de chaque groupe
- `←` / `→` → navigation entre onglets d'un même groupe
- `Enter` / `Espace` → active l'onglet focalisé
- `Esc` (mobile, sheet ouvert) → ferme le sheet

### 9.3 Focus visible

- `outline: 2px solid var(--accent)` avec `outline-offset: 2px`
- Jamais `outline: none` sans remplacement équivalent

### 9.4 Contraste

- Texte `var(--ink-3)` sur fond blanc : ratio ≥ 4.5:1 (WCAG AA) — à vérifier
- Texte `var(--ink)` sur `var(--active)` : ratio très élevé, OK
- Icônes à 80% d'opacité : s'assurer que la forme reste identifiable (les Material Outlined à 16-18px le sont)

### 9.5 Zones tactiles

- Desktop : minimum 32px de hauteur effective
- Mobile : minimum 44×44px pour les contrôles dans le sheet (padding 11px + texte 13.5px ≈ 44px)

### 9.6 Icônes décoratives vs informatives

Les icônes qui accompagnent un texte sont décoratives → `aria-hidden="true"` sur le `<span class="mi">`. L'icône `preview` (titre seul) et `tune` (bouton Options) sont informatives → `aria-label` sur le bouton parent.

---

## 10. Branchement à l'existant

### 10.1 Instructions pour l'agent

**Avant de coder**, identifier dans le codebase :

1. **Composant actuel de la barre** du wizard tâche — probablement dans `components/tache/wizard/preview/` ou `components/tache/wizard/` (chercher les fichiers qui contiennent les libellés actuels « Sommaire », « Aperçu de l'imprimé », « Formatif »)
2. **Composant actuel de la barre** du wizard document — probablement dans `components/documents/wizard/preview/` ou équivalent
3. **State management** qui gère les valeurs `vue`, `mode`, `feuillet` — reducer du wizard ou URL params ou context
4. **Libellés existants** dans `lib/ui/ui-copy.ts` — chercher `CARROUSEL_APERCU_COPY`, `EVAL_PRINT_SECTION_COPY`, `WIZARD_PREVIEW_*`
5. **Types TypeScript** pour `mode_impression` et `feuillet` — union types probablement dans `lib/impression/types.ts` ou `lib/types/`

### 10.2 Ce qui change

- La présentation visuelle de la barre (layout, styles, animations)
- L'ajout du titre iconique `preview` à gauche
- L'ajout des icônes Material sur chaque bouton
- Potentiellement les libellés (notamment « Sommaire détaillé »)
- La structure responsive (bottom sheet mobile)

### 10.3 Ce qui ne change pas

- Les types et enums de `mode_impression`
- Le state management (reducer, store, URL params)
- Les signatures des handlers `surChangerOnglet`, `surChangerMode`, `surChangerFeuillet`
- Le pipeline de rendu sous la barre
- Les composants de contenu (Sommaire et Aperçu)

### 10.4 Icônes Material Symbols — assurance disponibilité

Vérifier que la police Material Symbols Outlined est bien chargée dans le layout racine. Glyphes utilisés :

- `preview`, `topic`, `print`
- `exercise`, `two_pager`, `task_alt`
- `edit_square`, `article`
- `tune`, `check`

Tous sont des glyphes standards Material Symbols Outlined et disponibles dans la police par défaut.

### 10.5 Checklist avant de clore l'implémentation

- [ ] La barre a le titre iconique `preview` à gauche dans les deux wizards
- [ ] Le wizard tâche affiche les 3 groupes conditionnels (onglets, modes, feuillets)
- [ ] Le wizard document affiche seulement le titre + onglets primaires
- [ ] Chaque bouton affiche son icône Material + son libellé
- [ ] L'état persiste entre allers-retours Sommaire/Aperçu
- [ ] L'état est reflété dans les query params de l'URL
- [ ] Les groupes 2 et 3 apparaissent avec l'animation `slideIn` (220ms, cubic-bezier)
- [ ] Les transitions hover/actif sont à 140ms cubic-bezier
- [ ] Les icônes passent de opacity 0.8 à 1 au hover/actif
- [ ] Aucun bouton n'a de border explicite, d'ombre portée ou de dégradé
- [ ] Le fond de la barre est blanc pur `#FFFFFF`
- [ ] La seule couleur d'accent utilisée est `hsl(195, 75%, 42%)` et uniquement sur mobile
- [ ] Le responsive mobile (bottom sheet avec handle draggable) fonctionne
- [ ] Les labels sont dans `lib/ui/ui-copy.ts` et documentés dans `docs/UI-COPY.md`
- [ ] L'accessibilité clavier fonctionne (Tab, flèches, Enter, Esc)
- [ ] Les focus visibles sont présents avec `outline: 2px solid var(--accent)`
- [ ] Aucun bouton « Télécharger PDF » n'apparaît (hors scope)
- [ ] Les icônes ont `aria-hidden="true"` sauf dans le titre `preview` et le bouton `tune` (qui ont `aria-label` sur le parent)

---

## 11. Résumé visuel — les 4 états du wizard tâche

```
┌─ État 1 : Sommaire détaillé ───────────────────────────────────────────────────────────────┐
│                                                                                            │
│  [preview] │ [topic] Sommaire détaillé   [print] Aperçu de l'imprimé                       │
│              ═══════════════════════                                                       │
│                                                                                            │
└────────────────────────────────────────────────────────────────────────────────────────────┘

┌─ État 2 : Aperçu + Formatif ───────────────────────────────────────────────────────────────┐
│                                                                                            │
│  [preview] │ [topic] Sommaire  [print] Aperçu │ [exercise] Formatif  [two_pager] Sommatif  │
│                                 ═════════════    ═════════════════                         │
│  [task_alt] Corrigé                                                                        │
│                                                                                            │
└────────────────────────────────────────────────────────────────────────────────────────────┘

┌─ État 3 : Aperçu + Sommatif standard ──────────────────────────────────────────────────────┐
│                                                                                            │
│  [preview] │ [topic] Sommaire  [print] Aperçu │ Formatif  [two_pager] Sommatif   Corrigé   │
│                                 ═════════════              ═══════════════════             │
│  │ [edit_square] Questionnaire   [article] Dossier documentaire                            │
│    ═══════════════════════════                                                             │
│                                                                                            │
└────────────────────────────────────────────────────────────────────────────────────────────┘

┌─ État 4 : Aperçu + Corrigé ────────────────────────────────────────────────────────────────┐
│                                                                                            │
│  [preview] │ [topic] Sommaire  [print] Aperçu │ Formatif   Sommatif   [task_alt] Corrigé   │
│                                 ═════════════                          ═══════════════     │
│                                                                                            │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

Légende : `═══` = bouton en état actif (fond `var(--active)`, poids 600, icône opacity 1). `[xxx]` = icône Material Outlined.

---

_Dernière mise à jour : 2026-04-18_
