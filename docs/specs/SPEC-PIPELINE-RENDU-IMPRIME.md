# SPEC — Pipeline de rendu imprimé

**Version :** 1.3  
**Date :** 2026-05-09  
**Statut :** Validée (mockups approuvés, revue externe intégrée, audit conformité intégré)  
**Auteur :** Session de design collaboratif

---

## 0. Résumé exécutif

L'architecture en 6 couches du pipeline est saine. Le problème est un contrat mal défini entre les couches 2-3-4-5 qui provoque 7 bugs systémiques. Cette spec définit le contrat cible, les rendus pixel-perfect validés par mockup, et le plan d'exécution.

---

## 1. Diagnostic architectural

### 1.1 Ce qui reste

- Le pipeline en 6 couches (State → Mapper → Builders → Transformation → Renderer → CSS).
- `ApercuImpression` comme composant racine isomorphe unique.
- Le moteur de pagination avec `{ mode: "flow" | "exclusive-page" }`.
- DOMPurify + `dangerouslySetInnerHTML` pour le HTML généré.
- Les builders NR existants (leur contenu est correct, seule la structure de sortie change).

### 1.2 Ce qui change

- Le contrat entre les couches : introduction du type `FragmentsNR` pour les builders NR.
- `deduireEspaceProduction()` retourne `null` pour les NR (pas un objet vide — `null`).
- Le renderer discrimine par type (`string` vs `FragmentsNR`) au lieu de traiter tous les quadruplets pareil.
- Le corrigé passe d'un bloc séparé à un overlay (corrigé simple) + annexe optionnelle (corrigé détaillé).
- Les modes d'impression sont pilotés par l'UI, jamais hardcodés.
- Le CSS god file est éclaté en fichiers co-localisés par parcours.

---

## 2. Vocabulaire canonique

| Terme                         | Définition                                                                                                         |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Consigne**                  | Texte de la question posée à l'élève                                                                               |
| **Guidage**                   | Texte en italique entre la consigne et la zone d'options/espace de production. Visible uniquement en mode formatif |
| **Zone d'options de réponse** | Le dispositif visuel NR (grille 2×2, tableau avant/après, frise, liste de catégories, etc.)                        |
| **Espace de réponse**         | L'endroit où l'élève inscrit sa réponse (case lettre, cases numéros, lignes vierges)                               |
| **Grille d'évaluation**       | Tableau de critères et paliers de points                                                                           |
| **Corrigé simple**            | Overlay — même layout que la version élève, réponse inscrite en rouge                                              |
| **Corrigé détaillé**          | Corrigé simple + page annexe avec justifications et notes du correcteur                                            |

---

## 3. Contrat inter-couches

### 3.1 Type `FragmentsNR`

```typescript
type FragmentsNR = {
  intro: string; // HTML de la consigne textuelle
  corps: string; // HTML du dispositif visuel (grille, tableau, frise, liste...)
  reponse: string | null; // HTML de l'espace de réponse (null si intégré dans corps)
};
```

**Règle pour le corrigé simple NR :** la réponse rouge est injectée dans `reponse` si non-null (parcours avec case « Réponse : ☐ » séparée), sinon dans `corps` (parcours où les cases sont intégrées dans le dispositif visuel, comme manifestations et causes-conséquences). Le builder fournit une fonction `produireCorrigeSimple(fragments, reponseAttendue): FragmentsNR` qui retourne les fragments avec le marquage rouge appliqué au bon endroit.

### 3.2 Contrat du mapper et de la transformation

`construireConsigne()` (couche mapper) retourne `string` — inchangé. Le HTML brut (TipTap pour les rédactionnels, builder NR pour les NR) reste un `string` dans `DonneesTache.consigne`. Le type `DonneesTache` ne change pas.

La conversion vers `FragmentsNR` se fait dans la couche transformation (couche 4), pas dans le mapper :

- `construireBlocsTache()` et `construireBlocsQuestionnaire()` appellent `extraireFragmentsNR(consigne)` quand le parcours est NR.
- Le résultat est stocké dans `ContenuBlocQuadruplet.consigne: string | FragmentsNR`.
- Le renderer (couche 5) reçoit cette union et discrimine par type.

