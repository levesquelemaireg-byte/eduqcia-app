/**
 * Parcours non rédactionnel — manifestations (OI5, comportements 5.1 / 5.2).
 *
 * L'élève associe des documents historiques à des catégories conceptuelles.
 * Pas de génération automatique — l'enseignant assigne manuellement chaque
 * document à sa catégorie.
 *
 * Le payload est aplati (pas de discriminé TS sur `comportementId`) — les
 * fonctions de gate / publication consultent `comportementId` puis valident
 * les seuls champs pertinents pour le comportement actif.
 *
 * Copy UI : `lib/ui/copy/non-redaction.ts` (`NR_MANIFESTATIONS_*`).
 */

import { z } from "zod";
import {
  emptyAssociations,
  getCategoryCount,
  getDocsPerCategory,
  getTotalDocumentCount,
  validateAssociationsNoDoublon,
  type ManifestationsComportementId,
  type OrganisationCategories,
} from "@/lib/tache/non-redaction/manifestations-helpers";
import {
  computeSlotStatus,
  getSlotData,
  isPublicHttpUrl,
  type DocumentSlotData,
} from "@/lib/tache/document-helpers";
import type { DocumentSlotId } from "@/lib/tache/blueprint-helpers";
import {
  NR_MANIFESTATIONS_PUBLISHED_INTRO_PREFIX,
  NR_MANIFESTATIONS_PUBLISHED_INTRO_SUFFIX,
  NR_MANIFESTATIONS_51_DOC_TOKEN,
  NR_MANIFESTATIONS_51_INSCRIVEZ,
  NR_MANIFESTATIONS_52_DOC_TOKEN,
  NR_MANIFESTATIONS_52_INSCRIVEZ,
  NR_MANIFESTATIONS_CORRIGE_TEMPLATE,
  NR_MANIFESTATIONS_CORRIGE_TITRE,
  NR_MANIFESTATIONS_ET_SEPARATOR,
} from "@/lib/ui/ui-copy";

export type { ManifestationsComportementId, OrganisationCategories };

/**
 * Longueurs max / seuils d'avertissement par comportement pour les zones
 * éditables de la consigne (utilisé par `LimitCounterPill` dans le template
 * Bloc 3).
 */
export const MANIFESTATIONS_LIMITS = {
  consigneSujet: {
    "5.1": { max: 150, warn: 120 },
    "5.2": { max: 200, warn: 160 },
  },
  categorie: { max: 60, warn: 50 },
} as const;

const comportementIdZ = z.enum(["5.1", "5.2"]);
const organisationZ = z.enum(["2-categories", "4-categories"]);

export const manifestationsPayloadZodSchema = z.object({
  schemaVersion: z.literal(1).optional().default(1),
  comportementId: comportementIdZ,
  consigneSujet: z.string(),
  organisationCategories: organisationZ,
  categories: z.array(z.string()),
  associations: z.array(z.array(z.number().int().nonnegative())),
});

export type ManifestationsPayload = {
  schemaVersion: 1;
  comportementId: ManifestationsComportementId;
  /** Sujet général de la consigne (ex. « la tradition orale et la prise de décision chez les Premiers Peuples »). */
  consigneSujet: string;
  /** Pertinent uniquement pour 5.2. Pour 5.1, toujours `"2-categories"` par défaut. */
  organisationCategories: OrganisationCategories;
  /** Labels des catégories saisis par l'enseignant. Longueur = `getCategoryCount(comportementId, organisation)`. */
  categories: string[];
  /**
   * Corrigé — `associations[i]` = liste des numéros de documents (1-indexed)
   * assignés à la catégorie d'index `i`. Longueurs attendues :
   * - 5.1 : 2 catégories × 1 doc chaque
   * - 5.2 + 2-categories : 2 catégories × 2 docs chaque
   * - 5.2 + 4-categories : 4 catégories × 1 doc chaque
   */
  associations: number[][];
};

export function isManifestationsComportementId(v: unknown): v is ManifestationsComportementId {
  return v === "5.1" || v === "5.2";
}

function isOrganisationCategories(v: unknown): v is OrganisationCategories {
  return v === "2-categories" || v === "4-categories";
}

