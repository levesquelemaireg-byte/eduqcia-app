# PASSE 3 — Audit des invariants de rendu (INV-R1 → INV-R6)

**Date :** 2026-04-16
**Portée :** `docs/DOMAIN_MODEL.md` §8.2 — invariants de rendu
**Méthode :** traçage statique des pipelines de rendu documentaire (wizard preview, aperçu imprimé PDF, vue détaillée, thumbnail), sans exécution ni refactor proposé.
**Livrables précédents :** [phase1-structure-entites.md](phase1-structure-entites.md), [phase2-invariants-structure.md](phase2-invariants-structure.md).

> Note : aucune modification de code n'est proposée ici. Le rapport documente l'écart entre les invariants déclarés et l'état observé, au niveau statique, à la date indiquée.

---

## 0. Résumé exécutif

| Invariant                                                                                       | Verdict | Résumé                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ----------------------------------------------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **INV-R1** — Rendu d'un document passe par un seul composant canonique                          | ❌      | Au moins **6 renderers** distincts rendent du contenu documentaire. Le renderer canonique (`DocumentCard` + variants + `DocumentElementRenderer`) coexiste avec 4 chemins parallèles.                                                                                                                                                                                                                                                                     |
| **INV-R2** — Les conteneurs délèguent, ne re-rendent pas                                        | ⚠️      | Délégation correcte pour `DocumentCardReader`, `DocumentPrintView`, `DocumentWizardPrintPreview`, `SectionDocContent`, `DOC_FICHE_SECTIONS`. Délégation rompue pour `SectionDocument` (aperçu imprimé épreuve/tâche), `DocCard` (vue détaillée tâche), `DocumentCardCompact` (sommaire wizard tâche), `PrintableDocumentCell` pour structure `simple`, et `DocumentFicheRead` (mort).                                                                     |
| **INV-R3** — Le mode de rendu est propagé sans être re-deviné                                   | ⚠️      | `FicheMode` couvre **3 modes** (`thumbnail`, `sommaire`, `lecture`) via `FicheRenderer`. L'aperçu imprimé **n'est pas** un `FicheMode` : c'est un pipeline parallèle (`ApercuImpression`, `RenduImprimable`, `ContexteImpression`). Les renderers hors `FicheRenderer` (`DocumentCardThumbnail`, `DocumentCardPrint`, `PrintableDocumentCell`, `SectionDocument`) n'acceptent pas de prop `mode` unifiée.                                                 |
| **INV-R4** — Wizard preview et vue détaillée donnent le même rendu documentaire                 | ❌      | Le wizard (`PrintableDocumentCell`) et la vue détaillée (`DocCard` via `components/tache/vue-detaillee/sections/documents.tsx`) utilisent des composants **différents**, avec des contrats de données **différents** (`DocumentFiche` vs `TacheFicheData.documents[]` construit par `selectDocuments`). Aucune garantie de parité visuelle hors inspection manuelle.                                                                                      |
| **INV-R5** — Wizard preview et export PDF donnent le même rendu                                 | ❌      | **Le bug PDF**. Wizard : `PrintableDocumentCell(doc: DocumentFiche)` — type riche avec `source_citation`, `image_legende`, `imagePixelWidth`, `rendererDocument.elements[]`. PDF (`ApercuImpression` → `SectionDocument`) : reçoit `DocumentReference` — type minimal (`id`, `kind`, `titre`, `contenu`, `echelle`). Le mapper `construireDocuments` détruit les champs riches en amont.                                                                  |
| **INV-R6** — Les variantes (`ModeImpression`, `estCorrige`) n'altèrent pas le rendu intrinsèque | ⚠️      | Au niveau de la pagination (`epreuve-vers-paginee`, `tache-vers-imprimable`, `document-vers-imprimable`), les variantes n'influencent que la **composition** (titre visible, présence du corrigé, dossier documentaire pré/post). Le rendu du document lui-même est stable **dans chaque pipeline** mais **pas entre** pipelines (voir INV-R5). Verdict ⚠️ et pas ✅ car la fragmentation des renderers empêche de vérifier l'invariant au niveau global. |

**Criticité opérationnelle :** INV-R5 explique directement le bug « le PDF ne ressemble pas à l'aperçu du wizard ». INV-R1 et INV-R2 en sont la cause racine architecturale.

---

## 1. Cartographie des pipelines de rendu documentaire

Quatre pipelines rendent un document, avec des contrats de données distincts.

### 1.1 Pipeline « aperçu wizard TAÉ » (client, écran seulement)

```
components/tache/wizard/preview/PreviewPanel.tsx
  └─ PrintableFichePreview
       └─ PrintableDocumentCell(doc: DocumentFiche)
            ├─ si rendererDocument.elements.length > 1  → DocumentElementRenderer (×N)  ✅ délégation
            └─ sinon (structure simple)                 → rendu INLINE de <img>/<figure>/htmlFlow  ❌ violation INV-R1
```

