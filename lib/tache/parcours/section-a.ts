import type { ParcoursTache } from "./types";

export const PARCOURS_SECTION_A: ParcoursTache = {
  id: "section-a",
  label: "Opérations intellectuelles isolées",
  critereOfficiel: "Utilisation appropriée de connaissances",
  description:
    "Ce type de tâche est principalement consacré au critère d'utilisation appropriée des connaissances. Il vise à évaluer la capacité de l'élève à réaliser des opérations intellectuelles de manière ciblée, telles que situer des faits dans le temps et l'espace, dégager des similitudes et des différences, ou encore déterminer des causes et des conséquences notamment.\n\nContrairement aux tâches de synthèse globale suivantes, les tâches de cette section isolent des savoir-faire disciplinaires spécifiques pour vérifier la maîtrise rigoureuse de faits historiques précis. Elles demandent à l'élève d'exploiter le dossier documentaire pour traiter des unités d'information distinctes, constituant ainsi la base analytique nécessaire au développement d'une pensée historique structurée.",
  actif: true,
  oiPertinente: true,
  cdAutoAssignee: false,
  icone: "psychology",
  documentsMin: 0,
  documentsMax: 4,
  aspectsRequis: false,
};
