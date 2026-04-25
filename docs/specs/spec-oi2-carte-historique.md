# Spec : Parcours non-rédactionnel `carte-historique` (OI2 — Situer dans l'espace)

**Projet :** ÉduQc.IA  
**Scope :** Implémentation complète du parcours wizard pour les 3 comportements de l'OI2  
**Date :** Avril 2026  
**Pattern de référence :** `ordre-chronologique` (OI1) — même architecture, logique métier différente  
**Prérequis :** `oi.json` et `grilles-evaluation.json` déjà corrigés (commit précédent)

---

## 1. Vue d'ensemble

L'OI2 « Situer dans l'espace » évalue la capacité de l'élève à identifier des éléments géographiques sur une carte historique. Le parcours wizard `carte-historique` couvre 3 comportements qui partagent le même slug mais diffèrent par la structure de la question et la grille de correction.

**Mécanique ministérielle invariante :** la carte historique fournie à l'élève porte **toujours 4 lettres A/B/C/D** qui identifient des zones / territoires. Pour le comportement 2.2 spécifiquement, la carte porte **aussi 4 chiffres 1/2/3/4** qui identifient des lieux précis ; les options A/B/C/D du tableau proposent alors quatre paires de chiffres, dont une seule correspond à l'association attendue. Le nombre de lettres et de chiffres n'est jamais variable.

| Comportement | Énoncé                                                            | Format question                                         | Espace production         | Grille                          |
| ------------ | ----------------------------------------------------------------- | ------------------------------------------------------- | ------------------------- | ------------------------------- |
| 2.1          | Identifier sur une carte un élément géographique ou un territoire | 1 lieu, réponse directe                                 | Réponse : □               | 2/0 (ou 1/0 si pondération 1pt) |
| 2.2          | Identifier sur une carte une association d'éléments géographiques | Tableau A/B/C/D, chaque ligne = paire de chiffres (1–4) | Réponse : □               | 2/0                             |
| 2.3          | Identifier sur une carte plusieurs éléments géographiques         | 2 lieux séparés, 2 réponses                             | • lieu 1 : □ • lieu 2 : □ | 2/1/0                           |

---

## 2. Workflow du wizard — étape par étape

### Étape 1 — Auteur(s)

Identique à tous les parcours. Seul ou en équipe. Rien de spécifique.

### Étape 2 — Paramètres pédagogiques

L'enseignant sélectionne :

- Niveau scolaire (Sec 1-4)
- Discipline (HEC, HQC, GEO)
- OI : « Situer dans l'espace » (icône `map_search`)
- Comportement attendu : menu déroulant avec les 3 options (2.1, 2.2, 2.3)

**Si comportement 2.1 sélectionné** → un menu déroulant supplémentaire apparaît :

- Label : « Pondération »
- Options : « 1 point » / « 2 points »
- Défaut : « 2 points »
- Ce choix détermine la grille assignée (OI2_SO1_1PT ou OI2_SO1)
- Implémentation : nouvelle action `SET_OUTIL_EVALUATION_OVERRIDE` qui change uniquement `bloc2.outilEvaluation` sans réinitialiser les blocs en aval. L'enseignant peut basculer la pondération à tout moment sans perdre ses saisies.

Ce que l'app fait au choix du comportement :

- Résout `variant_slug = "carte-historique"`
- Bascule l'étape 3 en mode non-rédactionnel (`Bloc3CarteHistorique`)
- Fige `nb_documents = 1` (une seule carte)
- Assigne l'outil d'évaluation selon le comportement (et la pondération pour 2.1)
- Active `requiresRepereTemporel: true` sur le document
- Verrouille le blueprint

