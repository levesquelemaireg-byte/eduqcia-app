import type { CleCase } from "@/lib/tache/schema-cd1/types";
import { ASPECT_LABEL } from "@/lib/tache/aspect-labels";
import type { AspectSocieteKey } from "@/lib/tache/redaction-helpers";
import {
  SECTION_B_CASE_OBJET_LABEL,
  SECTION_B_CASE_PIVOT_LABEL,
  SECTION_B_CASE_PRECISION_LABEL,
  SECTION_B_CASE_OBJET_TOOLTIP,
  SECTION_B_CASE_PIVOT_TOOLTIP,
  SECTION_B_CASE_PRECISION_TOOLTIP,
} from "@/lib/ui/ui-copy";

/** Titre court de la case (sans mention d'aspect). */
export function titreCase(cle: CleCase): string {
  switch (cle) {
    case "objet":
      return SECTION_B_CASE_OBJET_LABEL;
    case "blocA.pivot":
    case "blocB.pivot":
      return SECTION_B_CASE_PIVOT_LABEL;
    case "blocA.precision1":
    case "blocA.precision2":
    case "blocB.precision1":
    case "blocB.precision2":
      return SECTION_B_CASE_PRECISION_LABEL;
  }
}

export function tooltipCase(cle: CleCase): string {
  switch (cle) {
    case "objet":
      return SECTION_B_CASE_OBJET_TOOLTIP;
    case "blocA.pivot":
    case "blocB.pivot":
      return SECTION_B_CASE_PIVOT_TOOLTIP;
    case "blocA.precision1":
    case "blocA.precision2":
    case "blocB.precision1":
    case "blocB.precision2":
      return SECTION_B_CASE_PRECISION_TOOLTIP;
  }
}

/** Aspect associé à une case (`null` pour la case « Objet »). */
export function aspectDeLaCase(
  cle: CleCase,
  aspectA: AspectSocieteKey | null,
  aspectB: AspectSocieteKey | null,
): AspectSocieteKey | null {
  if (cle === "objet") return null;
  if (cle.startsWith("blocA.")) return aspectA;
  return aspectB;
}

/** Titre complet, inclut l'aspect si applicable : « Élément central — Aspect politique ». */
export function titreCaseDetaille(
  cle: CleCase,
  aspectA: AspectSocieteKey | null,
  aspectB: AspectSocieteKey | null,
): string {
  const base = titreCase(cle);
  const aspect = aspectDeLaCase(cle, aspectA, aspectB);
  if (!aspect) return base;
  return `${base} — Aspect ${ASPECT_LABEL[aspect].toLowerCase()}`;
}

/** Cases d'un bloc (aspect A ou B). */
export const CASES_BLOC_A: readonly CleCase[] = [
  "blocA.pivot",
  "blocA.precision1",
  "blocA.precision2",
] as const;

export const CASES_BLOC_B: readonly CleCase[] = [
  "blocB.pivot",
  "blocB.precision1",
  "blocB.precision2",
] as const;
