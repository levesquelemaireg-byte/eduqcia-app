# Spec : Parcours non-rédactionnel `causes-consequences` (OI4 — Déterminer des causes et des conséquences)

> **✅ SPEC FERMÉE — Livrée le 8 mai 2026** (commits `9855bb8`, `db2f5b1`, `9257f9b`)
> Cette spec est un document historique. Le code fait foi.
> Pour l'architecture courante, voir le code dans `lib/tache/non-redaction/` et `components/tache/non-redaction/`.

**Projet :** ÉduQc.IA  
**Scope :** Implémentation du parcours wizard pour les comportements non-rédactionnels 4.3 et 4.4  
**Date :** Mai 2026  
**Pattern de référence :** `manifestations` (OI5) — même famille (association document → catégorie fixe)  
**Note :** Les comportements rédactionnels 4.1 et 4.2 existent déjà et ne sont pas touchés par cette spec.

---

## 1. Vue d'ensemble

Les comportements 4.3 et 4.4 évaluent la capacité de l'élève à identifier des liens de causalité dans le dossier documentaire en associant des numéros de documents à des rôles causaux (facteur explicatif, conséquence).

Contrairement à `manifestations` (OI5) où l'enseignant définit les catégories, ici les catégories sont **fixes** — déterminées par le comportement choisi.

| Comportement | Énoncé                                                                    | Docs | Catégories (fixes)                                    | Layout            | Grille          |
| ------------ | ------------------------------------------------------------------------- | ---- | ----------------------------------------------------- | ----------------- | --------------- |
| 4.3          | Déterminer les deux facteurs explicatifs (numéros de documents)           | 2    | "Un facteur explicatif de [sujet]" × 2                | Empilé (2 lignes) | OI4_SO3 — 2/1/0 |
| 4.4          | Déterminer le facteur explicatif et la conséquence (numéros de documents) | 2    | "Une cause de [sujet]" / "Une conséquence de [sujet]" | Empilé (2 lignes) | OI4_SO4 — 2/1/0 |

---

## 2. Données existantes dans `oi.json`

```json
{
  "id": "4.3",
  "enonce": "Déterminer les deux facteurs explicatifs (réponse constituée de numéros de documents)",
  "nb_documents": null,   // → corriger à 2
  "nb_lignes": 0,
  "status": "coming_soon",
  "outil_evaluation": "OI4_SO3",
  "variant_slug": null    // → ajouter "causes-consequences"
},
{
  "id": "4.4",
  "enonce": "Déterminer le facteur explicatif et la conséquence (réponse constituée de numéros de documents)",
  "nb_documents": null,   // → corriger à 2
  "nb_lignes": 0,
  "status": "coming_soon",
  "outil_evaluation": "OI4_SO4",
  "variant_slug": "causes-consequences"
}
```

**Corrections à appliquer sur `oi.json` :**

- `4.3` : `nb_documents: 2`, `variant_slug: "causes-consequences"`
- `4.4` : `nb_documents: 2`

**Grilles à CRÉER dans `grilles-evaluation.json` :**

OI4_SO3 (deux facteurs explicatifs) :

```json
{
  "id": "OI4_SO3",
  "oi": "OI4",
  "comportement_id": "4.3",
  "outil_image": "OI4_SO3.png",
  "operation": "Déterminer des causes et des conséquences",
  "comportement_enonce": "Déterminer les deux facteurs explicatifs (réponse constituée de numéros de documents).",
  "type_reponse": "non_ecrite",
  "bareme": {
    "max_points": 2,
    "echelle": [
      {
        "points": 2,
        "label": "2 points",
        "description": "L'élève détermine les deux facteurs explicatifs. (2 sur 2)"
      },
      {
        "points": 1,
        "label": "1 point",
        "description": "L'élève détermine l'un des facteurs explicatifs. (1 sur 2)"
      },
      {
        "points": 0,
        "label": "0 point",
        "description": "L'élève ne détermine pas les facteurs explicatifs. (0 sur 2)"
      }
    ]
  }
}
```

