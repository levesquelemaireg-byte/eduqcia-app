# SPEC-SOMMAIRE-DOCUMENT.md

**Statut :** **PARTIELLEMENT LIVRÉE** (Tranches 1 + 2 — 18 avril 2026).

**Livré :**

- Tranche 1 — Terminologie « Repère temporel » → « Ancrage temporel », primitive `Tooltip` light card, tooltip sur le champ Ancrage du wizard document.
- Tranche 2 — Sommaire détaillé du wizard document (layout 2 colonnes, pulse de la zone active via `@keyframes zonePulse` + `.doc-sommaire-zone-highlighted`, header `StatusBadge` + sub-chips, colonne droite = 3 groupes de badges).

**À livrer (lot distinct) :**

- Tranche 3 — Miniature du document **unifiée** pour les 3 surfaces (Mes documents, Profil collègue, Banque collaborative) — nécessite enrichissement des queries (`ProfileDocument`, `BankDocumentListRow`, liste `/documents`) pour exposer aspects, connaissances, auteur, dates, nb_utilisations avant de pouvoir afficher les badges spécifiés §3.
- Tranche 4 — Deep-link « Réutiliser dans une tâche » depuis la banque (`/questions/new?doc=<id>&slot=A`) — action dans le kebab de `BankDocumentsPanel`, query param consommé par le wizard tâche pour pré-remplir le slot A.

> **Spécification de design — Sommaire détaillé du document + miniature unifiée + tooltip du design system**
>
> Refonte complète de 3 éléments interdépendants :
>
> 1. Le **sommaire détaillé** du document dans le panneau d'aperçu du wizard document
> 2. La **miniature du document** unifiée pour les 3 contextes d'apparition (Mes documents, Profil, Banque collaborative)
> 3. Le **tooltip** comme primitive du design system (utilisé dans les deux précédents et partout ailleurs)
>
> La logique métier, le state management et les données existent déjà. Cette spec décrit uniquement la présentation visuelle et l'organisation des informations.

---

## Table des matières

