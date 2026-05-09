# Spec : Parcours non-rédactionnel `manifestations` (OI5 — Mettre en relation des faits)

> **✅ SPEC FERMÉE — Livrée le 8 mai 2026** (commits `040c217`, `7831f22`, `a2f38de`)
> Cette spec est un document historique. Le code fait foi.
> Pour l'architecture courante, voir le code dans `lib/tache/non-redaction/` et `components/tache/non-redaction/`.

**Projet :** ÉduQc.IA  
**Scope :** Implémentation complète du parcours wizard pour les 2 comportements de l'OI5  
**Date :** Avril 2026  
**Pattern de référence :** `avant-apres` (OI1) pour l'architecture, `carte-historique` (OI2) pour le pattern le plus récent  
**Rapport source :** NotebookLM — analyse des épreuves ministérielles MEQ

---

## 1. Vue d'ensemble

L'OI5 « Mettre en relation des faits » évalue la capacité de l'élève à associer des documents historiques à des catégories conceptuelles. L'élève doit inscrire des numéros de documents dans des cases correspondant aux catégories définies par l'enseignant.

C'est une OI non-rédactionnelle. L'élève ne rédige pas — il classe.

| Comportement | Énoncé                                                                                                 | Docs | Catégories                                                       | Espace production | Grille          |
| ------------ | ------------------------------------------------------------------------------------------------------ | ---- | ---------------------------------------------------------------- | ----------------- | --------------- |
| 5.1          | Associer des faits à des manifestations ou à des descriptions qui leur sont apparentées (deux faits)   | 2    | 2 (1 doc chaque)                                                 | Grille 2 cases    | 2/1/0 (2 sur 2) |
| 5.2          | Associer des faits à des manifestations ou à des descriptions qui leur sont apparentées (quatre faits) | 4    | 2 catégories × 2 docs OU 4 catégories × 1 doc (choix enseignant) | Grille 4 cases    | 2/1/0 (4 sur 4) |

---

## 2. Données existantes dans `oi.json`

```json
{
  "id": "OI5",
  "titre": "Mettre en relation des faits",
  "icone": "graph_3",
  "status": "coming_soon", // → passer à "active" au Lot 3
  "comportements_attendus": [
    {
      "id": "5.1",
      "enonce": "Associer des faits à des manifestations ou à des descriptions qui leur sont apparentées (deux faits).",
      "nb_documents": null, // → corriger à 2
      "nb_lignes": 0,
      "outil_evaluation": "OI5_SO1",
      "variant_slug": "manifestations"
    },
    {
      "id": "5.2",
      "enonce": "Associer des faits à des manifestations ou à des descriptions qui leur sont apparentées (quatre faits).",
      "nb_documents": null, // → corriger à 4
      "nb_lignes": 0,
      "outil_evaluation": "OI5_SO2",
      "variant_slug": "manifestations"
    }
  ]
}
```

**Corrections à appliquer sur `oi.json` :**

- `5.1` : `nb_documents: 2`
- `5.2` : `nb_documents: 4`

**Corrections à appliquer/vérifier sur `grilles-evaluation.json` :**

OI5_SO1 (2 faits) :

```json
{
  "id": "OI5_SO1",
  "oi": "OI5",
  "comportement_id": "5.1",
  "operation": "Mettre en relation des faits",
  "comportement_enonce": "Associer des faits à des manifestations ou à des descriptions qui leur sont apparentées (deux faits).",
  "type_reponse": "non_ecrite",
  "bareme": {
    "max_points": 2,
    "echelle": [
      {
        "points": 2,
        "label": "2 points",
        "description": "L'élève met en relation tous les faits. (2 sur 2)"
      },
      {
        "points": 1,
        "label": "1 point",
        "description": "L'élève met en relation certains faits. (1 sur 2)"
      },
      {
        "points": 0,
        "label": "0 point",
        "description": "L'élève ne met pas en relation les faits. (0 sur 2)"
      }
    ]
  }
}
```

OI5_SO2 (4 faits) :

```json
{
  "id": "OI5_SO2",
  "oi": "OI5",
  "comportement_id": "5.2",
  "operation": "Mettre en relation des faits",
  "comportement_enonce": "Associer des faits à des manifestations ou à des descriptions qui leur sont apparentées (quatre faits).",
  "type_reponse": "non_ecrite",
  "bareme": {
    "max_points": 2,
    "echelle": [
      {
        "points": 2,
        "label": "2 points",
        "description": "L'élève met en relation tous les faits. (4 sur 4)"
      },
      {
        "points": 1,
        "label": "1 point",
        "description": "L'élève met en relation certains faits. (3 ou 2 sur 4)"
      },
      {
        "points": 0,
        "label": "0 point",
        "description": "L'élève ne met pas en relation les faits. (1 ou 0 sur 4)"
      }
    ]
  }
}
```

