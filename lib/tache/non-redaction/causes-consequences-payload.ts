/**
 * Parcours non rédactionnel — causes-consequences (OI4, comportements 4.3 / 4.4).
 *
 * L'élève associe des documents historiques à des rôles causaux (facteur
 * explicatif, cause, conséquence). Contrairement à `manifestations` (OI5)
 * où l'enseignant nomme librement les catégories, ici les catégories sont
 * **fixes** — dérivées du `comportementId` :
 *
 * - 4.3 (deux facteurs explicatifs) : 2 catégories identiques
 *   « Un facteur explicatif de {sujet} » répétées.
 * - 4.4 (cause et conséquence) : 2 catégories distinctes
 *   « Une cause de {sujet} », « Une conséquence de {sujet} ».
 *
 * Toujours 2 documents et 2 catégories — la validation no-doublon est
 * triviale (`assoc[0] !== assoc[1]`).
 *
 * Copy UI : `lib/ui/copy/non-redaction.ts` (`NR_CAUSES_CONSEQUENCES_*`).
 */

import { z } from "zod";
import {
  computeSlotStatus,
  getSlotData,
  isPublicHttpUrl,
  type DocumentSlotData,
} from "@/lib/tache/document-helpers";
import type { DocumentSlotId } from "@/lib/tache/blueprint-helpers";
import {
  NR_CAUSES_CONSEQUENCES_43_CONSIGNE_PREFIX,
  NR_CAUSES_CONSEQUENCES_43_CONSIGNE_SUFFIX,
  NR_CAUSES_CONSEQUENCES_43_LABEL_PREFIX,
  NR_CAUSES_CONSEQUENCES_44_BULLET_CAUSE_PREFIX,
  NR_CAUSES_CONSEQUENCES_44_BULLET_CONSEQUENCE_PREFIX,
  NR_CAUSES_CONSEQUENCES_44_CAUSE_LABEL_PREFIX,
  NR_CAUSES_CONSEQUENCES_44_CONSEQUENCE_LABEL_PREFIX,
  NR_CAUSES_CONSEQUENCES_44_CONSIGNE_INTRO,
  NR_CAUSES_CONSEQUENCES_CORRIGE_TITRE,
} from "@/lib/ui/ui-copy";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export type CausesConsequencesComportementId = "4.3" | "4.4";

/**
 * Toujours 2 documents → toujours 2 catégories. `null` représente une cellule
 * non encore renseignée à l'étape 5 ; valeur 1-indexée (1 ou 2) sinon.
 */
export type CausesConsequencesAssociations = [number | null, number | null];

export type CausesConsequencesPayload = {
  schemaVersion: 1;
  comportementId: CausesConsequencesComportementId;
  /** Sujet de la consigne, réutilisé dans les labels de l'espace de production. */
  consigneSujet: string;
  /** `associations[i]` = numéro de document (1 ou 2) assigné à la catégorie d'index `i`. */
  associations: CausesConsequencesAssociations;
};

/**
 * Longueur max / seuil d'avertissement pour le sujet de la consigne — utilisé
 * par `LimitCounterPill` dans le template Bloc 3.
 */
export const CAUSES_CONSEQUENCES_LIMITS = {
  consigneSujet: { max: 150, warn: 120 },
} as const;

/* -------------------------------------------------------------------------- */
/*  Zod                                                                        */
/* -------------------------------------------------------------------------- */

const comportementIdZ = z.enum(["4.3", "4.4"]);

const associationCellZ = z.union([z.number().int().min(1).max(2), z.null()]);

export const causesConsequencesPayloadZodSchema = z.object({
  schemaVersion: z.literal(1).optional().default(1),
  comportementId: comportementIdZ,
  consigneSujet: z.string(),
  associations: z.tuple([associationCellZ, associationCellZ]),
});

/* -------------------------------------------------------------------------- */
/*  Type guards / helpers                                                      */
/* -------------------------------------------------------------------------- */

export function isCausesConsequencesComportementId(
  v: unknown,
): v is CausesConsequencesComportementId {
  return v === "4.3" || v === "4.4";
}

