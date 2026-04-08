# SPEC — Bloc 5 · Corrigé, options de réponse et notes du correcteur

Spécification complète du Bloc 5 du wizard TAÉ.
Couvre tous les comportements actifs et coming_soon.

Rédigé : avril 2026
Statut : validé — prêt à implémenter
Auteur : session de conception claude.ai

---

## Principe fondamental

Le Bloc 5 est toujours une fonction de :
- La structure définie au **Bloc 3** (étiquettes, catégories, éléments)
- Les données saisies au **Bloc 4** (documents, années, contenus)

```
Bloc 3 → structure / étiquettes / éléments de la consigne
Bloc 4 → documents / données / années
Bloc 5 → f(Bloc 3, Bloc 4) → options + corrigé + notes
```

---

## Architecture — 2 composants génériques

```
Bloc5Redactionnel.tsx   ← tous les parcours R
Bloc5NrOptions.tsx      ← tous les parcours NR
```

### Bloc5Redactionnel — props

```typescript
type Bloc5RedactionnelProps = {
  templateKey: Bloc5TemplateKey
  // Données pré-remplissage depuis Bloc 3/4
  prefilledData?: {
    acteurs?: string[]        // noms depuis Bloc 4 perspectives
    elements?: string[]       // éléments 1/2/3 depuis Bloc 3 OI7
    intrusIndex?: number      // index intrus depuis Bloc 4
  }
}

type Bloc5TemplateKey =
  | 'libre'                  // OI0
  | 'opposition'             // OI3·3.1/3.2
  | 'accord-desaccord'       // OI3·3.3/3.4
  | 'intrus'                 // OI3·3.5
  | 'cause'                  // OI4·4.1
  | 'consequence'            // OI4·4.2
  | 'changement'             // OI6·6.1
  | 'continuite'             // OI6·6.2
  | 'changement-continuite'  // OI6·6.3 — double corrigé
  | 'causalite'              // OI7·7.1
```

### Bloc5NrOptions — props

```typescript
type Bloc5NrOptionsProps = {
  optionsType: Bloc5NrOptionsType
}

type Bloc5NrOptionsType =
  | 'sequence'     // OI1·1.1 — suites A-B-C-D
  | 'segment'      // OI1·1.2 — frise segments
  | 'avant-apres'  // OI1·1.3 — tableau binaire
  | 'carte'        // OI2 — lettres sur carte
  | 'cases'        // OI4·4.3/4.4 — numéros documents
  | 'appariement'  // OI5 — étiquettes + numéros
```

---

## Registre WIZARD_BLOC_CONFIGS — Bloc5Config

```typescript
type Bloc5Config =
  | { type: 'redactionnel'; templateKey: Bloc5TemplateKey }
  | { type: 'nr-options'; optionsType: Bloc5NrOptionsType }

// Registre complet
'0.1': { bloc5: { type: 'redactionnel', templateKey: 'libre' } }
'3.1': { bloc5: { type: 'redactionnel', templateKey: 'opposition' } }
'3.2': { bloc5: { type: 'redactionnel', templateKey: 'opposition' } }
'3.3': { bloc5: { type: 'redactionnel', templateKey: 'accord-desaccord' } }
'3.4': { bloc5: { type: 'redactionnel', templateKey: 'accord-desaccord' } }
'3.5': { bloc5: { type: 'redactionnel', templateKey: 'intrus' } }
'4.1': { bloc5: { type: 'redactionnel', templateKey: 'cause' } }
'4.2': { bloc5: { type: 'redactionnel', templateKey: 'consequence' } }
'4.3': { bloc5: { type: 'nr-options', optionsType: 'cases' } }
'4.4': { bloc5: { type: 'nr-options', optionsType: 'cases' } }
'5.1': { bloc5: { type: 'nr-options', optionsType: 'appariement' } }
'5.2': { bloc5: { type: 'nr-options', optionsType: 'appariement' } }
'6.1': { bloc5: { type: 'redactionnel', templateKey: 'changement' } }
'6.2': { bloc5: { type: 'redactionnel', templateKey: 'continuite' } }
'6.3': { bloc5: { type: 'redactionnel', templateKey: 'changement-continuite' } }
'7.1': { bloc5: { type: 'redactionnel', templateKey: 'causalite' } }
// NR existants (déjà livrés — Bloc5 géré par leurs composants dédiés)
'1.1': { bloc5: { type: 'nr-options', optionsType: 'sequence' } }
'1.2': { bloc5: { type: 'nr-options', optionsType: 'segment' } }
'1.3': { bloc5: { type: 'nr-options', optionsType: 'avant-apres' } }
// Coming soon
'2.x': { bloc5: { type: 'nr-options', optionsType: 'carte' } }
```

