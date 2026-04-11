/**
 * Types fondamentaux du système de fiches (sommaire, thumbnail, lecture).
 * Source de vérité pour FicheMode, StepId, SectionState, SectionConfig, SelectorRefs
 * et les types de données de chaque section.
 */

import type { ComponentType, ReactNode } from "react";
import type { OiEntryJson } from "@/lib/types/oi";
import type { DocumentFiche, CdSelection, ConnaissanceSelection } from "@/lib/types/fiche";
import type { RendererDocument } from "@/lib/types/document-renderer";

/* ─── Mode de rendu ────────────────────────────────────────────── */

/** Union stricte et fermée. Ajouter un mode = décision explicite. */
export type FicheMode = "thumbnail" | "sommaire" | "lecture";

/* ─── Step ID ──────────────────────────────────────────────────── */

/**
 * Union fermée, alignée sur `TAE_FORM_STEPS[].id` (step-meta.ts).
 * Élimine les typos silencieuses.
 */
export type StepId =
  | "auteurs"
  | "parametres"
  | "consigne"
  | "documents"
  | "corrige"
  | "cd"
  | "connaissances";

/* ─── État d'une section (retour des selectors) ────────────────── */

/**
 * Discriminant explicite — pas de confusion null/undefined.
 *
 * - ready    → données prêtes, la section se rend normalement
 * - skeleton → "pas encore rempli" → affiche un skeleton animé
 * - hidden   → "non applicable dans ce contexte" → la section disparaît
 */
export type SectionState<T> =
  | { status: "ready"; data: T }
  | { status: "skeleton" }
  | { status: "hidden" };

/* ─── Références externes ──────────────────────────────────────── */

/** Référentiels passés aux selectors. Stabiliser avec useMemo dans le parent. */
export interface SelectorRefs {
  oiList: OiEntryJson[];
  previewMeta: {
    authorFullName: string;
    draftStartedAtIso: string;
  };
}

/* ─── Configuration d'une section ──────────────────────────────── */

export interface SectionConfig<TState, TData> {
  /** Identifiant stable — React key + skeleton lookup. Ne change jamais. */
  id: string;

  /** Étape du wizard associée. null = hors wizard (header, footer). */
  stepId: StepId | null;

  /** Fonction pure : state → SectionState<TData> */
  selector: (state: TState, refs: SelectorRefs) => SectionState<TData>;

  /** Composant présentationnel pur */
  component: ComponentType<{ data: TData; mode: FicheMode }>;

  /**
   * Modes dans lesquels cette section est visible. Défaut = tous.
   * Les sections filtrées par visibleIn ne déclenchent PAS leur selector.
   */
  visibleIn?: FicheMode[];

  /** Skeleton custom pour cette section. Si absent → GenericSkeleton. */
  skeleton?: ComponentType;
}

/* ─── Entrée résolue (retour de defineSection) ─────────────────── */

/**
 * Résultat de resolve() — le renderer consomme ce type.
 * Le lien selector↔component est garanti par defineSection (closure typée).
 */
export type SectionRenderResult =
  | { status: "hidden" }
  | { status: "skeleton" }
  | { status: "ready"; node: ReactNode };

/**
 * Entrée dans le tableau de sections.
 * Retournée par `defineSection` — le TData est encapsulé dans la closure `resolve`.
 * Le renderer n'a pas besoin de connaître TData → pas de `any`.
 */
export interface FicheSectionEntry<TState> {
  readonly id: string;
  readonly stepId: StepId | null;
  readonly visibleIn?: FicheMode[];
  readonly skeletonComponent?: ComponentType;
  /** @internal Résout le selector puis rend le composant. */
  readonly resolve: (state: TState, refs: SelectorRefs, mode: FicheMode) => SectionRenderResult;
}

/* ─── Types de données par section ─────────────────────────────── */

export interface HeaderData {
  oi: { id: string; titre: string; icone: string } | null;
  comportement: { id: string; enonce: string } | null;
  outilEvaluation: string | null;
  niveau: string;
  discipline: string;
  aspectsSociete: string[];
}

export interface ConsigneData {
  /** HTML prêt à l'affichage — placeholders résolus, sanitisé */
  html: string;
  /** Amorce documentaire séparée (pour styling distinct par mode) */
  amorce: string | null;
}

export interface GuidageData {
  /** HTML sanitisé */
  html: string;
}

export interface DocumentsData {
  documents: DocumentFiche[];
}

export interface CorrigeData {
  /** HTML sanitisé */
  html: string;
  notesCorrecteur: string | null;
}

export interface GrilleData {
  outilEvaluation: string;
}

export interface CompetenceData {
  cd: CdSelection;
}

export interface ConnaissancesData {
  connaissances: ConnaissanceSelection[];
}

export interface FooterData {
  auteurs: { id: string; full_name: string }[];
  createdAt: string;
  isPublished: boolean;
  nbLignes: number;
  showStudentAnswerLines: boolean;
  version: number;
  versionUpdatedAt: string | null;
  /** Sommaire wizard : masquer nb_lignes tant que le comportement n'est pas choisi. */
  hideNbLignesSkeleton: boolean;
}

/* ─── Types de données par section — fiches document ─────────── */

/**
 * État d'entrée pour les selectors DOC_FICHE_SECTIONS.
 * Construit côté serveur à partir de la ligne `documents` + métadonnées jointes.
 */
export interface DocFicheData {
  document: RendererDocument;
  sourceType: "primaire" | "secondaire";
  sourceCitation: string;
  niveauLabels: string;
  disciplineLabels: string;
  aspectsStr: string;
  connLabels: string;
  authorName: string;
  created: string;
  usageCaption: string;
  isPublished: boolean;
}

export interface DocHeaderData {
  titre: string;
  typeLabel: string;
  structureLabel: string;
  sourceTypeLabel: string;
}

export interface DocContentData {
  document: RendererDocument;
}

export interface DocIndexationData {
  typeLabel: string;
  sourceTypeLabel: string;
  sourceCitationHtml: string | null;
  niveauLabels: string;
  disciplineLabels: string;
  aspectsStr: string;
  connLabels: string;
}

export interface DocFooterData {
  authorName: string;
  created: string;
  usageCaption: string;
  isPublished: boolean;
}

/* ─── NR Content (selector partagé) ────────────────────────────── */

/** Contenu non-rédactionnel résolu (consigne, guidage, corrigé). */
export interface NonRedactionContent {
  consigne: string;
  guidage: string;
  corrige: string;
}