/** Normalise un payload brut (brouillon sessionStorage / colonne JSONB). Retourne `null` si invalide. */
export function normalizeManifestationsPayload(raw: unknown): ManifestationsPayload | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if ("schemaVersion" in o) {
    const sv = o.schemaVersion;
    if (typeof sv === "number" && sv !== 1) return null;
  }
  if (!isManifestationsComportementId(o.comportementId)) return null;
  const organisation: OrganisationCategories = isOrganisationCategories(o.organisationCategories)
    ? o.organisationCategories
    : "2-categories";

  const expectedCategoryCount = getCategoryCount(o.comportementId, organisation);
  const rawCategories = Array.isArray(o.categories) ? o.categories : [];
  const categories: string[] = Array.from({ length: expectedCategoryCount }, (_, i) => {
    const v = rawCategories[i];
    return typeof v === "string" ? v : "";
  });

  const rawAssociations = Array.isArray(o.associations) ? o.associations : [];
  const associations: number[][] = Array.from({ length: expectedCategoryCount }, (_, i) => {
    const cat = rawAssociations[i];
    if (!Array.isArray(cat)) return [];
    const cleaned: number[] = [];
    for (const n of cat) {
      if (Number.isInteger(n) && (n as number) >= 1) cleaned.push(n as number);
    }
    return cleaned;
  });

  const candidate = {
    schemaVersion: 1,
    comportementId: o.comportementId,
    consigneSujet: typeof o.consigneSujet === "string" ? o.consigneSujet : "",
    organisationCategories: organisation,
    categories,
    associations,
  };
  const parsed = manifestationsPayloadZodSchema.safeParse(candidate);
  if (!parsed.success) return null;
  const d = parsed.data;
  return {
    schemaVersion: 1,
    comportementId: d.comportementId,
    consigneSujet: d.consigneSujet,
    organisationCategories: d.organisationCategories,
    categories: d.categories,
    associations: d.associations,
  };
}

export function initialManifestationsPayload(
  comportementId: ManifestationsComportementId = "5.1",
): ManifestationsPayload {
  const organisation: OrganisationCategories = "2-categories";
  const categoryCount = getCategoryCount(comportementId, organisation);
  return {
    schemaVersion: 1,
    comportementId,
    consigneSujet: "",
    organisationCategories: organisation,
    categories: Array.from({ length: categoryCount }, () => ""),
    associations: emptyAssociations(categoryCount),
  };
}

export function mergeManifestationsPayload(
  prev: unknown,
  patch: Partial<ManifestationsPayload>,
): ManifestationsPayload {
  const base =
    normalizeManifestationsPayload(prev) ??
    initialManifestationsPayload(
      isManifestationsComportementId(patch.comportementId) ? patch.comportementId : "5.1",
    );
  return {
    schemaVersion: 1,
    comportementId: patch.comportementId ?? base.comportementId,
    consigneSujet: patch.consigneSujet ?? base.consigneSujet,
    organisationCategories: patch.organisationCategories ?? base.organisationCategories,
    categories: patch.categories ?? base.categories,
    associations: patch.associations ?? base.associations,
  };
}

/* -------------------------------------------------------------------------- */
/*  Gates                                                                      */
/* -------------------------------------------------------------------------- */

function nonEmpty(s: string): boolean {
  return s.trim().length > 0;
}

/** Étape 3 — sujet rempli + toutes les catégories non vides. */
export function isManifestationsStep3Complete(p: ManifestationsPayload): boolean {
  if (!nonEmpty(p.consigneSujet)) return false;
  const expected = getCategoryCount(p.comportementId, p.organisationCategories);
  if (p.categories.length !== expected) return false;
  return p.categories.every(nonEmpty);
}

/** Étape 5 — toutes les associations valides, pas de doublon. */
export function isManifestationsStep5Complete(p: ManifestationsPayload): boolean {
  const categoryCount = getCategoryCount(p.comportementId, p.organisationCategories);
  const docsPerCategory = getDocsPerCategory(p.comportementId, p.organisationCategories);
  const totalDocs = getTotalDocumentCount(p.comportementId);
  return validateAssociationsNoDoublon(p.associations, categoryCount, docsPerCategory, totalDocs);
}

/** Slot complet — tous les slots du parcours sont obligatoires (2 ou 4). */
export function isManifestationsSlotComplete(slot: DocumentSlotData): boolean {
  return computeSlotStatus(slot) === "complete";
}