`deduireEspaceProduction()` retourne `EspaceProduction | null` :

- `{ type: "lignes", nbLignes }` pour les rédactionnels.
- `null` pour tous les parcours NR.

`construireGuidage()` reste inchangé : retourne `Guidage | null`.

### 3.3 Contrat du renderer (couche 5)

`SectionQuadruplet` fait un type guard :

```tsx
if (typeof consigne === "string") {
  // Rédactionnel : consigne → guidage → espace production séparé → grille
} else {
  // NR : intro → guidage → corps → reponse (si non-null) → grille
}
```

Un seul `if`, basé sur le type. Pas de flag booléen, pas d'enum de parcours.

### 3.4 Persistance — `FragmentsNR` n'est PAS stocké en DB

**Décision architecturale :** `tache.consigne` reste un `string` (HTML brut) en base Supabase. Les `FragmentsNR` sont dérivés au moment du rendu impression uniquement, par une fonction d'extraction dans le pipeline.

```typescript
// Dans le pipeline impression seulement — pas dans la persistance
function extraireFragmentsNR(consigneHtml: string): FragmentsNR;
```

**Conséquences :**

- La colonne `tache.consigne` (TEXT) en DB ne change pas. Pas de migration Supabase.
- Les strippers (`strip*ConsigneForTeacherDisplay`), les selectors (`selectConsigne`), les miniatures (`stripHtml(donnees.consigne)`), la sérialisation KV — tous continuent d'opérer sur un `string`. Aucun de ces consommateurs n'est impacté.
- Le type `DonneesTache.consigne` reste `string` dans le contrat de persistance. L'union `string | FragmentsNR` n'existe que dans le type local du pipeline impression (dans `ContenuBlocQuadruplet` et le renderer).
- La couche transformation (couche 4) appelle `extraireFragmentsNR()` au moment de construire les blocs d'impression, pas au moment de persister la tâche. Le mapper (couche 2) reste agnostique du format `FragmentsNR`.

**Pas de discriminant `kind` dans `FragmentsNR`.** Le renderer n'a pas besoin de savoir quel parcours NR il rend — il reçoit intro, corps, reponse et les assemble dans l'ordre. Le builder qui connaît le parcours est celui qui produit les fragments et celui qui produit le corrigé (`produireCorrigeSimple`). Le renderer reste générique.

### 3.5 Corrigé « overlay » — implémentation technique

Le mot « overlay » dans cette spec est conceptuel, pas technique. Il signifie : même layout que la version élève, réponse superposée en rouge. L'implémentation est une **injection de contenu HTML rouge dans les fragments**, pas un calque CSS avec `position: absolute` ou `z-index`.

**Pour les NR :** le builder fournit `produireCorrigeSimple(fragments, reponseAttendue): FragmentsNR`. Cette fonction retourne un nouveau `FragmentsNR` où le HTML de `reponse` (ou de `corps` si `reponse` est null) est modifié pour inclure la bonne réponse en rouge avec des bordures épaissies. Le renderer rend ces fragments modifiés exactement comme les fragments normaux — il ne sait pas qu'il rend un corrigé.

**Pour les rédactionnels :** le texte de la réponse attendue est injecté en rouge italique directement dans le HTML des lignes vierges. Le composant `LignesVierges` reçoit un prop optionnel `corrigeTexte: string | null` et, si non-null, positionne le texte sur les lignes.

**Ce que ça n'est pas :** pas de `z-index`, pas de `position: absolute`, pas de `mix-blend-mode`, pas de calque PDF-level. C'est du HTML modifié rendu par le même pipeline.

---

## 4. Règles de style globales — rendu imprimé

### 4.1 Typographie

- Font : `Arial, "Liberation Sans", Helvetica, sans-serif` partout, y compris dans les SVG (frise).
- Taille consigne : 11pt.
- Taille guidage : 10pt, italique, couleur secondaire (pas de `border-left`, pas de fond noir).
- Taille grille d'évaluation : 9pt.

### 4.2 Layout