function sanitizeAssociationCell(v: unknown): number | null {
  if (v === 1 || v === 2) return v;
  return null;
}

/* -------------------------------------------------------------------------- */
/*  Normalize / initial / merge                                                */
/* -------------------------------------------------------------------------- */

/** Normalise un payload brut (brouillon sessionStorage / colonne JSONB). Retourne `null` si invalide. */
export function normalizeCausesConsequencesPayload(raw: unknown): CausesConsequencesPayload | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if ("schemaVersion" in o) {
    const sv = o.schemaVersion;
    if (typeof sv === "number" && sv !== 1) return null;
  }
  if (!isCausesConsequencesComportementId(o.comportementId)) return null;

  const rawAssoc = Array.isArray(o.associations) ? o.associations : [];
  const associations: CausesConsequencesAssociations = [
    sanitizeAssociationCell(rawAssoc[0]),
    sanitizeAssociationCell(rawAssoc[1]),
  ];

  const candidate = {
    schemaVersion: 1,
    comportementId: o.comportementId,
    consigneSujet: typeof o.consigneSujet === "string" ? o.consigneSujet : "",
    associations,
  };
  const parsed = causesConsequencesPayloadZodSchema.safeParse(candidate);
  if (!parsed.success) return null;
  const d = parsed.data;
  return {
    schemaVersion: 1,
    comportementId: d.comportementId,
    consigneSujet: d.consigneSujet,
    associations: d.associations,
  };
}

export function initialCausesConsequencesPayload(
  comportementId: CausesConsequencesComportementId = "4.3",
): CausesConsequencesPayload {
  return {
    schemaVersion: 1,
    comportementId,
    consigneSujet: "",
    associations: [null, null],
  };
}

export function mergeCausesConsequencesPayload(
  prev: unknown,
  patch: Partial<CausesConsequencesPayload>,
): CausesConsequencesPayload {
  const base =
    normalizeCausesConsequencesPayload(prev) ??
    initialCausesConsequencesPayload(
      isCausesConsequencesComportementId(patch.comportementId) ? patch.comportementId : "4.3",
    );
  return {
    schemaVersion: 1,
    comportementId: patch.comportementId ?? base.comportementId,
    consigneSujet: patch.consigneSujet ?? base.consigneSujet,
    associations: patch.associations ?? base.associations,
  };
}

/* -------------------------------------------------------------------------- */
/*  Catégories dérivées du comportement                                        */
/* -------------------------------------------------------------------------- */

/**
 * Labels des catégories pour l'espace de production et le corrigé.
 * Toujours longueur 2.
 *
 * - 4.3 → ["Un facteur explicatif de {sujet}", "Un facteur explicatif de {sujet}"]
 * - 4.4 → ["Une cause de {sujet}", "Une conséquence de {sujet}"]
 */
export function getCausesConsequencesCategoryLabels(
  comportementId: CausesConsequencesComportementId,
  consigneSujet: string,
): [string, string] {
  const sujet = consigneSujet.trim();
  if (comportementId === "4.3") {
    return [
      `${NR_CAUSES_CONSEQUENCES_43_LABEL_PREFIX}${sujet}`,
      `${NR_CAUSES_CONSEQUENCES_43_LABEL_PREFIX}${sujet}`,
    ];
  }
  return [
    `${NR_CAUSES_CONSEQUENCES_44_CAUSE_LABEL_PREFIX}${sujet}`,
    `${NR_CAUSES_CONSEQUENCES_44_CONSEQUENCE_LABEL_PREFIX}${sujet}`,
  ];
}

/* -------------------------------------------------------------------------- */
/*  Gates                                                                      */
/* -------------------------------------------------------------------------- */

function nonEmpty(s: string): boolean {
  return s.trim().length > 0;
}

/** Étape 3 — sujet rempli (les catégories sont fixes, pas de saisie). */
export function isCausesConsequencesStep3Complete(p: CausesConsequencesPayload): boolean {
  return nonEmpty(p.consigneSujet);
}

