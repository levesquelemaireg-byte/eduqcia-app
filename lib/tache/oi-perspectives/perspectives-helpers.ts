/**
 * Utilitaires purs pour le système de perspectives (OI3 · 3.3–3.5).
 *
 * Spec : docs/SPEC-TEMPLATES-CONSIGNE.md
 */

import { documentSlotsFromCount, type DocumentSlotId } from "@/lib/tache/blueprint-helpers";
import type { DocumentSlotData } from "@/lib/tache/document-helpers";
import { emptyDocumentSlot } from "@/lib/tache/document-helpers";
import { htmlHasMeaningfulText } from "@/lib/tache/consigne-helpers";
import type {
  MomentData,
  PerspectiveData,
  PerspectiveLetter,
  PerspectiveTypePerspectives,
} from "@/lib/tache/oi-perspectives/perspectives-types";

// ---------------------------------------------------------------------------
// Fabriques
// ---------------------------------------------------------------------------

export function emptyPerspective(): PerspectiveData {
  return { acteur: "", contenu: "", source: "", type: "textuel", sourceType: null };
}

export function emptyPerspectives(count: 2 | 3): PerspectiveData[] {
  return Array.from({ length: count }, () => emptyPerspective());
}

// ---------------------------------------------------------------------------
// Labels perspectives — déduits du type et de la lettre
// ---------------------------------------------------------------------------

const LETTERS: PerspectiveLetter[] = ["A", "B", "C"];

/** Retourne « Perspective A », « Perspective B », « Perspective C ». */
export function perspectiveSectionLabel(index: number): string {
  return `Perspective ${LETTERS[index] ?? String(index + 1)}`;
}

/** Retourne la lettre de perspective pour un index (0 → "A", 1 → "B", 2 → "C"). */
export function perspectiveLetterAt(index: number): PerspectiveLetter {
  const letter = LETTERS[index];
  if (!letter) throw new Error(`Index de perspective hors limites : ${index}`);
  return letter;
}

// ---------------------------------------------------------------------------
// Labels acteur/historien — consigne et corrigé
// ---------------------------------------------------------------------------

/** Singulier : « acteur » ou « historien ». */
export function perspectiveTypeSingulier(t: PerspectiveTypePerspectives): string {
  return t === "acteurs" ? "acteur" : "historien";
}

/** Pluriel : « acteurs » ou « historiens ». */
export function perspectiveTypePluriel(t: PerspectiveTypePerspectives): string {
  return t === "acteurs" ? "acteurs" : "historiens";
}

/** « deux autres acteurs » ou « autres historiens » (formule 3.5). */
export function perspectiveTypeAutres(t: PerspectiveTypePerspectives): string {
  return t === "acteurs" ? "deux autres acteurs" : "autres historiens";
}

/** « d'acteurs » ou « d'historiens ». */
export function perspectiveTypePartitif(t: PerspectiveTypePerspectives): string {
  return t === "acteurs" ? "d'acteurs" : "d'historiens";
}

// ---------------------------------------------------------------------------
// Déduction des noms pour les radios Bloc 5 intrus
// ---------------------------------------------------------------------------

/** Extrait le label radio intrus depuis les perspectives du Bloc 4 (nom de l'acteur/historien). */
export function intrusRadioLabels(
  perspectives: PerspectiveData[],
): { letter: PerspectiveLetter; label: string }[] {
  return perspectives.map((p, i) => ({
    letter: perspectiveLetterAt(i),
    label: p.acteur.trim() || `Perspective ${LETTERS[i]}`,
  }));
}

// ---------------------------------------------------------------------------
// Migration groupé ↔ séparé
// ---------------------------------------------------------------------------

/** Groupé → Séparé : transfère les perspectives dans des slots documents indépendants. */
export function migratePerspectivesToSlots(
  perspectives: PerspectiveData[],
): Partial<Record<DocumentSlotId, DocumentSlotData>> {
  const result: Partial<Record<DocumentSlotId, DocumentSlotData>> = {};
  const slots = documentSlotsFromCount(perspectives.length);
  for (let i = 0; i < perspectives.length; i++) {
    const slotId = slots[i]?.slotId;
    if (!slotId) break;
    const p = perspectives[i]!;
    result[slotId] = {
      ...emptyDocumentSlot(),
      mode: "create",
      type: p.type,
      titre: p.acteur,
      contenu: p.contenu,
      source_citation: p.source,
      source_type: p.sourceType,
    };
  }
  return result;
}