---

## 3. Workflow du wizard — étape par étape

### Étape 1 — Auteur(s)

Identique à tous les parcours.

### Étape 2 — Paramètres pédagogiques

L'enseignant sélectionne :

- Niveau, discipline
- OI : « Mettre en relation des faits » (icône `graph_3`)
- Comportement : 5.1 (2 faits) ou 5.2 (4 faits)

Ce que l'app fait :

- Résout `variant_slug = "manifestations"`
- Bascule en mode non-rédactionnel (`Bloc3Manifestations`)
- Fige `nb_documents` à 2 (pour 5.1) ou 4 (pour 5.2)
- `requiresRepereTemporel: false` (pas de repère temporel requis sur les documents — l'enseignant peut l'ajouter pour l'indexation mais ce n'est pas obligatoire)
- Assigne l'outil d'évaluation (OI5_SO1 ou OI5_SO2)
- Verrouille le blueprint

**Si comportement 5.2 :** un sélecteur supplémentaire apparaît :

- Label : « Organisation des catégories »
- Options : « 2 catégories (2 documents chacune) » / « 4 catégories (1 document chacune) »
- Défaut : « 2 catégories »
- Ce choix détermine le layout de l'espace de production et le nombre de champs de catégorie à l'étape 3

### Étape 3 — Consigne et catégories

L'enseignant configure :

**La consigne (template ministériel) :**

Pour 5.1 :

```
Les documents {{doc_1}} et {{doc_2}} font référence à _______.
Inscrivez dans la case appropriée le numéro de chacun des documents.
```

- 1 champ éditable : le sujet général (ex: "la tradition orale et la prise de décision chez les Premiers Peuples")
- Max 150 caractères, compteur orange à 120

Pour 5.2 :

```
Les documents {{doc_1}} à {{doc_4}} font référence à _______.
Inscrivez dans la case appropriée le numéro de chacun des quatre documents.
```

- 1 champ éditable : le sujet général (ex: "aux droits et aux devoirs des censitaires dans le régime seigneurial")
- Max 200 caractères, compteur orange à 160

**Les catégories :**

L'enseignant saisit les noms des catégories dans des champs séparés :

Pour 5.1 (toujours 2 catégories) :

- Catégorie 1 : **\_\_\_** (ex: "Tradition orale")
- Catégorie 2 : **\_\_\_** (ex: "Partage des biens")

Pour 5.2 avec 2 catégories :

- Catégorie 1 : **\_\_\_** (ex: "Droits des censitaires")
- Catégorie 2 : **\_\_\_** (ex: "Devoirs des censitaires")

Pour 5.2 avec 4 catégories :

- Catégorie 1 : **\_\_\_** (ex: "Gouverneur")
- Catégorie 2 : **\_\_\_** (ex: "Intendant")
- Catégorie 3 : **\_\_\_** (ex: "Conseil souverain")
- Catégorie 4 : **\_\_\_** (ex: "Capitaine de milice")

Max 60 caractères par catégorie, compteur orange à 50.

**Guidage complémentaire :**

- Éditeur TipTap libre (optionnel)

**Gate :** Étape complète quand le sujet est rempli ET toutes les catégories sont remplies.

### Étape 4 — Documents historiques

- 5.1 : 2 slots de documents
- 5.2 : 4 slots de documents
- `requiresRepereTemporel: false`
- L'enseignant crée ou sélectionne des documents (textuels ou iconographiques) — chaque document illustre un fait à associer à une catégorie

**Gate :** Tous les slots complets.

### Étape 5 — Corrigé

L'enseignant assigne chaque document à sa catégorie. Pas de génération automatique — c'est l'enseignant qui fait le classement.

**Pour 5.1 (2 docs, 2 catégories) :**

- Catégorie « Tradition orale » → sélecteur : Doc 1 / Doc 2
- Catégorie « Partage des biens » → sélecteur : Doc 1 / Doc 2
- Validation : chaque document doit être assigné exactement une fois (pas de doublon)

**Pour 5.2 avec 2 catégories × 2 docs :**

- Catégorie « Droits » → 2 sélecteurs : Doc ? et Doc ?
- Catégorie « Devoirs » → 2 sélecteurs : Doc ? et Doc ?
- Validation : les 4 documents assignés exactement une fois

**Pour 5.2 avec 4 catégories × 1 doc :**

