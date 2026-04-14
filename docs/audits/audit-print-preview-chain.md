# Audit — Chaîne Wizard → Preview → PDF → Print

> Extraction brute du code réel — 14 avril 2026.

---

## Élément 1 — `PrintableFichePreview.tsx` complet + signatures sous-composants

**Fichier :** `components/tae/TaeForm/preview/PrintableFichePreview.tsx` — ~415 lignes, `"use client"`

### Exports du fichier

| Export                      | Type      | Props / Signature                                                                            |
| --------------------------- | --------- | -------------------------------------------------------------------------------------------- |
| `PrintableHtml`             | Composant | `{ html: string; className?: string; documentSlotCount?: number }`                           |
| `PrintableDocumentCell`     | Composant | `{ doc: DocumentFiche; documentHeaderLabel?: string }`                                       |
| `PrintableGrilleSection`    | Composant | `{ outilEvaluation: string \| null; grille: GrilleEntry \| null; grillesLoaded: boolean }`   |
| `PrintableFicheFromTaeData` | Composant | `{ tae: TaeFicheData; className?: string; feuillet?: TaePrintFeuilletId }`                   |
| `PrintableFichePreview`     | Composant | `{ previewMeta: WizardFichePreviewMeta; className?: string; feuillet?: TaePrintFeuilletId }` |

### Fonctions internes (non exportées)

| Fonction                             | Props                   |
| ------------------------------------ | ----------------------- |
| `PrintableSourceLine`                | `{ source: string }`    |
| `PrintableFicheDocumentsSection`     | `{ tae: TaeFicheData }` |
| `PrintableFicheQuestionnaireSection` | `{ tae: TaeFicheData }` |

### Sous-composants importés

| Composant                                      | Fichier                                                                           | Props                                                                                                           |
| ---------------------------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `OrdreChronologiquePrintableQuestionnaireCore` | `components/tae/TaeForm/preview/OrdreChronologiquePrintableQuestionnaireCore.tsx` | `{ consigneHtml: string; guidageHtml: string; documentSlotCount: number; showGuidageOnStudentSheet?: boolean }` |
| `LigneDuTempsPrintableQuestionnaireCore`       | `components/tae/TaeForm/preview/LigneDuTempsPrintableQuestionnaireCore.tsx`       | Mêmes props que ci-dessus                                                                                       |
| `AvantApresPrintableQuestionnaireCore`         | `components/tae/TaeForm/preview/AvantApresPrintableQuestionnaireCore.tsx`         | Mêmes props que ci-dessus                                                                                       |
| `TaePrintFeuilletToggle`                       | `components/tae/TaeForm/preview/TaePrintFeuilletToggle.tsx`                       | `{ active: TaePrintFeuilletId; onChange: (id) => void; className?: string }`                                    |
| `GrilleEvalTable`                              | `components/tae/grilles/GrilleEvalTable`                                          | `{ entry: GrilleEntry \| null; outilEvaluationId: string; viewport: "compact" }`                                |
| `DocumentElementRenderer`                      | `components/documents/DocumentElementRenderer`                                    | `{ element; showAuteur; showRepereTemporel; hideSource }`                                                       |
| `DocumentImageLegendOverlay`                   | `components/documents/DocumentImageLegendOverlay`                                 | `{ text: string; position: string }`                                                                            |

### Arbre de composition

```
PrintableFichePreview  ──useTaeForm()──▶  formStateToTae(state, oiList, previewMeta)  ──▶  TaeFicheData
                                                                                             │
PrintableFicheFromTaeData  ◀──────────────────────────────── tae: TaeFicheData ──────────────┘
  ├── TaePrintFeuilletToggle (masqué si feuillet contrôlé)
  ├── PrintableFicheDocumentsSection (feuillet "dossier")
  │     └── PrintableDocumentCell × N
  │           ├── DocumentElementRenderer (multi-éléments : perspectives, deux_temps)
  │           ├── <img> (iconographique)
  │           ├── DocumentImageLegendOverlay (légende positionnée)
  │           └── PrintableSourceLine
  └── PrintableFicheQuestionnaireSection (feuillet "questionnaire")
        ├── OrdreChronologiquePrintableQuestionnaireCore  ─OU─
        │   LigneDuTempsPrintableQuestionnaireCore        ─OU─
        │   AvantApresPrintableQuestionnaireCore           ─OU─
        │   PrintableHtml (rédactionnel classique)
        ├── PrintableHtml (guidage, si showGuidageOnStudentSheet)
        ├── answerLines × nb_lignes (si showStudentAnswerLines)
        └── PrintableGrilleSection
              └── GrilleEvalTable
```

