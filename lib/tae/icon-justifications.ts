/**
 * Textes longs pour l’attribut HTML `title` sur les glyphes Material (infobulle au survol).
 * Doit rester aligné sur la prose produit : `docs/DECISIONS.md` (justifications des icônes).
 */

/** Glyphe unique pour toute section « documentation légale » — voir DECISIONS §7, DESIGN-SYSTEM. */
export const LEGAL_NOTICE_MATERIAL_ICON = "gavel";

export const MATERIAL_ICON_TOOLTIP: Record<string, string> = {
  // —— Formulaire / sommaire (labels & champs)
  quiz: "La consigne est une question posée à l'élève. L'icône évoque l'interrogation, le défi intellectuel soumis.",
  deployed_code:
    "Un cube à cinq faces — chaque aspect (économique, politique, social, culturel, territorial) est une perspective différente sur une même réalité sociale.",
  task_alt:
    "Le corrigé est la tâche accomplie, la réponse validée. L'icône évoque la complétion et le critère atteint.",
  list_alt_check:
    "Les options de réponse sont une liste de propositions parmi lesquelles l'élève choisit — vérification et bonne réponse attendue.",
  tooltip_2:
    "Le guidage est une bulle d'aide contextuelle — une indication qui soutient sans s'imposer.",
  license:
    "La compétence disciplinaire est une validation officielle délivrée par le programme ministériel. L'icône évoque le permis, la certification formelle d'une maîtrise.",
  lightbulb: "Les connaissances sont les savoirs à mobiliser — la compréhension qui s'allume.",
  add_notes:
    "Ajout ou structuration d’un document — notes et pièces à intégrer au parcours pédagogique.",
  docs: "Les sources primaires et secondaires sur lesquelles l'élève s'appuie.",
  image:
    "Document iconographique — source visuelle à analyser (photographie, gravure, carte, etc.).",
  position_top_left:
    "Placer la légende en surimpression dans le coin supérieur gauche de l'image. Icône : glyphe Material « position_top_right » en symétrie horizontale (le glyphe « position_top_left » n'existe pas dans la police).",
  position_top_right: "Placer la légende en surimpression dans le coin supérieur droit de l'image.",
  position_bottom_left:
    "Placer la légende en surimpression dans le coin inférieur gauche de l'image.",
  position_bottom_right:
    "Placer la légende en surimpression dans le coin inférieur droit de l'image.",
  school: "L'institution scolaire, le niveau d'études.",
  menu_book: "Le programme disciplinaire — un corpus de savoirs organisés.",
  psychology:
    "L'opération intellectuelle est une action cognitive. L'icône évoque le processus mental.",
  table: "Comportement attendu et grille d'évaluation ministérielle associée.",
  format_line_spacing: "Les lignes de réponse mises à la disposition de l'élève.",
  shuffle:
    "Mélange aléatoire des propositions — génère d'autres suites de réponse et répartit les quatre options (parcours ordre chronologique).",
  settings:
    "Valeur générée automatiquement par l'application : numérotation des documents, calculs ou jetons système. Ne pas utiliser pour ouvrir des paramètres ou des réglages.",
  person: "Mode de conception : vous êtes l'auteur seul de la tâche.",
  groups: "Mode de conception : tâche conçue en équipe avec des collègues.",

  // —— Opérations intellectuelles (liste déroulante Bloc 2)
  cognition:
    "Représente le processus mental universel qui sous-tend chaque opération intellectuelle.",
  document_search:
    "La loupe sur le document évoque la vérification rigoureuse du fait dans la source historique.",
  hourglass: "Le sablier évoque le temps qui s'écoule et la durée historique.",
  map_search: "La carte avec loupe évoque la recherche et la localisation spatiale.",
  text_compare: "Deux textes côte à côte évoquent la mise en parallèle et la comparaison.",
  manufacturing: "L'engrenage évoque le mécanisme de cause à effet — une pièce entraîne l'autre.",
  graph_3: "Le graphe à nœuds connectés évoque la mise en réseau de faits qui se répondent.",
  alt_route:
    "La route qui bifurque évoque ce qui se transforme et ce qui se poursuit. Présentation : glyphe tourné de 90° (flèches vers la droite) — design system.",
  list: "La liste évoque les éléments fournis — la matière que l'élève tisse en un enchaînement causal.",

  // —— Documentation légale (cadre juridique, droit d'auteur, Copibec, etc.)
  gavel:
    "Le marteau évoque le cadre juridique et les obligations liées au droit d'auteur et aux règles d'utilisation des contenus en contexte scolaire.",

  // —— Fiche lecture document (`/documents/[id]`)
  article:
    "L’article évoque un texte ou un document tenu comme pièce à consulter — point d’entrée visuel de la fiche document.",
  description:
    "Le document lu : corps de texte ou reproduction iconographique affiché dans la colonne principale.",
  label:
    "Les métadonnées d’indexation et de référence (niveau, discipline, aspects, etc.) regroupées en panneau latéral.",
  category: "Le type de document (textuel ou iconographique) — classification rapide.",
  bookmark:
    "Le type de source (primaire ou secondaire) — repère pour situer la nature de la pièce.",
};

export function materialIconTooltip(icon: string): string | undefined {
  return MATERIAL_ICON_TOOLTIP[icon];
}
