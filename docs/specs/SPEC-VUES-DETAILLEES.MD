# SPEC-VUES-DETAILLEES.md

> **Spécification de design — Vues détaillées Document / Tâche / Épreuve**
>
> Décrit le layout commun, les composants partagés, le contenu de chaque vue, les interactions et les états. Complémentaire à `DOMAIN_MODEL.md` (modèle métier) et `DESIGN-SYSTEM.md` (tokens visuels).
>
> **Convention de nommage** : suit la section « Convention de nommage et structure des fichiers » de `claude.md`. Tous les noms de fichiers et composants respectent les règles établies.

---

## 1. Principe directeur

Un seul système de layout pour les trois entités. Le Document est l'unité atomique. La Tâche compose des Documents. L'Épreuve compose des Tâches. Le design est fractal : chaque niveau **délègue** vers le bas sans re-rendre (INV-R2).

Les trois vues partagent :
- La **nav bar** (barre d'actions)
- Le **header** (titre + statut)
- Les **onglets** (Sommaire / Aperçu de l'imprimé)
- Le **layout** central + rail droit
- L'accès à la **visionneuse** plein écran

Seul le **contenu** de chaque slot varie selon l'entité.

---

## 2. Arborescence des fichiers

### Composants partagés

```
components/partagees/vue-detaillee/layout.tsx            → VueDetailleeLayout
components/partagees/vue-detaillee/barre-actions.tsx      → BarreActions
components/partagees/vue-detaillee/onglets.tsx            → Onglets
components/partagees/vue-detaillee/rail-layout.tsx        → RailLayout
components/partagees/panneau-lateral/index.tsx            → PanneauLateral
components/partagees/visionneuse/index.tsx               → Visionneuse
```

### Document

```
components/document/vue-detaillee/index.tsx              → DocumentVueDetaillee
components/document/vue-detaillee/rail.tsx                → DocumentRail
components/document/vue-detaillee/sections/hero.tsx       → SectionHero
components/document/vue-detaillee/sections/contenu.tsx    → SectionContenu
components/document/panneau-detail/index.tsx              → DocumentPanneauDetail
```

### Tâche

```
components/tache/vue-detaillee/index.tsx                 → TacheVueDetaillee
components/tache/vue-detaillee/rail.tsx                   → TacheRail
components/tache/vue-detaillee/sections/hero.tsx          → SectionHero
components/tache/vue-detaillee/sections/consigne.tsx      → SectionConsigne
components/tache/vue-detaillee/sections/documents.tsx     → SectionDocuments
components/tache/vue-detaillee/sections/guidage.tsx       → SectionGuidage
components/tache/vue-detaillee/sections/corrige.tsx       → SectionCorrige
components/tache/vue-detaillee/sections/grille.tsx        → SectionGrille
components/tache/panneau-detail/index.tsx                 → TachePanneauDetail
components/tache/miniature-epreuve/index.tsx              → TacheMiniatureEpreuve
```

### Épreuve

```
components/epreuve/vue-detaillee/index.tsx                → EpreuveVueDetaillee
components/epreuve/vue-detaillee/rail.tsx                  → EpreuveRail
components/epreuve/vue-detaillee/sections/hero.tsx         → SectionHero
components/epreuve/vue-detaillee/sections/pile-taches.tsx  → SectionPileTaches
```

### Hooks partagés

```
hooks/partagees/use-copier-lien.ts                       → useCopierLien
hooks/partagees/use-retour-contextuel.ts                 → useRetourContextuel
```

**Total : 29 fichiers.**

---

## 3. Layout partagé — `VueDetailleeLayout`

### Props

```tsx
interface VueDetailleeLayoutProps {
  layout: 'sidebar' | 'stacked';
  barreActions: ReactNode;
  header: ReactNode;
  ongletActif: 'sommaire' | 'apercu-imprime';
  surChangerOnglet: (onglet: 'sommaire' | 'apercu-imprime') => void;
  contenuPrincipal: ReactNode;
  rail: ReactNode;
}
```

### Structure

```
┌─────────────────────────────────────────────────────────┐
│  BarreActions                                            │
├─────────────────────────────────────────────────────────┤
│  Header (titre + statut + lignée)                        │
├─────────────────────────────────────────────────────────┤
│  Onglets : [Sommaire] [Aperçu de l'imprimé]             │
├────────────────────────────────────┬────────────────────┤
│                                    │                    │
│  Contenu principal                 │  Rail              │
│  (scrollable)                      │  (sticky)          │
│                                    │                    │
└────────────────────────────────────┴────────────────────┘
```

### Comportement selon `layout`

| Prop | `'sidebar'` (page complète) | `'stacked'` (panneau / wizard) |
|------|----------------------------|-------------------------------|
| Grid | `grid-template-columns: minmax(0, 1fr) 300px` | `grid-template-columns: 1fr` |
| Rail | Colonne droite, `position: sticky; top: var(--topbar-height)` | Empilé sous le contenu principal |
| Gap | `gap: var(--space-5)` (32px) | `gap: var(--space-4)` (24px) |
| Breakpoint | En dessous de `lg` → passe à `stacked` automatiquement | Toujours `stacked` |

### Tokens CSS utilisés

- Fond page : `bg-bg` — `var(--color-bg)` = `hsl(210, 25%, 98%)`
- Fond rail : `bg-panel-alt` — `var(--color-panel-alt)` = `hsl(210, 20%, 96%)`
- Bordure séparation rail : `border-l border-border` — `var(--color-border)` = `hsl(215, 20%, 85%)`
- Texte principal : `text-deep` — `var(--color-deep)` = `hsl(220, 40%, 18%)`
- Texte secondaire : `text-steel` — `var(--color-steel)` = `hsl(215, 30%, 35%)`
- Texte tertiaire : `text-muted` — `var(--color-muted)` = `hsl(215, 15%, 60%)`

---

## 4. Barre d'actions — `BarreActions`

### Props

```tsx
interface BarreActionsProps {
  estAuteur: boolean;
  estEpinglee: boolean;
  entite: 'document' | 'tache' | 'epreuve';
  retour: { chemin: string; libelle: string };
  surModifier: () => void;
  surEpingler: () => void;
  surCopierLien: () => void;
  surOuvrirVisionneuse: () => void;
  surSupprimer: () => void;
  surAjouterEpreuve?: () => void; // tâche visiteur seulement
}
```

### Structure visuelle

```
[ ← Retour à {contexte} ]                    [ icônes ] | [ Primaire ] (⋯)
```

### Actions par rôle et entité

**Propriétaire** (identique pour les 3 entités) :

| Position | Action | Icône Material | Notes |
|----------|--------|----------------|-------|
| Utilitaire 1 | Copier le lien | `link` | Popover « Lien copié » pendant 1.8s |
| Utilitaire 2 | Ouvrir visionneuse | `print` | Ouvre la `Visionneuse` plein écran |
| Séparateur | — | — | `border-l border-border` hauteur 20px |
| **Primaire** | **Modifier** | `edit_document` | Bouton plein `bg-accent text-white` |
| Menu ⋯ | Supprimer | `delete` | `text-muted hover:text-error hover:bg-error/5` |

**Visiteur — Document et Épreuve** :

| Position | Action | Icône Material | Notes |
|----------|--------|----------------|-------|
| Utilitaire 1 | Copier le lien | `link` | Popover « Lien copié » |
| Utilitaire 2 | Ouvrir visionneuse | `print` | Ouvre la `Visionneuse` |
| Séparateur | — | — | |
| **Primaire** | **Épingler** | `push_pin` | Bouton plein `bg-accent` quand non épinglé |
| **Primaire (épinglé)** | **Épinglé** | `push_pin` (rempli) | Bouton outline `border-accent text-accent bg-panel` |

**Visiteur — Tâche** :

| Position | Action | Icône Material | Notes |
|----------|--------|----------------|-------|
| Utilitaire 1 | Copier le lien | `link` | |
| Utilitaire 2 | Ouvrir visionneuse | `print` | |
| Utilitaire 3 | Épingler | `push_pin` | Icône toggle (outline/rempli) |
| Séparateur | — | — | |
| **Primaire** | **Ajouter à une épreuve** | `playlist_add` | Bouton plein `bg-accent` |

### Dimensions

- Boutons icônes : `h-11 w-11` (44px tactile), `rounded-md` (`var(--radius-md)` = 8px)
- Bouton primaire : `h-11 px-4 rounded-md`, texte `text-sm font-medium`
- Séparateur : `w-px h-5 bg-border mx-1`
- Gap entre boutons : `gap-1.5` (6px)

### Bouton retour

- Style : `text-steel hover:text-deep hover:bg-surface`, pas de bordure
- Icône : `chevron_left` (Material Symbols)
- Libellé contextuel via `useRetourContextuel` :
  - Provenance `/bank/*` → « Retour à la banque »
  - Provenance `/documents` → « Retour à mes documents »
  - Provenance `/questions` → « Retour à mes tâches »
  - Provenance `/evaluations` → « Retour à mes épreuves »
  - Provenance inconnue → « Retour »
- Implémentation : `history.state.from` avec fallback

### Feedback copie de lien

- Au clic sur l'icône `link` : popover noir `bg-deep text-white` apparaît au-dessus du bouton
- Contenu : icône `check` en `text-success` + texte « Lien copié » en `text-sm font-medium`
- Flèche CSS vers le bas
- Durée : 1.8s puis disparition
- Implémentation : `useCopierLien` avec `navigator.clipboard.writeText` + state `copie: boolean` + `setTimeout`

---

## 5. Header

### Structure commune

```tsx
// Ligne 1 : statut + version + lignée
<div>
  <StatusBadge statut={estPubliee ? 'publiee' : 'brouillon'} />
  {version > 1 && <span className="text-xs text-muted">v{version}</span>}
  {sourceDocumentId && <LigneeSource ... />}
</div>

// Ligne 2 : titre
<h1 className="text-2xl font-semibold text-deep leading-tight">
  {titre}
</h1>

// Ligne 3 : contexte
<p className="text-sm text-steel">
  {typeEntite} · {niveauLabel} · {disciplineLabel}
</p>
```

### StatusBadge

| Statut | Fond | Texte | Icône |
|--------|------|-------|-------|
| Publiée | `bg-success/15` | `text-success` | `check_circle` (rempli) |
| Brouillon | `bg-warning/15` | `text-warning` | `construction` |

Dimensions : `px-2.5 py-0.5 rounded-full text-xs font-medium`, pastille de couleur 6px devant le texte.

### LignéeSource (document uniquement)

Visible quand `source_document_id IS NOT NULL`. Affiche :
- Icône `link` en `text-muted`
- « Cloné de **{auteur source}** » — nom cliquable en `text-accent` avec underline dotted
- Badge « modifié » si `is_modified === true` : `bg-warning/15 text-warning rounded-full text-xs px-2`

---

## 6. Onglets — `Onglets`

### Structure

```
[  ≡ Sommaire  ]  [ 🖨 Aperçu de l'imprimé  ]
```

- Icône + texte pour chaque onglet
- Sommaire : icône `list` (Material Symbols)
- Aperçu de l'imprimé : icône `print` (Material Symbols)
- Onglet actif : `text-deep border-b-2 border-deep font-medium`
- Onglet inactif : `text-steel border-b-2 border-transparent`
- Séparation : `border-b border-border` sur le conteneur
- Taille texte : `text-sm`
- Espacement entre onglets : `mr-5` (20px)

---

## 7. Rail latéral — `RailLayout`

### Structure commune

Le rail est une **colonne structurelle**, pas une carte. Pas de fond distinct, pas de bordure autour du tout. Séparation avec le contenu principal via `border-l border-border`.

Chaque section du rail :
- Titre de section : `text-[10px] uppercase tracking-wider font-medium text-muted mb-1.5`
- Séparateur entre sections : `border-b border-border/50 py-3`
- Première section : `pt-0`
- Dernière section : `border-b-0`

### Ligne de métadonnée (`MetaRowSimple`)

```
grid-template-columns: 80px 1fr
gap: 8px
```

- Label : `text-[11px] text-muted`
- Valeur : `text-xs text-deep leading-relaxed`

### Arbre hiérarchique (CD, Connaissances)

Pour les compétences disciplinaires et les connaissances, le rail affiche un arbre **toujours visible** — pas de chevron dépliable, pas de collapse.

- Titre de section : label en `text-[10px] uppercase` (ex: « Compétence disciplinaire »)
- Chaque niveau de l'arbre est indenté de `pl-3` (12px) par rapport au parent
- Texte des nœuds : `text-xs text-deep leading-relaxed`
- Pas de dédoublement : le titre de section est le label, le premier nœud de l'arbre est la donnée (pas le même texte deux fois)

---

## 8. Vue détaillée — Document

### Contenu principal (onglet Sommaire)

La zone centrale affiche le document en **mode lecture** — pas le rendu imprimé canonique (qui est dans l'autre onglet).

#### SectionContenu

**Document textuel (structure simple)** :

```
┌──────────────────────────────────────┐
│ bg-panel-alt rounded-lg p-5          │
│ ┌──────────────────────────────────┐ │
│ │ bg-panel border border-border    │ │
│ │ rounded-md p-5                   │ │
│ │                                  │ │
│ │ Titre (text-base font-medium)    │ │
│ │                                  │ │
│ │ Contenu HTML                     │ │
│ │ (text-sm leading-relaxed)        │ │
│ │                                  │ │
│ │ ─ ─ ─ border-t dashed ─ ─ ─     │ │
│ │ SOURCE · citation italique       │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

**Document iconographique** :

Même structure, mais avec miniature de l'image (max `220px × 160px`) à gauche et légende + source à droite en layout flex horizontal.

- Tag de catégorie (ex: « Carte ») en bas-droite de la miniature : `bg-panel/90 text-muted text-[10px] font-medium px-1.5 py-0.5 rounded`
- Légende : label `text-[10px] uppercase text-muted` puis texte en `text-xs text-deep`
- Position légende : `text-[10px] text-muted` sous la légende
- Source : après `border-t border-dashed border-border`, label + citation en `text-[11px] text-steel italic`

**Documents à perspectives (2-3 éléments)** :

Chaque élément dans sa propre carte à l'intérieur du conteneur Sand. Label auteur visible. Layout vertical empilé.

**Documents à deux temps (2 éléments)** :

Même principe, avec label `repere_temporel` et `sous_titre` visibles par élément.

#### Indicateur de mode

Sous le conteneur Sand :
- Icône `info` en `text-muted` (14px)
- Texte `text-[11px] text-muted` : « Aperçu de lecture. Voir l'onglet **Aperçu de l'imprimé** pour le rendu exact. »

### Contenu principal (onglet Aperçu de l'imprimé)

Affiche le document avec son **anatomie canonique imprimée** :
- Bloc numéro noir massif (30×30px, `bg-deep text-white font-bold text-lg`) collé au titre
- Titre en Arial bold (`font-family: Arial, Helvetica, sans-serif`)
- Cadre `border border-deep` sans radius
- Corps en Arial justifié
- Auteur en italique aligné à droite dans le cadre
- Source en Arial 10px sous le cadre

Le tout rendu par le composant canonique `DocumentCard` en mode `"print"` / via le pipeline `ApercuImpression`.

Note sous le document : « Le numéro **1** est provisoire. Il sera recalculé selon le rang du document dans chaque épreuve. »

### DocumentRail

| Section | Données | Composant |
|---------|---------|-----------|
| **Identité** | type, structure, catégorie (textuelle/iconographique), source_type | `MetaRowSimple` |
| **Repère temporel** | `repere_temporel`, `annee_normalisee` | `MetaRowSimple` × 2 + note « N'apparaît jamais sur la copie de l'élève » |
| **Indexation** | niveaux, discipline, aspects de société | `MetaChip` dans `ChipBar` — même style pour tous (primitives existantes, pas de couleur par aspect) |
| **Connaissances** | Liste verticale des connaissances | Arbre toujours visible, même pattern que CD — pas de chevron |
| **Utilisation** | « N tâches » avec lien « Voir » | Encadré `bg-panel-alt rounded-md` |
| **Auteur** | Avatar initiales + nom + école + dates | `MetaRowSimple` |

> **Aucune nouvelle primitive visuelle pour le rail.** Tous les badges utilisent les composants existants : `MetaChip`, `ChipBar`, `MetaRowSimple`, `IconBadge`, `StatusBadge`, `SectionCD`, `SectionConnaissances`. Même apparence partout — bordure `border-border`, fond `bg-panel`, icône Material en `text-accent`, texte en `text-deep`.

---

## 9. Vue détaillée — Tâche

### Contenu principal (onglet Sommaire)

Sections empilées verticalement :

#### SectionHero (réutilisé de l'existant)

- Meta-pills OI + comportement : `MetaChip` avec glyphe Material
- Consigne HTML complète : `ContentBlock` avec résolution des pastilles doc

#### SectionDocuments

Documents référencés affichés comme **cartes cliquables** (pas le rendu imprimé complet).

```
┌──────────────────────────────────────────────┐
│ [miniature 36×36]  Doc A — Le régime...      │
│                    Iconographique · Carte   > │
└──────────────────────────────────────────────┘
```

- Icône type (36×36, `bg-surface rounded`, glyphe `article` ou `image_inset`)
- Titre : `text-xs font-medium text-deep`
- Sous-titre : `text-[10px] text-muted` (type + catégorie)
- Chevron `chevron_right` en `text-muted` à droite
- Bordure : `border border-border rounded-md`
- Au hover : `border-accent bg-accent/5`
- **Au clic : ouvre `DocumentPanneauDetail`** (slide-over pleine hauteur)

#### SectionGuidage

- Visible seulement si `guidage` non vide
- Label `text-[10px] uppercase text-muted` + icône `tooltip_2`
- Contenu HTML en `text-steel italic`

#### SectionCorrige

- Visible seulement si `corrige` non vide
- Label + icône `task_alt`
- Contenu HTML en `text-corrige` (`--color-corrige: #a32d2d`)

#### SectionGrille

- Label + icône `table`
- Grille complète via `GrilleEvalTable` (composant existant, responsive avec zoom CSS)
- Points max affichés dans le label : « Grille d'évaluation · 3 points »

### TacheRail

| Section | Données | Notes |
|---------|---------|-------|
| **IconBadge OI** | Glyphe OI grand format | **Non négociable.** 52px mobile, 64px desktop. Animation `icon-badge-in`. Ancre l'association visuelle OI ↔ icône. |
| **Paramètres** | Niveau, discipline, aspects de société, réalité sociale, période | `MetaChip` dans `ChipBar` — primitives existantes, même style pour tous |
| **Outil d'évaluation** | Nom de la grille + « N points » | `MetaRowSimple` |
| **Compétence disciplinaire** | Arbre hiérarchique : compétence → composante → critère | Arbre toujours visible (pas de chevron dépliable). Indent progressif par niveau (`pl-3` par profondeur). Titre de section = label « Compétence disciplinaire », pas de dédoublement du premier nœud. Composant existant `SectionCD`. |
| **Connaissances** | Arbre hiérarchique : chapitre → section → connaissance | Même pattern : arbre toujours visible, indent progressif, pas de chevron. Titre de section = label « Connaissances ». Composant existant `SectionConnaissances`. |
| **Nombre de documents** | « N documents » | `MetaRowSimple` avec icône `article` |
| **Auteur** | Avatar + nom + dates | `MetaRowSimple` |
| **Statut** | Publiée / Brouillon | `StatusBadge` |

### Données non affichées en vue détaillée

`version`, `version_updated_at`, `last_major_trigger`, `nb_lignes`, `non_redaction_data`, `is_archived`, `conception_mode`, `consigne_search_plain`

---

## 10. Vue détaillée — Épreuve

### Colonnes manquantes à ajouter à la table `evaluations`

La table actuelle (8 colonnes) est insuffisante pour la vue détaillée. Colonnes à ajouter :

| Champ | Type | Nullable | Notes |
|-------|------|----------|-------|
| `niveau_id` | INT | oui | FK → niveaux(id) |
| `discipline_id` | INT | oui | FK → disciplines(id) |
| `en_tete` | JSONB | oui | Contenu de l'en-tête (école, groupe, date, etc.) |
| `pied_page` | TEXT | oui | Texte du pied de page |
| `mode_impression` | TEXT | non (défaut `'sommatif-standard'`) | `'formatif'` / `'sommatif-standard'` / `'epreuve-ministerielle'` |

### Contenu principal (onglet Sommaire)

#### SectionPileTaches

Pile verticale de `TacheMiniatureEpreuve`, numérotées.

```
┌─────────────────────────────────────────────────────────┐
│  1   ┌──────────────────────────────────────────────┐   │
│      │ Consigne tronquée (2 lignes max)...          │   │
│      │                                              │   │
│      │ [OI pill] [Comportement pill]                │   │
│      │ [Connaissance ciblée pill]                   │   │
│      │ ────────────────────────────────────────────  │   │
│      │ 3 documents · G. Lévesque Lemaire    3 pts   │   │
│      └──────────────────────────────────────────────┘   │
│                                                         │
│  2   ┌──────────────────────────────────────────────┐   │
│      │ ...                                          │   │
│      └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

Note sous la pile : `text-[11px] text-muted` — « Cliquez sur une tâche pour voir ses détails. »

**Au clic sur une carte** : ouvre `TachePanneauDetail` en slide-over pleine hauteur.

### TacheMiniatureEpreuve

#### Props

```tsx
interface TacheMiniatureEpreuveProps {
  rang: number;
  donnees: DonneesTache;
  surClic: () => void;
}
```

#### Structure

| Zone | Contenu | Style |
|------|---------|-------|
| **Numéro (slot fixe)** | Chiffre du rang | `text-xl font-medium text-muted` — largeur fixe 36px |
| **Consigne** | Tronquée à 2 lignes (80 chars) | `text-xs text-deep leading-relaxed`, `-webkit-line-clamp: 2` |
| **OI** | Titre de l'OI | `MetaChip` — style standard (même que partout ailleurs) |
| **Comportement** | Énoncé du comportement | `MetaChip` — style standard |
| **Connaissance** | Dernier niveau du breadcrumb seulement | `MetaChip` — style standard |
| **Footer** | Nb documents · nom auteur | `text-[10px] text-muted`, aligné à gauche |
| **Points** | Max points de la grille | `text-[10px] font-medium text-deep`, aligné à droite |

#### Interactions

- Bordure : `border border-border rounded-md`
- Hover : `border-accent bg-accent/5 cursor-pointer`
- Transition : `transition-colors duration-150`

### EpreuveRail

| Section | Données | Notes |
|---------|---------|-------|
| **Compteurs** | Nombre de tâches + total de points | Deux blocs en grid 2 colonnes, fond `bg-panel-alt rounded-md p-2.5`. Points en `text-xl font-medium`. Sous les blocs : « N documents au total » en `text-[11px] text-steel`. |
| **Impression** | `mode_impression` label + description feuillets | `MetaRowSimple` |
| **En-tête** | Contenu de `en_tete` (école, groupe, etc.) | `text-[11px] text-deep leading-relaxed` |
| **Indexation** | Niveau (chip), discipline, aspects de société | `MetaChip` dans `ChipBar` |
| **Auteur** | Avatar + nom + dates | `MetaRowSimple` |
| **Statut** | Publiée / Brouillon | `StatusBadge` |

### Calcul du total de points

```
total = somme(
  pour chaque tâche dans l'épreuve :
    lookup comportement_id → outil_evaluation → grilles-evaluation.json → bareme.max_points
)
```

Le `bareme.max_points` est déjà stocké dans le JSON — pas de dérivation nécessaire.

---

## 11. Panneau latéral (slide-over) — `PanneauLateral`

### Comportement

- **Ouverture** : slide depuis la droite, 400px de large desktop, pleine largeur mobile
- **Backdrop** : `bg-deep/30` sur le reste de la page
- **Fermeture** : bouton `close` en haut-droite + clic backdrop + touche `Escape`
- **Animation** : `transform translateX(100%) → translateX(0)`, `transition-transform duration-300 ease-out`
- **Focus trap** : oui
- **Z-index** : au-dessus du rail mais sous les modales

### Contenu

Le panneau rend la vue détaillée de l'entité enfant en `layout="stacked"` :

```tsx
// Épreuve → clic tâche → panneau tâche
<PanneauLateral surFermer={fermer}>
  <TacheVueDetaillee id={tacheId} layout="stacked" />
</PanneauLateral>

// Tâche → clic document → panneau document
<PanneauLateral surFermer={fermer}>
  <DocumentVueDetaillee id={documentId} layout="stacked" />
</PanneauLateral>
```

En `layout="stacked"`, la vue détaillée empile tout verticalement : header → onglets → contenu → rail (devenu inline). La barre d'actions est simplifiée (pas de bouton Modifier dans le panneau).

---

## 12. Visionneuse — `Visionneuse`

### Comportement

- **Overlay plein écran** : `position: fixed; inset: 0; z-index: 50`
- **Fond** : `bg-deep/95` (quasi-noir)
- **Un feuillet à la fois**, centré horizontalement et verticalement
- **Navigation** : flèches gauche/droite + touches clavier ← →
- **Fermeture** : bouton `close` en haut-droite + touche `Escape`
- **Pas de scroll** : chaque feuillet est dimensionné pour tenir dans le viewport (`object-contain`)

### Barre d'outils (en bas)

```
┌──────────────────────────────────────────────────────┐
│  Fermer                    ‹ 1/3 ›      Télécharger  │
└──────────────────────────────────────────────────────┘
```

- Fond : `bg-deep/80 backdrop-blur`
- Bouton Fermer : `text-white/70 hover:text-white` + texte « Fermer »
- Pagination : `text-white font-medium` — flèches + indicateur « 1/3 »
- Bouton Télécharger : `bg-accent text-white rounded-md h-11 px-4` — texte « Télécharger le PDF »

### Contenu par entité

| Entité | Nombre de feuillets | Contenu |
|--------|---------------------|---------|
| Document | 1 | Rendu imprimé canonique (bloc noir + cadre) |
| Tâche | 1-2 selon variante | Feuillet(s) via `ApercuImpression` |
| Épreuve | 1-3 selon `mode_impression` | Feuillets via `ApercuImpression` (dossier doc / questionnaire / cahier réponses) |

### Dépendance

Utilise **Embla Carousel** (déjà dans le projet) mais avec une implémentation neuve — le carrousel existant dans `components/epreuve/apercu/carrousel.tsx` est buggé et ne sera pas réutilisé.

---

## 13. Onglet « Aperçu de l'imprimé » dans la zone centrale

Quand l'utilisateur est dans l'onglet « Aperçu de l'imprimé » (sans ouvrir la visionneuse), le contenu central affiche le rendu imprimé **inline** :

- Document : rendu canonique complet (bloc noir + titre + cadre + contenu + source)
- Tâche : feuillet(s) empilés verticalement si multi-pages
- Épreuve : feuillets empilés verticalement

Chaque feuillet est rendu à une échelle réduite pour tenir dans la zone centrale (~60-70% de la largeur). Un bouton « Ouvrir dans la visionneuse » permet de passer en plein écran.

Le rendu utilise le même pipeline `ApercuImpression` que la visionneuse — seul le conteneur change.

---

## 14. Invariants respectés

| Invariant | Comment il est respecté |
|-----------|------------------------|
| **INV-R1** | Tout rendu de document passe par `DocumentCard` / `DocumentElementRenderer` — y compris dans `SectionDocuments` de la tâche |
| **INV-R2** | Les renderers d'épreuve et de tâche délèguent. `SectionPileTaches` utilise `TacheMiniatureEpreuve` qui consomme `DonneesTache` sans re-rendre les documents |
| **INV-R4** | Le sommaire du wizard et la vue détaillée utilisent le même composant (`DocumentVueDetaillee` / `TacheVueDetaillee`) avec `layout` différent |
| **INV-R5** | L'aperçu imprimé utilise le même pipeline `ApercuImpression` partout (zone centrale, visionneuse, wizard preview, export PDF) |
| **INV-S2** | Un seul composant par entité pour la vue détaillée, paramétré par `layout` |
| **INV-S4** | Les numéros dans la pile de tâches et dans le rendu imprimé sont dérivés du rang, jamais stockés |

---

## 15. États et cas limites

### Document non publié (brouillon)

- Badge « Brouillon » en ambre dans le header
- Toutes les actions restent disponibles pour le propriétaire
- Un visiteur ne devrait pas voir un brouillon (à gérer côté routing/auth)

### Tâche sans documents

- `SectionDocuments` affiche un `EmptyState` : icône `article`, message « Aucun document associé »

### Tâche sans guidage / sans corrigé

- Les sections correspondantes sont masquées (pas d'empty state, juste absentes)

### Épreuve sans tâches

- `SectionPileTaches` affiche un `EmptyState` : icône `assignment`, message « Aucune tâche dans cette épreuve »
- Compteurs dans le rail : 0 tâches, 0 pts

### Champs non renseignés dans le rail

- Repère temporel vide : afficher « Non renseigné » en `text-muted italic`
- Connaissances vides : masquer la section
- Aspects de société vides : masquer la section

---

## 16. Responsive (< lg)

- Layout passe automatiquement de `sidebar` à `stacked`
- Le rail se déplie sous le contenu principal
- La barre d'actions se contracte : les icônes utilitaires passent dans un menu kebab, seul le bouton primaire reste visible
- La visionneuse reste plein écran (inchangée)
- Le panneau latéral (slide-over) prend la pleine largeur

---

_Dernière mise à jour : 2026-04-17_