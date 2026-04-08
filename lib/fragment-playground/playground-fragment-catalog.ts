/**
 * Fragments listés en mode « isolé » par contexte d’affichage playground.
 * Identifiants stables pour `data-fragment` et le mode debug.
 */

import type { PlaygroundDisplayContext } from "@/lib/fragment-playground/types";

export type PlaygroundFragmentOption = {
  id: string;
  label: string;
};

const FICHE_FRAGMENTS: PlaygroundFragmentOption[] = [
  { id: "SectionConsigne", label: "Consigne" },
  { id: "SectionCorrige", label: "Corrigé" },
  { id: "SectionDocuments", label: "Documents" },
  { id: "SectionGuidage", label: "Guidage" },
  { id: "SectionCD", label: "Compétence disciplinaire" },
  { id: "SectionConnaissances", label: "Connaissances" },
  { id: "FicheFooter", label: "Pied de fiche" },
];

const THUMBNAIL_FRAGMENTS: PlaygroundFragmentOption[] = [
  { id: "TaeCardCorps", label: "Carte — en-tête et extrait" },
  { id: "TaeCardPied", label: "Carte — pied (compact)" },
];

const PRINT_FRAGMENTS: PlaygroundFragmentOption[] = [
  { id: "PrintBasculeFeuillets", label: "Print — bascule dossier / questionnaire" },
  { id: "PrintDossier", label: "Print — dossier documentaire" },
  { id: "PrintQuestionnaire", label: "Print — questionnaire (consigne, guidage, lignes, grille)" },
];

const WIZARD_FRAGMENTS: PlaygroundFragmentOption[] = [
  { id: "WizardPlaceholder", label: "Placeholder wizard (phase 1)" },
];

export function playgroundFragmentsForContext(
  context: PlaygroundDisplayContext,
): PlaygroundFragmentOption[] {
  switch (context) {
    case "sommaire":
    case "lecture":
      return FICHE_FRAGMENTS;
    case "thumbnail":
      return THUMBNAIL_FRAGMENTS;
    case "print":
      return PRINT_FRAGMENTS;
    case "wizard":
      return WIZARD_FRAGMENTS;
    default:
      return [];
  }
}