---

## Structure Bloc 5 — parcours R

Trois sections dans l'ordre :

```
1. Corrigé (production attendue) *  ← obligatoire
2. Notes du correcteur              ← optionnel
```

Pour OI6·6.3 uniquement :

```
1a. Corrigé — si changement         ← au moins un des deux
1b. Corrigé — si continuité         ← obligatoire
2.  Notes du correcteur             ← optionnel
```

### Règles universelles — parcours R

```
Phrase complète obligatoire
  → Jamais commencer par "Parce que", "Car",
    "Alors que", "Sur"
  → Le sujet doit être repris explicitement

Sujet nommé explicitement
  → Jamais "ils", "ceux-ci", "elle" sans référent
  → Toujours le nom historique complet

Copie intégrale interdite
  → Toujours reformuler dans ses propres mots

Auto-suffisance
  → La réponse doit se comprendre sans relire
    la question
```

---

## Modèles de corrigé par templateKey

### `libre` — OI0·0.1

```
Corrigé : champ vide — trop variable selon le document
Notes   : "Refuser toute réponse qui reproduit
           intégralement une phrase du document
           sans reformulation."
```

---

### `opposition` — OI3·3.1 et 3.2

**3.1 — Différence :**
```
Modèle :
"[Objet A] est/fait [Caractéristique 1], alors que
 [Objet B] est/fait [Caractéristique 2]."

Ex : "Les nations algonquiennes ont une structure
     sociale patrilinéaire alors que les nations
     iroquoiennes ont une structure matrilinéaire."

Notes pré-remplies :
"La réponse doit contenir un marqueur d'opposition
 explicite : alors que, tandis que, par contre,
 contrairement à, à l'inverse.

 Juger partiellement correcte :
 - Les deux réalités décrites séparément sans
   mise en relation directe.
 - Marqueur d'opposition absent mais fait juste.

 Refuser :
 - Copie intégrale du document.
 - Fait historique inexact."
```

**3.2 — Similitude :**
```
Modèle :
"[Objet A] et [Objet B] ont/font tous les deux
 [Caractéristique commune]."

Variante :
"[Objet A] est [X], tout comme [Objet B]."

Notes pré-remplies :
"La réponse doit contenir un marqueur de similitude
 explicite : tout comme, de même, également, aussi.

 Juger partiellement correcte :
 - Similitude identifiée mais pas mise en relation
   dans une seule phrase.

 Refuser :
 - Copie intégrale du document."
```

---

### `accord-desaccord` — OI3·3.3 et 3.4

**Pré-remplissage automatique depuis Bloc 4 :**
Les noms des acteurs sont déduits de
`state.bloc4.perspectives[i].acteur`.

**3.3 — Désaccord :**
```
Modèle pré-rempli :
"[Nom acteur A] et [Nom acteur B] sont en désaccord
 sur [point précis de friction]."

Ex : "François de Lévis et Pierre de Vaudreuil sont
     en désaccord sur la capitulation de Montréal."

⚠️ Les corrigés ministériels utilisent parfois des
groupes nominaux incomplets ("Sur la création...").
Ce format est insuffisant — exiger une phrase complète
avec les deux acteurs nommés.

Notes pré-remplies :
"La réponse doit être une phrase complète nommant
 explicitement les deux acteurs ou historiens.
 Interdire les pronoms personnels sans référent.
 Identifier un seul point de désaccord précis.

 Juger partiellement correcte :
 - Acteurs nommés mais point de désaccord vague.
 - Point identifié mais acteurs non nommés.

 Refuser :
 - Copie intégrale.
 - Fait inexact."
```

