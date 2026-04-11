/**
 * Config FicheRenderer pour le mode lecture (TaeFicheData — données publiées/serveur).
 * Réutilise les mêmes composants section que le wizard, mais avec des selectors
 * qui lisent TaeFicheData (flat) au lieu de TaeFormState (blocs wizard).
 */

import { defineSection } from "@/lib/fiche/defineSection";
import type { TaeFicheData } from "@/lib/types/fiche";
import type {
  HeaderData,
  ConsigneData,
  GuidageData,
  DocumentsData,
  CorrigeData,
  GrilleData,
  CompetenceData,
  ConnaissancesData,
  FooterData,
} from "@/lib/fiche/types";

/* ─── Selectors ────────────────────────────────────────────────── */

import {
  selectLectureHeader,
  selectLectureConsigne,
  selectLectureGuidage,
  selectLectureDocuments,
  selectLectureCorrige,
  selectLectureGrille,
  selectLectureCD,
  selectLectureConnaissances,
  selectLectureFooter,
} from "@/lib/fiche/selectors/lecture-selectors";

/* ─── Section components (mêmes que wizard) ───────────────────── */

import { FicheHeader } from "@/lib/fiche/sections/FicheHeader";
import { SectionConsigne } from "@/lib/fiche/sections/SectionConsigne";
import { SectionGuidage } from "@/lib/fiche/sections/SectionGuidage";
import { SectionDocuments } from "@/lib/fiche/sections/SectionDocuments";
import { SectionCorrige } from "@/lib/fiche/sections/SectionCorrige";
import { SectionGrille } from "@/lib/fiche/sections/SectionGrille";
import { SectionCD } from "@/lib/fiche/sections/SectionCD";
import { SectionConnaissances } from "@/lib/fiche/sections/SectionConnaissances";
import { FicheFooter } from "@/lib/fiche/sections/FicheFooter";

/* ─── Config lecture ───────────────────────────────────────────── */

/**
 * Sections pour le mode lecture — même structure que TAE_FICHE_SECTIONS
 * mais typé TaeFicheData au lieu de TaeFormState.
 *
 * Pas de WizardConnaissancesSection — pas d'onRemoveRow en lecture.
 * Pas de custom skeletons — les données sont complètes (serveur).
 */
export const TAE_LECTURE_SECTIONS = [
  defineSection<TaeFicheData, HeaderData>({
    id: "header",
    stepId: null,
    selector: selectLectureHeader,
    component: FicheHeader,
  }),
  defineSection<TaeFicheData, ConsigneData>({
    id: "consigne",
    stepId: "consigne",
    selector: selectLectureConsigne,
    component: SectionConsigne,
  }),
  defineSection<TaeFicheData, GuidageData>({
    id: "guidage",
    stepId: "consigne",
    selector: selectLectureGuidage,
    component: SectionGuidage,
  }),
  defineSection<TaeFicheData, DocumentsData>({
    id: "documents",
    stepId: "documents",
    selector: selectLectureDocuments,
    component: SectionDocuments,
  }),
  defineSection<TaeFicheData, CorrigeData>({
    id: "corrige",
    stepId: "corrige",
    selector: selectLectureCorrige,
    component: SectionCorrige,
  }),
  defineSection<TaeFicheData, GrilleData>({
    id: "grille",
    stepId: "parametres",
    selector: selectLectureGrille,
    component: SectionGrille,
    visibleIn: ["sommaire", "lecture"],
  }),
  defineSection<TaeFicheData, CompetenceData>({
    id: "cd",
    stepId: "cd",
    selector: selectLectureCD,
    component: SectionCD,
    visibleIn: ["sommaire", "lecture"],
  }),
  defineSection<TaeFicheData, ConnaissancesData>({
    id: "connaissances",
    stepId: "connaissances",
    selector: selectLectureConnaissances,
    component: SectionConnaissances,
    visibleIn: ["sommaire", "lecture"],
  }),
  defineSection<TaeFicheData, FooterData>({
    id: "footer",
    stepId: null,
    selector: selectLectureFooter,
    component: FicheFooter,
    visibleIn: ["sommaire", "lecture"],
  }),
] as const;