- Catégorie « Gouverneur » → sélecteur : Doc ?
- Catégorie « Intendant » → sélecteur : Doc ?
- Catégorie « Conseil souverain » → sélecteur : Doc ?
- Catégorie « Capitaine de milice » → sélecteur : Doc ?
- Validation : les 4 documents assignés exactement une fois

Le corrigé HTML construit : liste des associations catégorie → numéro(s) de document.

**Gate :** Tous les documents assignés sans doublon.

### Étape 6 — Compétence disciplinaire

Identique.

### Étape 7 — Aspects de société et connaissances

Identique.

### Publication

Même flux transactionnel que les autres parcours non-rédactionnels.

---

## 4. Espace de production dans le rendu imprimé

Layout grille 2×2 validé. Chaque cellule : label à gauche, case(s) à droite, bordure 1px solid #000 autour de chaque cellule. Padding compact.

### 5.1 — 2 catégories (1 rangée, 2 cellules côte à côte)

```
┌──────────────────────────────┐ ┌──────────────────────────────┐
│ Tradition orale         □    │ │ Partage des biens       □    │
└──────────────────────────────┘ └──────────────────────────────┘
```

### 5.2 — 2 catégories × 2 docs (1 rangée, 2 cellules)

```
┌──────────────────────────────┐ ┌──────────────────────────────┐
│ Droits des censitaires □ □   │ │ Devoirs des censitaires □ □  │
└──────────────────────────────┘ └──────────────────────────────┘
```

Les 2 cases sont séparées par "et" centré.

### 5.2 — 4 catégories × 1 doc (grille 2×2)

```
┌──────────────────────────────┐ ┌──────────────────────────────┐
│ Gouverneur              □    │ │ Intendant               □    │
└──────────────────────────────┘ └──────────────────────────────┘
┌──────────────────────────────┐ ┌──────────────────────────────┐
│ Conseil souverain       □    │ │ Capitaine de milice      □   │
└──────────────────────────────┘ └──────────────────────────────┘
```

**Style CSS :**

- Grille : `display: grid; grid-template-columns: 1fr 1fr; gap: 6px;`
- Cellule : `display: flex; align-items: center; justify-content: space-between; border: 1px solid #000; padding: 6px 10px;`
- Label : `font-size: 10pt; flex: 1;`
- Case : `width: 28px; height: 24px; border: 1px solid #000;`
- "et" entre 2 cases : `font-size: 9pt; color: #000; text-align: center;`

---

## 5. Payload non-rédactionnel

```typescript
type ManifestationsPayload = {
  type: "manifestations";
  comportementId: "5.1" | "5.2";

  // Consigne
  consigneSujet: string; // le sujet général

  // Configuration catégories
  organisationCategories: "2-categories" | "4-categories"; // pour 5.2 seulement
  categories: string[]; // 2 ou 4 labels de catégories

  // Corrigé — association document → catégorie
  // Index du tableau = index de la catégorie, valeur = numéros de documents assignés
  associations: number[][]; // ex: [[1, 3], [2, 4]] pour 2 catégories avec 2 docs chaque
};
```

---

## 6. Fichiers à créer / modifier

### Créer (nouveau)

| Fichier                                                                               | Rôle                                                    |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `lib/tache/behaviours/manifestations.ts`                                              | `ComportementConfig`                                    |
| `lib/tache/non-redaction/manifestations-payload.ts`                                   | Payload Zod + normalize + merge + gates + builders HTML |
| `lib/tache/non-redaction/manifestations-helpers.ts`                                   | Logique pure (validation associations sans doublon)     |
| `components/tache/non-redaction/manifestations/Bloc3Manifestations.tsx`               | UI étape 3 — consigne + catégories                      |
| `components/tache/non-redaction/consigne-template/ManifestationsConsigneTemplate.tsx` | Template consigne                                       |
| `components/tache/non-redaction/manifestations/Bloc4Manifestations.tsx`               | UI étape 4 — 2 ou 4 slots                               |
| `components/tache/non-redaction/manifestations/useManifestationsPayloadBootstrap.ts`  | Hook bootstrap                                          |
| `components/tache/wizard/bloc5/non-redactionnel/Bloc5Manifestations.tsx`              | UI étape 5 — assignation docs → catégories              |
| `lib/tache/non-redaction/manifestations-payload.test.ts`                              | Tests payload                                           |
| `lib/tache/non-redaction/manifestations-helpers.test.ts`                              | Tests logique pure                                      |

### Modifier (existant)

