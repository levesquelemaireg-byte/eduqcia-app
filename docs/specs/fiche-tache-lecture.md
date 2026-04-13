# Fiche tâche — Detail view en mode lecture

**Statut** : FERMÉ — spec complétée à 100%

> **Date de création** : 11 avril 2026
> **Date de fermeture** : 12 avril 2026

**Projet :** EduQc.IA
**Version :** 1.0
**Date :** 12 avril 2026
**Scope :** Route `/questions/[id]` en mode `lecture`, responsive desktop/tablet/mobile, modal embarqué pour fiches document référencées.
**Hors scope :** Route dédiée `/documents/[id]` en plein écran, modes `thumbnail` et `sommaire` de la fiche tâche, features "Signaler un problème" (v2) et "Exporter en PDF" (implémentation à faire séparément).

---

## Partie I — Décisions de design

Cette partie fixe le vocabulaire visuel et les règles de composition. Elle sert de référence persistante pour toute l'implémentation et pour les specs futures (fiche document, modes sommaire/thumbnail).

### 1. Architecture de la page

La fiche tâche en mode lecture desktop est structurée en trois zones distinctes, de fonctions orthogonales :

**Top navbar sticky, pleine largeur** — chrome global de fiche, contenu strictement identique pour toutes les tâches, aucune contextualisation. Contient le bouton retour à gauche et les actions sur l'item à droite. Hauteur fine, fond blanc, border-bottom subtile.

**Flux principal, colonne gauche ~720px** — contenu narratif séquentiel destiné à la lecture pédagogique. Hero (énoncé de la tâche), puis sections de contenu. L'enseignant scroll ce flux dans l'ordre pour comprendre la tâche comme un tout.

**Rail contextuel, colonne droite ~280px, sticky** — panneau de métadonnées persistant qui reste visible pendant le scroll. Contient uniquement des données structurantes de référence, aucun contenu narratif, aucune action. L'enseignant l'utilise pour maintenir le contexte de classification pendant qu'il lit le flux principal.

Les trois zones sont indépendantes. La navbar ne change jamais. Le flux principal scroll. Le rail est sticky, hauteur naturelle, scroll avec la page si son contenu dépasse le viewport.

### 2. Tokens de couleur

Toutes les couleurs utilisées dans la detail view viennent du design system global. Aucune valeur hardcodée en dehors des tokens ci-dessous.

**Tokens primaires existants :**

| Token                      | HSL                  | Rôle                                                            |
| -------------------------- | -------------------- | --------------------------------------------------------------- |
| `--color-deep`             | `220 40% 18%`        | Texte principal (bleu nuit)                                     |
| `--color-steel`            | `215 30% 35%`        | Texte secondaire                                                |
| `--color-muted`            | `215 15% 60%`        | Texte tertiaire, placeholders                                   |
| `--color-accent`           | `195 70% 45%`        | Couleur de marque teal, CTA, icônes de labels, glyphes de pills |
| `--color-accent-pulse`     | `195 70% 45% / 0.12` | Ring focus                                                      |
| `--color-success`          | `145 55% 40%`        | Statut publié                                                   |
| `--color-bg`               | `210 25% 98%`        | Fond général app                                                |
| `--color-panel`            | `0 0% 100%`          | Blanc — cartes, panneaux, rail                                  |
| `--color-panel-alt`        | `210 20% 96%`        | Gris très clair bleuté — pills, IconBadge, DocCard numéro       |
| `--color-border`           | `215 20% 85%`        | Bordure standard                                                |
| `--color-border-secondary` | `215 22% 78%`        | Bordure plus marquée                                            |

**Token à ajouter :**

| Token             | Valeur    | Rôle                                                                 |
| ----------------- | --------- | -------------------------------------------------------------------- |
| `--color-corrige` | `#A32D2D` | Texte du corrigé et des notes au correcteur (rouge stylo professeur) |

