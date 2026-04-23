import { ready, skeleton } from "@/lib/fiche/helpers";
import type { SectionState, CompetenceData, SelectorRefs } from "@/lib/fiche/types";
import type { TacheFormState } from "@/lib/tache/tache-form-state-types";
import { cdSelectionToFicheSlice } from "@/lib/tache/cd-helpers";
import { CD_TITRE_AUTO_ASSIGNEE } from "@/lib/tache/parcours/cd-titres-auto-assignes";
import { resoudreParcours } from "@/lib/tache/parcours/resolveur";

/**
 * Compétence disciplinaire — arbre 3 niveaux (compétence → composante → critère).
 * Skeleton tant que rien n'est sélectionné.
 * Quand le parcours auto-assigne la compétence : dérivation Pull depuis parcours + niveau
 * (l'enseignant voit la compétence dès l'étape 2, sans attendre le Bloc 6).
 */
export function selectCD(state: TacheFormState, _refs: SelectorRefs): SectionState<CompetenceData> {
  const parcours = resoudreParcours(state.bloc2.typeTache);

  if (parcours.cdAutoAssignee && parcours.cdParNiveau) {
    const cdId = parcours.cdParNiveau[state.bloc2.niveau];
    const titre = cdId ? CD_TITRE_AUTO_ASSIGNEE[cdId] : undefined;
    if (!titre) return skeleton();
    return ready({
      cd: { competence: titre, composante: "", critere: "" },
      note: "L’ensemble des composantes et critères de cette compétence est mobilisé par le schéma de caractérisation.",
    });
  }

  const cd = cdSelectionToFicheSlice(state.bloc6.cd.selection);
  if (!cd) return skeleton();

  return ready({ cd });
}
