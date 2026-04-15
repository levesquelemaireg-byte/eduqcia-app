/**
 * Modèles de corrigé par templateKey — Bloc 5 parcours rédactionnels.
 * Crochets [ ] = zones à compléter par l'enseignant.
 * Spec : docs/SPEC-BLOC5.md § Modèles de corrigé par templateKey
 */

export type Bloc5TemplateKey =
  | "libre"
  | "opposition-difference"
  | "opposition-similitude"
  | "accord-desaccord"
  | "cause"
  | "consequence"
  | "changement"
  | "continuite"
  | "changement-continuite"
  | "causalite";

const TEMPLATES: Record<Bloc5TemplateKey, string | null> = {
  libre: null,

  "opposition-difference":
    "[Objet A] est/fait [Caractéristique 1], alors que [Objet B] est/fait [Caractéristique 2].",

  "opposition-similitude":
    "[Objet A] et [Objet B] ont/font tous les deux [Caractéristique commune].",

  "accord-desaccord":
    "[Nom acteur A] et [Nom acteur B] sont [en désaccord / d'accord] sur [point précis].",

  cause: "[Reprise du sujet de la consigne] parce que [fait historique précis tiré du document].",

  consequence:
    "[Sujet historique explicite] [verbe au présent montrant l'effet] [résultat concret du document].",

  changement:
    "Ce qui change, c'est que [sujet explicite] [verbe d'action] [fait précis tiré du document].",

  continuite: "Ce qui demeure, c'est que [sujet explicite] [verbe] [fait précis tiré du document].",

  "changement-continuite": null,

  causalite:
    "[Élément 1 — fait précis et nommé], ce qui entraîne [Élément 2 — fait précis et nommé]. En conséquence, [Élément 3 — fait précis].",
};

const CHANGEMENT_TEMPLATE =
  "Il y a changement, car à partir de [repère], [nouvelle réalité historique précise].";

const CONTINUITE_TEMPLATE =
  "Il y a continuité, car en [Repère T1] comme en [Repère T2], [fait qui demeure].";

/** Modèle de corrigé simple (null pour `libre` et `changement-continuite`). */
export function getBloc5Template(key: Bloc5TemplateKey): string | null {
  return TEMPLATES[key];
}

/** Modèle spécifique OI6·6.3 — si l'élève conclut à un changement. */
export function getBloc5ChangeTemplate(): string {
  return CHANGEMENT_TEMPLATE;
}

/** Modèle spécifique OI6·6.3 — si l'élève conclut à une continuité. */
export function getBloc5ContinuiteTemplate(): string {
  return CONTINUITE_TEMPLATE;
}