Ce nouveau token est sémantiquement distinct de `--color-error` (qui reste réservé aux erreurs d'interface). Il incarne la convention culturelle pédagogique du stylo rouge du correcteur, utilisée exclusivement dans la section "Production attendue" de la fiche tâche.

### 3. Règles de discipline visuelle

Sept règles à respecter partout dans la detail view, non-négociables :

**Règle 1 — Monochromie teal avec une seule exception sémantique.** Le teal `var(--color-accent)` est la couleur d'accent utilisée partout (SectionLabels, glyphes de pills, IconBadge, boutons primaires, focus, hover). Le rouge `var(--color-corrige)` est réservé exclusivement à la section "Production attendue" (corrigé + notes au correcteur), en typographie seulement — pas de fond rouge, pas de bordure rouge. La couleur rouge est portée par le texte.

**Règle 2 — Deux niveaux de conteneurs maximum.** Niveau 1 : la section elle-même (SectionLabel + contenu), sans décoration. Les sections sont séparées par du whitespace vertical (~48px), pas par des bordures ni des fonds. Niveau 2 : les sous-éléments structurés cliquables (DocCards). Ce sont les seuls composants à avoir un container visible (border 0.5px + radius 12px + fond blanc). Toutes les autres sections du flux sont du texte nu.

**Règle 3 — Trois styles typographiques maximum dans le corps.** Corps de texte (consigne, guidage, corrigé, contenu document), labels structurés (noms de connaissances, critères), métadonnées en pills. L'italique est une exception acceptable pour des accents sémantiques (guidage, notes au correcteur), pas un style concurrent.

**Règle 4 — DocCards sont le seul conteneur fort.** Parce qu'elles représentent des entités distinctes cliquables qui ouvrent un modal. Elles méritent d'être visuellement marquées comme interactives. C'est la seule exception au minimalisme dans le flux principal.

**Règle 5 — Pills uniformes, un seul style partout.** Aucune variante filled/outline concurrente. Un seul look pour toutes les pills du système (voir composant `MetaPill` section 4).

**Règle 6 — Dividers inset dans les sections structurées uniquement.** Jamais entre sections du flux principal. Uniquement à l'intérieur du rail pour séparer les blocs de métadonnées.

**Règle 7 — Whitespace vertical comme séparateur inter-sections.** ~48px entre sections du flux principal. Aucun divider horizontal entre sections.

### 4. Primitives visuelles

Les primitives existantes sont conservées et étendues. Toutes les références ci-dessous pointent vers `lib/fiche/primitives/`.

**`MetaPill`** — étendue, spec figée :

```
display: inline-flex
min-height: 32px
align-items: center
gap: 4px
border-radius: 8px (rounded-lg, pas pill complet)
border: 0 (aucune bordure)
background: var(--color-panel-alt)
padding: 4px 10px
font-size: 12px
font-weight: 700 (bold)
color: var(--color-deep)
icône: font-size 0.9em, color var(--color-accent)
white-space: nowrap (mais wrap au niveau container)
```

Utilisée pour niveau, discipline, aspects de société, chapitre connaissances, opération intellectuelle (overline du hero). Aucune autre variante. Les pills flottent dans des containers `flex-wrap: wrap` qui permettent le passage à la ligne quand une pill est trop longue.

**`IconBadge`** — étendu, spec figée :

```
width: 52px
height: 52px
border-radius: var(--border-radius-lg) (12px)
background: var(--color-panel-alt)
display: flex
align-items: center
justify-content: center
glyphe Material Symbols: color var(--color-accent), taille 26px
```

Utilisé dans le hero à gauche de l'énoncé. Le glyphe est spécifique à l'opération intellectuelle de la tâche, rendu via le composant existant `MaterialSymbolOiGlyph` avec `data-oi-glyph`. Huit glyphes au total (OI0 à OI7), définis dans le système existant.

**`SectionLabel`** — étendu, spec figée :

```
display: inline-flex
align-items: center
gap: 6px
font-size: 12px
font-weight: 500
letter-spacing: 0.03em
color: var(--color-accent)
icône Material Symbols: font-size 1em, color var(--color-accent)
margin-bottom: 14px
```

Un SectionLabel est toujours `icône + texte` en inline. Jamais texte seul, jamais icône seule. Pattern cohérent dans tout le flux principal.

**`ChipBar`** — simple wrapper flex-wrap, spec figée :

```
display: flex
flex-wrap: wrap
gap: 6px
```

Container pour les MetaPills du rail. Permet le passage automatique à la ligne sans jamais tronquer une pill.

**`ContentBlock`** — primitive existante pour le rendu HTML sanitisé des contenus TipTap. Pas de changement.

**`DocCard`** — étendue, spec figée :

```
display: flex
gap: 14px
align-items: flex-start
padding: 14px 16px
background: var(--color-panel)
border: 0.5px solid var(--color-border)
border-radius: 12px
cursor: pointer
```

Contient à gauche un numéro (1, 2, 3, 4) dans une pastille `--color-panel-alt` radius 8px avec font-weight 700, puis une icône de catégorie en `--color-accent` taille 16px, puis le bloc titre/source/aperçu. Le numéro est obtenu par la position dans la liste (pas un champ de la donnée). Cliquable, ouvre un modal (voir section 8).

**`MetaRow`** — étendue, spec figée pour le rail :

```
display: flex
align-items: center
gap: 6px
padding: 11px 0
border-top: 0.5px solid var(--color-border) (inset léger)
icône: 14px, color var(--color-accent)
texte: 12px, color var(--color-deep) (ou steel pour dates)
```

Chaque ligne du rail (documents, auteur, dates) utilise ce pattern. La première ligne d'un groupe de MetaRow n'a pas de border-top (c'est le container parent ou le bloc précédent qui porte la séparation).

### 5. Bibliothèque d'icônes

Material Symbols Outlined uniquement. Aucune autre bibliothèque. Les glyphes sont référencés par leur nom exact Material Symbols.

**Sections du flux principal :**

| Section                           | Glyphe      |
| --------------------------------- | ----------- |
| Documents                         | `article`   |
| Guidage                           | `tooltip_2` |
| Production attendue               | `task_alt`  |
| Grille d'évaluation ministérielle | `table`     |

**Blocs du rail :**

| Bloc                                    | Glyphe           |
| --------------------------------------- | ---------------- |
| Niveau                                  | `school`         |
| Discipline                              | `menu_book`      |
| Aspects de société                      | `deployed_code`  |
| Connaissances (chapitre + bloc complet) | `lightbulb`      |
| Compétence disciplinaire                | `license`        |
| Documents (count)                       | `article`        |
| Auteur                                  | `person`         |
| Date de création                        | `calendar_today` |
| Date de dernière mise à jour            | `history`        |

**Actions de la navbar :**

| Action                                  | Glyphe           |
| --------------------------------------- | ---------------- |
| Retour à la banque                      | `arrow_back`     |
| Ajouter à une épreuve (action primaire) | `snippet_folder` |
| Épingler (toggle)                       | `file_save`      |
| Modifier (auteur uniquement)            | `edit_document`  |
| Menu secondaire                         | `more_vert`      |

**Menu kebab :**

| Item                            | Glyphe           |
| ------------------------------- | ---------------- |
| Partager (copier lien)          | `share`          |
| Exporter en PDF                 | `picture_as_pdf` |
| Supprimer (auteur uniquement)   | `delete`         |
| Signaler un problème (v2 futur) | `flag`           |

**Icônes à ajouter au design system officiel :**

- `person` — auteur (si pas déjà dans le DS)
- `calendar_today` — date de création (à ajouter)
- `history` — date de dernière mise à jour (à ajouter)
- `snippet_folder` — action "Ajouter à une épreuve" (à ajouter)
- `file_save` — épingler (à ajouter)
- `folder` / `folder_open` — concept épreuve (à ajouter pour usage global)

### 6. Hero de la fiche tâche

Le hero est la zone qui contient l'énoncé complet de la tâche, présenté comme il serait lu dans une épreuve imprimée.

**Structure :**

À gauche, l'`IconBadge` 52px avec le glyphe spécifique de l'opération intellectuelle.

À droite, empilés verticalement :

1. **Overline** — une `MetaPill` contenant le glyphe `psychology` (indicateur général "c'est une opération intellectuelle") et le nom de l'OI. Exemple : `[psychology] Établir des faits`.

2. **Énoncé h1** — consigne fusionnée amorce+consigne, rendue en un seul paragraphe continu. Taille 21px, font-weight 500, line-height 1.45, color `--color-deep`. Le contenu provient de la fusion des champs `amorce` et `consigne` dans le selector du hero (pas d'espace séparateur visible, juste une espace typographique entre la fin de l'amorce et le début de la consigne).

3. **Comportement attendu** — petit texte sous l'énoncé, font-size 13px, color `--color-steel`, line-height 1.5. Pas d'icône, pas de label. C'est la phrase qui précise la forme exacte de production.

Le hero n'a pas de SectionLabel (contrairement aux autres sections du flux). Il est la tête de la fiche, pas une section parmi d'autres.

**Règle de fusion amorce+consigne :** la fusion vit dans le selector `ficheTaeHeroSelector`, pas dans le composant. Les champs `amorce` et `consigne` restent distincts en base de données. Le selector concatène `amorce + " " + consigne` (avec placeholders résolus pour la consigne) et retourne un seul champ `enonce` au composant. Cette fusion est déjà en place dans le mode `sommaire` selon le brief initial, elle s'applique identiquement en mode `lecture`.

### 7. Flux principal de la fiche tâche

Le flux principal contient 4 sections, dans cet ordre strict :

1. **Documents** — `[article] Documents` — liste verticale de `DocCard`s, numérotées 1 à 4. Chaque DocCard affiche numéro + icône de catégorie (via `getDocumentTypeIcon()`) + titre du document + ligne de source (catégorie · repère temporel · auteur) + aperçu du contenu sur 2 lignes max avec `-webkit-line-clamp`. Cliquable, ouvre un modal de fiche document (voir section 8).

2. **Guidage** — `[tooltip_2] Guidage` — contenu TipTap rendu via `ContentBlock`, style italique serif, color `--color-steel`. Si le champ `guidage` est vide ou masqué (flag `guidage_masque_en_sommatif` à `true`), la section entière n'est pas rendue (le selector retourne `null`, le `FicheRenderer` saute la section).

3. **Production attendue** — `[task_alt] Production attendue` — contenu TipTap rendu en `ContentBlock`, **color `--color-corrige`** (`#A32D2D`). Les notes au correcteur, si présentes, sont rendues en fin de section comme un paragraphe supplémentaire en italique serif, **même color `--color-corrige`**, font-size 15px (légèrement plus petit que le corps du corrigé qui est à 16px). Pas de sous-label "Notes au correcteur" — l'italique porte seul la distinction.

4. **Grille d'évaluation ministérielle** — `[table] Grille d'évaluation ministérielle` — accordéon collapsed par défaut avec libellé "Afficher" à droite et chevron. Quand déplié, rend le composant ministériel embarqué existant tel quel. Aucun design custom pour le contenu de la grille — c'est une boîte noire qui vit dans son propre composant.

Pas de section "Consigne" séparée (elle est dans le hero). Pas de section "Amorce" séparée (fusionnée dans le hero). Pas de section "Compétence disciplinaire" ni "Connaissances associées" dans le flux principal — elles vivent dans le rail.

### 8. Rail de métadonnées

Le rail est un panneau sticky à droite du flux principal. Contenu strict, aucune action, aucun contenu narratif, aucun SectionLabel. Chaque ligne est un pattern `icône + contenu`.

**Container :**

```
position: sticky
top: 60px (juste sous la navbar)
background: var(--color-panel)
border: 0.5px solid var(--color-border)
border-radius: 12px
padding: 16px
width: 280px
```

**Contenu de haut en bas :**

1. **ChipBar de pills** (4 pills max empilées en flex-wrap) :
   - `[school] Secondaire X`
   - `[menu_book] Histoire du Québec` (ou autre discipline)
   - `[deployed_code] Aspect1 · Aspect2 · Aspect3` — pill unique avec valeurs concaténées par `·`
   - `[lightbulb] Chapitre (parent racine des connaissances)` — pill unique

   Gap vertical de 18px après la ChipBar pour marquer la séparation avec la zone des MetaRows.

2. **MetaRow déroulante — Compétence disciplinaire** :
   - `[license]` + racine de l'arbre CD (ex: "Interpréter une réalité sociale") + chevron à droite
   - Click toggle l'état déplié ; l'arbre complet apparaît en dessous, rendu par le composant arbre existant.

3. **MetaRow déroulante — Connaissances mobilisées** :
   - `[lightbulb]` + dernier énoncé de l'arbre (ex: "Revendications des Patriotes") + chevron à droite
   - Click toggle ; arbre complet en dessous.
   - Note : cette ligne utilise le même glyphe `lightbulb` que la pill "chapitre" plus haut — duplication intentionnelle, les deux affichages portent la même catégorie (connaissances) sous deux angles différents (racine chapitre en haut, chemin complet en bas).

4. **MetaRow — Documents count** :
   - `[article] N documents`

5. **MetaRow — Auteur** :
   - `[person] Nom Prénom`

6. **MetaRow — Date de création** :
   - `[calendar_today] Créée le DD mois YYYY`

7. **MetaRow — Date de dernière mise à jour** :
   - `[history] Mise à jour le DD mois YYYY`
   - Pas de divider entre les deux dates — elles forment une paire conceptuelle.

8. **Footer du rail — badge statut** :
   - Séparé des MetaRows par un divider et un margin-top supplémentaire.
   - Badge pill-complet (border-radius 999px, exception au radius 8px des MetaPills) avec dot coloré + texte.
   - Publiée : fond vert très pâle dérivé de `--color-success`, texte et dot en `--color-success`.
   - Brouillon : fond orange très pâle dérivé de `--color-warning`, texte et dot en `--color-warning`.
   - Pas de glyphe Material Symbols — uniquement dot + texte.
   - Font-weight 700, font-size 11px.

**Séparation entre MetaRows (points 2 à 7) :** chaque MetaRow a un `border-top: 0.5px solid var(--color-border)` en divider inset léger. La première MetaRow (compétence disciplinaire) n'a pas de border-top parce qu'elle est séparée de la ChipBar précédente par le gap de 18px.

### 9. Top navbar

Chrome global de fiche, contenu identique pour toutes les tâches. Aucune contextualisation au scroll, aucune information sur l'item courant dans la navbar.

**Container :**

```
position: sticky
top: 0
z-index: 10
background: var(--color-panel)
border-bottom: 0.5px solid var(--color-border)
padding: 10px 24px
display: flex
align-items: center
justify-content: space-between
```

**À gauche :** un bouton texte "Banque" avec icône `arrow_back`, color `--color-steel`, taille 13px, transparent, sans bordure. Click → `router.back()` ou navigation explicite vers `/banque`.

**À droite :** un groupe de boutons alignés avec gap 6px. Composition selon le contexte utilisateur :

**Pour un enseignant non-auteur** (cas dominant) :

- `[snippet_folder] Ajouter à une épreuve` — bouton primaire, fond `--color-accent`, texte blanc, font-weight 500, min-height 36px, padding 8px 14px, border-radius 8px
- `[file_save]` — bouton icône seul pour épingler, outline `--color-border`, même min-height, title "Épingler"
- `[more_vert]` — bouton icône seul kebab, même style outline

**Pour un enseignant auteur** (cas minoritaire) :

- `[snippet_folder] Ajouter à une épreuve` — bouton primaire (identique)
- `[file_save]` — épingler (identique)
- `[edit_document] Modifier` — bouton outline `--color-border`, min-height 36px, padding 8px 13px, texte `--color-deep` font-weight 500
- `[more_vert]` — kebab

**Kebab dropdown (non-auteur) :**

- Partager (copier lien) → `share`
- Exporter en PDF → `picture_as_pdf`
- (v2) Signaler un problème → `flag`

**Kebab dropdown (auteur) :**

- Partager → `share`
- Exporter en PDF → `picture_as_pdf`
- Supprimer → `delete`, color `--color-error`, divider au-dessus
- (v2) Signaler un problème → `flag`

**Action Épingler — comportement :**

L'icône est un toggle. État non-épinglée : `file_save` outlined. État épinglée : `file_save` filled (attribut `fill` sur le glyphe Material Symbols) + fond `--color-panel-alt` sur le bouton pour marquer l'état actif. Click toggle, mise à jour optimiste côté client avec rollback si erreur serveur. Toast sobre "Épinglée" / "Désépinglée" en bas de l'écran.

**Action Ajouter à une épreuve — comportement :**

Click ouvre un popover ou modal léger qui affiche la liste des épreuves en brouillon de l'utilisateur, avec une option "Créer une nouvelle épreuve" en bas. L'enseignant choisit, la tâche est ajoutée à l'épreuve choisie, toast de confirmation. Ce popover/modal est un composant séparé non détaillé dans cette spec.

### 10. Modal de fiche document embarqué

Quand l'enseignant clique sur une DocCard dans la section Documents du flux principal, un modal s'ouvre en overlay pour afficher la fiche complète du document référencé.

**Container modal :**

```
position: fixed
inset: 0
background: rgba(28, 37, 54, 0.55) (color-deep avec opacity)
display: flex
align-items: center
justify-content: center
padding: 40px
z-index: 50
```

**Panneau modal :**

```
width: min(1080px, 90vw)
height: min(90vh, 900px)
background: var(--color-bg)
border-radius: 16px
overflow: hidden
display: flex
flex-direction: column
box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3)
```

**Header du modal :**

Petit bandeau en haut du panneau modal avec :

- À gauche : titre "Document référencé"
- À droite : bouton lien "Ouvrir en plein écran" qui navigue vers `/documents/[id]` (ferme le modal et quitte la fiche tâche courante), puis bouton icône fermeture `close`.

**Contenu du modal :**

Zone scrollable qui contient le `FicheRenderer<DocState>` avec :

- `config = DOC_FICHE_SECTIONS`
- `mode = "lecture"`
- Layout 2 colonnes identique à la route dédiée `/documents/[id]` — flux principal gauche + rail droite sticky à l'intérieur du scroll container du modal

La fiche document rendue dans le modal est **strictement identique** à celle qui serait rendue en route dédiée. Aucune simplification, aucun layout alternatif. Le même `FicheRenderer` alimenté par le même config rend le même DOM dans les deux contextes. Seul le container parent change (route vs modal overlay).

**Accessibilité du modal :**

- Focus trap : le focus ne peut pas sortir du modal pendant qu'il est ouvert
- Touche `Esc` ferme le modal
- Click sur le fond semi-transparent ferme le modal
- `aria-modal="true"`, `role="dialog"`, `aria-labelledby` pointe vers le titre "Document référencé"
- Au moment de l'ouverture, le focus est placé sur le bouton de fermeture
- Au moment de la fermeture, le focus retourne sur la DocCard cliquée qui a ouvert le modal

**Modal dans modal :** impossible par construction. Une fiche document ne contient pas de DocCards cliquables (elle n'est pas une tâche, elle n'a pas de sous-documents référencés). Le risque de modal dans modal n'existe pas.

**Hook d'implémentation :**

Un hook `useFicheModal()` centralise l'ouverture et la fermeture. Il est appelé depuis n'importe quelle DocCard et ouvre le modal avec le bon ID de document. Signature :

```ts
const { openFicheModal, closeFicheModal, currentModalId } = useFicheModal();

// Dans DocCard:
onClick={() => openFicheModal({ kind: 'document', id: docId })}
```

Le hook gère l'état global du modal (un seul modal actif à la fois), le focus trap, et les animations d'ouverture/fermeture.

### 11. Responsive

Trois tiers de viewport, stratégie claire et prévisible.

**Desktop ≥1024px — layout canonique :**

Layout 2 colonnes comme décrit dans les sections précédentes. Rail sticky à droite. Flux principal gauche ~720px max. Container total ~1080px centré avec gap 40px entre les colonnes.

**Tablet 768-1023px — une colonne avec rail réintégré en haut :**

Le grid 2 colonnes devient 1 colonne. Le rail est rendu **au-dessus du hero**, juste après la top navbar, dans une disposition compacte :

- ChipBar de pills en haut (niveau, discipline, aspects, chapitre) sur 1-2 lignes flex-wrap
- Compétence disciplinaire et connaissances mobilisées en lignes déroulantes empilées
- Ligne horizontale avec documents count + auteur + dates, éventuellement en flex pour économiser la hauteur
- Footer statut pill (Publiée/Brouillon) à droite

Le rail occupe toute la largeur, padding 16px, fond `--color-panel`, border-radius 12px, margin-bottom 32px avant le hero. Puis le flux principal déroule normalement en dessous (hero, Documents, Guidage, Production attendue, Grille).

Le rail n'est **pas sticky** en mode tablet — il reste en haut et scroll avec la page, parce que le contenu du flux principal occupe maintenant toute la largeur et qu'un rail flottant latéral n'aurait plus de sens.

**Mobile <768px — tout empilé, rail compacté en accordéon :**

Une seule colonne étroite, padding réduit à 16px sur les côtés. Le rail devient un accordéon replié par défaut juste après la top navbar, avec un label "Informations sur la tâche" et un chevron. Déplié, il contient les mêmes données que le rail tablet mais empilées verticalement en pleine largeur.

La top navbar se simplifie :

- Bouton retour "Banque" à gauche (identique)
- À droite : **uniquement le bouton primaire** `[snippet_folder] Ajouter à une épreuve` (icône seule sans texte pour économiser la largeur) + kebab
- Tous les autres boutons (épingler, Modifier si auteur) passent dans le kebab en tête de liste avec leurs icônes et libellés complets
- Le kebab devient ainsi l'accès à toutes les actions secondaires et conditionnelles

Le hero a son IconBadge réduit à 40px (au lieu de 52px) et la consigne h1 à 19px (au lieu de 21px). Le comportement attendu reste à 13px.

Les DocCards dans le flux mobile gardent leur structure (numéro + icône + contenu) mais le contenu utilise le line-clamp à 3 lignes au lieu de 2 pour mieux remplir la largeur étroite.

**Modal de fiche document en responsive :**

- Desktop : overlay centré 1080px max, 90vh
- Tablet : overlay plein largeur moins 24px de marge, 95vh
- Mobile : overlay plein écran, header modal avec bouton retour en chevron gauche au lieu de croix, rail interne du modal en accordéon comme sur mobile parent

### 12. États de chargement et d'erreur

**Chargement initial :**

Lorsque la route `/questions/[id]` est appelée, le `FicheRenderer` reçoit un state partiel depuis la liste de la banque (si la navigation vient d'une banque où les métadonnées sont déjà en cache). Les sections qui ont leurs données disponibles se rendent immédiatement. Les sections qui attendent leur chargement affichent un `SectionSkeleton` avec animation shimmer (primitive existante selon le brief initial).

Aucun skeleton global qui remplace toute la page. Les sections se remplissent progressivement, section par section.

**Chargement du modal de fiche document :**

Quand le modal s'ouvre, pendant que les données du document sont fetched, le modal affiche un skeleton layout 2 colonnes vide avec les placeholders shimmer. Le bouton fermeture et le header du modal restent actifs immédiatement.

**Item supprimé (edge case) :**

Si l'enseignant navigue vers `/questions/[id]` dont la tâche a été supprimée par son auteur entre-temps, le serveur renvoie un 404 et l'app redirige vers `/banque` avec un toast "Cette tâche n'est plus disponible". Même principe pour une DocCard qui ouvrirait un document supprimé via le modal : le modal affiche un état vide "Ce document n'est plus disponible" avec un bouton fermeture, pas de redirection.

**Item non accessible (permissions) :**

Si l'enseignant n'a pas accès à la tâche (ex: tâche en brouillon d'un autre auteur), redirection vers `/banque` avec toast "Cette tâche n'est pas accessible".

### 13. Accessibilité

**Focus initial au chargement :** le focus programmatique est placé sur le h1 du hero après le rendu initial de la page, pour que les lecteurs d'écran annoncent l'énoncé de la tâche en premier.

**Ordre de tabulation :** navbar (retour → actions de gauche à droite) → hero → sections du flux dans l'ordre → chaque MetaRow déroulante du rail → footer du rail.

**Zones tactiles :** minimum 44×44px pour tous les boutons, y compris sur desktop. Les icônes Material Symbols dans les pills et MetaRows ne sont pas tactiles (elles sont décoratives), mais les pills cliquables éventuelles et les MetaRows déroulantes doivent atteindre cette taille minimale.

**Contraste :** tous les tokens couleur ci-dessus respectent WCAG AA pour le texte sur fond clair. Le rouge du corrigé `#A32D2D` sur fond blanc offre un ratio de ~8:1, bien au-dessus du seuil AA (4.5:1).

**ARIA :**

- Les MetaRows déroulantes (compétence, connaissances) utilisent `aria-expanded` et `aria-controls`
- Le modal utilise `role="dialog"` et `aria-modal="true"` avec `aria-labelledby` pointant sur le titre
- Le bouton épingler utilise `aria-pressed` pour signaler l'état
- La navbar utilise `role="banner"` ou `<header>` sémantique
- Le rail utilise `role="complementary"` ou `<aside>` sémantique

---

## Partie II — Plan d'implémentation

Cette partie découpe le travail en phases actionnables. Chaque phase est autonome et peut être implémentée indépendamment avant que la suivante ne commence.

### Phase 1 — Tokens et primitives de base

**Objectif :** avoir tous les tokens et primitives prêts avant de toucher au rendu de la fiche tâche elle-même.

**Fichiers à modifier :**

`globals.css` (ou équivalent) :

- Ajouter `--color-corrige: #A32D2D` dans la section des tokens sémantiques
- Vérifier que `--color-accent-pulse` existe avec la bonne valeur
- Ajouter les références aux icônes `person`, `calendar_today`, `history`, `snippet_folder`, `file_save`, `folder`, `folder_open` dans la documentation de la bibliothèque d'icônes

**Fichiers à créer ou modifier dans `lib/fiche/primitives/` :**

`MetaPill.tsx` :

- Mettre à jour la constante `FICHE_META_PILL_CLASS` avec les valeurs exactes (déjà fait dans le DS existant, vérifier conformité)
- S'assurer que la prop `icon` accepte un nom de glyphe Material Symbols et le rend via le composant existant de glyphe
- Supprimer toute variante filled/outline si elle existait en legacy

`IconBadge.tsx` :

- Prop `glyph` qui reçoit un nom Material Symbols OU une clé OI pour rendre via `MaterialSymbolOiGlyph`
- Taille 52px par défaut, prop `size` pour variantes (40px en mobile)
- Fond `var(--color-panel-alt)`, radius 12px

`SectionLabel.tsx` :

- Toujours rendu en `icon + text` inline
- Prop `icon` obligatoire, prop `label` obligatoire
- Style fixé : 12px, weight 500, color `--color-accent`, gap 6px, margin-bottom 14px

`ChipBar.tsx` :

- Wrapper flex-wrap simple, gap 6px
- Pas d'autre logique

`ContentBlock.tsx` :

- Existant, pas de changement

`DocCard.tsx` :

- Props : `numero` (nombre, 1-4), `categorieGlyph` (string Material Symbols), `titre`, `sourceLine` (string), `apercu` (HTML sanitisé), `onClick`
- Le numéro est passé par position, pas lu depuis les données
- L'icône de catégorie est obtenue via `getDocumentTypeIcon(categorieId)` en amont (dans le selector), pas calculée dans le composant

`MetaRow.tsx` :

- Variantes : simple (icône + texte), avec badge à droite (statut), déroulante (avec chevron et contenu déplié conditionnel)
- Prop `variant: "simple" | "status" | "expandable"`

**Fichiers de tests :**

Tests unitaires sur chaque primitive pour vérifier le rendu, les props, et la conformité aux tokens. Utiliser `@testing-library/react` + tests de snapshot.

**Critère de complétude Phase 1 :** chaque primitive rend correctement en isolation dans un Storybook (ou équivalent) avec toutes ses variantes, et les tests passent.

### Phase 2 — Selectors de la fiche tâche

**Objectif :** tous les selectors qui alimentent les sections de la fiche tâche sont écrits, testés, et retournent des états bien typés.

**Fichiers à créer dans `lib/fiche/selectors/task/` :**

`ficheTaeHeroSelector.ts` — retourne le state du hero :

```ts
{
  oiGlyph: string, // clé pour MaterialSymbolOiGlyph
  oiLabel: string, // "Établir des faits"
  enonce: string,  // amorce + " " + consigne avec placeholders résolus
  comportementAttendu: string
}
```

Logique : fusionner `amorce` et `consigne`, résoudre les placeholders `{{doc_A}}` → numéros, sanitiser.

`ficheTaeDocumentsSelector.ts` — retourne un array de DocCardState :

```ts
Array<{
  numero: number;
  docId: string;
  categorieGlyph: string;
  titre: string;
  sourceLine: string;
  apercu: string;
}>;
```

Logique : mapper `refs.documents` → pour chaque doc, calculer le numéro (index+1), obtenir l'icône via `getDocumentTypeIcon()`, construire la ligne de source selon les champs disponibles.

`ficheTaeGuidageSelector.ts` — retourne `{ contenu: string } | null`. Null si champ vide ou flag de masquage.

`ficheTaeCorrigeSelector.ts` — retourne `{ contenu: string, notesCorrecteur?: string }`.

`ficheTaeGrilleSelector.ts` — retourne `{ componentId: string, critereCount: number }`. Le rendu réel délègue au composant ministériel embarqué.

**Fichiers à créer dans `lib/fiche/selectors/task/rail/` :**

`railNiveauSelector.ts` — `{ label: string }` unique
`railDisciplineSelector.ts` — `{ label: string }` unique
`railAspectsSelector.ts` — `{ labels: string[] }` qui produit une pill unique avec join `·`
`railChapitreConnaissancesSelector.ts` — `{ racine: string }` (premier parent de l'arbre)
`railCompetenceSelector.ts` — `{ racine: string, arbreComplet: TreeNode }`
`railConnaissancesCompletesSelector.ts` — `{ terminal: string, arbreComplet: TreeNode, cheminComplet: string[] }`
`railDocumentsCountSelector.ts` — `{ count: number }`
`railAuteurSelector.ts` — `{ nom: string }`
`railDatesSelector.ts` — `{ creation: Date, miseAJour: Date }`
`railStatutSelector.ts` — `{ statut: "brouillon" | "publiee" }`

**Helper à ajouter dans `lib/fiche/tree-utils.ts` :**

```ts
function extractTreeRoot(tree: TreeNode): string;
function extractTreeTerminal(tree: TreeNode): string;
function extractTreePath(tree: TreeNode): string[];
```

**Tests :** pour chaque selector, tests avec des inputs variés (données complètes, champs vides, placeholders, arbres à 1/2/3 niveaux) vérifiant que l'output est bien typé et correct.

**Critère de complétude Phase 2 :** tous les selectors passent leurs tests, `typeof` les outputs correspondent aux types déclarés.

### Phase 3 — Configuration et sections

**Objectif :** le config `TAE_LECTURE_SECTIONS` est écrit et le `FicheRenderer` sait itérer dessus pour rendre les sections dans l'ordre.

**Fichier à créer :** `lib/fiche/config/taeLectureSections.ts`

```ts
export const TAE_LECTURE_SECTIONS = [
  {
    id: "hero",
    selector: ficheTaeHeroSelector,
    component: HeroSection,
    visibleIn: ["thumbnail", "sommaire", "lecture"],
  },
  {
    id: "documents",
    selector: ficheTaeDocumentsSelector,
    component: DocumentsSection,
    visibleIn: ["sommaire", "lecture"],
  },
  {
    id: "guidage",
    selector: ficheTaeGuidageSelector,
    component: GuidageSection,
    visibleIn: ["sommaire", "lecture"],
  },
  {
    id: "corrige",
    selector: ficheTaeCorrigeSelector,
    component: CorrigeSection,
    visibleIn: ["lecture"],
  },
  {
    id: "grille",
    selector: ficheTaeGrilleSelector,
    component: GrilleSection,
    visibleIn: ["lecture"],
  },
] satisfies FicheSectionConfig[];
```

**Note :** le corrigé n'est visible qu'en mode lecture (pas en thumbnail ni sommaire). La grille n'est visible qu'en mode lecture. Le hero est visible partout.

**Composants section à créer dans `components/fiche/task/sections/` :**

`HeroSection.tsx` — rend IconBadge + overline MetaPill + h1 + comportement attendu
`DocumentsSection.tsx` — rend SectionLabel + liste verticale de DocCards, chaque DocCard appelle `openFicheModal` au click
`GuidageSection.tsx` — rend SectionLabel + ContentBlock italique serif steel. Retourne `null` si `data` est null (guidage masqué).
`CorrigeSection.tsx` — rend SectionLabel + ContentBlock color `--color-corrige` + paragraphe italique notes au correcteur en dessous si présent
`GrilleSection.tsx` — rend SectionLabel + accordéon collapsed par défaut, contenu = composant ministériel embarqué existant

**Critère de complétude Phase 3 :** `FicheRenderer<TaeState>` avec `config=TAE_LECTURE_SECTIONS` rend une fiche tâche dummy en données hardcodées. Les 5 sections apparaissent dans l'ordre, avec les styles fidèles à la spec.

### Phase 4 — Rail et layout desktop

**Objectif :** la structure desktop 2 colonnes est en place avec le rail fonctionnel.

**Composant à créer :** `components/fiche/task/TaskRail.tsx`

Le rail est un composant qui reçoit un `railState` agrégeant tous les selectors de rail. Il rend ses blocs dans l'ordre fixé par la spec section 8. Les MetaRows déroulantes ont un état local `isExpanded` géré par `useState`.

```tsx
<aside className="task-rail" role="complementary">
  <ChipBar>
    <MetaPill icon="school" label={niveau} />
    <MetaPill icon="menu_book" label={discipline} />
    <MetaPill icon="deployed_code" label={aspects.join(" · ")} />
    <MetaPill icon="lightbulb" label={chapitreConnaissances} />
  </ChipBar>

  <MetaRow variant="expandable" icon="license" label={cdRacine}>
    <CompetenceTree data={cdArbre} />
  </MetaRow>

  <MetaRow variant="expandable" icon="lightbulb" label={connaissancesTerminal}>
    <ConnaissancesTree data={connaissancesArbre} />
  </MetaRow>

  <MetaRow variant="simple" icon="article" label={`${docCount} documents`} />
  <MetaRow variant="simple" icon="person" label={auteurNom} />
  <MetaRow variant="simple" icon="calendar_today" label={`Créée le ${formatDate(dateCreation)}`} />
  <MetaRow variant="simple" icon="history" label={`Mise à jour le ${formatDate(dateMaj)}`} />

  <div className="task-rail__footer">
    <StatusBadge variant={statut} />
  </div>
</aside>
```

**Layout à créer :** `components/fiche/task/TaskDetailLayout.tsx`

```tsx
<>
  <TopNavBar variant="task" isAuthor={isAuthor} onAction={handleAction} />
  <div className="task-detail-grid">
    <main className="task-detail-grid__flow">
      <FicheRenderer state={taeState} config={TAE_LECTURE_SECTIONS} mode="lecture" />
    </main>
    <TaskRail state={railState} />
  </div>
</>
```

CSS :

```css
.task-detail-grid {
  max-width: 1080px;
  margin: 0 auto;
  padding: 40px 24px 48px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 40px;
  align-items: start;
}

.task-detail-grid__flow {
  min-width: 0;
}

.task-rail {
  position: sticky;
  top: 60px;
  background: var(--color-panel);
  border: 0.5px solid var(--color-border);
  border-radius: 12px;
  padding: 16px;
}
```

**Critère de complétude Phase 4 :** la page `/questions/[id]` rend la fiche tâche en layout 2 colonnes desktop, le rail est sticky au scroll, les MetaRows déroulantes s'ouvrent et se ferment, et toutes les données sont correctement rendues depuis les selectors.

### Phase 5 — Top navbar

**Objectif :** la navbar sticky avec actions est implémentée, différenciée auteur/non-auteur.

**Composant à créer :** `components/fiche/shared/TopNavBar.tsx`

Props :

```ts
{
  backHref: string,
  isAuthor: boolean,
  isPinned: boolean,
  onAddToEpreuve: () => void,
  onTogglePin: () => void,
  onEdit?: () => void, // auteur only
  onShare: () => void,
  onExportPdf: () => void,
  onDelete?: () => void // auteur only
}
```

Logique :

- Render conditionnel de "Modifier" et "Supprimer" selon `isAuthor`
- Kebab dropdown géré par un composant Menu local ou primitive existante
- Bouton "Ajouter à une épreuve" ouvre un popover séparé (composant `AddToEpreuvePopover` à créer mais hors scope de cette spec)
- Bouton Épingler toggle visuel (filled vs outlined) et appelle `onTogglePin` avec rollback optimiste

**Fichiers liés :**

`lib/api/pinTask.ts` — mutation serveur pour épingler/désépingler
`lib/api/deleteTask.ts` — mutation serveur avec confirmation modal
`hooks/usePinTask.ts` — hook qui encapsule la mutation optimiste avec toast

**Critère de complétude Phase 5 :** cliquer sur épingler toggle l'état visuel, cliquer sur Modifier navigue vers le wizard, le kebab affiche les bons items selon auteur/non-auteur, Ajouter à une épreuve ouvre le popover de sélection d'épreuve.

### Phase 6 — Modal de fiche document embarqué

**Objectif :** cliquer sur une DocCard ouvre un modal qui rend la fiche document complète.

**Fichiers à créer :**

`hooks/useFicheModal.ts` — hook centralisé pour gérer l'état global du modal (context React ou store léger type Zustand)
`components/fiche/shared/FicheModal.tsx` — le container modal avec focus trap, escape, click backdrop
`components/fiche/document/DocDetailLayout.tsx` — layout 2 colonnes pour fiche document, réutilisé par la route dédiée `/documents/[id]` et par le modal

Le `FicheModal` utilise le même `DocDetailLayout` que la route dédiée, garantissant zéro duplication de code. Le composant accepte une prop `isModal` qui ajuste uniquement le comportement de navigation retour (bouton Banque vs bouton fermer modal).

**Intégration dans DocumentsSection :**

```tsx
const { openFicheModal } = useFicheModal();

{
  docs.map((doc) => (
    <DocCard
      key={doc.docId}
      numero={doc.numero}
      categorieGlyph={doc.categorieGlyph}
      titre={doc.titre}
      sourceLine={doc.sourceLine}
      apercu={doc.apercu}
      onClick={() => openFicheModal({ kind: "document", id: doc.docId })}
    />
  ));
}
```

**Fichier à créer pour le rendu global du modal :** `app/layout.tsx` ou équivalent racine contient un `<FicheModal />` singleton qui écoute le store et se rend quand un modal est ouvert.

**Tests :**

- Ouvrir le modal affiche la fiche document
- Escape ferme le modal
- Click backdrop ferme le modal
- Focus trap fonctionne (Tab/Shift+Tab restent dans le modal)
- Bouton "Ouvrir en plein écran" navigue vers la route dédiée
- Fermer le modal rend le focus sur la DocCard cliquée

**Critère de complétude Phase 6 :** cliquer sur n'importe quelle DocCard d'une fiche tâche ouvre le modal, la fiche document est rendue fidèlement, toutes les actions de fermeture fonctionnent, l'accessibilité clavier est complète.

### Phase 7 — Responsive tablet et mobile

**Objectif :** la fiche tâche est utilisable sur tablet et mobile avec les adaptations décrites en spec section 11.

**Breakpoints :**

```css
/* tablet */
@media (max-width: 1023px) and (min-width: 768px) {
  .task-detail-grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  .task-rail {
    position: static;
    order: -1; /* remonte avant le flux principal */
    margin-bottom: 0;
  }
}

/* mobile */
@media (max-width: 767px) {
  .task-detail-grid {
    grid-template-columns: 1fr;
    padding: 24px 16px 32px;
    gap: 24px;
  }
  .task-rail {
    position: static;
    order: -1;
  }
  /* hero */
  .hero-icon-badge {
    width: 40px;
    height: 40px;
  }
  .hero-enonce {
    font-size: 19px;
  }
}
```

**Composant `TaskRail` en responsive :**

Ajoute une prop `variant: "desktop" | "tablet" | "mobile"` qui ajuste le rendu :

- `desktop` : layout vertical sticky (comme actuel)
- `tablet` : layout plus horizontal, ChipBar en haut, MetaRows en ligne plus compacte
- `mobile` : container accordéon avec label "Informations sur la tâche" replié par défaut, contenu identique au desktop une fois déplié

Le détection du variant se fait via un hook `useBreakpoint()` ou via CSS uniquement si possible (classes conditionnelles).

**Composant `TopNavBar` en responsive :**

Sur mobile (<768px), le bouton "Ajouter à une épreuve" devient icône seule (sans label texte). Les boutons épingler et Modifier disparaissent de la navbar et sont ajoutés au kebab en tête de liste.

**Modal responsive :**

CSS du FicheModal :

```css
.fiche-modal-panel {
  width: min(1080px, 90vw);
  height: min(90vh, 900px);
}

@media (max-width: 767px) {
  .fiche-modal-panel {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
  }
  .fiche-modal-header .close-btn::before {
    content: ""; /* remplacer croix par chevron back */
  }
}
```

**Tests responsive :**

Tester avec les 3 viewports cibles (1440px, 768px, 375px) en E2E (Playwright ou équivalent) :

- Le rail est au bon endroit pour chaque viewport
- La navbar a les bons boutons
- Le scroll fonctionne correctement
- Le modal s'affiche proprement en plein écran sur mobile

**Critère de complétude Phase 7 :** les 3 viewports cibles rendent proprement, toutes les interactions fonctionnent, le modal est plein écran sur mobile, aucun overflow horizontal nulle part.

### Phase 8 — Accessibilité et polish final

**Objectif :** la fiche tâche passe un audit d'accessibilité et les détails de polish sont en place.

**Checklist :**

- [ ] Focus initial sur le h1 du hero au chargement de la page
- [ ] Ordre de tabulation logique (navbar → hero → flux → rail)
- [ ] `aria-expanded` sur les MetaRows déroulantes
- [ ] `aria-pressed` sur le bouton épingler
- [ ] `role="dialog"` et `aria-modal="true"` sur le FicheModal
- [ ] `aria-labelledby` du modal pointe sur le titre "Document référencé"
- [ ] Focus trap du modal
- [ ] Escape ferme le modal
- [ ] Zones tactiles 44×44px minimum
- [ ] Contrastes WCAG AA vérifiés au Lighthouse
- [ ] Navigation complète au clavier sans souris
- [ ] Lecteur d'écran (NVDA ou VoiceOver) annonce correctement les sections, les boutons, les états
- [ ] Mode sombre : ajuster tous les tokens si ton design system le supporte (les valeurs HSL listées en spec sont light mode)
- [ ] Impression : ajouter une feuille de style `@media print` qui masque la navbar et le rail, et étend le flux principal à 100% de la largeur (cette feature est utile pour le futur export PDF)

**Toasts :**

- Épingler : "Tâche épinglée" / "Désépinglée"
- Ajouter à une épreuve : "Ajoutée à l'épreuve [nom]"
- Partager : "Lien copié dans le presse-papier"
- Erreurs : "Une erreur est survenue, veuillez réessayer"

**Critère de complétude Phase 8 :** audit Lighthouse accessibilité ≥95, navigation clavier complète, tous les toasts fonctionnent, mode impression lisible.

---

## Annexe A — Résumé des composants créés ou modifiés

**Primitives (lib/fiche/primitives/) :**

- MetaPill — étendue avec valeurs exactes spec
- IconBadge — étendue
- SectionLabel — étendue
- ChipBar — existante
- ContentBlock — inchangée
- DocCard — étendue avec numéro + icône catégorie
- MetaRow — étendue avec variantes simple/status/expandable

**Selectors (lib/fiche/selectors/task/) :**

- ficheTaeHeroSelector
- ficheTaeDocumentsSelector
- ficheTaeGuidageSelector
- ficheTaeCorrigeSelector
- ficheTaeGrilleSelector
- Plus 10 selectors du rail dans `lib/fiche/selectors/task/rail/`

**Configs (lib/fiche/config/) :**

- taeLectureSections.ts

**Sections (components/fiche/task/sections/) :**

- HeroSection
- DocumentsSection
- GuidageSection
- CorrigeSection
- GrilleSection

**Layouts (components/fiche/task/) :**

- TaskDetailLayout
- TaskRail

**Shared (components/fiche/shared/) :**

- TopNavBar (variant task, extensible pour future variant doc)
- FicheModal (singleton global)

**Hooks :**

- useFicheModal
- usePinTask
- useBreakpoint

**Tokens :**

- --color-corrige ajouté dans globals.css

**Icônes à ajouter au design system officiel :**

- person, calendar_today, history, snippet_folder, file_save, folder, folder_open

---

## Annexe B — Points de vigilance

**1. Cohérence carte ↔ fiche garantie par les selectors.** Puisque les modes `thumbnail`, `sommaire`, et `lecture` partagent le même config et les mêmes selectors, toute modification de donnée se reflète instantanément dans les trois modes. Ne jamais dupliquer la logique de fusion amorce+consigne ou de résolution de placeholders dans un composant — toujours dans le selector.

**2. Le composant arbre de compétence/connaissances est réutilisé tel quel.** Ne pas redesigner son rendu interne. Le rail lui passe la donnée via les MetaRows déroulantes, et le composant fait son travail. Si le composant arbre existant ne supporte pas un rendu compact à 280px de large, c'est au composant arbre d'être adapté, pas au rail de le contourner.

**3. Le rouge du corrigé est en typographie seulement.** Pas de fond, pas de bordure, pas de container coloré. C'est une règle stricte qui préserve la discipline visuelle de la règle 1 (monochromie teal avec une exception sémantique portée par le texte, pas par la décoration).

**4. Les DocCards en modal vivent dans un FicheRenderer identique à la route dédiée.** Aucune version simplifiée. Si la fiche document en modal n'est pas lisible correctement, c'est la fiche document elle-même qu'il faut ajuster, pas créer une version "mode modal".

**5. Le rail n'est pas une navbar.** Le rail contient des métadonnées de référence, pas des actions. Les actions sur l'item vivent dans la top navbar, qui est un chrome global de fiche. Ne jamais mélanger les deux — garder la séparation conceptuelle stricte.

**6. Top navbar non contextualisée.** Ne jamais ajouter de mini-titre OI, de breadcrumb, ou d'indicateur de section courante dans la navbar. Elle doit rester identique pour toutes les tâches. Si un besoin contextuel émerge, il doit se résoudre dans le flux principal ou dans le rail, pas dans la navbar.

**7. La grille d'évaluation est une boîte noire.** Le composant ministériel embarqué existe et ne doit pas être touché. La section Grille de la fiche tâche lui fournit un contenant (SectionLabel + accordéon) et rien d'autre.

**8. Icônes Material Symbols Outlined uniquement.** Aucune autre bibliothèque, aucune icône custom, aucune exception. Si un concept n'a pas d'icône appropriée dans Material Symbols Outlined, choisir l'approximation la plus proche plutôt que d'importer une autre source.

---

## Annexe C — Changements par rapport au brief initial

Cette spec diverge du brief initial sur plusieurs points, tranchés pendant la session de design. Liste des divergences :

**Sections supprimées du flux principal** (par rapport aux 9 sections initiales) :

- Consigne : fusionnée dans le hero
- Amorce : fusionnée dans le hero
- Compétence disciplinaire : déplacée dans le rail
- Connaissances relatives : déplacée dans le rail
- Footer : supprimé, toutes les méta-infos sont dans le rail

**Sections ajoutées ou déplacées :**

- Top navbar : zone nouvelle, distincte du flux principal
- Rail de métadonnées : zone nouvelle, sticky à droite

**Ordre des sections du flux changé :**

- Ancien : Header → Consigne → Guidage → Documents → Corrigé
- Nouveau : Hero (avec consigne) → Documents → Guidage → Corrigé → Grille

**Renommages :**

- "Connaissances relatives" → "Connaissances associées" (ou "Connaissances mobilisées" après consultation didactique)
- "Corrigé" → "Production attendue" dans le SectionLabel (le concept reste le même)

**Modèle d'action utilisateur redéfini :**

- Ancien : "Dupliquer" comme action principale
- Nouveau : "Ajouter à une épreuve" comme action principale pour tous les enseignants, "Modifier" conditionnel à auteur, "Épingler" comme toggle
- Clarification : la banque est une bibliothèque partagée, les épreuves sont des playlists personnelles, les tâches ne sont pas clonées. L'auteur reste l'auteur, la tâche reste unique.

**Conventions de couleur :**

- Teal `#229bc3` confirmé comme couleur de marque (`--color-accent`)
- Rouge `#A32D2D` ajouté comme nouveau token `--color-corrige` réservé au corrigé et notes au correcteur
- Bleu nuit `#1c2536` (`--color-deep`) comme texte principal — indépendant du teal

**Primitives :**

- Les 7 primitives initiales sont conservées et étendues
- Aucune nouvelle primitive majeure créée
- Les "composants arbre" pour compétence et connaissances sont référencés comme existants, pas redesignés

---

**Fin de la spec.**