OI4_SO4 (facteur explicatif et conséquence) :

```json
{
  "id": "OI4_SO4",
  "oi": "OI4",
  "comportement_id": "4.4",
  "outil_image": "OI4_SO4.png",
  "operation": "Déterminer des causes et des conséquences",
  "comportement_enonce": "Déterminer le facteur explicatif et la conséquence (réponse constituée de numéros de documents).",
  "type_reponse": "non_ecrite",
  "bareme": {
    "max_points": 2,
    "echelle": [
      {
        "points": 2,
        "label": "2 points",
        "description": "L'élève détermine le facteur explicatif et la conséquence. (2 sur 2)"
      },
      {
        "points": 1,
        "label": "1 point",
        "description": "L'élève détermine le facteur explicatif ou la conséquence. (1 sur 2)"
      },
      {
        "points": 0,
        "label": "0 point",
        "description": "L'élève ne détermine pas le facteur explicatif ni la conséquence. (0 sur 2)"
      }
    ]
  }
}
```

---

## 3. Workflow du wizard

### Étape 1 — Auteur(s)

Identique.

### Étape 2 — Paramètres pédagogiques

L'enseignant sélectionne :

- Niveau, discipline
- OI : « Déterminer des causes et des conséquences » (icône `manufacturing`)
- Comportement : 4.3 ou 4.4 (les comportements rédactionnels 4.1/4.2 restent disponibles aussi)

Ce que l'app fait :

- Résout `variant_slug = "causes-consequences"` (pour 4.3 et 4.4 seulement — 4.1/4.2 restent rédactionnels)
- Bascule en mode non-rédactionnel (`Bloc3CausesConsequences`)
- Fige `nb_documents = 2`
- `requiresRepereTemporel: false`
- Assigne l'outil d'évaluation (OI4_SO3 ou OI4_SO4)
- Verrouille le blueprint

### Étape 3 — Consigne et guidage

**Comportement 4.3 (deux facteurs explicatifs) :**

Template consigne :

```
Inscrivez dans la case appropriée le numéro du document qui fait
référence à un facteur explicatif de _______.
```

- 1 champ éditable : le sujet (ex: "la sédentarité des Premières Nations iroquoiennes vers 1500")
- Max 150 caractères, compteur orange à 120
- Le sujet saisi est réutilisé dans les labels de l'espace de production

**Comportement 4.4 (facteur explicatif et conséquence) :**

Template consigne :

```
Inscrivez dans la case appropriée le numéro du document qui fait
référence à :

• une cause de _______ ;
• une conséquence de _______.
```

- 1 champ éditable : le sujet (ex: "l'arrivée des loyalistes dans la Province de Québec")
- Max 150 caractères, compteur orange à 120
- Le sujet saisi est réutilisé dans les labels de l'espace de production

**Guidage complémentaire :**

- Éditeur TipTap libre, optionnel

**Gate :** Étape complète quand le sujet est rempli.

### Étape 4 — Documents historiques (2 slots)

- 2 slots de documents
- `requiresRepereTemporel: false`
- L'enseignant crée ou sélectionne des documents qui illustrent les causes/conséquences

**Gate :** Les 2 slots complets.

### Étape 5 — Corrigé

L'enseignant assigne manuellement chaque document à son rôle. Les catégories sont fixes et pré-remplies.

**Pour 4.3 (deux facteurs explicatifs) :**

- "Facteur explicatif 1" → sélecteur : Doc 1 / Doc 2
- "Facteur explicatif 2" → sélecteur : Doc 1 / Doc 2
- Options disabled pour empêcher les doublons

**Pour 4.4 (cause et conséquence) :**

- "Cause" → sélecteur : Doc 1 / Doc 2
- "Conséquence" → sélecteur : Doc 1 / Doc 2
- Options disabled pour empêcher les doublons