- **Hanging indent** : le numéro de question (« 1. », « 18. ») est fixe à gauche. Tout le contenu (consigne, guidage, zone d'options, espace de réponse) vit dans la colonne indentée à droite. Le texte ne wrappe jamais sous le numéro.
- **Grille d'évaluation** : centrée horizontalement, hors du hanging indent (pleine largeur).

### 4.3 Lettres d'options

- Majuscules : A) B) C) D).
- Poids normal (pas en gras).

### 4.4 Espacement entre rangées d'options

- Gap de 4px entre chaque rangée A/B/C/D.

### 4.5 Bordures des tableaux d'options

- Bordures simples (1px) entre les cellules adjacentes d'une même rangée : la cellule de gauche a `border-right: none`, la cellule du milieu aussi. Seule la cellule de droite ferme le cadre.
- Les en-têtes (« Avant », « Après », noms de lieux) sont encadrés, même largeur que les cellules en dessous, avec 6px d'espacement vertical avant la première rangée d'options.

### 4.6 Lignes vierges (espace de production rédactionnel)

- Hauteur inter-ligne : **0.7cm** (constante nommée `PRINT_LINE_HEIGHT_CM`).
- Bordure : `0.5px solid` couleur primaire.
- Pleine largeur de la colonne indentée.

### 4.7 Listes à puces

- Indentation : **1.5cm** par rapport au texte de la consigne (`padding-left: 1.5cm`).
- Style : `list-style: disc` (points de forme, pas des tirets).
- Le texte long wrappe en suivant l'indentation (ne passe pas sous le point de forme).
- Règle de restauration CSS pour contrer Tailwind Preflight :

```css
.zone-imprimable ul {
  list-style: disc;
  padding-left: 1.5cm;
}
.zone-imprimable ol {
  list-style: decimal;
  padding-left: 1.5cm;
}
```

### 4.8 Sauts de page — dispositifs visuels NR

