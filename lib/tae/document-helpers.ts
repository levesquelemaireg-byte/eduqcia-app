import type { CategorieTextuelleValue } from "@/lib/documents/categorie-textuelle";
import type { DocumentSlotId } from "@/lib/tae/blueprint-helpers";
import { htmlHasMeaningfulText } from "@/lib/tae/consigne-helpers";
import type { DocumentImageUploadMeta } from "@/lib/types/document-image-upload";
import type { DocumentCategorieIconographiqueId } from "@/lib/types/document-categories";

type DocumentTypeIconoSlug = DocumentCategorieIconographiqueId;

/** BLOC4-DOCUMENTS.md §14 — état sérialisable (pas de `File` ; prévisualisation = URL blob ou publique). */
export type DocumentSlotMode = "idle" | "create" | "reuse";
export type DocumentType = "textuel" | "iconographique";

/** Aligné `documents.source_type` — choix obligatoire en création ; `null` = pas encore choisi. */
export type DocumentSlotSourceType = "primaire" | "secondaire" | null;

/** Aligné `documents.image_legende_position`. */
export type DocumentLegendPosition = "haut_gauche" | "haut_droite" | "bas_gauche" | "bas_droite";

export function parseDocumentLegendPosition(value: unknown): DocumentLegendPosition | null {
  if (
    value === "haut_gauche" ||
    value === "haut_droite" ||
    value === "bas_gauche" ||
    value === "bas_droite"
  ) {
    return value;
  }
  return null;
}

export type DocumentSlotData = {
  mode: DocumentSlotMode;
  type: DocumentType;
  titre: string;
  contenu: string;
  source_citation: string;
  imageUrl: string | null;
  source_document_id: string | null;
  source_version: number | null;
  update_available: boolean;
  reuse_author: string;
  reuse_source_citation: string;
  /** 0,5–1 — documents iconographiques ; fiche imprimable uniquement. */
  printImpressionScale: number;
  /** Mode création — obligatoire avant publication (`docs/DECISIONS.md` § Module). */
  source_type: DocumentSlotSourceType;
  /** Optionnel si pas d’image ou pas de légende. */
  image_legende: string;
  image_legende_position: DocumentLegendPosition | null;
  /** Dimensions pixel après dernier téléversement (aperçu / PDF) ; null si inconnu (réutilisation banque, brouillon ancien). */
  imagePixelWidth: number | null;
  imagePixelHeight: number | null;
  /** Métadonnées affichées après dernier upload réussi (serveur) ; null si inconnu. */
  imageUploadMeta: DocumentImageUploadMeta | null;
  /** Repère temporel (texte libre) — banque / parcours non rédactionnels OI1. */
  repere_temporel: string;
  /** Année pour comparaisons automatiques ; prioritaire sur l’extraction depuis `repere_temporel`. */
  annee_normalisee: number | null;
  /** Sous-type didactique — documents iconographiques uniquement. */
  type_iconographique: DocumentTypeIconoSlug | null;
  /** Catégorie didactique — documents textuels uniquement. */
  categorie_textuelle: CategorieTextuelleValue | null;
};

export type SlotUiStatus = "empty" | "in_progress" | "complete";

export function emptyDocumentSlot(): DocumentSlotData {
  return {
    mode: "idle",
    type: "textuel",
    titre: "",
    contenu: "",
    source_citation: "",
    imageUrl: null,
    source_document_id: null,
    source_version: null,
    update_available: false,
    reuse_author: "",
    reuse_source_citation: "",
    printImpressionScale: 1,
    source_type: null,
    image_legende: "",
    image_legende_position: null,
    imagePixelWidth: null,
    imagePixelHeight: null,
    imageUploadMeta: null,
    repere_temporel: "",
    annee_normalisee: null,
    type_iconographique: null,
    categorie_textuelle: null,
  };
}

export function slotLetter(id: DocumentSlotId): "A" | "B" | "C" | "D" {
  if (id === "doc_A") return "A";
  if (id === "doc_B") return "B";
  if (id === "doc_C") return "C";
  return "D";
}

