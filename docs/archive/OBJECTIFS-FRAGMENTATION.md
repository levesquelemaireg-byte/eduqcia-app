# Objectifs de la fragmentation — pourquoi et vers quoi on va

Document de **contexte stratégique** à lire avec [archive/CONVENTIONS-FRAGMENTS.md](./archive/CONVENTIONS-FRAGMENTS.md) et [FRAGMENT-PLAYGROUND.md](./FRAGMENT-PLAYGROUND.md).

---

## État actuel du code

Les composants de rendu sont aujourd'hui **monolithiques** :

```
FicheTache.tsx                 ← fiche complète, mode "sommaire" | "lecture"
PrintableFicheFromTacheData.tsx  ← rendu print complet
TacheCard.tsx                    ← thumbnail complet
```

La logique de rendu est **éparpillée** à l'intérieur de ces composants via des conditions `if mode === "sommaire"`, des blocs inline, des styles couplés. Ce n'est pas du mauvais code — c'est une dette de _connaissance implicite_ qui grossit à chaque nouveau comportement ajouté.

---

## Ce qu'on veut atteindre

Des **fragments** : unités de rendu atomiques, autonomes, testables, réutilisables.

```
Aujourd'hui (monolithique)         →   Demain (fragmenté)

FicheTache                             ConsigneApp
  ├── consigne (inline)                ConsignePrint
  ├── grille (inline)                  GrilleCorrectionApp
  ├── documents (inline)               GrilleCorrectionPrint
  └── ...                              EspaceReponseNRApp
                                       EspaceReponseNRPrint
                                       BoiteDocumentPrint
                                       ...

FicheTache devient un assembleur :
  <ConsigneApp ... />
  <EspaceReponseNRApp ... />
  <GrilleCorrectionApp ... />
```

---

## Pourquoi — bénéfices concrets

### 1. Modifier une fois, propager partout

```
Sans fragments : changer la consigne = modifier FicheTache + PrintableFicheFromTacheData
                 + FicheSommaireColumn + espérer ne pas oublier un 4e endroit

Avec fragments : changer ConsigneApp = une modification, propagée dans tous les contextes
                 qui l'utilisent (wizard, sommaire, lecture, thumbnail, print, playground)
```

### 2. Ajouter un comportement sans réécrire

Chaque nouveau comportement (`coming_soon` → `active`) réutilise les fragments existants :

- `ConsignePrint` → identique pour tous les comportements
- `GrilleCorrectionPrint` → identique, seul `outilEvaluation` change
- Seul `EspaceReponseNRPrint` a une variante par comportement si la structure diverge

### 3. Tester en isolation

Le playground monte chaque fragment seul, avec des données mock, dans tous les contextes.
On voit immédiatement si un fragment casse en mode Print sans avoir à naviguer dans l'app.

### 4. Onboarder un collaborateur

`ConsignePrint.tsx` dit exactement ce qu'il fait et où il vit.
`FicheTache.tsx` avec 400 lignes et des conditions imbriquées, non.

### 5. Pipeline PDF sans surprise

Puppeteer rend `/questions/[id]/print` — si cette route est un assembleur de fragments
bien délimités, le PDF est pixel perfect par construction. Pas de surprise de mise en page
cachée dans un monolithe.

---

## Le playground comme outil de découverte

Le playground actuel (`/dev/fragments`) monte les vrais composants monolithiques.
C'est **voulu** — c'est l'étape intermédiaire.

```
Workflow de fragmentation :

1. Ouvrir le playground, sélectionner un comportement
2. Observer la fiche complète dans chaque contexte (Wizard / Sommaire / Lecture / Thumbnail / Print)
3. Identifier visuellement un bloc → "ça c'est ConsigneApp"
4. Extraire ce bloc dans components/fragments/ConsigneApp.tsx
5. Ajouter data-fragment="ConsigneApp" sur sa racine (pour le debug mode)
6. FicheTache importe ConsigneApp au lieu d'avoir le code inline
7. Vérifier dans le playground que les 5 contextes rendent correctement
8. Répéter pour le fragment suivant
```

**Le debug mode** du playground (toggle à activer) affiche les encadrés colorés
par fragment et leurs noms — il devient de plus en plus riche au fur et à mesure
que les fragments sont extraits et décorés avec `data-fragment`.

---

## Ordre de priorité d'extraction

### Priorité haute — fragments universels (tous comportements)

Ces fragments sont identiques quel que soit le comportement.
Un seul composant sert partout — gain immédiat maximal.

Colonne **Statut** : ⏳ à extraire, ✅ fait — à mettre à jour après chaque extraction (voir template de prompt).