Les dispositifs visuels NR (frise, tableau avant/après, grille de catégories, tableau d'association) ne doivent jamais être coupés entre deux pages. Règle CSS :

```css
.zone-dispositif-nr {
  page-break-inside: avoid;
}
```

Le moteur de pagination existant gère le reste — si un dispositif ne tient pas sur la page courante, il passe à la suivante.

### 4.9 Couleurs — impression N&B

- Le corrigé utilise le rouge `#c0392b` pour le texte et les bordures épaissies.
- En impression noir et blanc, la distinction est portée par l'épaisseur des bordures (2px vs 1px), pas par la couleur seule.
- La frise (ligne du temps) utilise des teintes de gris (`#d9d9d9` / `#bfbfbf`) au lieu des couleurs teal.

---

## 5. Rendus par parcours NR — cibles pixel-perfect

### 5.1 Ordre chronologique (OI1)

**Structure :** consigne → guidage → grille 2×2 (4 options, chaque option = séquence de 4 cases numériques séparées par « – ») → case réponse « Réponse : ☐ » → grille d'évaluation centrée.

**Corrigé simple :** la bonne option est surlignée en rouge (lettre, cases, tirets, bordures 2px). La lettre apparaît dans la case réponse en rouge.

### 5.2 Ligne du temps (OI1)

**Structure :** consigne → guidage → frise SVG (ruban polygonal à pointes, segments alternés gris clair/foncé, lettres A-D dans des cases blanches centrées avec `dominant-baseline: central`, lignes de connexion vers les dates en Arial) → case réponse → grille centrée.

**Corrections sur le code existant :**

- Couleurs du ruban : teintes de gris (pas teal).
- Font SVG : `font-family: Arial, sans-serif` sur tous les `<text>`.
- Centrage lettres : `dominant-baseline="central"` sur les `<text>` dans les carrés.

### 5.3 Avant-après (OI1)

**Structure :** consigne → guidage → en-têtes « Avant » et « Après » encadrés (pas de cellule centrale dans l'en-tête) → 4 rangées A-D espacées de 4px, chaque rangée = 3 cellules (avant, année pivot, après) avec bordures simples → case réponse → grille centrée.

**Correction du builder :** remplacer le `rowspan="4"` de la cellule pivot par une cellule pivot répétée dans chaque rangée (incompatible avec le gap de 4px entre les rangées).

### 5.4 Carte historique (OI2)

**Trois sous-modes :**

**2.1 — Question simple :** consigne unique (un seul paragraphe, pas de séparation intro/question) → guidage → case réponse → grille centrée.

**2.2 — Tableau d'association :** consigne → guidage → en-têtes encadrés (noms des éléments géographiques, dynamiques) → 4 rangées A-D avec 2 colonnes de données + bordures simples + gap 4px → case réponse → grille centrée.

**2.3 — Liste avec cases inline :** consigne → guidage → liste à puces (chaque item = élément géographique en gras + case réponse inline sur la même ligne) → grille centrée. Pas de case réponse globale.

### 5.5 Manifestations (OI5)

**Deux variantes :**

**5.1 — 2 catégories × 2 cases :** consigne → instruction (« Inscrivez… ») → guidage → catégories empilées verticalement, chaque ligne = « Label : ☐ et ☐ ». Pas de bordures autour des cellules. Pas de case réponse séparée.

**5.2 — 4 catégories × 1 case :** consigne → instruction → guidage → grille 2×2 sans bordures, chaque cellule = « Label : ☐ ».

### 5.6 Causes-conséquences (OI4)

**Deux sous-modes NR :**

**4.3 — Deux facteurs :** consigne → guidage → un seul item « Deux facteurs explicatifs de [sujet] : ☐ et ☐ ». Grille « Déterminer des causes et des conséquences » à 3 paliers.

**4.4 — Cause + conséquence :** consigne + liste à tirets (cause / conséquence) → guidage → deux items empilés (« Une cause de [sujet] : ☐ » + « Une conséquence de [sujet] : ☐ »). Grille spécifique 4.4.

---

## 6. Rendus rédactionnels

### 6.1 Pattern générique

**Structure :** consigne (HTML TipTap) → guidage → lignes vierges (nombre configurable, défaut depuis `oi.json`) → grille centrée.

**Corrigé simple :** texte de la réponse attendue en rouge italique posé directement sur les lignes. Même nombre de lignes, zéro décalage — empilable sur la feuille élève.

### 6.2 OI4 rédactionnel (4.1 / 4.2)

- Consigne : 1 paragraphe TipTap (template « modèle souple »).
- Lignes : 3 par défaut.
- Grille : « Déterminer des causes et des conséquences », 3 paliers / 2 pts.

### 6.3 OI7 — Établir des liens de causalité (7.1)

- Consigne structurée : 2 paragraphes + liste à puces de 3 éléments (gabarit verrouillé).
- Puces : points de forme indentés à 1.5cm.
- Lignes : **6 par défaut** (modifier `oi.json` de 10 → 6).
- Grille : `OI7_SO1`, 4 paliers / 3 pts (composant pixel-perfect dédié `GrilleOI7SO1`).
- Notes du correcteur pré-remplies dans le Bloc 5.

---

## 7. Modes d'impression

### 7.1 Les 3 axes orthogonaux

| Axe     | Valeurs                                                    |
| ------- | ---------------------------------------------------------- |
| Entité  | `document` · `tache` · `epreuve`                           |
| Mode    | `formatif` · `sommatif-standard` · `epreuve-ministerielle` |
| Corrigé | `null` · `simple` · `detaille`                             |

```typescript
type ModeCorrige = "simple" | "detaille" | null;
```

### 7.2 Défauts par entité

| Entité      | Mode par défaut     | Corrigé par défaut |
| ----------- | ------------------- | ------------------ |
| Tâche seule | `formatif`          | `null`             |
| Épreuve     | `sommatif-standard` | `null`             |
| Document    | n/a                 | n/a                |

**Règle : le mode n'est jamais hardcodé dans le code.** Il vient toujours du state UI (navbar de l'aperçu).

### 7.3 Contenu par mode

| Bloc                           | formatif               | sommatif-standard   | épreuve-ministérielle |
| ------------------------------ | ---------------------- | ------------------- | --------------------- |
| En-tête + pagination           | ✅ (épreuve seulement) | ✅                  | ✅                    |
| Dossier documentaire séparé    | ❌                     | ✅ (titres masqués) | ✅ (titres masqués)   |
| Consigne                       | ✅                     | ✅                  | ✅                    |
| Guidage                        | ✅                     | ❌                  | ❌                    |
| Zone d'options de réponse (NR) | ✅                     | ✅                  | ✅                    |
| Espace de réponse              | ✅                     | ✅                  | ❌ (dans le cahier)   |
| Grille d'évaluation            | ✅                     | ✅                  | ✅                    |
| Cahier de réponses séparé      | ❌                     | ❌                  | ✅                    |

### 7.4 Cahier de réponses (épreuve ministérielle)

Chaque question dans le cahier contient :

- Numéro (hanging indent).
- Espace de réponse (case lettre pour les NR à réponse unique, cases « Label : ☐ » / « Label : ☐ et ☐ » pour les NR à catégories, lignes vierges pleine largeur pour les rédactionnels).
- Grille d'évaluation (la même qui apparaît dans le questionnaire — la grille est aux deux endroits).

### 7.5 Corrigé

**Corrigé simple :** calque parfait. Le layout est identique à la version élève, pixel pour pixel. Seule différence :

- NR : la bonne réponse apparaît en rouge dans l'espace de réponse (lettre dans la case, bordures épaissies sur la bonne option).
- Rédactionnel : le texte attendu apparaît en rouge italique sur les lignes.
- Zéro décalage — empilable sur la feuille élève.

**Corrigé détaillé :** le même corrigé simple, suivi d'une page annexe « Notes du correcteur » regroupant par question : réponse attendue + justification + notes du correcteur (si non-null).

---

## 8. Navbar modes d'impression (UI)

### 8.1 Design

Même pattern que le wizard tâche existant : pill buttons dans la barre supérieure de l'aperçu imprimé. **Deux groupes de boutons séparés** reflétant les deux axes orthogonaux (mode + corrigé).

### 8.2 Groupe 1 — Mode d'impression

**Tâche seule :** Formatif · Sommatif standard

**Épreuve :** Formatif · Sommatif standard · Épreuve ministérielle

**Document :** Pas de toggle (un seul mode).

### 8.3 Groupe 2 — Corrigé

**Tâche seule et épreuve :** Sans corrigé · Corrigé simple · Corrigé détaillé

### 8.4 Comportement combiné

Les deux groupes sont indépendants. L'utilisateur peut combiner n'importe quel mode avec n'importe quel corrigé (ex : « Formatif + Corrigé simple » pour voir le guidage avec les réponses). Le state est `{ mode: ModeImpression, corrige: ModeCorrige }`.

---

## 9. Contraintes et validations

### 9.1 Épreuve minimum 2 tâches

Une épreuve requiert un minimum de 2 tâches. Si l'utilisateur tente de créer une épreuve avec une seule tâche, afficher un message d'erreur orientant vers le téléchargement PDF en mode tâche seule. Validation avant génération.

### 9.2 Titre de tâche

Le titre visible par l'élève est le numéro (« 1. », « 2. »), pas l'énoncé du comportement attendu. L'énoncé est un metadata enseignant, pas un titre imprimé.

### 9.3 Divergence énoncés oi.json / grilles-evaluation.json

Les énoncés courts dans `oi.json` et les énoncés détaillés dans `grilles-evaluation.json` ne sont pas identiques. À corriger — les deux sources doivent être alignées.

---

## 10. Bugs résolus par cette spec

| Bug                                                         | Cause racine                                                                               | Résolution                                                                         |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| Bug 1 — Placeholders `{{doc_X}}` non résolus en tâche seule | `tache-vers-imprimable.ts` n'appelle pas `resoudreReferencesDocuments`                     | Extraire en utilitaire partagé, appeler sur les deux chemins                       |
| Bug 2 — Corrigé comme page séparée                          | Bloc corrigé paginé indépendamment                                                         | Corrigé simple = overlay. Corrigé détaillé = overlay + annexe                      |
| Bug 3 — Puces disparues                                     | Tailwind Preflight reset `list-style: none`                                                | Règle de restauration dans `.zone-imprimable`                                      |
| Bug 4 — Cases de réponse en doublon                         | Builders NR mettent les cases dans la consigne + renderer ajoute `SectionEspaceProduction` | `espaceProduction: null` pour les NR, guard dans le renderer                       |
| Bug 5 — Layout manifestations cassé                         | Conséquence du Bug 4                                                                       | Résorbé par le fix du Bug 4                                                        |
| Bug 6 — Guidage noir opaque                                 | Style inline `borderLeft: "2pt solid #000"`                                                | Classe CSS dédiée, italique, couleur secondaire, pas de bordure                    |
| Bug 7 — Cahier-réponses non rendu                           | Blocs sans `consigne` → type guard retourne `null`                                         | Nouveau type guard acceptant les blocs avec `espaceProduction` + `outilEvaluation` |

### Bug supplémentaire découvert

**Dossier documentaire absent dans l'aperçu épreuve :** `evaluation-apercu.ts:92` hardcode `mode: "formatif"` qui retourne un dossier vide par design. Fix : le mode vient de l'UI, défaut `sommatif-standard` pour les épreuves.

---

## 11. Migration CSS

### 11.1 Éclater globals.css

Les ~200 lignes de classes `[data-*-eleve]` sortent de `globals.css` vers :

```
styles/impression/
  base.css                    — styles de page, print, restauration des listes
  ordre-chronologique.css     — règles [data-ordre-chrono-eleve]
  ligne-du-temps.css          — règles [data-ligne-temps-eleve]
  avant-apres.css             — règles [data-avant-apres-eleve]
  carte-historique.css        — règles [data-carte-historique-eleve]
  manifestations.css          — règles [data-manifestations-eleve]
  causes-consequences.css     — règles [data-causes-consequences-eleve]
```

Chaque fichier est importé par `impression.css`. Les classes sont scopées par `data-*-eleve` — aucun effet hors contexte d'impression. `globals.css` perd ~200 lignes.

### 11.2 Vers un design system impression (proposition)

Une fois les fichiers CSS éclatés par parcours, des patterns communs vont émerger : le hanging indent du numéro, les lignes vierges, les cases de réponse, les lettres d'options. Ces patterns sont candidats à devenir des composants React réutilisables (`HangingNumber`, `LignesVierges`, `CaseReponse`, `OptionLettre`). Ce n'est pas un prérequis pour les phases 1-7 — c'est une évolution naturelle qui se fera quand les patterns seront visibles dans les fichiers CSS isolés. Les constantes d'impression (`PRINT_LINE_HEIGHT_CM = 0.7`, `PRINT_BULLET_INDENT_CM = 1.5`, `PRINT_OPTIONS_GAP_PX = 4`, `PRINT_CORRIGE_COLOR = "#c0392b"`) devraient être centralisées dans un fichier `styles/impression/tokens.ts` dès la Phase 3.

---

## 12. Plan d'exécution

### Phase 1 — Contrat inter-couches (résout Bugs 4, 5, 7)

**Fichiers :** `etat-wizard-vers-tache.ts`, `blocs-tache.ts`, `blocs-quadruplet.ts`, `quadruplet.tsx`, types associés.

1. Définir le type `FragmentsNR`.
2. Modifier chaque builder NR pour retourner `FragmentsNR` au lieu d'un `string`.
3. `deduireEspaceProduction()` retourne `null` pour les NR.
4. `SectionQuadruplet` : type guard `string` vs `FragmentsNR`.
5. Nouveau type guard pour les blocs cahier-réponses (accepte `espaceProduction` + `outilEvaluation` sans `consigne`).

### Phase 2 — Placeholders (résout Bug 1)

**Fichiers :** `tache-vers-imprimable.ts`, utilitaire partagé.

Extraire `resoudreReferencesDocuments`, appeler sur le chemin tâche seule. **Ordre critique :** la résolution des placeholders doit survenir immédiatement après la construction des blocs, avant toute transformation ou pagination — un placeholder tronqué par un saut de page est irrécupérable.

### Phase 3 — CSS impression (résout Bug 3)

**Fichiers :** `styles/impression/base.css`.

Restauration `list-style` + `padding-left: 1.5cm` sous `.zone-imprimable`.

### Phase 4 — Guidage (résout Bug 6)

**Fichiers :** `quadruplet.tsx`, `styles/impression/base.css`.

Supprimer le style inline. Classe CSS : italique, couleur secondaire, pas de bordure.

### Phase 5 — Corrigé (résout Bug 2)

**Fichiers principaux :** `blocs-tache.ts`, `blocs-corrige.ts`, `corrige.tsx`, `quadruplet.tsx`, `espace-production.tsx`.

**Fichiers impactés par le changement `estCorrige: boolean` → `ModeCorrige` :** `lib/impression/types.ts`, `tache-vers-imprimable.ts`, `epreuve-vers-paginee.ts`, `app/(apercu)/apercu/[token]/page.tsx`, `app/api/impression/apercu-png/route.ts`, `app/api/impression/token-draft/route.ts`, `hooks/partagees/use-apercu-png.ts`, `components/partagees/apercu-imprime-live/index.tsx`, `components/tache/wizard/index.tsx`, vues détaillées tâche + épreuve, `evaluation-apercu.ts`. Tests Playwright à régénérer.

Type `ModeCorrige = "simple" | "detaille" | null`. Corrigé simple = injection de contenu rouge dans les fragments/lignes (cf. §3.5). Corrigé détaillé = injection + page annexe. Supprimer `SectionCorrige` et `blocs-corrige.ts` une fois le nouveau chemin branché.

**C'est la phase à la plus large empreinte.** Anticiper 15+ fichiers touchés.

### Phase 6 — Modes d'impression UI

**Fichiers :** `evaluation-apercu.ts`, `EpreuveVueDetaillee`, `TacheVueDetaillee`, composant navbar toggle.

Supprimer tous les `mode: "formatif"` hardcodés. Le mode vient du state UI. Navbar avec les deux groupes de pill buttons (cf. §8).

### Phase 7 — CSS split (dette)

**Fichiers :** `globals.css` → `styles/impression/*.css`.

Migration mécanique, aucun bug résolu. Nettoyage pur.

**⚠ Risque de régression wizard :** l'aperçu live wizard (`ApercuImprimeLiveTache`, `ApercuImprimeLiveDocument`) charge `globals.css` mais PAS `impression.css`. Si les règles `[data-*-eleve]` déménagent vers `styles/impression/`, le wizard perd les styles NR. **Solution :** importer les fichiers CSS NR dans les deux layouts (le layout aperçu impression ET le layout wizard), ou créer un barrel `styles/impression/index.css` importé par les deux.

### Phase 8 — Corrections mineures

- Numérotation : numéro au lieu de l'énoncé du comportement.
- Frise : couleurs gris, font Arial, centrage lettres.
- Avant-après : `rowspan` → cellule pivot répétée par rangée.
- OI7 : `nb_lignes` 10 → 6 dans `oi.json`.
- Divergence énoncés `oi.json` / `grilles-evaluation.json`.

### Dépendances

```
Phase 1 ──→ résout Bugs 4, 5, 7
Phase 2 ──→ résout Bug 1 (indépendant)
Phase 3 ──→ résout Bug 3 (indépendant)
Phase 4 ──→ résout Bug 6 (plus propre après Phase 1)
Phase 5 ──→ résout Bug 2 (décision design validée)
Phase 6 ──→ résout dossier absent (indépendant)
Phase 7 ──→ dette pure (indépendant)
Phase 8 ──→ corrections mineures (indépendantes)
```

---

## 13. Règles non négociables

1. Brancher le nouveau, supprimer l'ancien. Zéro code mort.
2. Un composant = un job. Pas de doublons.
3. Pas de quickfix, pas de constantes magiques, pas de flags qui contournent un problème d'architecture.
4. Si un flag boolean est la solution, c'est probablement un symptôme, pas un fix.
5. Build + lint + tests 0 erreur après chaque changement.
6. Le mode d'impression n'est jamais hardcodé — il vient du state UI.
7. Les rendus imprimés doivent être pixel-perfect avec les mockups validés dans cette spec.
