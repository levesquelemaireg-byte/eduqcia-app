"use client";

import { useCallback } from "react";
import { defineSection } from "@/lib/fiche/defineSection";
import type { TacheFormState } from "@/lib/tache/tache-form-state-types";
import type { ConnaissancesData, FicheMode } from "@/lib/fiche/types";
import { useTacheForm } from "@/components/tache/wizard/FormState";

/* ─── Selectors ────────────────────────────────────────────────── */

import { selectHeaderMeta } from "@/lib/fiche/selectors/selectHeaderMeta";
import { selectConsigne } from "@/lib/fiche/selectors/selectConsigne";
import { selectGuidage } from "@/lib/fiche/selectors/selectGuidage";
import { selectDocuments } from "@/lib/fiche/selectors/selectDocuments";
import { selectCorrige } from "@/lib/fiche/selectors/selectCorrige";
import { selectGrille } from "@/lib/fiche/selectors/selectGrille";
import { selectCD } from "@/lib/fiche/selectors/selectCD";
import { selectConnaissances } from "@/lib/fiche/selectors/selectConnaissances";
import { selectFooter } from "@/lib/fiche/selectors/selectFooter";

/* ─── Section components ───────────────────────────────────────── */

import { FicheHeader } from "@/lib/fiche/sections/FicheHeader";
import { SectionConsigne } from "@/lib/fiche/sections/SectionConsigne";
import { SectionGuidage } from "@/lib/fiche/sections/SectionGuidage";
import { SectionDocuments } from "@/lib/fiche/sections/SectionDocuments";
import { SectionCorrige } from "@/lib/fiche/sections/SectionCorrige";
import { SectionGrille } from "@/lib/fiche/sections/SectionGrille";
import { SectionCD } from "@/lib/fiche/sections/SectionCD";
import { SectionConnaissances } from "@/lib/fiche/sections/SectionConnaissances";
import { FicheFooter } from "@/lib/fiche/sections/FicheFooter";

/* ─── Custom skeletons ─────────────────────────────────────────── */

import {
  SkeletonConsigneBody,
  SkeletonCorrigeBlock,
  SkeletonGuidageBlock,
  SkeletonCDTree,
  SkeletonConnaissancesTree,
} from "@/components/tache/fiche/FicheSkeletons";

/* ─── Wrapper connaissances (wizard) ───────────────────────────── */

/**
 * Wrapper qui ajoute `onRemoveRow` via le contexte wizard.
 * Satisfait le contrat `{ data, mode }` de defineSection,
 * tout en fournissant l'action interactive au composant pur.
 */
function WizardConnaissancesSection({ data, mode }: { data: ConnaissancesData; mode: FicheMode }) {
  const { dispatch } = useTacheForm();
  const onRemoveRow = useCallback(
    (rowId: string) => dispatch({ type: "REMOVE_CONNAISSANCE_BY_ROW_ID", rowId }),
    [dispatch],
  );

  return <SectionConnaissances data={data} mode={mode} onRemoveRow={onRemoveRow} />;
}

/* ─── Sections communes (partagées entre Section A et Section B) ─ */

export const SECTION_HEADER = defineSection<TacheFormState, import("@/lib/fiche/types").HeaderData>(
  {
    id: "header",
    stepId: null,
    selector: selectHeaderMeta,
    component: FicheHeader,
  },
);

export const SECTION_CONSIGNE = defineSection<
  TacheFormState,
  import("@/lib/fiche/types").ConsigneData
>({
  id: "consigne",
  stepId: "consigne",
  selector: selectConsigne,
  component: SectionConsigne,
  skeleton: SkeletonConsigneBody,
});

export const SECTION_GUIDAGE = defineSection<
  TacheFormState,
  import("@/lib/fiche/types").GuidageData
>({
  id: "guidage",
  stepId: "consigne",
  selector: selectGuidage,
  component: SectionGuidage,
  skeleton: SkeletonGuidageBlock,
});

export const SECTION_DOCUMENTS = defineSection<
  TacheFormState,
  import("@/lib/fiche/types").DocumentsData
>({
  id: "documents",
  stepId: "documents",
  selector: selectDocuments,
  component: SectionDocuments,
});

export const SECTION_CORRIGE = defineSection<
  TacheFormState,
  import("@/lib/fiche/types").CorrigeData
>({
  id: "corrige",
  stepId: "corrige",
  selector: selectCorrige,
  component: SectionCorrige,
  skeleton: SkeletonCorrigeBlock,
});

export const SECTION_GRILLE = defineSection<TacheFormState, import("@/lib/fiche/types").GrilleData>(
  {
    id: "grille",
    stepId: "parametres",
    selector: selectGrille,
    component: SectionGrille,
    visibleIn: ["sommaire", "lecture"],
  },
);

export const SECTION_CD = defineSection<TacheFormState, import("@/lib/fiche/types").CompetenceData>(
  {
    id: "cd",
    stepId: "cd",
    selector: selectCD,
    component: SectionCD,
    skeleton: SkeletonCDTree,
    visibleIn: ["sommaire", "lecture"],
  },
);

export const SECTION_CONNAISSANCES = defineSection<TacheFormState, ConnaissancesData>({
  id: "connaissances",
  stepId: "connaissances",
  selector: selectConnaissances,
  component: WizardConnaissancesSection,
  skeleton: SkeletonConnaissancesTree,
  visibleIn: ["sommaire", "lecture"],
});

export const SECTION_FOOTER = defineSection<TacheFormState, import("@/lib/fiche/types").FooterData>(
  {
    id: "footer",
    stepId: null,
    selector: selectFooter,
    component: FicheFooter,
    visibleIn: ["sommaire", "lecture"],
  },
);

/* ─── Config TAÉ — Section A (parcours par défaut) ─────────────── */

/**
 * RÉORDONNER = déplacer un élément.
 * AJOUTER    = defineSection() + un selector + un composant pur.
 * RETIRER    = supprimer la ligne.
 *
 * Note : consigne et guidage partagent le même stepId 'consigne'.
 * C'est voulu — les deux se highlight ensemble quand l'enseignant
 * travaille à l'étape 3 du wizard.
 */
export const TACHE_FICHE_SECTIONS = [
  SECTION_HEADER,
  SECTION_CONSIGNE,
  SECTION_GUIDAGE,
  SECTION_DOCUMENTS,
  SECTION_CORRIGE,
  SECTION_GRILLE,
  SECTION_CD,
  SECTION_CONNAISSANCES,
  SECTION_FOOTER,
] as const;