export function slotStatusLabel(status: SlotUiStatus): string {
  if (status === "complete") return "Complété";
  if (status === "in_progress") return "En cours";
  return "À compléter";
}

/** BLOC4-DOCUMENTS.md §5 + §14 */
export function computeSlotStatus(slot: DocumentSlotData): SlotUiStatus {
  if (slot.mode === "idle") return "empty";

  if (slot.mode === "reuse") {
    if (slot.source_document_id) return "complete";
    return "in_progress";
  }

  // Titre obligatoire pour iconographique, optionnel pour textuel.
  // Source bibliographique optionnelle (bannière d'avertissement dans l'UI si absente).
  const titleOk = slot.type === "textuel" || slot.titre.trim().length > 0;
  const hasSourceType = slot.source_type === "primaire" || slot.source_type === "secondaire";
  const hasContent =
    slot.type === "textuel"
      ? slot.contenu.trim().length > 0
      : Boolean(slot.imageUrl && slot.imageUrl.length > 0);
  const legendTrim = slot.image_legende.trim();
  const legendOk =
    legendTrim.length === 0 ||
    (slot.image_legende_position !== null && slot.image_legende_position !== undefined);

  if (titleOk && hasSourceType && hasContent && (slot.type !== "iconographique" || legendOk)) {
    return "complete";
  }
  return "in_progress";
}

export function getSlotData(
  documents: Partial<Record<DocumentSlotId, DocumentSlotData>>,
  slotId: DocumentSlotId,
): DocumentSlotData {
  return documents[slotId] ?? emptyDocumentSlot();
}

/** Publication : seules les URL http(s) sont acceptées (pas `blob:` ni fichier local). */
export function isPublicHttpUrl(url: string | null): boolean {
  if (!url || !url.trim()) return false;
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function isDocumentsStepComplete(
  documentSlots: { slotId: DocumentSlotId }[],
  documents: Partial<Record<DocumentSlotId, DocumentSlotData>>,
): boolean {
  if (documentSlots.length === 0) return true;
  for (const { slotId } of documentSlots) {
    if (computeSlotStatus(getSlotData(documents, slotId)) !== "complete") return false;
  }
  return true;
}

/**
 * Documents remplis côté UI **et** prêts pour le RPC (images iconographiques = URL publique).
 */
export function isDocumentsStepPublishable(
  documentSlots: { slotId: DocumentSlotId }[],
  documents: Partial<Record<DocumentSlotId, DocumentSlotData>>,
): boolean {
  if (!isDocumentsStepComplete(documentSlots, documents)) return false;
  for (const { slotId } of documentSlots) {
    const slot = getSlotData(documents, slotId);
    if (slot.mode !== "create" || slot.type !== "iconographique") continue;
    if (!isPublicHttpUrl(slot.imageUrl)) return false;
  }
  return true;
}

/** UI « document complet » mais publication bloquée (ex. aperçu `blob:` sans URL HTTPS). */
export function isDocumentsCompleteButNotPublishable(
  documentSlots: { slotId: DocumentSlotId }[],
  documents: Partial<Record<DocumentSlotId, DocumentSlotData>>,
): boolean {
  return (
    isDocumentsStepComplete(documentSlots, documents) &&
    !isDocumentsStepPublishable(documentSlots, documents)
  );
}

/**
 * BLOC4-DOCUMENTS.md §6 — accès séquentiel.
 * Tous les slots avant l’index courant doivent être complétés (sinon cas « A vidé, B encore rempli » : B
 * reste verrouillé mais C ne doit pas rester accessible uniquement parce que B est encore complet).
 */
export function canAccessDocumentSlot(
  orderedIds: DocumentSlotId[],
  slotIndex: number,
  documents: Partial<Record<DocumentSlotId, DocumentSlotData>>,
): boolean {
  for (let i = 0; i < slotIndex; i++) {
    const id = orderedIds[i];
    if (computeSlotStatus(getSlotData(documents, id)) !== "complete") {
      return false;
    }
  }
  return true;
}
