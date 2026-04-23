/**
 * Templates de consigne externalisés — source de vérité unique.
 *
 * Les composants ne contiennent jamais de texte de consigne en dur.
 * Placeholders :
 *   {{doc_1}}, {{doc_2}}, {{doc_3}} — remplacés par le numéro global du document
 *   [X], [Y], [thème] — texte sélectionnable dans TipTap (modèle souple)
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
  | "oi6-continuite";
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
  "oi6-changement":
    "À l'aide du document {{doc_1}}, indiquez un changement" + " dans [enjeu] à [période].",
  "oi6-continuite":
    "À partir du document {{doc_1}}, indiquez un élément" +
    " de continuité dans [enjeu] entre [période 1] et [période 2].",
} satisfies Record<ConsigneTemplateKey, string>;