export function isManifestationsDocumentsStepComplete(
  documentSlots: { slotId: DocumentSlotId }[],
  documents: Partial<Record<DocumentSlotId, DocumentSlotData>>,
): boolean {
  if (documentSlots.length === 0) return false;
  for (const { slotId } of documentSlots) {
    const slot = getSlotData(documents, slotId);
    if (!isManifestationsSlotComplete(slot)) return false;
  }
  return true;
}

export function isManifestationsDocumentsPublishable(
  documentSlots: { slotId: DocumentSlotId }[],
  documents: Partial<Record<DocumentSlotId, DocumentSlotData>>,
): boolean {
  if (!isManifestationsDocumentsStepComplete(documentSlots, documents)) return false;
  for (const { slotId } of documentSlots) {
    const slot = getSlotData(documents, slotId);
    if (slot.mode === "create" && slot.type === "iconographique") {
      if (!isPublicHttpUrl(slot.imageUrl)) return false;
    }
  }
  return true;
}

/* -------------------------------------------------------------------------- */
/*  Builders HTML — feuille élève + corrigé enseignant                         */
/* -------------------------------------------------------------------------- */

const ELEVE_ROOT_OPEN = '<div data-manifestations-eleve="true" class="manifestations-eleve-root">';
const ELEVE_ROOT_CLOSE = "</div>";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildIntroHtml(p: ManifestationsPayload): string {
  // `{{doc_1}}` à `{{doc_4}}` sont réécrits à l'impression (épreuve / feuille élève).
  // Spec §4 / Phase 8b correction 11 : intro + instruction fusionnées
  // dans un seul paragraphe pour un texte continu (pas de saut artificiel).
  const docToken =
    p.comportementId === "5.1" ? NR_MANIFESTATIONS_51_DOC_TOKEN : NR_MANIFESTATIONS_52_DOC_TOKEN;
  const sujet = escapeHtml(p.consigneSujet.trim());
  const inscrivez =
    p.comportementId === "5.1" ? NR_MANIFESTATIONS_51_INSCRIVEZ : NR_MANIFESTATIONS_52_INSCRIVEZ;
  return `<p class="manifestations-eleve-intro">${escapeHtml(NR_MANIFESTATIONS_PUBLISHED_INTRO_PREFIX)}${docToken}${escapeHtml(NR_MANIFESTATIONS_PUBLISHED_INTRO_SUFFIX)} ${sujet}. ${escapeHtml(inscrivez)}</p>`;
}

function buildCelluleHtml(label: string, casesCount: number): string {
  const cases =
    casesCount === 2
      ? `<span class="manifestations-eleve-case" aria-hidden="true"></span><span class="manifestations-eleve-et">${escapeHtml(NR_MANIFESTATIONS_ET_SEPARATOR)}</span><span class="manifestations-eleve-case" aria-hidden="true"></span>`
      : `<span class="manifestations-eleve-case" aria-hidden="true"></span>`;
  return `<div class="manifestations-eleve-cellule"><span class="manifestations-eleve-label">${escapeHtml(label)}</span><span class="manifestations-eleve-cases">${cases}</span></div>`;
}

/** HTML stocké en `tache.consigne` — feuille élève complète. */
export function buildManifestationsConsigneHtml(p: ManifestationsPayload): string {
  const docsPerCategory = getDocsPerCategory(p.comportementId, p.organisationCategories);
  const cellules = p.categories
    .map((cat) => buildCelluleHtml(cat.trim(), docsPerCategory))
    .join("");
  const grille = `<div class="manifestations-eleve-grille">${cellules}</div>`;
  return `${ELEVE_ROOT_OPEN}${buildIntroHtml(p)}${grille}${ELEVE_ROOT_CLOSE}`;
}

/** HTML enseignant — `tache.corrige`. */
export function buildManifestationsCorrigeHtml(p: ManifestationsPayload): string {
  if (!isManifestationsStep5Complete(p)) return "";
  const items = p.categories
    .map((cat, i) => {
      const docs = p.associations[i] ?? [];
      const docsLabel = docs.join(NR_MANIFESTATIONS_CORRIGE_TEMPLATE);
      return `<li><strong>${escapeHtml(cat.trim())}</strong> : ${escapeHtml(docsLabel)}</li>`;
    })
    .join("");
  return `<p>${escapeHtml(NR_MANIFESTATIONS_CORRIGE_TITRE)}</p><ul>${items}</ul>`;
}
