# FERMÉ — 2026-04-18

Plan clôturé et archivé le 2026-04-18 après exécution du mini lot de fermeture (étape 3, test 9c, mise à jour workflows).

## Plan d'exécution — Unification des renderers documentaires (v2)

> **Objectif** : un seul type (`RendererDocument`), un seul atome de rendu (`DocumentElementRenderer`), un seul pipeline d'impression (`/apercu/[token]`), zéro perte de données, zéro renderer parallèle. Le bug PDF est résolu par construction.
>
> **Principe** : on ne crée rien de nouveau. On enrichit le canonique existant, on branche tout dessus, on supprime le reste.
>
> **Contexte** : alpha sans données en production. Aucune migration nécessaire. Un seul commit cohérent.
>
> **Contrainte** : l'invariant #5 du print-engine v2.1 reste intact — `ApercuImpression` est toujours le seul composant de rendu pour l'impression.
>
> **Reviewé par** : 6 agents externes (DeepSeek, Grok, ChatGPT, Gemini, 2 autres). Points validés intégrés, points refusés documentés ci-dessous.

---

## Vue d'ensemble

```
AVANT (6 renderers, 3 contrats, 2 routes d'impression, pertes de données) :

  DocumentFiche ──→ PrintableDocumentCell (wizard preview)
  DocumentFiche ──→ DocCard (vue détaillée tâche)
  DocumentFiche ──→ DocumentCardCompact (sommaire wizard)
  RendererDocument ──→ DocumentCard (vue détaillée doc) ✅ canonique
  DocumentReference ──→ SectionDocument (PDF via /apercu/[token]) ← PERTE DE DONNÉES
  DocumentFiche ──→ EvaluationPrintableBody (/evaluations/[id]/print) ← ROUTE DUPLIQUÉE

APRÈS (1 type, 1 atome, 1 route d'impression, 4 wrappers) :

  RendererDocument ──→ DocumentCard ──→ DocumentElementRenderer (partout)
  RendererDocument ──→ DocumentCardPrint ──→ DocumentElementRenderer (impression)
  RendererDocument ──→ SectionDocument ──→ DocumentCardPrint (PDF via /apercu/[token])
  (DocumentCardThumbnail reste comme exception documentée — miniatures de liste)
  /apercu/[token] = SEULE route d'impression pour tout (tâche, épreuve, document)
```

---

## Étape 0 — Audit pré-refactoring

Avant de toucher au code, vérifier ces 4 points :

### 0a. Grep `.kind` sur les documents

```bash
grep -rn "\.kind" lib/ components/ app/ --include="*.ts" --include="*.tsx" | grep -i doc
```

Identifier les usages de `doc.kind` (textuel/iconographique) qui casseraient avec `RendererDocument`. `RendererDocument` n'a pas `.kind` directement — c'est sur `.elements[0].kind`. Si des consommateurs font un switch sur `.kind`, ajouter un getter ou un champ dérivé.

### 0b. Grep `echelle`

```bash
grep -rn "echelle" lib/ components/ --include="*.ts" --include="*.tsx"
```

Le champ `echelle` n'existe plus (décision produit). Confirmer qu'il n'est utilisé nulle part ailleurs que dans `SectionDocument` (qui va être remplacé). Si d'autres usages existent, les supprimer.

### 0c. Ordre extractFootnotes vs sanitize

Dans `DocumentElementRenderer.tsx`, vérifier que `extractFootnotes()` est appelé AVANT `sanitize()`. Si sanitize strip les attributs `data-footnote` / `data-footnote-def` sur les `<sup>`, l'extraction sera cassée. Si l'ordre est inversé, le corriger.

### 0d. Classes CSS de SectionDocument vs DocumentCardPrint

Comparer les styles CSS appliqués par `SectionDocument` (inline styles, classes de print) et ceux de `DocumentCardPrint`. S'assurer que `DocumentCardPrint` porte les contraintes de mise en page nécessaires :

- `break-inside: avoid` (ou équivalent)
- Marges compatibles avec la pagination du print-engine
- Largeur compatible avec `PAGE_WIDTH_PX`

Si des classes manquent dans `DocumentCardPrint`, les ajouter.

---

## Étape 1 — Enrichir DocumentElementRenderer

Fichier : `components/documents/DocumentElementRenderer.tsx`

### 1a. imagePixelWidth/Height

Ajouter au type `DocumentElement` dans `lib/types/document-renderer.ts` (si pas déjà présents) :

