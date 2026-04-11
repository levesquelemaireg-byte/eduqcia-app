import { ready } from "@/lib/fiche/helpers";
import type { SectionState, HeaderData, SelectorRefs } from "@/lib/fiche/types";
import type { TaeFormState } from "@/lib/tae/tae-form-state-types";
import { NIVEAUX, DISCIPLINE_LABEL } from "@/components/tae/TaeForm/bloc2/constants";
import type { NiveauCode, DisciplineCode } from "@/lib/tae/blueprint-helpers";
import { ASPECT_LABEL } from "@/lib/tae/aspect-labels";
import type { AspectSocieteKey } from "@/lib/tae/redaction-helpers";

/**
 * Header fiche : icône OI, pastilles métadonnées.
 * Toujours `ready` — le composant gère les placeholders visuels pour les champs vides.
 */
export function selectHeaderMeta(
  state: TaeFormState,
  refs: SelectorRefs,
): SectionState<HeaderData> {
  const oiEntry = refs.oiList.find((o) => o.id === state.bloc2.oiId);
  const comportement = oiEntry?.comportements_attendus.find(
    (c) => c.id === state.bloc2.comportementId,
  );

  const niveauLabel =
    NIVEAUX.find((n) => n.value === (state.bloc2.niveau as NiveauCode))?.label ?? "";
  const disc = state.bloc2.discipline;
  const disciplineLabel =
    disc && disc in DISCIPLINE_LABEL ? DISCIPLINE_LABEL[disc as DisciplineCode] : "";

  const aspectsSociete = (Object.entries(state.bloc7.aspects) as [AspectSocieteKey, boolean][])
    .filter(([, v]) => v)
    .map(([k]) => ASPECT_LABEL[k]);

  return ready({
    oi: oiEntry ? { id: oiEntry.id, titre: oiEntry.titre, icone: oiEntry.icone } : null,
    comportement: comportement ? { id: comportement.id, enonce: comportement.enonce } : null,
    outilEvaluation: state.bloc2.outilEvaluation,
    niveau: niveauLabel,
    discipline: disciplineLabel,
    aspectsSociete,
  });
}
