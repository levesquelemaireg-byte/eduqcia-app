/**
 * Config FicheRenderer pour les fiches documents (RendererDocument + métadonnées).
 * Parallèle à tache-fiche-sections / tache-lecture-sections pour les TAÉ.
 *
 * Structure linéaire : header → contenu → indexation → footer.
 * Thumbnail : seul le header est visible (titre + icône).
 */

import { defineSection } from "@/lib/fiche/defineSection";
import type {
  DocFicheData,
  DocHeaderData,
  DocContentData,
  DocIndexationData,
  DocFooterData,
} from "@/lib/fiche/types";

/* ─── Selectors ────────────────────────────────────────────────── */

import {
  selectDocHeader,
  selectDocContent,
  selectDocIndexation,
  selectDocFooter,
} from "@/lib/fiche/selectors/doc-selectors";

/* ─── Section components ──────────────────────────────────────── */

import { DocFicheHeader } from "@/lib/fiche/sections/DocFicheHeader";
import { SectionDocContent } from "@/lib/fiche/sections/SectionDocContent";
import { SectionDocIndexation } from "@/lib/fiche/sections/SectionDocIndexation";
import { DocFicheFooter } from "@/lib/fiche/sections/DocFicheFooter";

/* ─── Config document ─────────────────────────────────────────── */

/**
 * Sections pour la fiche document via FicheRenderer.
 *
 * RÉORDONNER = déplacer un élément.
 * AJOUTER    = defineSection() + un selector + un composant pur.
 *
 * stepId = null pour toutes les sections (pas de wizard document).
 */
export const DOC_FICHE_SECTIONS = [
  defineSection<DocFicheData, DocHeaderData>({
    id: "doc-header",
    stepId: null,
    selector: selectDocHeader,
    component: DocFicheHeader,
  }),
  defineSection<DocFicheData, DocContentData>({
    id: "doc-content",
    stepId: null,
    selector: selectDocContent,
    component: SectionDocContent,
    visibleIn: ["sommaire", "lecture"],
  }),
  defineSection<DocFicheData, DocIndexationData>({
    id: "doc-indexation",
    stepId: null,
    selector: selectDocIndexation,
    component: SectionDocIndexation,
    visibleIn: ["sommaire", "lecture"],
  }),
  defineSection<DocFicheData, DocFooterData>({
    id: "doc-footer",
    stepId: null,
    selector: selectDocFooter,
    component: DocFicheFooter,
    visibleIn: ["sommaire", "lecture"],
  }),
] as const;
