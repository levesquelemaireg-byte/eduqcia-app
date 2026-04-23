"use client";

import { defineSection } from "@/lib/fiche/defineSection";
import type { TacheFormState } from "@/lib/tache/tache-form-state-types";
import {
  SECTION_CD,
  SECTION_DOCUMENTS,
  SECTION_FOOTER,
  SECTION_GRILLE,
  SECTION_HEADER,
} from "@/lib/fiche/configs/tache-fiche-sections";

import { selectDispositifIntroductif } from "@/lib/fiche/selectors/tache/dispositif-introductif";
import { selectSchemaSeptCases } from "@/lib/fiche/selectors/tache/schema-sept-cases";
import { selectCorrigeTabulaire } from "@/lib/fiche/selectors/tache/corrige-tabulaire";

import { SectionDispositifIntroductif } from "@/lib/fiche/sections/schema-cd1/dispositif-introductif";
import { SectionSchemaSeptCases } from "@/lib/fiche/sections/schema-cd1/schema-sept-cases";
import { SectionCorrigeTabulaire } from "@/lib/fiche/sections/schema-cd1/corrige-tabulaire";

/* ─── Sections spécifiques Section B ──────────────────────────── */

const SECTION_DISPOSITIF_INTRODUCTIF = defineSection<
  TacheFormState,
  import("@/lib/fiche/selectors/tache/dispositif-introductif").DispositifIntroductifData
>({
  id: "dispositif-introductif",
  stepId: "consigne",
  selector: selectDispositifIntroductif,
  component: SectionDispositifIntroductif,
});

const SECTION_SCHEMA_SEPT_CASES = defineSection<
  TacheFormState,
  import("@/lib/fiche/selectors/tache/schema-sept-cases").SchemaSeptCasesData
>({
  id: "schema-sept-cases",
  stepId: "consigne",
  selector: selectSchemaSeptCases,
  component: SectionSchemaSeptCases,
});

const SECTION_CORRIGE_TABULAIRE = defineSection<
  TacheFormState,
  import("@/lib/fiche/selectors/tache/corrige-tabulaire").CorrigeTabulaireData
>({
  id: "corrige-tabulaire",
  stepId: "corrige",
  selector: selectCorrigeTabulaire,
  component: SectionCorrigeTabulaire,
});

/**
 * Configuration Sommaire pour le parcours Section B (Schéma de caractérisation).
 *
 * Les sections communes `SECTION_HEADER`, `SECTION_DOCUMENTS`, `SECTION_GRILLE`,
 * `SECTION_CD`, `SECTION_FOOTER` sont réutilisées directement. Les sections
 * pédagogiquement spécifiques (dispositif introductif, schéma, corrigé tabulaire)
 * sont définies ci-dessus.
 *
 * La section CONNAISSANCES est omise en Section B : l'indexation est traitée
 * uniquement à l'étape 7 et le Sommaire n'affiche pas de bloc skeleton vide.
 */
export const TACHE_FICHE_SECTIONS_B = [
  SECTION_HEADER,
  SECTION_DISPOSITIF_INTRODUCTIF,
  SECTION_DOCUMENTS,
  SECTION_SCHEMA_SEPT_CASES,
  SECTION_CORRIGE_TABULAIRE,
  SECTION_GRILLE,
  SECTION_CD,
  SECTION_FOOTER,
] as const;