**Gate :** Les 2 documents assignés sans doublon.

### Étape 6 — Compétence disciplinaire

Identique.

### Étape 7 — Aspects et connaissances

Identique.

### Publication

Même flux transactionnel.

---

## 4. Espace de production dans le rendu imprimé

Layout empilé (pas côte à côte) — les labels reprennent le sujet de la consigne et peuvent être longs.

### 4.3 — Deux facteurs explicatifs

```
┌──────────────────────────────────────────────────────────────────────┐
│ Un facteur explicatif de [sujet]                                 □ │
└──────────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────────┐
│ Un facteur explicatif de [sujet]                                 □ │
└──────────────────────────────────────────────────────────────────────┘
```

### 4.4 — Cause et conséquence

```
┌──────────────────────────────────────────────────────────────────────┐
│ Une cause de [sujet]                                             □ │
└──────────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────────┐
│ Une conséquence de [sujet]                                       □ │
└──────────────────────────────────────────────────────────────────────┘
```

**Style CSS :**

- Grille : `display: grid; grid-template-columns: 1fr; gap: 6px;`
- Cellule : `display: flex; align-items: center; justify-content: space-between; border: 1px solid #000; padding: 6px 10px;`
- Label : `font-size: 10pt; flex: 1; line-height: 1.3;`
- Case : `width: 28px; height: 24px; border: 1px solid #000; flex-shrink: 0; margin-left: 12px;`

---

## 5. Payload non-rédactionnel

```typescript
type CausesConsequencesPayload = {
  type: "causes-consequences";
  comportementId: "4.3" | "4.4";

  // Étape 3 — consigne
  consigneSujet: string; // le sujet (réutilisé dans les labels de l'espace de production)

  // Étape 5 — corrigé
  // association : index 0 = première catégorie, index 1 = deuxième catégorie
  // valeur = numéro du document (1 ou 2)
  associations: [number | null, number | null];
};
```

Les catégories ne sont PAS dans le payload — elles sont dérivées du `comportementId` :

- `4.3` → ["Un facteur explicatif de {sujet}", "Un facteur explicatif de {sujet}"]
- `4.4` → ["Une cause de {sujet}", "Une conséquence de {sujet}"]

---

## 6. Différences clés avec `manifestations` (OI5)

| Aspect                   | `manifestations` (OI5)            | `causes-consequences` (OI4)                                             |
| ------------------------ | --------------------------------- | ----------------------------------------------------------------------- |
| Catégories               | Saisies par l'enseignant (2 ou 4) | Fixes, dérivées du comportement                                         |
| Nombre de catégories     | 2 ou 4 (sélecteur)                | Toujours 2                                                              |
| Labels espace production | Titre court (ex: "Droits")        | Long, reprend le sujet (ex: "Une cause de l'arrivée des loyalistes...") |
| Layout copie élève       | Côte à côte (grille 2×2)          | Empilé (1 colonne)                                                      |
| Sélecteur organisation   | Oui (2×2 ou 4×1 pour 5.2)         | Non                                                                     |
| Documents                | 2 ou 4                            | Toujours 2                                                              |

---

## 7. Fichiers à créer / modifier

### Créer (nouveau)

| Fichier                                                                                       | Rôle                                                    |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `lib/tache/behaviours/causes-consequences.ts`                                                 | `ComportementConfig`                                    |
| `lib/tache/non-redaction/causes-consequences-payload.ts`                                      | Payload Zod + normalize + merge + gates + builders HTML |
| `components/tache/non-redaction/causes-consequences/Bloc3CausesConsequences.tsx`              | UI étape 3                                              |
| `components/tache/non-redaction/consigne-template/CausesConsequencesConsigneTemplate.tsx`     | Template consigne                                       |
| `components/tache/non-redaction/causes-consequences/Bloc4CausesConsequences.tsx`              | UI étape 4 (2 slots)                                    |
| `components/tache/non-redaction/causes-consequences/useCausesConsequencesPayloadBootstrap.ts` | Hook bootstrap                                          |
| `components/tache/wizard/bloc5/non-redactionnel/Bloc5CausesConsequences.tsx`                  | UI étape 5                                              |
| `lib/tache/non-redaction/causes-consequences-payload.test.ts`                                 | Tests                                                   |

