import type { ParcoursTache } from "./types";

export const PARCOURS_SECTION_B_SCHEMA_CD1: ParcoursTache = {
  id: "section-b-schema-cd1",
  label: "Section B — Caractérisation",
  critereOfficiel: "Représentation cohérente d'une période de l'histoire du Québec et du Canada",
  description: "Schéma de caractérisation — description d'une période sous deux aspects de société",
  actif: true,
  oiPertinente: false,
  cdAutoAssignee: true,
  icone: "flowchart",
  cdParNiveau: {
    sec1: "HEC-CD1",
    sec2: "HEC-CD1",
    sec3: "HQC-CD1",
    sec4: "HQC-CD1",
  },
  grilleFixe: "CD1_SCHEMA",
  documentsMin: 8,
  documentsMax: 12,
  aspectsRequis: true,
  bloc3Type: "schema_cd1",
  bloc4Type: "dossier_cd1",
  bloc5Type: "corrige_cd1",
};
