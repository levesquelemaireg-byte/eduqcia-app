# PASSE 3.1 — Fiches comparatives des renderers documentaires

**Date :** 2026-04-16
**Portée :** comparatif exhaustif des 8 renderers de document identifiés en [phase3-invariants-rendu.md](phase3-invariants-rendu.md).
**Méthode :** lecture statique de chaque composant, inventaire champ par champ, qualité d'implémentation. **Aucun refactor proposé.**

> Préambule méthodologique
>
> - « Rendu » = le renderer **lit** le champ et **produit** du DOM pour le représenter. Un renderer peut _recevoir_ un champ dans son type et ne pas le rendre (auquel cas : ❌).
> - « Non applicable » (—) = le type consommé n'expose pas le champ, ce n'est ni un défaut ni une qualité.
> - Les champs comparés viennent du `DOMAIN_MODEL.md §4.1` (entité Document) et du type `DocumentFiche` ([lib/types/fiche.ts:8-36](../../lib/types/fiche.ts#L8-L36)).

---

## Contrats de données référencés

| Type                | Fichier                                                                              | Usage                                                                                               |
| ------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| `DocumentReference` | [lib/tache/contrats/donnees.ts:19-25](../../lib/tache/contrats/donnees.ts#L19-L25)   | Contrat **minimal** (id, kind, titre, contenu, echelle) — pipeline impression PDF `/apercu/[token]` |
| `DocumentFiche`     | [lib/types/fiche.ts:8-36](../../lib/types/fiche.ts#L8-L36)                           | Contrat **riche** — utilisé par wizard preview, fiche, compact                                      |
| `RendererDocument`  | [lib/types/document-renderer.ts:66-74](../../lib/types/document-renderer.ts#L66-L74) | Contrat **canonique** — structures multi-éléments                                                   |
| `DocumentElement`   | [lib/types/document-renderer.ts:42-60](../../lib/types/document-renderer.ts#L42-L60) | Élément atomique (textuel ou iconographique)                                                        |

---

## 1. DocumentCard + DocumentElementRenderer (canonique)

**Fichiers :** [components/documents/DocumentCard.tsx](../../components/documents/DocumentCard.tsx), [components/documents/DocumentElementRenderer.tsx](../../components/documents/DocumentElementRenderer.tsx)
**Rôle :** renderer canonique multi-structure. `DocumentCard` dispatche vers `SimpleLayout` / `ColumnsLayout`, tous deux délégant à `DocumentElementRenderer` pour l'élément atomique.

### a) Champs rendus

| Champ                                            | Rendu ? | Comment                                                                                                         |
| ------------------------------------------------ | ------- | --------------------------------------------------------------------------------------------------------------- |
| `titre`                                          | ✅      | `<p>` en-tête avec préfixe `Document N — ` si `numero` fourni, sinon « Sans titre »                             |
| `contenu` texte                                  | ✅      | `dangerouslySetInnerHTML` + `sanitize()` + classes `documentBody htmlFlow`                                      |
| `contenu` image (`imageUrl`)                     | ✅      | `next/image` fixe 660×400, `unoptimized` pour blob URLs                                                         |
| `source_citation` / `source`                     | ✅      | Bas de cadre via `sourceCitationDisplayHtml`, classe `documentSource`                                           |
| `image_legende` (`legende`)                      | ✅      | Via `DocumentImageLegendOverlay` (overlay sur la figure) si `legendePosition` fourni                            |
| `image_legende_position`                         | ✅      | Transmis à l'overlay                                                                                            |
| `imagePixelWidth/Height`                         | ❌      | Pas lu — toutes les images sont rendues à 660×400 fixe                                                          |
| `echelle` / `printImpressionScale`               | ❌      | Non pris en compte                                                                                              |
| `footnotes`                                      | ✅      | `FootnoteDefinitions` — extrait via `extractFootnotes(html)`, rend `<p>N. définition</p>` sous le corps textuel |
| `repere_temporel` (élément)                      | ✅      | Rendu en tête d'élément **si** `showRepereTemporel` **et** `element.repereTemporel` présents (deux_temps)       |
| `sous_titre` (élément)                           | ✅      | Rendu sous `repereTemporel` **si** `showRepereTemporel` actif (deux_temps)                                      |
| `auteur` (élément)                               | ✅      | Rendu en fin d'élément **si** `showAuteur` **et** `element.auteur` (perspectives). Italic, aligné droite, 12pt  |
| `structure perspectives`                         | ✅      | `ColumnsLayout` avec `showAuteur`, N colonnes grid                                                              |
| `structure deux_temps`                           | ✅      | `ColumnsLayout` avec `showRepereTemporel`, 2 colonnes grid                                                      |
| `sourceType` (primaire/secondaire)               | ❌      | Pas affiché (c'est une métadonnée)                                                                              |
| `categorieTextuelle` / `categorieIconographique` | ❌      | Pas affiché                                                                                                     |
| `repereTemporelDocument`                         | ❌      | Pas lu (existe sur `RendererDocument` mais non rendu)                                                           |

### b) Type consommé

```ts
type Props = { document: RendererDocument; numero?: number };
```

**Source :** `RendererDocument` de [lib/types/document-renderer.ts:66](../../lib/types/document-renderer.ts#L66).

### c) Structures gérées

✅ Les 3 : `simple` → `SimpleLayout`, `perspectives` → `ColumnsLayout(showAuteur)`, `deux_temps` → `ColumnsLayout(showRepereTemporel)`.

Si une structure inconnue était passée, la branche `else` de la condition ternaire tomberait sur `deux_temps` par défaut — **silencieusement mal typé** (le type TS garantit que c'est impossible, donc acceptable).

### d) Footnotes

✅ Extraction via `extractFootnotes()` ([lib/documents/extract-footnotes.ts](../../lib/documents/extract-footnotes.ts)) qui parse les marks TipTap `<sup data-footnote="N" data-footnote-def="...">`. Rendu en bloc `.documentFootnotes` sous le corps textuel. Fonctionne pour chaque élément textuel indépendamment.

### e) Légende sur image

✅ `DocumentImageLegendOverlay` avec 4 positions (`haut_gauche`, `haut_droite`, `bas_gauche`, `bas_droite`). Overlay absolu sur la figure. Pas de fallback si `legendePosition` absent (la légende n'est alors pas rendue, même si `legende` est présent).

### f) Qualité

- **Séparation des responsabilités :** 👍 excellente. `DocumentCard` = dispatch, `SimpleLayout`/`ColumnsLayout` = layout, `DocumentElementRenderer` = atome. Chaque composant ≤ 30 lignes significatives.
- **Réutilisabilité :** 👍 très bonne — utilisé par `DocumentCardPrint`, `DocumentCardReader`, `SectionDocContent`, `DocumentWizardPrintPreview`.
- **Couverture edge-cases :** ⚠️ moyenne — pas de fallback si `element.imageUrl` vide, pas de gestion `doc.elements[]` vide en mode simple (retourne `null` silencieusement).
- **Défaut notable :** image **toujours 660×400** — ignore `imagePixelWidth/Height` et `printImpressionScale`.
- **Prop `mode` absente** — le renderer ne reçoit aucun mode, ce qui est cohérent avec son rôle (rendu intrinsèque) mais rend INV-R3 inapplicable à ce niveau.

---

## 2. DocumentCardPrint

**Fichier :** [components/documents/DocumentCardPrint.tsx](../../components/documents/DocumentCardPrint.tsx)
**Rôle :** variant pixel-perfect pour export PDF. 3 zones : titre (hors cadre), cadre bordé (contenu + auteur), source (hors cadre).

### a) Champs rendus

| Champ                              | Rendu ? | Comment                                                               |
| ---------------------------------- | ------- | --------------------------------------------------------------------- |
| `titre`                            | ✅      | Zone 1, bandeau avec badge numéro optionnel                           |
| `contenu` texte                    | ✅      | Via `DocumentElementRenderer(hideSource)`                             |
| `contenu` image                    | ✅      | Via `DocumentElementRenderer(hideSource)` — 660×400 fixe              |
| `source_citation`                  | ✅      | Zone 3 (hors cadre), propre composant `PrintSource` avec fallback `—` |
| `image_legende`                    | ✅      | Via `DocumentElementRenderer` → `DocumentImageLegendOverlay`          |
| `image_legende_position`           | ✅      | Idem                                                                  |
| `imagePixelWidth/Height`           | ❌      | Idem — 660×400 fixe                                                   |
| `echelle` / `printImpressionScale` | ❌      | Non lu                                                                |
| `footnotes`                        | ✅      | Via `DocumentElementRenderer` — par élément                           |
| `repere_temporel` (élément)        | ✅      | Via `DocumentElementRenderer(showRepereTemporel)` si `deux_temps`     |
| `sous_titre` (élément)             | ✅      | Idem                                                                  |
| `auteur` (élément)                 | ✅      | Via `showAuteur = (structure === "perspectives")`                     |
| `structure perspectives`           | ✅      | Grid N colonnes, `showAuteur=true`                                    |
| `structure deux_temps`             | ✅      | Grid 2 colonnes, `showRepereTemporel=true`                            |

### b) Type consommé

```ts
type Props = { document: RendererDocument; numero?: number };
```

### c) Structures gérées

✅ Les 3. Distingue `isSingle = (structure === "simple")` pour utiliser `SimpleLayout`-like. Sinon grid N colonnes sur `doc.elements`.

### d) Footnotes

✅ Déléguées à `DocumentElementRenderer`.

### e) Légende sur image

✅ Déléguée à `DocumentElementRenderer`.

### f) Qualité

- **Séparation :** 👍 excellente. Délègue correctement (INV-R2 ✅). Logique propre au print (3 zones, source hors cadre) isolée ici.
- **Réutilisabilité :** 👍 bonne — utilisé par `DocumentPrintView`, `DocumentWizardPrintPreview`.
- **Couverture edge-cases :** 👍 bonne — fallback `—` si source vide, fallback « Sans titre ».
- **Différence-clé vs `DocumentCard` :** la source est extraite du cadre et alignée en colonnes si multi-éléments (chaque élément a sa propre `PrintSource`). C'est la spéc « document imprimé » qui veut ce layout.
- **Duplication :** 👎 la grille colonnes est redéfinie inline (`style={{ display: "grid", gridTemplateColumns: ... }}`) — duplique `ColumnsLayout` de `DocumentCard`.

---

## 3. SectionDocument

**Fichier :** [components/epreuve/impression/sections/document.tsx](../../components/epreuve/impression/sections/document.tsx)
**Rôle :** rendu d'un bloc document dans le pipeline pagination `/apercu/[token]` (tâche + épreuve).

### a) Champs rendus

| Champ                    | Rendu ? | Comment                                                                                                  |
| ------------------------ | ------- | -------------------------------------------------------------------------------------------------------- |
| `titre`                  | ✅      | `<p>` 11pt bold, préfixe `Document N — titre` ou `Document N` si vide                                    |
| `contenu` texte          | ✅      | `dangerouslySetInnerHTML` **sans** sanitization — 11pt, line-height 1.5                                  |
| `contenu` image          | ✅      | `<img src={doc.contenu}>` **avec `doc.contenu` utilisé comme URL** (pas de champ image_url dans le type) |
| `source_citation`        | ❌      | Absent du contrat `DocumentReference`                                                                    |
| `image_legende`          | ❌      | Absent                                                                                                   |
| `image_legende_position` | ❌      | Absent                                                                                                   |
| `imagePixelWidth/Height` | ❌      | Absent                                                                                                   |
| `echelle`                | ✅      | `transform: scale(${echelle})` sur la div parente de `<img>`                                             |
| `footnotes`              | ❌      | Aucune extraction ; les `<sup>` TipTap apparaissent tels quels dans le HTML                              |
| `repere_temporel`        | ❌      | Absent du contrat                                                                                        |
| `sous_titre`             | ❌      | Absent                                                                                                   |
| `auteur` par élément     | ❌      | Absent                                                                                                   |
| `structure perspectives` | ❌      | Aucun chemin — rendu en « flat » (tout le HTML d'un seul élément)                                        |
| `structure deux_temps`   | ❌      | Idem                                                                                                     |

### b) Type consommé

```ts
export type ContenuDocument = {
  numeroGlobal: number;
  document: DocumentReference;
};
```

`DocumentReference` = 5 champs (`id`, `kind`, `titre`, `contenu`, `echelle?`).

### c) Structures gérées

❌ Aucune. Le contrat `DocumentReference` n'expose pas `structure` ni `elements[]`. Tout document publié avec `structure = "perspectives"` ou `"deux_temps"` est rendu comme un seul bloc textuel/image (celui de l'élément 1 seulement — déterminé par `construireDocuments` en amont), **avec perte silencieuse** des autres éléments.

### d) Footnotes

❌ Aucune extraction. Le HTML TipTap contient `<sup data-footnote="N">N</sup>` qui s'affiche comme simple exposant, sans définition en bas de document.

### e) Légende sur image

❌ Aucune. L'image est rendue nue (`<img>` centré), pas de texte, pas d'overlay, pas de `figcaption`.

### f) Qualité

- **Séparation :** 👎 rendu ad-hoc sans délégation — viole INV-R1 et INV-R2.
- **Couverture :** 👎 contrat de données appauvri (`DocumentReference`), beaucoup de champs inaccessibles.
- **Sécurité :** 👎 `dangerouslySetInnerHTML` **sans** `sanitize()` — cohérence avec le reste du pipeline print mais moins sûr que `DocumentElementRenderer`.
- **Approche de l'échelle :** ⚠️ unique renderer à gérer `echelle` via `transform: scale()`. Contourne `imagePixelWidth/Height`. Comportement différent du pipeline wizard/fiche.
- **Cosmétique :** 👎 commentaires sans accents (« masque par les regles »), style inline profus.
- **Commentaire utile :** `/* Invariants : Arial, noir, pas de decoration. */` — révèle une intention de « rendu neutre pour PDF » qui justifie partiellement le minimalisme.

---

## 4. DocCard

**Fichier :** [lib/fiche/primitives/DocCard.tsx](../../lib/fiche/primitives/DocCard.tsx)
**Rôle :** primitive « card document » pour vue détaillée tâche + sommaire / lecture « legacy ». 3 modes internes : `thumbnail` (une ligne), vue détaillée (avec pastille numéro + catégorie + cliquable), legacy sommaire/lecture (carte complète).

### a) Champs rendus

| Champ                    | Rendu ? | Comment                                                                                                                                                                          |
| ------------------------ | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | -------------------- |
| `titre`                  | ✅      | `<p>` semibold. En mode vue détaillée : `doc.titre                                                                                                                               |     | "Document {letter}"` |
| `contenu` texte          | ⚠️      | Vue détaillée : `line-clamp-2` texte brut (**pas de HTML**, rendu tel quel → les balises HTML apparaissent littéralement). Mode legacy : `line-clamp-none`, rendu brut également |
| `contenu` image          | ⚠️      | Vue détaillée : vignette 64×64 `object-cover`. Mode legacy : 80×80 `object-cover`. Pas de rendu taille réelle                                                                    |
| `source_citation`        | ✅      | `SourceCitation` via `sourceCitationDisplayHtml` — mode legacy seulement                                                                                                         |
| `image_legende`          | ❌      | Pas rendue (ni overlay, ni figcaption)                                                                                                                                           |
| `image_legende_position` | ❌      | Non lu                                                                                                                                                                           |
| `imagePixelWidth/Height` | ❌      | Ignoré                                                                                                                                                                           |
| `echelle`                | ❌      | Ignoré                                                                                                                                                                           |
| `footnotes`              | ❌      | Aucune extraction                                                                                                                                                                |
| `repere_temporel` (doc)  | ✅      | `DocMetaLine` / `DocMetaChips` — rendu comme chip ou ligne texte                                                                                                                 |
| `sous_titre` par élément | ❌      | `DocumentFiche` ne l'expose pas (champ à l'élément, pas au doc)                                                                                                                  |
| `auteur` par élément     | ❌      | Idem                                                                                                                                                                             |
| `structure perspectives` | ❌      | Aucun chemin multi-éléments. Rend uniquement `doc.contenu` + `doc.image_url` (élément 1 implicite)                                                                               |
| `structure deux_temps`   | ❌      | Idem                                                                                                                                                                             |
| `sourceType`             | ✅      | Chip « Primaire » / « Secondaire » dans `DocMetaChips` ou `DocMetaLine`                                                                                                          |
| `categorieLabel`         | ✅      | Via `DocMetaLine` / `DocMetaChips`                                                                                                                                               |
| `categorieGlyph` (prop)  | ✅      | Icône Material Symbols en tête de titre (vue détaillée)                                                                                                                          |

### b) Type consommé

```ts
type Props = {
  doc: DocumentFiche;
  mode: FicheMode;
  numero?: number;
  categorieGlyph?: string;
  onClick?: () => void;
};
```

Reçoit `FicheMode` — c'est le seul renderer, avec `FicheRenderer`-driven, à recevoir un `mode` explicite.

### c) Structures gérées

❌ Aucune. `DocumentFiche` expose `rendererDocument?` (multi-éléments) mais `DocCard` **ne lit pas** ce champ. Un document perspectives affiche seulement `doc.contenu` / `doc.image_url` (élément 1).

### d) Footnotes

❌ Aucune extraction. `doc.contenu` est injecté en texte brut, pas en HTML — les `<sup>` apparaissent comme texte.

### e) Légende sur image

❌ Ni overlay ni figcaption. `imageLegende` / `imageLegendePosition` sont ignorés.

### f) Qualité

- **Séparation :** ⚠️ 3 modes de rendu très différents dans un seul fichier (227 lignes, 4 composants internes : `DocCard`, `DocMetaLine`, `DocMetaChips`, `SourceCitation`, `DocCardSkeleton`).
- **Preview texte sans sanitize :** 👎 `<p>{doc.contenu}</p>` rend le HTML comme texte — affichage correct pour l'aperçu, mais fragile (si on voulait vraiment le HTML, il faudrait `stripHtmlToPlainText`).
- **Skeleton intégré :** 👍 fallback UX propre si document incomplet.
- **Métadonnées enrichies :** 👍 meilleure que `DocumentCardCompact` — chips, ligne méta, catégorie avec glyph, pastille numérotée.
- **Couplage au mode :** ⚠️ la prop `mode` est utilisée mais uniquement pour choisir des branches cosmétiques (thumbnail = 1 ligne, sommaire = pas de contenu, lecture = avec contenu). Pas de vrai changement de contenu rendu.
- **Pas de FicheMode étendu :** FicheMode = `thumbnail | sommaire | lecture` mais le composant a en plus un mode implicite « vue détaillée » activé par `numero != null`, qui n'est pas exposé comme FicheMode.

---

## 5. DocumentCardCompact

**Fichier :** [components/tache/fiche/DocumentCardCompact.tsx](../../components/tache/fiche/DocumentCardCompact.tsx)
**Rôle :** carte compacte pour le sommaire wizard tâche (`components/tache/fiche/SectionDocuments.tsx`).

### a) Champs rendus

| Champ                    | Rendu ? | Comment                                                                                          |
| ------------------------ | ------- | ------------------------------------------------------------------------------------------------ |
| `titre`                  | ✅      | `<p>` semibold préfixé `Document {letter} — titre`                                               |
| `contenu` texte          | ⚠️      | `<p>{doc.contenu}</p>` — rendu texte brut, pas de HTML parsing                                   |
| `contenu` image          | ⚠️      | `next/image` 80×80 `object-cover`                                                                |
| `source_citation`        | ✅      | `dangerouslySetInnerHTML` + `sourceCitationDisplayHtml`                                          |
| `image_legende`          | ✅      | `DocumentImageLegendOverlay` en mode `compact` — **le seul renderer à utiliser le mode compact** |
| `image_legende_position` | ✅      | Passé à l'overlay                                                                                |
| `imagePixelWidth/Height` | ❌      | Ignoré                                                                                           |
| `echelle`                | ❌      | Ignoré                                                                                           |
| `footnotes`              | ❌      | Aucune extraction                                                                                |
| `repere_temporel`        | ❌      | Pas rendu                                                                                        |
| `sous_titre`             | ❌      | N/A                                                                                              |
| `auteur` élément         | ❌      | N/A                                                                                              |
| `structure perspectives` | ❌      | Aucun chemin multi                                                                               |
| `structure deux_temps`   | ❌      | Idem                                                                                             |
| `sourceType`             | ❌      | Pas de chip source type (présent dans `DocumentFiche` via `sourceType`)                          |
| `categorieLabel`         | ❌      | Pas de ligne catégorie                                                                           |

### b) Type consommé

```ts
type Props = { doc: DocumentFiche };
```

### c) Structures gérées

❌ Aucune. Comme `DocCard`, ignore `rendererDocument`.

### d) Footnotes

❌ Aucune extraction.

### e) Légende sur image

✅ Avec mode `compact` de `DocumentImageLegendOverlay` — **seul renderer à exploiter ce mode**.

### f) Qualité

- **Séparation :** ⚠️ bloc monolithique (117 lignes, 3 layouts cascadés inline : skeleton, iconographique, textuel). Pas de sous-composants extraits.
- **Duplication avec DocCard :** 👎 skeleton identique à `DocCardSkeleton`, `SourceCitation` inline répétée.
- **Preview texte incomplet :** 👎 comme `DocCard`, affiche `{doc.contenu}` brut — problème si HTML.
- **Mode compact overlay :** 👍 seule implémentation qui utilise `compact` — différenciateur positif.
- **Couverture edge-cases :** 👍 skeleton si incomplet, placeholder `image` icon si pas d'URL.

---

## 6. PrintableDocumentCell

**Fichier :** [components/tache/wizard/preview/PrintableFichePreview.tsx:72-202](../../components/tache/wizard/preview/PrintableFichePreview.tsx#L72-L202)
**Rôle :** cellule document dans l'aperçu imprimable wizard TAÉ. Bifurque selon `rendererDocument.elements.length > 1` (multi vs simple).

### a) Champs rendus

| Champ                     | Rendu ? | Comment                                                                                                                                                                               |
| ------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `titre`                   | ✅      | Zone header, `documentHeaderLine`, numéro (lettre) en badge                                                                                                                           |
| `contenu` texte           | ✅      | Chemin simple : `dangerouslySetInnerHTML` + `sanitize(bodyHtml)`. Chemin multi : délégué à `DocumentElementRenderer`                                                                  |
| `contenu` image           | ✅      | Chemin simple : `<img src={doc.image_url}>` avec `width={doc.imagePixelWidth}` et `height={doc.imagePixelHeight}`. Chemin multi : via `DocumentElementRenderer` (taille fixe 660×400) |
| `source_citation`         | ✅      | `PrintableSourceLine` hors cadre via `sourceCitationDisplayHtml`, fallback « — »                                                                                                      |
| `image_legende`           | ✅      | Chemin simple : `DocumentImageLegendOverlay` direct. Chemin multi : via `DocumentElementRenderer`                                                                                     |
| `image_legende_position`  | ✅      | Idem                                                                                                                                                                                  |
| `imagePixelWidth/Height`  | ✅      | **Seul renderer** à utiliser ces champs pour dimensionner l'image réelle en chemin simple                                                                                             |
| `echelle`                 | ❌      | Non lu (le champ `DocumentFiche.printImpressionScale` n'est pas exploité ici)                                                                                                         |
| `footnotes`               | ⚠️      | Chemin multi : ✅ via `DocumentElementRenderer`. Chemin simple : ❌ — `FootnoteDefinitions` non appelé                                                                                |
| `repere_temporel` élément | ✅      | Chemin multi seulement                                                                                                                                                                |
| `sous_titre` élément      | ✅      | Chemin multi seulement                                                                                                                                                                |
| `auteur` élément          | ✅      | Chemin multi, `showAuteur = (structure === "perspectives")`                                                                                                                           |
| `structure perspectives`  | ✅      | Chemin multi                                                                                                                                                                          |
| `structure deux_temps`    | ✅      | Chemin multi                                                                                                                                                                          |
| `sourceType` (doc)        | ❌      | N/A pour le rendu intrinsèque                                                                                                                                                         |

### b) Type consommé

```ts
{ doc: DocumentFiche; documentHeaderLabel?: string }
```

Utilise `doc.rendererDocument` optionnel pour basculer en chemin multi.

### c) Structures gérées

✅ Les 3 dans le chemin multi (via `rendererDocument`) ; ⚠️ **seulement `simple`** dans le chemin direct. Bascule contrôlée par `rd && rd.elements.length > 1`. Si `rendererDocument.elements.length === 1`, c'est le chemin simple qui est utilisé (même si `structure === "perspectives"` formellement, ce qui ne devrait pas arriver d'après le contrat).

### d) Footnotes

⚠️ **Incohérent** — actives seulement sur le chemin multi (`DocumentElementRenderer` les extrait). Chemin simple (structure `simple`, cas le plus fréquent) : **aucune extraction**, les `<sup>` apparaissent tels quels.

### e) Légende sur image

✅ Les deux chemins. Chemin multi via `DocumentElementRenderer`, chemin simple inline.

### f) Qualité

- **Séparation :** 👎 un seul composant avec deux chemins parallèles — 130 lignes de rendu, duplication de la logique header / grid / source entre le chemin multi et le chemin simple.
- **Utilisation correcte de `imagePixelWidth/Height` :** 👍 **seul renderer** à respecter les dimensions d'origine de l'image. Important pour la fidélité pixel-perfect du wizard.
- **Délégation partielle :** ⚠️ délègue uniquement pour multi-éléments. Pour simple, réimplémente tout (image, texte, légende, source).
- **Incohérence footnotes :** 👎 bug fonctionnel — un document `simple` avec notes perd ses notes en aperçu wizard.
- **CSS cohérent :** 👍 utilise `printable-fiche-preview.module.css` — la **seule feuille de styles print** partagée par `DocumentCard`, `DocumentCardPrint`, `DocumentElementRenderer`, `PrintableDocumentCell`.

---

## 7. DocumentFicheRead (code mort)

**Fichier :** [components/documents/DocumentFicheRead.tsx](../../components/documents/DocumentFicheRead.tsx)
**Rôle :** destiné à être une fiche de lecture autonome pour `/documents/[id]`. **Aucun import trouvé** dans le codebase (confirmé phase 3, [§6 références](phase3-invariants-rendu.md#6-références-de-code-clés)).

### a) Champs rendus

| Champ                                                             | Rendu ? | Comment                                                                                                                                              |
| ----------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `titre`                                                           | ✅      | `<h1>` 2xl bold dans header                                                                                                                          |
| `contenu` texte (`contenuHtml`)                                   | ✅      | `dangerouslySetInnerHTML` + `sanitize()` dans carte bordée `rounded-xl bg-panel-alt p-4`                                                             |
| `contenu` image (`imageUrl`)                                      | ✅      | `<figure>` avec `<img>` `object-contain`, max-h 70vh. **Distingue PDF** via `isDocumentPdfUrl()` — affiche lien « ouvrir dans nouvel onglet » si PDF |
| `source_citation`                                                 | ✅      | `<dd>` via `sourceCitationDisplayHtml` dans panneau indexation droite                                                                                |
| `image_legende` (`legendText`)                                    | ✅      | `DocumentImageLegendOverlay` **ET** fallback `<figcaption>` si `legendPosition === null` — seul renderer à gérer les deux                            |
| `image_legende_position`                                          | ✅      | Idem                                                                                                                                                 |
| `imagePixelWidth/Height`                                          | ❌      | Ignoré                                                                                                                                               |
| `echelle`                                                         | ❌      | Ignoré                                                                                                                                               |
| `footnotes`                                                       | ❌      | Aucune extraction                                                                                                                                    |
| `repere_temporel`                                                 | ❌      | Non exposé par `DocumentFicheReadProps`                                                                                                              |
| `sous_titre`                                                      | ❌      | N/A                                                                                                                                                  |
| `auteur` élément                                                  | ❌      | N/A — prop `authorName` = auteur du document (publicateur) rendu dans panneau indexation                                                             |
| `structure perspectives`                                          | ❌      | Aucun chemin multi (le type `DocumentFicheReadProps` n'expose pas `structure` ni `elements[]`)                                                       |
| `structure deux_temps`                                            | ❌      | Idem                                                                                                                                                 |
| `sourceType`                                                      | ✅      | `MetaPill` dans header + `MetaRow` dans indexation                                                                                                   |
| `niveauLabels` / `disciplineLabels` / `aspectsStr` / `connLabels` | ✅      | Panneau indexation droite                                                                                                                            |
| `iconoCategoryLabel`                                              | ✅      | `MetaPill` dans header si type iconographique                                                                                                        |
| `created`, `authorName`, `usageCaption`                           | ✅      | Panneau indexation droite                                                                                                                            |

### b) Type consommé

```ts
type DocumentFicheReadProps = {
  titre: string;
  docType: "textuel" | "iconographique";
  sourceType: "primaire" | "secondaire";
  sourceCitation: string;
  niveauLabels: string;
  disciplineLabels: string;
  aspectsStr: string;
  connLabels: string;
  authorName: string;
  created: string;
  usageCaption: string;
  contenuHtml: string | null;
  imageUrl: string | null;
  legendText: string;
  legendPosition: DocumentLegendPosition | null;
  iconoCategoryLabel?: string | null;
};
```

**Props flat**, pas de réutilisation des contrats typés (`DocumentFiche`, `RendererDocument`).

### c) Structures gérées

❌ Aucune. Contrat flat, pas de `structure` ni `elements[]`. Hérité d'une époque pré-multi-éléments.

### d) Footnotes

❌ Aucune.

### e) Légende sur image

✅ **Meilleur traitement du panel** : overlay sur image **OU** figcaption en fallback si `legendPosition === null`. Distinction `haut_gauche|haut_droite|bas_gauche|bas_droite` + fallback légende « libre » (caption sous la figure).

### f) Qualité

- **Séparation :** ⚠️ monolithique (252 lignes, un composant). Mais la structure visuelle est soignée (header + 2 colonnes indexation).
- **Détection PDF :** 👍 **unique renderer** à gérer `isDocumentPdfUrl()` et fallback lien — comportement utile pour documents iconographiques uploadés en PDF.
- **Fallback figcaption :** 👍 traite le cas `legendPosition === null && legendText !== ""` (légende sans position → figcaption sous la figure). Les autres renderers perdent silencieusement la légende dans ce cas.
- **Design system cohérent :** 👍 utilise `FICHE_HAIRLINE_RULE`, `FICHE_SECTION_TITLE_CLASS`, `FICHE_BODY_SECTION_*`, `MetaPill`, `MetaRow` — très alignées sur les primitives `lib/fiche/`.
- **Copy centralisé :** 👍 toutes les chaînes viennent de `ui-copy.ts` (`DOCUMENT_FICHE_EYEBROW`, `DOCUMENT_FICHE_PDF_OPEN_NEW_TAB`, etc.).
- **Contrat flat :** 👎 duplique l'information qui existe déjà dans `DocumentFiche`. Impossible de passer `rendererDocument`.
- **Verdict :** composant de qualité, mais conçu avant les structures multi-éléments. Mort aujourd'hui parce que la fiche document `/documents/[id]` passe par `FicheRenderer + DOC_FICHE_SECTIONS` (qui délègue à `DocumentCard`).

---

## 8. DocumentCardThumbnail

**Fichier :** [components/documents/DocumentCardThumbnail.tsx](../../components/documents/DocumentCardThumbnail.tsx)
**Rôle :** miniature cliquable pour la liste banque documents (`BankDocumentsPanel`).

### a) Champs rendus

| Champ                    | Rendu ? | Comment                                                                                                            |
| ------------------------ | ------- | ------------------------------------------------------------------------------------------------------------------ |
| `titre`                  | ✅      | `<h3>` `line-clamp-2`, prefixé par `categoryIcon`                                                                  |
| `contenu` texte          | ⚠️      | Preview : `stripHtmlToPlainText(contenuHtml)` tronqué à 120 chars — **pas le HTML complet**                        |
| `contenu` image          | ⚠️      | `<img src={imageUrl}>` `object-cover` dans carré ratio 77/100 — preview, pas taille réelle                         |
| `source_citation`        | ❌      | Non rendue (c'est une miniature, intentionnel)                                                                     |
| `image_legende`          | ❌      | Non                                                                                                                |
| `image_legende_position` | ❌      | Non                                                                                                                |
| `imagePixelWidth/Height` | ❌      | Ignoré                                                                                                             |
| `echelle`                | ❌      | Ignoré                                                                                                             |
| `footnotes`              | ❌      | Non (`stripHtmlToPlainText` élimine les `<sup>`)                                                                   |
| `repere_temporel`        | ❌      | Non exposé                                                                                                         |
| `sous_titre`             | ❌      | N/A                                                                                                                |
| `auteur` élément         | ❌      | N/A                                                                                                                |
| `structure`              | ✅      | **Badge structure** : `documentStructureBadgeLabel(structure, elementCount)` — ex. « 3 perspectives », « 2 temps » |
| `elementCount`           | ✅      | Incorporé au label structure                                                                                       |
| `sourceType`             | ✅      | Badge `counter_1`/`counter_2` + label « Primaire »/« Secondaire »                                                  |
| `categorieId`            | ✅      | Icône Material Symbols en tête de titre                                                                            |

### b) Type consommé

```ts
type Props = {
  id: string;
  titre: string;
  type: "textuel" | "iconographique";
  sourceType: "primaire" | "secondaire";
  structure: "simple" | "perspectives" | "deux_temps";
  elementCount: number;
  contenuHtml: string | null;
  imageUrl: string | null;
  categorieId: string | null;
};
```

**Props flat**, pas `DocumentFiche`. Ne passe pas par `rendererDocument`. Le preview est construit à partir de l'élément 1 seulement.

### c) Structures gérées

⚠️ **Métadonnée seulement** — affiche un badge « 3 perspectives » / « 2 temps » / « simple », mais **ne rend pas** le contenu multi-élément. Pour une miniature, c'est acceptable par design (un thumbnail n'est pas un aperçu plein).

### d) Footnotes

❌ Éliminées par `stripHtmlToPlainText`.

### e) Légende sur image

❌ Non rendue (intentionnel — c'est une miniature).

### f) Qualité

- **Séparation :** 👍 propre, un seul composant ciblé (~110 lignes), primitive `truncateText` locale réutilisable.
- **Contrat adapté à son rôle :** 👍 props flat mais légères, conçues pour un listing banque. Pas de gaspillage de `DocumentFiche` complet quand seul le preview compte.
- **Badges riches :** 👍 seul renderer à afficher `documentStructureBadgeLabel` (valeur métier visible pour l'enseignant qui cherche un document).
- **Icône catégorie :** 👍 `getCategoryIcon(categorieId)` ou fallback `getDocumentTypeIcon(type)` — robuste.
- **Limitation assumée :** 👌 par design, ce n'est pas un renderer de contenu mais un « pointeur visuel ». **Non-violation INV-R1** si on accepte que le thumbnail a un rôle distinct.
- **Aspect ratio fixe :** 👍 `aspect-[77/100]` — approxime le ratio Letter US, bon indice visuel.

---

## 9. Matrice comparative

Légende : ✅ rendu correctement, ⚠️ rendu partiel / avec caveat, ❌ non rendu, — non applicable (type consommé n'expose pas le champ).

| Capacité                          | DocumentCard        | CardPrint          | SectionDoc          | DocCard         | Compact         | Printable              | FicheRead           | Thumbnail      |
| --------------------------------- | ------------------- | ------------------ | ------------------- | --------------- | --------------- | ---------------------- | ------------------- | -------------- |
| **Contrat**                       | `RendererDocument`  | `RendererDocument` | `DocumentReference` | `DocumentFiche` | `DocumentFiche` | `DocumentFiche` (+ rd) | flat                | flat           |
| `titre`                           | ✅                  | ✅                 | ✅                  | ✅              | ✅              | ✅                     | ✅                  | ✅             |
| `contenu` texte (HTML sanitize)   | ✅                  | ✅                 | ⚠️ sans sanitize    | ⚠️ texte brut   | ⚠️ texte brut   | ✅                     | ✅                  | ⚠️ stripToText |
| `contenu` image                   | ✅ 660×400          | ✅ 660×400         | ✅ `<img>`          | ⚠️ vignette     | ⚠️ 80×80        | ✅ pixel exact         | ✅ fit              | ⚠️ preview     |
| `source_citation`                 | ✅                  | ✅ (hors cadre)    | ❌                  | ✅ legacy       | ✅              | ✅ (hors cadre)        | ✅                  | ❌             |
| `image_legende` overlay           | ✅                  | ✅                 | ❌                  | ❌              | ✅ compact      | ✅                     | ✅                  | ❌             |
| `image_legende_position`          | ✅ 4 pos            | ✅ 4 pos           | ❌                  | ❌              | ✅ 4 pos        | ✅ 4 pos               | ✅ 4 pos + fallback | ❌             |
| `legende` fallback figcaption     | ❌                  | ❌                 | ❌                  | ❌              | ❌              | ❌                     | ✅ seul             | ❌             |
| `imagePixelWidth/Height`          | ❌                  | ❌                 | ❌                  | ❌              | ❌              | ✅ seul                | ❌                  | ❌             |
| `echelle` (transform)             | ❌                  | ❌                 | ✅ seul             | ❌              | ❌              | ❌                     | ❌                  | ❌             |
| `footnotes` extraction            | ✅                  | ✅                 | ❌                  | ❌              | ❌              | ⚠️ multi seul          | ❌                  | ❌             |
| `repere_temporel` élément         | ✅                  | ✅                 | ❌                  | ✅ doc-niveau   | ❌              | ✅                     | ❌                  | ❌             |
| `sous_titre` élément              | ✅                  | ✅                 | ❌                  | ❌              | ❌              | ✅                     | ❌                  | ❌             |
| `auteur` élément                  | ✅                  | ✅                 | ❌                  | ❌              | ❌              | ✅                     | ❌                  | ❌             |
| `structure simple`                | ✅                  | ✅                 | ⚠️ implicite        | ⚠️ implicite    | ⚠️ implicite    | ✅                     | ⚠️ implicite        | ✅ badge       |
| `structure perspectives`          | ✅                  | ✅                 | ❌                  | ❌              | ❌              | ✅                     | ❌                  | ✅ badge       |
| `structure deux_temps`            | ✅                  | ✅                 | ❌                  | ❌              | ❌              | ✅                     | ❌                  | ✅ badge       |
| `sourceType` affiché              | ❌                  | ❌                 | ❌                  | ✅ chip         | ❌              | ❌                     | ✅ MetaPill         | ✅ badge       |
| `categorieLabel`/`categorieGlyph` | ❌                  | ❌                 | ❌                  | ✅              | ❌              | ❌                     | ✅                  | ✅             |
| PDF-URL fallback (icono)          | ❌                  | ❌                 | ❌                  | ❌              | ❌              | ❌                     | ✅ seul             | ❌             |
| Skeleton / placeholder            | ❌                  | ❌                 | ❌                  | ✅              | ✅              | ⚠️ slot text           | ⚠️ `—`              | ✅ icon        |
| Reçoit `mode` explicite           | ❌                  | ❌                 | ❌                  | ✅ `FicheMode`  | ❌              | ❌                     | ❌                  | ❌             |
| Délègue au canonique              | n/a (est canonique) | ✅ via DER         | ❌                  | ❌              | ❌              | ⚠️ multi seul          | ❌                  | ❌             |

Abréviations : `DER` = `DocumentElementRenderer`, `rd` = `rendererDocument`.

---

## 10. Recommandation pour le renderer unifié — « best of breed » par capacité

> **Note :** section purement descriptive, pas un plan de refactor. Indique, pour chaque capacité, l'implémentation **actuellement la plus solide** à utiliser comme référence si un renderer unifié devait être construit.

| Capacité                                | Meilleur renderer actuel                                                         | Justification                                                                                                                               |
| --------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dispatch structure**                  | `DocumentCard`                                                                   | Code propre et minimal ; distingue `simple` / `perspectives` / `deux_temps` sur un type sûr                                                 |
| **Layout 3 zones (print)**              | `DocumentCardPrint`                                                              | Zones explicites (titre / cadre / source), source hors cadre alignée par colonne                                                            |
| **Rendu atomique élément**              | `DocumentElementRenderer`                                                        | Seul composant à combiner : type (textuel/icono) + repere + sousTitre + auteur + source + footnotes + légende overlay                       |
| **Extraction footnotes TipTap**         | `DocumentElementRenderer` + `extractFootnotes()`                                 | Parser regex, résiste aux deux ordres d'attributs                                                                                           |
| **Légende image — overlay 4 positions** | `DocumentImageLegendOverlay` (utilisé par DER + Compact + Printable + FicheRead) | 4 positions CSS modules propres, mode `compact`                                                                                             |
| **Légende — fallback figcaption**       | `DocumentFicheRead`                                                              | Seul à gérer `legendPosition === null && legendText !== ""` → figcaption                                                                    |
| **Respect `imagePixelWidth/Height`**    | `PrintableDocumentCell` (chemin simple)                                          | Seul à passer `width`/`height` réels à `<img>` — fidélité pixel-perfect essentielle au wizard                                               |
| **PDF fallback iconographique**         | `DocumentFicheRead`                                                              | Seul à détecter via `isDocumentPdfUrl()` et proposer un lien « ouvrir »                                                                     |
| **Skeleton incomplet**                  | `DocCard` + `DocumentCardCompact`                                                | Deux skeletons identiques (duplication), mais bonne UX                                                                                      |
| **Thumbnail / miniature**               | `DocumentCardThumbnail`                                                          | Badge structure + elementCount + source type + icône catégorie — pas de prétention à rendre le contenu                                      |
| **Meta chips (banque / sommaire)**      | `DocCard.DocMetaChips`                                                           | Chips `source_type` + `repere_temporel` + `categorieLabel`                                                                                  |
| **Sanitization HTML contenu**           | `DocumentElementRenderer` (via `sanitize()`)                                     | Seul renderer texte à passer par `sanitize()` systématiquement                                                                              |
| **Affichage échelle image**             | `SectionDocument` (uniquement)                                                   | Utilise `transform: scale()` — à reprendre seulement si on conserve le paramètre `echelle` ; sinon `imagePixelWidth/Height` est plus propre |
| **Source citation HTML**                | `DocumentCardPrint.PrintSource` + fallback `—`                                   | Gère le cas vide avec tiret de remplacement                                                                                                 |
| **Numéro de document en bandeau**       | `DocumentCardPrint` (`<div className={documentNumero}>`)                         | Badge stylisé cohérent avec le CSS print                                                                                                    |

### Capacités absentes de tous les renderers

- **`repereTemporelDocument`** (niveau document, défini dans `RendererDocument` ligne 73) : **rendu par aucun renderer**. Champ défini mais non exploité.
- **Cohérence footnotes en chemin simple `PrintableDocumentCell`** : le chemin simple ne les extrait pas. Seul le chemin multi (via DER) les gère.

---

## 11. DocumentFicheRead — verdict

**Statut :** code mort confirmé. `ripgrep` ne trouve aucun import dans le codebase hors sa propre déclaration.

**Implémentations de qualité supérieure au renderer canonique actuel :**

| #   | Capacité                                                                     | Implémentation dans `DocumentFicheRead`                                                                                                                                                                                     | Présent dans canonique ?                                                                                    |
| --- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 1   | **Détection PDF + lien externe**                                             | `isDocumentPdfUrl(imageUrl)` → affiche paragraphe + `<a target="_blank">` avec copy `DOCUMENT_FICHE_PDF_OPEN_NEW_TAB` ([DocumentFicheRead.tsx:165-176](../../components/documents/DocumentFicheRead.tsx#L165-L176))         | ❌ non                                                                                                      |
| 2   | **Légende fallback figcaption**                                              | Si `legendPosition === null` **mais** `legendText !== ""`, rend un `<figcaption>` sous la figure au lieu de perdre la légende ([DocumentFicheRead.tsx:189-191](../../components/documents/DocumentFicheRead.tsx#L189-L191)) | ❌ non — `DocumentElementRenderer` ne rend la légende **que si** `legendePosition` est présent              |
| 3   | **Image `object-contain`** pour documents iconographiques non redimensionnés | `object-contain max-h-[min(70vh,32rem)]` — évite le crop inattendu                                                                                                                                                          | ⚠️ partiel — `DocumentElementRenderer` utilise une figure avec l'image fixée à 660×400 via `next/image`     |
| 4   | **Placeholders `—` pour champs vides** (texte manquant, image manquante)     | `<p>—</p>` explicite                                                                                                                                                                                                        | ⚠️ `DocumentCardPrint.PrintSource` le fait pour la source ; pas pour contenu vide                           |
| 5   | **Header sémantique avec eyebrow + type + structure metapills**              | `DOCUMENT_FICHE_EYEBROW` en exposant, `<h1>` titre, puis `MetaPill` type/icono/sourceType                                                                                                                                   | ❌ — le canonique ne produit qu'un `<p>` header simple                                                      |
| 6   | **Deux colonnes indexation** (`6fr / 4fr` dès `min-[800px]`)                 | Layout riche avec panneau indexation droit : niveau, discipline, aspects, connaissances, auteur, date, usage caption                                                                                                        | ❌ — le panneau indexation est dans `SectionDocIndexation` (pipeline FicheRenderer), non sur `DocumentCard` |

**Capacités équivalentes ou inférieures au canonique :**

- ❌ Pas de structures multi (`perspectives`, `deux_temps`)
- ❌ Pas de footnotes
- ❌ Pas de `imagePixelWidth/Height`
- ❌ Pas de source-citation positionnée « hors cadre »
- ❌ Pas de délégation à `DocumentElementRenderer`

**Verdict pour récupération avant suppression :**

Les deux capacités suivantes méritent d'être **captées** (dans un refactor ultérieur) avant que le fichier soit supprimé :

1. **Détection PDF + fallback lien** (`isDocumentPdfUrl` + `DOCUMENT_FICHE_PDF_OPEN_NEW_TAB`). Utilisateurs uploadent parfois des PDFs comme « document iconographique » ; le canonique rendra un `<img src={pdfUrl}>` cassé.
2. **Fallback figcaption pour légende sans position**. Perte silencieuse actuelle dans `DocumentElementRenderer` quand `legendePosition` est absent mais `legende` présent.

Les autres capacités (header riche, 2 colonnes, metapills) **sont déjà reproduites ailleurs** dans le design system : `SectionDocIndexation`, `MetaPill`, `MetaRow`, `FICHE_SECTION_TITLE_CLASS`, `DOCUMENT_FICHE_EYEBROW`. Elles ne justifient pas de conserver le composant.

**Recommandation opérationnelle :** documenter les 2 capacités ci-dessus dans un ticket de suivi, puis supprimer `DocumentFicheRead.tsx`. La suppression seule ne retire aucune fonctionnalité utilisée. Les 2 capacités à capter sont orthogonales à la suppression — elles peuvent être ajoutées à `DocumentElementRenderer` (pour figcaption) et à une couche enveloppante (pour PDF fallback, probablement `DocumentCard` ou un wrapper icono).

---

## 12. Observations transverses

### 12.1 Fragmentation de la sanitization HTML

- `DocumentElementRenderer` : `sanitize(element.contenu)` ✅
- `DocumentFicheRead` : `sanitize(contenuHtml)` ✅
- `PrintableDocumentCell` (chemin simple) : `sanitize(bodyHtml)` ✅
- `SectionDocument` : **sans sanitize** ❌
- `DocCard`, `DocumentCardCompact` : **texte brut** (pas de HTML parsing)

Risque sécurité modéré sur `SectionDocument` — le pipeline `/apercu/[token]` est alimenté par un payload KV signé, réduisant l'exposition, mais l'incohérence reste.

### 12.2 Fragmentation de la source-citation

- `sourceCitationDisplayHtml()` utilisé par : `DocumentElementRenderer`, `DocumentCardPrint.PrintSource`, `DocCard.SourceCitation`, `DocumentCardCompact`, `PrintableDocumentCell.PrintableSourceLine`, `DocumentFicheRead`.
- **6 implémentations d'enveloppe** autour du même helper — chacune avec son propre layout (hors cadre, en chip, en ligne, en dd, en grid par colonne). Pas d'abstraction partagée.

### 12.3 Fragmentation du skeleton

- `DocCard.DocCardSkeleton` et le bloc inline de `DocumentCardCompact` sont **identiques** (mêmes classes, même structure). Duplication pure.

### 12.4 Le « mode » n'est pas un paramètre du rendu intrinsèque

- Seul `DocCard` reçoit `mode: FicheMode` — mais il l'utilise pour choisir une **branche cosmétique**, pas pour changer ce qui est rendu du document.
- Les autres renderers ne reçoivent aucun mode : `DocumentCard`, `DocumentCardPrint`, `DocumentElementRenderer`, `SectionDocument`, `PrintableDocumentCell`, `DocumentCardCompact`, `DocumentFicheRead`, `DocumentCardThumbnail`.
- Ceci est **cohérent avec l'INV-R3 au niveau conceptuel** : le rendu intrinsèque ne dépend pas du mode. La variance est portée par le **conteneur**, pas par le renderer.

### 12.5 Dimensions d'image — trois stratégies divergentes

1. **660×400 fixe** (`next/image width/height`) : `DocumentCard`, `DocumentCardPrint`, `DocumentElementRenderer`. Simple mais ignore `imagePixelWidth/Height`.
2. **Pixel exact** (`imagePixelWidth`/`imagePixelHeight` passés à `<img>`) : `PrintableDocumentCell` chemin simple. **Seul renderer fidèle.**
3. **Transform scale** (`transform: scale(${echelle})`) : `SectionDocument` seul.

Trois stratégies pour trois pipelines. Aucune unification.

### 12.6 Structures multi-éléments — support réel

Sur les 8 renderers, **3 seulement** rendent réellement les structures `perspectives` et `deux_temps` :

- `DocumentCard` (canonique) ✅
- `DocumentCardPrint` ✅
- `PrintableDocumentCell` (chemin multi) ✅

Les 5 autres (`SectionDocument`, `DocCard`, `DocumentCardCompact`, `DocumentFicheRead`, `DocumentCardThumbnail`) perdent ou ignorent les éléments > 1. `DocumentCardThumbnail` est **excusable** (badge métadonnée), les 4 autres sont des violations.

---

## 13. Références de code

| Symbole                                      | Fichier                                                                                                                               |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `DocumentCard`                               | [components/documents/DocumentCard.tsx](../../components/documents/DocumentCard.tsx)                                                  |
| `DocumentElementRenderer`                    | [components/documents/DocumentElementRenderer.tsx](../../components/documents/DocumentElementRenderer.tsx)                            |
| `DocumentCardPrint`                          | [components/documents/DocumentCardPrint.tsx](../../components/documents/DocumentCardPrint.tsx)                                        |
| `SectionDocument`                            | [components/epreuve/impression/sections/document.tsx](../../components/epreuve/impression/sections/document.tsx)                      |
| `DocCard`                                    | [lib/fiche/primitives/DocCard.tsx](../../lib/fiche/primitives/DocCard.tsx)                                                            |
| `DocumentCardCompact`                        | [components/tache/fiche/DocumentCardCompact.tsx](../../components/tache/fiche/DocumentCardCompact.tsx)                                |
| `PrintableDocumentCell`                      | [components/tache/wizard/preview/PrintableFichePreview.tsx](../../components/tache/wizard/preview/PrintableFichePreview.tsx#L72-L202) |
| `DocumentFicheRead`                          | [components/documents/DocumentFicheRead.tsx](../../components/documents/DocumentFicheRead.tsx)                                        |
| `DocumentCardThumbnail`                      | [components/documents/DocumentCardThumbnail.tsx](../../components/documents/DocumentCardThumbnail.tsx)                                |
| `DocumentImageLegendOverlay`                 | [components/documents/DocumentImageLegendOverlay.tsx](../../components/documents/DocumentImageLegendOverlay.tsx)                      |
| `extractFootnotes`                           | [lib/documents/extract-footnotes.ts](../../lib/documents/extract-footnotes.ts)                                                        |
| `sanitize`                                   | [lib/fiche/helpers.ts](../../lib/fiche/helpers.ts)                                                                                    |
| `sourceCitationDisplayHtml`                  | [lib/documents/source-citation-html.ts](../../lib/documents/source-citation-html.ts)                                                  |
| `DocumentFiche` type                         | [lib/types/fiche.ts:8-36](../../lib/types/fiche.ts#L8-L36)                                                                            |
| `RendererDocument` / `DocumentElement` types | [lib/types/document-renderer.ts](../../lib/types/document-renderer.ts)                                                                |
| `DocumentReference` type                     | [lib/tache/contrats/donnees.ts:19-25](../../lib/tache/contrats/donnees.ts#L19-L25)                                                    |
