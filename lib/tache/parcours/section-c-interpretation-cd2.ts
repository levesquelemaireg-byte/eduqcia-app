import type { ParcoursTache } from "./types";

/**
 * Parcours Section C — Interprétation (CD2).
 *
 * Désactivé pour l'instant (actif: false).
 * L'élève rédige un texte d'environ 150 mots expliquant les transformations
 * d'une réalité sociale, souvent précédé d'un tableau préparatoire.
 * Le verbe directeur est « Expliquez » (vs « Décrivez » pour Section B).
 */
export const PARCOURS_SECTION_C_INTERPRETATION_CD2: ParcoursTache = {
  id: "section-c-interpretation-cd2",
  label: "Tâche complexe d'interprétation (réponse développée)",
  critereOfficiel: "Rigueur de l'interprétation",
  description:
    "Ce type de tâche est entièrement consacré à la mobilisation des compétences disciplinaires 2 : interpréter les réalités sociales à l'aide de la méthode historique au premier cycle, et interpréter une réalité sociale au deuxième cycle. Il vise à amener l'élève à élaborer une explication rigoureuse mettant en évidence les continuités ou transformations culturelles, économiques, politiques, sociales ou territoriales d'une société.\n\nAlors que la tâche précédente de caractérisation s'attache à décrire « comment étaient les choses », l'interprétation exige de l'élève qu'il explique pourquoi elles étaient ainsi et comment elles ont évolué. Par la rédaction d'un texte argumenté, l'élève doit mettre en relation des facteurs explicatifs et des conséquences afin de produire un raisonnement historique qui donne un sens aux changements et aux continuités d'une période.",
  actif: false,
  oiPertinente: false,
  cdAutoAssignee: true,
  icone: "edit_note",
  cdParNiveau: {
    sec1: "HEC-CD2",
    sec2: "HEC-CD2",
    sec3: "HQC-CD2",
    sec4: "HQC-CD2",
  },
  grilleFixe: "CD2_INTERPRETATION",
  documentsMin: 4,
  documentsMax: 8,
  aspectsRequis: false,
  bloc3Type: "interpretation_cd2",
  bloc4Type: "dossier_cd2",
  bloc5Type: "corrige_cd2",
};