**3.4 — Accord :**
```
Modèle pré-rempli :
"[Nom acteur A] et [Nom acteur B] sont d'accord
 sur [point précis d'entente]."

Notes : même structure que 3.3,
"désaccord" remplacé par "accord".
```

---

### `intrus` — OI3·3.5

**Pré-remplissage automatique :**
- Intrus : déduit de `intrusLetter` coché au Bloc 4
- Noms : depuis `state.bloc4.perspectives[i].acteur`

```
Modèle pré-rempli :
"[Nom intrus] [position divergente], alors que
 [Nom A] et [Nom B] [position commune]."

Ex : "François de Lévis s'oppose à la capitulation,
     alors que Pierre de Vaudreuil et Jeffery Amherst
     sont en faveur de la capitulation."

Deux parties obligatoires :
1. Identification nominative de l'intrus
2. Mise en opposition avec les deux autres (similitude)

Notes pré-remplies :
"L'acteur dont le point de vue est différent est
 [Nom intrus]. Les deux autres ([Nom A] et [Nom B])
 partagent [position commune].

 Juger partiellement correcte :
 - Intrus identifié mais non nommé ('le premier').
 - Nommé correctement mais comparaison absente ou vague.

 Refuser :
 - Intrus mal identifié.
 - Copie intégrale."
```

---

### `cause` — OI4·4.1

```
Règle fondamentale :
Ne jamais commencer par "Parce que" —
reprendre le sujet de la consigne en début de phrase.

Modèle :
"[Reprise du sujet/événement de la consigne]
 parce que / car / en raison de
 [fait historique précis tiré du document]."

Ex : "Le territoire du Québec n'était pas habité
     avant -10 000 parce qu'il était recouvert
     d'un glacier."

Notes pré-remplies :
"La réponse doit reprendre le sujet de la consigne
 avant d'introduire la cause.

 Juger partiellement correcte :
 - Commence par 'Parce que' mais fait juste.
 - Cause identifiée sans lien à l'événement.

 Refuser :
 - Copie intégrale.
 - Fait inexact."
```

---

### `consequence` — OI4·4.2

```
Modèle :
"[Sujet historique explicite] + [verbe au présent
 montrant l'effet] + [résultat concret du document]."

Ex : "La Nouvelle-France perd des territoires comme
     la baie d'Hudson, Terre-Neuve et l'Acadie."

Notes pré-remplies :
"La réponse doit nommer le sujet historique
 explicitement — jamais 'ils' ou 'ceux-ci'.

 Juger partiellement correcte :
 - Conséquence juste mais pronom sans référent.
 - Résultat vague ou incomplet.

 Refuser :
 - Copie intégrale.
 - Fait inexact."
```

---

### `changement` — OI6·6.1

```
Modèle :
"Ce qui change, c'est que [sujet explicite]
 [verbe d'action] [fait précis tiré du document]."

Variante :
"Un changement s'opère : [sujet] [verbe] [fait]."

Ex : "Ce qui change, c'est que les Premières Nations
     utilisent de nouveaux produits comme des objets
     en métal."

Notes pré-remplies :
"La réponse doit nommer le sujet explicitement et
 rappeler qu'il s'agit d'un changement.

 Juger partiellement correcte :
 - Fait juste mais ne rappelle pas le changement.
   Ex : 'Le rétablissement des lois civiles françaises.'
 - Sujet ambigu ou pronom sans référent.

 Refuser :
 - Copie intégrale.
 - Fait inexact."
```

---

### `continuite` — OI6·6.2

