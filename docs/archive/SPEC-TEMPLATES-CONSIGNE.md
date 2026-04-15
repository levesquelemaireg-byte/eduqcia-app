# SPEC — Templates de consigne par comportement attendu

Spécification produit et technique pour l'introduction de templates
de consigne guidés dans le wizard TAÉ.

Rédigé : avril 2026
Statut : validé — prêt à implémenter (v2)
Auteur : session de conception claude.ai

---

## Changelog v2 (post Sprint 2)

- Question groupé/séparé remontée du Bloc 4 au **Bloc 3** pour tous
  les comportements perspectives (3.3, 3.4, 3.5)
- **3.5 offre aussi le choix** groupé/séparé — plus "toujours groupé"
- Formules générées **distinctes** selon groupé vs séparé
- Changement de structure → **migration des données** dans les deux sens
  (pas d'effacement — transfert automatique)
- Message d'avertissement **rassurant** décrivant la nouvelle structure
- Wizard **7 étapes** — Bloc 5 = "Corrigé et options"
- `Bloc5Intrus` s'insère dans le Bloc 5 existant
- **Féminisation UI** : labels radio "Acteurs de l'époque" /
  "Historiens et historiennes" — consignes générées conservent
  le libellé ministériel ("acteurs" / "historiens")
- **Contexte obligatoire** pour 3.3 et 3.4 (était optionnel — corrigé)
- **Placeholder contexte** 3.3/3.4 : "Ex : en 1775"
  (anciennement "Ex : sur la lutte du Parti patriote en 1834")
- **Amorce documentaire** remplace "phrase d'introduction" partout
- **Label** "Structure documentaire" (était "Structure du document")
- **Type par perspective individuelle** dans PerspectiveData
  (pas type global du document groupé)
- **Tooltips consigne** par comportement : `BLOC3_MODAL_CONSIGNE_33`,
  `BLOC3_MODAL_CONSIGNE_34`, `BLOC3_MODAL_CONSIGNE_35` dans ui-copy.ts

---

## Périmètre de cette spec

### Inclus — parcours rédactionnels

| OI  | Comportements | Type                   |
| --- | ------------- | ---------------------- |
| OI0 | 0.1           | Rédactionnel libre     |
| OI3 | 3.1, 3.2      | Rédactionnel souple    |
| OI3 | 3.3, 3.4, 3.5 | Rédactionnel structuré |
| OI4 | 4.1, 4.2      | Rédactionnel souple    |
| OI6 | 6.1, 6.2, 6.3 | Rédactionnel structuré |
| OI7 | 7.1           | Rédactionnel pur       |

### Hors périmètre — parcours non rédactionnels (specs séparées)

| OI  | Comportements | Raison                                        |
| --- | ------------- | --------------------------------------------- |
| OI1 | 1.1, 1.2, 1.3 | Déjà livrés — wizard-oi-non-redactionnelle.md |
| OI4 | 4.3, 4.4      | NR — réponse = numéros de documents           |
| OI5 | 5.x           | NR — association de documents                 |

---

## Wizard — 7 étapes (rappel)

```
Étape 1 — Auteur(s)
Étape 2 — Paramètres
Étape 3 — Consigne et guidage      ← templates + choix structure
Étape 4 — Documents historiques    ← Bloc4Perspectives ou standard
Étape 5 — Corrigé et options       ← Bloc5Intrus ou rédactionnel
Étape 6 — Compétence disciplinaire
Étape 7 — Connaissances relatives
```

---

## Principe d'architecture — système de composition

### Deux dimensions indépendantes

```
Dimension 1 — Structure Bloc 3 (consigne)
  → libre | modele_souple | structure | pur

Dimension 2 — Structure Bloc 4 (documents)
  → standard | perspectives (count: 2|3) | moments (count: 2)
```

### Trois familles de Bloc 4

```
standard      — documents indépendants
               OI0, OI3·3.1/3.2, OI4·4.1/4.2, OI6·6.1/6.2, OI7·7.1

perspectives  — points de vue synchroniques
               OI3·3.3/3.4/3.5
               Sémantique : acteurs de l'époque / historiens

moments       — états diachroniques (même objet, moments différents)
               OI6·6.3 uniquement
               Sémantique : états temporels — pas de repères explicites
```

### Règle d'or

```
Ajouter un comportement  = 1 entrée dans WIZARD_BLOC_CONFIGS
Ajouter un pattern       = 1 composant générique réutilisable
Jamais                   = un composant one-shot par comportement
```

---

## Registre de configuration

```typescript
// lib/tae/wizard-bloc-config.ts

type Bloc3Config =
  | { type: "libre" }
  | { type: "modele_souple"; templateKey: ConsigneTemplateKey }
  | { type: "structure"; variante: "compare" }
  | { type: "pur"; variante: "triple" | "oi6" | "oi7" };

type Bloc4Config =
  | { type: "standard" }
  | { type: "perspectives"; count: 2 | 3; modeGroupeDefaut: boolean }
  | { type: "moments"; count: 2; modeGroupeDefaut: boolean };

type Bloc5Config = { type: "standard" } | { type: "intrus"; perspectiveCount: 2 | 3 };

type WizardBlocConfig = {
  bloc3: Bloc3Config;
  bloc4: Bloc4Config;
  bloc5?: Bloc5Config;
};

export const WIZARD_BLOC_CONFIGS: Record<string, WizardBlocConfig> = {
  // OI0
  "0.1": {
    bloc3: { type: "libre" },
    bloc4: { type: "standard" },
  },

  // OI3 — différence / similitude
  "3.1": {
    bloc3: { type: "modele_souple", templateKey: "oi3-difference" },
    bloc4: { type: "standard" },
  },
  "3.2": {
    bloc3: { type: "modele_souple", templateKey: "oi3-similitude" },
    bloc4: { type: "standard" },
  },

  // OI3 — désaccord / accord
  "3.3": {
    bloc3: { type: "structure", variante: "compare" },
    bloc4: { type: "perspectives", count: 2, modeGroupeDefaut: true },
    bloc5: { type: "redactionnel", templateKey: "accord-desaccord" },
  },
  "3.4": {
    bloc3: { type: "structure", variante: "compare" },
    bloc4: { type: "perspectives", count: 2, modeGroupeDefaut: true },
    bloc5: { type: "redactionnel", templateKey: "accord-desaccord" },
  },

  // OI3 — trois points de vue
  "3.5": {
    bloc3: { type: "pur", variante: "triple" },
    bloc4: { type: "perspectives", count: 3, modeGroupeDefaut: true },
    bloc5: { type: "intrus", perspectiveCount: 3 },
  },

  // OI4 — cause / conséquence
  "4.1": {
    bloc3: { type: "modele_souple", templateKey: "oi4-cause" },
    bloc4: { type: "standard" },
  },
  "4.2": {
    bloc3: { type: "modele_souple", templateKey: "oi4-consequence" },
    bloc4: { type: "standard" },
  },

  // OI6 — changements et continuités
  "6.1": {
    bloc3: { type: "modele_souple", templateKey: "oi6-changement" },
    bloc4: { type: "moments", count: 2, modeGroupeDefaut: true },
  },
  "6.2": {
    bloc3: { type: "modele_souple", templateKey: "oi6-continuite" },
    bloc4: { type: "moments", count: 2, modeGroupeDefaut: true },
  },
  "6.3": {
    bloc3: { type: "pur", variante: "oi6" },
    bloc4: { type: "moments", count: 2, modeGroupeDefaut: true },
  },

  // OI7 — liens de causalité
  "7.1": {
    bloc3: { type: "pur", variante: "oi7" },
    bloc4: { type: "standard" },
  },
};
```

---

## Templates de consigne externalisés

```typescript
// lib/tae/consigne-templates.ts

export type ConsigneTemplateKey =
  | "oi3-difference"
  | "oi3-similitude"
  | "oi4-cause"
  | "oi4-consequence"
  | "oi6-changement"
  | "oi6-continuite";

export const CONSIGNE_TEMPLATES = {
  "oi3-difference":
    "À l'aide du document {{doc_A}}, indiquez une différence" +
    " entre [X] et [Y] concernant [thème].",
  "oi3-similitude":
    "À l'aide du document {{doc_A}}, indiquez une ressemblance" +
    " entre [X] et [Y] concernant [thème].",
  "oi4-cause": "À l'aide du document {{doc_A}}, indiquez une cause" + " de [réalité historique].",
  "oi4-consequence":
    "À l'aide du document {{doc_A}}, indiquez une conséquence" +
    " de [événement / réalité] sur [domaine].",
  "oi6-changement":
    "À l'aide du document {{doc_A}}, indiquez un changement" + " dans [enjeu] à [période].",
  "oi6-continuite":
    "À partir du document {{doc_A}}, indiquez un élément de" +
    " continuité dans [enjeu] entre [période 1] et [période 2].",
} satisfies Record<ConsigneTemplateKey, string>;

// OI7·7.1 : pas de clé — consigne générée depuis champs de formulaire.
```

---

## Féminisation — règle

```
Labels UI (radios, hints, placeholders) → féminisés
  "Acteurs de l'époque"         (pas "Acteurs historiques")
  "Historiens et historiennes"  (pas "Historiens")

Consignes générées → libellé ministériel conservé
  "acteurs"      (terme officiel épreuves)
  "historiens"   (terme officiel épreuves)
```

Cette distinction est importante : les consignes sont des
textes officiels remis à l'élève — pas modifier le libellé
ministériel même pour des raisons d'inclusivité.

---

## Choix groupé/séparé — règles (v2)

### Position dans le wizard

Le choix groupé/séparé se fait **au Bloc 3** pour tous les
comportements perspectives (3.3, 3.4, 3.5).

**Raison :** le choix impacte la formule de consigne générée —
l'enseignant doit le faire avant de voir l'aperçu.

### Disponibilité par comportement

| Comportement | Groupé    | Séparé |
| ------------ | --------- | ------ |
| 3.3          | ✅ défaut | ✅     |
| 3.4          | ✅ défaut | ✅     |
| 3.5          | ✅ défaut | ✅     |

**3.5 offre aussi le choix** — trois documents distincts
est un cas valide et pédagogiquement riche.

### Formules générées selon le mode

**3.3 groupé :**

```
Le document {{doc_A}} présente deux points de vue
d'acteurs [contexte].
Sur quel point précis ces acteurs sont-ils en désaccord ?
```

**3.3 séparé :**

```
À l'aide des documents {{doc_A}} et {{doc_B}}, indiquez
le point précis sur lequel ces acteurs sont en désaccord
[contexte].
```

**3.4 groupé :**

```
Le document {{doc_A}} présente deux points de vue
d'acteurs [contexte].
Sur quel point précis ces acteurs sont-ils d'accord ?
```

**3.4 séparé :**

```
À l'aide des documents {{doc_A}} et {{doc_B}}, indiquez
le point précis sur lequel ces acteurs sont d'accord
[contexte].
```

**3.5 groupé :**

```
Le document {{doc_A}} présente trois points de vue
d'acteurs [contexte].
Nommez l'acteur qui présente un point de vue différent.
Puis, comparez ce point de vue à celui des deux autres acteurs.
```

**3.5 séparé :**

```
À l'aide des documents {{doc_A}}, {{doc_B}} et {{doc_C}},
nommez l'acteur qui présente un point de vue différent.
Puis, comparez ce point de vue à celui des deux autres acteurs.
```

Note : remplacer "acteurs" par "historiens" si le radio
"Historiens et historiennes" est sélectionné.

### Migration des données lors du changement de mode

Quand l'enseignant change le mode (groupé ↔ séparé),
les données sont **transférées automatiquement** — pas effacées.

**Groupé → Séparé :**

```
perspectiveA.contenu → doc_A.contenu
perspectiveA.source  → doc_A.source
perspectiveA.acteur  → doc_A.titre
perspectiveB...      → doc_B...
perspectiveC...      → doc_C... (3.5)
```

**Séparé → Groupé :**

```
doc_A.contenu → perspectiveA.contenu
doc_A.source  → perspectiveA.source
doc_A.titre   → perspectiveA.acteur
doc_B...      → perspectiveB...
doc_C...      → perspectiveC... (3.5)
```

**Implémentation — fonctions pures testables :**

```typescript
// lib/tae/oi-perspectives/perspectives-helpers.ts

function migratePerspectivesToSlots(
  perspectives: PerspectiveData[],
): Partial<Record<DocumentSlotId, DocumentSlotData>>;

function migrateSlotsToPerpsectives(
  slots: Partial<Record<DocumentSlotId, DocumentSlotData>>,
): PerspectiveData[];
```

**Action reducer :**

```typescript
| {
    type: 'SET_PERSPECTIVES_MODE_WITH_MIGRATION'
    value: 'groupe' | 'separe'
    // Le reducer appelle la fonction de migration
    // et met à jour bloc3 + bloc4 en une seule action
  }
```

### Avertissement modal lors du changement

Déclenché uniquement si des données existent déjà dans
le bloc perspectives (pas au premier choix).

| Surface                | Libellé                                                                                        |
| ---------------------- | ---------------------------------------------------------------------------------------------- |
| Titre                  | Modifier la structure du document                                                              |
| Corps                  | Les contenus saisis (extraits, sources, acteurs) seront transférés dans la nouvelle structure. |
| Sous-texte si → groupé | Un seul document physique divisé en [deux / trois] perspectives côte à côte.                   |
| Sous-texte si → séparé | [Deux / Trois] documents indépendants, réutilisables dans la banque.                           |
| Confirmer              | Confirmer                                                                                      |
| Annuler                | Annuler                                                                                        |

---

## OI0 · 0.1 — Établir un fait

**Décision : consigne libre.**
TipTap standard, aucun changement architectural.

---

## OI3 · 3.1 et 3.2 — Différence / Similitude

**Paramètres :** 1 document, 3 lignes, Bloc 4 standard.
**Niveau de guidage : modèle souple.**

Bouton "Utiliser un modèle de consigne" dans la barre TipTap.
`setContent()` — remplace le contenu existant (intro incluse).
L'enseignant modifie librement après insertion.

**Exemples réels**

- "Quelle est la différence entre les structures sociales
  de ces deux familles autochtones ?"
- "Indiquez une différence entre la vallée du Saint-Laurent
  et la région des Cantons-de-l'Est concernant l'organisation
  des terres agricoles dans la première moitié du 19e siècle."

---

## OI3 · 3.3 et 3.4 — Désaccord / Accord

**Paramètres :** 2 slots, Bloc 3 template structuré,
Bloc 4 Perspectives count=2, Bloc 5 Intrus.

**Niveau de guidage : template structuré.**

**Champs Bloc 3 — dans l'ordre d'affichage :**

```
1. Structure documentaire (radio)
   ◉ Un seul document (perspectives groupées)
   ○ Documents distincts

2. Type de perspectives (radio)
   ◉ Acteurs de l'époque
   ○ Historiens et historiennes

3. Contexte (texte libre, obligatoire pour 3.3/3.4)
   Placeholder : Ex : en 1775
   Hint : Décrivez brièvement l'enjeu historique et la période.

4. Aperçu consigne (généré temps réel selon 1+2+3+comportement)
```

**Éléments automatiques :**

- "en désaccord" → comportement_id = 3.3
- "d'accord" → comportement_id = 3.4
- "acteurs" / "historiens" → selon radio type

**Exemples réels**

- "Le document 9 présente deux points de vue d'acteurs en 1775.
  Sur quel point précis ces acteurs sont-ils en désaccord ?"
- "Le document 23 présente deux points de vue d'historiens sur
  la lutte du Parti patriote en 1834. Sur quel point précis
  ces historiens sont-ils d'accord ?"

---

## OI3 · 3.5 — Trois points de vue (détection d'intrus)

**Paramètres :** 3 slots, 5 lignes, Bloc 3 template pur,
Bloc 4 Perspectives count=3, Bloc 5 Intrus.

**Niveau de guidage : template pur.**
Formule identique à 100% sur les 5 exemples analysés.

**Champs Bloc 3 — dans l'ordre d'affichage :**

```
1. Structure documentaire (radio)
   ◉ Un seul document (perspectives groupées)
   ○ Documents distincts

2. Type de perspectives (radio)
   ◉ Acteurs de l'époque
   ○ Historiens et historiennes

3. Contexte (texte libre, OBLIGATOIRE pour 3.5)
   Placeholder : Ex : concernant la crise agricole au Bas-Canada
   Hint : Décrivez brièvement l'enjeu historique et la période.

4. Aperçu consigne (généré temps réel, non modifiable)
```

**Exemples réels**

- "Le document 1 présente trois points de vue d'acteurs sur
  un enjeu politique en 1760. Nommez l'acteur qui présente
  un point de vue différent. Puis, comparez ce point de vue
  à celui des deux autres acteurs."

---

## OI3 · Bloc 4 — Perspectives (count=2 ou count=3)

### Mode groupé

```
Titre du document
Type : Textuel / Iconographique

── Perspective A ──────────────────────
Acteur ou historien : [nom, identité]
Extrait : [RichTextEditor]
Source : [RichTextEditor]

── Perspective B ──────────────────────
Acteur ou historien : [nom, identité]
Extrait : [RichTextEditor]
Source : [RichTextEditor]

(── Perspective C ── si count=3)
```

→ documents_new générés automatiquement
→ is_published: false — composite, non réutilisable dans la banque

### Mode séparé

Comportement standard actuel — slots indépendants.
→ is_published: true — réutilisables dans la banque

### Impression — mode groupé

```
┌──────────────────────────────────────────────────┐
│ Document A                                        │
│  [Perspective A]       │  [Perspective B]         │
│  [contenu...]          │  [contenu...]            │
│  Source : ...          │  Source : ...            │
└──────────────────────────────────────────────────┘
```

3 colonnes pour count=3, même pattern.

---

## OI3 · Bloc 5 — Intrus (3.3, 3.4, 3.5)

```
Quel est l'[acteur de l'époque / historien ou historienne]
dont le point de vue est différent ?

○ Perspective A — [nom déduit du Bloc 4]
○ Perspective B — [nom déduit du Bloc 4]
○ Perspective C — [nom déduit du Bloc 4] (si count=3)

Explication de la différence : [RichTextEditor]
Point commun des deux autres : [RichTextEditor]
```

Les noms dans les radios sont déduits automatiquement
des champs "Acteur ou historien" saisis au Bloc 4.

---

## OI4 · 4.1 et 4.2 — Cause / Conséquence

**Paramètres :** 1 document, 3 lignes, Bloc 4 standard.
**Niveau de guidage : modèle souple.**

Grande variété de formulations — template figé trop contraignant.

**Modèle 4.1 :**

```
À l'aide du document {{doc_A}}, indiquez une cause
de [réalité historique].
```

**Modèle 4.2 :**

```
À l'aide du document {{doc_A}}, indiquez une conséquence
de [événement / réalité] sur [domaine].
```

## OI4 · 4.3 et 4.4 — Hors périmètre

NR — voir SPEC-PARCOURS-NR.md à créer.

---

## OI6 — Changements et continuités

### Distinction diachronique

OI6 = même objet, deux moments différents.
À distinguer de OI3 (synchronique = deux objets, même moment).

**Règle critique :** les repères temporels ne s'affichent
**jamais** explicitement sur la feuille élève — ils sont
dans le contenu des documents. L'élève les trouve lui-même.

### OI6 · 6.1 et 6.2

**Paramètres :** 2 documents, 3 lignes, Bloc4Moments count=2.
**Niveau de guidage : modèle souple.**

### OI6 · 6.3

**Paramètres :** 2 documents (corrigé erreur oi.json : était 3),
5 lignes, Bloc 3 template pur, Bloc4Moments count=2.

**Formule figée :**

```
À partir du document {{doc_A}}, indiquez s'il y a
changement ou continuité quant à [enjeu].
Justifiez votre réponse.
Indiquez un repère de temps.
```

Champ unique : **Enjeu** (texte libre, obligatoire).

### Bloc 4 — Moments (OI6 · 6.3)

Même architecture que Bloc4Perspectives — sémantique différente.
Pas de champ "Repère temporel" — dans le contenu des documents.
Choix groupé/séparé au Bloc 3 (même `SET_PERSPECTIVES_MODE_WITH_MIGRATION`).
Note : OI6·6.1 et 6.2 utilisent le Bloc 4 standard (1 document).

**Mode groupé :**

```
┌─ Document A ──────────────────────────────────────┐
│  Titre [champ texte, optionnel]                    │
│  ┌─ État A ─────────────────────────────────────┐  │
│  │  Titre [optionnel]                           │  │
│  │  Contenu : [RichTextEditor]                  │  │
│  │  Source : [RichTextEditor]                   │  │
│  └──────────────────────────────────────────────┘  │
│  ┌─ État B ─────────────────────────────────────┐  │
│  │  (même structure)                            │  │
│  └──────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────┘
```

**Mode séparé :** Document A et Document B indépendants
(DocumentSlotPanel standard).

---

## OI7 · 7.1 — Liens de causalité

**Paramètres :** 3 documents distincts, 10 lignes, 3 points,
Bloc 3 template pur (variante `oi7`), Bloc 4 standard.

**Deux modes — gabarit recommandé ou consigne libre :**

Mode **gabarit** (défaut) — 4 champs :

- Réalité historique (obligatoire)
- Élément 1 (obligatoire)
- Élément 2 (obligatoire)
- Élément 3 (obligatoire)

Formule générée avec pills inline :

```
[pill-auto: Consultez les documents A, B et C.]
Expliquez comment [pill-field: réalité historique].
Pour répondre à la question, précisez les éléments
ci-dessous et liez-les entre eux.
• [pill-field: Élément 1]
• [pill-field: Élément 2]
• [pill-field: Élément 3]
```

Mode **consigne libre** — TipTap pré-rempli du gabarit,
modifiable librement. Les composantes sont grisées.

Toggle : bouton « Rédiger librement → » / « ← Revenir au gabarit ».
State : `consigneMode: "gabarit" | "personnalisee"` dans `Bloc3Slice`.

**Champs — 4 (gabarit) :** réalité historique,
élément 1, élément 2, élément 3.
Le champ période est masqué (implicite dans la réalité).

---

## Payload unifié

```typescript
// lib/tae/oi-perspectives/perspectives-types.ts

export type PerspectiveData = {
  acteur: string; // nom — label UI "Acteur ou historien"
  contenu: string; // HTML TipTap
  source: string; // HTML TipTap
};

export type MomentData = {
  contenu: string; // HTML — contient les indices temporels
  source: string; // HTML
  // Pas de champ repere — trouvé par l'élève
};

export type PerspectivesPayload = {
  mode: "groupe" | "separe";
  titre?: string;
  type?: "textuel" | "iconographique";
  typePerspectives: "acteurs" | "historiens";
  perspectives: PerspectiveData[];
};

export type MomentsPayload = {
  mode: "groupe" | "separe";
  titre?: string;
  type?: "textuel" | "iconographique";
  moments: MomentData[];
};

export type IntrusPayload = {
  intrusLetter: "A" | "B" | "C" | "";
  explicationDifference: string;
  pointCommun: string;
};
```

---

## Structure des fichiers

```
components/tae/TaeForm/
  bloc3/
    Bloc3Resolver.tsx               ← ✅ Sprint 2 (dans wizardBlocResolver)
    templates/
      Bloc3LibreEditor.tsx          ← existant
      Bloc3ModeleSouple.tsx         ← ✅ Sprint 2 étape 3
      Bloc3TemplateStructure.tsx    ← ✅ Sprint 2 étape 5
      Bloc3TemplatePur.tsx          ← ✅ Sprint 2 étape 6

  bloc4/
    Bloc4Resolver.tsx               ← Sprint 2 étape 9
    Bloc4Standard.tsx               ← existant
    Bloc4Perspectives.tsx           ← Sprint 2 étape 8
    Bloc4Moments.tsx                ← Sprint 3

  bloc5/
    Bloc5Intrus.tsx                 ← Sprint 2 étape 10 (stub → impl)

lib/tae/
  wizard-bloc-config.ts             ← ✅ Sprint 1
  consigne-templates.ts             ← ✅ Sprint 1
  oi-perspectives/
    perspectives-types.ts           ← ✅ Sprint 1
    perspectives-payload.ts         ← ✅ Sprint 1
    perspectives-helpers.ts         ← ✅ Sprint 1 + à étendre (migration)
    moments-payload.ts              ← Sprint 3
    perspectives-print.ts           ← Sprint 2 étape 11
    moments-print.ts                ← Sprint 3
```

---

## Copy UI complète

### Déjà ajoutées — Sprint 1

18 constantes PERSP\_\* dans lib/ui/ui-copy.ts.

### Corrections v2 — à mettre à jour

| Constante                   | Ancienne valeur       | Nouvelle valeur              |
| --------------------------- | --------------------- | ---------------------------- |
| PERSP_BLOC3_TYPE_ACTEURS    | "Acteurs historiques" | "Acteurs de l'époque"        |
| PERSP_BLOC3_TYPE_HISTORIENS | "Historiens"          | "Historiens et historiennes" |

### À ajouter — choix structure (v2)

| Constante                             | Libellé                                                                                        |
| ------------------------------------- | ---------------------------------------------------------------------------------------------- |
| PERSP_BLOC3_STRUCTURE_LABEL           | Structure documentaire                                                                         |
| PERSP_BLOC3_STRUCTURE_GROUPE          | Un seul document (perspectives groupées)                                                       |
| PERSP_BLOC3_STRUCTURE_SEPARE          | Documents distincts                                                                            |
| PERSP_BLOC3_MIGRATION_TITLE           | Modifier la structure du document                                                              |
| PERSP_BLOC3_MIGRATION_BODY            | Les contenus saisis (extraits, sources, acteurs) seront transférés dans la nouvelle structure. |
| PERSP_BLOC3_MIGRATION_SUBTITLE_GROUPE | Un seul document physique divisé en perspectives côte à côte.                                  |
| PERSP_BLOC3_MIGRATION_SUBTITLE_SEPARE | Documents indépendants, réutilisables dans la banque.                                          |
| PERSP_BLOC3_MIGRATION_CONFIRM         | Confirmer                                                                                      |
| PERSP_BLOC3_MIGRATION_CANCEL          | Annuler                                                                                        |

### À ajouter — Sprint 3 (OI4, OI6, OI7)

Voir section "Copy UI à ajouter" de la version précédente —
inchangée pour OI4/OI6/OI7.

---

## État d'implémentation

```
Sprint 1  ✅ LIVRÉ
  Fondations : wizard-bloc-config, consigne-templates,
  oi-perspectives/ (types, payload, helpers),
  Copy UI OI3 (18 constantes PERSP_*)

Sprint 2  ✅ LIVRÉ
  RadioCardGroup primitif UI ; Bloc3ModeleSouple, Bloc3TemplateStructure,
  Bloc3TemplatePur ; Bloc4Perspectives accordéon séquentiel ; Bloc5Intrus ;
  PerspectivesPrintBlock ; ComportementBreadcrumb ; amorce documentaire ;
  guards Bloc 3 + Bloc 5 ; tooltips consigne ; reducer complet
  (perspectivesMode/Type/Contexte/Titre, intrus, migration)

Sprint 3  🔲 À FAIRE
  OI4, OI6, OI7 — Bloc4Moments, templates oi6/oi7

Sprint 4  🔲 À FAIRE
  NR OI4/OI5 — SPEC-PARCOURS-NR.md
```

---

## Ce qui n'est PAS dans cette spec

- OI4·4.3/4.4 et OI5 — NR, spec séparée SPEC-PARCOURS-NR.md
- Export PDF colonnes — dépend du chantier E3
- Tests unitaires — migratePerspectivesToSlots() et
  migrateSlotsToPerpsectives() sont des fonctions pures
  prioritaires à couvrir dans perspectives-helpers.test.ts
