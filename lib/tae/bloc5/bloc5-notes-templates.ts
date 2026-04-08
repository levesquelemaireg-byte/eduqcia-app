/**
 * Notes du correcteur par templateKey — Bloc 5 parcours rédactionnels.
 * Texte validé — à utiliser tel quel, modifiable par l'enseignant après insertion.
 * Spec : docs/SPEC-BLOC5.md § Notes du correcteur
 */

import type { Bloc5TemplateKey } from "@/lib/tae/bloc5/bloc5-templates";

const NOTES: Record<Bloc5TemplateKey, string | null> = {
  libre: null,

  "opposition-difference":
    "La réponse doit contenir un marqueur d'opposition explicite, tel que alors que, tandis que, par contre, contrairement à ou à l'inverse. " +
    "Elle est jugée partiellement correcte si les deux réalités sont décrites séparément sans être mises en relation par un tel marqueur. " +
    "Toute copie intégrale du document est interdite.",

  "opposition-similitude":
    "La réponse doit contenir un marqueur de similitude explicite, tel que tout comme, de même, également ou aussi. " +
    "Elle est jugée partiellement correcte si la similitude est relevée mais n'est pas exprimée dans une phrase de mise en relation explicite. " +
    "Toute copie intégrale du document est interdite.",

  "accord-desaccord":
    "La réponse doit être une phrase complète qui nomme explicitement les deux acteurs ou historiens concernés. " +
    "L'utilisation de pronoms sans référent (par exemple ils, ceux-ci) est interdite. " +
    "La réponse doit identifier un seul point précis de convergence ou de divergence. " +
    "Elle est jugée partiellement correcte si les acteurs sont nommés mais que le point demeure vague, " +
    "ou si le point est identifié mais que les acteurs ne sont pas nommés. " +
    "Elle est également jugée incorrecte si l'élève présente le point de vue de chacun " +
    "sans identifier le point commun de leur accord ou de leur désaccord. " +
    "Toute copie intégrale du document est interdite.",

  cause:
    "La réponse doit reprendre le sujet de la consigne avant d'introduire la cause. " +
    "Les réponses qui débutent par Parce que, Car ou En raison de sont interdites, car elles omettent de poser le sujet. " +
    "Elle est jugée partiellement correcte si le fait avancé est juste mais que la phrase demeure incomplète ou syntaxiquement déficiente. " +
    "Toute copie intégrale du document est interdite.",

  consequence:
    "La réponse doit nommer le sujet historique explicitement ; " +
    "l'emploi de pronoms sans référent tels que ils ou ceux-ci est interdit. " +
    "Elle est jugée partiellement correcte si la conséquence identifiée est juste " +
    "mais qu'un pronom sans référent est utilisé à la place du sujet. " +
    "Toute copie intégrale du document est interdite.",

  changement:
    "La réponse doit nommer le sujet explicitement et rappeler qu'il s'agit d'un changement par rapport à une situation antérieure. " +
    "Elle est jugée partiellement correcte si le fait avancé est juste " +
    "mais que l'élève ne marque pas explicitement la rupture ou la transformation. " +
    "Toute copie intégrale du document est interdite.",

  continuite:
    "La réponse doit nommer le sujet explicitement et rappeler qu'il s'agit d'une continuité par rapport à une situation antérieure. " +
    "Elle est jugée partiellement correcte si le fait avancé est juste " +
    "mais formulé comme un simple constat descriptif, sans que la notion de persistance ou de permanence soit rappelée. " +
    "Toute copie intégrale du document est interdite.",

  "changement-continuite":
    "Les deux conclusions — il y a changement ou il y a continuité — sont acceptées, " +
    "à condition que l'élève nomme explicitement sa conclusion, la justifie avec des faits historiques précis " +
    "et l'ancre dans un repère de temps exact. " +
    "Trois éléments sont obligatoires : l'identification de la conclusion, un fait historique précis, et un repère temporel exact. " +
    "La réponse est jugée partiellement correcte si le repère de temps est vague ou si l'identification est absente mais que les faits sont exacts. " +
    "Elle est refusée si aucun fait précis n'est avancé ou si elle constitue une copie intégrale du document.",

  causalite:
    "La réponse doit comporter au moins trois phrases et contenir au minimum deux marqueurs de causalité explicites, " +
    "tels que ce qui entraîne, provoque, car ou donc. " +
    "Les trois éléments imposés doivent être non seulement mentionnés, mais reliés entre eux par une logique causale de type A → B → C. " +
    "Elle est jugée partiellement correcte si les trois éléments sont présents mais qu'un seul lien causal les unit, " +
    "ou si les trois éléments sont listés sans qu'aucun lien ne les relie. " +
    "Elle est refusée si elle constitue une copie intégrale du document ou si moins de deux éléments imposés sont présents.",
};

/** Notes du correcteur pré-remplies (null pour `libre`). */
export function getBloc5NotesTemplate(key: Bloc5TemplateKey): string | null {
  return NOTES[key];
}
