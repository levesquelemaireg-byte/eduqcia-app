import type { ParcoursTache } from "./types";

export const PARCOURS_SECTION_B_SCHEMA_CD1: ParcoursTache = {
  id: "section-b-schema-cd1",
  label: "Tâche complexe de caractérisation (schéma)",
  critereOfficiel: "Représentation cohérente d'une période de l'histoire du Québec et du Canada",
  description:
    "Ce type de tâche est entièrement consacré à la mobilisation des compétences disciplinaires 1 : interroger les réalités sociales dans une perspective historique au premier cycle, et caractériser une période de l'histoire au deuxième cycle. Il vise à amener l'élève à identifier les éléments distinctifs d'une réalité sociale, à établir des liens pertinents entre eux et à les organiser de manière cohérente afin de produire une représentation d'ensemble structurée.\n\nContrairement aux tâches centrées sur des opérations intellectuelles, qui évaluent les compétences de façon plus fragmentée, le schéma de caractérisation permet d'apprécier la capacité de l'élève à modéliser une société dans sa globalité, en articulant ses différents aspects (économiques, politiques, sociales, culturelles, etc.).",
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