L'espace de production n'est pas distinct : la zone de réponse est intégrée à la consigne HTML publiée (même pattern qu'`ordre-chronologique`). `deduireEspaceProduction` retourne `{ type: "cases", options: ["A","B","C","D"] }` pour cohérence du contrat, mais le rendu visible vient du HTML consigne.

### Étape 3 — Consigne et guidage

Le template de consigne varie selon le comportement choisi. Chaque template a des zones éditables (soulignées en teal) dans un texte ministériel fixe.

**Comportement 2.1 — Identification simple :**

```
Consultez le document {{doc_1}}.

Quelle lettre (A, B, C ou D) correspond à _______ ?
```

- 1 champ éditable : le territoire ou fait géographique (ex: "le territoire occupé par les Premières Nations de la famille algonquienne")
- Max 120 caractères, compteur `LimitCounterPill` orange à 100

**Comportement 2.2 — Association groupée :**

```
Consultez le document {{doc_1}}.

Quelle lettre (A, B, C ou D) présente les chiffres qui correspondent
à l'emplacement de ces éléments ?

_______ et _______
```

- 2 champs éditables : les 2 territoires/éléments à associer (ex: "l'Acadie" et "la vallée du Saint-Laurent")
- Max 60 caractères chacun, compteur orange à 50

**Comportement 2.3 — Identification multiple :**

```
Consultez le document {{doc_1}}.

Quelle lettre (A, B, C ou D) correspond :

• à _______ ?
• à _______ ?
```

- 2 champs éditables : les 2 lieux à identifier séparément
- Max 80 caractères chacun, compteur orange à 65

**Guidage complémentaire :**

- Éditeur TipTap libre — **aucun texte pré-assigné, aucun verrouillage**
- L'enseignant écrit ce qu'il veut ou laisse complètement vide
- Optionnel : pas de gate, pas de validation, jamais auto-généré
- Le guidage apparaît en mode formatif seulement (masqué en sommatif)

**Gate :** L'étape est complète quand tous les champs éditables de la consigne sont remplis (après trim). Le guidage n'entre pas dans la gate.

### Étape 4 — Document historique (1 slot)

- 1 seul slot de document (la carte)
- L'enseignant crée ou sélectionne un document iconographique : carte historique portant les 4 lettres A/B/C/D (et, pour 2.2, les 4 chiffres 1/2/3/4)
- `requiresRepereTemporel: true` — le repère temporel est obligatoire pour l'indexation (ex: « 1763 » pour une carte post-Proclamation royale)
- Mêmes options que les autres parcours : créer depuis la banque ou créer un nouveau document inline
- **Aucun champ supplémentaire** — pas de saisie « combien de chiffres sur la carte » ; le nombre est invariant (2.2 = toujours 4 chiffres). La saisie des bons chiffres se fait à l'étape 5.

**Gate :** Le slot est complet quand le document a un titre + une image + un repère temporel + une source.

### Étape 5 — Corrigé et options de réponse

Le corrigé diffère fortement selon le comportement.

**Comportement 2.1 — Saisie directe :**

L'enseignant voit :

- Label : « Quelle est la bonne réponse ? »
- 4 boutons radio : A, B, C, D
- Il clique sur la bonne lettre. C'est tout.
- Pas de génération automatique, pas de distractrices.

Le corrigé HTML construit : « Réponse attendue : C. »

**Comportement 2.2 — Génération semi-automatique :**

La carte porte **toujours** les 4 chiffres `{1, 2, 3, 4}`. L'enseignant n'a donc à saisir que la bonne association ; l'app génère automatiquement les distractrices et le tableau A/B/C/D.

Sous-étape 1 — L'enseignant entre les bons chiffres :

- L'app affiche les 2 territoires saisis à l'étape 3 (ex: « Acadie » et « Vallée du Saint-Laurent »)
- Pour chaque territoire, un sélecteur 1–4 : « Chiffre sur la carte pour l'Acadie : ** » et « Chiffre sur la carte pour la Vallée du Saint-Laurent : ** »
- L'enseignant choisit la bonne paire (ex : 4 et 2). Les deux chiffres doivent être différents.
- Bouton « Générer les options »

Ce que l'app fait au clic sur « Générer les options » :

1. Énumère toutes les paires `(c1, c2)` avec `c1 ∈ {1,2,3,4}`, `c2 ∈ {1,2,3,4}`, `c1 ≠ c2` — soit 12 paires ordonnées
2. Retire la paire correcte (ex : `(4, 2)`)
3. Mélange les 11 paires restantes et en prend 3 comme distractrices
4. Mélange les 4 paires (correcte + 3 distractrices) → assigne A, B, C, D
5. Note la lettre où se trouve la bonne réponse

Sous-étape 2 — Vérification :

- L'app affiche le tableau généré :
  ```
           ACADIE    ST-LAURENT
  A)         3           1
  B)         4           2      ✓ BONNE RÉPONSE
  C)         3           2
  D)         4           1
  ```
- Badge teal : « Réponse attendue : B »
- Boutons : « Régénérer » (re-mélange) / « Recommencer » (efface tout)

Le corrigé HTML construit : le tableau + « Réponse attendue : B. »

**Comportement 2.3 — Saisie directe multiple :**

L'enseignant voit les 2 lieux saisis à l'étape 3 :

- « Réponse pour [lieu 1] : » → 4 boutons radio A/B/C/D
- « Réponse pour [lieu 2] : » → 4 boutons radio A/B/C/D
- Pas de génération automatique. Pas de champ libre (cohérence ordre-chrono / avant-après).

Le corrigé HTML construit : « • [lieu 1] : D • [lieu 2] : B »

**Gate :** L'étape est complète quand :

- 2.1 : une lettre A-D est sélectionnée
- 2.2 : les 4 options sont des associations valides distinctes ET la lettre correcte est assignée
- 2.3 : les 2 lettres sont saisies

### Étape 6 — Compétence disciplinaire

Identique. Miller drilldown 3 niveaux.

### Étape 7 — Aspects de société et connaissances

Identique. Cases à cocher + Miller multi-sélection.

### Publication

Même flux transactionnel que ordre-chrono :

1. Construit le HTML de consigne (template + zones de réponse)
2. Construit le HTML de guidage (contenu TipTap ou null)
3. Construit le HTML de corrigé
4. Sérialise le payload `carte-historique` dans `tache.non_redaction_data` (JSONB)
5. RPC `publish_tache_transaction`
6. Redirige vers `/questions/[id]`

---

## 3. Espace de production dans le rendu imprimé

### Comportement 2.1

```
Réponse : □
```

### Comportement 2.2

```
         TERRITOIRE_1    TERRITOIRE_2
A)          X                Y
B)          Z                W
C)          X                W
D)          Z                Y

Réponse : □
```

Le tableau est construit en HTML dans la consigne (même pattern que la grille 2×2 d'ordre-chrono).

### Comportement 2.3

```
• à [lieu 1] ? Réponse : _____
• à [lieu 2] ? Réponse : _____
```

---

## 4. Payload non-rédactionnel

Type aplati (pas de discriminé sur `comportementId` côté TS — la complexité ne vaut pas le coût). Les fonctions de gate / publication lisent `comportementId` puis valident les seuls champs pertinents pour ce comportement.

```typescript
type CarteHistoriqueChiffre = 1 | 2 | 3 | 4;
type CarteHistoriqueLetter = "A" | "B" | "C" | "D";
type CarteHistoriqueLetterOrEmpty = CarteHistoriqueLetter | "";
type CarteHistoriquePair = [CarteHistoriqueChiffre, CarteHistoriqueChiffre];

type CarteHistoriquePayload = {
  schemaVersion: 1;
  comportementId: "2.1" | "2.2" | "2.3";

  // Étape 3 — consigne (tous comportements)
  consigneElement1: string; // territoire/lieu 1 (toujours requis)
  consigneElement2: string; // territoire/lieu 2 (2.2 et 2.3 ; chaîne vide pour 2.1)

  // Étape 5 — comportement 2.1 :
  correctLetter: CarteHistoriqueLetterOrEmpty;

  // Étape 5 — comportement 2.2 :
  correctChiffre1: CarteHistoriqueChiffre | null; // chiffre (1–4) associé à l'élément 1
  correctChiffre2: CarteHistoriqueChiffre | null; // chiffre (1–4) associé à l'élément 2
  optionA: CarteHistoriquePair | null;
  optionB: CarteHistoriquePair | null;
  optionC: CarteHistoriquePair | null;
  optionD: CarteHistoriquePair | null;
  // Note : `correctLetter` (ci-dessus) sert aussi à 2.2 pour repérer la lettre correcte.
  generated22: boolean; // tableau A–D généré au moins une fois (gate étape 5)

  // Étape 5 — comportement 2.3 :
  correctLetter1: CarteHistoriqueLetterOrEmpty; // réponse pour lieu 1
  correctLetter2: CarteHistoriqueLetterOrEmpty; // réponse pour lieu 2
};
```

Champs notables :

- `consigneElement2` est une chaîne vide (et non `null`) pour 2.1 — simplifie le merge / la sérialisation
- Pas de champ `autresChiffres` : la carte porte toujours `{1, 2, 3, 4}` pour 2.2
- Pas de champ `nbChiffresCarte` : invariant
- Le tableau A–D pour 2.2 est conservé en `optionA…optionD` ; `correctLetter` pointe sur la bonne lettre
- `generated22` : flag de génération, équivalent du `generated` d'avant-après

---

## 5. CSS feuille élève (globals.css)

Nouvelles classes pour le rendu imprimé du tableau d'association (comportement 2.2) :

```css
[data-carte-historique-student="true"] .carte-historique-student-root { ... }
[data-carte-historique-student="true"] .carte-historique-student-intro { ... }
[data-carte-historique-student="true"] .carte-historique-student-table { ... }
[data-carte-historique-student="true"] .carte-historique-student-reponse { ... }
[data-carte-historique-student="true"] .carte-historique-student-reponse-box { ... }
[data-carte-historique-student="true"] .carte-historique-student-items { ... }
```

Pattern identique aux classes `ordre-chrono-student-*`. Les comportements 2.1 et 2.3 n'ont pas de tableau — juste la zone réponse standard.

---

## 6. Fichiers à créer / modifier

### Créer (nouveau)

| Fichier                                                                                 | Rôle                                                                                   |
| --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `lib/tache/behaviours/carte-historique.ts`                                              | `ComportementConfig` avec slug, label, bloc3/bloc4 config                              |
| `lib/tache/non-redaction/carte-historique-payload.ts`                                   | Payload type + initial + normalize + merge + gates + builders HTML (consigne, corrigé) |
| `lib/tache/non-redaction/carte-historique-helpers.ts`                                   | Logique pure : génération des distractrices pour 2.2                                   |
| `components/tache/non-redaction/carte-historique/Bloc3CarteHistorique.tsx`              | UI étape 3 — template consigne selon comportement                                      |
| `components/tache/non-redaction/carte-historique/Bloc4CarteHistorique.tsx`              | UI étape 4 — gate + 1 slot document                                                    |
| `components/tache/non-redaction/carte-historique/useCarteHistoriquePayloadBootstrap.ts` | Hook : réinitialise un payload illisible (brouillon corrompu)                          |
| `components/tache/non-redaction/consigne-template/CarteHistoriqueConsigneTemplate.tsx`  | Carte ministérielle inline avec champs éditables (3 sous-templates 2.1/2.2/2.3)        |
| `components/tache/wizard/bloc5/non-redactionnel/Bloc5CarteHistorique.tsx`               | UI étape 5 — corrigé selon comportement                                                |
| `lib/tache/non-redaction/carte-historique-payload.test.ts`                              | Tests payload                                                                          |
| `lib/tache/non-redaction/carte-historique-helpers.test.ts`                              | Tests logique pure                                                                     |

### Modifier (existant)

| Fichier                                                 | Modification                                                                                                                                           |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `lib/tache/behaviours/registry.ts`                      | Ajouter entrée carte-historique + BLOC5_DYNAMIC_BY_SLUG                                                                                                |
| `lib/tache/behaviours/types.ts`                         | Ajouter `"carte-historique"` à `ComportementSlug`                                                                                                      |
| `lib/tache/tache-form-state-types.ts`                   | Ajouter variant `"carte-historique"` au type `NonRedactionData`, action `NON_REDACTION_PATCH_CARTE_HISTORIQUE`, action `SET_OUTIL_EVALUATION_OVERRIDE` |
| `lib/tache/tache-form-reducer.ts`                       | Cases `NON_REDACTION_PATCH_CARTE_HISTORIQUE` + `SET_OUTIL_EVALUATION_OVERRIDE` ; factory `initialNonRedactionForSlug` étendue                          |
| `lib/tache/wizard-state-nr.ts`                          | Ajouter selector `nonRedactionCartePayload`                                                                                                            |
| `lib/tache/non-redaction/wizard-variant.ts`             | Ajouter `isActiveCarteHistoriqueVariant`                                                                                                               |
| `lib/tache/non-redaction/non-redaction-edit-hydrate.ts` | Branchement hydratation édition (carte-historique)                                                                                                     |
| `lib/tache/tache-form-hydrate.ts`                       | Branche `parseNonRedactionData` pour `carte-historique`                                                                                                |
| `lib/tache/wizard-publish-guards.ts`                    | Branches `isActiveCarteHistoriqueVariant` (4 points : redaction, documents, urls bloquées, isWizardPublishReady)                                       |
| `lib/tache/contrats/etat-wizard-vers-tache.ts`          | Branchement pour le HTML publié (consigne, corrigé, espace production, guidage = libre)                                                                |
| `components/tache/wizard/wizardBlocResolver.tsx`        | Entrée `"carte-historique"` dans `TACHE_NON_REDACTION_WIZARD_BLOCS`                                                                                    |
| `components/tache/wizard/Bloc2ParametresTache.tsx`      | Sélecteur Pondération 1pt/2pts pour 2.1 (dispatch `SET_OUTIL_EVALUATION_OVERRIDE`)                                                                     |
| `lib/ui/copy/non-redaction.ts`                          | Nouvelles constantes copy `NR_CARTE_*`                                                                                                                 |
| `lib/ui/ui-copy.ts`                                     | Réexports                                                                                                                                              |
| `docs/UI-COPY.md`                                       | Entrées copy                                                                                                                                           |
| `app/globals.css`                                       | Classes `.carte-historique-student-*`                                                                                                                  |
| `public/data/oi.json`                                   | Retirer `OI2.status: "coming_soon"` (Lot 3)                                                                                                            |

### Ne PAS modifier (sauf au Lot 3 pour `oi.json`)

| Fichier                               | Raison                                                                                                                                         |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `public/data/oi.json`                 | Données métier déjà corrigées (entrées 2.1/2.2/2.3 + `variant_slug`). Au Lot 3 : retirer `OI2.status: "coming_soon"` pour activer le parcours. |
| `public/data/grilles-evaluation.json` | Grilles `OI2_SO1`, `OI2_SO1_1PT`, `OI2_SO2`, `OI2_SO3` déjà présentes et correctes — référentiel ministériel immuable.                         |

---

## 7. Plan d'implémentation

### Lot 1 — Config + payload + logique pure (pas d'UI)

1. Ajouter `"carte-historique"` dans `behaviours/types.ts` (`ComportementSlug`)
2. Créer `lib/tache/non-redaction/carte-historique-helpers.ts` (énumération paires + shuffle distractrices)
3. Créer `lib/tache/non-redaction/carte-historique-payload.ts` (type, Zod, normalize, initial, merge, clearedPatch, gates, builders HTML)
4. Créer `lib/tache/behaviours/carte-historique.ts` (`ComportementConfig`)
5. Créer un stub minimal `components/tache/wizard/bloc5/non-redactionnel/Bloc5CarteHistorique.tsx` (placeholder Lot 1, requis par le `Record` de `BLOC5_DYNAMIC_BY_SLUG`)
6. Modifier `lib/tache/behaviours/registry.ts` (registry + BLOC5_DYNAMIC_BY_SLUG)
7. Modifier `lib/tache/tache-form-state-types.ts` (variant `NonRedactionData`, actions `NON_REDACTION_PATCH_CARTE_HISTORIQUE` + `SET_OUTIL_EVALUATION_OVERRIDE`)
8. Modifier `lib/tache/tache-form-reducer.ts` (factory + cases)
9. Modifier `lib/tache/wizard-state-nr.ts` (selector `nonRedactionCartePayload`)
10. Modifier `lib/tache/non-redaction/wizard-variant.ts` (`isActiveCarteHistoriqueVariant`)
11. Modifier `lib/tache/tache-form-hydrate.ts` (branche `parseNonRedactionData`)
12. Tests : `carte-historique-payload.test.ts` + `carte-historique-helpers.test.ts`
13. `npm run build` + `npm run ci` clean

### Lot 2 — UI wizard (étapes 3, 4, 5)

1. Constantes copy `NR_CARTE_*` dans `lib/ui/copy/non-redaction.ts` + réexports `lib/ui/ui-copy.ts`
2. Créer `components/tache/non-redaction/consigne-template/CarteHistoriqueConsigneTemplate.tsx` (3 sous-templates)
3. Créer `useCarteHistoriquePayloadBootstrap.ts` (hook init défensif)
4. Créer `Bloc3CarteHistorique.tsx`
5. Créer `Bloc4CarteHistorique.tsx` (gate + 1 slot)
6. Remplacer le stub par la vraie `Bloc5CarteHistorique.tsx`
7. Ajouter entrée `"carte-historique"` dans `wizardBlocResolver.tsx`
8. Modifier `Bloc2ParametresTache.tsx` : sélecteur Pondération 1pt/2pts pour 2.1
9. Mettre à jour `docs/UI-COPY.md`
10. Build clean, test visuel des 3 comportements

### Lot 3 — Pipeline publication + impression + activation

1. Branchement `lib/tache/contrats/etat-wizard-vers-tache.ts` (consigne, corrigé, espace prod, guidage libre)
2. Branchement `lib/tache/non-redaction/non-redaction-edit-hydrate.ts`
3. Branchement `lib/tache/wizard-publish-guards.ts` (4 points)
4. Classes CSS `.carte-historique-student-*` dans `app/globals.css`
5. Retirer `OI2.status: "coming_soon"` de `public/data/oi.json`
6. Build clean, parcours complet end-to-end (wizard → publish → vue détaillée → aperçu imprimé → PDF) — test deux comptes pour RLS
7. Mise à jour `docs/BACKLOG.md` + `docs/BACKLOG-HISTORY.md`

### Règle pour chaque lot

Brancher le nouveau sur l'existant. Aucun composant one-shot — réutiliser `ConsigneTemplateCard`, `LimitCounterPill`, les primitives partagées. Si un composant similaire existe dans `ordre-chronologique`, l'adapter ou le généraliser — ne pas dupliquer. Zéro code mort.
