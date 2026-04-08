# Design system

Tokens visuels, composants, icônes, Tailwind, modales et **contrat formulaires** (section dédiée). Copy utilisateur : [DECISIONS.md](./DECISIONS.md). Wizard : [WORKFLOWS.md](./WORKFLOWS.md).

## Fondations

### Typographie

Base : `app/globals.css` — `html { font-size: 112.5%; }` (≈ 18px si navigateur à 16px) ; `body` interligne **`--app-leading-body` (1,375)** — ratio adapté au corps > 16px (pratique courante ~1,35–1,4). Les utilitaires Tailwind **`leading-*`** sont harmonisés dans `@theme inline` : **`leading-normal` 1,375**, **`leading-relaxed` 1,45** (texte secondaire / paragraphes), **`leading-snug` 1,32** (UI dense), **`leading-tight` 1,22**, **`leading-loose` 1,55 — valeurs plus serrées que les défauts Tailwind (ex. `relaxed` 1,625 trop aéré à cette échelle). Police : **Manrope\*\* (400–800).

**Exception — barèmes ministériels :** à l’intérieur des tableaux de grille de correction (`components/tae/grilles/`, `eval-grid.module.css`, `oi6-so3-grid.module.css`), **ne pas** appliquer les interlignes ci-dessus : typo et `line-height` **restent** ceux définis **sur les composants / CSS modules de grilles** (Arial, référentiel ministériel). Détail recette : [ARCHITECTURE.md](./ARCHITECTURE.md) (section Grilles).

### 1.1.1 Deux-points (texte UI)

En français d’interface : **espace normale** avant et après `:` entre deux segments (`libellé : valeur`). Pas d’espace insécable autour du deux-points pour ce cas. Exceptions : URLs, heures `hh:mm`, clés techniques, classes CSS.

**Implémentation :** `lib/ui/colon.ts` — `normalizeFrenchColonSpacing` ; `components/ui/Field.tsx` normalise `label` et `error`.

| Élément           | Rôle                                                                  |
| ----------------- | --------------------------------------------------------------------- |
| `lib/ui/colon.ts` | Normalisation idempotente ; protège URLs et heures                    |
| `Field`           | Applique la normalisation sur les champs qui passent par ce composant |

Pour les autres surfaces : importer la fonction ou respecter la règle dans les littéraux. Stratégie de migration : prioriser `components/ui/`, `components/auth/`, `lib/actions/`, messages Zod — ne pas toucher `className`, URLs, regex.

### 1.1.2 Champs obligatoires — astérisque rouge

Astérisque après le libellé ; couleur **`text-error`** / `--color-error` uniquement ; `aria-hidden` sur le glyphe ; obligation portée par `required` / `aria-required` sur le contrôle. Composant : **`RequiredMark`**, props **`required`** sur **`Field`** / **`PasswordField`**. La copy des libellés dans [DECISIONS.md](./DECISIONS.md) reste **sans** `*` dans le texte.

### Palette (tokens)

Variables dans `app/globals.css` : `--color-deep`, `--color-steel`, `--color-surface`, `--color-accent`, `--color-success`, `--color-warning`, `--color-error`, `--color-border`, `--color-muted`, `--color-bg`, `--color-panel`, etc. **Règle :** pas de HSL / hex en dur dans les composants — utilitaires Tailwind mappés sur ces tokens.

### Espacement

`--space-1` … `--space-8` (grille 4–96px) en `:root`.

### Icônes — Material Symbols Outlined

Bibliothèque **unique**. Glyphe en **`1em`**, pattern **`.icon-text`** / **`.icon-lead`**, `gap: var(--icon-gap-em)` (~0.35em) — détail dans `app/globals.css`.

