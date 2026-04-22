# AUDIT-PIPELINE-DOCUMENT-2026-04-19

Contrainte appliquée pendant cet audit: lecture limitée au code exécutable (.ts, .tsx, .sql, .json). Aucun fichier .md n'a été lu.

## Section 1 — Inventaire des composants de rendu document

Périmètre demandé: components/documents/, components/epreuve/, components/tache/, components/evaluations/, components/tae/, components/bank/, lib/fiche/, lib/documents/.

### 1.1 components/documents/

1. Composant: DocumentCard
   Fichier: components/documents/DocumentCard.tsx:21
   Signature prop principale (verbatim):

type Props = {
document: RendererDocument;
/\*_ Numéro affiché dans le bandeau (1, 2, 3…). _/
numero?: number;
};

Composants importés et utilisés pour le rendu: DocumentElementRenderer depuis @/components/documents/DocumentElementRenderer (components/documents/DocumentCard.tsx:1, :52, :80).

2. Composant: DocumentCardPrint
   Fichier: components/documents/DocumentCardPrint.tsx:22
   Signature prop principale (verbatim):

type Props = {
document: RendererDocument;
/\*_ Numéro affiché dans le bandeau noir (1, 2, 3…). _/
numero?: number;
};

Composants importés et utilisés pour le rendu: DocumentElementRenderer depuis @/components/documents/DocumentElementRenderer (components/documents/DocumentCardPrint.tsx:1, :46, :67).

3. Composant: DocumentElementRenderer
   Fichier: components/documents/DocumentElementRenderer.tsx:29
   Signature prop principale (verbatim):