```typescript
// Dans DocumentElement (union discriminée)
imagePixelWidth?: number;
imagePixelHeight?: number;
```

Dans le renderer, utiliser ces dimensions quand disponibles :

```
Si element.imagePixelWidth ET element.imagePixelHeight sont définis :
  → utiliser ces dimensions (fidélité pixel-perfect)
Sinon :
  → fallback sur 660×400 (comportement actuel)
```

### 1b. Footnotes systématiques

Confirmer que `extractFootnotes()` est appelé sur TOUS les chemins textuels, pas seulement certains. Le comparatif passe 3.1 a montré que `PrintableDocumentCell` en chemin simple ne les extrait pas — s'assurer que le canonique n'a pas le même bug.

### 1c. sanitize() systématique

Confirmer que tout `dangerouslySetInnerHTML` passe par `sanitize()`. En remplaçant `SectionDocument` (qui ne sanitize pas) par le canonique (qui sanitize), on résout ce problème automatiquement.

---

## Étape 2 — Modifier le contrat de données

### Fichier : `lib/tache/contrats/donnees.ts`

Supprimer le type `DocumentReference` entièrement. Remplacer par un import de `RendererDocument` :

```typescript
// SUPPRIMER :
// export type DocumentReference = {
//   id: string;
//   kind: "textuel" | "iconographique";
//   titre: string;
//   contenu: string;
//   echelle?: number;
// };

// AJOUTER :
import type { RendererDocument } from "@/lib/types/document-renderer";

// Dans DonneesTache :
export type DonneesTache = {
  // ... tous les champs existants inchangés
  documents: RendererDocument[]; // ← seul changement
  // ...
};
```

Grep global `DocumentReference` → tout remplacer par `RendererDocument`.

---

## Étape 3 — Le mapper ne détruit plus rien

### Fichier : `lib/tache/contrats/etat-wizard-vers-tache.ts`

Réécrire `construireDocuments` (actuellement lignes ~186-197) :

```typescript
import type { RendererDocument } from "@/lib/types/document-renderer";

function construireDocuments(state: TacheFormState): RendererDocument[] {
  return state.bloc2.documentSlots.map(({ slotId }) => {
    const slot = getSlotData(state.bloc4.documents, slotId);

    // Le slot contient déjà un rendererDocument complet
    // construit par le wizard document. On le retourne tel quel.
    if (slot.rendererDocument) {
      return slot.rendererDocument;
    }

    // Fallback défensif — ne devrait plus arriver avec le wizard unifié.
    // Si ce chemin est emprunté, c'est un bug à investiguer.
    console.warn(`[construireDocuments] Slot ${slotId} sans rendererDocument — fallback`);
    return {
      id: slotId,
      structure: "simple" as const,
      elements: [
        {
          kind: slot.type,
          titre: slot.titre,
          contenu: slot.contenu,
          sourceCitation: slot.sourceCitation,
          imageUrl: slot.imageUrl,
          legende: slot.imageLegende,
          legendePosition: slot.imageLegendePosition,
          imagePixelWidth: slot.imagePixelWidth,
          imagePixelHeight: slot.imagePixelHeight,
        },
      ],
    };
  });
}
```

Le `console.warn` dans le fallback rend le cas visible au lieu de silencieux — si on tombe dedans, on sait qu'il y a un problème en amont.

---

## Étape 4 — SectionDocument délègue au canonique

### Fichier : `components/epreuve/impression/sections/document.tsx`

Réécrire entièrement :

```tsx
import { DocumentCardPrint } from "@/components/documents/DocumentCardPrint";
import type { RendererDocument } from "@/lib/types/document-renderer";

type ContenuDocument = {
  numeroGlobal: number;
  document: RendererDocument;
};

type SectionDocumentProps = {
  contenu: ContenuDocument;
};

export function SectionDocument({ contenu }: SectionDocumentProps) {
  return <DocumentCardPrint document={contenu.document} numero={contenu.numeroGlobal} />;
}
```

L'invariant #5 du print-engine est respecté : `ApercuImpression` appelle toujours `SectionDocument`. Mais maintenant `SectionDocument` délègue au renderer canonique.

---

## Étape 5 — Adapter les builders d'impression

### Fichier : `lib/impression/builders/blocs-document.ts`

`construireBlocDocument` reçoit maintenant un `RendererDocument` au lieu d'un `DocumentReference`. Adapter le type du paramètre et s'assurer que le `RendererDocument` complet est passé dans `bloc.content`.

