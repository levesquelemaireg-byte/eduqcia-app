import { ready } from "@/lib/fiche/helpers";
import type { SectionState, FooterData, SelectorRefs } from "@/lib/fiche/types";
import type { TaeFormState } from "@/lib/tae/tae-form-state-types";
import { sortAuteursByFamilyName, splitDisplayName } from "@/lib/tae/auteur-display-sort";
import { isActiveNonRedactionVariant } from "@/lib/tae/non-redaction/wizard-variant";
import { BLUEPRINT_INITIAL_NB_LIGNES } from "@/lib/tae/blueprint-helpers";

/**
 * Pied de fiche : auteurs, date, lignes, statut publication.
 * Toujours `ready` — le composant gère les placeholders pour les champs vides.
 */
export function selectFooter(state: TaeFormState, refs: SelectorRefs): SectionState<FooterData> {
  const fallbackAuthor = refs.previewMeta.authorFullName?.trim() || "—";
  const principalSplit = splitDisplayName(fallbackAuthor);
  const auteurPrincipal = { id: "draft-local", ...principalSplit };

  const auteursRaw =
    state.bloc1.modeConception === "equipe"
      ? [
          auteurPrincipal,
          ...state.bloc1.collaborateurs.map((c) => ({
            id: c.id,
            ...splitDisplayName(c.displayName),
          })),
        ]
      : [auteurPrincipal];

  const auteurs = sortAuteursByFamilyName(auteursRaw);
  const showStudentAnswerLines = !isActiveNonRedactionVariant(state);
  const nbLignes = state.bloc2.nbLignes ?? BLUEPRINT_INITIAL_NB_LIGNES;

  // Masquer nb_lignes tant que le comportement n'est pas choisi et que c'est la valeur par défaut
  const hideNbLignesSkeleton =
    showStudentAnswerLines &&
    !state.bloc2.comportementId &&
    nbLignes === BLUEPRINT_INITIAL_NB_LIGNES;

  return ready({
    auteurs,
    createdAt: refs.previewMeta.draftStartedAtIso ?? "",
    isPublished: false,
    nbLignes,
    showStudentAnswerLines,
    version: 1,
    versionUpdatedAt: null,
    hideNbLignesSkeleton,
  });
}