```
Modèle :
"Ce qui demeure, c'est que [sujet explicite]
 [verbe] [fait précis tiré du document]."

Variante :
"La continuité observée est que [sujet]
 [verbe] [fait]."

Ex : "Ce qui demeure, c'est que le mercantilisme
     continue d'être appliqué dans la colonie."

Notes pré-remplies :
"La réponse doit nommer le sujet explicitement et
 rappeler qu'il s'agit d'une continuité.

 Juger partiellement correcte :
 - Fait juste formulé comme simple constat
   sans rappeler la continuité.
 - Sujet ambigu.

 Refuser :
 - Copie intégrale.
 - Fait inexact."
```

---

### `changement-continuite` — OI6·6.3

**Spécificité unique :**
L'élève choisit lui-même changement ou continuité.
Les deux peuvent être valides si la justification
est correcte. L'enseignant peut fournir deux corrigés.

**Trois composantes obligatoires :**
```
1. Identification   → "Il y a changement" ou
                      "Il y a continuité" — mots exacts
2. Justification    → fait historique précis du document
3. Repère de temps  → date, année, siècle, période,
                      événement — jamais "maintenant",
                      "toujours", "à cette époque"
```

**Deux zones de corrigé au Bloc 5 :**
```
┌─ Si l'élève conclut à un changement ─────────┐
│ Modèle :                                      │
│ "Il y a changement, car à partir de [repère], │
│  [nouvelle réalité historique précise]."      │
│                                               │
│ Ex : "Il y a changement, car à partir de      │
│  1663, le roi établit un conseil souverain    │
│  pour diriger la colonie."                    │
└───────────────────────────────────────────────┘

┌─ Si l'élève conclut à une continuité ────────┐
│ Modèle :                                      │
│ "Il y a continuité, car en [Repère T1] comme  │
│  en [Repère T2], [fait qui demeure]."         │
│                                               │
│ Ex : "Il y a continuité, car vers 1500 comme  │
│  en 1600, les échanges se déroulent au        │
│  confluent des cours d'eau."                  │
│ (optionnel si une seule conclusion possible)  │
└───────────────────────────────────────────────┘
```

**Notes pré-remplies :**
```
"Les deux conclusions (changement ou continuité)
 peuvent être acceptées si l'élève nomme sa
 conclusion, la justifie avec des faits précis
 et ancre sa réponse avec un repère de temps exact.

 Trois éléments obligatoires pour 3 points :
 1. 'Il y a changement' ou 'Il y a continuité'
 2. Fait historique précis (jamais copie intégrale)
 3. Repère de temps exact

 Juger partiellement correcte :
 - Repère vague ('maintenant', 'toujours') → -1 pt
 - Identification absente mais faits exacts → 2/3
 - Un seul fait au lieu de deux → 2/3

 Refuser :
 - Aucun fait historique précis.
 - Copie intégrale.
 - Changement et continuité confondus."
```

---

### `causalite` — OI7·7.1

**Pré-remplissage automatique depuis Bloc 3 :**
Les 3 éléments sont déduits des champs
Élément 1, Élément 2, Élément 3 saisis au Bloc 3.

**Exigences strictes :**
```
✅ Minimum 3 phrases
✅ Minimum 2 marqueurs de causalité explicites
✅ Les 3 éléments de la consigne nommés ET reliés
✅ Enchaînement logique A → B → C
```

**Marqueurs de causalité obligatoires :**
```
ce qui entraîne, mène à, provoque,
en raison de, car, donc, ainsi,
c'est pourquoi, par conséquent
```

**Modèle pré-rempli :**
```
"[Élément 1 — fait précis et nommé],
 ce qui entraîne [Élément 2 — fait précis et nommé].
 En conséquence, [Élément 3 — fait précis et nommé]."

Ex (politique Murray) :
"Le gouverneur James Murray accorde des concessions
 aux Canadiens, ce qui provoque une réaction violente
 des marchands britanniques.
 En conséquence, le roi de Grande-Bretagne intervient
 et rappelle le gouverneur."
```

**Notes pré-remplies :**
```
"La réponse doit comporter au moins 3 phrases
 et au moins 2 marqueurs de causalité explicites.
 Les 3 éléments imposés doivent être précisés
 ET reliés par une logique causale A → B → C.

 Juger partiellement correcte :
 - 3 éléments présents, 1 seul lien → 2 pts
 - 2 éléments reliés, 3e vague → 2 pts
 - 3 éléments listés sans aucun lien → 1 pt
 - Liens implicites non marqués → 1 ou 2 pts

 Refuser :
 - Copie intégrale des documents.
 - Moins de 2 des 3 éléments présents.
 - Aucun lien causal établi."
```