**Wizard :** pas d’icône devant le **titre d’étape** ; glyphes pour **libellés de champs** — [DECISIONS.md](./DECISIONS.md#stepper-visuel-taé), [DECISIONS.md](./DECISIONS.md#mapping-glyphes--bloc-2-libellés-de-champs).

**Documentation légale :** tout encadré ou section d’avertissement juridique (droits d’auteur, Copibec, engagement utilisateur, confirmation avant enregistrement, etc.) utilise **exclusivement** le glyphe Material Symbols Outlined **`gavel`** — **`1em`**, **`text-accent`**, pattern **`.icon-text`** avec le libellé de section si présent. Composant : **`LegalNoticeIcon`** (`components/ui/LegalNoticeIcon.tsx`). **Interdit** d’employer une autre icône pour ce rôle sans décision du développeur — registre [DECISIONS.md](./DECISIONS.md#justifications-des-icônes-material) (**Documentation légale**) ; tooltip : `LEGAL_NOTICE_MATERIAL_ICON` / `MATERIAL_ICON_TOOLTIP` dans `lib/tae/icon-justifications.ts`.

**Curseur — contrôles cliquables :** tout **bouton** activable affiche la **main** (`cursor: pointer`) ; état désactivé → `not-allowed` — règle globale dans `app/globals.css`. Les boutons **(i)** d’aide (`LabelWithInfo`, `FieldHelpModalButton`) incluent explicitement **`cursor-pointer`** ; ne pas laisser d’icône dans un hit target sans curseur explicite si le pattern sort du `button` natif.

**Nombre de lignes :** glyphe **`format_line_spacing`** uniquement — pas **`format_list_numbered`**.

| Concept                                            | Icône                                     |
| -------------------------------------------------- | ----------------------------------------- |
| Comportement / grille                              | `table`                                   |
| Voir grille                                        | `table_eye`                               |
| Nombre de lignes                                   | `format_line_spacing`                     |
| Consigne                                           | `quiz`                                    |
| Guidage                                            | `tooltip_2`                               |
| Corrigé                                            | `task_alt`                                |
| Options de réponse (stepper étape 5, avec corrigé) | `list_alt_check`                          |
| Niveau                                             | `school`                                  |
| Discipline                                         | `menu_book`                               |
| OI (label)                                         | `psychology`                              |
| Documents                                          | `docs`                                    |
| CD                                                 | `license`                                 |
| Connaissances                                      | `lightbulb`                               |
| Voir / Modifier / Supprimer                        | `visibility` / `edit_document` / `delete` |
| Brouillon / Publié                                 | `construction` / `check_circle`           |
| Documentation légale                               | `gavel`                                   |

Justifications pédagogiques : [DECISIONS.md](./DECISIONS.md#justifications-des-icônes-material) ; `lib/tae/icon-justifications.ts`.

#### Glyphes OI (données `oi.json` / fiche / liste)

- **Composant unique :** `components/ui/MaterialSymbolOiGlyph.tsx` — enveloppe **`material-symbols-outlined`** et pose **`data-oi-glyph="{nom}"`** pour tout glyphe issu du **catalogue OI** (listes Bloc 2, en-tête fiche, `TaeCard`, modales d’aide).
- **Icône + titre (liste, modale OI, options listbox) :** utiliser le conteneur **`.icon-lead`** (`app/globals.css`) — `align-items: flex-start` et **`margin-top: 0.125em`** sur le **`material-symbols-outlined`** pour l’alignement optique sur la **première** ligne de texte (éviter seul `items-baseline` / `items-center`, les métriques du font icon ne coïncident pas avec le texte).
- **Présentation (rotation, correctifs) :** **`app/globals.css`** — sélecteurs **`.material-symbols-outlined[data-oi-glyph="…"]`** et variables **`--oi-glyph-*`** sur **`:root`**. **Interdit** de répéter `rotate-*` ou `transform` sur chaque écran pour ces glyphes : ajouter une règle / token global et, si besoin, une ligne dans cette section.
- **Exemple :** **`alt_route`** (OI _Changements et continuités_) — rotation **`var(--oi-glyph-alt-route-rotate)`** (**90°**, sens horaire) pour que les deux branches pointent vers la **droite** (orientation pédagogique retenue).

### Tokens maquette v2

`--danger`, `--color-draft*`, `--hairline-fiche`, `--radius-fiche`, `--color-accent-pulse`, `--select-radius`, etc. — s’ajoutent sans casser les tokens globaux.

## Composants de base

Primitives dans `components/ui/` : **`Button`**, **`Field`**, **`PasswordField`**, **`Textarea`** (`<textarea>` multiligne — base **`auth-input`** obligatoire, pas de textarea nu hors ce composant), **`RichTextEditor`** (TipTap **gras / italique / souligné / listes** — `simpleRichExtensions` ; props `value` / `onChange` / `placeholder` / `minHeight` ; chrome **`RichTextEditorShell`** : bordure **`border-secondary`**, focus **`border-info`**, toolbar **`RichTextEditorToolbar`** fond transparent, séparateurs **`border-tertiary`**, zone de saisie **`bg-background-primary`**, typo **13px** ; option **`autosaveKey`** persistance locale 10 s ; React Hook Form : **`Controller`**), **`LimitCounterPill`** (pilule « courant / max » pour limites **mots** ou **caractères** — rampe warning progressive, danger optionnel à `max` via `showDangerAtMax`), **`SegmentedControl`** (options segmentées — conteneur sans cadre, `gap-1`, états via `--color-text-secondary` / `--color-background-info` / `--color-text-info`), **`ListboxField`**, **`SimpleModal`**, **`FieldHelpModalButton`** (bouton **(i)** → modale d’aide, gabarit **`LabelWithInfo`**), **`MaterialSymbolOiGlyph`** (glyphes catalogue OI), etc. Préférer la réutilisation aux variations ad hoc. **Consigne** (badges Doc A/B, extensions dédiées) : **`ConsigneTipTapEditor`** réutilise **`RichTextEditorShell`** + **`RichTextEditorToolbar`** — pas de seconde barre d’outils ad hoc pour B/I/U/listes.

**Aide champ (texte long) :** ne pas s’appuyer sur l’attribut natif **`title`** pour du contenu pédagogique ou juridique — ouvrir une **`SimpleModal`** au clic sur **`FieldHelpModalButton`** (pattern Bloc 3 `Bloc3InfoModals`, `LabelWithInfo`).

### Listes déroulantes — listbox (pas de `<select>`)

**Règle absolue :** pas de `<select>` natif dans les formulaires. Utiliser **`ListboxField`** ou composants qui réutilisent **`formSelectClasses.ts`** (`listboxFieldClassName`, `LISTBOX_DROPDOWN_PANEL_CLASSES`, `LISTBOX_OPTION_ROW_CLASSES`, `LISTBOX_TRIGGER_CLASSES`).

| Élément                | Rôle                                                                     |
| ---------------------- | ------------------------------------------------------------------------ |
| `ListboxField.tsx`     | Listbox générique ; React Hook Form : `Controller` + `ref` sur le bouton |
| `formSelectClasses.ts` | Source unique des classes trigger / panneau / option                     |

Cas riches (OI, comportements) : **`OiPicker`**, **`ComportementPicker`** — mêmes tokens.

**Espace de production (Bloc 2) :** section **lecture seule** après choix d’un comportement — nombre de lignes issu de `oi.json` (`Bloc2EspaceProductionReadonly`) ; pas de curseur `form-range` dans ce bloc.

### Actions destructrices

Texte/icône discrets (`text-muted`), **`hover:text-error`**, **`hover:bg-error/5`**, jamais gros bouton rouge plein pour une action secondaire. Références : `ConnaissanceRemoveButton`, `TaeCardMenu`, réinitialiser connaissances.

### États de progression — accordéons séquentiels

Pattern pour les formulaires avec slots ou perspectives complétables dans l'ordre.

| État | Icône | Token couleur | Comportement |
|------|-------|---------------|--------------|
| Verrouillé | `lock` | `text-muted` | Non cliquable |
| À compléter | `lock_open` | `text-muted` | Cliquable |
| En cours | _(accordéon ouvert)_ | `text-accent` | Ouvert |
| Complété | `fact_check` | `text-success` | Cliquable, rouvre |

**Règle icône :** `check_circle` est réservé au corrigé (Bloc 5) et aux étapes wizard complétées (stepper). Ne pas l'utiliser pour les slots documents ou les perspectives.

## Layout — Créer une tâche

Split 50/50 (≥ `lg`), stepper dans la carte formulaire, sommaire à droite. Voir [WORKFLOWS.md](./WORKFLOWS.md#vue-densemble-du-formulaire).

## Modales

**Next.js :** `SimpleModal` + usages dans les blocs (aides Bloc 2–3, wizard document, confirmations). Focus, `role="dialog"`, fermeture ESC / overlay selon implémentation. Prop optionnelle **`fitContentHeight`** : contenu non scrollable dans le panneau (hauteur intrinsèque), panneau centré (`min-h-full` + flex sur un wrapper), défilement sur le conteneur `fixed` si le contenu dépasse la fenêtre ; zone corps du panneau en **`overflow-x-clip`** (éviter la combinaison `overflow-x-hidden` + `overflow-y-visible`, qui force souvent un scroll vertical parasite par la spec CSS) — ex. grille barème (`GrilleCorrectionModal`).

- **Coins du panneau :** **`rounded-md`** sur le dialogue (rayon retenu : moins arrondi qu’auparavant).
- **Modales d’aide (« tooltip modale ») :** **`SimpleModal`** + **`titleStyle="info-help"`** — en-tête : **glyphe Material `info`** en **`text-accent`** (teal) + **titre** (pattern **`icon-text`**).
- **Modales d’avertissement :** composant **`WarningModal`** — en-tête : glyphe **`warning`** en **`text-warning`**, fond d’en-tête **`bg-warning/10`**, bordures **`border-warning/25`** / panneau **`border-warning/35`** ; corps en **`text-deep`**. À l’ouverture, **focus** sur le panneau dialogue (`tabIndex={-1}`). **Action positive** (ex. confirmer une suite logique) : bouton **`bg-success`** + **`text-white`** (pas teal). Ex. déverrouillage Bloc 2 : **`BlueprintLockedView`**.
- **Autres `SimpleModal` `plain` :** banque, etc. — titre seul, sans bandeau info ni warning.
- **Modale Consigne (Bloc 3, étape 3) :** corps structuré **`Bloc3ConsigneHelpModalBody`** — pastilles **Doc A** / **Doc B** = **`CONSIGNE_DOC_HELP_MODAL_BADGE_CLASS`** (même famille visuelle que **`CONSIGNE_DOC_INSERT_BUTTON_CLASS`** dans l’éditeur, **sans** glyphe `add`) ; glyphe Material **`list`** (OI7 — établir des liens de causalité) en **`text-deep`** pour illustrer les listes à puces. Registre : [UI-COPY.md](./UI-COPY.md#étape-3--consigne-et-production-attendue).

> L’API **`window.eduqcApp.modal`** et le markup PHP de **`modal.md`** concernent l’**ancien thème WordPress**, pas l’app actuelle.

## Tailwind — règles

- Utilitaires alignés sur les tokens du thème ; éviter `gray-*` génériques et hex en dur.
- Valeurs arbitraires `text-[…]`, `p-[23px]` : dernier recours.
- Ne pas construire des classes dynamiques qui **cassent le scan** Tailwind — préférer littéraux complets dans `cn()`.
- **`cn()`** : `import { cn } from "@/lib/utils/cn"` — `clsx` + `tailwind-merge`.
- Au-delà de ~12–15 classes sur un nœud : sous-composant ou constante.
- Cohérence : ce document et `components/ui/` priment sur des conventions génériques.
- Processus / dette : [BACKLOG.md](./BACKLOG.md#anti-dette-technique).

## Formulaires

### Règle absolue

**Dès que vous écrivez ou modifiez du code de formulaire** (champs, validation, soumission, états d’erreur, layout d’étapes, etc.), les pratiques de **cette section s’appliquent toujours**. Ce n’est pas une « cible » ni une option : c’est le contrat du dépôt, au même titre que [DECISIONS.md](./DECISIONS.md) et [ARCHITECTURE.md](./ARCHITECTURE.md).

- **Nouveau formulaire ou nouveau champ** : respecter les sections pertinentes et la **checklist** en fin de section avant merge.
- **Formulaire existant encore partiel** : toute évolution doit **rapprocher** l’implémentation du guide (pas d’aggravation de l’écart).
- **Stack** : Next.js App Router + Tailwind. Validation typée avec **Zod** ; pour plusieurs champs et validation client, **React Hook Form + Zod** est la norme (comme l’auth). Un wizard peut orchestrer l’état différemment, mais **ne dispense pas** de l’accessibilité, validation serveur, erreurs inline, `aria-*`, `autoComplete`, hauteur tactile, etc.

**Références :** cette page (tokens, listbox), pages `(auth)` pour l’exemple auth, [DECISIONS.md](./DECISIONS.md) (règles absolues code/UI).

#### Ponctuation — deux-points

Libellés, erreurs, hints : espaces autour de `:` — voir [§1.1.1](#111-deux-points-texte-ui).

### En-tête des pages d’authentification (`/login`, `/register`, `/activate`)

**Comportement actuel** (`app/(auth)/layout.tsx`) : logo + titre du site sur une ligne centrée (identité produit + contexte pédagogique). Évolution possible : programme / langue — hors calendrier fixe.

### 1. Structure HTML sémantique

#### Regroupement (`fieldset` + `legend`)

Utiliser `fieldset` / `legend` pour les groupes logiques (radio, cases liées).

**Boutons radio et cases à cocher (natifs)** : `accent-color: var(--color-accent)` est défini globalement dans `app/globals.css` — remplissage de l’état coché / actif en **teal** aligné sur le thème (pas le bleu par défaut du navigateur). Les classes utilitaires `accent-*` sur un champ isolé restent possibles pour exception documentée.

#### Organisation

Envelopper chaque paire label / contrôle dans un conteneur `flex flex-col gap-2`.

### 2. Accessibilité (A11y)

#### Labels

`htmlFor` sur le label = `id` du contrôle.

#### Focus visible

Ne pas supprimer l’outline sans alternative (`globals.css`, `.auth-input`).

#### Erreurs

`aria-invalid`, `aria-describedby` vers le message ; `role="alert"` sur le message d’erreur.

#### Champs obligatoires

`RequiredMark` ou `required` sur `Field` / `PasswordField` — voir [§1.1.2](#112-champs-obligatoires--astérisque-rouge).

#### Tabulation

Parcours clavier complet ; `tabIndex` explicite sur custom si nécessaire.

### 3. CSS et mise en forme

#### Polices

`font: inherit` sur `input`, `button`, `textarea`, `select` dans `globals.css`.

#### Listes déroulantes

Voir [Listes déroulantes — listbox](#listes-déroulantes--listbox-pas-de-select) ci-dessus.

#### Libellés longs

`wrap-break-word`, `leading-snug` sur listbox ; pickers métier pour listes denses.

#### Labels au-dessus

`flex-col` — pas label à gauche sauf exception documentée.

#### Tactile

44px minimum (`min-h-11`, `h-11`).

#### Grid responsive

`grid-cols-1 md:grid-cols-2` pour champs courts côte à côte.

#### Types et `autoComplete`

`type` approprié ; `autoComplete` (`email`, `given-name`, `family-name`, `new-password`, etc.).

### 4. États de chargement et soumission

Désactiver le submit pendant l’envoi ; spinner (`progress_activity` + `animate-spin`) si utile. Server Actions : `pending` / `useActionState`. Pas de double soumission.

### 5. Validation

`onBlur` ou soumission pour le client ; **serveur toujours**. React Hook Form : `mode: 'onBlur'` par défaut.

Exemple Zod courriel institutionnel (voir `lib/utils/emailValidation.ts`) :

```ts
import { z } from "zod";

const institutionalEmail = z
  .string()
  .email()
  .refine(
    (e) => /^[^\s@]+@([^.]+\.)*gouv\.qc\.ca$/i.test(e),
    "Seuls les courriels institutionnels (@*.gouv.qc.ca) sont acceptés",
  );

export const RegisterSchema = z
  .object({
    prenom: z.string().min(1, "Prénom requis"),
    nom: z.string().min(1, "Nom requis"),
    email: institutionalEmail,
    password: z.string().min(8, "Minimum 8 caractères"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirm"],
  });
```

| Type d’erreur            | Affichage                   |
| ------------------------ | --------------------------- |
| Champ invalide           | Inline sous le champ        |
| Erreur serveur / timeout | Toast si disponible         |
| Succès global            | Toast ou message page       |
| Compte non activé        | Sous le formulaire / bouton |

Éviter : erreur de champ **uniquement** en toast.

### 6. Mot de passe

Toggle `visibility` / `visibility_off` avec `aria-label`. Indicateur de force optionnel sur `/register`.

### 7. Persistance

Formulaires longs : `sessionStorage` ou hook dédié ; effacer après succès. Wizard : aussi brouillon serveur — [WORKFLOWS.md](./WORKFLOWS.md).

### 8. Toasts

Sonner ou équivalent possible ; optionnel tant que non standardisé globalement.

### 9. Checklist avant livraison d’un formulaire

- [ ] Tous les `label` ont un `htmlFor` lié à un `id`
- [ ] Focus visible sur les contrôles
- [ ] `aria-invalid` + `aria-describedby` quand erreurs de champ
- [ ] Submit désactivé pendant soumission (+ spinner si pertinent)
- [ ] Pas de double soumission
- [ ] Validation serveur systématique
- [ ] Erreurs champ en inline ; globales en toast si applicable
- [ ] `autoComplete` et bons `type`
- [ ] Hauteur tactile mobile
- [ ] Parcours clavier testé
- [ ] `font: inherit` sur contrôles dans `globals.css`
- [ ] Responsive < 768px
- [ ] Persistance pour très longs formulaires si pertinent