| Fragment canonique            | App                   | Print                      | Statut |
| ----------------------------- | --------------------- | -------------------------- | ------ |
| `IdentificationEleveFragment` | —                     | `IdentificationElevePrint` | ⏳     |
| `EnteteEpreuveFragment`       | —                     | `EnteteEpreuvePrint`       | ⏳     |
| `ConsigneFragment`            | `ConsigneApp`         | `ConsignePrint`            | ⏳     |
| `GrilleCorrectionFragment`    | `GrilleCorrectionApp` | `GrilleCorrectionPrint`    | ⏳     |
| `PiedPageEpreuveFragment`     | —                     | `PiedPageEpreuvePrint`     | ⏳     |

### Priorité moyenne — fragments variables par comportement

Ces fragments ont une structure qui dépend du comportement (R vs NR, type de réponse).

| Fragment canonique                       | App    | Print    | Statut |
| ---------------------------------------- | ------ | -------- | ------ |
| `EspaceReponseEleveRedactionnelFragment` | `…App` | `…Print` | ⏳     |
| `EspaceReponseNonRedactionnelFragment`   | `…App` | `…Print` | ⏳     |

### Priorité basse — fragments documentaires

| Fragment canonique                      | App                | Print                | Statut |
| --------------------------------------- | ------------------ | -------------------- | ------ |
| `BoiteDocumentFragment`                 | `BoiteDocumentApp` | `BoiteDocumentPrint` | ⏳     |
| `ContenuDocumentTextuelFragment`        | `…App`             | `…Print`             | ⏳     |
| `ContenuDocumentIconographiqueFragment` | `…App`             | `…Print`             | ⏳     |

---

## Règle d'or

> **Ne jamais créer un fragment pour créer un fragment.**
> Un fragment se justifie quand il a une responsabilité de rendu distincte,
> testable indépendamment, et réutilisée dans au moins deux contextes.
> Si un bloc n'apparaît que dans un seul composant et n'a aucune chance
> d'être réutilisé, le laisser inline.

---

## Template de prompt pour extraire un fragment

À utiliser tel quel dans Cursor. Remplacer les valeurs entre `«»`.

```
Lis docs/OBJECTIFS-FRAGMENTATION.md et docs/CONVENTIONS-FRAGMENTS.md.

Dans le playground, contexte «Wizard | Sommaire | Lecture | Thumbnail | Print»,
fragment isolé «nom du fragment visible dans le debug mode»,
le debug mode montre un bloc «NomDuBloc» monolithique.

Extraire ce bloc en fragments selon les conventions :
- «NomFragment1App» → «description courte de sa responsabilité»
- «NomFragment2App» → «description courte de sa responsabilité»

Étapes :
1. Créer components/fragments/«NomFragment1App».tsx (et «NomFragment2App».tsx)
   — props typées depuis lib/types/fiche.ts (TacheFicheData ou sous-type)
   — data-fragment="«NomFragment1App»" sur la racine de chaque composant
2. «NomComposantParent» (ex. FicheTache, TacheCard) importe ces fragments
   au lieu du code inline correspondant
3. Vérifier dans le playground que le debug mode affiche les encadrés distincts
4. npm run lint && npm run build verts
5. Mettre à jour la colonne **Statut** du tableau « Ordre de priorité » pour la ligne concernée (⏳ → ✅) ; si le fragment n’y figure pas, ajouter une courte note sous le tableau
```

### Exemple concret — TacheCard / Thumbnail

```
Lis docs/OBJECTIFS-FRAGMENTATION.md et docs/CONVENTIONS-FRAGMENTS.md.

Dans le playground, contexte Thumbnail, fragment isolé "Carte — en-tête et extrait",
le debug mode montre un bloc TacheCardCorps monolithique.

Extraire ce bloc en deux fragments :
- EnteteCarteApp → icône OI + consigne tronquée (plainConsigneForMiniature)
- MetaCarteApp   → pastilles méta : niveau, discipline, aspects, OI

Étapes :
1. Créer components/fragments/EnteteCarteApp.tsx et MetaCarteApp.tsx
   — props typées TacheFicheData depuis lib/types/fiche.ts
   — data-fragment="EnteteCarteApp" et data-fragment="MetaCarteApp" sur leurs racines
2. TacheCard importe EnteteCarteApp et MetaCarteApp au lieu du code inline
3. Vérifier dans le playground Thumbnail que le debug mode affiche deux encadrés distincts
4. npm run lint && npm run build verts
5. Mettre à jour la colonne **Statut** dans docs/OBJECTIFS-FRAGMENTATION.md (lignes concernées : ⏳ → ✅)
```

---

## Références

| Sujet                  | Fichier                                                                |
| ---------------------- | ---------------------------------------------------------------------- |
| Conventions de nommage | [archive/CONVENTIONS-FRAGMENTS.md](./archive/CONVENTIONS-FRAGMENTS.md) |
| Playground DEV         | [FRAGMENT-PLAYGROUND.md](./FRAGMENT-PLAYGROUND.md)                     |
| Architecture générale  | [ARCHITECTURE.md](./ARCHITECTURE.md)                                   |
| Parcours NR            | [wizard-oi-non-redactionnelle.md](./wizard-oi-non-redactionnelle.md)   |