---

## Structure Bloc 5 — parcours NR

Trois sections dans l'ordre :

```
1. Options de réponse   ← générées depuis Bloc 3 + Bloc 4
2. Réponse attendue     ← lecture seule, déduite
3. Notes du correcteur  ← optionnel, pré-rempli auto
```

### Règle universelle NR

```
Options  = f(structure Bloc 3, documents Bloc 4)
Réponse  = toujours une lettre ou un numéro
           jamais saisie manuellement (sauf OI4·4.3/4.4
           et OI5 où l'enseignant associe les numéros)
Notes    = pré-remplies automatiquement si possible
```

---

### `sequence` — OI1·1.1 (déjà livré)

```
Options : 4 suites A-B-C-D générées
          (1 correcte + 3 distracteurs)
          Depuis les années des documents Bloc 4
          Shuffle possible

Réponse : "Réponse : [Lettre]"
          Générée automatiquement

Notes pré-remplies :
"La séquence correcte est : Document A ([année]),
 Document C ([année]), Document B ([année]),
 Document D ([année]).
 Réponse : [lettre].
 Refuser toute séquence dans un ordre différent."
```

---

### `segment` — OI1·1.2 (déjà livré)

```
Options : segments de la frise (A, B, C ou D)
          Depuis la frise SVG + année Bloc 4

Réponse : "Réponse : [Lettre]"

Notes pré-remplies :
"Le segment correct est [lettre] ([début]–[fin]).
 L'année extraite du document est [année]."
```

---

### `avant-apres` — OI1·1.3 (déjà livré)

```
Options : 4 tableaux Avant/Après A-B-C-D générés
          Depuis les années + repère Bloc 3/4

Réponse : "Réponse : [Lettre]"

Notes pré-remplies :
"Documents AVANT [repère] : [liste].
 Documents APRÈS [repère] : [liste].
 Réponse : [lettre]."
```

---

### `carte` — OI2 (coming soon)

```
Options : A / B / C / D
          Depuis la carte uploadée au Bloc 4
          Ordre fixe — correspond aux lettres sur la carte

Réponse : Radio — l'enseignant choisit la lettre correcte
          (il connaît sa carte)

Notes : Champ libre — l'enseignant décrit le territoire
        correspondant à la bonne lettre
```

---

### `cases` — OI4·4.3 et 4.4

```
OI4·4.3 — Deux facteurs explicatifs :
  Facteur 1 (cause) : Document n° [champ numérique]
  Facteur 2 (cause) : Document n° [champ numérique]

OI4·4.4 — Facteur + conséquence :
  Facteur explicatif (cause) :      Document n° [champ]
  Fait qui en découle (conséquence) : Document n° [champ]

Pas de génération automatique — l'enseignant saisit
les numéros (il connaît ses documents).

Notes : Champ libre
Ex : "Document 4 = cause : arrivée des Loyalistes.
     Document 5 = conséquence : augmentation de la
     population anglophone."
```

---

### `appariement` — OI5·5.1 et 5.2

```
Interface générée depuis les étiquettes du Bloc 3 :

  [Étiquette A depuis Bloc 3] : Document n° [___]
  [Étiquette B depuis Bloc 3] : Document n° [___]
  [Étiquette C] : Document n° [___]  ← si 5.2
  [Étiquette D] : Document n° [___]  ← si 5.2

L'enseignant associe chaque étiquette au numéro
du document correct.

Notes : Champ libre
Ex : "Tradition orale : Document 10.
     Partage des biens : Document 9."
```

---

## Notes du correcteur — règles générales

### Visibilité
- Visible dans la **fiche lecture enseignant**
- Visible dans la **banque collaborative** (tous)
- Visible dans le **preview** (sommaire wizard)
- **Jamais** sur la feuille élève