### Fichier : `lib/epreuve/transformation/epreuve-vers-paginee.ts`

Vérifier que la transformation passe le `RendererDocument` complet (issu de `DonneesTache.documents`) aux builders de blocs. Le type a changé en amont (étape 2), donc les changements ici devraient être principalement des ajustements de types.

---

## Étape 6 — Remplacer les renderers parallèles dans les consommateurs

### 6a. Vue détaillée tâche

Fichier : `components/tache/vue-detaillee/sections/documents.tsx`

Remplacer `DocCard` par `DocumentCard` (ou `DocumentCardReader`). Le document est déjà disponible comme `RendererDocument` via les données de la tâche.

### 6b. Sommaire wizard tâche

Fichier : `components/tache/fiche/SectionDocuments.tsx`

Remplacer `DocumentCardCompact` par `DocumentCard`. Le mode sommaire est géré par `FicheRenderer` qui propage `mode="sommaire"`.

### 6c. Wizard preview (PrintableDocumentCell)

Fichier : `components/tache/wizard/preview/PrintableFichePreview.tsx`

Remplacer UNIQUEMENT la partie `PrintableDocumentCell` (lignes ~72-202) par un appel à `DocumentCardPrint`. **NE PAS supprimer le fichier entier** — il contient aussi le rendu du quadruplet.

```tsx
// Remplacer PrintableDocumentCell par :
<DocumentCardPrint document={doc.rendererDocument} numero={index} />
```

---

## Étape 7 — Consolider les routes d'impression

### Supprimer le pipeline d'impression legacy des évaluations

La route `/evaluations/[id]/print` est un pipeline parallèle qui contourne `/apercu/[token]`. Maintenant que le bug PDF est résolu (le pipeline canonique utilise le renderer canonique), cette route n'a plus de raison d'exister.

**Fichiers à supprimer :**

| Fichier                                               | Raison                                               |
| ----------------------------------------------------- | ---------------------------------------------------- |
| `components/evaluations/EvaluationPrintableBody.tsx`  | Pipeline parallèle — remplacé par `ApercuImpression` |
| `components/evaluations/EvaluationFichePrintView.tsx` | Composant de la route legacy                         |

**Route à rediriger :**

`app/(print)/evaluations/[id]/print/page.tsx` — soit supprimer la route, soit la rediriger vers `/apercu/[token]` avec génération automatique du token pour l'épreuve concernée.

**Résultat :** `/apercu/[token]` devient le SEUL point d'entrée pour imprimer une tâche ou une épreuve. Conformément à l'invariant #5 du print-engine v2.1.

---

## Étape 8 — Supprimer les renderers morts

| Fichier                                          | Raison de suppression                                                                                           |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `lib/fiche/primitives/DocCard.tsx`               | Remplacé par `DocumentCard` en étape 6a                                                                         |
| `components/tache/fiche/DocumentCardCompact.tsx` | Remplacé par `DocumentCard` en étape 6b                                                                         |
| `components/documents/DocumentFicheRead.tsx`     | Code mort (aucun import, confirmé passe 3, aucune gem à récupérer — décisions produit ont éliminé les cas edge) |

### DocumentCardThumbnail — NE PAS SUPPRIMER

`DocumentCardThumbnail` reste comme **exception documentée de rendu de liste**. Il a des capacités spécifiques aux miniatures (badge structure avec elementCount, badge sourceType, icône catégorie) qui sont des métadonnées de liste, pas du rendu de contenu intrinsèque. Ce n'est pas une violation de INV-R1 — c'est un composant d'un rôle différent (pointer vers un document, pas le rendre).

---

## Étape 9 — Vérification

### 9a. TypeScript

```bash
npx tsc --noEmit
```

### 9b. Greps de sécurité

```bash
grep -r "DocumentReference" lib/ components/ app/ --include="*.ts" --include="*.tsx"
grep -r "DocCard" lib/ components/ --include="*.ts" --include="*.tsx"
grep -r "DocumentCardCompact" components/ --include="*.ts" --include="*.tsx"
grep -r "PrintableDocumentCell" components/ --include="*.ts" --include="*.tsx"
grep -r "EvaluationPrintableBody" components/ --include="*.ts" --include="*.tsx"
grep -r "echelle" lib/ components/ --include="*.ts" --include="*.tsx"
```

Tous doivent retourner 0 résultats (hors commentaires et ce plan).

### 9c. Test unitaire