### Modifier (existant)

| Fichier                                                 | Modification                                                                   |
| ------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `public/data/oi.json`                                   | `nb_documents: 2` pour 4.3/4.4, `variant_slug: "causes-consequences"` pour 4.3 |
| `public/data/grilles-evaluation.json`                   | Créer OI4_SO3 et OI4_SO4                                                       |
| `lib/tache/behaviours/types.ts`                         | Ajouter `"causes-consequences"` à `ComportementSlug`                           |
| `lib/tache/behaviours/registry.ts`                      | Entrée + `BLOC5_DYNAMIC_BY_SLUG`                                               |
| `lib/tache/non-redaction/variant-slugs.ts`              | Vérifier si `"causes-consequences"` est déjà dans l'enum                       |
| `lib/tache/wizard-state-nr.ts`                          | Variant + selector                                                             |
| `lib/tache/tache-form-state-types.ts`                   | Variant + action                                                               |
| `lib/tache/tache-form-reducer.ts`                       | Factory + case                                                                 |
| `lib/tache/non-redaction/wizard-variant.ts`             | `isActiveCausesConsequencesVariant`                                            |
| `lib/tache/non-redaction/non-redaction-edit-hydrate.ts` | Branche                                                                        |
| `lib/tache/wizard-publish-guards.ts`                    | 4 branches                                                                     |
| `lib/tache/contrats/etat-wizard-vers-tache.ts`          | 4 branches                                                                     |
| `components/tache/wizard/wizardBlocResolver.tsx`        | Entrée routage                                                                 |
| `lib/ui/copy/non-redaction.ts`                          | Constantes `NR_CAUSES_CONSEQUENCES_*`                                          |
| `docs/UI-COPY.md`                                       | Entrées copy                                                                   |
| `app/globals.css`                                       | Classes `.causes-consequences-student-*`                                       |

---

## 8. Plan d'implémentation

### Lot 1 — Référentiel + logique pure

1. Corriger `oi.json` : `nb_documents: 2`, `variant_slug` pour 4.3
2. Créer grilles OI4_SO3 et OI4_SO4 dans `grilles-evaluation.json`
3. Créer `behaviours/causes-consequences.ts`
4. Ajouter slug, variant, action dans les fichiers types/state/reducer
5. Créer `causes-consequences-payload.ts` (Zod, gates, builders HTML)
6. Tests
7. Build clean

### Lot 2 — UI wizard

1. Créer `Bloc3CausesConsequences.tsx` + template consigne
2. Créer `Bloc4CausesConsequences.tsx` (2 slots)
3. Créer `Bloc5CausesConsequences.tsx` (assignation avec options disabled)
4. Hook bootstrap
5. Routage `wizardBlocResolver`
6. Copy UI
7. Build clean

### Lot 3 — Pipeline + activation

1. Branchements publication (4 fichiers)
2. CSS feuille élève (empilé, `grid-template-columns: 1fr`)
3. Retirer `status: "coming_soon"` des comportements 4.3 et 4.4
4. Migration SQL
5. Test end-to-end
6. `BACKLOG-HISTORY.md`

---

## 9. Ce qui n'est PAS dans cette spec

- Les comportements rédactionnels 4.1 et 4.2 — déjà implémentés et fonctionnels
- Aucune modification aux grilles existantes OI4_SO1 et OI4_SO2
- Le redesign du Bloc 3 (chantier transversal séparé)
- Pas de helpers complexes (pas de génération de distractrices — assignation manuelle simple)
