/**
 * Templates de consigne externalisés — source de vérité unique.
 *
 * Les composants ne contiennent jamais de texte de consigne en dur.
 * Placeholders :
 *   {{doc_1}}, {{doc_2}}, {{doc_3}} — remplacés par le numéro global du document
 *   [X], [Y], [thème] — texte sélectionnable dans TipTap (modèle souple)
 *
 * Variantes -separe pour OI6.1/6.2 (mode groupé/séparé) — voir
 * `Bloc3ModeleSouple` qui sélectionne la clé adaptée selon
 * `state.bloc3.perspectivesMode`.
 *
 * Spec : docs/SPEC-TEMPLATES-CONSIGNE.md § Templates de consigne externalisés
 */

// ---------------------------------------------------------------------------
// Clés de template
// ---------------------------------------------------------------------------

export type ConsigneTemplateKey =
  | "oi3-difference"
  | "oi3-similitude"
  | "oi4-cause"
  | "oi4-consequence"
  | "oi6-changement"
  | "oi6-changement-separe"
  | "oi6-continuite"
  | "oi6-continuite-separe";
// Ajouter ici pour OI7

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export const CONSIGNE_TEMPLATES = {
  "oi3-difference":
    "À l'aide du document {{doc_1}}, indiquez une différence" +
    " entre [X] et [Y] concernant [thème].",
  "oi3-similitude":
    "À l'aide du document {{doc_1}}, indiquez une ressemblance" +
    " entre [X] et [Y] concernant [thème].",
  "oi4-cause": "À l'aide du document {{doc_1}}, indiquez une cause" + " de [réalité historique].",
  "oi4-consequence":
    "À l'aide du document {{doc_1}}, indiquez une conséquence" +
    " de [événement / réalité] sur [domaine].",
  // OI6.1 — mode groupé (1 document à 2 moments) par défaut
  "oi6-changement":
    "En vous basant sur le document {{doc_1}}, indiquez un changement" +
    " dans [enjeu] à [période].",
  // OI6.1 — mode séparé (2 documents distincts)
  "oi6-changement-separe":
    "En vous basant sur les documents {{doc_1}} et {{doc_2}}, indiquez un changement" +
    " dans [enjeu] à [période].",
  // OI6.2 — mode groupé (1 document à 2 moments) par défaut
  "oi6-continuite":
    "En vous basant sur le document {{doc_1}}, indiquez un élément de continuité" +
    " dans [enjeu] entre [période 1] et [période 2].",
  // OI6.2 — mode séparé (2 documents distincts)
  "oi6-continuite-separe":
    "En vous basant sur les documents {{doc_1}} et {{doc_2}}, indiquez un élément de continuité" +
    " dans [enjeu] entre [période 1] et [période 2].",
} satisfies Record<ConsigneTemplateKey, string>;