Ajouter un test pour `construireDocuments` : passer un slot avec `rendererDocument` complet, vérifier que le `RendererDocument` retourné est identique (deep equality). Passer un slot SANS `rendererDocument`, vérifier que le fallback produit un objet valide et que le `console.warn` est émis.

### 9d. Tests manuels

1. Créer un document simple (textuel, avec source, légende positionnée) → vue détaillée OK
2. Créer un document iconographique avec légende overlay → overlay correct
3. Créer un document perspectives (multi-éléments, avec auteurs) → colonnes correctes
4. Créer une tâche avec ces documents → wizard preview affiche correctement
5. Exporter en PDF via `/apercu/[token]` → **le PDF doit être identique au wizard preview**
6. Ouvrir la vue détaillée de la tâche → documents identiques
7. Vérifier le sommaire wizard → documents en compact
8. Vérifier la banque documents → thumbnails corrects
9. Vérifier qu'aucune route `/evaluations/[id]/print` ne fonctionne (supprimée ou redirigée)

### 9e. Test Playwright

Les baselines visuelles devront être regénérées — le rendu PDF change (il inclut maintenant source, légende, footnotes, structures multi-éléments).

---

## Récapitulatif des fichiers touchés

### Modifiés (7 fichiers)

1. `components/documents/DocumentElementRenderer.tsx` — enrichissement (imagePixel, footnotes)
2. `lib/types/document-renderer.ts` — ajout `imagePixelWidth/Height` sur `DocumentElement` si absent
3. `lib/tache/contrats/donnees.ts` — `DocumentReference` → `RendererDocument`
4. `lib/tache/contrats/etat-wizard-vers-tache.ts` — `construireDocuments` ne détruit plus
5. `components/epreuve/impression/sections/document.tsx` — délégation au canonique
6. `lib/impression/builders/blocs-document.ts` — type adapté
7. `components/tache/wizard/preview/PrintableFichePreview.tsx` — `PrintableDocumentCell` → `DocumentCardPrint`

### Remplacements dans consommateurs (2 fichiers)

8. `components/tache/vue-detaillee/sections/documents.tsx` — `DocCard` → `DocumentCard`
9. `components/tache/fiche/SectionDocuments.tsx` — `DocumentCardCompact` → `DocumentCard`

### Supprimés (5 fichiers)

10. `lib/fiche/primitives/DocCard.tsx`
11. `components/tache/fiche/DocumentCardCompact.tsx`
12. `components/documents/DocumentFicheRead.tsx`
13. `components/evaluations/EvaluationPrintableBody.tsx`
14. `components/evaluations/EvaluationFichePrintView.tsx`

### Route supprimée ou redirigée (1 fichier)

15. `app/(print)/evaluations/[id]/print/page.tsx` — supprimer ou rediriger vers `/apercu/[token]`

### Conservé tel quel (exception documentée)

- `components/documents/DocumentCardThumbnail.tsx`

---

## Invariants respectés après exécution

| Invariant                            | Statut |
| ------------------------------------ | ------ |
| INV-R1 (renderer canonique unique)   | ✅     |
| INV-R2 (conteneurs délèguent)        | ✅     |
| INV-R3 (mode propagé)                | ✅     |
| INV-R4 (parité wizard/vue détaillée) | ✅     |
| INV-R5 (parité wizard/PDF)           | ✅     |
| INV-R6 (variantes = composition)     | ✅     |
| Print-engine invariant #5            | ✅     |

---

## Ce plan NE fait PAS

- Aucun nouveau type créé
- Aucun nouveau composant créé
- Aucune librairie ajoutée
- Aucune modification de `ApercuImpression` lui-même
- Aucune modification de la route `/apercu/[token]`
- Aucune modification du pipeline de pagination
- Aucune modification des constantes de dimension, du token HMAC, du carrousel PNG
- Aucun feature flag (alpha wipeable, pas nécessaire)

## Points refusés après review (documentés pour traçabilité)

- Feature flag → refusé (alpha sans utilisateurs)
- PR par étape → refusé (étapes non déployables séparément)
- Audit XSS de sanitize() → refusé comme bloquant (à faire séparément)
- Nouveau type Document intermédiaire → refusé (RendererDocument existe)
- Builder séparé pour le fallback → refusé (sur-architecture)
- Test de performance → refusé comme bloquant (prématuré)
- Fallback figcaption → refusé (décision produit : légende obligatoire avec position dans le wizard)

---

_Plan v2 — consolidé après review 6 agents + décisions produit._
_Prêt pour review finale par Claude Code avant exécution._