Les 3 `*PrintableQuestionnaireCore` ont un pattern identique : parser l'ancre dans `consigneHtml` → séparer `beforeGuidage` / `afterGuidage` → insérer le guidage entre les deux.

---

## Élément 2 — HTML concret produit par les builders

### Payload réaliste

Extrait de `lib/fragment-playground/mocks.ts` :

```ts
const ordrePayload: OrdreChronologiquePayload = {
  consigneTheme: "Événements liés à la période révolutionnaire",
  optionA: [1, 2, 3, 4],
  optionB: [2, 1, 4, 3],
  optionC: [3, 4, 1, 2],
  optionD: [4, 3, 2, 1],
  correctLetter: "A",
  optionsJustification:
    "La séquence A respecte l'ordre chronologique croissant des dates portées par les documents.",
  manualTieBreakSequence: null,
};
```

### `buildOrdreChronologiqueConsigneHtml(ordrePayload)` → `tae.consigne`

```html
<div data-ordre-chrono-student="true" class="ordre-chrono-student-root">
  <p class="ordre-chrono-student-intro">
    Les documents {{doc_A}}, {{doc_B}}, {{doc_C}} et {{doc_D}} portent sur Événements liés à la
    période révolutionnaire. Ils sont présentés en désordre.
  </p>
  <!--eduqcia:ordre-chrono-student-sheet-guidage-anchor-->
  <div class="ordre-chrono-student-grid" role="group" aria-label="Options de réponse">
    <div class="ordre-chrono-student-option">
      <span class="ordre-chrono-student-letter-label"><strong>A)</strong></span>
      <span class="ordre-chrono-student-seq">
        <span class="ordre-chrono-student-digit">1</span>
        <span class="ordre-chrono-student-sep">–</span>
        <span class="ordre-chrono-student-digit">2</span>
        <span class="ordre-chrono-student-sep">–</span>
        <span class="ordre-chrono-student-digit">3</span>
        <span class="ordre-chrono-student-sep">–</span>
        <span class="ordre-chrono-student-digit">4</span>
      </span>
    </div>
    <div class="ordre-chrono-student-option">
      <span class="ordre-chrono-student-letter-label"><strong>B)</strong></span>
      <span class="ordre-chrono-student-seq">
        <!-- idem : 2–1–4–3 -->
      </span>
    </div>
    <div class="ordre-chrono-student-option">
      <span class="ordre-chrono-student-letter-label"><strong>C)</strong></span>
      <span class="ordre-chrono-student-seq">
        <!-- idem : 3–4–1–2 -->
      </span>
    </div>
    <div class="ordre-chrono-student-option">
      <span class="ordre-chrono-student-letter-label"><strong>D)</strong></span>
      <span class="ordre-chrono-student-seq">
        <!-- idem : 4–3–2–1 -->
      </span>
    </div>
  </div>
  <div class="ordre-chrono-student-reponse">
    <span class="ordre-chrono-student-reponse-label">Réponse :</span>
    <span class="ordre-chrono-student-reponse-box" aria-hidden="true"></span>
  </div>
</div>
```

**Structure** : racine `data-ordre-chrono-student`, classes CSS sémantiques (`-intro`, `-grid`, `-option`, `-letter-label`, `-seq`, `-digit`, `-sep`, `-reponse`, `-reponse-label`, `-reponse-box`), ancre HTML commentaire entre intro et grille. Les `{{doc_*}}` sont réécrits à l'impression épreuve par `resolveConsigneHtmlForDisplay`.

### `buildOrdreChronologiqueGuidageHtml()` → `tae.guidage`

```html
<p>Inscris la lettre de la séquence qui replace ces documents dans l'ordre chronologique.</p>
```

Texte fixe provenant de `NR_ORDRE_STUDENT_GUIDAGE` dans `lib/ui/ui-copy.ts`.

### `buildOrdreChronologiqueCorrigeHtml(ordrePayload)` → `tae.corrige`

```html
<p>Réponse attendue : A.</p>
<p class="ordre-chrono-corrige-justification">
  La séquence A respecte l&#39;ordre chronologique croissant des dates portées par les documents.
</p>
```