1. [Règles absolues](#1-règles-absolues)
2. [Sommaire détaillé du document](#2-sommaire-détaillé-du-document)
3. [Miniature du document unifiée](#3-miniature-du-document-unifiée)
4. [Tooltip — primitive du design system](#4-tooltip--primitive-du-design-system)
5. [Icônes métadonnées — référentiel complet](#5-icônes-métadonnées--référentiel-complet)
6. [Branchement à l'existant](#6-branchement-à-lexistant)

---

## 1. Règles absolues

### 1.1 Cohérence doc/tâche sur les icônes

**RÈGLE ABSOLUE** : les métadonnées partagées entre un document et une tâche utilisent **la même icône partout**. Zéro divergence. Une donnée qui s'appelle `Niveau` a l'icône `school` dans le rail de tâche, le rail de document, le header, la miniature, et n'importe quel autre contexte.

Cette règle doit être ajoutée dans `agents.md` au même titre que les autres règles absolues d'implémentation.

### 1.2 Aucune donnée inventée

Les affichages ne contiennent que des données **réellement saisies** par l'utilisateur ou présentes en base. Pas de description auto-générée, pas d'extrait inventé, pas de libellé « reconstruit ». Si une donnée n'existe pas, on n'affiche rien plutôt que d'improviser.

### 1.3 Réutilisation obligatoire des primitives existantes

Le design system possède déjà :

- Un composant de **badge** avec specs précises (cf. section 1.4)
- Des composants de **StatusBadge** avec variantes `published` / `draft`
- Un composant **PeriodeIcon** composite (`calendar_today` + `line_end_arrow_notch`)
- Des tokens de couleur (`--color-deep`, `--color-accent`, `--color-panel-alt`, etc.)

L'agent ne doit **pas** recréer ces composants. Il doit les identifier dans le code et les réutiliser.

### 1.4 Spécifications du badge (primitive existante — à réutiliser)

| Propriété       | Tailwind                   | Valeur CSS                       |
| --------------- | -------------------------- | -------------------------------- |
| Display         | `inline-flex items-center` | Flex inline centré verticalement |
| Hauteur min     | `min-h-8`                  | 32px                             |
| Gap icône/texte | `gap-1`                    | 4px                              |
| Radius          | `rounded-lg`               | 8px (0.5rem)                     |
| Bordure         | `border-0`                 | Aucune                           |
| Fond            | `bg-panel-alt`             | Token `--color-panel-alt`        |
| Padding X       | `px-2.5`                   | 10px                             |
| Padding Y       | `py-1`                     | 4px                              |
| Taille texte    | `text-xs`                  | 12px                             |
| Graisse         | `font-bold`                | 700                              |
| Couleur texte   | `text-deep`                | Token `--color-deep`             |
| Icône           | `text-[0.9em] text-accent` | ~10.8px, token `--color-accent`  |

**Variantes** à ajouter si absentes :

- `badge-source` : label en gras + valeur en regular (pas d'icône)
- `badge-aspects` : valeurs accumulées avec séparateur `·` en `text-muted`
- `badge-knowledge` : parent + séparateur keyboard_return flippé + feuille
- `badge-author` : version cliquable avec underline et couleur accent
- `badge-anchor` : icône anchor + valeur (pas de mot « Ancrage »)

---

## 2. Sommaire détaillé du document

### 2.1 Contexte d'apparition

Panneau droit du wizard document, sous la topnav unifiée déjà spécifiée dans `SPEC-TOPNAV-PREVIEW-WIZARD.md`. Occupe environ 50% du viewport horizontal. La zone actuelle (fond gris avec carte blanche flottante) est **supprimée** : fond blanc pur partout, séparation du panneau gauche (wizard) par une bordure verticale 1px.

### 2.2 Objectif du sommaire détaillé

C'est un **miroir vivant** de ce que l'enseignant crée dans le wizard à gauche. Il répond à une seule question : « Qu'est-ce que je suis en train de créer et où j'en suis ? » Ce n'est **pas** un rendu imprimé (qui vit dans l'onglet « Aperçu de l'imprimé »), c'est une vue numérique organisée.

### 2.3 Principe de highlight de l'étape courante

La section du sommaire qui correspond à l'étape que l'enseignant est en train de remplir est mise en évidence :

- Encadrée par un border 1px en `--color-accent` et border-radius 12px
- Padding interne 16-18px
- **Pulse continu** de la zone via `box-shadow` animé (pas de badge texte « en cours », juste l'animation visuelle)

Animation CSS :

```css
@keyframes zonePulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 var(--color-accent-ring);
  }
  50% {
    box-shadow: 0 0 0 5px var(--color-accent-ring);
  }
}
/* --color-accent-ring = hsla(195, 75%, 42%, 0.22) */

.section.highlighted {
  border: 1px solid var(--color-accent);
  border-radius: 12px;
  padding: 16px 18px;
  animation: zonePulse 2.4s ease-in-out infinite;
}
```

La section qui pulse varie selon l'étape active du wizard (étape 1 = Contenu du document, étape 2 = Classification, étape 3 = pas d'impact sur le sommaire car c'est seulement une confirmation légale).

### 2.4 Layout — grille 2 colonnes sans scroll

Le sommaire **ne doit pas nécessiter de scroll vertical** dans le panneau. Tout tient dans le viewport.

```
┌──────────────────────────────────────────────────────────────────┐
│ [Topnav preview | Sommaire détaillé | Aperçu de l'imprimé]       │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ● Brouillon                                                     │
│  Titre du document (h1, 24px, font-600, letter-spacing tight)    │
│  [sub-chips : type · structure · PériodeIcon]                    │
│                                                                   │
│  ┌────────────────────────────┬─────────────────────────────┐   │
│  │                            │                              │   │
│  │  CONTENU DU DOCUMENT       │  (groupe Classification)    │   │
│  │  (pulse si étape 1)        │  [Niveau] [Discipline]      │   │
│  │                            │  [Aspects de société]       │   │
│  │  [doc-element : texte HTML │                              │   │
│  │   OU miniature image +     │  (groupe Référencement)     │   │
│  │   légende overlay]         │  [Source gras + valeur]      │   │
│  │                            │  [Catégorie] [⚓ 1760]       │   │
│  │  ─ Source : citation       │                              │   │
│  │                            │  (groupe Informations)      │   │
│  │                            │  [Auteur cliquable]         │   │
│  │  CONNAISSANCES             │  [Créé le 13 avr. 2026]     │   │
│  │  💡 (lightbulb accent)     │  [Mis à jour le 15 avr.]    │   │
│  │  Arbre hiérarchique :      │  [Utilisation]              │   │
│  │    Racine (gras)           │                              │   │
│  │    └─ Niveau 2             │                              │   │
│  │        └─ Niveau 3         │                              │   │
│  │                            │                              │   │
│  └────────────────────────────┴─────────────────────────────┘   │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

**Grille** :

- `grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);`
- `gap: 24px;`
- Colonne gauche plus large parce qu'elle contient le **contenu** (cœur du document) et les **connaissances** (arbre textuel qui peut être long)
- Colonne droite contient les métadonnées groupées en 3 paquets de badges

### 2.5 Header du sommaire

Au-dessus de la grille 2 colonnes :

1. **Badge statut** (brouillon ou publié) — utilise le composant `StatusBadge` existant avec variantes. Dots de couleur + texte en pill arrondie (radius 20px).

2. **Titre** (h1) :
   - Taille `24px`
   - Poids `600`
   - `letter-spacing: -0.025em` (tight moderne)
   - `line-height: 1.2`
   - Couleur `var(--color-deep)`
   - Margin-bottom 12px

3. **Sub-chips** (ligne de badges sous le titre) : identité fondamentale du document
   - **Type** : `article` + « Textuel » OU `image_inset` (légèrement grossie) + « Iconographique »
   - **Structure** : `crop_square` + « Simple », OU `view_column_2` + « Perspectives »/« Deux temps »
   - **Période historique** : `PeriodeIcon` composite + libellé chronologique (ex. « De 1608 à 1760 »)
   - Margin-bottom 24px avant la grille

### 2.6 Colonne gauche — Contenu + Connaissances

#### 2.6.1 Section « Contenu du document »

Section qui **pulse** quand l'enseignant est à l'étape 1 du wizard.

- **Label de section** : « Contenu du document » en `text-xs font-bold uppercase text-muted`, margin-bottom 10px
- **doc-element** (à l'intérieur) : fond `--color-panel-alt`, border-radius 8px, padding 14px

**Variante textuelle** (`type: 'textuel'`) :

- Affiche le HTML tronqué en extrait lisible
- Police 12.5px, line-height 1.6, couleur ink

**Variante iconographique** (`type: 'iconographique'`) :

- Affiche l'image réelle en `aspect-ratio: 5 / 3.2`
- Si `image_legende` existe : overlay blanc en bas-gauche avec bordure gauche 3px noire (style capsule d'annotation standard)

**Pied de l'élément** (toujours) :

- Séparateur en bordure tirets (`border-top: 1px dashed var(--line)`)
- `Source` en label uppercase gras 10px
- Citation de la source en italique 11px

#### 2.6.2 Section « Connaissances »

Arbre hiérarchique breadcrumb-style des connaissances relatives.

- **Label de section** : icône `lightbulb` en accent teal + « Connaissances » en `text-xs font-bold uppercase text-muted`, margin-bottom 8px
- **Structure de l'arbre** :
  - **Racine** (niveau 1) : font-weight 600, color ink, padding 6px 0
  - **Niveau 2** : font-weight 500, color ink-2, padding-left 20px, ligne de connexion gauche (1px var(--line))
  - **Niveau 3** : color ink-2, padding-left 40px, ligne de connexion gauche
- Font-size 12.5px, line-height 1.4 partout

### 2.7 Colonne droite — 3 groupes de badges

La colonne droite n'a **pas de titres de section**. Les groupes sont séparés uniquement par `margin-top: 14px` entre chaque `.badge-group`. Les badges s'auto-portent grâce à leurs icônes.

#### 2.7.1 Groupe 1 — Classification pédagogique

- Badge **Niveau** : icône `school` + valeur (ex. « Secondaire 3 »)
- Badge **Discipline** : icône `menu_book` + valeur (ex. « Histoire du Québec et du Canada »)
- Badge **Aspects de société** (`badge-aspects`) : icône `deployed_code` + valeurs accumulées dans UNE seule pill avec séparateur `·` en `text-muted` (ex. `Politique · Territorial`). Jamais deux pills distinctes.

#### 2.7.2 Groupe 2 — Référencement de la source

- Badge **Source** (`badge-source`) : label « Source » en font-bold 700 + valeur en font-normal 400 (ex. « Secondaire »). **Pas d'icône**.
- Badge **Catégorie** : icône dynamique selon la valeur (cf. section 5.2 pour le mapping) + libellé de catégorie (ex. « Textes savants », « Carte »)
- Badge **Ancrage temporel** (`badge-anchor`) : icône `anchor` en accent teal + date/période textuelle (ex. `1760`, `1760-1867`). **Pas de mot « Ancrage »** dans le badge.

#### 2.7.3 Groupe 3 — Informations

- Badge **Auteur** (`badge-author`) : icône `person` en accent teal + nom. Entièrement cliquable vers le profil. Couleur texte accent teal, underline dotted subtile (`text-decoration-color: hsla(195, 75%, 42%, 0.3); text-underline-offset: 2px`). Hover : fond passe à `--color-accent-soft`.
- Badge **Date création** : icône `calendar_today` + « Créé le 13 avril 2026 » (date complète en français)
- Badge **Date mise à jour** : icône `history` (horloge avec flèche retour) + « Mis à jour le 15 avril 2026 »
- Badge **Utilisation** : icône `link` + « N tâches » ou « Aucune tâche » selon le compteur

### 2.8 Tooltip sur « Ancrage temporel »

L'enseignant ne connaît pas nécessairement le concept « Ancrage temporel ». Dans le **formulaire wizard** (panneau gauche), à côté du label du champ `repere_temporel`, il y a un petit bouton `info` cliquable qui ouvre le tooltip **Variante B — light card** du design system (cf. section 4).

Contenu du tooltip :

- **Titre** : icône `anchor` en accent teal + « Ancrage temporel »
- **Corps** : « Situe le document dans le temps. Utilisé par l'application pour automatiser certaines tâches pédagogiques (ordre chronologique, comparaisons). N'apparaît pas sur la copie de l'élève. »
- **Exemples** (optionnel) : ligne séparée par `border-top: 1px dashed`, avec chips monospace : `1760`, `1760–1867`, `Vers 1800`

Dans le **sommaire** (panneau droit), le badge Ancrage n'a pas de tooltip — il est présenté et c'est au formulaire d'expliquer le concept.

### 2.9 Tokens utilisés

```css
--color-deep: hsl(220, 40%, 14%);
--color-ink-2: hsl(220, 20%, 36%);
--color-muted: hsl(220, 12%, 55%); /* text-muted, ink-3 */
--color-ink-4: hsl(220, 10%, 72%); /* séparateurs textuels */
--color-border: hsl(220, 15%, 92%); /* --line */
--color-line-soft: hsl(220, 15%, 95%);
--color-hover: hsl(220, 20%, 96%);
--color-active: hsl(220, 25%, 94%);
--color-panel-alt: hsl(220, 20%, 97%);
--color-accent: hsl(195, 75%, 42%);
--color-accent-soft: hsl(195, 70%, 96%);
--color-accent-ring: hsla(195, 75%, 42%, 0.22);
--color-success-bg: hsl(142, 45%, 94%);
--color-success-text: hsl(142, 55%, 28%);
--color-warning-bg: hsl(35, 80%, 95%);
--color-warning-text: hsl(35, 80%, 35%);
```

---

## 3. Miniature du document unifiée

### 3.1 Contexte

Actuellement il existe **trois miniatures différentes** pour l'entité Document :

1. **Mes documents** — format liste horizontale avec boutons Voir/Supprimer visibles
2. **Profil collègue** — format liste minimaliste (titre + type + date)
3. **Banque collaborative** — format grille en cartes

Cette divergence est supprimée. **Une seule miniature** unifiée, format liste uniquement.

### 3.2 Anatomie de la miniature

```
┌──────────────────────────────────────────────────────────────────┐
│ ┌───┐                                              ⋯             │
│ │ G │  Titre du document              [status pill]              │
│ │ l │                                                            │
│ │ y │  [Discipline] [Niveau] [Période] [Aspects] [Connaissance]  │
│ │ p │                                                            │
│ │ h │  🔗 Utilisé dans N tâches · 🕐 Mis à jour le 15 avril 2026 │
│ └───┘                                                            │
└──────────────────────────────────────────────────────────────────┘
```

- **Colonne 1** (48×48px) :
  - Variante textuelle → glyphe `article` sur fond `--color-accent-soft`, couleur accent teal, radius 8px
  - Variante iconographique → **miniature réelle de l'image** 48×48px, radius 8px, object-fit cover
- **Colonne 2** (1fr, min-width: 0) :
  - Ligne 1 : titre (font-size 14.5px, font-weight 600, `text-overflow: ellipsis`, whitespace nowrap) + status pill si contexte propriétaire
  - Ligne 2 : badges dans l'ordre fixe **Discipline → Niveaux → PériodeIcon → Aspects de société → Connaissance (2 derniers niveaux)**
  - Ligne 3 : métadonnées tertiaires (auteur si banque, utilisation, date mise à jour complète) en texte discret 11px ink-3 avec icônes ink-4
- **Colonne 3 (absolute)** : bouton kebab `⋯` positionné `top: 10px; right: 10px`, opacity 0 par défaut, opacity 1 au hover de la ligne entière

### 3.3 Badge Connaissance — format 2 derniers niveaux

Le badge connaissance affiche les **2 derniers niveaux** de l'arbre hiérarchique pour préserver le contexte (un niveau 3 seul comme « Organisation territoriale » ne veut rien dire sans son parent).

**Structure** :

```html
<span class="badge badge-knowledge">
  <svg class="ico"><!-- lightbulb accent teal --></svg>
  <span>Régime seigneurial</span>
  <span class="k-chevron">
    <svg class="ico"><!-- keyboard_return flippé horizontalement --></svg>
  </span>
  <span>Organisation territoriale</span>
</span>
```

**Règles de style** :

- **Parent et feuille** ont le **même traitement visuel** : `color: var(--color-deep)`, `font-weight: 700` (comme tout le badge). Pas de différenciation visuelle entre parent et enfant — les deux sont des valeurs à égalité dans le badge.
- **Séparateur chevron** : icône Material `keyboard_return` affichée avec `transform: scaleX(-1)` pour la flipper horizontalement. Pointe ainsi vers la droite (métaphore « descend et part vers l'enfant »). Couleur `var(--color-ink-4)`, font-size 0.85em, margin horizontal 3px.

**Cas limites** :

- Si l'arbre a **1 seul niveau** (pas de parent) : afficher juste le niveau `[💡 Régime seigneurial]` sans chevron
- Si l'arbre a **3+ niveaux** : afficher toujours les 2 derniers (niveau N-1 + feuille N)
- Si **plusieurs branches** sont sélectionnées dans l'arbre : afficher un seul badge avec la branche la plus profonde (à confirmer avec la logique métier existante)

### 3.4 Règles par contexte

| Propriété                      | Mes documents               | Profil collègue                        | Banque collaborative             |
| ------------------------------ | --------------------------- | -------------------------------------- | -------------------------------- |
| Statut (pill publié/brouillon) | ✅ visible                  | ❌ masqué (brouillons jamais visibles) | ❌ masqué (que des publiés)      |
| Auteur (badge cliquable)       | ❌ (c'est moi)              | ❌ (c'est lui, redondant)              | ✅ visible                       |
| Utilisation (N tâches)         | ✅ visible                  | ❌ masqué                              | ❌ masqué                        |
| Date mise à jour               | ✅ visible                  | ✅ visible                             | ✅ visible                       |
| Badges métadonnées             | Identiques partout          | Identiques partout                     | Identiques partout               |
| Kebab actions                  | Voir / Modifier / Supprimer | Voir (seulement)                       | Voir / Réutiliser dans une tâche |

### 3.5 Interactions

- **Clic sur la ligne** → bascule vers la vue détaillée du document
- **Hover sur la ligne** :
  - Fond passe à `var(--color-panel-alt)`
  - `cursor: pointer`
  - Kebab apparaît (`opacity: 0 → 1`, transition 140ms cubic-bezier)
- **Clic sur le kebab** → menu déroulant avec les actions contextuelles (section 3.4 ligne « Kebab actions »)
- **Clic sur l'auteur** (banque seulement) → navigation vers le profil de l'auteur
- **Transition** hover : `background 140ms cubic-bezier(0.4, 0, 0.2, 1)`

### 3.6 Séparateurs et espacement dans la liste

Les miniatures sont présentées dans un conteneur avec fond blanc et bordure 1px :

```css
.list-container {
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 0 0 1px var(--color-border);
  padding: 6px;
}
```

Chaque miniature :

```css
.mini {
  padding: 14px 44px 14px 14px; /* padding-right étendu pour laisser la place au kebab */
  border-radius: 8px;
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  gap: 14px;
}
.mini + .mini {
  margin-top: 2px;
  border-top: 1px solid var(--color-line-soft);
}
```

### 3.7 Layout responsive

- **Desktop (≥ 768px)** : layout décrit ci-dessus
- **Tablette (480-767px)** : les badges passent à `flex-wrap: wrap`, la ligne footer passe sous les badges
- **Mobile (< 480px)** :
  - Le titre peut passer sur 2 lignes (`-webkit-line-clamp: 2`)
  - Les badges restent en `flex-wrap: wrap`
  - Le kebab devient toujours visible (pas de hover sur mobile)
  - Le clic sur la carte reste l'action principale vers la vue détaillée

---

## 4. Tooltip — primitive du design system

### 4.1 Variante retenue — Light card

Un seul tooltip pour l'ensemble du design system. Fond blanc, ombre généreuse, structure optionnelle titre + corps + exemples.

### 4.2 Spécifications visuelles

```css
.tooltip {
  position: absolute;
  background: #ffffff;
  color: var(--color-deep);
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 12.5px;
  line-height: 1.55;
  letter-spacing: -0.005em;
  width: 300px; /* ajustable via prop */
  box-shadow:
    0 0 0 1px var(--color-border),
    0 10px 32px rgba(15, 23, 42, 0.08),
    0 2px 6px rgba(15, 23, 42, 0.04);
  z-index: 50;
}

/* Pointe : carré 10×10 rotée 45° avec border simulé via box-shadow */
.tooltip::before {
  content: "";
  position: absolute;
  top: -5px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 10px;
  height: 10px;
  background: #ffffff;
  box-shadow: -1px -1px 0 0 var(--color-border);
}
```

### 4.3 Contenu — 3 parties optionnelles

**Titre (optionnel)** :

```html
<div class="tip-title">
  <svg class="tip-title-icon"><!-- icône 14px --></svg>
  <span>Titre du concept</span>
</div>
```

Style : font-size 12px, font-weight 600, color deep, letter-spacing -0.01em, gap 6px, margin-bottom 6px. L'icône prend la couleur accent (`var(--color-accent)`).

**Corps (requis)** :

```html
<div class="tip-body">Explication en une ou plusieurs phrases.</div>
```

Style : color ink-2, font-weight 400.

**Exemples (optionnel)** :

```html
<div class="tip-examples">
  <span>Exemples :</span>
  <code>valeur1</code>
  <code>valeur2</code>
</div>
```

Style : margin-top 8px, padding-top 8px, `border-top: 1px dashed var(--color-border)`, font-size 11px color muted. Les `code` sont des chips monospace petites avec fond `--color-hover`.

### 4.4 API suggérée du composant React

```tsx
interface TooltipProps {
  title?: string;
  titleIcon?: string; // nom Material Symbols, optionnel
  content: string;
  examples?: string[]; // chips monospace
  placement?: "top" | "bottom" | "left" | "right"; // default: 'bottom'
  width?: number; // default: 300
  children: React.ReactNode; // trigger
}

<Tooltip
  title="Ancrage temporel"
  titleIcon="anchor"
  content="Situe le document dans le temps. Utilisé pour automatiser les tâches pédagogiques. N'apparaît pas sur la copie de l'élève."
  examples={["1760", "1760–1867", "Vers 1800"]}
>
  <button className="info-btn">
    <span className="mi">info</span>
  </button>
</Tooltip>;
```

### 4.5 Comportement

- **Hover sur le trigger** → apparition après 300ms de délai (évite les apparitions involontaires)
- **Unhover du trigger** → disparition immédiate
- **Focus clavier** sur le trigger → tooltip visible
- **Escape** → ferme le tooltip si ouvert par focus
- **Transition** : `opacity 180ms cubic-bezier(0.4, 0, 0.2, 1)` combiné avec `transform: translateY(-2px) → translateY(0)` en 180ms
- **Accessibilité** : `aria-describedby` sur le trigger pointant vers l'id du tooltip

### 4.6 Placement automatique

Le tooltip doit se positionner automatiquement du côté où il y a de l'espace (pas de débordement du viewport). Si placé en `bottom` mais qu'il dépasse, il bascule en `top`, etc. Une bibliothèque comme Floating UI (Popper) fait ça très bien si elle est déjà présente dans le projet.

---

## 5. Icônes métadonnées — référentiel complet

### 5.1 Règle de cohérence doc/tâche

**Les métadonnées partagées entre document et tâche utilisent la même icône.** Cette règle est **absolue** et doit être ajoutée dans `agents.md`.

### 5.2 Tableau complet

| Donnée                            | Icône Material           | Contextes                       | Notes                                                                                |
| --------------------------------- | ------------------------ | ------------------------------- | ------------------------------------------------------------------------------------ |
| **Document générique**            | `article`                | Header sommaire, cartes         | Icône du concept Document                                                            |
| **Type textuel**                  | `article`                | Sub-chip header, miniature      | Même glyphe que le concept (le textuel est l'incarnation canonique)                  |
| **Type iconographique**           | `image_inset`            | Sub-chip header, miniature      | Légèrement grossie (14px au lieu de 13px) pour lisibilité                            |
| **Structure simple**              | `crop_square`            | Sub-chip header                 |                                                                                      |
| **Structure perspectives**        | `view_column_2`          | Sub-chip header                 | Identique à « deux temps » (structure multi-colonnes)                                |
| **Structure deux temps**          | `view_column_2`          | Sub-chip header                 | Identique à « perspectives »                                                         |
| **Type de source**                | — (aucune icône)         | Badge Source                    | Label « Source » en gras + valeur en regular, pas d'icône                            |
| **Auteur**                        | `person`                 | Footer, rail, miniature         | Identique tâche                                                                      |
| **Date de création**              | `calendar_today`         | Footer, rail, miniature         | Identique tâche                                                                      |
| **Date de mise à jour**           | `history`                | Footer, rail, miniature         | Horloge avec flèche retour                                                           |
| **Utilisation (N tâches)**        | `link`                   | Footer, rail, miniature         | Chaîne de liens                                                                      |
| **Niveaux**                       | `school`                 | Badge classification            | Identique tâche                                                                      |
| **Disciplines**                   | `menu_book`              | Badge classification            | Identique tâche                                                                      |
| **Aspects de société**            | `deployed_code`          | Badge classification (accumulé) | Identique tâche. Cube 3D.                                                            |
| **Ancrage temporel**              | `anchor`                 | Badge référencement, tooltip    | Concept signature du produit, accent teal                                            |
| **Période historique**            | `PeriodeIcon` composite  | Sub-chip header                 | `calendar_today` + `line_end_arrow_notch`. Composant existant orphelin — à brancher. |
| **Connaissances**                 | `lightbulb`              | Label section, badge miniature  | Accent teal                                                                          |
| **Hiérarchie badge connaissance** | `keyboard_return` flippé | Séparateur dans badge-knowledge | `transform: scaleX(-1)`, couleur ink-4                                               |

### 5.3 Catégorie textuelle — icônes par valeur

| ID                             | Label                           | Icône          |
| ------------------------------ | ------------------------------- | -------------- |
| `documents_officiels`          | Documents officiels             | `gavel`        |
| `ecrits_personnels`            | Écrits personnels               | `edit_note`    |
| `presse_publications`          | Presse et publications          | `newspaper`    |
| `discours_prises_parole`       | Discours et prises de parole    | `campaign`     |
| `textes_savants`               | Textes savants                  | `menu_book`    |
| `donnees_statistiques`         | Données statistiques            | `bar_chart`    |
| `textes_litteraires_culturels` | Textes littéraires et culturels | `auto_stories` |
| `autre`                        | Autre                           | `article`      |

### 5.4 Catégorie iconographique — icônes par valeur

| ID                   | Label                | Icône          |
| -------------------- | -------------------- | -------------- |
| `carte`              | Carte                | `map`          |
| `photographie`       | Photographie         | `photo_camera` |
| `peinture`           | Peinture             | `palette`      |
| `dessin_gravure`     | Dessin / gravure     | `draw`         |
| `affiche_caricature` | Affiche / caricature | `image`        |
| `planche_didactique` | Planche didactique   | `grid_view`    |
| `objet_artefact`     | Objet / artefact     | `inventory_2`  |
| `autre`              | Autre                | `image_inset`  |

### 5.5 Distinction sémantique `anchor` vs `PeriodeIcon`

**Important** : ce sont **deux concepts différents** qui coexistent parfois dans la même vue :

- **`anchor` → Ancrage temporel** (`repere_temporel` du document) : un point précis d'ancrage pour le moteur de comparaisons. Concept signature interne du produit.
- **`PeriodeIcon` → Période historique** : premier niveau du référentiel PFEQ (ex. « L'évolution de la société coloniale sous l'autorité de la métropole française », dates chronologiques « De 1608 à 1760 »). Concept du programme officiel.

Dans le sommaire du document :

- La **période historique** (macro, cadre PFEQ) est dans les **sub-chips du header**
- L'**ancrage temporel** (précis, interne) est dans le **groupe référencement de la colonne droite**

---

## 6. Branchement à l'existant

### 6.1 Instructions pour l'agent

**Avant de coder**, identifier dans le codebase :

1. **Composants actuels à remplacer** :
   - Sommaire document actuel (dans `components/documents/` ou équivalent) — à réécrire complètement
   - Miniature(s) document — il en existe **trois variantes** à consolider en une seule :
     - Miniature de « Mes documents » (liste avec boutons Voir/Supprimer visibles)
     - Miniature de Profil (liste minimaliste)
     - Miniature de Banque (grille en cartes)

2. **Composants primitifs à réutiliser** :
   - `MetaChip`, `MetaPill` pour les badges
   - `StatusBadge` pour les pills publié/brouillon
   - `PeriodeIcon` (composant orphelin à brancher enfin)
   - `SectionLabel` pour les titres de section
   - `IconBadge` si pertinent (probablement pas dans ce contexte)

3. **Libellés existants** à chercher dans `lib/ui/ui-copy.ts` et `docs/UI-COPY.md` :
   - Si absents, créer la section `DOCUMENT_SOMMAIRE_COPY` ou équivalent
   - Si « Ancrage temporel » n'existe pas, l'ajouter comme constante

4. **Types TypeScript** à consulter :
   - `DocumentFiche` (lib/fiche/types)
   - `DocumentSlotData` (état wizard)
   - `RendererDocument` (type canonique)
   - Référentiels : niveaux, disciplines, aspects de société, catégories, connaissances

### 6.2 Ce qui change

- **Sommaire document** : nouveau layout 2 colonnes, pulse de l'étape en cours, badges auto-portés
- **Miniature document** : consolidation en un seul composant, 3 variantes de props pour les 3 contextes
- **Tooltip** : nouveau composant primitive à créer si inexistant
- **Libellé « Ancrage temporel »** : introduction d'un nouveau terme dans le vocabulaire produit
- **Compétence disciplinaire → Connaissances** : sur un document c'est « Connaissances » (pas « Compétence disciplinaire »), car un document porte des connaissances, pas des compétences

### 6.3 Ce qui ne change pas

- Types et enums (DocumentFiche, DocumentSlotData, RendererDocument, etc.)
- Colonnes DB (`repere_temporel` reste `repere_temporel` en base, seul le label UI change)
- State management du wizard (reducer, context, URL params)
- Pipeline de rendu imprimé (hors scope)
- Signatures des handlers des composants existants

### 6.4 Glyphes Material à s'assurer de charger

Vérifier la disponibilité dans la police Material Symbols Outlined :

- Concept doc : `article`, `image_inset`, `crop_square`, `view_column_2`
- Métadonnées : `person`, `calendar_today`, `history`, `link`, `school`, `menu_book`, `deployed_code`, `anchor`, `lightbulb`
- Séparateur badge connaissance : `keyboard_return`
- Tooltip info : `info`
- Catégories textuelles : `gavel`, `edit_note`, `newspaper`, `campaign`, `bar_chart`, `auto_stories`
- Catégories iconographiques : `map`, `photo_camera`, `palette`, `draw`, `image`, `grid_view`, `inventory_2`

### 6.5 Checklist avant de clore l'implémentation

**Sommaire détaillé** :

- [ ] Fond blanc pur dans tout le panneau (plus de fond gris)
- [ ] Séparation panneau gauche/droite par bordure verticale 1px
- [ ] Topnav de `SPEC-TOPNAV-PREVIEW-WIZARD.md` présente au-dessus
- [ ] Layout 2 colonnes 1.25fr / 1fr, gap 24px
- [ ] Header : statut pill + titre h1 24px tight + sub-chips (type · structure · période)
- [ ] Pulse de la section highlightée via animation CSS `zonePulse`, pas de badge texte
- [ ] Colonne gauche : contenu du document + arbre des connaissances
- [ ] Colonne droite : 3 groupes de badges séparés par margin-top 14px, sans titres de section
- [ ] Ordre des badges dans colonne droite respecté (Classification → Référencement → Informations)
- [ ] Badge aspects accumulés dans UNE pill avec séparateur `·`
- [ ] Badge source avec label gras + valeur regular, pas d'icône
- [ ] Badge ancrage avec icône anchor + date, pas de mot « Ancrage »
- [ ] Badge auteur cliquable accent teal avec underline dotted
- [ ] Tout tient dans le viewport sans scroll

**Miniature unifiée** :

- [ ] Un seul composant avec props contextuelles (propriétaire / profil / banque)
- [ ] Format liste uniquement, plus de grille
- [ ] Glyphe 48×48 pour textuel, miniature d'image 48×48 pour iconographique
- [ ] Kebab absolute top-right 10px/10px, opacity 0 → 1 au hover
- [ ] Ordre des badges : Discipline → Niveaux → PériodeIcon → Aspects → Connaissance (2 derniers niveaux)
- [ ] Badge connaissance avec parent + chevron keyboard_return flippé + feuille (même poids, même couleur)
- [ ] Date mise à jour complète (« Mis à jour le 15 avril 2026 »)
- [ ] Hover de la ligne : fond panel-alt, cursor pointer
- [ ] Clic sur la ligne → vue détaillée
- [ ] Règles par contexte respectées (statut / auteur / utilisation)

**Tooltip** :

- [ ] Primitive unique créée (ou composant existant enrichi)
- [ ] Variante light card avec ombre généreuse, pas dark
- [ ] Titre optionnel avec icône accent
- [ ] Corps requis
- [ ] Exemples optionnels avec chips monospace et séparateur tirets
- [ ] Délai d'apparition 300ms, transition 180ms
- [ ] Placement automatique (bottom par défaut, bascule si hors viewport)
- [ ] Accessible au clavier + aria-describedby
- [ ] Utilisé sur le label « Ancrage temporel » dans le formulaire wizard

**Icônes** :

- [ ] Règle cohérence doc/tâche appliquée (mêmes icônes partout)
- [ ] PeriodeIcon (composite orphelin) est enfin branché
- [ ] Distinction anchor vs PeriodeIcon respectée sémantiquement
- [ ] Catégorie textuelle utilise icône dynamique selon la valeur
- [ ] Catégorie iconographique utilise icône dynamique selon la valeur

**Copie & vocabulaire** :

- [ ] « Ancrage temporel » comme libellé officiel dans lib/ui/ui-copy.ts
- [ ] « Connaissances » (pas « Compétence disciplinaire ») pour un document
- [ ] Tooltip sur Ancrage temporel rédigé

---

_Dernière mise à jour : 2026-04-18_