type Props = {
element: DocumentElement;
/** Afficher l'auteur (perspectives). \*/
showAuteur?: boolean;
/** Afficher le repère temporel en en-tête (deux_temps). _/
showRepereTemporel?: boolean;
/\*\* Masquer la source (rendue séparément hors cadre en mode print). _/
hideSource?: boolean;
};

Composants importés et utilisés pour le rendu: Image (next/image), DocumentImageLegendOverlay depuis @/components/documents/DocumentImageLegendOverlay (components/documents/DocumentElementRenderer.tsx:12-13, :50, :59).

4. Composant: DocumentCardReader
   Fichier: components/documents/DocumentCardReader.tsx:73
   Signature prop principale (verbatim):

export type DocumentCardReaderProps = {
document: RendererDocument;
/** Métadonnées de classification (indexation). \*/
meta: {
/** Type de source du premier élément. _/
sourceType: "primaire" | "secondaire";
/\*\* Source du premier élément (HTML). _/
sourceCitation: string;
niveauLabels: string;
disciplineLabels: string;
aspectsStr: string;
connLabels: string;
authorName: string;
created: string;
usageCaption: string;
};
};

Composants importés et utilisés pour le rendu: DocumentCard depuis @/components/documents/DocumentCard (components/documents/DocumentCardReader.tsx:1, :141), MetaPill depuis @/components/tae/fiche/MetaPill.

5. Composant: DocumentFicheLecture
   Fichier: components/documents/DocumentFicheLecture.tsx:17
   Signature prop principale (verbatim):

type Props = { data: DocFicheData };

Composants importés et utilisés pour le rendu: FicheRenderer depuis @/lib/fiche/FicheRenderer, avec DOC_FICHE_SECTIONS depuis @/lib/fiche/configs/doc-fiche-sections (components/documents/DocumentFicheLecture.tsx:4-5).

6. Composant: DocumentPrintView
   Fichier: components/documents/DocumentPrintView.tsx:22
   Signature prop principale (verbatim):

type Props = {
documentId: string;
document: RendererDocument;
numero?: number;
};

Composants importés et utilisés pour le rendu: DocumentCardPrint depuis @/components/documents/DocumentCardPrint (components/documents/DocumentPrintView.tsx:5, :66).

7. Composant: DocumentWizardPreview
   Fichier: components/documents/wizard/DocumentWizardPreview.tsx:54
   Signature prop principale (verbatim):

type Props = {
step?: number;
niveaux: NiveauOption[];
disciplines: DisciplineOption[];
authorName?: string;
};

Composants importés et utilisés pour le rendu: DocumentElementRenderer depuis @/components/documents/DocumentElementRenderer (components/documents/wizard/DocumentWizardPreview.tsx:4, :430).

8. Composant: DocumentWizardPrintPreview
   Fichier: components/documents/wizard/DocumentWizardPrintPreview.tsx:16
   Signature prop principale: aucune prop déclarée (signature export function DocumentWizardPrintPreview()).

Composants importés et utilisés pour le rendu: DocumentCardPrint depuis @/components/documents/DocumentCardPrint (components/documents/wizard/DocumentWizardPrintPreview.tsx:4, :60).

9. Composant: DocumentImageLegendOverlay
   Fichier: components/documents/DocumentImageLegendOverlay.tsx:21
   Signature prop principale (verbatim):

type Props = {
text: string;
position: DocumentLegendPosition;
className?: string;
/\*_ Vignette sommaire (DocumentCard) — bandeau plus petit. _/
compact?: boolean;
};

Composants importés et utilisés pour le rendu: aucun composant React importé pour son rendu propre (utilise classes CSS + texte).

### 1.2 components/epreuve/

1. Composant: SectionDocument
   Fichier: components/epreuve/impression/sections/document.tsx:19
   Signature prop principale (verbatim):

export type ContenuDocument = {
numeroGlobal: number;
document: RendererDocument;
};

export type SectionDocumentProps = {
contenu: ContenuDocument;
};

Composants importés et utilisés pour le rendu: DocumentCardPrint depuis @/components/documents/DocumentCardPrint (components/epreuve/impression/sections/document.tsx:7, :20).

2. Composant: ApercuImpression
   Fichier: components/epreuve/impression/index.tsx:66
   Signature prop principale (verbatim):

export type ApercuImpressionProps = {
rendu: RenduImprimable & { ok: true };
};

Composants importés et utilisés pour le rendu document: SectionDocument depuis ./sections/document (components/epreuve/impression/index.tsx:19, :47).

### 1.3 components/tache/

1. Composant: SectionDocuments
   Fichier: components/tache/vue-detaillee/sections/documents.tsx:17
   Signature prop principale (verbatim):

type Props = {
data: DocumentsSectionData;
/\*_ Handler de clic sur un document — ouvre la modale fiche document. _/
surClicDocument?: (docId: string) => void;
};

Composants importés et utilisés pour le rendu: DocumentCard depuis @/components/documents/DocumentCard (components/tache/vue-detaillee/sections/documents.tsx:5, :25).

### 1.4 components/evaluations/

Aucun composant de ce dossier ne rend directement un document (titre + contenu + image/source/légende) dans les fichiers inspectés.

### 1.5 components/tae/

1. Composant: SectionDocuments
   Fichier: components/tae/fiche/SectionDocuments.tsx:11
   Signature prop principale (verbatim):

type Props = {
documents: DocumentFiche[];
};

Composants importés et utilisés pour le rendu: DocumentCard depuis @/components/documents/DocumentCard (components/tae/fiche/SectionDocuments.tsx:1, :34).

2. Composant: PrintableFicheDocumentsSection
   Fichier: components/tae/TaeForm/preview/PrintableFichePreview.tsx:107
   Signature prop principale (verbatim):

function PrintableFicheDocumentsSection({ tae }: { tae: TaeFicheData })

Composants importés et utilisés pour le rendu: DocumentCardPrint depuis @/components/documents/DocumentCardPrint (components/tae/TaeForm/preview/PrintableFichePreview.tsx:13, :117).

3. Composant: PrintableFicheFromTaeData
   Fichier: components/tae/TaeForm/preview/PrintableFichePreview.tsx:226
   Signature prop principale (verbatim):

type FromTaeProps = {
tae: TaeFicheData;
className?: string;
mode?: ModeImpression;
estCorrige?: boolean;
/\*_ Feuillet contrôlé de l'extérieur (PreviewPanel). Si fourni, pas de toggle interne. _/
feuillet?: TaePrintFeuilletId;
};

Composants importés et utilisés pour le rendu document: PrintableFicheDocumentsSection (même fichier), donc DocumentCardPrint via ce sous-composant.

4. Composant: PrintableFichePreview
   Fichier: components/tae/TaeForm/preview/PrintableFichePreview.tsx:301
   Signature prop principale (verbatim):

type WizardProps = {
previewMeta: WizardFichePreviewMeta;
className?: string;
/** Variante de composition (formatif / sommatif standard / ministérielle). \*/
mode?: ModeImpression;
/** Affiche la vue corrigée (consigne + corrigé uniquement). _/
estCorrige?: boolean;
/\*\* Feuillet contrôlé (PreviewPanel). Si fourni, le toggle interne est masqué. _/
feuillet?: TaePrintFeuilletId;
};

Composants importés et utilisés pour le rendu document: PrintableFicheFromTaeData (même fichier), donc DocumentCardPrint via PrintableFicheDocumentsSection.

5. Composant: TaeFichePrintView
   Fichier: components/tae/print/TaeFichePrintView.tsx:17
   Signature prop principale (verbatim):

type Props = {
taeId: string;
tae: TaeFicheData;
};

Composants importés et utilisés pour le rendu document: PrintableFicheFromTaeData depuis @/components/tae/TaeForm/preview/PrintableFichePreview (components/tae/print/TaeFichePrintView.tsx:4).

6. Composant: FicheSommaireColumn
   Fichier: components/tae/TaeForm/sommaire/FicheSommaireColumn.tsx:19
   Signature prop principale (verbatim):

type Props = {
previewMeta: {
authorFullName: string;
draftStartedAtIso: string;
};
};

Composants importés et utilisés pour le rendu document: FicheRenderer depuis @/lib/fiche/FicheRenderer avec TAE_FICHE_SECTIONS depuis @/lib/fiche/configs/tae-fiche-sections (la section documents y pointe sur SectionDocuments -> DocumentCard).

7. Composant: FicheLecture
   Fichier: components/tae/FicheLecture.tsx:24
   Signature prop principale (verbatim):

type Props = {
tae: TaeFicheData;
userId?: string;
};

Composants importés et utilisés pour le rendu document: FicheRenderer depuis @/lib/fiche/FicheRenderer avec TAE_LECTURE_SECTIONS depuis @/lib/fiche/configs/tae-lecture-sections (SectionDocuments -> DocumentCard).

### 1.6 components/bank/

Aucun composant de components/bank/ ne rend directement le contenu complet d'un document. Le rendu visuel des cartes documents est délégué à DocumentMiniature importé depuis @/components/document/miniature, notamment dans components/bank/BankDocumentsPanel.tsx:3 et :230.

### 1.7 lib/fiche/

1. Composant: SectionDocuments
   Fichier: lib/fiche/sections/SectionDocuments.tsx:14
   Signature prop principale (verbatim):

type Props = { data: DocumentsData; mode: FicheMode };

Composants importés et utilisés pour le rendu: DocumentCard depuis @/components/documents/DocumentCard (lib/fiche/sections/SectionDocuments.tsx:6, :24).

2. Composant: SectionDocContent
   Fichier: lib/fiche/sections/SectionDocContent.tsx:16
   Signature prop principale (verbatim):

type Props = { data: DocContentData; mode: FicheMode };

Composants importés et utilisés pour le rendu: DocumentCard depuis @/components/documents/DocumentCard (lib/fiche/sections/SectionDocContent.tsx:5, :22).

3. Composant: DocFicheHeader
   Fichier: lib/fiche/sections/DocFicheHeader.tsx:18
   Signature prop principale (verbatim):

type Props = { data: DocHeaderData; mode: FicheMode };

Composants importés et utilisés pour le rendu: IconBadge, MetaChip, ChipBar (titre et badges document).

4. Composant: SectionDocIndexation
   Fichier: lib/fiche/sections/SectionDocIndexation.tsx:34
   Signature prop principale (verbatim):

type Props = { data: DocIndexationData; mode: FicheMode };

Composants importés et utilisés pour le rendu: SectionLabel; affichage source via dangerouslySetInnerHTML sur data.sourceCitationHtml.

5. Composant: FicheRenderer
   Fichier: lib/fiche/FicheRenderer.tsx:17
   Signature prop principale (verbatim):

type Props<TState> = {
sections: readonly FicheSectionEntry<TState>[];
state: TState;
refs: SelectorRefs;
mode: FicheMode;
activeStepId: StepId | null;
};

Composants importés et utilisés pour le rendu document: FicheSection (orchestration), GenericSkeleton. Le rendu document concret est fait par les sections injectées (SectionDocuments, SectionDocContent, etc.).

### 1.8 lib/documents/

Aucun composant React de rendu visuel trouvé dans lib/documents/ (utilitaires et adaptateurs uniquement dans les fichiers inspectés).

## Section 2 — Points de consommation

Pour chaque surface demandée, composant de rendu document utilisé et chemin d'import exact observé.

1. Surface: /documents/[id] (vue détaillée document)
   Fichier route: app/(app)/documents/[id]/page.tsx:3
   Import direct: DocumentVueDetaillee depuis @/components/document/vue-detaillee
   Chaîne de rendu document observée:

- components/document/vue-detaillee/index.tsx:11 importe DocumentCard depuis @/components/documents/DocumentCard
- components/document/vue-detaillee/sections/contenu.tsx:4 importe DocumentElementRenderer depuis @/components/documents/DocumentElementRenderer

2. Surface: /questions/[id] (vue détaillée tâche)
   Fichier route: app/(app)/questions/[id]/page.tsx:4
   Import direct: TacheVueDetaillee depuis @/components/tache/vue-detaillee
   Chaîne de rendu document observée:

- components/tache/vue-detaillee/flux-lecture.tsx:11 importe SectionDocuments depuis @/components/tache/vue-detaillee/sections/documents
- components/tache/vue-detaillee/sections/documents.tsx:5 importe DocumentCard depuis @/components/documents/DocumentCard

3. Surface: /taches/[id]
   Résultat: Indéterminé — aucune route app/**/taches/**/page.tsx trouvée dans l'arborescence inspectée.

4. Surface: /evaluations/[id] (vue détaillée épreuve)
   Fichier route: app/(app)/evaluations/[id]/page.tsx:2
   Import direct: EpreuveVueDetaillee depuis @/components/epreuve/vue-detaillee
   Chaîne de rendu document observée:

- components/epreuve/vue-detaillee/index.tsx:8 importe ApercuImprimeInline depuis @/components/partagees/vue-detaillee/apercu-imprime
- components/partagees/vue-detaillee/apercu-imprime.tsx:4 utilise useApercuPng
- app/(apercu)/apercu/[token]/page.tsx:13 importe ApercuImpression depuis @/components/epreuve/impression
- components/epreuve/impression/index.tsx:19 importe SectionDocument depuis ./sections/document
- components/epreuve/impression/sections/document.tsx:7 importe DocumentCardPrint depuis @/components/documents/DocumentCardPrint

5. Surface: Wizard document (création)
   Fichier route: app/(app)/documents/new/page.tsx:1
   Import direct: AutonomousDocumentForm depuis @/components/documents/AutonomousDocumentForm
   Chaîne de rendu document observée dans le wizard:

- components/documents/wizard/AutonomousDocumentWizard.tsx:18 importe DocumentWizardPreview depuis @/components/documents/wizard/DocumentWizardPreview
- components/documents/wizard/AutonomousDocumentWizard.tsx:19 importe DocumentWizardPrintPreview depuis @/components/documents/wizard/DocumentWizardPrintPreview
- components/documents/wizard/DocumentWizardPreview.tsx:4 importe DocumentElementRenderer
- components/documents/wizard/DocumentWizardPrintPreview.tsx:4 importe DocumentCardPrint

6. Surface: Wizard tâche (création, panneau preview)
   Fichier route: app/(app)/questions/new/page.tsx:1
   Import direct: TaeForm depuis @/components/tae/TaeForm
   Chaîne de rendu document observée:

- components/tae/TaeForm/index.tsx:12 importe PrintableFichePreview depuis @/components/tae/TaeForm/preview/PrintableFichePreview
- components/tae/TaeForm/index.tsx:13 importe FicheSommaireColumn depuis @/components/tae/TaeForm/sommaire
- components/tae/TaeForm/preview/PrintableFichePreview.tsx:13 importe DocumentCardPrint
- components/tae/TaeForm/sommaire/FicheSommaireColumn.tsx:4 importe FicheRenderer + TAE_FICHE_SECTIONS (qui inclut SectionDocuments -> DocumentCard)

7. Surface: Wizard épreuve (création)
   Fichier route: app/(app)/evaluations/new/page.tsx:2
   Import direct: EvaluationCompositionEditor depuis @/components/evaluations/EvaluationCompositionEditor
   Chaîne observée:

- components/evaluations/EvaluationCompositionEditor.tsx:173-174 ouvre /apercu/{token} via window.open
- rendu document final dans /apercu/[token] via ApercuImpression -> SectionDocument -> DocumentCardPrint

8. Surface: Banque documents (liste)
   Fichier route: app/(app)/bank/page.tsx:6
   Import direct: BankDocumentsPanel depuis @/components/bank/BankDocumentsPanel
   Chaîne de rendu observée:

- components/bank/BankDocumentsPanel.tsx:3 importe DocumentMiniature depuis @/components/document/miniature

9. Surface: Mes documents (liste)
   Fichier route: app/(app)/documents/page.tsx:4-5
   Imports directs: DocumentMiniatureList depuis @/components/document/miniature, OwnerDocumentMiniatureEntry depuis @/components/document/miniature/owner-entry
   Chaîne de rendu observée:

- components/document/miniature/owner-entry.tsx:7 importe DocumentMiniature depuis @/components/document/miniature

10. Surface: Profil (liste des documents d'un user)
    Fichier route: app/(app)/profile/[id]/page.tsx:6
    Import direct: ProfilePageClient depuis @/components/profile/ProfilePageClient
    Chaîne de rendu observée:

- components/profile/ProfileContributions.tsx:6 importe ProfileDocumentsList
- components/profile/ProfileDocumentsList.tsx:7 importe DocumentMiniature et DocumentMiniatureList depuis @/components/document/miniature

11. Surface: /apercu/[token] (pipeline Puppeteer)
    Fichier route: app/(apercu)/apercu/[token]/page.tsx:13
    Import direct: ApercuImpression depuis @/components/epreuve/impression
    Chaîne de rendu document observée:

- components/epreuve/impression/index.tsx:47 retourne SectionDocument pour bloc.kind === "document"
- components/epreuve/impression/sections/document.tsx:20 retourne DocumentCardPrint

12. Surface: /api/impression/\*
    Routes présentes:

- app/api/impression/token-draft/route.ts
- app/api/impression/apercu-png/route.ts
- app/api/impression/pdf/route.ts

Composant de rendu document utilisé dans ces routes:

- Aucun composant React importé directement.
- Délégation au rendu de /apercu/[token] via URL construite:
  - app/api/impression/apercu-png/route.ts:169 const url = `${baseUrl}/apercu/${encodeURIComponent(token)}`;
  - app/api/impression/pdf/route.ts:67 const url = `${baseUrl}/apercu/${encodeURIComponent(token)}`;

## Section 3 — Contrat de données

Classification, pour chaque composant listé en section 1.

### 3.1 Composants dont la prop principale est RendererDocument

- components/documents/DocumentCard.tsx (type Props.document: RendererDocument; import depuis @/lib/types/document-renderer)
- components/documents/DocumentCardPrint.tsx (type Props.document: RendererDocument; import depuis @/lib/types/document-renderer)
- components/documents/DocumentCardReader.tsx (DocumentCardReaderProps.document: RendererDocument; import depuis @/lib/types/document-renderer)
- components/documents/DocumentPrintView.tsx (type Props.document: RendererDocument; import depuis @/lib/types/document-renderer)
- components/epreuve/impression/sections/document.tsx (ContenuDocument.document: RendererDocument; import depuis @/lib/types/document-renderer)
- lib/fiche/sections/SectionDocContent.tsx (DocContentData.document est RendererDocument; DocContentData défini dans lib/fiche/types.ts)

### 3.2 Composants dont la prop principale est DocumentFiche

- components/tae/fiche/SectionDocuments.tsx (type Props.documents: DocumentFiche[]; import DocumentFiche depuis @/lib/types/fiche)
- lib/fiche/sections/SectionDocuments.tsx (DocumentsData.documents: DocumentFiche[]; DocumentsData défini dans lib/fiche/types.ts)

### 3.3 Composants utilisant DocumentReference

Aucun cas trouvé dans le périmètre lib/, components/, app/ (voir Section 5, pattern DocumentReference: TOTAL 0).

### 3.4 Autres types (définition recopiée)

- components/documents/DocumentElementRenderer.tsx
  type Props = {
  element: DocumentElement;
  showAuteur?: boolean;
  showRepereTemporel?: boolean;
  hideSource?: boolean;
  };

- components/documents/DocumentFicheLecture.tsx
  type Props = { data: DocFicheData };

- components/documents/wizard/DocumentWizardPreview.tsx
  type Props = {
  step?: number;
  niveaux: NiveauOption[];
  disciplines: DisciplineOption[];
  authorName?: string;
  };

- components/documents/wizard/DocumentWizardPrintPreview.tsx
  Aucune prop déclarée (export function DocumentWizardPrintPreview()).

- components/documents/DocumentImageLegendOverlay.tsx
  type Props = {
  text: string;
  position: DocumentLegendPosition;
  className?: string;
  compact?: boolean;
  };

- components/tache/vue-detaillee/sections/documents.tsx
  type Props = {
  data: DocumentsSectionData;
  surClicDocument?: (docId: string) => void;
  };
  DocumentsSectionData défini dans lib/fiche/selectors/tache/documents.ts:
  export type DocumentsSectionData = {
  sectionLabel: string;
  cards: DocCardData[];
  };
  export type DocCardData = {
  numero: number;
  docId: string;
  document: RendererDocument;
  };

- components/epreuve/impression/index.tsx
  export type ApercuImpressionProps = {
  rendu: RenduImprimable & { ok: true };
  };

- components/tae/TaeForm/preview/PrintableFichePreview.tsx
  type FromTaeProps = {
  tae: TaeFicheData;
  className?: string;
  mode?: ModeImpression;
  estCorrige?: boolean;
  feuillet?: TaePrintFeuilletId;
  };
  type WizardProps = {
  previewMeta: WizardFichePreviewMeta;
  className?: string;
  mode?: ModeImpression;
  estCorrige?: boolean;
  feuillet?: TaePrintFeuilletId;
  };

- components/tae/print/TaeFichePrintView.tsx
  type Props = {
  taeId: string;
  tae: TaeFicheData;
  };

- components/tae/TaeForm/sommaire/FicheSommaireColumn.tsx
  type Props = {
  previewMeta: {
  authorFullName: string;
  draftStartedAtIso: string;
  };
  };

- components/tae/FicheLecture.tsx
  type Props = {
  tae: TaeFicheData;
  userId?: string;
  };

- lib/fiche/sections/DocFicheHeader.tsx
  type Props = { data: DocHeaderData; mode: FicheMode };

- lib/fiche/sections/SectionDocIndexation.tsx
  type Props = { data: DocIndexationData; mode: FicheMode };

- lib/fiche/FicheRenderer.tsx
  type Props<TState> = {
  sections: readonly FicheSectionEntry<TState>[];
  state: TState;
  refs: SelectorRefs;
  mode: FicheMode;
  activeStepId: StepId | null;
  };

## Section 4 — Pipeline d'impression

### 4.1 Fonction qui transforme le FormState

Fichier: lib/tache/contrats/etat-wizard-vers-tache.ts
Fonction: etatWizardVersTache
Type de retour: DonneesTache

Code de la fonction recopié:

lib/tache/contrats/etat-wizard-vers-tache.ts:267:export function etatWizardVersTache(
lib/tache/contrats/etat-wizard-vers-tache.ts:268: etat: TaeFormState,
lib/tache/contrats/etat-wizard-vers-tache.ts:269: oiList: OiEntryJson[],
lib/tache/contrats/etat-wizard-vers-tache.ts:270: grilles: GrilleEvaluationEntree[],
lib/tache/contrats/etat-wizard-vers-tache.ts:271: meta?: MetaApercu | null,
lib/tache/contrats/etat-wizard-vers-tache.ts:272:): DonneesTache {
lib/tache/contrats/etat-wizard-vers-tache.ts:273: const oiEntry = oiList.find((o) => o.id === etat.bloc2.oiId);
lib/tache/contrats/etat-wizard-vers-tache.ts:274: const comportement = oiEntry?.comportements_attendus.find(
lib/tache/contrats/etat-wizard-vers-tache.ts:275: (c) => c.id === etat.bloc2.comportementId,
lib/tache/contrats/etat-wizard-vers-tache.ts:276: );
lib/tache/contrats/etat-wizard-vers-tache.ts:277:
lib/tache/contrats/etat-wizard-vers-tache.ts:278: const redaction = getRedactionSliceForPreview(etat);
lib/tache/contrats/etat-wizard-vers-tache.ts:279: const aspectsSociete = (Object.entries(redaction.aspects) as [AspectSocieteKey, boolean][])
lib/tache/contrats/etat-wizard-vers-tache.ts:280: .filter(([, v]) => v)
lib/tache/contrats/etat-wizard-vers-tache.ts:281: .map(([k]) => ASPECT_LABEL[k]);
lib/tache/contrats/etat-wizard-vers-tache.ts:282:
lib/tache/contrats/etat-wizard-vers-tache.ts:283: const niveauLabel =
lib/tache/contrats/etat-wizard-vers-tache.ts:284: NIVEAUX.find((n) => n.value === (etat.bloc2.niveau as NiveauCode))?.label ?? "";
lib/tache/contrats/etat-wizard-vers-tache.ts:285: const disc = etat.bloc2.discipline;
lib/tache/contrats/etat-wizard-vers-tache.ts:286: const disciplineLabel =
lib/tache/contrats/etat-wizard-vers-tache.ts:287: disc && disc in DISCIPLINE_LABEL ? DISCIPLINE_LABEL[disc as DisciplineCode] : "";
lib/tache/contrats/etat-wizard-vers-tache.ts:288:
lib/tache/contrats/etat-wizard-vers-tache.ts:289: return {
lib/tache/contrats/etat-wizard-vers-tache.ts:290: id: "draft",
lib/tache/contrats/etat-wizard-vers-tache.ts:291: auteur_id: "draft-local",
lib/tache/contrats/etat-wizard-vers-tache.ts:292: auteurs: construireAuteurs(etat, meta),
lib/tache/contrats/etat-wizard-vers-tache.ts:293:
lib/tache/contrats/etat-wizard-vers-tache.ts:294: titre: comportement?.enonce ?? "",
lib/tache/contrats/etat-wizard-vers-tache.ts:295: consigne: construireConsigne(etat),
lib/tache/contrats/etat-wizard-vers-tache.ts:296: guidage: construireGuidage(etat),
lib/tache/contrats/etat-wizard-vers-tache.ts:297: documents: construireDocuments(etat),
lib/tache/contrats/etat-wizard-vers-tache.ts:298: espaceProduction: deduireEspaceProduction(etat),
lib/tache/contrats/etat-wizard-vers-tache.ts:299: outilEvaluation: resoudreOutilEvaluation(etat.bloc2.outilEvaluation, grilles),
lib/tache/contrats/etat-wizard-vers-tache.ts:300: corrige: construireCorrige(etat),
lib/tache/contrats/etat-wizard-vers-tache.ts:301:
lib/tache/contrats/etat-wizard-vers-tache.ts:302: aspects_societe: aspectsSociete,
lib/tache/contrats/etat-wizard-vers-tache.ts:303: nb_lignes: etat.bloc2.nbLignes ?? 5,
lib/tache/contrats/etat-wizard-vers-tache.ts:304: niveau: { label: niveauLabel },
lib/tache/contrats/etat-wizard-vers-tache.ts:305: discipline: { label: disciplineLabel },
lib/tache/contrats/etat-wizard-vers-tache.ts:306: oi: {
lib/tache/contrats/etat-wizard-vers-tache.ts:307: id: etat.bloc2.oiId,
lib/tache/contrats/etat-wizard-vers-tache.ts:308: titre: oiEntry?.titre ?? "",
lib/tache/contrats/etat-wizard-vers-tache.ts:309: icone: oiEntry?.icone ?? "cognition",
lib/tache/contrats/etat-wizard-vers-tache.ts:310: },
lib/tache/contrats/etat-wizard-vers-tache.ts:311: comportement: {
lib/tache/contrats/etat-wizard-vers-tache.ts:312: id: etat.bloc2.comportementId,
lib/tache/contrats/etat-wizard-vers-tache.ts:313: enonce: comportement?.enonce ?? "",
lib/tache/contrats/etat-wizard-vers-tache.ts:314: },
lib/tache/contrats/etat-wizard-vers-tache.ts:315: cd: cdSelectionToFicheSlice(etat.bloc6.cd.selection),
lib/tache/contrats/etat-wizard-vers-tache.ts:316: connaissances: connaissancesToFicheSlice(etat.bloc7.connaissances),
lib/tache/contrats/etat-wizard-vers-tache.ts:317:
lib/tache/contrats/etat-wizard-vers-tache.ts:318: version: 1,
lib/tache/contrats/etat-wizard-vers-tache.ts:319: version_updated_at: null,
lib/tache/contrats/etat-wizard-vers-tache.ts:320: is_published: false,
lib/tache/contrats/etat-wizard-vers-tache.ts:321: created_at: meta?.draftStartedAtIso ?? "",
lib/tache/contrats/etat-wizard-vers-tache.ts:322: updated_at: meta?.draftStartedAtIso ?? "",
lib/tache/contrats/etat-wizard-vers-tache.ts:323: };
lib/tache/contrats/etat-wizard-vers-tache.ts:324:}

### 4.2 Où ce type de retour est persisté

Observation code:

- components/tae/TaeForm/preview/PrintableFichePreview.tsx:323 crée une variable locale donnees via etatWizardVersTache(state, oiList, grillesEntrees, previewMeta).
- Dans ce fichier, donnees est ensuite adapté vers taeFiche local et renvoyé vers PrintableFicheFromTaeData (rendu local), sans écriture directe en base ou KV.

Persistance observée pour la chaîne /apercu/[token]:

- hooks/epreuve/use-apercu-png.ts:139 POST /api/impression/token-draft avec payload discriminé.
- app/api/impression/token-draft/route.ts:100 écrit dans Vercel KV via kv.set(`draft:${payloadId}`, kvValue, { ex: KV_TTL_SECONDS }).

Conclusion factuelle sur stockage:

- Données de preview token: Vercel KV.
- Aucune écriture Supabase observée dans la route token-draft.

### 4.3 Résolution du token dans app/(apercu)/apercu/[token]/page.tsx

Code observé:

- app/(apercu)/apercu/[token]/page.tsx:101 vérifie verifierTokenDraft(token)
- app/(apercu)/apercu/[token]/page.tsx:106 lit kv.get<string>(`draft:${verification.payloadId}`)
- app/(apercu)/apercu/[token]/page.tsx:111 parse extraireDonneesKv(raw)

Type de données en sortie de extraireDonneesKv:

- app/(apercu)/apercu/[token]/page.tsx:28-31
  type DraftKvTyped =
  | { type: "document"; payload: RendererDocument }
  | { type: "tache"; payload: DonneesTache; mode: ModeImpression; estCorrige: boolean }
  | { type: "epreuve"; payload: DonneesEpreuve; mode: ModeImpression; estCorrige: boolean };

### 4.4 Passage des données vers ApercuImpression

JSX d'appel exact:

- app/(apercu)/apercu/[token]/page.tsx:123
  return <ApercuImpression rendu={rendu} />;

### 4.5 Délégation de rendu document dans ApercuImpression

Le composant délègue.

Partie JSX qui rend le document dans ApercuImpression:

- components/epreuve/impression/index.tsx:47
  return <SectionDocument contenu={bloc.content as ContenuDocument} />;

Partie JSX de délégation suivante:

- components/epreuve/impression/sections/document.tsx:20
  return <DocumentCardPrint document={contenu.document} numero={contenu.numeroGlobal} />;

## Section 5 — Grep exhaustifs

Note d'exécution:

- La commande grep n'est pas installée sur ce terminal (CommandNotFound).
- Exécution équivalente réalisée sur le même périmètre lib/, components/, app/ avec recherche sensible à la casse et sortie brute fichier:ligne:code.
- Les commandes demandées sont reproduites textuellement ci-dessous dans chaque bloc.

PATTERN: DocumentReference
COMMAND: grep -rn "DocumentReference" lib/ components/ app/ --include="_.ts" --include="_.tsx"
TOTAL: 0
(no matches)

PATTERN: DocCard
COMMAND: grep -rn "DocCard" lib/ components/ app/ --include="_.ts" --include="_.tsx"
TOTAL: 2
C:\Users\leves\eduqcia-app\lib\fiche\selectors\tache\documents.ts:11:export type DocCardData = {
C:\Users\leves\eduqcia-app\lib\fiche\selectors\tache\documents.ts:20: cards: DocCardData[];

PATTERN: DocumentCardCompact
COMMAND: grep -rn "DocumentCardCompact" lib/ components/ app/ --include="_.ts" --include="_.tsx"
TOTAL: 0
(no matches)

PATTERN: PrintableDocumentCell
COMMAND: grep -rn "PrintableDocumentCell" lib/ components/ app/ --include="_.ts" --include="_.tsx"
TOTAL: 0
(no matches)

PATTERN: DocumentFicheRead
COMMAND: grep -rn "DocumentFicheRead" lib/ components/ app/ --include="_.ts" --include="_.tsx"
TOTAL: 0
(no matches)

PATTERN: EvaluationPrintableBody
COMMAND: grep -rn "EvaluationPrintableBody" lib/ components/ app/ --include="_.ts" --include="_.tsx"
TOTAL: 0
(no matches)

PATTERN: EvaluationFichePrintView
COMMAND: grep -rn "EvaluationFichePrintView" lib/ components/ app/ --include="_.ts" --include="_.tsx"
TOTAL: 0
(no matches)

PATTERN: SectionDocument
COMMAND: grep -rn "SectionDocument" lib/ components/ app/ --include="_.ts" --include="_.tsx"
TOTAL: 16
C:\Users\leves\eduqcia-app\lib\fiche\configs\tae-fiche-sections.tsx:26:import { SectionDocuments } from "@/lib/fiche/sections/SectionDocuments";
C:\Users\leves\eduqcia-app\lib\fiche\configs\tae-fiche-sections.tsx:96: component: SectionDocuments,
C:\Users\leves\eduqcia-app\lib\fiche\configs\tae-lecture-sections.ts:40:import { SectionDocuments } from "@/lib/fiche/sections/SectionDocuments";
C:\Users\leves\eduqcia-app\lib\fiche\configs\tae-lecture-sections.ts:80: component: SectionDocuments,
C:\Users\leves\eduqcia-app\lib\fiche\sections\SectionDocuments.tsx:14:export function SectionDocuments({ data, mode: \_mode }: Props) {
C:\Users\leves\eduqcia-app\lib\impression\builders\blocs-document.ts:17:/\*_ Contenu structuré d'un bloc document (consommé par SectionDocument). _/
C:\Users\leves\eduqcia-app\components\epreuve\impression\sections\document.tsx:2: _ SectionDocument — délègue au renderer canonique DocumentCardPrint.
C:\Users\leves\eduqcia-app\components\epreuve\impression\sections\document.tsx:4: _ Invariant #5 du print-engine : ApercuImpression → SectionDocument → DocumentCardPrint.
C:\Users\leves\eduqcia-app\components\epreuve\impression\sections\document.tsx:15:export type SectionDocumentProps = {
C:\Users\leves\eduqcia-app\components\epreuve\impression\sections\document.tsx:19:export function SectionDocument({ contenu }: SectionDocumentProps) {
C:\Users\leves\eduqcia-app\components\epreuve\impression\index.tsx:19:import { SectionDocument } from "./sections/document";
C:\Users\leves\eduqcia-app\components\epreuve\impression\index.tsx:47: return <SectionDocument contenu={bloc.content as ContenuDocument} />;
C:\Users\leves\eduqcia-app\components\tache\vue-detaillee\sections\documents.tsx:17:export function SectionDocuments({ data, surClicDocument }: Props) {
C:\Users\leves\eduqcia-app\components\tache\vue-detaillee\flux-lecture.tsx:11:import { SectionDocuments } from "@/components/tache/vue-detaillee/sections/documents";
C:\Users\leves\eduqcia-app\components\tache\vue-detaillee\flux-lecture.tsx:50: {documents ? <SectionDocuments data={documents} surClicDocument={surClicDocument} /> : null}
C:\Users\leves\eduqcia-app\components\tae\fiche\SectionDocuments.tsx:11:export function SectionDocuments({ documents }: Props) {

PATTERN: DocumentCard
COMMAND: grep -rn "DocumentCard" lib/ components/ app/ --include="_.ts" --include="_.tsx"
TOTAL: 39
C:\Users\leves\eduqcia-app\lib\fiche\sections\SectionDocContent.tsx:5:import { DocumentCard } from "@/components/documents/DocumentCard";
C:\Users\leves\eduqcia-app\lib\fiche\sections\SectionDocContent.tsx:13: _ Contenu du document — DocumentCard (simple/perspectives/deux_temps).
C:\Users\leves\eduqcia-app\lib\fiche\sections\SectionDocContent.tsx:14: _ Le composant DocumentCard gère les 3 variantes en interne.
C:\Users\leves\eduqcia-app\lib\fiche\sections\SectionDocContent.tsx:22: <DocumentCard document={data.document} />
C:\Users\leves\eduqcia-app\lib\fiche\sections\SectionDocIndexation.tsx:32: _ Reproduit le panneau droit de DocumentCardReader en tant que section linéaire.
C:\Users\leves\eduqcia-app\lib\fiche\sections\SectionDocuments.tsx:6:import { DocumentCard } from "@/components/documents/DocumentCard";
C:\Users\leves\eduqcia-app\lib\fiche\sections\SectionDocuments.tsx:13:/\*\* Documents historiques — rendus via le composant canonique DocumentCard. _/
C:\Users\leves\eduqcia-app\lib\fiche\sections\SectionDocuments.tsx:24: <DocumentCard document={documentFicheVersRenderer(doc)} />
C:\Users\leves\eduqcia-app\lib\fiche\selectors\tache\documents.ts:3: _ Retourne un array de RendererDocument numérotés prêts pour DocumentCard.
C:\Users\leves\eduqcia-app\components\document\vue-detaillee\index.tsx:11:import { DocumentCard } from "@/components/documents/DocumentCard";
C:\Users\leves\eduqcia-app\components\document\vue-detaillee\index.tsx:99: {/_ Aperçu imprimé — rendu canonique via DocumentCard mode print _/}
C:\Users\leves\eduqcia-app\components\document\vue-detaillee\index.tsx:102: <DocumentCard document={data.document} numero={1} />
C:\Users\leves\eduqcia-app\components\documents\wizard\DocumentWizardPrintPreview.tsx:4:import { DocumentCardPrint } from "@/components/documents/DocumentCardPrint";
C:\Users\leves\eduqcia-app\components\documents\wizard\DocumentWizardPrintPreview.tsx:14: _ `RendererDocument` pour `DocumentCardPrint`.
C:\Users\leves\eduqcia-app\components\documents\wizard\DocumentWizardPrintPreview.tsx:60: return <DocumentCardPrint document={rendererDoc} numero={1} />;
C:\Users\leves\eduqcia-app\components\documents\DocumentCard.tsx:21:export function DocumentCard({ document: doc, numero }: Props) {
C:\Users\leves\eduqcia-app\components\documents\DocumentCardPrint.tsx:22:export function DocumentCardPrint({ document: doc, numero }: Props) {
C:\Users\leves\eduqcia-app\components\documents\DocumentCardReader.tsx:1:import { DocumentCard } from "@/components/documents/DocumentCard";
C:\Users\leves\eduqcia-app\components\documents\DocumentCardReader.tsx:37:export type DocumentCardReaderProps = {
C:\Users\leves\eduqcia-app\components\documents\DocumentCardReader.tsx:66: _ Fiche lecture d'un document — wrapper autour de `DocumentCard`.
C:\Users\leves\eduqcia-app\components\documents\DocumentCardReader.tsx:69: _ via `DocumentCard`, entouré de métadonnées d'indexation.
C:\Users\leves\eduqcia-app\components\documents\DocumentCardReader.tsx:73:export function DocumentCardReader({ document: doc, meta }: DocumentCardReaderProps) {
C:\Users\leves\eduqcia-app\components\documents\DocumentCardReader.tsx:141: <DocumentCard document={doc} />
C:\Users\leves\eduqcia-app\components\documents\DocumentImageLegendOverlay.tsx:16: /\*_ Vignette sommaire (DocumentCard) — bandeau plus petit. _/
C:\Users\leves\eduqcia-app\components\documents\DocumentPrintView.tsx:5:import { DocumentCardPrint } from "@/components/documents/DocumentCardPrint";
C:\Users\leves\eduqcia-app\components\documents\DocumentPrintView.tsx:66: <DocumentCardPrint document={doc} numero={numero} />
C:\Users\leves\eduqcia-app\components\epreuve\impression\sections\document.tsx:2: _ SectionDocument — délègue au renderer canonique DocumentCardPrint.
C:\Users\leves\eduqcia-app\components\epreuve\impression\sections\document.tsx:4: _ Invariant #5 du print-engine : ApercuImpression → SectionDocument → DocumentCardPrint.
C:\Users\leves\eduqcia-app\components\epreuve\impression\sections\document.tsx:7:import { DocumentCardPrint } from "@/components/documents/DocumentCardPrint";
C:\Users\leves\eduqcia-app\components\epreuve\impression\sections\document.tsx:20: return <DocumentCardPrint document={contenu.document} numero={contenu.numeroGlobal} />;
C:\Users\leves\eduqcia-app\components\tache\vue-detaillee\sections\documents.tsx:5:import { DocumentCard } from "@/components/documents/DocumentCard";
C:\Users\leves\eduqcia-app\components\tache\vue-detaillee\sections\documents.tsx:15: \* Liste verticale de DocumentCards numérotées via le renderer canonique.
C:\Users\leves\eduqcia-app\components\tache\vue-detaillee\sections\documents.tsx:25: <DocumentCard key={card.docId} document={card.document} numero={card.numero} />
C:\Users\leves\eduqcia-app\components\tae\fiche\FicheSkeletons.tsx:55:export function SkeletonDocumentCard() {
C:\Users\leves\eduqcia-app\components\tae\fiche\FicheSkeletons.tsx:69: <SkeletonDocumentCard />
C:\Users\leves\eduqcia-app\components\tae\fiche\SectionDocuments.tsx:1:import { DocumentCard } from "@/components/documents/DocumentCard";
C:\Users\leves\eduqcia-app\components\tae\fiche\SectionDocuments.tsx:34: <DocumentCard document={documentFicheVersRenderer(doc)} />
C:\Users\leves\eduqcia-app\components\tae\TaeForm\preview\PrintableFichePreview.tsx:13:import { DocumentCardPrint } from "@/components/documents/DocumentCardPrint";
C:\Users\leves\eduqcia-app\components\tae\TaeForm\preview\PrintableFichePreview.tsx:117: <DocumentCardPrint key={doc.letter} document={documentFicheVersRenderer(doc)} />

PATTERN: DocumentCardPrint
COMMAND: grep -rn "DocumentCardPrint" lib/ components/ app/ --include="_.ts" --include="_.tsx"
TOTAL: 12
C:\Users\leves\eduqcia-app\components\documents\wizard\DocumentWizardPrintPreview.tsx:4:import { DocumentCardPrint } from "@/components/documents/DocumentCardPrint";
C:\Users\leves\eduqcia-app\components\documents\wizard\DocumentWizardPrintPreview.tsx:14: _ `RendererDocument` pour `DocumentCardPrint`.
C:\Users\leves\eduqcia-app\components\documents\wizard\DocumentWizardPrintPreview.tsx:60: return <DocumentCardPrint document={rendererDoc} numero={1} />;
C:\Users\leves\eduqcia-app\components\documents\DocumentCardPrint.tsx:22:export function DocumentCardPrint({ document: doc, numero }: Props) {
C:\Users\leves\eduqcia-app\components\documents\DocumentPrintView.tsx:5:import { DocumentCardPrint } from "@/components/documents/DocumentCardPrint";
C:\Users\leves\eduqcia-app\components\documents\DocumentPrintView.tsx:66: <DocumentCardPrint document={doc} numero={numero} />
C:\Users\leves\eduqcia-app\components\epreuve\impression\sections\document.tsx:2: _ SectionDocument — délègue au renderer canonique DocumentCardPrint.
C:\Users\leves\eduqcia-app\components\epreuve\impression\sections\document.tsx:4: \* Invariant #5 du print-engine : ApercuImpression → SectionDocument → DocumentCardPrint.
C:\Users\leves\eduqcia-app\components\epreuve\impression\sections\document.tsx:7:import { DocumentCardPrint } from "@/components/documents/DocumentCardPrint";
C:\Users\leves\eduqcia-app\components\epreuve\impression\sections\document.tsx:20: return <DocumentCardPrint document={contenu.document} numero={contenu.numeroGlobal} />;
C:\Users\leves\eduqcia-app\components\tae\TaeForm\preview\PrintableFichePreview.tsx:13:import { DocumentCardPrint } from "@/components/documents/DocumentCardPrint";
C:\Users\leves\eduqcia-app\components\tae\TaeForm\preview\PrintableFichePreview.tsx:117: <DocumentCardPrint key={doc.letter} document={documentFicheVersRenderer(doc)} />

PATTERN: DocumentElementRenderer
COMMAND: grep -rn "DocumentElementRenderer" lib/ components/ app/ --include="_.ts" --include="_.tsx"
TOTAL: 12
C:\Users\leves\eduqcia-app\components\document\vue-detaillee\sections\contenu.tsx:4:import { DocumentElementRenderer } from "@/components/documents/DocumentElementRenderer";
C:\Users\leves\eduqcia-app\components\document\vue-detaillee\sections\contenu.tsx:48: <DocumentElementRenderer element={el} showAuteur={false} />
C:\Users\leves\eduqcia-app\components\document\vue-detaillee\sections\contenu.tsx:59: <DocumentElementRenderer
C:\Users\leves\eduqcia-app\components\documents\wizard\DocumentWizardPreview.tsx:4:import { DocumentElementRenderer } from "@/components/documents/DocumentElementRenderer";
C:\Users\leves\eduqcia-app\components\documents\wizard\DocumentWizardPreview.tsx:430: return <DocumentElementRenderer element={rendererFirstEl} hideSource />;
C:\Users\leves\eduqcia-app\components\documents\DocumentCard.tsx:1:import { DocumentElementRenderer } from "@/components/documents/DocumentElementRenderer";
C:\Users\leves\eduqcia-app\components\documents\DocumentCard.tsx:52: <DocumentElementRenderer element={element} showAuteur={Boolean(element.auteur)} />
C:\Users\leves\eduqcia-app\components\documents\DocumentCard.tsx:80: <DocumentElementRenderer
C:\Users\leves\eduqcia-app\components\documents\DocumentCardPrint.tsx:1:import { DocumentElementRenderer } from "@/components/documents/DocumentElementRenderer";
C:\Users\leves\eduqcia-app\components\documents\DocumentCardPrint.tsx:46: <DocumentElementRenderer
C:\Users\leves\eduqcia-app\components\documents\DocumentCardPrint.tsx:67: <DocumentElementRenderer
C:\Users\leves\eduqcia-app\components\documents\DocumentElementRenderer.tsx:29:export function DocumentElementRenderer({

## Section 6 — Réponse à 3 questions binaires

1. Existe-t-il plus d'un composant React qui rend le contenu d'un document (titre + contenu + source) ?
   OUI.

2. Les surfaces de rendu d'un document passent-elles toutes par le même composant final (quel qu'il soit) ?
   NON.

3. La chaîne d'impression PDF (route /apercu/[token]) utilise-t-elle le même composant de rendu document que le wizard preview ?
   OUI.