| Fichier                                                 | Modification                                                  |
| ------------------------------------------------------- | ------------------------------------------------------------- |
| `lib/tache/behaviours/types.ts`                         | Ajouter `"manifestations"` à `ComportementSlug`               |
| `lib/tache/behaviours/registry.ts`                      | Ajouter entrée + `BLOC5_DYNAMIC_BY_SLUG`                      |
| `lib/tache/wizard-state-nr.ts`                          | Ajouter variant `type: "manifestations"`                      |
| `lib/tache/tache-form-state-types.ts`                   | Ajouter variant + action `NON_REDACTION_PATCH_MANIFESTATIONS` |
| `lib/tache/tache-form-reducer.ts`                       | Factory + case                                                |
| `lib/tache/non-redaction/wizard-variant.ts`             | Ajouter `isActiveManifestationsVariant`                       |
| `lib/tache/non-redaction/non-redaction-edit-hydrate.ts` | Branche manifestations                                        |
| `lib/tache/wizard-publish-guards.ts`                    | 4 branches                                                    |
| `lib/tache/contrats/etat-wizard-vers-tache.ts`          | 4 branches (espaceProduction, consigne, guidage, corrigé)     |
| `components/tache/wizard/wizardBlocResolver.tsx`        | Entrée routage                                                |
| `lib/ui/copy/non-redaction.ts`                          | Constantes `NR_MANIFESTATIONS_*`                              |
| `docs/UI-COPY.md`                                       | Entrées copy                                                  |
| `app/globals.css`                                       | Classes `.manifestations-student-*`                           |
| `public/data/oi.json`                                   | `nb_documents` 2/4 + retirer `coming_soon` au Lot 3           |
| `public/data/grilles-evaluation.json`                   | Vérifier/corriger les grilles OI5_SO1, OI5_SO2                |

---

## 7. Plan d'implémentation

### Lot 1 — Référentiel + logique pure (pas d'UI)

1. Corriger `oi.json` : `nb_documents` 2 et 4
2. Vérifier/corriger `grilles-evaluation.json` : grilles OI5_SO1, OI5_SO2 avec les bons barèmes
3. Créer `behaviours/manifestations.ts`
4. Ajouter `"manifestations"` à `ComportementSlug`
5. Ajouter dans `registry.ts`
6. Créer `manifestations-payload.ts` (Zod, normalize, merge, gates, builders HTML)
7. Créer `manifestations-helpers.ts` (validation associations)
8. Ajouter variant dans `wizard-state-nr.ts`, `tache-form-state-types.ts`, `tache-form-reducer.ts`
9. Ajouter `isActiveManifestationsVariant`
10. Tests unitaires
11. Build clean

### Lot 2 — UI wizard (étapes 3, 4, 5)

1. Créer `Bloc3Manifestations.tsx` + `ManifestationsConsigneTemplate.tsx`
2. Créer `Bloc4Manifestations.tsx`
3. Créer `Bloc5Manifestations.tsx`
4. Créer `useManifestationsPayloadBootstrap.ts`
5. Ajouter dans `wizardBlocResolver.tsx`
6. Copy UI
7. Sélecteur "Organisation des catégories" dans le Bloc 2 (conditionnel à 5.2)
8. Build clean, test visuel

### Lot 3 — Pipeline publication + activation

1. Branchements : `etat-wizard-vers-tache.ts`, `wizard-publish-guards.ts`, `non-redaction-edit-hydrate.ts`
2. CSS feuille élève : `.manifestations-student-*` (grille 2×2, cellules label+case)
3. Retirer `status: "coming_soon"` de OI5 dans `oi.json`
4. Migration SQL (comportements + activation OI5)
5. Test end-to-end : créer une tâche 5.1 et 5.2, publier, vérifier
6. `BACKLOG-HISTORY.md`
7. Build clean + push

---

## 8. Différences clés avec `carte-historique`

| Aspect                 | `carte-historique` (OI2) | `manifestations` (OI5)                     |
| ---------------------- | ------------------------ | ------------------------------------------ |
| Réponse élève          | Lettre A/B/C/D           | Numéro de document                         |
| Génération automatique | Oui (distractrices 2.2)  | Non — l'enseignant assigne manuellement    |
| Documents              | 1 seul (carte)           | 2 ou 4                                     |
| Catégories             | Pas de catégories        | 2 ou 4 catégories nommées par l'enseignant |
| Espace production      | Carré réponse simple     | Grille 2×2 avec labels + cases             |
| Pondération variable   | Oui (1pt/2pts pour 2.1)  | Non — toujours 2/1/0                       |

---

## 9. Ce qui n'est PAS dans cette spec

- Redesign du Bloc 3 (consigne) — chantier séparé qui touche tous les parcours
- Correction des bugs de rendu imprimé existants (placeholders, grille, corrigé)
- Aucune nouvelle grille de correction à créer (les 2 existent déjà)