- **Renderer principal :** [components/tache/wizard/preview/PrintableFichePreview.tsx:72-202](../../components/tache/wizard/preview/PrintableFichePreview.tsx#L72-L202) (`PrintableDocumentCell`).
- **Type consommé :** `DocumentFiche` ([lib/types/fiche.ts](../../lib/types/fiche.ts)) — contrat riche : `source_citation`, `image_url`, `imagePixelWidth/Height`, `imageLegende`, `imageLegendePosition`, `rendererDocument` optionnel.
- **Délégation :** seulement pour multi-éléments ([PrintableFichePreview.tsx:115-120](../../components/tache/wizard/preview/PrintableFichePreview.tsx#L115-L120)). Sinon rendu direct `<img>` + `dangerouslySetInnerHTML` ([PrintableFichePreview.tsx:164-196](../../components/tache/wizard/preview/PrintableFichePreview.tsx#L164-L196)).

### 1.2 Pipeline « aperçu imprimé / export PDF » (route SSR `/apercu/[token]`)

```
app/(apercu)/apercu/[token]/page.tsx
  └─ construireRendu(data: DraftKvTyped)
       ├─ type "document"  → documentVersImprimable(DocumentReference)
       ├─ type "tache"     → tacheVersImprimable(DonneesTache, ContexteImpression)
       └─ type "epreuve"   → epreuveVersImprimable(DonneesEpreuve, ContexteImpression)
  └─ <ApercuImpression rendu={rendu} />
       └─ RenduBloc selon kind :
            ├─ kind="document"   → <SectionDocument contenu={bloc.content} />  ❌ rendu direct
            ├─ kind="quadruplet" → <SectionQuadruplet> ou <SectionCorrige>
            └─ kind="entete-section" → null
```

- **Dispatcher :** [components/epreuve/impression/index.tsx:44-64](../../components/epreuve/impression/index.tsx#L44-L64).
- **Renderer document :** [components/epreuve/impression/sections/document.tsx](../../components/epreuve/impression/sections/document.tsx) (`SectionDocument`).
- **Type consommé :** `DocumentReference` ([lib/tache/contrats/donnees.ts:19-25](../../lib/tache/contrats/donnees.ts#L19-L25)) — **contrat minimal** :
  ```ts
  export type DocumentReference = {
    id: string;
    kind: "textuel" | "iconographique";
    titre: string;
    contenu: string;
    echelle?: number;
  };
  ```
- **Pas de `source_citation`, pas de `image_legende`, pas de perspectives / deux_temps, pas de `FootnoteDefinitions`.**

### 1.3 Pipeline « aperçu imprimé évaluation » (route `/evaluations/[id]/print`)

```
app/(print)/evaluations/[id]/print/page.tsx
  └─ EvaluationFichePrintView
       └─ EvaluationPrintableBody(titre, fiches: TacheFicheData[])
            └─ PrintableEvaluationQuestionBlock
                 └─ PrintableDocumentCell(doc: DocumentFiche)  ⚠️ 3ᵉ pipeline parallèle
```

- Cette route **contourne** le pipeline `/apercu/[token]` et réutilise le composant du wizard. Elle **ne souffre pas** du bug INV-R5 pour les documents, mais **dédouble** la logique d'impression d'épreuve.
- Source : [components/evaluations/EvaluationPrintableBody.tsx:115](../../components/evaluations/EvaluationPrintableBody.tsx#L115), [components/evaluations/EvaluationFichePrintView.tsx:52](../../components/evaluations/EvaluationFichePrintView.tsx#L52).

### 1.4 Pipeline « vue détaillée tâche » (route `/questions/[id]`)

```
app/(app)/questions/[id]/page.tsx (ou équivalent tâche)
  └─ TacheVueDetaillee
       └─ SectionDocuments (components/tache/vue-detaillee/sections/documents.tsx)
            └─ DocCard(document, mode="lecture")  ❌ rendu direct, pas de délégation à DocumentCard
```

- Source : [components/tache/vue-detaillee/sections/documents.tsx](../../components/tache/vue-detaillee/sections/documents.tsx) importe `DocCard` depuis `lib/fiche/primitives/DocCard`.
- `DocCard` ([lib/fiche/primitives/DocCard.tsx](../../lib/fiche/primitives/DocCard.tsx)) **re-render** le contenu du document (titre, contenu HTML/image, légende, source) directement sans déléguer à `DocumentCard` ou `DocumentElementRenderer`. **Violation INV-R1.**

### 1.5 Pipeline « vue détaillée document » (route `/documents/[id]`)

```
app/(app)/documents/[id]/page.tsx
  └─ DocumentFicheLecture
       └─ FicheRenderer(sections=DOC_FICHE_SECTIONS, mode="lecture")
            └─ SectionDocContent(data)
                 └─ DocumentCard(document)  ✅ délégation canonique
                      └─ SimpleLayout | ColumnsLayout
                           └─ DocumentElementRenderer
```

- Source : [components/documents/DocumentFicheLecture.tsx](../../components/documents/DocumentFicheLecture.tsx), [lib/fiche/configs/doc-fiche-sections.ts](../../lib/fiche/configs/doc-fiche-sections.ts), [lib/fiche/sections/SectionDocContent.tsx](../../lib/fiche/sections/SectionDocContent.tsx).
- **Seul pipeline pleinement conforme** à INV-R1/R2 de bout en bout.

### 1.6 Pipeline « thumbnail banque documents »

```
components/bank/BankDocumentsPanel.tsx
  └─ DocumentFicheThumbnail(data, href)
       └─ FicheRenderer(sections=DOC_FICHE_SECTIONS, mode="thumbnail")
            └─ sections filtrées à SectionDocContent
                 └─ DocumentCard (via SectionDocContent → DocumentCard)
```

- Via [components/documents/DocumentFicheThumbnail.tsx](../../components/documents/DocumentFicheThumbnail.tsx) — **conforme**.
- À comparer avec **`DocumentCardThumbnail`** ([components/documents/DocumentCardThumbnail.tsx](../../components/documents/DocumentCardThumbnail.tsx)), variante « thumbnail dans un contexte différent » (liste banque tâches, slots) : ce composant **rend sa propre preview** (image ou texte tronqué) et **ne délègue pas** à `DocumentElementRenderer`. Il est nommé variant canonique par `DOMAIN_MODEL.md §4.2`, mais sa stratégie interne n'est pas une délégation — c'est un rendu sur mesure « thumbnail » (acceptable si l'intention est : le thumbnail est un aperçu et non le document entier).

### 1.7 Pipeline « sommaire wizard TAÉ » (colonne droite)

```
components/tache/wizard/sommaire/...
  └─ PlaygroundFicheRenderer (ou équivalent)
       └─ SectionDocuments (components/tache/fiche/SectionDocuments.tsx)
            └─ DocumentCardCompact(document)  ❌ rendu direct
```

- Source : [components/tache/fiche/DocumentCardCompact.tsx](../../components/tache/fiche/DocumentCardCompact.tsx).
- `DocumentCardCompact` rend le contenu du document directement (image/HTML) sans déléguer. **Violation INV-R1.**

---

## 2. Audit par invariant

### 2.1 INV-R1 — Rendu d'un document passe par un seul composant canonique

**Énoncé (`DOMAIN_MODEL.md §8.2`) :** `DocumentCard` (+ variants `DocumentCardPrint/Sommaire/Reader/Thumbnail`) et `DocumentElementRenderer` sont les seuls composants autorisés à rendre le contenu intrinsèque d'un document (titre, contenu texte/image, source, légende).

**Verdict : ❌**

#### 2.1.1 Renderers canoniques (conformes)

| Composant                 | Fichier                                                                                                    | Rôle                                                                                                       |
| ------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `DocumentCard`            | [components/documents/DocumentCard.tsx](../../components/documents/DocumentCard.tsx)                       | Dispatch vers layout selon structure (`simple`, `perspectives`, `deux_temps`)                              |
| `DocumentElementRenderer` | [components/documents/DocumentElementRenderer.tsx](../../components/documents/DocumentElementRenderer.tsx) | Rendu atomique d'un `DocumentElement` (textuel/iconographique + footnotes)                                 |
| `DocumentCardPrint`       | [components/documents/DocumentCardPrint.tsx](../../components/documents/DocumentCardPrint.tsx)             | Variant print — délègue à `DocumentElementRenderer` (ligne 141 `hideSource`), sort la source hors du cadre |
| `DocumentCardReader`      | [components/documents/DocumentCardReader.tsx:141](../../components/documents/DocumentCardReader.tsx#L141)  | Wrapper lecture — délègue à `DocumentCard`                                                                 |

#### 2.1.2 Renderers parallèles identifiés (violations)

| #   | Composant                                 | Fichier                                                                                                                                        | Pipeline                                          | Ce qu'il rend directement                              |
| --- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------ |
| V1  | `SectionDocument`                         | [components/epreuve/impression/sections/document.tsx](../../components/epreuve/impression/sections/document.tsx)                               | `/apercu/[token]` (tâche + épreuve)               | `<img>` direct, `dangerouslySetInnerHTML` pour textuel |
| V2  | `DocCard`                                 | [lib/fiche/primitives/DocCard.tsx](../../lib/fiche/primitives/DocCard.tsx)                                                                     | Vue détaillée tâche, `SectionDocuments` générique | Titre, HTML, image, légende, source, tout mode         |
| V3  | `DocumentCardCompact`                     | [components/tache/fiche/DocumentCardCompact.tsx](../../components/tache/fiche/DocumentCardCompact.tsx)                                         | Sommaire wizard tâche                             | Image, texte tronqué, source                           |
| V4  | `PrintableDocumentCell` (chemin `simple`) | [components/tache/wizard/preview/PrintableFichePreview.tsx:144-201](../../components/tache/wizard/preview/PrintableFichePreview.tsx#L144-L201) | Aperçu wizard, impression évaluation              | `<img>`, `htmlFlow`, légende via overlay, source       |
| V5  | `DocumentFicheRead`                       | [components/documents/DocumentFicheRead.tsx](../../components/documents/DocumentFicheRead.tsx)                                                 | (code mort — aucun import trouvé)                 | Document complet                                       |
| V6  | `DocumentCardThumbnail`                   | [components/documents/DocumentCardThumbnail.tsx](../../components/documents/DocumentCardThumbnail.tsx)                                         | Listes (banque tâches, slots)                     | Preview image ou texte tronqué sur mesure              |

- V6 est nommé « variant canonique » dans §4.2 du DOMAIN_MODEL, mais sa stratégie interne n'est pas une délégation. Classer officiellement sa position (variant autonome vs violation) est une **question ouverte** (§5).
- V4 est partiellement conforme : le chemin multi-éléments délègue à `DocumentElementRenderer`, le chemin `simple` ne délègue pas.

#### 2.1.3 Autres zones avec rendu direct de champs du document

Les fichiers suivants manipulent `source_citation` ou `image_legende` sans passer par le renderer canonique (rendu en contexte formulaire, souvent légitime, mais à surveiller) :

- [components/tache/wizard/bloc4/DocumentSlotReuseBlock.tsx](../../components/tache/wizard/bloc4/DocumentSlotReuseBlock.tsx) — affichage informationnel d'un slot réutilisé depuis la banque.
- [components/tache/wizard/bloc4/DocumentSlotCreateForm.tsx](../../components/tache/wizard/bloc4/DocumentSlotCreateForm.tsx), [components/tache/wizard/bloc4/DocumentSlotPanel.tsx](../../components/tache/wizard/bloc4/DocumentSlotPanel.tsx), [components/tache/wizard/bloc4/DocumentSlotLegendBlock.tsx](../../components/tache/wizard/bloc4/DocumentSlotLegendBlock.tsx), [components/tache/wizard/bloc4/BanqueDocumentsStub.tsx](../../components/tache/wizard/bloc4/BanqueDocumentsStub.tsx) — création/édition de slot.
- [components/documents/wizard/steps/StepDocument.tsx](../../components/documents/wizard/steps/StepDocument.tsx), [components/documents/wizard/steps/DocumentElementFields.tsx](../../components/documents/wizard/steps/DocumentElementFields.tsx), [components/documents/wizard/AutonomousDocumentWizard.tsx](../../components/documents/wizard/AutonomousDocumentWizard.tsx) — wizard document autonome.
- [components/playground/DevBankSummaryMockupCard.tsx](../../components/playground/DevBankSummaryMockupCard.tsx) — maquette playground dev.
- [app/(app)/documents/page.tsx](<../../app/(app)/documents/page.tsx>) — liste documents.
- [lib/fiche/sections/SectionDocIndexation.tsx:41-51](../../lib/fiche/sections/SectionDocIndexation.tsx#L41-L51) — panneau indexation (métadonnées) qui rend `sourceCitationHtml` via `dangerouslySetInnerHTML` ; légitime (ce n'est pas le corps du document, c'est le panneau de métadonnées), mais duplique la logique d'affichage source déjà présente dans `DocumentCardReader`.

**Conclusion INV-R1 :** ❌. Il existe **au moins 5 renderers parallèles actifs** (V1–V4, V6) qui rendent le contenu du document en dehors de la chaîne canonique, plus 1 renderer mort (V5). Le renderer canonique n'est effectivement utilisé qu'en vue détaillée document (`/documents/[id]`), en banque documents thumbnail, en wizard document (`DocumentWizardPrintPreview`), et en export print document standalone (`DocumentPrintView`).

---

### 2.2 INV-R2 — Les conteneurs délèguent, ne re-rendent pas

**Énoncé :** Un conteneur (variant, section, layout) doit déléguer le rendu du contenu au renderer canonique — il n'a pas le droit de ré-implémenter le rendu intrinsèque.

**Verdict : ⚠️**

#### 2.2.1 Délégations correctes

| Conteneur                              | Délègue à                                    | Fichier:ligne                                                                                      |
| -------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `DocumentCardReader`                   | `DocumentCard`                               | [DocumentCardReader.tsx:141](../../components/documents/DocumentCardReader.tsx#L141)               |
| `DocumentPrintView`                    | `DocumentCardPrint`                          | [DocumentPrintView.tsx](../../components/documents/DocumentPrintView.tsx)                          |
| `DocumentWizardPrintPreview`           | `DocumentCardPrint` (via `rendererDocument`) | [DocumentWizardPrintPreview.tsx](../../components/documents/wizard/DocumentWizardPrintPreview.tsx) |
| `SectionDocContent`                    | `DocumentCard`                               | [SectionDocContent.tsx](../../lib/fiche/sections/SectionDocContent.tsx)                            |
| `DOC_FICHE_SECTIONS` → `FicheRenderer` | `SectionDocContent` → `DocumentCard`         | [doc-fiche-sections.ts](../../lib/fiche/configs/doc-fiche-sections.ts)                             |
| `DocumentCardPrint`                    | `DocumentElementRenderer`                    | [DocumentCardPrint.tsx](../../components/documents/DocumentCardPrint.tsx)                          |
| `SimpleLayout` / `ColumnsLayout`       | `DocumentElementRenderer`                    | implicites via `DocumentCard`                                                                      |

#### 2.2.2 Délégations rompues

- **`SectionDocument`** ([components/epreuve/impression/sections/document.tsx](../../components/epreuve/impression/sections/document.tsx)) : conteneur section de page imprimée. Re-render `<img>` et HTML brut. Ne délègue ni à `DocumentCard`, ni à `DocumentCardPrint`, ni à `DocumentElementRenderer`.
- **`DocCard`** ([lib/fiche/primitives/DocCard.tsx](../../lib/fiche/primitives/DocCard.tsx)) : primitive « document card » pour vue détaillée. Réimplémente tout le rendu intrinsèque (titre, image, HTML, légende, source) dans tous les modes.
- **`DocumentCardCompact`** ([components/tache/fiche/DocumentCardCompact.tsx](../../components/tache/fiche/DocumentCardCompact.tsx)) : variant sommaire wizard tâche. Rend son propre preview.
- **`PrintableDocumentCell`** (chemin `simple`, [PrintableFichePreview.tsx:144-201](../../components/tache/wizard/preview/PrintableFichePreview.tsx#L144-L201)) : conteneur cellule imprimable. Délègue seulement pour multi-éléments.
- **`DocumentCardThumbnail`** ([components/documents/DocumentCardThumbnail.tsx](../../components/documents/DocumentCardThumbnail.tsx)) : re-render preview custom — voir §5 question ouverte sur son statut.

**Conclusion INV-R2 :** ⚠️. La moitié des conteneurs délèguent correctement ; l'autre moitié réimplémente. L'écart est concentré sur les pipelines d'impression (aperçu PDF), de vue détaillée tâche, et de sommaire wizard.

---

### 2.3 INV-R3 — Le mode de rendu est propagé sans être re-deviné

**Énoncé :** Le mode (sommaire, lecture, aperçu imprimé, thumbnail) est une entrée explicite du rendu, propagée du conteneur jusqu'au renderer. Pas de détection implicite (via contexte CSS, URL, etc.).

**Verdict : ⚠️**

#### 2.3.1 Modes tels qu'implémentés

Deux systèmes de modes coexistent sans pont explicite :

- **`FicheMode`** ([lib/fiche/types.ts:16](../../lib/fiche/types.ts#L16)) : `"thumbnail" | "sommaire" | "lecture"` — propagé via `FicheRenderer.mode` comme prop aux sections. **3 modes**, pas 4.
- **`ContexteImpression`** ([lib/impression/types.ts:17-20](../../lib/impression/types.ts#L17-L20)) : pipeline d'impression (`ApercuImpression`), discriminé par `type` (`"document" | "tache" | "epreuve"`) et porteur de `ModeImpression` (`"formatif" | "sommatif-standard" | "epreuve-ministerielle"`) + `estCorrige`.

**L'« aperçu imprimé » de `DOMAIN_MODEL.md §8.2 INV-R3 n°3 » n'est pas un `FicheMode` :** c'est un pipeline séparé qui produit un `RenduImprimable` et rend via `ApercuImpression`, sans passer par `FicheRenderer`.

#### 2.3.2 Propagation observée

| Pipeline                                         | Prop `mode` propagée ?                                                                                                   | Valeur                                        | Fichier:ligne                                                                                                           |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| FicheRenderer → SectionDocContent → DocumentCard | ✅ `FicheMode`                                                                                                           | `thumbnail \| sommaire \| lecture`            | [doc-fiche-sections.ts](../../lib/fiche/configs/doc-fiche-sections.ts)                                                  |
| DocCard                                          | ✅ propre prop `mode: FicheMode`                                                                                         | reçue du parent (vue détaillée = `"lecture"`) | [DocCard.tsx](../../lib/fiche/primitives/DocCard.tsx), [rail.tsx:57](../../components/tache/vue-detaillee/rail.tsx#L57) |
| `PrintableDocumentCell`                          | ❌ pas de prop `mode`                                                                                                    | —                                             | [PrintableFichePreview.tsx:72](../../components/tache/wizard/preview/PrintableFichePreview.tsx#L72)                     |
| `SectionDocument` (aperçu PDF)                   | ❌ pas de prop `mode`, pas de `ContexteImpression` propagé                                                               | —                                             | [document.tsx](../../components/epreuve/impression/sections/document.tsx)                                               |
| `DocumentCardPrint`                              | ❌ pas de prop `mode`                                                                                                    | —                                             | [DocumentCardPrint.tsx](../../components/documents/DocumentCardPrint.tsx)                                               |
| `DocumentCard` (canonique)                       | ❌ **pas de prop `mode`**                                                                                                | —                                             | [DocumentCard.tsx](../../components/documents/DocumentCard.tsx)                                                         |
| `DocumentElementRenderer`                        | ❌ pas de prop `mode` ; reçoit `showAuteur`, `showRepereTemporel`, `hideSource` — dérivés calculés à chaque site d'appel | —                                             | [DocumentElementRenderer.tsx](../../components/documents/DocumentElementRenderer.tsx)                                   |

- Le renderer canonique `DocumentCard` **ne reçoit pas** le mode — il rend la structure quel que soit le contexte, et laisse au conteneur le soin d'ajouter les bordures, le cadre, les métadonnées externes.
- Les flags `showAuteur` / `showRepereTemporel` / `hideSource` de `DocumentElementRenderer` sont **re-devinés** à chaque site d'appel (`rendererDocument.structure === "perspectives"`, etc.) au lieu d'être dérivés d'une structure unique. Voir [PrintableFichePreview.tsx:87-88](../../components/tache/wizard/preview/PrintableFichePreview.tsx#L87-L88) et [DocumentCardPrint.tsx](../../components/documents/DocumentCardPrint.tsx).

**Conclusion INV-R3 :** ⚠️. Propagation correcte sur le pipeline `FicheRenderer` (3 modes). Absente des pipelines d'impression. Le mode « aperçu imprimé » n'est pas un mode mais un **autre pipeline** — ce qui est une décision architecturale légitime, mais qui rend l'invariant inapplicable tel que formulé dans §8.2.

---

### 2.4 INV-R4 — Wizard preview et vue détaillée donnent le même rendu documentaire

**Énoncé :** Le document rendu dans l'aperçu wizard TAÉ (colonne preview + sommaire) et le document rendu en vue détaillée tâche (`/questions/[id]`) doivent être visuellement identiques pour les champs intrinsèques.

**Verdict : ❌**

#### 2.4.1 Composants utilisés

| Surface                               | Composant                                                               | Contrat                                                      |
| ------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------ |
| Aperçu wizard (feuillet élève)        | `PrintableDocumentCell`                                                 | `DocumentFiche`                                              |
| Sommaire wizard (colonne droite)      | `DocumentCardCompact`                                                   | dérivé de `TacheFicheData.documents[]` via selector          |
| Vue détaillée tâche `/questions/[id]` | `DocCard` (via `components/tache/vue-detaillee/sections/documents.tsx`) | dérivé de `TacheFicheData.documents[]` via `selectDocuments` |

**Trois composants différents, trois chemins de données différents.** L'invariant ne peut être respecté que par coïncidence visuelle.

#### 2.4.2 Divergences prévisibles

- **Légendes d'image** : `PrintableDocumentCell` applique `DocumentImageLegendOverlay` avec `imageLegendePosition` ([PrintableFichePreview.tsx:173-178](../../components/tache/wizard/preview/PrintableFichePreview.tsx#L173-L178)). `DocCard` et `DocumentCardCompact` ont leur propre logique d'affichage de légende — à vérifier manuellement.
- **Source_citation** : `PrintableDocumentCell` rend la source via `sourceCitationDisplayHtml` dans `PrintableSourceLine` ([PrintableFichePreview.tsx:199, 204-214](../../components/tache/wizard/preview/PrintableFichePreview.tsx#L199)). `DocCard` a sa propre logique. `DocumentCardCompact` également. Trois chemins HTML/sanitization distincts.
- **Footnotes** : seul `DocumentElementRenderer` extrait et rend les footnotes de manière structurée. Les trois composants parallèles ne les traitent pas de manière unifiée.
- **Structures `perspectives` / `deux_temps`** : `PrintableDocumentCell` les gère via délégation à `DocumentElementRenderer`. `DocCard` et `DocumentCardCompact` **n'ont pas** de chemin multi-éléments équivalent — à vérifier si ces structures sont correctement affichées en vue détaillée tâche.

**Conclusion INV-R4 :** ❌. L'invariant est formellement rompu : les renderers sont différents. Les écarts visuels dépendent du détail d'implémentation de chaque renderer parallèle.

---

### 2.5 INV-R5 — Wizard preview et export PDF donnent le même rendu

**Énoncé :** Le document rendu dans l'aperçu wizard TAÉ et le document rendu dans l'export PDF (route `/apercu/[token]`) doivent être visuellement identiques.

**Verdict : ❌** — **c'est le bug rapporté.**

Voir l'analyse dédiée §3.

---

### 2.6 INV-R6 — Les variantes (`ModeImpression`, `estCorrige`) n'altèrent pas le rendu intrinsèque

**Énoncé :** `ModeImpression` (`formatif` / `sommatif-standard` / `epreuve-ministerielle`) et `estCorrige` ne changent **pas** la manière dont un document individuel est rendu — ils influent seulement sur la composition (titre visible, présence du corrigé, dossier documentaire pré/post, mise en page de la page).

**Verdict : ⚠️**

#### 2.6.1 Ce que la couche pagination fait avec les variantes

- [lib/impression/builders/blocs-document.ts:27-35](../../lib/impression/builders/blocs-document.ts#L27-L35) — `construireBlocDocument` prend un flag `titreVisible`. Si `false`, le titre est remplacé par `""` (mode sommatif/ministériel). **C'est une altération du contenu du `DocumentReference`**, pas du rendu. Le bloc résultant a un titre vide, mais le renderer l'affiche tel quel.
- [lib/epreuve/transformation/epreuve-vers-paginee.ts](../../lib/epreuve/transformation/epreuve-vers-paginee.ts) — la composition (ordre, présence du corrigé, dossier documentaire avant/après) dépend de `ContexteImpression.mode` + `estCorrige`. Le rendu intrinsèque du document (une fois le bloc construit) n'est **pas** paramétré par le mode.
- [lib/tache/impression/tache-vers-imprimable.ts](../../lib/tache/impression/tache-vers-imprimable.ts) — idem.
- [lib/document/impression/document-vers-imprimable.ts](../../lib/document/impression/document-vers-imprimable.ts) — n'a pas de variante (`ContexteImpression.type === "document"`).

#### 2.6.2 Ce que le renderer fait avec les variantes

- `SectionDocument` ne reçoit **pas** `ContexteImpression` et n'a donc aucun moyen d'altérer le rendu selon le mode. **Cohérent avec INV-R6.**
- `DocumentCardPrint` ne reçoit pas de mode non plus.
- `DocumentElementRenderer` reçoit `showAuteur`, `showRepereTemporel`, `hideSource` — ce sont des paramètres de **structure** (perspectives/deux_temps) et de **composition parente**, pas des paramètres de variante d'impression.

**Ce qui altère donc le rendu final entre variantes est uniquement la composition** (ex. `titreVisible: false` → le titre devient `""`, le composant l'affiche vide) et la présence/absence du corrigé, du dossier, etc. — pas le renderer du document.

#### 2.6.3 Pourquoi ⚠️ et pas ✅

L'invariant est **respecté dans chaque pipeline isolément**, mais la fragmentation des renderers (INV-R1) empêche de vérifier globalement. Par exemple, si une modification future ajoutait un flag `mode === "epreuve-ministerielle"` à `SectionDocument` sans l'ajouter à `PrintableDocumentCell`, l'invariant global resterait cassé même si chaque pipeline reste « cohérent ».

**Conclusion INV-R6 :** ⚠️. La couche pagination respecte la séparation variante/rendu. Mais la vérification globale n'est pas structurellement garantie.

---

## 3. Le bug PDF — analyse

### 3.1 Symptôme

L'export PDF via `/apercu/[token]` (pipeline tâche ou épreuve) ne ressemble pas à l'aperçu wizard affiché dans la colonne preview de `TacheForm`. Champs manquants ou différemment formatés.

### 3.2 Pipelines comparés

**Wizard preview (écran, client) :**

```
FormState (reducer wizard)
  → etatWizardVersTache(formState)           lib/tache/contrats/etat-wizard-vers-tache.ts
    → construireDocuments(state)              ligne 186-197 — mapper vers DocumentReference[]
  (et en parallèle)
  → selectors → TacheFicheData                  lib/fiche/selectors/...
  → PrintableFichePreview
    → PrintableDocumentCell(doc: DocumentFiche)   <-- type riche ici
```

Note importante : le wizard preview consomme **DocumentFiche** (type riche) construit par les **selectors de fiche**, pas `DocumentReference`. Le mapper `etatWizardVersTache` sert à d'autres pipelines (persistance, impression).

**Aperçu PDF (SSR, `/apercu/[token]`) :**

```
FormState → etatWizardVersTache(formState) → DonneesTache/DonneesEpreuve
  → persist dans Vercel KV (draft:${id})     lib/epreuve/impression/token-draft.ts
  → /apercu/[token]/page.tsx
    → construireRendu(data)
      → tacheVersImprimable / epreuveVersImprimable
        → construireBlocDocument(DocumentReference)   lib/impression/builders/blocs-document.ts
    → ApercuImpression(rendu)
      → SectionDocument(contenu)                       <-- consomme DocumentReference
```

### 3.3 Contrat de données — la divergence

**`DocumentReference`** ([lib/tache/contrats/donnees.ts:19-25](../../lib/tache/contrats/donnees.ts#L19-L25)) :

```ts
export type DocumentReference = {
  id: string;
  kind: "textuel" | "iconographique";
  titre: string;
  contenu: string;
  echelle?: number;
};
```

**`DocumentFiche`** ([lib/types/fiche.ts](../../lib/types/fiche.ts)) contient (entre autres) :

- `source_citation: string`
- `imagePixelWidth?: number`, `imagePixelHeight?: number`
- `imageLegende?: string`, `imageLegendePosition?: ...`
- `image_url: string` (séparé de `contenu`)
- `rendererDocument?: RendererDocument` avec `elements: DocumentElement[]`, `structure: "simple" | "perspectives" | "deux_temps"`
- `letter`, `fullText`, etc.

### 3.4 Point exact de perte de données

[lib/tache/contrats/etat-wizard-vers-tache.ts:186-197](../../lib/tache/contrats/etat-wizard-vers-tache.ts#L186-L197) :

```ts
function construireDocuments(state: TacheFormState): DocumentReference[] {
  return state.bloc2.documentSlots.map(({ slotId }) => {
    const slot = getSlotData(state.bloc4.documents, slotId);
    return {
      id: slotId,
      kind: slot.type,
      titre: slot.titre,
      contenu: slot.contenu,
      ...(slot.type === "iconographique" ? { echelle: slot.printImpressionScale } : {}),
    };
  });
}
```

Tous les champs suivants sont **détruits** à ce point :

- `source_citation` → absent du payload KV, absent de la page `/apercu/[token]`.
- `image_legende`, `image_legende_position` → absents.
- `imagePixelWidth`, `imagePixelHeight` → absents (l'image peut s'afficher à des dimensions différentes).
- `structure`, `elements[]`, `source_type`, `categorie_textuelle`/`categorie_iconographique` → absents. Les documents multi-éléments (perspectives, deux_temps) ne peuvent **pas** être rendus correctement en PDF.
- `footnotes` structurées → absentes (le renderer PDF `SectionDocument` ne les extrait pas).

### 3.5 Ce que fait `SectionDocument` avec le peu qu'il reçoit

[components/epreuve/impression/sections/document.tsx](../../components/epreuve/impression/sections/document.tsx) :

```tsx
{doc.kind === "textuel" && (
  <div style={{ fontSize: "11pt", lineHeight: 1.5 }}
       dangerouslySetInnerHTML={{ __html: doc.contenu }} />
)}
{doc.kind === "iconographique" && (
  <div style={{ textAlign: "center" }}>
    <img src={doc.contenu} alt={doc.titre || `Document ${numeroGlobal}`} ... />
  </div>
)}
```

- Pour un document textuel : affiche le HTML de `contenu`. **Pas de source, pas de footnotes, pas de structure.**
- Pour un document iconographique : affiche `<img src={doc.contenu}>`. **Pas de légende, pas de source, dimensions pixel non appliquées.**
- **Aucun chemin pour `perspectives` / `deux_temps`.**

### 3.6 Chaîne de responsabilité du bug

1. **Source primaire :** le contrat `DonneesTache` / `DocumentReference` ne porte pas les champs riches d'un document publié. **Décision architecturale** datant du découpage print-engine (voir commit `382706d feat(print-engine): PDF-13`).
2. **Mapper `construireDocuments`** : ignore les champs riches (il ne peut pas les inclure, le type cible ne les a pas).
3. **`SectionDocument`** : renderer custom qui ne consomme que ce que le contrat lui donne. Ne peut rien faire de plus.
4. **Conséquence :** la route `/apercu/[token]` **ne peut pas** rendre un document conforme au wizard tant que le contrat `DocumentReference` n'évolue pas OU tant que le pipeline ne consomme pas directement `DocumentFiche` / `RendererDocument` comme le fait `PrintableDocumentCell`.

### 3.7 Pourquoi l'impression évaluation (`/evaluations/[id]/print`) ne souffre pas du même bug

Cette route (§1.3) utilise `EvaluationPrintableBody` → `PrintableDocumentCell` avec `DocumentFiche`, **pas** `SectionDocument` avec `DocumentReference`. Elle reconstruit le `TacheFicheData` complet côté serveur et le passe au composant wizard. **Elle évite donc le contrat appauvri** — mais elle **dédouble** la logique d'impression d'épreuve, ce qui est un autre problème (un changement au pipeline `/apercu/[token]` ne se répercute pas automatiquement sur l'impression évaluation, et vice-versa).

### 3.8 Réparation conceptuelle (non proposée ici, pour référence)

Le bug se résout structurellement en imposant INV-R1/R2/R5 :

- Soit `/apercu/[token]` doit recevoir le `DocumentFiche` complet (pas `DocumentReference`) et le rendre via `DocumentCardPrint` (délégation à `DocumentElementRenderer`), comme le fait `DocumentPrintView` et `DocumentWizardPrintPreview`.
- Soit `DocumentReference` doit être étendu pour porter les champs riches — mais cela revient à devenir `DocumentFiche`, et on retombe sur le même traitement.

Dans les deux cas, **`SectionDocument` doit disparaître ou déléguer** à `DocumentCardPrint` / `DocumentElementRenderer`.

Cette réparation n'est **pas** proposée ici — elle relève d'une passe de refactor. Le rapport se limite à documenter la fragmentation.

---

## 4. Tableau de synthèse

| Invariant | Énoncé                                        | Verdict | Cause racine                                                                                                                                                  |
| --------- | --------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| INV-R1    | Renderer canonique unique pour le document    | ❌      | 5+ renderers parallèles (`SectionDocument`, `DocCard`, `DocumentCardCompact`, `PrintableDocumentCell/simple`, `DocumentCardThumbnail`)                        |
| INV-R2    | Conteneurs délèguent, ne re-rendent pas       | ⚠️      | Délégation correcte sur FicheRenderer / print document standalone ; rompue partout ailleurs                                                                   |
| INV-R3    | Mode de rendu propagé explicitement           | ⚠️      | `FicheMode` = 3 modes ; l'« aperçu imprimé » est un pipeline parallèle sans prop `mode` unifiée                                                               |
| INV-R4    | Parité wizard preview / vue détaillée         | ❌      | `PrintableDocumentCell` (wizard) vs `DocCard` (vue détaillée tâche) — 2 renderers distincts sur 2 contrats distincts                                          |
| INV-R5    | Parité wizard preview / export PDF            | ❌      | `PrintableDocumentCell(DocumentFiche)` vs `SectionDocument(DocumentReference)` — contrats + renderers différents. Perte de données dans `construireDocuments` |
| INV-R6    | Variantes n'altèrent pas le rendu intrinsèque | ⚠️      | Respecté par pipeline isolément ; non vérifiable globalement à cause de la fragmentation (INV-R1)                                                             |

---

## 5. Questions ouvertes

1. **`DocumentCardThumbnail` — variant canonique ou exception ?**
   Classé comme « variant » dans `DOMAIN_MODEL.md §4.2`, mais sa stratégie interne est un rendu sur mesure (image preview, texte tronqué) qui ne délègue pas à `DocumentElementRenderer`. Le thumbnail est-il autorisé à avoir un rendu non-canonique (parce que ce n'est qu'un aperçu de liste), ou doit-il lui aussi déléguer ?

2. **`DocCard` vs `DocumentCard` — doublon historique ou hiérarchie intentionnelle ?**
   `DocCard` est une primitive de `lib/fiche/primitives/`, `DocumentCard` est un composant canonique de `components/documents/`. Le premier est utilisé dans vue détaillée tâche (pipeline selectors fiche), le second en vue détaillée document (pipeline `FicheRenderer`). Est-ce une volonté de garder deux renderers selon le conteneur (tâche vs document), ou une dette ?

3. **Deux pipelines d'impression d'épreuve — `/apercu/[token]` et `/evaluations/[id]/print` — sont-ils censés coexister ?**
   §1.2 et §1.3 décrivent deux pipelines fonctionnellement équivalents pour imprimer une épreuve, avec des renderers différents. L'un souffre du bug INV-R5, l'autre non. Le `DOMAIN_MODEL.md` n'indique pas lequel est canonique.

4. **`DocumentFicheRead` — à supprimer ?**
   Aucun import trouvé. 252 lignes de rendu documentaire mort.

5. **`FicheMode` = 3 modes vs `DOMAIN_MODEL.md §8.2 INV-R3` = 4 modes.**
   Le domaine décrit 4 modes (sommaire, lecture, aperçu imprimé, thumbnail). Le type `FicheMode` en a 3. L'« aperçu imprimé » est un pipeline parallèle, pas un mode. Est-ce que le domaine doit être mis à jour, ou faut-il intégrer l'aperçu imprimé comme un 4ᵉ `FicheMode` ?

6. **`SectionDocIndexation` rend `sourceCitationHtml` directement — légitime ?**
   Le panneau d'indexation ([SectionDocIndexation.tsx:41-51](../../lib/fiche/sections/SectionDocIndexation.tsx#L41-L51)) affiche la citation source via `dangerouslySetInnerHTML`, duplicant la logique de `DocumentCardReader`. La source est-elle un champ « de métadonnées » (et donc acceptable ici) ou « intrinsèque » au document (et donc devrait passer par le renderer canonique) ?

---

## 6. Références de code clés

### Contrats de données

- [lib/tache/contrats/donnees.ts:19-25](../../lib/tache/contrats/donnees.ts#L19-L25) — `DocumentReference` (contrat minimal)
- [lib/types/fiche.ts](../../lib/types/fiche.ts) — `DocumentFiche`, `TacheFicheData` (contrats riches)
- [lib/impression/types.ts:17-20](../../lib/impression/types.ts#L17-L20) — `ContexteImpression`
- [lib/fiche/types.ts:16](../../lib/fiche/types.ts#L16) — `FicheMode`

### Renderers canoniques (INV-R1 ✅)

- [components/documents/DocumentCard.tsx](../../components/documents/DocumentCard.tsx)
- [components/documents/DocumentElementRenderer.tsx](../../components/documents/DocumentElementRenderer.tsx)
- [components/documents/DocumentCardPrint.tsx](../../components/documents/DocumentCardPrint.tsx)
- [components/documents/DocumentCardReader.tsx](../../components/documents/DocumentCardReader.tsx)

### Renderers parallèles (INV-R1 ❌)

- [components/epreuve/impression/sections/document.tsx](../../components/epreuve/impression/sections/document.tsx) — `SectionDocument`
- [lib/fiche/primitives/DocCard.tsx](../../lib/fiche/primitives/DocCard.tsx) — `DocCard`
- [components/tache/fiche/DocumentCardCompact.tsx](../../components/tache/fiche/DocumentCardCompact.tsx) — `DocumentCardCompact`
- [components/tache/wizard/preview/PrintableFichePreview.tsx:72-202](../../components/tache/wizard/preview/PrintableFichePreview.tsx#L72-L202) — `PrintableDocumentCell`
- [components/documents/DocumentCardThumbnail.tsx](../../components/documents/DocumentCardThumbnail.tsx) — `DocumentCardThumbnail`
- [components/documents/DocumentFicheRead.tsx](../../components/documents/DocumentFicheRead.tsx) — `DocumentFicheRead` (mort)

### Points de perte de données (bug INV-R5)

- [lib/tache/contrats/etat-wizard-vers-tache.ts:186-197](../../lib/tache/contrats/etat-wizard-vers-tache.ts#L186-L197) — `construireDocuments`
- [lib/impression/builders/blocs-document.ts:27-35](../../lib/impression/builders/blocs-document.ts#L27-L35) — `construireBlocDocument`

### Pipelines complets

- [app/(apercu)/apercu/[token]/page.tsx](<../../app/(apercu)/apercu/[token]/page.tsx>) — route SSR PDF
- [app/(print)/evaluations/[id]/print/page.tsx](<../../app/(print)/evaluations/[id]/print/page.tsx>) — pipeline print évaluation parallèle
- [components/epreuve/impression/index.tsx](../../components/epreuve/impression/index.tsx) — `ApercuImpression`
- [components/evaluations/EvaluationPrintableBody.tsx](../../components/evaluations/EvaluationPrintableBody.tsx) — `EvaluationPrintableBody`
- [components/tache/wizard/preview/PrintableFichePreview.tsx](../../components/tache/wizard/preview/PrintableFichePreview.tsx) — `PrintableFichePreview`
- [components/documents/DocumentFicheLecture.tsx](../../components/documents/DocumentFicheLecture.tsx) — vue détaillée document (pipeline conforme)
- [components/tache/vue-detaillee/sections/documents.tsx](../../components/tache/vue-detaillee/sections/documents.tsx) — vue détaillée tâche (utilise `DocCard`)