---

## Élément 3 — Types TypeScript

### `NonRedactionData` — `lib/tae/tae-form-state-types.ts`

```ts
export type NonRedactionData =
  | { type: "placeholder" }
  | { type: "ordre-chronologique"; payload: OrdreChronologiquePayload }
  | { type: "ligne-du-temps"; payload: LigneDuTempsPayload }
  | { type: "avant-apres"; payload: AvantApresPayload };
```

### `OrdreChronologiquePayload` — `lib/tae/non-redaction/ordre-chronologique-payload.ts`

```ts
export type OrdreChronologiquePayload = {
  consigneTheme: string;
  optionA: OrdreOptionRow; // [number|null, number|null, number|null, number|null]
  optionB: OrdreOptionRow;
  optionC: OrdreOptionRow;
  optionD: OrdreOptionRow;
  correctLetter: "" | "A" | "B" | "C" | "D";
  optionsJustification: string;
  manualTieBreakSequence: OrdrePermutation | null; // [1|2|3|4, …] tuple strict
};
```

### `LigneDuTempsPayload` — `lib/tae/non-redaction/ligne-du-temps-payload.ts`

```ts
export type LigneDuTempsPayload = {
  variant?: "ligne-du-temps-v1";
  segmentCount: LigneDuTempsSegmentCount; // 2 | 3 | 4
  boundaries: (number | null)[]; // longueur segmentCount + 1
  correctLetter: "" | "A" | "B" | "C" | "D";
};
```

### `AvantApresPayload` — `lib/tae/non-redaction/avant-apres-payload.ts`

```ts
export type AvantApresPayload = {
  schemaVersion: 1;
  theme: string;
  repere: string;
  anneeRepere: number;
  anneeRepereFin?: number;
  overrides: Partial<Record<DocumentSlotId, "avant" | "apres">>;
  optionRows: AvantApresOptionRow[];
  correctLetter: AvantApresOptionLetter; // "A"|"B"|"C"
  justification: string;
  generated: boolean;
};
```

---

## Élément 4 — Branchement dans l'app

### 1. Wizard (création / édition)

`components/tae/TaeForm/index.tsx` importe `PrintableFichePreview` et le passe à `PreviewPanel` dans la colonne droite du split wizard. `PrintableFichePreview` appelle `useTaeForm()` → `formStateToTae(state, oiList, previewMeta)` → `TaeFicheData` → délègue à `PrintableFicheFromTaeData`. L'onglet « Imprimé » du `PreviewPanel` passe un prop `feuillet` contrôlé. La modale plein écran passe par `PrintPreviewModal` qui wrap aussi `PrintableFichePreview`.

### 2. Route impression publiée

`/questions/[id]/print` → `TaeFichePrintView` → appelle directement `PrintableFicheFromTaeData` avec un `TaeFicheData` chargé côté serveur (pas de `formStateToTae`).

### 3. Épreuves

`EvaluationPrintableBody` importe `PrintableDocumentCell`, `PrintableHtml`, `PrintableGrilleSection` (exports nommés du même fichier) et les compose avec ses propres documents numérotés globalement.

### 4. Playground (dev)

`PlaygroundPrintRenderer` et `PlaygroundContextCanvas` importent `PrintableFicheFromTaeData` avec des mocks `TaeFicheData` générés via les mêmes builders (`buildOrdreChronologiqueConsigneHtml`, etc.).

### 5. Note `formStateToTae()`

Marqué `@deprecated` — dernier consommateur : `PrintableFichePreview`. Tous les flux lecture / print utilisent `TaeFicheData` directement.

### Résumé des points d'entrée

| Contexte                                | Composant utilisé                                                    | Source de `TaeFicheData`                 |
| --------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------- |
| Wizard aperçu (colonne droite + modale) | `PrintableFichePreview`                                              | `formStateToTae()` (deprecated)          |
| Route `/questions/[id]/print`           | `PrintableFicheFromTaeData` via `TaeFichePrintView`                  | Server query                             |
| Épreuves impression                     | `PrintableDocumentCell` / `PrintableHtml` / `PrintableGrilleSection` | `EvaluationPrintableBody`                |
| Playground dev                          | `PrintableFicheFromTaeData`                                          | Mocks `lib/fragment-playground/mocks.ts` |