/** Étape 5 — les 2 cellules remplies, sans doublon. */
export function isCausesConsequencesStep5Complete(p: CausesConsequencesPayload): boolean {
  const [a, b] = p.associations;
  if (a === null || b === null) return false;
  return a !== b;
}

/** Slot complet — tous les slots du parcours sont obligatoires (toujours 2). */
export function isCausesConsequencesSlotComplete(slot: DocumentSlotData): boolean {
  return computeSlotStatus(slot) === "complete";
}

export function isCausesConsequencesDocumentsStepComplete(
  documentSlots: { slotId: DocumentSlotId }[],
  documents: Partial<Record<DocumentSlotId, DocumentSlotData>>,
): boolean {
  if (documentSlots.length === 0) return false;
  for (const { slotId } of documentSlots) {
    const slot = getSlotData(documents, slotId);
    if (!isCausesConsequencesSlotComplete(slot)) return false;
  }
  return true;
}

export function isCausesConsequencesDocumentsPublishable(
  documentSlots: { slotId: DocumentSlotId }[],
  documents: Partial<Record<DocumentSlotId, DocumentSlotData>>,
): boolean {
  if (!isCausesConsequencesDocumentsStepComplete(documentSlots, documents)) return false;
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

const STUDENT_ROOT_OPEN =
  '<div data-causes-consequences-student="true" class="causes-consequences-student-root">';
const STUDENT_ROOT_CLOSE = "</div>";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildIntroHtml(p: CausesConsequencesPayload): string {
  const sujet = escapeHtml(p.consigneSujet.trim());
  if (p.comportementId === "4.3") {
    return `<p class="causes-consequences-student-intro">${escapeHtml(NR_CAUSES_CONSEQUENCES_43_CONSIGNE_PREFIX)}${sujet}${escapeHtml(NR_CAUSES_CONSEQUENCES_43_CONSIGNE_SUFFIX)}</p>`;
  }
  // 4.4 — intro + liste à puces (cause / conséquence)
  return (
    `<p class="causes-consequences-student-intro">${escapeHtml(NR_CAUSES_CONSEQUENCES_44_CONSIGNE_INTRO)}</p>` +
    `<ul class="causes-consequences-student-intro-list">` +
    `<li>${escapeHtml(NR_CAUSES_CONSEQUENCES_44_BULLET_CAUSE_PREFIX)}${sujet}<span class="causes-consequences-student-bullet-end"> ;</span></li>` +
    `<li>${escapeHtml(NR_CAUSES_CONSEQUENCES_44_BULLET_CONSEQUENCE_PREFIX)}${sujet}<span class="causes-consequences-student-bullet-end">.</span></li>` +
    `</ul>`
  );
}

function buildCelluleHtml(label: string): string {
  return `<div class="causes-consequences-student-cellule"><span class="causes-consequences-student-label">${escapeHtml(label)}</span><span class="causes-consequences-student-case" aria-hidden="true"></span></div>`;
}

/** HTML stocké en `tache.consigne` — feuille élève complète. */
export function buildCausesConsequencesConsigneHtml(p: CausesConsequencesPayload): string {
  const labels = getCausesConsequencesCategoryLabels(p.comportementId, p.consigneSujet);
  const cellules = labels.map(buildCelluleHtml).join("");
  const grille = `<div class="causes-consequences-student-grille">${cellules}</div>`;
  return `${STUDENT_ROOT_OPEN}${buildIntroHtml(p)}${grille}${STUDENT_ROOT_CLOSE}`;
}

/** HTML enseignant — `tache.corrige`. */
export function buildCausesConsequencesCorrigeHtml(p: CausesConsequencesPayload): string {
  if (!isCausesConsequencesStep5Complete(p)) return "";
  const labels = getCausesConsequencesCategoryLabels(p.comportementId, p.consigneSujet);
  const items = labels
    .map((label, i) => {
      const doc = p.associations[i];
      return `<li><strong>${escapeHtml(label)}</strong> : ${escapeHtml(String(doc))}</li>`;
    })
    .join("");
  return `<p>${escapeHtml(NR_CAUSES_CONSEQUENCES_CORRIGE_TITRE)}</p><ul>${items}</ul>`;
}