### SQL
```sql
tae.notes_correcteur TEXT NULL
-- Nullable — optionnel
-- Patch mineur (ne reset pas les votes)
-- Distinct de tae.corrige (obligatoire pour R)
```

### Génération automatique
```
R — pré-remplissage depuis templateKey
    L'enseignant peut modifier

NR — pré-remplissage depuis données Bloc 3/4
     L'enseignant peut modifier

Règle : jamais de génération 100% figée —
        toujours modifiable par l'enseignant
```

---

## Copy UI — nouvelles constantes

```typescript
// lib/ui/ui-copy.ts

// Titres sections
BLOC5_CORRIGE_LABEL           = "Corrigé (production attendue)"
BLOC5_CORRIGE_NR_LABEL        = "Réponse attendue"
BLOC5_OPTIONS_LABEL           = "Options de réponse"
BLOC5_NOTES_LABEL             = "Notes du correcteur"
BLOC5_NOTES_HINT              = "Précisions pour le correcteur :
                                 variantes acceptées, cas limites,
                                 erreurs fréquentes."

// OI6·6.3 — double corrigé
BLOC5_CORRIGE_CHANGEMENT_LABEL = "Corrigé — si l'élève conclut à un changement"
BLOC5_CORRIGE_CONTINUITE_LABEL = "Corrigé — si l'élève conclut à une continuité"
BLOC5_CORRIGE_CONTINUITE_HINT  = "Optionnel si une seule conclusion est possible."

// Boutons modèle
BLOC5_USE_TEMPLATE_BTN        = "Utiliser un modèle de corrigé"
BLOC5_USE_TEMPLATE_CHANGEMENT = "Modèle — changement"
BLOC5_USE_TEMPLATE_CONTINUITE = "Modèle — continuité"

// OI3·3.5 — case intrus Bloc 4
BLOC4_INTRUS_LABEL            = "Point de vue distinct"
BLOC4_INTRUS_TOOLTIP          = "L'intrus est l'acteur ou historien
                                 dont le point de vue se distingue
                                 des deux autres. Cochez cette case
                                 pour indiquer lequel des trois présente
                                 une position différente — les deux autres
                                 partagent un point commun.
                                 Ce choix servira à générer automatiquement
                                 un modèle de corrigé au Bloc 5, avec les
                                 noms dans le bon ordre et la bonne
                                 structure de phrase."
```

---

## Fichiers à créer

```
components/tae/TaeForm/bloc5/
  Bloc5Redactionnel.tsx      ← générique R — templateKey
  Bloc5NrOptions.tsx         ← générique NR — optionsType

lib/tae/bloc5/
  bloc5-templates.ts         ← modèles de corrigé par templateKey
  bloc5-notes-templates.ts   ← notes du correcteur par templateKey
  bloc5-prefill.ts           ← logique pré-remplissage depuis Bloc 3/4
  bloc5-nr-options.ts        ← génération options NR par optionsType
```

---

## Ordre d'implémentation recommandé

```
Sprint 3 — R simples (OI4, OI6)
  1. Étendre WIZARD_BLOC_CONFIGS (OI4, OI6, OI7)
  2. bloc5-templates.ts + bloc5-notes-templates.ts
  3. Bloc5Redactionnel.tsx (templateKey routing)
  4. SQL tae.notes_correcteur + migration
  5. Fiche lecture — section Notes du correcteur

Sprint 4 — R complexes + NR
  6. Bloc5NrOptions.tsx (cases + appariement)
  7. OI3·3.5 — case intrus Bloc 4 + pré-remplissage
  8. OI7·7.1 — pré-remplissage depuis éléments Bloc 3
  9. OI6·6.3 — double corrigé
```

---

## Ce qui n'est PAS dans cette spec

- Grilles de correction (outil d'évaluation) —
  dans public/data/grilles-evaluation.json
- Barèmes détaillés — dans GrilleEvalTable existant
- Export PDF du corrigé — dépend du chantier E3
- Validation Zod des nouveaux champs — Sprint 3/4