/** Séparé → Groupé : transfère les slots documents dans des perspectives. */
export function migrateSlotsToPerpsectives(
  slots: Partial<Record<DocumentSlotId, DocumentSlotData>>,
  count: 2 | 3,
): PerspectiveData[] {
  return documentSlotsFromCount(count).map(({ slotId }) => {
    const slot = slots[slotId];
    if (!slot) return emptyPerspective();
    return {
      acteur: slot.titre,
      contenu: slot.contenu,
      source: slot.source_citation,
      type: slot.type,
      sourceType: slot.source_type,
    };
  });
}

// ---------------------------------------------------------------------------
// Moments (OI6)
// ---------------------------------------------------------------------------

export function emptyMoment(): MomentData {
  return { titre: "", contenu: "", source: "", sourceType: null };
}

export function emptyMoments(count: 2): MomentData[] {
  return Array.from({ length: count }, () => emptyMoment());
}

/** Groupé → Séparé : transfère les moments dans des slots documents. */
export function migrateMomentsToSlots(
  moments: MomentData[],
): Partial<Record<DocumentSlotId, DocumentSlotData>> {
  const result: Partial<Record<DocumentSlotId, DocumentSlotData>> = {};
  const slots = documentSlotsFromCount(moments.length);
  for (let i = 0; i < moments.length; i++) {
    const slotId = slots[i]?.slotId;
    if (!slotId) break;
    const m = moments[i]!;
    result[slotId] = {
      ...emptyDocumentSlot(),
      mode: "create",
      titre: m.titre,
      contenu: m.contenu,
      source_citation: m.source,
      source_type: m.sourceType,
    };
  }
  return result;
}

/** Séparé → Groupé : transfère les slots documents dans des moments. */
export function migrateSlotsToMoments(
  slots: Partial<Record<DocumentSlotId, DocumentSlotData>>,
  count: 2,
): MomentData[] {
  return documentSlotsFromCount(count).map(({ slotId }) => {
    const slot = slots[slotId];
    if (!slot) return emptyMoment();
    return {
      titre: slot.titre,
      contenu: slot.contenu,
      source: slot.source_citation,
      sourceType: slot.source_type,
    };
  });
}

// ---------------------------------------------------------------------------
// Complétude (Bloc 4 mode groupé) — appelée par le guard handleNext
// ---------------------------------------------------------------------------

/**
 * Complétude des perspectives groupées (OI3 · 3.3 / 3.4 / 3.5).
 * Exige : titre du document non vide + chaque perspective avec acteur, contenu et source.
 */
export function isPerspectivesStepComplete(
  perspectives: PerspectiveData[] | null,
  expectedCount: 2 | 3,
  titre: string,
): boolean {
  if (titre.trim().length === 0) return false;
  if (!perspectives || perspectives.length < expectedCount) return false;
  for (let i = 0; i < expectedCount; i++) {
    const p = perspectives[i]!;
    if (p.acteur.trim().length === 0) return false;
    if (!htmlHasMeaningfulText(p.contenu)) return false;
    if (!htmlHasMeaningfulText(p.source)) return false;
    if (p.sourceType !== "primaire" && p.sourceType !== "secondaire") return false;
  }
  return true;
}

/**
 * Complétude des moments groupés (OI6 · 6.1 / 6.2 / 6.3).
 * Exige : titre du document non vide + chaque moment avec contenu, source et sourceType.
 * Les moments n'ont pas de champ acteur (le titre interne du moment est optionnel).
 */
export function isMomentsStepComplete(
  moments: MomentData[] | null,
  expectedCount: 2,
  titre: string,
): boolean {
  if (titre.trim().length === 0) return false;
  if (!moments || moments.length < expectedCount) return false;
  for (let i = 0; i < expectedCount; i++) {
    const m = moments[i]!;
    if (!htmlHasMeaningfulText(m.contenu)) return false;
    if (!htmlHasMeaningfulText(m.source)) return false;
    if (m.sourceType !== "primaire" && m.sourceType !== "secondaire") return false;
  }
  return true;
}
